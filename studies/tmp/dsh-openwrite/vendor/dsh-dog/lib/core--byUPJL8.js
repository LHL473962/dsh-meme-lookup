import { spawn } from "node:child_process";
import { appendFile, lstat, mkdir, mkdtemp, open, readFile, readdir, realpath, rename, rm, stat, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { c } from "tar";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
//#region src/owned-script.ts
var ScriptExecutionError = class extends Error {
	code;
	diagnostics;
	constructor(code, message, diagnostics) {
		super(message);
		this.code = code;
		this.diagnostics = diagnostics;
		this.name = "ScriptExecutionError";
	}
};
function outputPreview(output) {
	return new TextDecoder().decode(Buffer.from(output).subarray(0, 200), { stream: true });
}
/** Execute without blocking the host event loop; cancellation owns only this process tree. */
async function runOwnedScript(script, input, signal) {
	signal?.throwIfAborted();
	try {
		if (!(await stat(script)).isFile()) throw new Error("not a file");
	} catch {
		throw new ScriptExecutionError("SCRIPT_NOT_FOUND", `Verifier script was not found: ${script}`, { script });
	}
	signal?.throwIfAborted();
	const js = /\.(?:c|m)?js$/.test(script);
	const child = spawn(js ? process.execPath : script, js ? [script, input] : [input], {
		detached: process.platform !== "win32",
		windowsHide: true,
		stdio: [
			"ignore",
			"pipe",
			"pipe"
		],
		env: js ? {
			...process.env,
			ELECTRON_RUN_AS_NODE: "1"
		} : process.env
	});
	let output = "";
	let stderr = "";
	let failure;
	let escalation;
	child.stdout.setEncoding("utf8");
	child.stderr.setEncoding("utf8");
	const stop = () => {
		if (!child.pid || child.exitCode !== null || child.signalCode !== null) return;
		if (process.platform === "win32") spawn("taskkill", [
			"/pid",
			String(child.pid),
			"/T",
			"/F"
		], {
			windowsHide: true,
			stdio: "ignore"
		}).once("error", () => child.kill());
		else {
			try {
				process.kill(-child.pid, "SIGTERM");
			} catch {
				child.kill();
			}
			escalation ??= setTimeout(() => {
				if (child.exitCode !== null || child.signalCode !== null) return;
				try {
					process.kill(-child.pid, "SIGKILL");
				} catch {
					child.kill("SIGKILL");
				}
			}, 3e3);
		}
	};
	child.stdout.on("data", (chunk) => {
		output += String(chunk);
		if (Buffer.byteLength(output) > 32 * 1024 ** 2) {
			output = outputPreview(output);
			failure = new ScriptExecutionError("SCRIPT_OUTPUT_LIMIT", "Verifier output exceeds limit", { script });
			stop();
		}
	});
	child.stderr.on("data", (chunk) => {
		stderr = Buffer.concat([Buffer.from(stderr), Buffer.from(chunk)]).subarray(-4096).toString("utf8");
	});
	signal?.addEventListener("abort", stop, { once: true });
	const timer = setTimeout(() => {
		failure = new ScriptExecutionError("SCRIPT_TIMEOUT", "Verifier timed out", { script });
		stop();
	}, 9e5);
	try {
		if (signal?.aborted) stop();
		await new Promise((done, reject) => {
			child.once("error", (error) => reject(new ScriptExecutionError("SCRIPT_START_FAILED", `Could not start verifier: ${error.message}`, {
				script,
				stderr,
				outputPreview: outputPreview(output)
			})));
			child.once("close", (code, exitSignal) => {
				const diagnostics = {
					script,
					exitCode: code,
					signal: exitSignal,
					stderr,
					outputPreview: outputPreview(output)
				};
				if (failure instanceof ScriptExecutionError) Object.assign(failure.diagnostics, diagnostics);
				code === 0 ? done() : reject(failure ?? new ScriptExecutionError("SCRIPT_EXIT_FAILED", `Verifier exited (${code ?? exitSignal})`, diagnostics));
			});
		});
		signal?.throwIfAborted();
		if (failure) throw failure;
		return output;
	} finally {
		clearTimeout(timer);
		if (escalation) clearTimeout(escalation);
		signal?.removeEventListener("abort", stop);
	}
}
//#endregion
//#region src/model.ts
function isJsonValue(value) {
	if (value === null || typeof value === "string" || typeof value === "boolean") return true;
	if (typeof value === "number") return Number.isFinite(value);
	if (Array.isArray(value)) return value.every(isJsonValue);
	if (typeof value !== "object") return false;
	return Object.values(value).every(isJsonValue);
}
//#endregion
//#region src/logic.ts
/**
* Parse and type-check the only expression language accepted by DoG.
* @param value - untrusted JSON value from a graph draft.
* @param allowedRefs - child IDs that the enclosing composite may reference.
* @param limits - expression size limits.
* @returns a typed AST or validation errors; never evaluates source text.
*/
function parseBoolExpr(value, allowedRefs, limits) {
	const errors = [];
	let nodeCount = 0;
	function visit(candidate, depth, path) {
		if (depth > limits.maxDepth) {
			errors.push(`${path}: expression depth exceeds ${limits.maxDepth}`);
			return;
		}
		if (!isRecord(candidate)) {
			errors.push(`${path}: expression must be an object`);
			return;
		}
		nodeCount += 1;
		if (nodeCount > limits.maxNodes) {
			errors.push(`expression exceeds ${limits.maxNodes} nodes`);
			return;
		}
		const keys = Object.keys(candidate);
		if (!Object.prototype.hasOwnProperty.call(candidate, "op") || keys.length === 0) {
			errors.push(`${path}: expression requires exactly one operator`);
			return;
		}
		const op = candidate.op;
		if (typeof op !== "string") {
			errors.push(`${path}.op: operator must be a string`);
			return;
		}
		if (op === "ref") return parseRef(candidate, allowedRefs, errors, path);
		if (op === "not") return parseNot(candidate, depth, path, visit, errors);
		if (op === "all" || op === "any") return parseNary(candidate, op, depth, path, visit, errors);
		if (op === "atLeast") return parseThreshold(candidate, depth, path, visit, errors);
		errors.push(`${path}.op: unsupported operator ${JSON.stringify(op)}`);
	}
	const expression = visit(value, 0, "$");
	return errors.length === 0 && expression !== void 0 ? {
		expression,
		errors
	} : { errors };
}
/**
* Evaluate a typed AST against settled child truth values.
* @param expression - validated DoG Boolean AST.
* @param values - child success values; missing values are unresolved.
* @returns three-valued result so pending work cannot be mistaken for failure.
*/
function evaluateBoolExpr(expression, values) {
	switch (expression.op) {
		case "ref": {
			const value = values.get(expression.id);
			return value === void 0 ? "unknown" : value;
		}
		case "not": {
			const value = evaluateBoolExpr(expression.item, values);
			return value === "unknown" ? "unknown" : !value;
		}
		case "all": return evaluateAll(expression, values);
		case "any": return evaluateAny(expression, values);
		case "atLeast": return evaluateAtLeast(expression, values);
	}
}
function parseRef(candidate, allowedRefs, errors, path) {
	if (Object.keys(candidate).length !== 2 || typeof candidate.id !== "string" || candidate.id.length === 0) {
		errors.push(`${path}: ref requires only a non-empty string id`);
		return;
	}
	if (!allowedRefs.has(candidate.id)) {
		errors.push(`${path}.id: ${JSON.stringify(candidate.id)} is not a containment child`);
		return;
	}
	return {
		op: "ref",
		id: candidate.id
	};
}
function parseNot(candidate, depth, path, visit, errors) {
	if (Object.keys(candidate).length !== 2 || !Object.prototype.hasOwnProperty.call(candidate, "item")) {
		errors.push(`${path}: not requires only item`);
		return;
	}
	const item = visit(candidate.item, depth + 1, `${path}.item`);
	return item === void 0 ? void 0 : {
		op: "not",
		item
	};
}
function parseNary(candidate, op, depth, path, visit, errors) {
	if (Object.keys(candidate).length !== 2 || !Array.isArray(candidate.items) || candidate.items.length === 0) {
		errors.push(`${path}: ${op} requires only a non-empty items array`);
		return;
	}
	const items = [];
	for (const [index, itemValue] of candidate.items.entries()) {
		const item = visit(itemValue, depth + 1, `${path}.items[${index}]`);
		if (item !== void 0) items.push(item);
	}
	if (items.length !== candidate.items.length) return void 0;
	return op === "all" ? {
		op,
		items
	} : {
		op,
		items
	};
}
function parseThreshold(candidate, depth, path, visit, errors) {
	if (Object.keys(candidate).length !== 3 || !Array.isArray(candidate.items) || candidate.items.length === 0 || typeof candidate.count !== "number" || !Number.isInteger(candidate.count) || candidate.count < 1 || candidate.count > candidate.items.length) {
		errors.push(`${path}: atLeast requires count and a non-empty items array with 1 <= count <= items.length`);
		return;
	}
	const items = [];
	for (const [index, itemValue] of candidate.items.entries()) {
		const item = visit(itemValue, depth + 1, `${path}.items[${index}]`);
		if (item !== void 0) items.push(item);
	}
	if (items.length !== candidate.items.length) return void 0;
	return {
		op: "atLeast",
		count: candidate.count,
		items
	};
}
function evaluateAll(expression, values) {
	let unknown = false;
	for (const item of expression.items) {
		const result = evaluateBoolExpr(item, values);
		if (result === false) return false;
		if (result === "unknown") unknown = true;
	}
	return unknown ? "unknown" : true;
}
function evaluateAny(expression, values) {
	let unknown = false;
	for (const item of expression.items) {
		const result = evaluateBoolExpr(item, values);
		if (result === true) return true;
		if (result === "unknown") unknown = true;
	}
	return unknown ? "unknown" : false;
}
function evaluateAtLeast(expression, values) {
	let passed = 0;
	let unknown = 0;
	for (const item of expression.items) {
		const result = evaluateBoolExpr(item, values);
		if (result === true) passed += 1;
		if (result === "unknown") unknown += 1;
	}
	if (passed >= expression.count) return true;
	return passed + unknown >= expression.count ? "unknown" : false;
}
function isRecord(value) {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}
//#endregion
//#region src/graph.ts
/** Graph parser, structural validator, and cycle checker for DoG v0.2. */
const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/u;
/** Structured validation failure at the model-to-core boundary. */
var DogValidationError = class extends Error {
	errors;
	constructor(errors) {
		super(`invalid DoG graph: ${errors.join("; ")}`);
		this.name = "DogValidationError";
		this.errors = errors;
	}
};
/** Parse an untrusted graph value into a normalized, acyclic DoG graph. */
function parseGraph(value, limits) {
	const errors = [];
	const root = asRecord(value, "$", errors);
	if (root === void 0) throw new DogValidationError(errors);
	checkExactKeys(root, [
		"schemaVersion",
		"id",
		"root",
		"nodes",
		"contains",
		"dependsOn"
	], "$", errors);
	if (root.schemaVersion !== "0.9") errors.push(`$.schemaVersion: expected 0.9`);
	const graphId = parseId(root.id, "$.id", errors);
	const rootId = parseId(root.root, "$.root", errors);
	const nodes = parseNodes(root.nodes, limits, errors);
	const contains = parseContains(root.contains, errors);
	const dependsOn = parseDependencies(root.dependsOn, errors);
	if (graphId === void 0 || rootId === void 0 || nodes === void 0 || contains === void 0 || dependsOn === void 0) throw new DogValidationError(errors);
	validateGraphReferences(rootId, nodes, contains, dependsOn, limits, errors);
	validateAcyclic(nodes, contains, dependsOn, errors);
	if (errors.length > 0) throw new DogValidationError(errors);
	return {
		schemaVersion: "0.9",
		id: graphId,
		root: rootId,
		nodes,
		contains,
		dependsOn
	};
}
function parseNodes(value, limits, errors) {
	const record = asRecord(value, "$.nodes", errors);
	if (record === void 0) return void 0;
	const ids = Object.keys(record);
	if (ids.length === 0) errors.push("$.nodes: must not be empty");
	if (ids.length > limits.maxGraphNodes) errors.push(`$.nodes: exceeds ${limits.maxGraphNodes} nodes`);
	const nodes = {};
	for (const id of ids) {
		if (!ID_PATTERN.test(id)) errors.push(`$.nodes.${id}: invalid goal ID`);
		const node = asRecord(record[id], `$.nodes.${id}`, errors);
		if (node === void 0) continue;
		checkExactKeys(node, [
			"kind",
			"title",
			"constraint",
			"target",
			"completion",
			"verifier"
		], `$.nodes.${id}`, errors);
		const kind = parseEnum(node.kind, ["leaf", "composite"], `$.nodes.${id}.kind`, errors);
		const title = parseNonEmptyString(node.title, `$.nodes.${id}.title`, errors);
		const constraint = parseEnum(node.constraint, ["hard", "soft"], `$.nodes.${id}.constraint`, errors);
		const target = parseNonEmptyString(node.target, `$.nodes.${id}.target`, errors);
		const verifier = parseVerifier(node.verifier, `$.nodes.${id}.verifier`, errors);
		if (kind === void 0 || title === void 0 || constraint === void 0 || target === void 0) continue;
		if (kind === "leaf" && verifier === void 0) errors.push(`$.nodes.${id}: leaf requires verifier`);
		if (kind === "composite" && verifier !== void 0) {}
		if (kind === "composite" && node.completion === void 0) errors.push(`$.nodes.${id}: composite requires completion`);
		if (kind === "leaf" && node.completion !== void 0) errors.push(`$.nodes.${id}: leaf cannot declare completion`);
		nodes[id] = {
			kind,
			title,
			constraint,
			target,
			...verifier === void 0 ? {} : { verifier },
			...kind === "composite" && node.completion !== void 0 ? { completion: node.completion } : {}
		};
	}
	return nodes;
}
function parseContains(value, errors) {
	if (!Array.isArray(value)) {
		errors.push("$.contains: must be an array");
		return;
	}
	const edges = [];
	for (const [index, candidate] of value.entries()) {
		const path = `$.contains[${index}]`;
		const record = asRecord(candidate, path, errors);
		if (record === void 0) continue;
		checkExactKeys(record, [
			"parent",
			"child",
			"required",
			"failure",
			"degradeTo"
		], path, errors);
		const parent = parseId(record.parent, `${path}.parent`, errors);
		const child = parseId(record.child, `${path}.child`, errors);
		const required = parseBoolean(record.required, `${path}.required`, errors);
		const failure = parseEnum(record.failure, [
			"fatal",
			"tolerable",
			"degrade"
		], `${path}.failure`, errors);
		const degradeTo = record.degradeTo === void 0 ? void 0 : parseId(record.degradeTo, `${path}.degradeTo`, errors);
		if (failure !== "degrade" && degradeTo !== void 0) errors.push(`${path}.degradeTo: only valid with failure=degrade`);
		if (failure === "degrade" && degradeTo === void 0) errors.push(`${path}: failure=degrade requires degradeTo`);
		if (parent !== void 0 && child !== void 0 && required !== void 0 && failure !== void 0) edges.push({
			parent,
			child,
			required,
			failure,
			...degradeTo === void 0 ? {} : { degradeTo }
		});
	}
	return edges;
}
function parseDependencies(value, errors) {
	if (!Array.isArray(value)) {
		errors.push("$.dependsOn: must be an array");
		return;
	}
	const edges = [];
	for (const [index, candidate] of value.entries()) {
		const path = `$.dependsOn[${index}]`;
		const record = asRecord(candidate, path, errors);
		if (record === void 0) continue;
		checkExactKeys(record, [
			"source",
			"target",
			"data"
		], path, errors);
		const source = parseId(record.source, `${path}.source`, errors);
		const target = parseId(record.target, `${path}.target`, errors);
		const data = parseStringArray(record.data, `${path}.data`, errors);
		if (source !== void 0 && target !== void 0) edges.push({
			source,
			target,
			...data === void 0 ? {} : { data }
		});
	}
	return edges;
}
function parseVerifier(value, path, errors) {
	if (value === void 0) return void 0;
	const record = asRecord(value, path, errors);
	if (record === void 0) return void 0;
	const mode = parseEnum(record.mode, ["programmatic", "agentic"], `${path}.mode`, errors);
	if (mode === void 0) return void 0;
	if (mode === "programmatic") {
		checkExactKeys(record, ["mode", "script"], path, errors);
		const script = parseNonEmptyString(record.script, `${path}.script`, errors);
		return script === void 0 ? void 0 : {
			mode: "programmatic",
			script
		};
	}
	checkExactKeys(record, ["mode", "instruction"], path, errors);
	const instruction = parseNonEmptyString(record.instruction, `${path}.instruction`, errors);
	return instruction === void 0 ? void 0 : {
		mode: "agentic",
		instruction
	};
}
function validateGraphReferences(root, nodes, contains, dependsOn, limits, errors) {
	if (!Object.prototype.hasOwnProperty.call(nodes, root)) errors.push(`$.root: unknown node ${root}`);
	const rootNode = nodes[root];
	if (rootNode !== void 0 && rootNode.constraint !== "hard") errors.push("$.root: root goal must be a hard constraint");
	const children = /* @__PURE__ */ new Map();
	const edgeKeys = /* @__PURE__ */ new Set();
	for (const edge of contains) {
		const key = `${edge.parent}\u0000${edge.child}`;
		if (edgeKeys.has(key)) errors.push(`$.contains: duplicate edge ${edge.parent}->${edge.child}`);
		edgeKeys.add(key);
		if (!Object.prototype.hasOwnProperty.call(nodes, edge.parent)) errors.push(`$.contains: unknown parent ${edge.parent}`);
		if (!Object.prototype.hasOwnProperty.call(nodes, edge.child)) errors.push(`$.contains: unknown child ${edge.child}`);
		const parent = nodes[edge.parent];
		if (parent !== void 0 && parent.kind !== "composite") errors.push(`$.contains: ${edge.parent} is not composite`);
		const siblings = children.get(edge.parent) ?? [];
		siblings.push(edge.child);
		children.set(edge.parent, siblings);
	}
	for (const edge of contains) if (edge.degradeTo === edge.child) errors.push(`$.contains: degradeTo cannot equal child ${edge.child}`);
	else if (edge.degradeTo !== void 0 && !(children.get(edge.parent) ?? []).includes(edge.degradeTo)) errors.push(`$.contains: degradeTo ${edge.degradeTo} is not a child of ${edge.parent}`);
	const dependencyKeys = /* @__PURE__ */ new Set();
	for (const edge of dependsOn) {
		const key = `${edge.source}\u0000${edge.target}`;
		if (dependencyKeys.has(key)) errors.push(`$.dependsOn: duplicate edge ${edge.source}->${edge.target}`);
		dependencyKeys.add(key);
		if (edge.source === edge.target) errors.push(`$.dependsOn: self-dependency ${edge.source}`);
		if (!Object.prototype.hasOwnProperty.call(nodes, edge.source)) errors.push(`$.dependsOn: unknown source ${edge.source}`);
		if (!Object.prototype.hasOwnProperty.call(nodes, edge.target)) errors.push(`$.dependsOn: unknown target ${edge.target}`);
	}
	for (const [parent, node] of Object.entries(nodes)) {
		if (node.kind !== "composite") continue;
		const childIds = children.get(parent) ?? [];
		if (childIds.length === 0) errors.push(`$.nodes.${parent}: composite requires at least one child`);
		if (node.completion === void 0) {
			errors.push(`$.nodes.${parent}.completion: missing completion expression`);
			continue;
		}
		const parsed = parseBoolExpr(node.completion, new Set(childIds), {
			maxNodes: limits.maxExpressionNodes,
			maxDepth: limits.maxExpressionDepth
		});
		if (parsed.errors.length > 0) errors.push(...parsed.errors.map((error) => `$.nodes.${parent}.completion${error.slice(1)}`));
		else if (parsed.expression !== void 0) nodes[parent] = {
			...node,
			completion: parsed.expression
		};
	}
	const reachable = /* @__PURE__ */ new Set();
	const queue = [root];
	while (queue.length > 0) {
		const current = queue.shift();
		if (current === void 0 || reachable.has(current)) continue;
		reachable.add(current);
		for (const child of children.get(current) ?? []) queue.push(child);
	}
	for (const id of Object.keys(nodes)) if (!reachable.has(id)) errors.push(`$.nodes.${id}: unreachable from root through containment`);
}
function validateAcyclic(nodes, contains, dependsOn, errors) {
	const outgoing = /* @__PURE__ */ new Map();
	for (const id of Object.keys(nodes)) outgoing.set(id, []);
	for (const edge of contains) outgoing.get(edge.parent)?.push(edge.child);
	for (const edge of dependsOn) outgoing.get(edge.source)?.push(edge.target);
	const visiting = /* @__PURE__ */ new Set();
	const visited = /* @__PURE__ */ new Set();
	function visit(id, path) {
		if (visiting.has(id)) {
			errors.push(`graph contains a cycle: ${[...path, id].join(" -> ")}`);
			return;
		}
		if (visited.has(id)) return;
		visiting.add(id);
		for (const target of outgoing.get(id) ?? []) visit(target, [...path, id]);
		visiting.delete(id);
		visited.add(id);
	}
	for (const id of Object.keys(nodes)) visit(id, []);
}
function asRecord(value, path, errors) {
	if (value === null || typeof value !== "object" || Array.isArray(value)) {
		errors.push(`${path}: must be an object`);
		return;
	}
	return value;
}
function checkExactKeys(value, allowed, path, errors) {
	const allowedSet = new Set(allowed);
	for (const key of Object.keys(value)) if (!allowedSet.has(key)) errors.push(`${path}: unknown field ${key}`);
}
function parseId(value, path, errors) {
	if (typeof value !== "string" || !ID_PATTERN.test(value)) {
		errors.push(`${path}: must be an ASCII ID matching ${ID_PATTERN.source}`);
		return;
	}
	return value;
}
function parseNonEmptyString(value, path, errors) {
	if (typeof value !== "string" || value.trim().length === 0) {
		errors.push(`${path}: must be a non-empty string`);
		return;
	}
	return value;
}
function parseBoolean(value, path, errors) {
	if (typeof value !== "boolean") {
		errors.push(`${path}: must be boolean`);
		return;
	}
	return value;
}
function parseEnum(value, allowed, path, errors) {
	if (typeof value !== "string" || !allowed.includes(value)) {
		errors.push(`${path}: expected one of ${allowed.join(", ")}`);
		return;
	}
	return value;
}
function parseStringArray(value, path, errors) {
	if (value === void 0) return void 0;
	if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
		errors.push(`${path}: must be an array of strings`);
		return;
	}
	return [...value];
}
//#endregion
//#region src/json.ts
/** Deterministic JSON utilities used for graph and snapshot identities. */
/**
* Produce a deterministic JSON representation with recursively sorted object keys.
* @param value - JSON-compatible input.
* @returns canonical JSON text.
*/
function canonicalJson(value) {
	return JSON.stringify(sortJson(value));
}
/**
* Hash a JSON-compatible value with SHA-256.
* @param value - value to hash.
* @returns a lower-case hexadecimal SHA-256 digest.
*/
function sha256Json(value) {
	return createHash("sha256").update(canonicalJson(value)).digest("hex");
}
function sortJson(value) {
	if (Array.isArray(value)) return value.map(sortJson);
	if (value !== null && typeof value === "object") {
		const result = {};
		for (const key of Object.keys(value).sort()) result[key] = sortJson(value[key]);
		return result;
	}
	return value;
}
//#endregion
//#region src/lockfile.ts
/** Cross-process per-record lock: exclusive-create lockfile with stale expiry. */
var FileLock = class {
	path;
	constructor(path) {
		this.path = path;
	}
	/**
	* Try to acquire the lock. create-exclusive ('wx') is atomic across
	* processes; an existing lockfile older than `staleMs` is considered
	* abandoned (crashed holder) and replaced.
	*/
	async tryAcquire(staleMs = 6e4) {
		try {
			const handle = await open(this.path, "wx");
			await handle.writeFile(`${process.pid} ${Date.now()}`);
			await handle.close();
			return true;
		} catch (error) {
			if (error.code !== "EEXIST") return false;
			try {
				const info = await stat(this.path);
				if (Date.now() - info.mtimeMs > staleMs) {
					await rm(this.path, { force: true });
					return this.tryAcquire(staleMs);
				}
			} catch {}
			return false;
		}
	}
	async release() {
		await rm(this.path, { force: true }).catch(() => void 0);
	}
};
/** Bounded wait for a FileLock; throws on timeout so callers fail loudly. */
async function withFileLock(path, action, options = {}) {
	const lock = new FileLock(path);
	const deadline = Date.now() + (options.waitMs ?? 1500);
	for (;;) {
		if (await lock.tryAcquire(options.staleMs)) break;
		if (Date.now() >= deadline) throw new Error(`storage lock timeout: ${path}`);
		await new Promise((resolve) => setTimeout(resolve, 25));
	}
	try {
		return await action();
	} finally {
		await lock.release();
	}
}
//#endregion
//#region src/schema.ts
/** JSON Schema validation layer: every exchange payload is validated before parsing or persistence. */
/** Load the five normative schemas from schemas/schema-0.2 (checked into the package root). */
async function loadSchemaSet() {
	const schemasDir = fileURLToPath(new URL("../schemas/schema-0.2/", import.meta.url));
	const ajv = new Ajv2020({
		allErrors: true,
		strict: false
	});
	addFormats(ajv);
	const load = async (name) => JSON.parse(await readFile(join(schemasDir, name), "utf8"));
	const compile = (schema) => ajv.compile(schema);
	return {
		validateGraph: compile(await load("graph.schema.json")),
		validateRun: compile(await load("run.schema.json")),
		validateVerification: compile(await load("verification.schema.json")),
		validateRuntimeEvent: compile(await load("runtime-event.schema.json")),
		validateReport: compile(await load("report.schema.json"))
	};
}
/** Format ajv errors into one-line messages with instance paths. */
function schemaErrorText(validate) {
	return (validate.errors ?? []).map((error) => `${error.instancePath || "$"} ${error.message ?? "is invalid"}${"params" in error && typeof error.params === "object" && error.params !== null ? ` (${JSON.stringify(error.params)})` : ""}`);
}
//#endregion
//#region src/storage.ts
/** Sandboxed input capture and durable DoG records. */
var DogRepository = class {
	rootPath;
	runMutationTails = /* @__PURE__ */ new Map();
	schema;
	constructor(rootPath, schema = void 0) {
		this.rootPath = rootPath;
		this.schema = schema;
	}
	/** Create the repository directory layout. */
	async initialize() {
		await Promise.all([
			mkdir(join(this.rootPath, "graphs"), { recursive: true }),
			mkdir(join(this.rootPath, "graph-index"), { recursive: true }),
			mkdir(join(this.rootPath, "runs"), { recursive: true }),
			mkdir(join(this.rootPath, "verifications"), { recursive: true }),
			mkdir(join(this.rootPath, "runtime-events"), { recursive: true }),
			mkdir(join(this.rootPath, "artifacts"), { recursive: true }),
			mkdir(join(this.rootPath, "locks"), { recursive: true })
		]);
	}
	/** Persist one immutable compiled graph revision and its ID index. */
	async saveGraph(compiled) {
		await this.initialize();
		await withFileLock(join(this.rootPath, "locks", `graph-${compiled.graphDigest}.lock`), async () => {
			const record = {
				schemaVersion: "0.2",
				graphDigest: compiled.graphDigest,
				input: compiled.input,
				acceptancePlans: compiled.acceptancePlans
			};
			await atomicWriteJson(join(this.rootPath, "graphs", `${compiled.graphDigest}.json`), record);
			await atomicWriteJson(join(this.rootPath, "graph-index", `${safeKey(compiled.input.id)}.json`), {
				graphId: compiled.input.id,
				graphDigest: compiled.graphDigest
			});
		});
	}
	/** Load the latest graph revision for a graph ID. */
	async loadGraph(graphId) {
		const index = await readJson(join(this.rootPath, "graph-index", `${safeKey(graphId)}.json`));
		if (index.graphId !== graphId || !isDigest(index.graphDigest)) throw new Error(`invalid graph index for ${graphId}`);
		return readCompiledGraph(this.rootPath, index.graphDigest);
	}
	/** Enumerate immutable graph revisions. Pre-v0.2 records (no grounding/gmDigest contract) are skipped, not deleted. */
	async listGraphs() {
		await this.initialize();
		const entries = await readdir(join(this.rootPath, "graphs"), { withFileTypes: true });
		const graphs = [];
		for (const entry of entries) {
			if (!entry.isFile() || !/^[a-f0-9]{64}\.json$/u.test(entry.name)) continue;
			try {
				graphs.push(await readCompiledGraph(this.rootPath, entry.name.slice(0, -5)));
			} catch (error) {
				if (!String(error instanceof Error ? error.message : error).startsWith("invalid persisted graph record")) throw error;
			}
		}
		return graphs.sort((left, right) => {
			const byId = left.input.id.localeCompare(right.input.id);
			return byId === 0 ? left.graphDigest.localeCompare(right.graphDigest) : byId;
		});
	}
	/** Persist a run snapshot. */
	async saveRun(run) {
		await this.initialize();
		await withFileLock(join(this.rootPath, "locks", `run-${safeKey(run.runId)}.lock`), () => atomicWriteJson(join(this.rootPath, "runs", `${safeKey(run.runId)}.json`), run));
	}
	/** Atomically read, transform, and replace one run within this repository process. */
	async updateRun(runId, update) {
		return this.withRunMutation(runId, async () => {
			const current = await this.loadRun(runId);
			const next = update(current);
			if (next.runId !== current.runId || next.graphId !== current.graphId || next.graphDigest !== current.graphDigest) throw new Error(`run update cannot change identity for ${runId}`);
			await atomicWriteJson(join(this.rootPath, "runs", `${safeKey(runId)}.json`), next);
			return next;
		});
	}
	async withRunMutation(runId, action) {
		const previous = this.runMutationTails.get(runId) ?? Promise.resolve();
		let release;
		const gate = new Promise((resolve) => {
			release = resolve;
		});
		const tail = previous.then(() => gate, () => gate);
		this.runMutationTails.set(runId, tail);
		await previous.catch(() => void 0);
		try {
			return await withFileLock(join(this.rootPath, "locks", `run-${safeKey(runId)}.lock`), action);
		} finally {
			release();
			if (this.runMutationTails.get(runId) === tail) this.runMutationTails.delete(runId);
		}
	}
	/** Load one run snapshot, fail-closed against the run schema. */
	async loadRun(runId) {
		const run = await readJson(join(this.rootPath, "runs", `${safeKey(runId)}.json`));
		if (this.schema !== void 0 && !this.schema.validateRun(run)) throw new Error(`run record does not validate: ${schemaErrorText(this.schema.validateRun).join("; ")}`);
		return run;
	}
	/**
	* Load the most recently updated non-running run for a graph ID
	* (revalidate_select input). Any terminal record may carry verification
	* settlements worth inheriting — including orphaned runs that a host restart
	* left running and that recovery later invalidated or cancelled.
	*/
	async loadLatestSettledRun(graphId) {
		return (await this.listRuns()).find((run) => run.graphId === graphId && run.state !== "running");
	}
	/** Enumerate persisted run snapshots, newest update first. Pre-v0.2 records are skipped. */
	async listRuns() {
		await this.initialize();
		const entries = await readdir(join(this.rootPath, "runs"), { withFileTypes: true });
		const runs = [];
		for (const entry of entries) {
			if (!entry.isFile() || !entry.name.endsWith(".json")) continue;
			const key = entry.name.slice(0, -5);
			if (!/^[a-f0-9]{64}$/u.test(key)) continue;
			try {
				const run = await readJson(join(this.rootPath, "runs", `${key}.json`));
				if (this.schema !== void 0 && !this.schema.validateRun(run)) continue;
				if (typeof run.runId !== "string" || run.runId.length === 0 || entry.name !== `${safeKey(run.runId)}.json`) continue;
				if (!isDigest(run.graphDigest)) continue;
				runs.push(run);
			} catch {
				continue;
			}
		}
		return runs.sort((left, right) => {
			const byTime = right.updatedAt.localeCompare(left.updatedAt);
			return byTime === 0 ? left.runId.localeCompare(right.runId) : byTime;
		});
	}
	/**
	* Cancel every persisted run still in `running` state. Called at host boot
	* (before any engine instance exists), so runs from a killed/restarted host
	* surface as cancelled instead of frozen "running" forever. Their settled
	* leaves stay inheritable by the next run of the same graph.
	*/
	async markOrphanedRunningRuns(nowIso) {
		const runs = await this.listRuns();
		let marked = 0;
		for (const prior of runs) {
			const orphanedGoals = Object.values(prior.goals).some((goal) => goal.state === "pending" || goal.state === "running");
			if (prior.state !== "running" && !orphanedGoals) continue;
			await this.updateRun(prior.runId, (current) => ({
				...current,
				...current.state === "running" ? {
					state: "cancelled",
					rootState: "cancelled",
					runtimeWarning: `orphaned by host restart (last update ${prior.updatedAt})`
				} : {},
				goals: Object.fromEntries(Object.entries(current.goals).map(([goalId, goal]) => goal.state === "pending" || goal.state === "running" ? [goalId, {
					...goal,
					state: "cancelled"
				}] : [goalId, goal])),
				updatedAt: nowIso
			}));
			marked++;
		}
		return marked;
	}
	/** Append one verification record without rewriting prior records. */
	async appendVerification(record) {
		await this.initialize();
		const path = join(this.rootPath, "verifications", `${safeKey(record.runId)}.jsonl`);
		await appendFile(path, `${canonicalJson(record)}\n`, {
			encoding: "utf8",
			flag: "a"
		});
	}
	/** Append diagnostic runtime context to the selected goal shard, separately from trusted verifier evidence. */
	async appendRuntimeEvent(event) {
		await this.initialize();
		const path = join(this.rootPath, "runtime-events", `${safeKey(event.runId)}-${safeKey(event.goalId)}.jsonl`);
		await appendFile(path, `${canonicalJson(event)}\n`, {
			encoding: "utf8",
			flag: "a"
		});
	}
	/** Load one goal's validated event shard. A torn final line is ignored. */
	async loadGoalRuntimeEvents(runId, goalId) {
		const path = join(this.rootPath, "runtime-events", `${safeKey(runId)}-${safeKey(goalId)}.jsonl`);
		let source;
		try {
			source = await readFile(path, "utf8");
		} catch (error) {
			if (isMissing(error)) return [];
			throw error;
		}
		return (source.endsWith("\n") ? source : source.slice(0, source.lastIndexOf("\n") + 1)).split("\n").filter((line) => line.length > 0).map((line, index) => parseRuntimeEvent(JSON.parse(line), runId, goalId, index));
	}
	/** Persist the verbatim verifier settlement text (survives workspace cleanup). */
	async saveSettlement(runId, goalId, content) {
		await this.initialize();
		await atomicWriteJson(join(this.rootPath, "settlements", `${safeKey(runId)}-${safeKey(goalId)}.json`), {
			runId,
			goalId,
			savedAt: (/* @__PURE__ */ new Date()).toISOString(),
			content
		});
	}
	/** Store captured input bytes and its metadata manifest under content identity. */
	async putSandboxFile(input, bytes) {
		await this.initialize();
		const key = capturedKey(input.digest);
		if (bytes !== void 0) await atomicWrite(join(this.rootPath, "artifacts", `${key}.bin`), bytes);
		await atomicWriteJson(join(this.rootPath, "artifacts", `${key}.json`), input);
	}
	/** Read and re-hash a captured input named by a verification plan. */
	async readCapturedFile(input) {
		if (!input.exists) throw new Error(`captured input ${input.digest} represents a missing file`);
		const bytes = await readFile(join(this.rootPath, "artifacts", `${capturedKey(input.digest)}.bin`));
		if (createHash("sha256").update(bytes).digest("hex") !== input.sha256 || bytes.byteLength !== input.byteLength) throw new Error(`captured input integrity mismatch for ${input.digest}`);
		return bytes;
	}
	/** InputReader contract: read one captured input. */
	async read(input) {
		return this.readCapturedFile(input);
	}
	/** Copy a captured input into one run workspace (or resolve to the workspace dir). */
	async copyCapturedInput(input, workspacePath) {
		if (input === void 0) return workspacePath;
		const bytes = await this.readCapturedFile(input);
		const target = join(workspacePath, input.path);
		await mkdir(dirname(target), { recursive: true });
		await writeFile(target, bytes);
		return target;
	}
};
/** Resolve one workspace-relative path to an absolute path, never accepting escapes. */
async function resolveWorkspacePath(workspaceRoot, relPath) {
	if (!isAbsolute(workspaceRoot)) throw new Error("workspaceRoot must be absolute");
	if (relPath === "") throw new Error("empty workspace path has no single file to resolve");
	if (isAbsolute(relPath)) throw new Error("workspace path must be relative");
	const rootPath = resolve(workspaceRoot);
	const lexicalCandidate = resolve(rootPath, relPath);
	const lexicalRelative = relative(rootPath, lexicalCandidate);
	if (!isWithinRoot(lexicalRelative)) throw new Error(`workspace path ${relPath} escapes its configured root`);
	if (!(await stat(rootPath)).isDirectory()) throw new Error(`workspace root ${workspaceRoot} is not a directory`);
	return resolveBoundPath(await realpath(rootPath), lexicalRelative);
}
/**
* Capture one target: a single file, or a directory packed into a .tar
* (relative structure preserved). Roots are tried in order — the invoking
* session cwd first (which is where the user is actually working), then the
* configured workspace root as fallback. A non-missing error (escape, not a
* regular file…) always aborts; only a target absent from every root settles
* as `missing`.
*/
async function captureWorkspaceTarget(captureRoots, target, maxBytes, repository) {
	for (const root of captureRoots) try {
		const absolutePath = await resolveWorkspacePath(root, target);
		const metadata = await stat(absolutePath);
		let bytes;
		let packed = false;
		if (metadata.isDirectory()) {
			const rootPath = resolve(root);
			assertTreeSafe(rootPath, absolutePath);
			const chunks = [];
			let length = 0;
			for await (const chunk of c({
				cwd: rootPath,
				portable: true
			}, [target])) {
				length += chunk.length;
				if (length > maxBytes) throw new Error(`target ${target} exceeds ${maxBytes} bytes`);
				chunks.push(chunk);
			}
			bytes = Buffer.concat(chunks);
			packed = true;
		} else if (metadata.isFile()) bytes = await readFile(absolutePath);
		else throw new Error(`target ${target} is not a regular file or directory`);
		if (bytes.byteLength > maxBytes) throw new Error(`target ${target} exceeds ${maxBytes} bytes`);
		const sha256 = createHash("sha256").update(bytes).digest("hex");
		const input = {
			path: target,
			digest: `sha256:${sha256}`,
			exists: true,
			byteLength: bytes.byteLength,
			sha256,
			...packed ? { packed: true } : {}
		};
		await repository.putSandboxFile(input, bytes);
		return { input };
	} catch (error) {
		if (!isMissing(error)) throw error;
	}
	const input = {
		path: target,
		digest: `missing:${sha256Json({ path: target })}`,
		exists: false,
		byteLength: 0,
		sha256: ""
	};
	await repository.putSandboxFile(input, void 0);
	return { input };
}
/** Reject symlinks anywhere in the tree before packing (tar would otherwise carry them over). */
function assertTreeSafe(rootPath, dirPath) {
	const entries = readdirSync(dirPath, { withFileTypes: true });
	for (const entry of entries) {
		const child = join(dirPath, entry.name);
		if (entry.isSymbolicLink()) throw new Error(`target tree contains a symbolic link: ${relative(rootPath, child)}`);
		if (entry.isDirectory()) assertTreeSafe(rootPath, child);
	}
}
function capturedKey(digest) {
	return digest.replaceAll(/[^a-zA-Z0-9_-]/gu, "_");
}
function safeKey(value) {
	return sha256Json(value);
}
function isWithinRoot(relativePath) {
	return relativePath !== ".." && !relativePath.startsWith(`..${sep}`) && !isAbsolute(relativePath);
}
async function resolveBoundPath(rootPath, relativePath) {
	const segments = relativePath.length === 0 ? [] : relativePath.split(sep);
	let current = rootPath;
	for (let index = 0; index < segments.length; index++) {
		const segment = segments[index];
		if (segment === void 0) continue;
		const candidate = join(current, segment);
		let metadata;
		try {
			metadata = await lstat(candidate);
		} catch (error) {
			if (!isMissing(error)) throw error;
			return join(current, ...segments.slice(index));
		}
		if (metadata.isSymbolicLink()) try {
			current = await realpath(candidate);
		} catch (error) {
			if (isMissing(error)) throw new Error("sandbox path contains a dangling symbolic link");
			throw error;
		}
		else current = candidate;
		if (!isWithinRoot(relative(rootPath, current))) throw new Error("sandbox path escapes its configured root through a symbolic link");
	}
	return current;
}
async function readCompiledGraph(rootPath, graphDigest) {
	if (!isDigest(graphDigest)) throw new Error(`invalid graph digest ${graphDigest}`);
	const record = await readJson(join(rootPath, "graphs", `${graphDigest}.json`));
	const actualDigest = sha256Json({
		input: record.input,
		acceptancePlans: record.acceptancePlans
	});
	if (record.schemaVersion !== "0.2" || record.graphDigest !== graphDigest || actualDigest !== graphDigest) throw new Error(`invalid persisted graph record ${graphDigest}`);
	return {
		input: record.input,
		graphDigest: record.graphDigest,
		acceptancePlans: record.acceptancePlans
	};
}
function isDigest(value) {
	return typeof value === "string" && /^[a-f0-9]{64}$/u.test(value);
}
const RUNTIME_PHASES = /* @__PURE__ */ new Set([
	"goal_started",
	"dependency_blocked",
	"grounding_extracted",
	"workspace_allocated",
	"verifier_started",
	"verifier_passed",
	"verifier_failed",
	"verifier_inconclusive",
	"composite_evaluated",
	"result_inherited",
	"verifier_released",
	"verifier_bind_failed",
	"structured_error",
	"goal_settled",
	"run_warning"
]);
const GOAL_STATES = /* @__PURE__ */ new Set([
	"pending",
	"running",
	"success",
	"failure",
	"blocked",
	"needs_human",
	"cancelled",
	"invalidated",
	"partial",
	"inherited"
]);
function parseRuntimeEvent(value, expectedRunId, expectedGoalId, index) {
	const path = `runtime event ${index}`;
	const record = requireRecord(value, path);
	const runId = requireString(record.runId, `${path}.runId`);
	const goalId = requireString(record.goalId, `${path}.goalId`);
	const phase = requireString(record.phase, `${path}.phase`);
	if (runId !== expectedRunId) throw new Error(`${path}.runId does not match its event log`);
	if (goalId !== expectedGoalId) throw new Error(`${path}.goalId does not match its event log`);
	if (!RUNTIME_PHASES.has(phase)) throw new Error(`${path}.phase is invalid`);
	const state = record.state === void 0 ? void 0 : requireString(record.state, `${path}.state`);
	if (state !== void 0 && !GOAL_STATES.has(state)) throw new Error(`${path}.state is invalid`);
	const reason = record.reason === void 0 ? void 0 : requireBoundedString(record.reason, `${path}.reason`);
	const durationMs = record.durationMs === void 0 ? void 0 : requireNonNegativeInteger(record.durationMs, `${path}.durationMs`);
	const attempt = record.attempt === void 0 ? void 0 : requireNonNegativeInteger(record.attempt, `${path}.attempt`);
	if (attempt !== void 0 && attempt < 1) throw new Error(`${path}.attempt must be positive`);
	const gmDigest = record.gmDigest === void 0 ? void 0 : requireString(record.gmDigest, `${path}.gmDigest`);
	const verifierRecord = record.verifier === void 0 ? void 0 : requireRecord(record.verifier, `${path}.verifier`);
	const verifier = verifierRecord === void 0 ? void 0 : { mode: requireEnum(verifierRecord.mode, ["programmatic", "agentic"], `${path}.verifier.mode`) };
	return {
		schemaVersion: record.schemaVersion === "0.1" ? "0.1" : fail(`${path}.schemaVersion must be 0.1`),
		runId,
		goalId,
		phase,
		at: requireString(record.at, `${path}.at`),
		...state === void 0 ? {} : { state },
		...reason === void 0 ? {} : { reason },
		...verifier === void 0 ? {} : { verifier },
		...gmDigest === void 0 ? {} : { gmDigest },
		...attempt === void 0 ? {} : { attempt },
		...durationMs === void 0 ? {} : { durationMs }
	};
}
function requireRecord(value, path) {
	if (value === null || typeof value !== "object" || Array.isArray(value)) throw new Error(`${path} must be an object`);
	return Object.fromEntries(Object.entries(value));
}
function requireString(value, path) {
	if (typeof value !== "string") throw new Error(`${path} must be a string`);
	return value;
}
function requireEnum(value, allowed, path) {
	const candidate = requireString(value, path);
	if (!allowed.includes(candidate)) throw new Error(`${path} is invalid`);
	return candidate;
}
function requireBoundedString(value, path) {
	const text = requireString(value, path);
	if (text.length > 512) throw new Error(`${path} exceeds 512 characters`);
	return text;
}
function requireNonNegativeInteger(value, path) {
	if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) throw new Error(`${path} must be a non-negative safe integer`);
	return value;
}
function fail(message) {
	throw new Error(message);
}
async function atomicWriteJson(path, value) {
	await atomicWrite(path, `${JSON.stringify(value)}\n`);
}
async function atomicWrite(path, value) {
	const temporary = `${path}.tmp-${process.pid}-${randomUUID()}`;
	await writeFile(temporary, value);
	await rename(temporary, path);
}
async function readJson(path) {
	return JSON.parse(await readFile(path, "utf8"));
}
function isMissing(error) {
	return error instanceof Error && "code" in error && error.code === "ENOENT";
}
//#endregion
//#region src/verifiers.ts
/**
* Run one plan through the selected kernel. The engine holds none of the
* judgment semantics: programmatic goes to a script, agentic to a worker agent
* with only the instruction text — no parameter schema, no evidence format,
* no tool allow-list.
*/
async function runPlan(plan, workspace, inputPath, env, programmatic, agentic) {
	if (plan.verifier.mode === "programmatic") {
		if (programmatic === void 0) return {
			state: "inconclusive",
			observation: { outcome: "programmatic kernel unavailable" }
		};
		const verdict = await programmatic(plan.verifier.script, inputPath, env);
		return {
			state: verdict.state,
			observation: evidenceToObservation(verdict),
			evidence: verdict.evidence
		};
	}
	if (agentic === void 0) return {
		state: "inconclusive",
		observation: { outcome: "agentic kernel unavailable" }
	};
	const verdict = await agentic(plan.verifier.instruction, workspace, inputPath, env);
	return {
		state: verdict.state,
		observation: evidenceToObservation(verdict),
		evidence: verdict.evidence
	};
}
function evidenceToObservation(verdict) {
	const observation = { outcome: verdict.state };
	if (verdict.reason !== void 0) observation.reason = verdict.reason;
	if (verdict.evidence !== void 0) observation.evidence = verdict.evidence;
	return observation;
}
//#endregion
//#region src/workspace.ts
/** Mutually exclusive isolated workspaces: one per verification, never shared, never merged. */
var WorkspaceManager = class {
	baseDir;
	pending = /* @__PURE__ */ new Set();
	constructor(options = {}) {
		this.baseDir = options.baseDir ?? join(tmpdir(), "dsh-dog-workspaces");
	}
	/**
	* Allocate one mutually exclusive workspace directory.
	*
	* `baseDir` overrides the construction default: the engine passes the calling
	* session's cwd so the workspace lands inside the session workspace, which is
	* exactly the tree the verifier subagent's sandbox (workspace-write) permits.
	* Defaults to the manager's configured base dir when no override is given.
	*/
	async acquire(baseDir) {
		const root = baseDir ?? this.baseDir;
		await mkdir(root, { recursive: true });
		return { path: await mkdtemp(join(root, `${randomUUID()}-`)) };
	}
	/** Release a workspace after verification completes; contents are discarded. */
	async release(workspace) {
		const tracked = rm(workspace.path, {
			recursive: true,
			force: true
		}).catch(() => void 0).finally(() => this.pending.delete(tracked));
		this.pending.add(tracked);
		await tracked;
	}
	/** Wait for every in-flight release (host shutdown). */
	async drain() {
		await Promise.allSettled([...this.pending]);
	}
	/** Release a batch at once — used at run teardown, after every verifier settled. */
	async releaseAll(workspaces) {
		await Promise.allSettled(workspaces.map((workspace) => this.release(workspace)));
	}
};
//#endregion
//#region src/core.ts
/** DoG v0.9 engine: graph compilation, two-kernel judgment, Agentic CI run. */
const GOAL_AGENT_ROLES = /* @__PURE__ */ new Set([
	"orchestrator",
	"verifier",
	"reviewer"
]);
/** Agentic CI engine used by the DSH tools and tests. */
var DogEngine = class {
	config;
	repository;
	liveConfig;
	onRunCancelled;
	runControllers = /* @__PURE__ */ new Map();
	programmatic;
	agentic;
	workspaces;
	now;
	nextRunId;
	heartbeatMs;
	workspaceRoot;
	backgroundTasks = /* @__PURE__ */ new Set();
	runStops = /* @__PURE__ */ new Map();
	workspaceBaseDirs = /* @__PURE__ */ new Map();
	resolveLivingAgent;
	/** Install the two judgment kernels (host wiring; may arrive later than construction). */
	setKernels(programmatic, agentic) {
		this.programmatic = programmatic;
		this.agentic = agentic;
	}
	constructor(options) {
		validateHostConfig(options.config);
		this.config = options.config;
		this.repository = options.repository;
		this.liveConfig = options.liveConfig;
		this.onRunCancelled = options.onRunCancelled;
		this.programmatic = options.programmatic;
		this.agentic = options.agentic;
		this.workspaces = options.workspaces ?? new WorkspaceManager();
		this.now = options.now ?? (() => /* @__PURE__ */ new Date());
		this.nextRunId = options.nextRunId ?? (() => randomUUID());
		this.heartbeatMs = options.heartbeatMs ?? 3e4;
		this.resolveLivingAgent = options.resolveLivingAgent;
		this.workspaceRoot = options.config.workspaceRoot;
	}
	validate(value) {
		try {
			const graph = this.parse(value);
			this.validateWorkspaceRefs(graph);
			return {
				valid: true,
				errors: [],
				warnings: graphWarnings(graph)
			};
		} catch (error) {
			return {
				valid: false,
				errors: error instanceof DogValidationError ? [...error.errors] : [messageOf(error)],
				warnings: []
			};
		}
	}
	/** Compile and persist one graph revision against the captured input files. */
	async create(value, options = {}) {
		const graph = this.parse(value);
		this.validateWorkspaceRefs(graph);
		const acceptancePlans = {};
		const capturedCache = /* @__PURE__ */ new Map();
		const captureRoots = options.captureBaseDir !== void 0 && options.captureBaseDir.length > 0 ? [options.captureBaseDir, this.workspaceRoot] : [this.workspaceRoot];
		for (const [goalId, node] of Object.entries(graph.nodes)) {
			if (node.verifier === void 0) continue;
			const workspaceFile = requireTarget(node.target, goalId);
			let captured = void 0;
			if (workspaceFile !== "") {
				captured = capturedCache.get(workspaceFile);
				if (captured === void 0) {
					captured = await captureWorkspaceTarget(captureRoots, workspaceFile, this.config.maxSandboxBytes, this.repository);
					capturedCache.set(workspaceFile, captured);
				}
			}
			acceptancePlans[goalId] = {
				goalId,
				verifier: node.verifier,
				judgment: computeJudgment(node.verifier, this.config.scriptsDirectory),
				target: node.target,
				...workspaceFile === "" || captured === void 0 ? {} : { input: captured.input }
			};
		}
		const compiled = deepFreeze({
			input: graph,
			graphDigest: sha256Json({
				input: graph,
				acceptancePlans
			}),
			acceptancePlans
		});
		await this.repository.saveGraph(compiled);
		return compiled;
	}
	/** Synchronous run: prepare + execute to completion (tests, CLI). */
	async run(graphId, options = {}) {
		const prepared = await this.prepareRun(graphId, options);
		return this.executeRun(prepared, options);
	}
	/** Asynchronous run: returns after the initial record is persisted; verification continues in background. */
	async startRun(graphId, options = {}) {
		const prepared = await this.prepareRun(graphId, options);
		const controller = new AbortController();
		this.runControllers.set(prepared.runId, controller);
		this.enqueueBackground(prepared, {
			...options,
			signal: controller.signal
		});
		return prepared.initial;
	}
	/** Execute a prepared run on the engine's process-level loop, independent of any caller session. */
	enqueueBackground(prepared, options) {
		const task = this.executeRun(prepared, options).then(() => void 0).catch(async (cause) => {
			try {
				const live = await this.repository.loadRun(prepared.runId);
				if (live.state === "running") await this.repository.saveRun({
					...live,
					state: "failed",
					rootState: "failure",
					runtimeWarning: `background execution failed: ${boundedMessage(messageOf(cause))}`,
					updatedAt: this.now().toISOString()
				});
			} catch {}
			this.runStops.get(prepared.runId)?.();
			this.runStops.delete(prepared.runId);
			this.runControllers.delete(prepared.runId);
			this.backgroundTasks.delete(task);
		});
		task.finally(() => this.backgroundTasks.delete(task));
		this.backgroundTasks.add(task);
	}
	/** Stop this engine's owned runs before awaiting their settlement. */
	async dispose() {
		await Promise.allSettled([...this.runControllers.keys()].map((id) => this.cancelRun(id, "OpenWrite stopped")));
		for (const stop of this.runStops.values()) stop();
		this.runStops.clear();
		await this.drainBackground();
	}
	/** Wait for every in-flight background run (host shutdown). */
	async drainBackground() {
		await Promise.allSettled([...this.backgroundTasks]);
	}
	/** Persist a bounded run-level warning (verifier binding/release diagnostics). */
	async annotateRun(runId, warning) {
		try {
			await this.repository.updateRun(runId, (current) => ({
				...current,
				runtimeWarning: boundedMessage(warning),
				updatedAt: this.now().toISOString()
			}));
		} catch {}
	}
	/** Append a verifier worker lifecycle event (verifier_released / verifier_bind_failed). */
	async recordVerifierLifecycle(runId, goalId, phase, _sessionId, reason) {
		try {
			await this.repository.appendRuntimeEvent({
				schemaVersion: "0.1",
				runId,
				goalId,
				phase,
				at: this.now().toISOString(),
				...reason === void 0 ? {} : { reason: boundedMessage(reason) },
				verifier: { mode: "agentic" }
			});
		} catch {}
	}
	/** Cancel one run and stop its heartbeat; partial records remain inspectable. */
	async cancelRun(runId, reason) {
		this.runControllers.get(runId)?.abort(new Error(reason));
		this.runControllers.delete(runId);
		this.runStops.get(runId)?.();
		this.runStops.delete(runId);
		const updated = await this.repository.updateRun(runId, (current) => ({
			...current,
			state: "cancelled",
			rootState: "cancelled",
			runtimeWarning: `cancelled: ${boundedMessage(reason)}`,
			updatedAt: this.now().toISOString()
		}));
		this.onRunCancelled?.(runId);
		return updated;
	}
	/**
	* Block on one run's settlement. Keeps the calling agent/session alive in
	* the process while verifier workers (continuable children of this process)
	* run to completion — the deterministic automation gate after dog_run. A
	* one-shot process that returns before this settles kills the workers it
	* spawned, so automation MUST wait through a dog_wait/monitor step.
	* @param options - bounded wait: default 15 minutes; abort (tool cancel)
	*   and timeout both return the current run with a non-terminal state.
	*/
	async waitRun(runId, options = {}) {
		const deadline = Date.now() + (options.timeoutMs ?? 9e5);
		const pollMs = options.pollMs ?? 15e3;
		for (;;) {
			const run = await this.repository.loadRun(runId);
			if (run.state !== "running") return run;
			options.signal?.throwIfAborted();
			if (Date.now() >= deadline) return run;
			await new Promise((resolve) => setTimeout(resolve, pollMs));
		}
	}
	async prepareRun(graphId, options) {
		const compiled = await this.repository.loadGraph(graphId);
		const runId = this.nextRunId();
		await this.supersedePriorRunningRuns(compiled.input.id, runId);
		const createdAt = this.now().toISOString();
		const invocation = options.invocation === void 0 ? void 0 : {
			callId: requireContextId(options.invocation.callId, "invocation callId"),
			...options.invocation.agentSessionId === void 0 ? {} : { agentSessionId: requireContextId(options.invocation.agentSessionId, "invocation agentSessionId") },
			...options.invocation.parentSessionId === void 0 ? {} : { parentSessionId: requireContextId(options.invocation.parentSessionId, "invocation parentSessionId") },
			invokedAt: createdAt
		};
		const goals = Object.fromEntries(Object.keys(compiled.input.nodes).map((id) => [id, { state: "pending" }]));
		const gmDigests = {};
		const workspaceBaseDir = options.invocation?.agentSessionId === void 0 || this.resolveLivingAgent === void 0 ? void 0 : (() => {
			const cwd = this.resolveLivingAgent(options.invocation.agentSessionId)?.session.header.cwd;
			return typeof cwd === "string" && cwd.length > 0 ? cwd : void 0;
		})();
		this.workspaceBaseDirs.set(runId, workspaceBaseDir);
		const initial = {
			runId,
			graphId: compiled.input.id,
			graphDigest: compiled.graphDigest,
			...workspaceBaseDir === void 0 ? {} : { workspaceBaseDir },
			state: "running",
			...invocation === void 0 ? {} : { invocation },
			gmDigests,
			goals,
			createdAt,
			updatedAt: createdAt
		};
		await this.repository.saveRun(initial);
		return {
			compiled,
			runId,
			initial
		};
	}
	/** The Agentic CI cycle: revalidate-select, parallel verification, recompute. */
	async executeRun(prepared, options) {
		const { compiled, runId } = prepared;
		const signal = options.signal ?? new AbortController().signal;
		const goals = { ...prepared.initial.goals };
		const gmDigests = { ...prepared.initial.gmDigests };
		let run = prepared.initial;
		let stopHeartbeat = () => {};
		const heartbeat = setInterval(() => {
			if (run.state !== "running") {
				stopHeartbeat();
				return;
			}
			this.repository.updateRun(runId, (current) => ({
				...current,
				updatedAt: this.now().toISOString()
			})).catch(() => void 0);
		}, this.heartbeatMs);
		stopHeartbeat = () => clearInterval(heartbeat);
		this.runStops.set(runId, stopHeartbeat);
		const appendRuntimeEvent = async (goalId, phase, details = {}) => {
			const event = {
				schemaVersion: "0.1",
				runId,
				goalId,
				phase,
				at: details.at ?? this.now().toISOString(),
				...details.state === void 0 ? {} : { state: details.state },
				...details.reason === void 0 ? {} : { reason: boundedMessage(details.reason) },
				...details.verifier === void 0 ? {} : { verifier: details.verifier },
				...details.gmDigest === void 0 ? {} : { gmDigest: details.gmDigest },
				...details.attempt === void 0 ? {} : { attempt: details.attempt },
				...details.durationMs === void 0 ? {} : { durationMs: details.durationMs }
			};
			try {
				await this.repository.appendRuntimeEvent(event);
			} catch (error) {
				if (run.runtimeWarning === void 0) run = {
					...run,
					runtimeWarning: `runtime context write failed: ${boundedMessage(messageOf(error))}`
				};
			}
		};
		const saveProgress = async (updatedAt) => {
			await this.repository.updateRun(runId, (current) => ({
				...current,
				...run.runtimeWarning !== void 0 ? { runtimeWarning: run.runtimeWarning } : {},
				goals: this.mergeGoalsKeepingHostSessions(goals, current.goals),
				gmDigests: { ...gmDigests },
				updatedAt
			}));
		};
		const dependencies = dependenciesBySource(compiled.input);
		const children = childrenByParent(compiled.input);
		const relations = relationsByParent(compiled.input);
		const priorRun = await this.repository.loadLatestSettledRun(compiled.input.id);
		const planFor = (goalId) => compiled.acceptancePlans[goalId];
		const inheritedFor = (goalId) => {
			if (priorRun === void 0) return void 0;
			const plan = planFor(goalId);
			if (plan === void 0) return void 0;
			const anchor = anchorOfPlan(plan);
			if (anchor === void 0) return void 0;
			if (priorRun.gmDigests[goalId] !== anchor) return void 0;
			const priorRecord = priorRun.goals[goalId]?.verification;
			if (priorRecord === void 0) return void 0;
			return {
				state: "inherited",
				inheritedFrom: priorRun.runId,
				verification: priorRecord
			};
		};
		const leaves = Object.keys(compiled.input.nodes).filter((id) => compiled.input.nodes[id]?.kind === "leaf");
		for (const goalId of leaves) {
			const plan = planFor(goalId);
			if (plan === void 0) continue;
			const anchor = anchorOfPlan(plan);
			if (anchor !== void 0) {
				gmDigests[goalId] = anchor;
				const inherited = inheritedFor(goalId);
				if (inherited !== void 0) {
					goals[goalId] = inherited;
					await appendRuntimeEvent(goalId, "result_inherited", {
						state: "inherited",
						reason: `reused ${inherited.inheritedFrom ?? "prior run"} verification record`
					});
					await saveProgress(this.now().toISOString());
				}
			}
		}
		const mergeWholeAssertion = (logical, settled) => {
			if (settled.state === "fail") return {
				state: "failure",
				reason: "whole-object assertion failed"
			};
			if (settled.state === "inconclusive") return {
				state: "needs_human",
				reason: "whole-object assertion inconclusive"
			};
			return logical;
		};
		const evaluateComposite = (goalId) => {
			const node = compiled.input.nodes[goalId];
			const parentRelations = relations.get(goalId) ?? [];
			const childIds = children.get(goalId) ?? [];
			const values = relationTruthValues(parentRelations, goals);
			if (node?.completion === void 0) return {
				state: "needs_human",
				reason: "validated composite lost its completion expression"
			};
			const requiredFailures = parentRelations.filter((edge) => edge.required && relationTruth(edge, goals) === false);
			const fatalRequiredFailure = requiredFailures.find((edge) => edge.failure === "fatal");
			const requiredUnknown = parentRelations.find((edge) => edge.required && relationTruth(edge, goals) === void 0);
			if (fatalRequiredFailure !== void 0) return {
				state: "failure",
				reason: `required non-tolerable child ${fatalRequiredFailure.child} failed`
			};
			if (requiredUnknown !== void 0) return relationNeedsHuman(requiredUnknown, goals) ? {
				state: "needs_human",
				reason: `required child relation ${requiredUnknown.child} requires human review`
			} : {
				state: "blocked",
				reason: `required child ${requiredUnknown.child} is unresolved`
			};
			if (requiredFailures.length > 0) return {
				state: "partial",
				reason: `required child ${requiredFailures[0]?.child ?? "unknown"} failed under a tolerable policy`
			};
			const completion = evaluateBoolExpr(node.completion, values);
			if (completion === true) return { state: "success" };
			if (completion === "unknown") {
				const humanChild = childIds.find((childId) => dependencyNeedsHuman(goals[childId]));
				return humanChild === void 0 ? {
					state: "blocked",
					reason: "one or more child outcomes are unresolved"
				} : {
					state: "needs_human",
					reason: `child ${humanChild} requires human review`
				};
			}
			const fatal = parentRelations.filter((edge) => relationTruth(edge, goals) === false).find((edge) => edge.failure === "fatal");
			return fatal === void 0 ? {
				state: "partial",
				reason: "completion rule is false, but every failed child relation is tolerable or optional"
			} : {
				state: "failure",
				reason: `non-tolerable child ${fatal.child} failed`
			};
		};
		const settleLeaf = async (goalId) => {
			const node = compiled.input.nodes[goalId];
			const plan = compiled.acceptancePlans[goalId];
			if (node === void 0 || node.kind !== "leaf") return goals[goalId] ?? { state: "pending" };
			if (plan === void 0) return {
				state: "needs_human",
				reason: "compiled acceptance plan is missing"
			};
			let workspace;
			try {
				const startedAt = this.now().toISOString();
				goals[goalId] = { state: "running" };
				await appendRuntimeEvent(goalId, "goal_started", {
					at: startedAt,
					state: "running"
				});
				await saveProgress(startedAt);
				workspace = await this.workspaces.acquire(this.workspaceBaseDirs.get(runId));
				runWorkspaces.add(workspace);
				await appendRuntimeEvent(goalId, "workspace_allocated", {
					state: "running",
					attempt: 1
				});
				const verifier = { mode: plan.verifier.mode };
				await appendRuntimeEvent(goalId, "verifier_started", {
					state: "running",
					verifier,
					attempt: 1
				});
				const inputPath = await prepareInputPath(plan, workspace, this.repository);
				const settled = await runPlan(plan, workspace, inputPath, {
					parent: options.agent,
					signal,
					runId,
					goalId
				}, this.programmatic, this.agentic);
				if (signal.aborted) return {
					state: "cancelled",
					reason: "run cancelled; verifier aborted"
				};
				const verdict = settled.state === "pass" ? "success" : settled.state === "fail" ? "failure" : "needs_human";
				const record = {
					schemaVersion: "0.1",
					goalId,
					runId,
					graphId: compiled.input.id,
					graphDigest: compiled.graphDigest,
					judgment: plan.judgment,
					...plan.gmDigest === void 0 ? {} : { gmDigest: plan.gmDigest },
					passed: settled.state === "pass" ? true : settled.state === "fail" ? false : null,
					...settled.evidence === void 0 ? {} : { evidence: settled.evidence },
					at: this.now().toISOString()
				};
				const result = verdict === "success" ? {
					state: "success",
					verification: record
				} : verdict === "failure" ? {
					state: "failure",
					verification: record
				} : {
					state: "needs_human",
					reason: "verifier was inconclusive; evidence insufficient",
					verification: record
				};
				const phase = settled.state === "pass" ? "verifier_passed" : settled.state === "fail" ? "verifier_failed" : "verifier_inconclusive";
				await this.repository.appendVerification(record);
				await appendRuntimeEvent(goalId, phase, {
					state: result.state,
					verifier,
					attempt: 1,
					...result.state === "failure" ? { reason: "trusted verifier rejected the captured input" } : {},
					...result.state === "needs_human" ? { reason: "verifier inconclusive" } : {}
				});
				return result;
			} catch (cause) {
				const error = {
					kind: "verification_error",
					stage: "verification",
					message: boundedMessage(messageOf(cause))
				};
				const failed = {
					state: "needs_human",
					reason: error.message
				};
				await appendRuntimeEvent(goalId, "structured_error", {
					state: "needs_human",
					reason: error.kind
				});
				goals[goalId] = failed;
				return failed;
			}
		};
		const pendingLeaves = new Set(leaves.filter((id) => goals[id]?.state === "pending"));
		const configuredConcurrency = this.liveConfig?.()?.maxConcurrentVerifications ?? this.config.maxConcurrentVerifications;
		const concurrency = Math.max(1, Math.floor(configuredConcurrency));
		const inFlight = /* @__PURE__ */ new Set();
		const inFlightAgentic = /* @__PURE__ */ new Set();
		const runWorkspaces = /* @__PURE__ */ new Set();
		const drain = async () => {
			await Promise.allSettled([...inFlight]);
			inFlight.clear();
			inFlightAgentic.clear();
		};
		const pump = async () => {
			for (const goalId of [...pendingLeaves]) {
				const plan = planFor(goalId);
				if ((dependencies.get(goalId) ?? []).find((target) => !dependencyComplete(goals[target])) !== void 0) continue;
				const isAgentic = plan?.verifier.mode === "agentic";
				if (isAgentic && inFlightAgentic.size >= concurrency) continue;
				pendingLeaves.delete(goalId);
				const task = settleLeaf(goalId).then((result) => {
					goals[goalId] = result;
					const settledAt = this.now().toISOString();
					return appendRuntimeEvent(goalId, "goal_settled", {
						at: settledAt,
						state: result.state,
						...result.reason === void 0 ? {} : { reason: result.reason },
						attempt: 1
					}).then(() => saveProgress(settledAt));
				}).finally(() => {
					inFlight.delete(task);
					inFlightAgentic.delete(task);
				});
				inFlight.add(task);
				if (isAgentic) inFlightAgentic.add(task);
			}
		};
		let aborted = false;
		signal.addEventListener("abort", () => {
			aborted = true;
		}, { once: true });
		while (!aborted) {
			await pump();
			if (inFlight.size === 0 || pendingLeaves.size === 0) break;
			await Promise.race([...inFlight]);
		}
		await drain();
		const settleComposite = async (goalId) => {
			this.now().toISOString();
			goals[goalId] = { state: "running" };
			await saveProgress(this.now().toISOString());
			let result = evaluateComposite(goalId);
			const wholePlan = planFor(goalId);
			if (wholePlan !== void 0 && result.state !== "failure") try {
				const workspace = await this.workspaces.acquire(this.workspaceBaseDirs.get(runId));
				runWorkspaces.add(workspace);
				await appendRuntimeEvent(goalId, "verifier_started", {
					state: "running",
					verifier: { mode: wholePlan.verifier.mode },
					attempt: 1
				});
				const settled = await runPlan(wholePlan, workspace, await prepareInputPath(wholePlan, workspace, this.repository), {
					parent: options.agent,
					signal,
					runId,
					goalId
				}, this.programmatic, this.agentic);
				const phase = settled.state === "pass" ? "verifier_passed" : settled.state === "fail" ? "verifier_failed" : "verifier_inconclusive";
				await appendRuntimeEvent(goalId, phase, {
					at: this.now().toISOString(),
					state: settled.state === "pass" ? "success" : settled.state === "fail" ? "failure" : "needs_human",
					verifier: { mode: wholePlan.verifier.mode }
				});
				result = mergeWholeAssertion(result, settled);
				const record = {
					schemaVersion: "0.1",
					goalId,
					runId,
					graphId: compiled.input.id,
					graphDigest: compiled.graphDigest,
					judgment: wholePlan.judgment,
					...wholePlan.gmDigest === void 0 ? {} : { gmDigest: wholePlan.gmDigest },
					passed: settled.state === "pass" ? true : settled.state === "fail" ? false : null,
					...settled.evidence === void 0 ? {} : { evidence: settled.evidence },
					at: this.now().toISOString()
				};
				await this.repository.appendVerification(record);
				result = {
					...result,
					verification: record
				};
			} catch (error) {
				result = {
					state: "failure",
					reason: `whole-object assertion failed: ${boundedMessage(messageOf(error))}`
				};
			}
			await appendRuntimeEvent(goalId, "composite_evaluated", {
				state: result.state,
				...result.reason === void 0 ? {} : { reason: result.reason }
			});
			await appendRuntimeEvent(goalId, "goal_settled", {
				at: this.now().toISOString(),
				state: result.state,
				...result.reason === void 0 ? {} : { reason: result.reason }
			});
			goals[goalId] = result;
			await saveProgress(this.now().toISOString());
		};
		const compositePending = new Set(postorder(compiled.input).filter((id) => compiled.input.nodes[id]?.kind === "composite"));
		const compositeInFlight = /* @__PURE__ */ new Set();
		while (!aborted && (compositePending.size > 0 || compositeInFlight.size > 0)) {
			for (const goalId of [...compositePending]) {
				if ((children.get(goalId) ?? []).find((id) => !dependencyComplete(goals[id])) !== void 0) continue;
				const blockedDependency = (dependencies.get(goalId) ?? []).find((target) => !dependencyComplete(goals[target]));
				if (blockedDependency !== void 0) {
					goals[goalId] = {
						state: dependencyNeedsHuman(goals[blockedDependency]) ? "needs_human" : "blocked",
						reason: `waiting for dependency ${blockedDependency} to complete`
					};
					compositePending.delete(goalId);
					await saveProgress(this.now().toISOString());
					continue;
				}
				const isAgentic = planFor(goalId)?.verifier.mode === "agentic";
				if (isAgentic && inFlightAgentic.size >= concurrency) continue;
				compositePending.delete(goalId);
				const task = settleComposite(goalId).then(() => void 0).finally(() => {
					compositeInFlight.delete(task);
					if (isAgentic) inFlightAgentic.delete(task);
				});
				compositeInFlight.add(task);
				if (isAgentic) inFlightAgentic.add(task);
			}
			if (compositeInFlight.size === 0) break;
			await Promise.race([...compositeInFlight]);
		}
		await Promise.allSettled([...compositeInFlight]);
		const rootResult = goals[compiled.input.root];
		const rootState = terminalState(rootResult, this.config.allowPartialRoot);
		const updatedAt = this.now().toISOString();
		const inheritableLeaves = leaves.filter((id) => planFor(id)?.gmDigest !== void 0);
		const revalidatedCount = inheritableLeaves.filter((id) => goals[id]?.state !== "inherited").length;
		if (inheritableLeaves.some((id) => goals[id]?.state === "inherited") && inheritableLeaves.length > 0 && revalidatedCount / inheritableLeaves.length > this.config.revalidateThreshold) run = {
			...run,
			runtimeWarning: `this submission re-triggers ${revalidatedCount}/${leaves.length} leaves; exceeds revalidateThreshold — confirm unrelated parts were not changed`
		};
		if (signal.aborted) await this.repository.updateRun(runId, (current) => ({
			...current,
			state: "cancelled",
			rootState: "cancelled",
			goals: current.goals,
			updatedAt
		}));
		else await this.repository.updateRun(runId, (current) => ({
			...current,
			state: "completed",
			rootState,
			...run.runtimeWarning !== void 0 ? { runtimeWarning: run.runtimeWarning } : {},
			goals: this.mergeGoalsKeepingHostSessions(goals, current.goals),
			gmDigests: { ...gmDigests },
			updatedAt
		}));
		run = signal.aborted ? {
			...run,
			state: "cancelled",
			rootState: "cancelled",
			updatedAt
		} : {
			...run,
			state: "completed",
			rootState,
			goals: { ...goals },
			gmDigests: { ...gmDigests },
			updatedAt
		};
		await this.workspaces.releaseAll([...runWorkspaces]);
		stopHeartbeat();
		this.runStops.delete(runId);
		this.runControllers.delete(runId);
		return deepFreeze(run);
	}
	/**
	* Merge in-memory goal progress with host-agent-session bindings recorded
	* concurrently inside an atomic read-modify-write: bindAgent (and future
	* host writers) update the same row under updateRun's serialization, so a
	* progress save can never overwrite a binding it never saw.
	*/
	mergeGoalsKeepingHostSessions(target, current) {
		const merged = { ...current };
		for (const [goalId, value] of Object.entries(target)) {
			const prior = current[goalId];
			merged[goalId] = prior !== void 0 && (prior.agentSessions?.length ?? 0) > 0 ? {
				...value,
				agentSessions: prior.agentSessions
			} : value;
		}
		return merged;
	}
	/** Mark any prior run of the same graph that never reached a terminal state, so a host restart cannot leave zombies. */
	async supersedePriorRunningRuns(graphId, nextRunId) {
		const runs = await this.repository.listRuns();
		for (const prior of runs) {
			if (prior.graphId !== graphId || prior.state !== "running" || prior.runId === nextRunId) continue;
			await this.repository.updateRun(prior.runId, (current) => ({
				...current,
				state: "cancelled",
				rootState: "cancelled",
				runtimeWarning: `superseded by run ${nextRunId} (host restart or previous run was interrupted)`,
				updatedAt: this.now().toISOString()
			}));
		}
	}
	async status(runId) {
		return this.repository.loadRun(runId);
	}
	async assertAgentCanDelegate(options) {
		const runId = requireContextId(options.runId, "runId");
		const goalId = requireContextId(options.goalId, "goalId");
		const parentSessionId = requireContextId(options.parentSessionId, "delegating Agent sessionId");
		const run = await this.repository.loadRun(runId);
		if (run.goals[goalId] === void 0) throw new Error(`run ${runId} has no goal ${goalId}`);
		const ownerSessionId = run.invocation?.agentSessionId;
		if (ownerSessionId === void 0) throw new Error(`run ${runId} has no trusted invocation Agent session`);
		const knownSessions = /* @__PURE__ */ new Set([ownerSessionId]);
		for (const goal of Object.values(run.goals)) for (const linked of goal.agentSessions ?? []) knownSessions.add(linked.sessionId);
		if (!knownSessions.has(parentSessionId)) throw new Error(`Agent session ${parentSessionId} is not rooted in run ${runId}`);
	}
	async bindAgent(options, policy = {}) {
		const runId = requireContextId(options.runId, "runId");
		const goalId = requireContextId(options.goalId, "goalId");
		const sessionId = requireContextId(options.sessionId, "agent sessionId");
		const parentSessionId = options.parentSessionId === void 0 ? void 0 : requireContextId(options.parentSessionId, "agent parentSessionId");
		if (!GOAL_AGENT_ROLES.has(options.role)) throw new Error(`unsupported goal Agent role ${String(options.role)}`);
		const boundAt = this.now().toISOString();
		let agent;
		const run = await this.repository.updateRun(runId, (current) => {
			const result = current.goals[goalId];
			if (result === void 0) throw new Error(`run ${runId} has no goal ${goalId}`);
			const ownerSessionId = current.invocation?.agentSessionId;
			if (ownerSessionId === void 0) throw new Error(`run ${runId} has no trusted invocation Agent session`);
			const knownSessions = /* @__PURE__ */ new Set([ownerSessionId]);
			for (const goal of Object.values(current.goals)) for (const linked of goal.agentSessions ?? []) knownSessions.add(linked.sessionId);
			if (sessionId !== ownerSessionId && (parentSessionId === void 0 || !knownSessions.has(parentSessionId))) {
				if (policy.allowUnrooted === true && parentSessionId === void 0) {} else throw new Error(`Agent session ${sessionId} is not rooted in run ${runId}`);
			}
			agent = {
				sessionId,
				...parentSessionId === void 0 ? {} : { parentSessionId },
				role: options.role,
				boundAt
			};
			const agentSessions = [...(result.agentSessions ?? []).filter((linked) => linked.sessionId !== sessionId), agent];
			return {
				...current,
				goals: {
					...current.goals,
					[goalId]: {
						...result,
						agentSessions
					}
				},
				updatedAt: boundAt
			};
		});
		if (agent === void 0) throw new Error(`run ${runId} Agent binding did not commit`);
		return {
			run,
			agent
		};
	}
	parse(value) {
		return parseGraph(value, {
			maxGraphNodes: this.config.maxGraphNodes,
			maxExpressionNodes: this.config.maxExpressionNodes,
			maxExpressionDepth: this.config.maxExpressionDepth
		});
	}
	validateWorkspaceRefs(graph) {
		for (const [goalId, node] of Object.entries(graph.nodes)) {
			if (node.verifier === void 0) {
				if (node.kind === "leaf") throw new Error(`goal ${goalId} is a leaf but declares no verifier`);
				continue;
			}
			requireTarget(node.target, goalId);
			if (node.verifier.mode === "programmatic" && node.verifier.script.length === 0) throw new Error(`goal ${goalId} programmatic verifier requires a script`);
			if (node.verifier.mode === "agentic" && node.verifier.instruction.length === 0) throw new Error(`goal ${goalId} agentic verifier requires an instruction`);
		}
	}
};
/** SPEC §4 programmatic-subtree rule: every composite must have at least one non-programmatic descendant. */
function validateHostConfig(config) {
	if (config.maxGraphNodes < 1 || !Number.isInteger(config.maxGraphNodes)) throw new Error("maxGraphNodes must be a positive integer");
	if (config.maxExpressionNodes < 1 || !Number.isInteger(config.maxExpressionNodes)) throw new Error("maxExpressionNodes must be a positive integer");
	if (config.maxExpressionDepth < 1 || !Number.isInteger(config.maxExpressionDepth)) throw new Error("maxExpressionDepth must be a positive integer");
	if (config.maxSandboxBytes < 1 || !Number.isInteger(config.maxSandboxBytes)) throw new Error("maxSandboxBytes must be a positive integer");
	if (config.maxConcurrentVerifications < 1 || !Number.isInteger(config.maxConcurrentVerifications)) throw new Error("maxConcurrentVerifications must be a positive integer");
	if (config.revalidateThreshold < 0 || config.revalidateThreshold > 1 || !Number.isFinite(config.revalidateThreshold)) throw new Error("revalidateThreshold must be a ratio in [0, 1]");
	if (config.gmDigestAlgo.length === 0) throw new Error("gmDigestAlgo must not be empty");
	if (config.storageDirectory.length === 0 || isAbsolute(config.storageDirectory) || hasTraversal(config.storageDirectory)) throw new Error("storageDirectory must be a non-empty relative path without traversal");
	if (!isAbsolute(config.workspaceRoot)) throw new Error(`workspaceRoot must be absolute`);
}
function requireContextId(value, label) {
	if (value.length === 0 || value.length > 512) throw new Error(`${label} must contain 1-512 characters`);
	return value;
}
function requireTarget(target, goalId) {
	if (typeof target !== "string" || target.length === 0) throw new Error(`goal ${goalId} must declare a target`);
	if (isAbsolute(target)) throw new Error(`goal ${goalId} target must be workspace-relative (absolute given)`);
	return target;
}
function computeJudgment(verifier, scriptsDirectory) {
	if (verifier.mode === "programmatic") {
		const scriptDigest = readScriptDigest(resolveScriptPath(scriptsDirectory, verifier.script));
		return {
			mode: "programmatic",
			script: verifier.script,
			scriptDigest
		};
	}
	return {
		mode: "agentic",
		instructionHash: `sha256:${sha256Json({ instruction: verifier.instruction })}`
	};
}
/** Inheritance anchor: the captured object plus the judgment identity. */
function anchorOfPlan(plan) {
	if (plan.input === void 0 || !plan.input.exists) return void 0;
	return sha256Json({
		object: plan.input.digest,
		judgment: plan.judgment
	});
}
function resolveScriptPath(scriptsDirectory, script) {
	const direct = join(scriptsDirectory, script);
	if (existsSync(direct)) return direct;
	if (!script.endsWith(".js")) {
		const withJs = `${direct}.js`;
		if (existsSync(withJs)) return withJs;
	}
	throw new ScriptExecutionError("SCRIPT_NOT_FOUND", `programmatic script not found in library: ${direct}`, { script: direct });
}
function readScriptDigest(scriptPath) {
	try {
		return `sha256:${createHash("sha256").update(readFileSync(scriptPath)).digest("hex")}`;
	} catch {
		throw new Error(`programmatic script not found in library: ${scriptPath}`);
	}
}
async function prepareInputPath(plan, workspace, repository) {
	if (plan.input === void 0) return workspace.path;
	return repository.copyCapturedInput(plan.input, workspace.path);
}
function graphWarnings(graph) {
	const warnings = [];
	for (const [goalId, node] of Object.entries(graph.nodes)) {
		if (goalId === graph.root) continue;
		if (node.constraint === "soft") warnings.push(`goal ${goalId} is soft; v0.2 records this but has no soft-score model`);
	}
	return warnings;
}
function messageOf(error) {
	return error instanceof Error ? error.message : String(error);
}
function boundedMessage(message) {
	return message.length > 512 ? message.slice(0, 512) : message;
}
function postorder(input) {
	const children = /* @__PURE__ */ new Map();
	for (const edge of input.contains) {
		const list = children.get(edge.parent) ?? [];
		list.push(edge.child);
		children.set(edge.parent, list);
	}
	const visited = /* @__PURE__ */ new Set();
	const order = [];
	const visit = (id) => {
		if (visited.has(id)) return;
		visited.add(id);
		for (const child of children.get(id) ?? []) visit(child);
		order.push(id);
	};
	visit(input.root);
	return order;
}
function dependenciesBySource(input) {
	const map = /* @__PURE__ */ new Map();
	for (const edge of input.dependsOn) {
		const list = map.get(edge.source) ?? [];
		list.push(edge.target);
		map.set(edge.source, list);
	}
	return map;
}
function childrenByParent(input) {
	const map = /* @__PURE__ */ new Map();
	for (const edge of input.contains) {
		const list = map.get(edge.parent) ?? [];
		list.push(edge.child);
		map.set(edge.parent, list);
	}
	return map;
}
function relationsByParent(input) {
	const map = /* @__PURE__ */ new Map();
	for (const edge of input.contains) {
		const list = map.get(edge.parent) ?? [];
		list.push(edge);
		map.set(edge.parent, list);
	}
	return map;
}
function relationTruth(edge, goals) {
	const state = goals[edge.child]?.state;
	const inheritedVerification = state === "inherited" ? goals[edge.child]?.verification?.passed : void 0;
	if (state === "success" || state === "inherited" && inheritedVerification === true || state === "partial") return true;
	if (state === "failure" || state === "blocked" || state === "inherited" && inheritedVerification === false) {
		if (edge.failure === "degrade" && edge.degradeTo !== void 0) {
			const substitute = goals[edge.degradeTo]?.state;
			if (substitute === "success") return true;
			if (substitute === "inherited") {
				const substitutePassed = goals[edge.degradeTo]?.verification?.passed;
				if (substitutePassed === true) return true;
				if (substitutePassed === null || substitutePassed === void 0) return void 0;
			}
			if (substitute === "needs_human" || substitute === "invalidated") return void 0;
		}
		return false;
	}
}
function relationTruthValues(edges, goals) {
	const values = /* @__PURE__ */ new Map();
	for (const edge of edges) values.set(edge.child, relationTruth(edge, goals));
	return values;
}
function relationNeedsHuman(edge, goals) {
	const childState = goals[edge.child]?.state;
	if (childState === "needs_human" || childState === "invalidated") return true;
	if (childState === "inherited" && goals[edge.child]?.verification?.passed === null) return true;
	if (edge.failure === "degrade" && edge.degradeTo !== void 0) {
		const substitute = goals[edge.degradeTo]?.state;
		return substitute === "needs_human" || substitute === "invalidated" || substitute === "inherited" && goals[edge.degradeTo]?.verification?.passed === null;
	}
	return false;
}
function dependencyNeedsHuman(result) {
	return result?.state === "needs_human" || result?.state === "invalidated" || result?.state === "inherited" && result.verification?.passed === null;
}
/**
* A dependency is satisfied for scheduling once its target has reached a
* terminal state — success, failure, needs_human, cancelled, invalidated,
* partial, or an inherited verdict. This is a *completion* gate, not a
* success gate: the waiter is released to run its own judgment even when the
* dependency failed (its verdict is independent evidence).
*/
function dependencyComplete(result) {
	const state = result?.state;
	if (state === "success" || state === "failure" || state === "needs_human" || state === "cancelled" || state === "invalidated" || state === "partial" || state === "inherited") return true;
	return false;
}
function terminalState(rootResult, allowPartialRoot) {
	if (rootResult?.state === "success" || rootResult?.state === "inherited") return "success";
	if (rootResult?.state === "partial" && allowPartialRoot) return "partial_success";
	if (rootResult?.state === "needs_human") return "needs_replan";
	return "failure";
}
function deepFreeze(value) {
	if (value === null || typeof value !== "object") return value;
	Object.freeze(value);
	for (const item of Object.values(value)) deepFreeze(item);
	return value;
}
function hasTraversal(value) {
	return value.split(/[\\/]/u).some((segment) => segment === ".." || segment === ".");
}
//#endregion
export { DogRepository as a, parseGraph as c, isJsonValue as d, ScriptExecutionError as f, runPlan as i, evaluateBoolExpr as l, runOwnedScript as m, resolveScriptPath as n, loadSchemaSet as o, outputPreview as p, WorkspaceManager as r, DogValidationError as s, DogEngine as t, parseBoolExpr as u };
