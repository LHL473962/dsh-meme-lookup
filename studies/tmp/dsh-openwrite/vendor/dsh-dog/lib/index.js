import { a as DogRepository, c as parseGraph, d as isJsonValue, f as ScriptExecutionError, i as runPlan, l as evaluateBoolExpr, m as runOwnedScript, n as resolveScriptPath, o as loadSchemaSet, p as outputPreview, r as WorkspaceManager, s as DogValidationError, t as DogEngine, u as parseBoolExpr } from "./core--byUPJL8.js";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";
import { isAbsolute, join, resolve } from "node:path";
import z from "@deepseek-ai/schemastery";
//#region src/script-verdict.ts
function scriptFailureVerdict(error) {
	const message = error instanceof Error ? error.message : String(error);
	return {
		state: "inconclusive",
		reason: message,
		evidence: error instanceof ScriptExecutionError ? {
			code: error.code,
			error: message,
			...error.diagnostics
		} : {
			code: "SCRIPT_EXECUTION_FAILED",
			error: message
		}
	};
}
function parseVerdict(out) {
	let value;
	try {
		value = JSON.parse(out);
	} catch {
		return {
			state: "inconclusive",
			evidence: {
				code: "SCRIPT_OUTPUT_NOT_JSON",
				parseError: "script output was not JSON",
				outputPreview: outputPreview(out)
			},
			reason: "script output was not JSON"
		};
	}
	if (value === null || typeof value !== "object" || Array.isArray(value)) return {
		state: "inconclusive",
		evidence: {
			code: "SCRIPT_OUTPUT_INVALID",
			parseError: "script output was not an object",
			outputPreview: outputPreview(out)
		},
		reason: "script output was not an object"
	};
	const record = value;
	const verdict = record.verdict;
	if (verdict !== "pass" && verdict !== "fail" && verdict !== "inconclusive") return {
		state: "inconclusive",
		evidence: {
			code: "SCRIPT_OUTPUT_INVALID",
			parseError: "invalid verdict",
			outputPreview: outputPreview(out)
		},
		reason: "script returned an invalid verdict"
	};
	return {
		state: verdict,
		evidence: isJsonValue(record.evidence) ? record.evidence : { outcome: "no evidence supplied by script" }
	};
}
//#endregion
//#region src/host-shims.ts
/**
* Self-contained replacements for the two host packages this plugin used to
* import at runtime: `@deepseek-ai/dsh-home-paths` (`dshHomePath`) and
* `@deepseek-ai/dsh-tools` (`defineTool`). Both were declared as
* peerDependencies, and under the DSH profile install layout (pnpm isolated
* node_modules) peer instances are not resolvable from this vendored
* directory, so every entry import failed with ERR_MODULE_NOT_FOUND and the
* plugin never activated (GitHub issue #74). The implementations below match
* the host behavior for the schema subset this plugin declares; type-only
* imports from the host packages are still used and erased at build time.
*/
/** Directory name for the default DeepSeek Harness home under the OS home. */
const DSH_HOME_DIR_NAME = ".dsh";
/** Environment variable that overrides the default DeepSeek Harness home. */
const DSH_HOME_ENV = "DSH_HOME";
/** Expand supported tilde prefixes against the operating-system home. */
function expandHomePath(path) {
	if (path === "~") return homedir();
	if (path.startsWith("~/") || path.startsWith("~\\")) return join(homedir(), path.slice(2));
	return path;
}
/**
* Resolve the single-root DeepSeek Harness home: `$DSH_HOME` when set to a
* non-blank value, otherwise `~/.dsh`. Mirrors the host `resolveDshHome`.
*/
function resolveDshHome() {
	const fromEnv = process.env[DSH_HOME_ENV];
	return resolve(expandHomePath(fromEnv !== void 0 && fromEnv.trim().length > 0 ? fromEnv : join(homedir(), DSH_HOME_DIR_NAME)));
}
/** Join path segments onto the resolved DeepSeek Harness home. */
function dshHomePath(...segments) {
	return join(resolveDshHome(), ...segments);
}
/** Thrown when model-generated arguments violate the compiled schema. */
var ToolArgsError = class extends Error {
	violations;
	constructor(violations) {
		super(`invalid arguments: ${violations.join("; ")}`);
		this.name = "ToolArgsError";
		this.violations = violations;
	}
};
/** Compile one author-facing value schema node to raw JSON Schema. */
function compileValueSchema(spec, path) {
	if (spec === null || typeof spec !== "object") throw new Error(`${path}: schema node must be an object`);
	const node = {};
	if (spec.description !== void 0) node.description = spec.description;
	switch (spec.type) {
		case "json": return node;
		case "string":
		case "number":
		case "integer":
		case "boolean":
		case "null":
			node.type = spec.type;
			if ("enum" in spec && spec.enum !== void 0) node.enum = [...spec.enum];
			if ("const" in spec && spec.const !== void 0) node.const = spec.const;
			return node;
		case "array":
			node.type = "array";
			if (spec.items !== void 0) node.items = compileValueSchema(spec.items, `${path}.items`);
			return node;
		case "object":
			node.type = "object";
			if (spec.additionalProperties !== void 0) node.additionalProperties = spec.additionalProperties;
			if (spec.properties !== void 0) {
				const { properties, required } = compilePropertyMap(spec.properties, `${path}.properties`);
				node.properties = properties;
				if (required.length > 0) node.required = required;
			}
			return node;
		default: throw new Error(`${path}.type must be string/number/integer/boolean/null/array/object/json`);
	}
}
/** Compile a property map, hoisting per-property `required` flags onto the parent. */
function compilePropertyMap(input, path) {
	const properties = {};
	const required = [];
	for (const [key, property] of Object.entries(input)) {
		const { required: isRequired, ...spec } = property;
		properties[key] = compileValueSchema(spec, `${path}.${key}`);
		if (isRequired === true) required.push(key);
	}
	return {
		properties,
		required
	};
}
/** Compile the implicit open parameter object into raw JSON Schema. */
function compileParameters(spec) {
	const { properties, required } = compilePropertyMap(spec, "parameters");
	const schema = {
		type: "object",
		properties
	};
	if (required.length > 0) schema.required = required;
	return schema;
}
/** Validate one JSON value against the compiled subset, collecting violations. */
function validateValue(schema, value, path, violations) {
	const at = path === "" ? "arguments" : path;
	if (schema.const !== void 0 && value !== schema.const) {
		violations.push(`${at}: must equal ${JSON.stringify(schema.const)}`);
		return;
	}
	if (Array.isArray(schema.enum) && !schema.enum.some((entry) => entry === value)) {
		violations.push(`${at}: must be one of ${JSON.stringify(schema.enum)}`);
		return;
	}
	switch (schema.type) {
		case void 0: return;
		case "null":
			if (value !== null) violations.push(`${at}: expected null`);
			return;
		case "boolean":
			if (typeof value !== "boolean") violations.push(`${at}: expected boolean, got ${describe(value)}`);
			return;
		case "string":
			if (typeof value !== "string") violations.push(`${at}: expected string, got ${describe(value)}`);
			return;
		case "number":
			if (typeof value !== "number" || !Number.isFinite(value)) violations.push(`${at}: expected number, got ${describe(value)}`);
			return;
		case "integer":
			if (typeof value !== "number" || !Number.isInteger(value)) violations.push(`${at}: expected integer, got ${describe(value)}`);
			return;
		case "array": {
			if (!Array.isArray(value)) {
				violations.push(`${at}: expected array, got ${describe(value)}`);
				return;
			}
			const items = schema.items;
			if (items !== void 0) value.forEach((item, index) => validateValue(items, item, `${at}[${index}]`, violations));
			return;
		}
		case "object": {
			if (value === null || typeof value !== "object" || Array.isArray(value)) {
				violations.push(`${at}: expected object, got ${describe(value)}`);
				return;
			}
			const record = value;
			for (const key of schema.required ?? []) if (!Object.hasOwn(record, key)) violations.push(`${at}: missing required property "${key}"`);
			const properties = schema.properties;
			if (properties !== void 0) {
				for (const [key, propertySchema] of Object.entries(properties)) if (Object.hasOwn(record, key)) validateValue(propertySchema, record[key], `${at}.${key}`, violations);
			}
			return;
		}
	}
}
function describe(value) {
	if (value === null) return "null";
	if (Array.isArray(value)) return "array";
	return typeof value;
}
/** Validate model-generated arguments against the compiled parameter schema. */
function validateArgs(parameters, args) {
	const violations = [];
	validateValue(parameters, args, "", violations);
	return violations;
}
/**
* Define a first-party tool with strict execution validation, matching the
* host `defineTool` contract: arguments are validated before `execute`, and
* replay presenters validate softly and fall back to generic rendering.
*/
function defineTool(options) {
	const userExecute = options.execute;
	const userRender = options.output.render;
	const userPresentationMeta = options.output.presentationMeta;
	const userIsConcurrencySafe = options.isConcurrencySafe;
	if (options.timeoutMs !== void 0 && (!Number.isFinite(options.timeoutMs) || options.timeoutMs <= 0)) throw new Error(`defineTool(${options.name}): timeoutMs must be a positive finite number`);
	const parameters = compileParameters(options.parameters);
	const outputSchema = compileValueSchema(options.output.schema, "schema");
	const validate = (args) => validateArgs(parameters, args);
	const tool = {
		name: options.name,
		description: options.description,
		parameters,
		output: {
			schema: outputSchema,
			render: (args, value) => userRender(args, value),
			...userPresentationMeta !== void 0 ? { presentationMeta: (args, value) => userPresentationMeta(args, value) } : {}
		},
		...options.timeoutMs !== void 0 ? { timeoutMs: options.timeoutMs } : {},
		async execute(args, exec) {
			const violations = validate(args);
			if (violations.length > 0) throw new ToolArgsError(violations);
			return userExecute(args, exec);
		}
	};
	if (userIsConcurrencySafe) tool.isConcurrencySafe = (args) => {
		if (validate(args).length > 0) return false;
		return userIsConcurrencySafe(args);
	};
	return tool;
}
//#endregion
//#region src/debug-contract.ts
/**
* Dedicated debugger channel. It is served by this plugin directly on the Web
* carrier (see serveDogDebugRpc): Connection's generic channel registry mounts
* its HTTP route through the Connection plugin's own context, which only sees
* `webServer` when a bundle patch injects it into the shared connection row —
* and per-key patch semantics make any such patch clobber other bundles
* (OpenWrite issue #81), while the shared `/api` channel already belongs to
* the host's Typert gateway. The wire envelope mirrors Connection's, so the
* browser side keeps using its stock `connection.rpc.call`.
*/
const DOG_DEBUG_RPC_CHANNEL = "/dog-rpc";
const DOG_DEBUG_SNAPSHOT_ENDPOINT = "snapshot";
const DOG_RUNTIME_TRACE_ENDPOINT = "goal-runtime";
//#endregion
//#region src/debug.ts
const MAX_RUNTIME_EVENTS_PER_GOAL = 64;
/** Build a digest-safe view: an old run is never shown against a newer graph revision. */
async function buildDogDebugSnapshot(repository, now = () => /* @__PURE__ */ new Date()) {
	const [allGraphs, runs] = await Promise.all([repository.listGraphs(), repository.listRuns()]);
	const graphs = allGraphs.filter((graph) => graph.input.schemaVersion === "0.9");
	const graphIds = [...new Set(graphs.map((graph) => graph.input.id))];
	const settled = await Promise.allSettled(graphIds.map((id) => repository.loadGraph(id)));
	const currentDigests = new Set(settled.filter((result) => result.status === "fulfilled").map((result) => result.value.graphDigest));
	const revisions = graphs.map((graph) => ({
		graph,
		current: currentDigests.has(graph.graphDigest),
		runs: runs.filter((run) => run.graphDigest === graph.graphDigest)
	})).sort(compareRevisions);
	return {
		schemaVersion: "0.1",
		generatedAt: now().toISOString(),
		graphs: revisions
	};
}
/** Build one bounded node trace without loading any DSH transcript or artifact bytes. */
async function buildGoalRuntimeTrace(repository, runId, goalId) {
	const run = await repository.loadRun(runId);
	const result = run.goals[goalId];
	if (result === void 0) throw new Error(`run ${runId} has no goal ${goalId}`);
	const matching = [...await repository.loadGoalRuntimeEvents(runId, goalId)];
	const truncated = matching.length > MAX_RUNTIME_EVENTS_PER_GOAL;
	return {
		schemaVersion: "0.1",
		runId: run.runId,
		graphId: run.graphId,
		graphDigest: run.graphDigest,
		runState: run.state,
		...run.rootState === void 0 ? {} : { rootState: run.rootState },
		goalId,
		result,
		...run.invocation === void 0 ? {} : { invocation: run.invocation },
		...run.runtimeWarning === void 0 ? {} : { runtimeWarning: boundedMessage(run.runtimeWarning) },
		events: truncated ? matching.slice(-64) : matching,
		truncated
	};
}
/** Register this handler on the trusted-host Connection channel, never as an unauthenticated raw HTTP route. */
function createDogDebugRpcHandler(repository) {
	return async (endpoint, payload, signal) => {
		try {
			signal.throwIfAborted();
			if (endpoint === "snapshot") {
				requireEmptyPayload(payload);
				return {
					ok: true,
					value: await buildDogDebugSnapshot(repository)
				};
			}
			if (endpoint === "goal-runtime") {
				const request = parseGoalRuntimeRequest(payload);
				return {
					ok: true,
					value: await buildGoalRuntimeTrace(repository, request.runId, request.goalId)
				};
			}
			return internalError(`unknown DoG debugger endpoint ${endpoint}`);
		} catch (error) {
			if (signal.aborted) return {
				ok: false,
				error: {
					code: "cancelled",
					message: "DoG debugger request cancelled",
					details: {}
				}
			};
			return internalError(messageOf(error));
		}
	};
}
const DOG_DEBUG_BODY_LIMIT = 8388608;
const ENDPOINT_SEGMENT = /^[A-Za-z0-9_$.-]+$/;
/**
* Serve the debugger RPC channel directly on the Web carrier. Connection's
* generic channel registry (`rpc.handle`) mounts its HTTP route through the
* Connection plugin's own context, which only sees `webServer` when a bundle
* patch injects it into the shared connection row — and per-key patch
* semantics make any such patch clobber other bundles (OpenWrite issue #81);
* the shared `/api` channel is already claimed by the host's Typert gateway.
* The wire envelope mirrors Connection's (`client-request`/`server-response`)
* so the browser side keeps using its stock `connection.rpc.call`; admission
* at the route reuses Connection's trusted-host fence and browser
* authentication, so the channel stays exactly as protected as a native one.
*/
async function serveDogDebugRpc(req, res, handler) {
	const respond = (status, body) => {
		res.writeHead(status, { "content-type": "application/json" });
		res.end(typeof body === "string" ? body : JSON.stringify(body));
	};
	const endpoint = dogDebugEndpointOf(req.url ?? "");
	if (endpoint === void 0 || req.method !== "POST") {
		respond(404, "not found");
		return;
	}
	if (((req.headers["content-type"] ?? "").split(";", 1)[0] ?? "").trim().toLowerCase() !== "application/json") {
		respond(415, "content type must be application/json");
		return;
	}
	let raw = "";
	let size = 0;
	for await (const chunk of req) {
		size += chunk.length;
		if (size > DOG_DEBUG_BODY_LIMIT) {
			respond(413, "request too large");
			return;
		}
		raw += chunk;
	}
	let body;
	try {
		body = JSON.parse(raw);
	} catch {
		respond(400, "body is not JSON");
		return;
	}
	const rpcId = typeof body?.rpcId === "string" ? body.rpcId : "invalid-request";
	if (body?.type !== "client-request" || body.method !== endpoint) {
		respond(200, {
			type: "server-response",
			rpcId,
			result: {
				ok: false,
				error: {
					code: "gateway/bad-request",
					message: "invalid client-request message",
					details: {}
				}
			}
		});
		return;
	}
	const controller = new AbortController();
	req.on("close", () => controller.abort());
	try {
		respond(200, {
			type: "server-response",
			rpcId,
			result: await handler(endpoint, body.payload, controller.signal)
		});
	} catch (error) {
		respond(500, `handler failure: ${String(error)}`);
	}
}
function dogDebugEndpointOf(url) {
	const pathname = url.split("?", 1)[0] ?? "";
	if (!pathname.startsWith(`/dog-rpc/`)) return void 0;
	const endpoint = pathname.slice(9);
	if (endpoint.split("/").some((segment) => segment === "" || segment === "." || segment === ".." || !ENDPOINT_SEGMENT.test(segment))) return void 0;
	return endpoint;
}
function compareRevisions(left, right) {
	if (left.current !== right.current) return left.current ? -1 : 1;
	const leftUpdated = left.runs[0]?.updatedAt ?? "";
	const byActivity = (right.runs[0]?.updatedAt ?? "").localeCompare(leftUpdated);
	if (byActivity !== 0) return byActivity;
	const byId = left.graph.input.id.localeCompare(right.graph.input.id);
	return byId === 0 ? left.graph.graphDigest.localeCompare(right.graph.graphDigest) : byId;
}
function requireEmptyPayload(value) {
	if (value === null || typeof value !== "object" || Array.isArray(value) || Object.keys(value).length !== 0) throw new Error("DoG snapshot request payload must be an empty object");
}
function parseGoalRuntimeRequest(value) {
	if (value === null || typeof value !== "object" || Array.isArray(value)) throw new Error("DoG runtime request payload must be an object");
	const record = Object.fromEntries(Object.entries(value));
	if (Object.keys(record).length !== 2) throw new Error("DoG runtime request requires exactly runId and goalId");
	return {
		runId: requireBoundedId(record.runId, "runId"),
		goalId: requireBoundedId(record.goalId, "goalId")
	};
}
function requireBoundedId(value, label) {
	if (typeof value !== "string" || value.length === 0 || value.length > 512) throw new Error(`${label} must contain 1-512 characters`);
	return value;
}
function internalError(message) {
	return {
		ok: false,
		error: {
			code: "internal",
			message: boundedMessage(message),
			details: {}
		}
	};
}
function boundedMessage(value) {
	const normalized = value.length === 0 ? "DoG debugger request failed" : value;
	return normalized.length <= 512 ? normalized : `${normalized.slice(0, 509)}...`;
}
function messageOf(error) {
	return error instanceof Error ? error.message : String(error);
}
//#endregion
//#region src/tools.ts
/** Model-facing DoG tools over the verification-first engine. */
const DOG_VALIDATE_TOOL = "dog_validate";
const DOG_CREATE_TOOL = "dog_create";
const DOG_RUN_TOOL = "dog_run";
const DOG_BIND_AGENT_TOOL = "dog_bind_agent";
const DOG_DELEGATE_AGENT_TOOL = "dog_delegate_agent";
const DOG_STATUS_TOOL = "dog_status";
const DOG_CANCEL_TOOL = "dog_cancel";
const DOG_WAIT_TOOL = "dog_wait";
const JSON_OUTPUT = {
	schema: { type: "json" },
	render: (_args, value) => [{
		type: "text",
		text: JSON.stringify(value, null, 2)
	}]
};
/** Build the complete DoG v0.1 tool surface around one engine instance. */
function createDogTools(engine, hostJobs = () => void 0) {
	return [
		defineTool({
			name: DOG_VALIDATE_TOOL,
			description: "Statically validate a DoG v0.2 graph. This does not write files, capture sandbox files, or run goals.",
			parameters: { graph: {
				type: "json",
				required: true,
				description: "Complete JSON DoG graph using schemaVersion 0.2."
			} },
			output: JSON_OUTPUT,
			isConcurrencySafe: () => true,
			execute: async (args, exec) => {
				exec.signal.throwIfAborted();
				return jsonResult(engine().validate(args.graph));
			}
		}),
		defineTool({
			name: DOG_CREATE_TOOL,
			description: "Compile and persist a valid DoG v0.2 graph, capturing verifier input files from the configured sandbox as immutable bytes.",
			parameters: { graph: {
				type: "json",
				required: true,
				description: "Complete JSON DoG graph using schemaVersion 0.2."
			} },
			output: JSON_OUTPUT,
			async execute(args, exec) {
				exec.signal.throwIfAborted();
				const cwd = exec.agent?.session.header.cwd;
				const compiled = await engine().create(args.graph, typeof cwd === "string" && cwd.length > 0 ? { captureBaseDir: cwd } : {});
				exec.signal.throwIfAborted();
				return jsonResult(compiledGraphSummary(compiled));
			}
		}),
		defineTool({
			name: DOG_RUN_TOOL,
			description: "Run trusted atomic verification for the latest persisted revision of a graph and recompute its root result.",
			parameters: { graphId: {
				type: "string",
				required: true,
				description: "Graph ID previously persisted by dog_create."
			} },
			output: JSON_OUTPUT,
			async execute(args, exec) {
				exec.signal.throwIfAborted();
				const run = await engine().startRun(args.graphId, {
					invocation: {
						callId: String(exec.callId),
						...exec.agent === void 0 ? {} : { agentSessionId: String(exec.agent.id) },
						...exec.agent?.session.header.parentSession === void 0 ? {} : { parentSessionId: String(exec.agent.session.header.parentSession) }
					},
					...exec.agent === void 0 ? {} : { agent: exec.agent }
				});
				exec.signal.throwIfAborted();
				return jsonResult(Object.assign({}, runSummary(run), { note: "verification runs in the background; agentic leaves spawn verifier Agents that live in THIS process. If this is a one-shot launch (e.g. dsh --profile headless), the process exits after answering and verifier workers are interrupted: background agentic verification requires a resident host process. Poll with dog_status." }));
			}
		}),
		defineTool({
			name: DOG_BIND_AGENT_TOOL,
			description: "Bind the current trusted DSH Agent session to one goal in an existing DoG run. Use dog_delegate_agent instead when creating a new worker that must remain directly interactive after its first turn. Session identity is captured from the tool execution context and cannot be supplied by the model.",
			parameters: {
				runId: {
					type: "string",
					required: true,
					description: "Run ID returned by dog_run."
				},
				goalId: {
					type: "string",
					required: true,
					description: "Goal ID this Agent is working on or verifying."
				},
				role: {
					type: "string",
					required: true,
					enum: [
						"orchestrator",
						"verifier",
						"reviewer"
					],
					description: "The Agent role for this goal."
				}
			},
			output: JSON_OUTPUT,
			isConcurrencySafe: () => true,
			async execute(args, exec) {
				exec.signal.throwIfAborted();
				if (exec.agent === void 0) throw new Error("dog_bind_agent requires a trusted DSH Agent execution context");
				const binding = await engine().bindAgent({
					runId: args.runId,
					goalId: args.goalId,
					role: args.role,
					sessionId: String(exec.agent.id),
					...exec.agent.session.header.parentSession === void 0 ? {} : { parentSessionId: String(exec.agent.session.header.parentSession) }
				});
				exec.signal.throwIfAborted();
				return jsonResult({
					runId: binding.run.runId,
					goalId: args.goalId,
					agent: binding.agent
				});
			}
		}),
		defineTool({
			name: DOG_STATUS_TOOL,
			description: "Read the bounded persisted status and verifier evidence for one DoG run.",
			parameters: { runId: {
				type: "string",
				required: true,
				description: "Run ID returned by dog_run."
			} },
			output: JSON_OUTPUT,
			isConcurrencySafe: () => true,
			async execute(args, exec) {
				exec.signal.throwIfAborted();
				const run = await engine().status(args.runId);
				exec.signal.throwIfAborted();
				return jsonResult(runSummary(run));
			}
		}),
		defineTool({
			name: DOG_WAIT_TOOL,
			description: "Wait for one DoG run to settle. Preferred path: when the host job service is available this registers a background \"dog\" job (returns instantly with jobId) and the harness notifies you automatically when the run completes — inspect with job_output, cancel with job_kill. Fallback (no job service, e.g. a bare one-shot process): returns the current state instantly and you must call dog_wait repeatedly until the state is terminal; each poll keeps the calling session and process alive, which protects the verifier workers the run spawned. Always wait until the returned state is terminal before summarizing — finishing early releases the workers. Same report shape as dog_status.",
			parameters: {
				runId: {
					type: "string",
					required: true,
					description: "Run ID returned by dog_run."
				},
				timeout: {
					type: "number",
					description: "Advisory total wait budget in seconds; not enforced (each call returns instantly)."
				}
			},
			output: JSON_OUTPUT,
			isConcurrencySafe: () => true,
			async execute(args, exec) {
				exec.signal.throwIfAborted();
				const run = await engine().status(args.runId);
				exec.signal.throwIfAborted();
				const jobs = hostJobs();
				if (jobs !== void 0 && run.state === "running") {
					const controller = new AbortController();
					const done = engine().waitRun(args.runId, {
						signal: controller.signal,
						timeoutMs: 72e5
					}).then((settled) => ({
						status: "completed",
						output: JSON.stringify(runSummary(settled))
					})).catch((error) => ({
						status: controller.signal.aborted ? "killed" : "failed",
						detail: String(error instanceof Error ? error.message : error).slice(0, 200)
					}));
					const jobId = jobs.start({
						kind: "dog",
						label: `DoG wait ${String(args.runId).slice(0, 8)}`,
						...exec.agent === void 0 ? {} : { owner: exec.agent },
						run: () => ({
							cancel: (reason) => {
								controller.abort(new Error(reason ?? "cancelled"));
							},
							done
						})
					});
					return jsonResult({
						runId: run.runId,
						graphId: run.graphId,
						state: run.state,
						jobId,
						note: "background wait job registered; the harness will notify you when the run completes (that is the wait). NEVER call job_output with wait:true — a long wait gets interrupted by background notices and that interruption is expected; if an unofficial job_output result comes back interrupted, just keep your current turn alive or reply with another dog_wait."
					});
				}
				return jsonResult(Object.assign({}, runSummary(run), { ...run.state === "running" ? { note: "instant poll: the run is still running (this call returned immediately and cannot be interrupted). Call dog_wait again, repeatedly, until the state is terminal." } : {} }));
			}
		}),
		defineTool({
			name: DOG_CANCEL_TOOL,
			description: "Cancel one running DoG run and its verifier workers; partial records remain inspectable.",
			parameters: {
				runId: {
					type: "string",
					required: true,
					description: "Run ID returned by dog_run."
				},
				reason: {
					type: "string",
					description: "Bounded human-readable cancellation reason."
				}
			},
			output: JSON_OUTPUT,
			isConcurrencySafe: () => true,
			async execute(args, exec) {
				exec.signal.throwIfAborted();
				const runId = args.runId;
				const reason = typeof args.reason === "string" && args.reason.length > 0 ? args.reason : "cancelled by operator";
				const cancelled = await engine().cancelRun(runId, reason);
				exec.signal.throwIfAborted();
				return jsonResult(runSummary(cancelled));
			}
		})
	];
}
/** Build the DoG-aware continuable Agent launcher once the host subagent service is available. */
function createDogDelegateAgentTool(engine, launcher) {
	return defineTool({
		name: DOG_DELEGATE_AGENT_TOOL,
		description: "Start a durable continuable DSH Agent for one DoG goal and bind its host-issued session identity to the run. The child remains directly interactive in the session UI after its first turn. Use this instead of a foreground or one-shot subagent for user-addressable DoG workers.",
		parameters: {
			runId: {
				type: "string",
				required: true,
				description: "Run ID returned by dog_run."
			},
			goalId: {
				type: "string",
				required: true,
				description: "Goal ID assigned to the new Agent."
			},
			role: {
				type: "string",
				required: true,
				enum: [
					"orchestrator",
					"verifier",
					"reviewer"
				],
				description: "The Agent role for this goal."
			},
			label: {
				type: "string",
				required: true,
				description: "Short human-readable Agent label shown in the session tree."
			},
			prompt: {
				type: "string",
				required: true,
				description: "Complete first-turn assignment for the Agent."
			}
		},
		output: JSON_OUTPUT,
		async execute(args, exec) {
			exec.signal.throwIfAborted();
			if (exec.agent === void 0) throw new Error("dog_delegate_agent requires a trusted DSH Agent execution context");
			const parentSessionId = String(exec.agent.id);
			await engine().assertAgentCanDelegate({
				runId: args.runId,
				goalId: args.goalId,
				parentSessionId
			});
			exec.signal.throwIfAborted();
			const child = await launcher.launch({
				label: args.label,
				prompt: args.prompt,
				parent: exec.agent,
				signal: exec.signal
			});
			if (child.sessionId.length === 0) throw new Error("DoG Agent launcher returned an empty child session ID");
			try {
				const binding = await engine().bindAgent({
					runId: args.runId,
					goalId: args.goalId,
					role: args.role,
					sessionId: child.sessionId,
					parentSessionId
				});
				return jsonResult({
					runId: binding.run.runId,
					goalId: args.goalId,
					lifecycle: "continuable",
					agent: binding.agent
				});
			} catch (error) {
				try {
					await launcher.interrupt?.(child.sessionId, exec.agent);
				} catch {}
				throw error;
			}
		}
	});
}
function compiledGraphSummary(compiled) {
	return {
		graphId: compiled.input.id,
		graphDigest: compiled.graphDigest,
		acceptancePlans: Object.values(compiled.acceptancePlans).map((plan) => ({
			goalId: plan.goalId,
			mode: plan.verifier.mode,
			...plan.verifier.mode === "programmatic" ? { script: plan.verifier.script } : { instruction: plan.verifier.instruction },
			target: plan.target,
			...plan.input === void 0 ? {} : {
				inputPath: plan.input.path,
				digest: plan.input.digest,
				exists: plan.input.exists,
				byteLength: plan.input.byteLength
			}
		}))
	};
}
function ciReport(run) {
	const goals = Object.entries(run.goals).map(([goalId, result]) => goalReport(goalId, result));
	const revalidated = Object.entries(run.gmDigests).filter(([goalId]) => run.goals[goalId]?.state !== "inherited").map(([goalId]) => goalId);
	const inherited = Object.entries(run.goals).filter(([, result]) => result.state === "inherited").map(([goalId, result]) => ({
		goalId,
		fromRunId: result.inheritedFrom ?? run.runId,
		state: "inherited"
	}));
	const warning = revalidateWarning(run, revalidated);
	return {
		runId: run.runId,
		graphId: run.graphId,
		...run.graphDigest === void 0 ? {} : { graphDigest: run.graphDigest },
		rootState: run.rootState ?? (run.state === "running" ? "running" : "cancelled"),
		goals: goals.sort((left, right) => left.goalId.localeCompare(right.goalId)),
		revalidated,
		inherited,
		...warning === void 0 ? {} : { warning },
		generatedAt: run.updatedAt
	};
}
function goalReport(goalId, result) {
	const verification = result.verification;
	return {
		goalId,
		state: result.state,
		...verification === void 0 ? {} : { verifier: { mode: verification.judgment.mode } },
		...verification === void 0 || verification.evidence === void 0 ? {} : { evidence: [verification.evidence] },
		...result.reason === void 0 ? {} : { defect: result.reason }
	};
}
function revalidateWarning(run, revalidated) {
	const warning = run.runtimeWarning;
	return warning === void 0 ? void 0 : warning;
}
function runSummary(run) {
	return ciReport(run);
}
function jsonResult(value) {
	if (!isJsonValue(value)) throw new Error("DoG produced a non-JSON tool result");
	return value;
}
//#endregion
//#region src/verifier-file.ts
/** File-backed settlement channel for continuable verifier subagents. */
/**
* Same as {@link waitForSettlement}, but short-circuits once the verifier child
* has finished its turn: if the settlement file is still absent shortly after
* the child's turn ended, the child is not coming back — settle inconclusive
* immediately instead of blocking the run for the full timeout.
*/
async function waitForSettlementFlexible(resultPath, signal, timeoutMs, childSettled) {
	const startAt = Date.now();
	while (Date.now() - startAt < timeoutMs) {
		if (signal.aborted) return {
			state: "inconclusive",
			observation: { outcome: "aborted" },
			waitedMs: Date.now() - startAt
		};
		try {
			const source = await readFile(resultPath, "utf8");
			return {
				...parseSettlementFile(source),
				source,
				waitedMs: Date.now() - startAt
			};
		} catch (error) {
			if (!isMissing(error)) return {
				state: "inconclusive",
				observation: { outcome: "unreadable settlement file" },
				waitedMs: Date.now() - startAt
			};
			if (await childSettled()) {
				await sleep(15e3);
				try {
					const source = await readFile(resultPath, "utf8");
					return {
						...parseSettlementFile(source),
						source,
						waitedMs: Date.now() - startAt
					};
				} catch {
					return {
						state: "inconclusive",
						observation: { outcome: "verifier child finished without writing the settlement file" },
						waitedMs: Date.now() - startAt
					};
				}
			}
			await sleep(500);
		}
	}
	return {
		state: "inconclusive",
		observation: { outcome: "timed out waiting for verifier result" },
		waitedMs: Date.now() - startAt
	};
}
function parseSettlementFile(source) {
	const value = parseLooseJson(source);
	if (value === null || typeof value !== "object" || Array.isArray(value)) return {
		state: "inconclusive",
		observation: { outcome: "settlement file is not a JSON object" }
	};
	const raw = value;
	const state = raw.verdict ?? raw.settlement;
	if (state !== "pass" && state !== "fail" && state !== "inconclusive") return {
		state: "inconclusive",
		observation: { outcome: "settlement file has an invalid settlement value" }
	};
	const observation = raw.evidence ?? raw.observation;
	if (observation === void 0) return {
		state: "inconclusive",
		observation: { outcome: "settlement file has no observation evidence" }
	};
	if (observation === null || typeof observation !== "object" || Array.isArray(observation)) return {
		state: "inconclusive",
		observation: { outcome: "settlement observation is not an object" }
	};
	const record = {};
	for (const [key, item] of Object.entries(observation)) if (typeof item === "string" || typeof item === "number" || typeof item === "boolean" || item === null) record[key] = item;
	else if (Array.isArray(item) || typeof item === "object") {
		if (isJsonValueLike(item)) record[key] = item;
	}
	if (Object.keys(record).length === 0) record.settled = state;
	return {
		state,
		observation: record
	};
}
/** Parse a settlement payload leniently: strip markdown fences, then try to extract the outermost JSON object. */
function parseLooseJson(source) {
	let text = source.trim();
	if (text.startsWith("```")) {
		text = text.replace(/^```[A-Za-z]*\s*/u, "").replace(/\s*```\s*$/u, "");
		text = text.trim();
	}
	try {
		return JSON.parse(text);
	} catch {
		const start = text.indexOf("{");
		if (start < 0) throw new Error("no JSON object found");
		let depth = 0;
		for (let index = start; index < text.length; index++) {
			const ch = text[index];
			if (ch === "{") depth++;
			else if (ch === "}") {
				depth--;
				if (depth === 0) return JSON.parse(text.slice(start, index + 1));
			}
		}
	}
	throw new Error("no complete JSON object found");
}
function isJsonValueLike(value) {
	if (value === null || typeof value === "string" || typeof value === "boolean") return true;
	if (typeof value === "number") return Number.isFinite(value);
	if (Array.isArray(value)) return value.every(isJsonValueLike);
	if (typeof value !== "object") return false;
	return Object.values(value).every(isJsonValueLike);
}
function isMissing(error) {
	return error instanceof Error && "code" in error && error.code === "ENOENT";
}
function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
//#endregion
//#region src/index.ts
/** Cordis plugin name. */
const name = "dsh-dog";
/** Required Harness services. */
const inject = [];
/** Loader-validated DoG deployment configuration. */
const Config = z.object({
	storageDirectory: z.string().default("dog"),
	workspaceRoot: z.string().default("dog/workspace"),
	scriptsDirectory: z.string().default(fileURLToPath(new URL("../../../scripts/dog/", import.meta.url))),
	maxGraphNodes: z.natural().min(1).default(256),
	maxExpressionNodes: z.natural().min(1).default(512),
	maxExpressionDepth: z.natural().min(1).default(64),
	maxSandboxBytes: z.natural().min(1).default(67108864),
	allowPartialRoot: z.boolean().default(false),
	maxConcurrentVerifications: z.natural().min(1).default(1),
	revalidateThreshold: z.number().default(.3),
	gmDigestAlgo: z.string().default("sha256"),
	subagentProvider: z.string().default("spawn"),
	subagentMaxDepth: z.natural().default(3)
});
Object.assign(Config.dict.maxConcurrentVerifications.meta, { volatile: true });
function concurrencyValue(value) {
	const reference = value;
	return typeof reference?.get === "function" ? reference.get() : value;
}
/** Register all DoG tools as Cordis-owned effects so fiber disposal removes them. */
async function apply(ctx, config) {
	const schema = await loadSchemaSet();
	let resolved = config;
	let settingsCurrent;
	ctx.inject(["settings"], (settingsCtx) => {
		if (typeof settingsCtx.settings.installSection !== "function") {
			settingsCurrent = () => config;
			return;
		}
		return settingsCtx.settings.installSection(ctx, "dog", z.object({
			storageDirectory: z.string().default("dog"),
			workspaceRoot: z.string().default("dog/workspace"),
			scriptsDirectory: z.string().default(fileURLToPath(new URL("../../../scripts/dog/", import.meta.url))),
			maxGraphNodes: z.natural().min(1).default(256),
			maxExpressionNodes: z.natural().min(1).default(512),
			maxExpressionDepth: z.natural().min(1).default(64),
			maxSandboxBytes: z.natural().min(1).default(67108864),
			allowPartialRoot: z.boolean().default(false),
			maxConcurrentVerifications: z.natural().min(1).default(1),
			revalidateThreshold: z.number().default(.3),
			gmDigestAlgo: z.string().default("sha256"),
			subagentProvider: z.string().default("spawn"),
			subagentMaxDepth: z.natural().default(3)
		}), config, {
			setSource: (current) => {
				settingsCurrent = current;
				resolved = {
					...config,
					...current()
				};
			},
			onChange: () => void 0
		});
	});
	const repository = new DogRepository(dshHomePath(config.storageDirectory), schema);
	repository.markOrphanedRunningRuns((/* @__PURE__ */ new Date()).toISOString()).catch(() => void 0);
	const scriptsDir = isAbsolute(config.scriptsDirectory) ? config.scriptsDirectory : dshHomePath(config.scriptsDirectory);
	const programmatic = async (script, inputPath, env) => {
		let out;
		try {
			out = await runOwnedScript(resolveScriptPath(scriptsDir, script), inputPath, env.signal);
		} catch (error) {
			return scriptFailureVerdict(error);
		}
		return parseVerdict(out);
	};
	let dogEngine;
	ctx.effect(() => async () => {
		await dogEngine?.dispose();
	});
	let agenticRunnerRef;
	let subagentRuntimeRef;
	const activeVerifiers = /* @__PURE__ */ new Map();
	const getEngine = () => {
		if (dogEngine === void 0) {
			const effective = settingsCurrent === void 0 ? resolved : {
				...config,
				...settingsCurrent()
			};
			dogEngine = new DogEngine({
				config: {
					...effective,
					maxConcurrentVerifications: concurrencyValue(effective.maxConcurrentVerifications),
					workspaceRoot: isAbsolute(effective.workspaceRoot) ? effective.workspaceRoot : dshHomePath(effective.workspaceRoot),
					scriptsDirectory: isAbsolute(effective.scriptsDirectory) ? effective.scriptsDirectory : dshHomePath(effective.scriptsDirectory)
				},
				programmatic,
				...agenticRunnerRef === void 0 ? {} : { agentic: agenticRunnerRef },
				repository,
				workspaces: new WorkspaceManager({ baseDir: effective.workspaceRoot }),
				onRunCancelled: (runId) => {
					for (const [sessionId, record] of activeVerifiers) {
						if (record.runId !== runId) continue;
						try {
							subagentRuntimeRef?.interrupt(sessionId, {
								kind: "ancestor",
								agent: record.parent
							});
						} catch {}
					}
				},
				liveConfig: () => {
					const live = settingsCurrent?.();
					return live === void 0 ? {} : { maxConcurrentVerifications: concurrencyValue(live.maxConcurrentVerifications) };
				},
				resolveLivingAgent: (sessionId) => {
					return ctx.get("agents")?.get(sessionId);
				}
			});
		}
		return dogEngine;
	};
	const scopedTools = [...createDogTools(getEngine, () => ctx.get("jobs"))];
	ctx.provide("openwriteDog", { tools: scopedTools });
	ctx.inject(["subagents"], (subagentCtx) => {
		const subagents = subagentCtx.subagents;
		subagentRuntimeRef = subagents;
		const agenticRunner = async (instruction, workspace, inputPath, env) => {
			const { parent, runId } = env;
			const signal = env.signal ?? new AbortController().signal;
			const goalId = env.goalId ?? "verification";
			const resultPath = join(workspace.path, "settlement.json");
			const parentSessionId = readSessionId(parent);
			if (parent === void 0) throw new Error("verifier delegation requires a live parent Agent (recovered runs without a live parent cannot spawn verification workers)");
			const sessionId = (await subagents.startContinuable({
				provider: config.subagentProvider,
				label: `verifier ${goalId} · ${runId === void 0 ? "run" : runId.slice(0, 6)}`,
				request: {
					prompt: [{
						type: "text",
						text: buildVerifierPrompt(instruction, inputPath, resultPath)
					}],
					parent,
					maxDepth: config.subagentMaxDepth
				},
				signal
			})).childId;
			activeVerifiers.set(sessionId, {
				parent,
				runId: runId ?? ""
			});
			if (runId !== void 0) try {
				await getEngine().annotateRun(runId, `bind-branch entered for ${goalId}: session ${sessionId.slice(0, 8)}`);
				const binding = await getEngine().bindAgent({
					runId,
					goalId,
					role: "verifier",
					sessionId,
					...parentSessionId.length > 0 ? { parentSessionId } : {}
				}, { allowUnrooted: parentSessionId.length === 0 });
				await getEngine().annotateRun(runId, `verifier bound for ${goalId}: ${sessionId.slice(0, 8)} (${binding.run.goals[goalId]?.agentSessions?.length ?? 0} bound)`);
			} catch (bindingError) {
				await getEngine().annotateRun(runId, `verifier binding failed for ${goalId}: ${String(bindingError).slice(0, 300)}`);
				await getEngine().recordVerifierLifecycle(runId, goalId, "verifier_bind_failed", sessionId, String(bindingError));
			}
			const settlement = await waitForSettlementFlexible(resultPath, signal, 9e5, async () => verifierChildTurnEnded(ctx, sessionId));
			if (settlement.source !== void 0 && runId !== void 0) repository.saveSettlement(runId, goalId, settlement.source).catch(() => void 0);
			if (runId !== void 0 && parent !== void 0 && parentSessionId.length > 0) try {
				await subagents.drainContinuableChildren(parent, [sessionId]);
				activeVerifiers.delete(sessionId);
				await getEngine().recordVerifierLifecycle(runId, goalId, "verifier_released", sessionId);
			} catch (releaseError) {
				await getEngine().annotateRun(runId, `verifier release failed for ${goalId}: ${String(releaseError).slice(0, 300)}`);
			}
			return {
				state: settlement.state,
				evidence: settlement.observation
			};
		};
		agenticRunnerRef = agenticRunner;
		const delegateTool = createDogDelegateAgentTool(getEngine, {
			async launch(input) {
				return { sessionId: (await subagents.startContinuable({
					provider: config.subagentProvider,
					label: input.label,
					request: {
						prompt: [{
							type: "text",
							text: input.prompt
						}],
						parent: input.parent,
						maxDepth: config.subagentMaxDepth
					},
					signal: input.signal
				})).childId };
			},
			interrupt(sessionId, parent) {
				subagents.interrupt(sessionId, {
					kind: "ancestor",
					agent: parent
				});
			}
		});
		scopedTools.push(delegateTool);
	});
	const debugHandler = createDogDebugRpcHandler(repository);
	ctx.on("session/event", (session, event) => {
		if (event.type !== "turn/end") return;
		if (event.data.reason?.kind !== "interrupted") return;
		captureInterruptedTurn(repository, session, event).catch(() => void 0);
	});
	ctx.inject(["connection", "webServer"], (c) => {
		c.effect(() => c.webServer.register({
			kind: "prefix",
			path: DOG_DEBUG_RPC_CHANNEL,
			handler: async (req, res) => {
				const rejection = c.connection.requestRejection({ headers: req.headers });
				if (rejection !== void 0) {
					res.writeHead(rejection);
					res.end(rejection === 401 ? "unauthorized" : "forbidden");
					return;
				}
				await serveDogDebugRpc(req, res, debugHandler);
			}
		}), "dog: trusted debugger RPC");
	});
}
async function captureInterruptedTurn(repository, session, event) {
	const diagnosticsDir = join(repository.rootPath, "diagnostics");
	await mkdir(diagnosticsDir, { recursive: true });
	const recentEvents = session.snapshotEvents().slice(-12).map((candidate) => ({
		seq: candidate.seq,
		type: candidate.type,
		time: candidate.time
	}));
	const payload = {
		capturedAt: (/* @__PURE__ */ new Date()).toISOString(),
		process: {
			pid: process.pid,
			startedAt: (/* @__PURE__ */ new Date(Date.now() - process.uptime() * 1e3)).toISOString()
		},
		sessionId: session.id,
		interruptSeq: event.seq,
		interruptEventTime: new Date(event.time).toISOString(),
		recentEvents
	};
	await writeFile(join(diagnosticsDir, `interrupt-${session.id.replaceAll(/[^a-zA-Z0-9-]/gu, "_")}-${event.seq}.json`), JSON.stringify(payload, null, 2));
}
function buildVerifierPrompt(instruction, inputPath, resultPath) {
	return [
		"You are a DoG verifier. Judge only the object handed to you.",
		"",
		`Object (read from here; only this tree is yours): ${inputPath}`,
		"",
		"Instruction:",
		instruction,
		"",
		"Decide on your own terms; gather the strongest evidence you can with your own judgment. No fixed evidence format.",
		`Write your verdict to this exact absolute path: ${resultPath}. The file must contain exactly:`,
		"{\"verdict\": \"pass\" | \"fail\" | \"inconclusive\", \"evidence\": <any JSON>}",
		"Create it (it does not exist yet); never write it as a relative path or to another location. After writing, stop."
	].join("\n");
}
/** Read the durable session id from a live Agent, or '' outside an agent boundary. */
function readSessionId(parent) {
	if (parent === void 0) return "";
	return String(parent.id);
}
/** True once the verifier child's turn has ended (or the child is gone entirely). */
function verifierChildTurnEnded(ctx, sessionId) {
	const agent = ctx.get("agents")?.get(sessionId);
	if (agent === void 0) return true;
	return agent.session.snapshotEvents().at(-1)?.type === "turn/end";
}
//#endregion
export { Config, DOG_BIND_AGENT_TOOL, DOG_CREATE_TOOL, DOG_DEBUG_RPC_CHANNEL, DOG_DEBUG_SNAPSHOT_ENDPOINT, DOG_DELEGATE_AGENT_TOOL, DOG_RUNTIME_TRACE_ENDPOINT, DOG_RUN_TOOL, DOG_STATUS_TOOL, DOG_VALIDATE_TOOL, DOG_WAIT_TOOL, DogEngine, DogValidationError, WorkspaceManager, apply, buildDogDebugSnapshot, buildGoalRuntimeTrace, createDogDebugRpcHandler, createDogDelegateAgentTool, createDogTools, evaluateBoolExpr, inject, loadSchemaSet, name, parseBoolExpr, parseGraph, runPlan };
