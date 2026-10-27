window.__ModuleLoader__.load({
	id: "@dsh-external/dsh-dog",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
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
		//#region src/client/agentTelemetry.ts
		/** Stable, de-duplicated bindings for one goal. */
		function goalAgentRefs(run, goalId) {
			if (run === void 0) return [];
			const seen = /* @__PURE__ */ new Set();
			const result = [];
			for (const ref of run.goals[goalId]?.agentSessions ?? []) {
				if (seen.has(ref.sessionId)) continue;
				seen.add(ref.sessionId);
				result.push(ref);
			}
			return result;
		}
		/** Stable, de-duplicated Agent bindings across a run. */
		function runAgentRefs(run) {
			if (run === void 0) return [];
			const seen = /* @__PURE__ */ new Set();
			const result = [];
			for (const goal of Object.values(run.goals)) for (const ref of goal.agentSessions ?? []) {
				if (seen.has(ref.sessionId)) continue;
				seen.add(ref.sessionId);
				result.push(ref);
			}
			return result;
		}
		/** Direct parent catalogs that can resolve bound subagent sessions in the host UI. */
		function agentParentSessionIds(snapshot) {
			const parents = /* @__PURE__ */ new Set();
			for (const revision of snapshot.graphs) for (const run of revision.runs) for (const ref of runAgentRefs(run)) if (ref.parentSessionId !== void 0) parents.add(ref.parentSessionId);
			return [...parents];
		}
		/** Merge one persisted binding with the newest host-projected session facts. */
		function goalAgentTelemetry(ref, sessions, now = Date.now()) {
			const summary = sessions.byId[ref.sessionId];
			const tokens = summary === void 0 ? void 0 : sessionTokenTotal(summary);
			const durationMs = summary === void 0 ? void 0 : sessionDuration(summary, now);
			return {
				ref,
				label: summary?.displayTitle ?? summary?.title ?? `${capitalize(ref.role)} Agent`,
				available: summary !== void 0,
				running: summary?.running ?? false,
				needsInput: sessions.pendingInteractions?.has(ref.sessionId) ?? false,
				...tokens === void 0 ? {} : { tokens },
				...durationMs === void 0 ? {} : { durationMs }
			};
		}
		/** DoG-level Agent counts and de-duplicated token usage. */
		function summarizeRunAgents(run, sessions, now = Date.now()) {
			const refs = runAgentRefs(run);
			let visible = 0;
			let running = 0;
			let tokens = 0;
			let measured = 0;
			for (const ref of refs) {
				const telemetry = goalAgentTelemetry(ref, sessions, now);
				if (telemetry.available) visible += 1;
				if (telemetry.running) running += 1;
				if (telemetry.tokens !== void 0) {
					tokens += telemetry.tokens;
					measured += 1;
				}
			}
			return {
				linked: refs.length,
				visible,
				running,
				...measured === 0 ? {} : { tokens },
				partialTokens: measured > 0 && measured < refs.length
			};
		}
		/** Count goals that reached any terminal state, independently of success. */
		function settledGoalCount(run) {
			if (run === void 0) return 0;
			return Object.values(run.goals).filter((result) => isTerminalGoalState(result.state)).length;
		}
		function isTerminalGoalState(state) {
			return state !== "pending" && state !== "running";
		}
		function sessionTokenTotal(summary) {
			const usage = summary.projectionValues?.tokenUsage;
			if (!isRecord$1(usage)) return void 0;
			const uncached = finiteNonNegative(usage.uncachedInputTokens);
			const output = finiteNonNegative(usage.outputTokens);
			const cacheRead = finiteNonNegative(usage.cacheReadTokens);
			const cacheWrite = finiteNonNegative(usage.cacheWriteTokens);
			if (uncached === void 0 || output === void 0 || cacheRead === void 0 || cacheWrite === void 0) return void 0;
			return uncached + output + cacheRead + cacheWrite;
		}
		function sessionDuration(summary, now) {
			const timing = summary.projectionValues?.subagentTiming;
			if (!isRecord$1(timing)) return void 0;
			const settledMs = finiteNonNegative(timing.settledMs);
			if (settledMs === void 0) return void 0;
			if (!isRecord$1(timing.active)) return settledMs;
			const since = finiteNumber(timing.active.since);
			const through = finiteNumber(timing.active.through);
			if (since === void 0 || through === void 0) return settledMs;
			const end = summary.running ? now : through;
			return settledMs + Math.max(0, end - since);
		}
		function finiteNonNegative(value) {
			const number = finiteNumber(value);
			return number === void 0 || number < 0 ? void 0 : number;
		}
		function finiteNumber(value) {
			return typeof value === "number" && Number.isFinite(value) ? value : void 0;
		}
		function isRecord$1(value) {
			return value !== null && typeof value === "object" && !Array.isArray(value);
		}
		function capitalize(value) {
			return value.length === 0 ? value : `${value[0]?.toUpperCase() ?? ""}${value.slice(1)}`;
		}
		const HORIZONTAL_GAP = 44;
		const CANVAS_PADDING_Y = 48;
		const MIN_CANVAS_WIDTH = 700;
		/** Lay containment levels top-to-bottom while retaining declared node order within a level. */
		function layoutDag(graph) {
			const parents = /* @__PURE__ */ new Map();
			for (const edge of graph.contains) {
				const values = parents.get(edge.child) ?? [];
				values.push(edge.parent);
				parents.set(edge.child, values);
			}
			const depths = /* @__PURE__ */ new Map();
			const visiting = /* @__PURE__ */ new Set();
			const depthOf = (id) => {
				const known = depths.get(id);
				if (known !== void 0) return known;
				if (id === graph.root) {
					depths.set(id, 0);
					return 0;
				}
				if (visiting.has(id)) return 0;
				visiting.add(id);
				const incoming = parents.get(id) ?? [];
				const depth = incoming.length === 0 ? 0 : Math.max(...incoming.map((parent) => depthOf(parent) + 1));
				visiting.delete(id);
				depths.set(id, depth);
				return depth;
			};
			const layers = /* @__PURE__ */ new Map();
			for (const id of Object.keys(graph.nodes)) {
				const depth = depthOf(id);
				const layer = layers.get(depth) ?? [];
				layer.push(id);
				layers.set(depth, layer);
			}
			const layerEntries = [...layers.entries()].sort(([left], [right]) => left - right);
			const widest = Math.max(1, ...layerEntries.map(([, ids]) => ids.length));
			const naturalWidth = widest * 218 + Math.max(0, widest - 1) * HORIZONTAL_GAP + 112;
			const width = Math.max(MIN_CANVAS_WIDTH, naturalWidth);
			const positioned = [];
			for (const [depth, ids] of layerEntries) {
				const startX = (width - (ids.length * 218 + Math.max(0, ids.length - 1) * HORIZONTAL_GAP)) / 2;
				ids.forEach((id, index) => positioned.push({
					id,
					x: startX + index * 262,
					y: CANVAS_PADDING_Y + depth * 180,
					width: 218,
					height: 88,
					depth
				}));
			}
			const height = 184 + Math.max(0, ...positioned.map((node) => node.depth)) * 180;
			const byId = new Map(positioned.map((node) => [node.id, node]));
			const edges = [];
			graph.contains.forEach((edge, index) => {
				const source = byId.get(edge.parent);
				const target = byId.get(edge.child);
				if (source === void 0 || target === void 0) return;
				edges.push({
					id: `contains:${index}:${edge.parent}:${edge.child}`,
					kind: "contains",
					source: edge.parent,
					target: edge.child,
					path: containmentPath(source, target)
				});
			});
			graph.dependsOn.forEach((edge, index) => {
				const source = byId.get(edge.source);
				const target = byId.get(edge.target);
				if (source === void 0 || target === void 0) return;
				edges.push({
					id: `depends:${index}:${edge.source}:${edge.target}`,
					kind: "dependsOn",
					source: edge.source,
					target: edge.target,
					path: dependencyPath(target, source, index)
				});
			});
			return {
				width,
				height,
				nodes: positioned,
				edges
			};
		}
		function containmentPath(source, target) {
			const startX = source.x + source.width / 2;
			const startY = source.y + source.height;
			const endX = target.x + target.width / 2;
			const endY = target.y;
			const middleY = startY + (endY - startY) / 2;
			return `M ${startX} ${startY} C ${startX} ${middleY}, ${endX} ${middleY}, ${endX} ${endY}`;
		}
		function dependencyPath(source, target, index) {
			const sourceCenterX = source.x + source.width / 2;
			const rightward = target.x + target.width / 2 >= sourceCenterX;
			const startX = rightward ? source.x + source.width : source.x;
			const endX = rightward ? target.x : target.x + target.width;
			const startY = source.y + source.height / 2;
			const endY = target.y + target.height / 2;
			const bend = (rightward ? 1 : -1) * (54 + index % 3 * 12);
			return `M ${startX} ${startY} C ${startX + bend} ${startY}, ${endX - bend} ${endY}, ${endX} ${endY}`;
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
		function isRecord(value) {
			return value !== null && typeof value === "object" && !Array.isArray(value);
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
		//#region src/client/snapshot.ts
		/** Runtime validation for trusted debugger RPC responses. */
		const DIGEST = /^[a-f0-9]{64}$/u;
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
		const ROOT_STATES = /* @__PURE__ */ new Set([
			"success",
			"partial_success",
			"failure",
			"infeasible",
			"needs_replan",
			"cancelled"
		]);
		const GOAL_AGENT_ROLES = /* @__PURE__ */ new Set([
			"orchestrator",
			"verifier",
			"reviewer"
		]);
		const RUNTIME_PHASES = /* @__PURE__ */ new Set([
			"goal_started",
			"dependency_blocked",
			"grounding_extracted",
			"workspace_allocated",
			"verifier_started",
			"verifier_released",
			"verifier_passed",
			"verifier_failed",
			"verifier_inconclusive",
			"composite_evaluated",
			"result_inherited",
			"structured_error",
			"goal_settled",
			"run_warning"
		]);
		/** Parse JSON from the debugger endpoint before it reaches render code. */
		function parseDogDebugSnapshot(value) {
			const root = requireRecord(value, "$");
			if (root.schemaVersion !== "0.1") throw new Error("debug snapshot schemaVersion must be 0.1");
			const graphs = requireArray(root.graphs, "$.graphs").map((item, index) => parseRevision(item, `$.graphs[${index}]`));
			return {
				schemaVersion: "0.1",
				generatedAt: requireString(root.generatedAt, "$.generatedAt"),
				graphs
			};
		}
		/** Parse one lazy per-goal runtime trace before it reaches render code. */
		function parseGoalRuntimeTrace(value) {
			const root = requireRecord(value, "$");
			if (root.schemaVersion !== "0.1") throw new Error("runtime trace schemaVersion must be 0.1");
			const runId = requireBoundedString(root.runId, "$.runId");
			const graphDigest = requireDigest(root.graphDigest, "$.graphDigest");
			const goalId = requireBoundedString(root.goalId, "$.goalId");
			const runState = parseRunState(root.runState, "$.runState");
			const result = parseGoalResult(root.result, "$.result");
			const rootState = root.rootState === void 0 ? void 0 : parseRootState(root.rootState, "$.rootState");
			const invocation = root.invocation === void 0 ? void 0 : parseInvocation(root.invocation, "$.invocation");
			const events = requireArray(root.events, "$.events").map((item, index) => parseRuntimeEvent(item, `$.events[${index}]`, {
				runId,
				goalId
			}));
			if (typeof root.truncated !== "boolean") throw new Error("$.truncated must be a boolean");
			const runtimeWarning = root.runtimeWarning === void 0 ? void 0 : requireBoundedString(root.runtimeWarning, "$.runtimeWarning");
			return {
				schemaVersion: "0.1",
				runId,
				graphId: requireBoundedString(root.graphId, "$.graphId"),
				graphDigest,
				runState,
				...rootState === void 0 ? {} : { rootState },
				goalId,
				result,
				...invocation === void 0 ? {} : { invocation },
				...runtimeWarning === void 0 ? {} : { runtimeWarning },
				events,
				truncated: root.truncated
			};
		}
		function parseRuntimeEvent(value, path, expected) {
			const root = requireRecord(value, path);
			if (root.schemaVersion !== "0.1") throw new Error(`${path}.schemaVersion must be 0.1`);
			const runId = requireBoundedString(root.runId, `${path}.runId`);
			const goalId = requireBoundedString(root.goalId, `${path}.goalId`);
			if (runId !== expected.runId || goalId !== expected.goalId) throw new Error(`${path} does not belong to the requested goal trace`);
			const phase = requireString(root.phase, `${path}.phase`);
			if (!RUNTIME_PHASES.has(phase)) throw new Error(`${path}.phase is invalid`);
			const state = root.state === void 0 ? void 0 : parseGoalState(root.state, `${path}.state`);
			const reason = root.reason === void 0 ? void 0 : requireBoundedString(root.reason, `${path}.reason`);
			const durationMs = root.durationMs === void 0 ? void 0 : requireNonNegativeInteger(root.durationMs, `${path}.durationMs`);
			const attempt = root.attempt === void 0 ? void 0 : requireNonNegativeInteger(root.attempt, `${path}.attempt`);
			const gmDigest = root.gmDigest === void 0 ? void 0 : requireString(root.gmDigest, `${path}.gmDigest`);
			const verifierRecord = root.verifier === void 0 ? void 0 : requireRecord(root.verifier, `${path}.verifier`);
			const verifier = verifierRecord === void 0 ? void 0 : { mode: requireEnumValue(verifierRecord.mode, ["programmatic", "agentic"], `${path}.verifier.mode`) };
			return {
				schemaVersion: "0.1",
				runId,
				goalId,
				phase,
				at: requireString(root.at, `${path}.at`),
				...state === void 0 ? {} : { state },
				...reason === void 0 ? {} : { reason },
				...verifier === void 0 ? {} : { verifier },
				...gmDigest === void 0 ? {} : { gmDigest },
				...attempt === void 0 ? {} : { attempt },
				...durationMs === void 0 ? {} : { durationMs }
			};
		}
		function parseRevision(value, path) {
			const root = requireRecord(value, path);
			const graphRecord = requireRecord(root.graph, `${path}.graph`);
			const graphDigest = requireDigest(graphRecord.graphDigest, `${path}.graph.graphDigest`);
			const input = parseGraph(graphRecord.input, {
				maxGraphNodes: 4096,
				maxExpressionNodes: 8192,
				maxExpressionDepth: 256
			});
			const acceptancePlans = parseAcceptancePlans(graphRecord.acceptancePlans, `${path}.graph.acceptancePlans`);
			const runs = requireArray(root.runs, `${path}.runs`).map((item, index) => {
				const run = parseRun(item, `${path}.runs[${index}]`);
				if (run.graphDigest !== graphDigest) throw new Error(`${path}.runs[${index}]: graph digest mismatch`);
				return run;
			});
			if (typeof root.current !== "boolean") throw new Error(`${path}.current must be a boolean`);
			return {
				graph: {
					input,
					graphDigest,
					acceptancePlans
				},
				current: root.current,
				runs
			};
		}
		function parseAcceptancePlans(value, path) {
			const root = requireRecord(value, path);
			const result = {};
			for (const [key, item] of Object.entries(root)) {
				const plan = parseAcceptancePlan(item, `${path}.${key}`);
				if (plan.goalId !== key) throw new Error(`${path}.${key}: goalId mismatch`);
				result[key] = plan;
			}
			return result;
		}
		function parseAcceptancePlan(value, path) {
			const root = requireRecord(value, path);
			const input = root.input === void 0 ? void 0 : parseCapturedInput(root.input, `${path}.input`);
			const verifier = parseVerifierShape(root.verifier ?? root.v09Verifier, `${path}.verifier`);
			const judgment = parseJudgment(root.judgment, `${path}.judgment`);
			return {
				goalId: requireString(root.goalId, `${path}.goalId`),
				verifier,
				judgment,
				target: requireString(root.target, `${path}.target`),
				...input === void 0 ? {} : { input },
				...root.gmDigest === void 0 ? {} : { gmDigest: requireString(root.gmDigest, `${path}.gmDigest`) }
			};
		}
		function parseVerifierShape(value, path) {
			const record = requireRecord(value, path);
			const mode = requireString(record.mode, `${path}.mode`);
			if (mode === "programmatic") return {
				mode: "programmatic",
				script: requireString(record.script, `${path}.script`)
			};
			if (mode === "agentic") return {
				mode: "agentic",
				instruction: requireString(record.instruction, `${path}.instruction`)
			};
			throw new Error(`${path}.mode is invalid`);
		}
		function parseJudgment(value, path) {
			const record = requireRecord(value, path);
			if (requireString(record.mode, `${path}.mode`) === "programmatic") return {
				mode: "programmatic",
				script: requireString(record.script, `${path}.script`),
				scriptDigest: requireString(record.scriptDigest, `${path}.scriptDigest`)
			};
			return {
				mode: "agentic",
				instructionHash: requireString(record.instructionHash, `${path}.instructionHash`)
			};
		}
		function parseCapturedInput(value, path) {
			const root = requireRecord(value, path);
			const exists = root.exists;
			const byteLength = root.byteLength;
			if (typeof exists !== "boolean") throw new Error(`${path}.exists must be a boolean`);
			if (typeof byteLength !== "number" || !Number.isSafeInteger(byteLength) || byteLength < 0) throw new Error(`${path}.byteLength must be a non-negative safe integer`);
			return {
				path: requireBoundedString(root.path, `${path}.path`),
				digest: requireString(root.digest, `${path}.digest`),
				exists,
				byteLength,
				sha256: requireString(root.sha256, `${path}.sha256`)
			};
		}
		function parseRun(value, path) {
			const root = requireRecord(value, path);
			const state = parseRunState(root.state, `${path}.state`);
			const goalsRecord = requireRecord(root.goals, `${path}.goals`);
			const goals = {};
			for (const [id, result] of Object.entries(goalsRecord)) goals[id] = parseGoalResult(result, `${path}.goals.${id}`);
			const rootState = root.rootState === void 0 ? void 0 : parseRootState(root.rootState, `${path}.rootState`);
			const invocation = root.invocation === void 0 ? void 0 : parseInvocation(root.invocation, `${path}.invocation`);
			const runtimeWarning = root.runtimeWarning === void 0 ? void 0 : requireBoundedString(root.runtimeWarning, `${path}.runtimeWarning`);
			const gmDigestsRecord = root.gmDigests === void 0 ? {} : requireRecord(root.gmDigests, `${path}.gmDigests`);
			const gmDigests = {};
			for (const [id, digest] of Object.entries(gmDigestsRecord)) gmDigests[id] = requireString(digest, `${path}.gmDigests.${id}`);
			return {
				runId: requireString(root.runId, `${path}.runId`),
				graphId: requireString(root.graphId, `${path}.graphId`),
				graphDigest: requireDigest(root.graphDigest, `${path}.graphDigest`),
				state,
				...rootState === void 0 ? {} : { rootState },
				gmDigests,
				goals,
				...invocation === void 0 ? {} : { invocation },
				...runtimeWarning === void 0 ? {} : { runtimeWarning },
				createdAt: requireString(root.createdAt, `${path}.createdAt`),
				updatedAt: requireString(root.updatedAt, `${path}.updatedAt`)
			};
		}
		function parseInvocation(value, path) {
			const root = requireRecord(value, path);
			const agentSessionId = root.agentSessionId === void 0 ? void 0 : requireBoundedString(root.agentSessionId, `${path}.agentSessionId`);
			const parentSessionId = root.parentSessionId === void 0 ? void 0 : requireBoundedString(root.parentSessionId, `${path}.parentSessionId`);
			if (parentSessionId !== void 0 && agentSessionId === void 0) throw new Error(`${path}.parentSessionId requires agentSessionId`);
			return {
				callId: requireBoundedString(root.callId, `${path}.callId`),
				...agentSessionId === void 0 ? {} : { agentSessionId },
				...parentSessionId === void 0 ? {} : { parentSessionId },
				invokedAt: requireString(root.invokedAt, `${path}.invokedAt`)
			};
		}
		function parseGoalResult(value, path) {
			const root = requireRecord(value, path);
			const state = parseGoalState(root.state, `${path}.state`);
			const reason = root.reason === void 0 ? void 0 : requireString(root.reason, `${path}.reason`);
			const verification = root.verification === void 0 ? void 0 : parseVerification(root.verification, `${path}.verification`);
			const agentSessions = root.agentSessions === void 0 ? void 0 : requireArray(root.agentSessions, `${path}.agentSessions`).map((agent, index) => parseGoalAgentSession(agent, `${path}.agentSessions[${index}]`));
			const inheritedFrom = root.inheritedFrom === void 0 ? void 0 : requireString(root.inheritedFrom, `${path}.inheritedFrom`);
			return {
				state,
				...reason === void 0 ? {} : { reason },
				...verification === void 0 ? {} : { verification },
				...inheritedFrom === void 0 ? {} : { inheritedFrom },
				...agentSessions === void 0 ? {} : { agentSessions }
			};
		}
		function parseGoalAgentSession(value, path) {
			const root = requireRecord(value, path);
			const role = requireBoundedString(root.role, `${path}.role`);
			if (!GOAL_AGENT_ROLES.has(role)) throw new Error(`${path}.role is invalid`);
			const parentSessionId = root.parentSessionId === void 0 ? void 0 : requireBoundedString(root.parentSessionId, `${path}.parentSessionId`);
			return {
				sessionId: requireBoundedString(root.sessionId, `${path}.sessionId`),
				...parentSessionId === void 0 ? {} : { parentSessionId },
				role,
				boundAt: requireBoundedString(root.boundAt, `${path}.boundAt`)
			};
		}
		function parseVerification(value, path) {
			const root = requireRecord(value, path);
			if (root.passed !== null && typeof root.passed !== "boolean") throw new Error(`${path}.passed must be a boolean or null`);
			return {
				schemaVersion: "0.1",
				goalId: requireString(root.goalId, `${path}.goalId`),
				runId: requireString(root.runId, `${path}.runId`),
				graphId: requireString(root.graphId, `${path}.graphId`),
				graphDigest: requireDigest(root.graphDigest, `${path}.graphDigest`),
				judgment: parseJudgment(root.judgment, `${path}.judgment`),
				...root.gmDigest === void 0 ? {} : { gmDigest: requireString(root.gmDigest, `${path}.gmDigest`) },
				passed: root.passed === null ? null : root.passed,
				...root.evidence === void 0 ? {} : { evidence: requireJson(root.evidence, `${path}.evidence`) },
				at: requireString(root.at, `${path}.at`)
			};
		}
		function requireEnumValue(value, allowed, path) {
			const candidate = requireString(value, path);
			if (!allowed.includes(candidate)) throw new Error(`${path} is invalid`);
			return candidate;
		}
		function requireJson(value, path) {
			if (!isJsonValue(value)) throw new Error(`${path} must be JSON-compatible`);
			return value;
		}
		function parseGoalState(value, path) {
			if (typeof value !== "string" || !GOAL_STATES.has(value)) throw new Error(`${path} is invalid`);
			return value;
		}
		function parseRootState(value, path) {
			if (typeof value !== "string" || !ROOT_STATES.has(value)) throw new Error(`${path} is invalid`);
			return value;
		}
		function parseRunState(value, path) {
			if (value !== "running" && value !== "completed" && value !== "cancelled" && value !== "failed") throw new Error(`${path} is invalid`);
			return value;
		}
		function requireDigest(value, path) {
			const text = requireString(value, path);
			if (!DIGEST.test(text)) throw new Error(`${path} must be a SHA-256 digest`);
			return text;
		}
		function requireRecord(value, path) {
			if (value === null || typeof value !== "object" || Array.isArray(value)) throw new Error(`${path} must be an object`);
			return Object.fromEntries(Object.entries(value));
		}
		function requireArray(value, path) {
			if (!Array.isArray(value)) throw new Error(`${path} must be an array`);
			return value;
		}
		function requireString(value, path) {
			if (typeof value !== "string") throw new Error(`${path} must be a string`);
			return value;
		}
		function requireBoundedString(value, path) {
			const text = requireString(value, path);
			if (text.length === 0 || text.length > 512) throw new Error(`${path} must contain 1-512 characters`);
			return text;
		}
		function requireNonNegativeInteger(value, path) {
			if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) throw new Error(`${path} must be a non-negative safe integer`);
			return value;
		}
		//#endregion
		//#region src/client/DogDebugger.tsx
		const REFRESH_INTERVAL_MS = 3e3;
		const RECENT_DOG_LIMIT = 4;
		const DOG_DOCK_RESERVED_WIDTH = 370;
		const HOST_CENTER_MIN_WIDTH = 640;
		const DOG_DOCK_COLLAPSED_KEY = "@dsh-external/dsh-dog/dock-collapsed";
		const MIN_ZOOM = .6;
		const MAX_ZOOM = 1.2;
		function DogDebugger({ initialOpen = false, hideDock = false, readSnapshot, readGoalRuntime, openSession, getSessionState, subscribeSessions, refreshAgentCatalog }) {
			const [open, setOpen] = (0, react.useState)(initialOpen);
			const [dockCollapsed, setDockCollapsed] = (0, react.useState)(readDogDockCollapsed);
			const [snapshot, setSnapshot] = (0, react.useState)();
			const [selectedDigest, setSelectedDigest] = (0, react.useState)();
			const [selectedRunId, setSelectedRunId] = (0, react.useState)();
			const [selectedNodeId, setSelectedNodeId] = (0, react.useState)();
			const [loading, setLoading] = (0, react.useState)(false);
			const [error, setError] = (0, react.useState)();
			const [zoom, setZoom] = (0, react.useState)(.9);
			const inFlight = (0, react.useRef)(false);
			const dialogRef = (0, react.useRef)(null);
			const overlayRootRef = (0, react.useRef)(null);
			const sessionState = (0, react.useSyncExternalStore)(subscribeSessions, getSessionState, getSessionState);
			const updateDockCollapsed = (0, react.useCallback)((collapsed) => {
				setDockCollapsed(collapsed);
				writeDogDockCollapsed(collapsed);
			}, []);
			(0, react.useEffect)(() => {
				if (hideDock) return;
				const root = overlayRootRef.current;
				const overlayLayer = root?.parentElement?.parentElement;
				const details = overlayLayer?.previousElementSibling;
				const center = details?.previousElementSibling;
				const sidebar = center?.previousElementSibling;
				const frame = overlayLayer?.parentElement;
				if (!(root instanceof HTMLElement) || !(overlayLayer instanceof HTMLElement) || !(details instanceof HTMLElement) || !(center instanceof HTMLElement) || !(sidebar instanceof HTMLElement) || !(frame instanceof HTMLElement)) return;
				const previousMarginRight = center.style.marginRight;
				const previousMinWidth = center.style.minWidth;
				const update = () => {
					const frameWidth = frame.getBoundingClientRect().width;
					const sidebarWidth = sidebar.getBoundingClientRect().width;
					const detailsWidth = details.getBoundingClientRect().width;
					const centerWidth = frameWidth - sidebarWidth - detailsWidth;
					if (!open && !dockCollapsed && detailsWidth < 1 && centerWidth - DOG_DOCK_RESERVED_WIDTH >= HOST_CENTER_MIN_WIDTH) {
						center.style.marginRight = `${DOG_DOCK_RESERVED_WIDTH}px`;
						center.style.minWidth = "0";
						root.dataset.dogDockLayout = "reserved";
						return;
					}
					center.style.marginRight = previousMarginRight;
					center.style.minWidth = previousMinWidth;
					root.dataset.dogDockLayout = open || detailsWidth >= 1 ? "hidden" : dockCollapsed ? "collapsed" : "floating";
				};
				update();
				const observer = new ResizeObserver(update);
				observer.observe(frame);
				observer.observe(sidebar);
				observer.observe(details);
				window.addEventListener("resize", update);
				return () => {
					window.removeEventListener("resize", update);
					observer.disconnect();
					center.style.marginRight = previousMarginRight;
					center.style.minWidth = previousMinWidth;
					delete root.dataset.dogDockLayout;
				};
			}, [
				dockCollapsed,
				open,
				hideDock
			]);
			const refresh = (0, react.useCallback)(async () => {
				if (inFlight.current) return;
				inFlight.current = true;
				setLoading(true);
				try {
					const next = parseDogDebugSnapshot(await readSnapshot(new AbortController().signal));
					setSnapshot(next);
					setError(void 0);
					await Promise.allSettled(agentParentSessionIds(next).map(refreshAgentCatalog));
				} catch (cause) {
					setError(cause instanceof Error ? cause.message : String(cause));
				} finally {
					inFlight.current = false;
					setLoading(false);
				}
			}, [readSnapshot, refreshAgentCatalog]);
			const openInvokingSession = (0, react.useCallback)(async (sessionId, parentSessionId) => {
				const opened = await openSession(sessionId, parentSessionId);
				if (opened) setOpen(false);
				return opened;
			}, [openSession]);
			(0, react.useEffect)(() => {
				if (hideDock && !open) return;
				refresh();
				const timer = window.setInterval(() => void refresh(), REFRESH_INTERVAL_MS);
				return () => window.clearInterval(timer);
			}, [
				refresh,
				open,
				hideDock
			]);
			(0, react.useEffect)(() => {
				if (!open) return;
				const previouslyFocused = document.activeElement;
				dialogRef.current?.focus();
				const onKeyDown = (event) => {
					if (event.key === "Escape") setOpen(false);
				};
				window.addEventListener("keydown", onKeyDown);
				return () => {
					window.removeEventListener("keydown", onKeyDown);
					if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
				};
			}, [open]);
			const selectedRevision = snapshot?.graphs.find((item) => item.graph.graphDigest === selectedDigest) ?? snapshot?.graphs[0];
			const selectedRun = selectedRevision?.runs.find((run) => run.runId === selectedRunId) ?? selectedRevision?.runs[0];
			const effectiveNodeId = selectedNodeId !== void 0 && selectedRevision?.graph.input.nodes[selectedNodeId] !== void 0 ? selectedNodeId : selectedRevision?.graph.input.root;
			const chooseRevision = (revision) => {
				setSelectedDigest(revision.graph.graphDigest);
				setSelectedRunId(revision.runs[0]?.runId);
				setSelectedNodeId(revision.graph.input.root);
			};
			const enterRevision = (revision) => {
				chooseRevision(revision);
				setOpen(true);
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				ref: overlayRootRef,
				className: "dog-overlay-root",
				children: [open || hideDock ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(DogDock, {
					snapshot,
					sessions: sessionState,
					loading,
					error,
					onOpenRevision: enterRevision,
					collapsed: dockCollapsed,
					onCollapsedChange: updateDockCollapsed,
					onRefresh: () => void refresh()
				}), open ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dog-backdrop",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						ref: dialogRef,
						className: "dog-dialog",
						role: "dialog",
						"aria-modal": "true",
						"aria-label": "DoG graph",
						tabIndex: -1,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
							className: "dog-header",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "dog-brand",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "dog-brand-mark",
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(NetworkIcon, { size: 18 })
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "dog-brand-copy",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
											className: "dog-brand-title",
											children: "DoG"
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
											className: "dog-brand-subtitle",
											children: "Goals · Agents · trusted evidence"
										})]
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "dog-header-divider" }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "dog-context",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "dog-context-title",
										children: selectedRevision?.graph.input.nodes[selectedRevision.graph.input.root]?.title ?? "No graph selected"
									}), selectedRevision?.current ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "dog-revision-chip",
										children: "Current revision"
									}) : null]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "dog-header-actions",
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "dog-sync-copy",
											title: error,
											children: error === void 0 ? "Live · 3s" : "Refresh failed"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconButton, {
											label: "Refresh DoG data",
											busy: loading,
											onClick: () => void refresh(),
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(RefreshIcon, {})
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconButton, {
											label: "Close DoG",
											busy: false,
											onClick: () => setOpen(false),
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CloseIcon, {})
										})
									]
								})
							]
						}), selectedRevision === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EmptyWorkspace, {
							loading,
							error
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: loading ? "dog-workspace dog-loading" : "dog-workspace",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Sidebar, {
									snapshot,
									selectedRevision,
									selectedRun,
									onSelectRevision: chooseRevision,
									onSelectRun: setSelectedRunId
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("main", {
									className: "dog-main",
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Summary, {
											revision: selectedRevision,
											run: selectedRun,
											sessions: sessionState
										}),
										error === void 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
											className: "dog-error-banner",
											role: "status",
											children: ["Live refresh failed: ", error]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
											className: "dog-canvas-shell",
											"aria-label": "Goal DAG canvas",
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(CanvasToolbar, {
												zoom,
												onZoom: setZoom
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(GraphCanvas, {
												graph: selectedRevision.graph,
												run: selectedRun,
												sessions: sessionState,
												selectedNodeId: effectiveNodeId,
												zoom,
												onSelectNode: setSelectedNodeId,
												openSession: openInvokingSession
											})]
										})
									]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Inspector, {
									graph: selectedRevision.graph,
									run: selectedRun,
									nodeId: effectiveNodeId,
									readGoalRuntime,
									openSession: openInvokingSession
								})
							]
						})]
					})
				}) : null]
			});
		}
		function DogDock({ snapshot, sessions, loading, error, onOpenRevision, onRefresh, collapsed, onCollapsedChange }) {
			const revisions = snapshot?.graphs.filter((revision) => revision.current).slice(0, RECENT_DOG_LIMIT) ?? [];
			if (collapsed) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("aside", {
				className: "dog-dock",
				"data-collapsed": "true",
				"aria-label": "Collapsed DoG panel",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					className: "dog-dock-rail",
					type: "button",
					"aria-label": "Expand DoG panel",
					title: "Expand DoG panel",
					"aria-expanded": "false",
					onClick: () => onCollapsedChange(false),
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dog-dock-rail-mark",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(NetworkIcon, { size: 16 })
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "DoG" }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(DockExpandIcon, {})
					]
				})
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("aside", {
				className: "dog-dock",
				"data-collapsed": "false",
				"aria-label": "Recent DoG runs",
				"aria-busy": loading,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dog-dock-collapse-slot",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						className: "dog-dock-collapse-handle",
						type: "button",
						"aria-label": "Collapse DoG panel",
						title: "Collapse DoG panel",
						"aria-expanded": "true",
						onClick: () => onCollapsedChange(true),
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(DockCollapseIcon, {})
					})
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dog-dock-content",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
							className: "dog-dock-header",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dog-dock-mark",
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(NetworkIcon, { size: 16 })
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "dog-dock-heading",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", { children: "DoG" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: loading ? "Syncing…" : error === void 0 ? "Live goals" : "Refresh failed" })]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(IconButton, {
									label: "Refresh recent DoGs",
									busy: loading,
									onClick: onRefresh,
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(RefreshIcon, {})
								})
							]
						}),
						error === void 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dog-dock-error",
							title: error,
							children: "Last sync failed"
						}),
						revisions.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dog-dock-empty",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dog-dock-empty-icon",
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(NetworkIcon, { size: 19 })
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: loading ? "Loading DoGs" : "No DoG yet" }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "dog_create adds the first graph." })
							]
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
							className: "dog-dock-list",
							children: revisions.map((revision) => {
								const run = latestRun(revision);
								const total = Object.keys(revision.graph.input.nodes).length;
								const settled = settledGoalCount(run);
								const agents = summarizeRunAgents(run, sessions);
								const state = run?.rootState ?? run?.state ?? "pending";
								const progress = total === 0 ? 0 : Math.round(settled / total * 100);
								const rootTitle = revision.graph.input.nodes[revision.graph.input.root]?.title ?? revision.graph.input.id;
								return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
									className: "dog-dock-card",
									type: "button",
									onClick: () => onOpenRevision(revision),
									"aria-label": `Open ${rootTitle}: ${humanizeState(state)}, ${settled} of ${total} goals complete`,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
											className: "dog-dock-card-head",
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
												className: "dog-dock-title-wrap",
												children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
													className: "dog-dock-title",
													children: rootTitle
												}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
													className: "dog-dock-id",
													children: revision.graph.input.id
												})]
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(StatusChip, { state })]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "dog-dock-progress",
											"aria-hidden": "true",
											children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { style: { width: `${progress}%` } })
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
											className: "dog-dock-metrics",
											children: [
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("strong", { children: [
													settled,
													"/",
													total
												] }), " nodes"] }),
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: agents.linked }), " agents"] }),
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: agents.running }), " live"] }),
												/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: formatTokenMetric(agents.tokens, agents.partialTokens) }), " tok"] })
											]
										})
									]
								}) }, revision.graph.graphDigest);
							})
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dog-dock-footer",
							children: "Open a DoG to inspect its graph and Agents"
						})
					]
				})]
			});
		}
		function Sidebar({ snapshot, selectedRevision, selectedRun, onSelectRevision, onSelectRun }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("aside", {
				className: "dog-sidebar",
				"aria-label": "Graphs and run history",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
						className: "dog-section-label",
						children: "Graph revisions"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
						className: "dog-graph-list",
						children: snapshot?.graphs.map((revision) => {
							const run = latestRun(revision);
							const state = run?.rootState ?? run?.state ?? "pending";
							return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								className: "dog-list-button",
								type: "button",
								"data-selected": revision.graph.graphDigest === selectedRevision.graph.graphDigest,
								onClick: () => onSelectRevision(revision),
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: "dog-list-row",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: `dog-state-dot ${stateClass(state)}` }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "dog-list-title",
										children: revision.graph.input.id
									})]
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: "dog-list-meta",
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: revision.current ? "dog-list-current" : void 0,
											children: revision.current ? "current" : "historical"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "·" }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [Object.keys(revision.graph.input.nodes).length, " goals"] }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "·" }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "dog-mono",
											children: shortDigest(revision.graph.graphDigest)
										})
									]
								})]
							}) }, revision.graph.graphDigest);
						})
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", { className: "dog-sidebar-divider" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
						className: "dog-section-label",
						children: "Run history"
					}),
					selectedRevision.runs.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "dog-empty-small",
						children: "No runs are bound to this immutable revision."
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
						className: "dog-run-list",
						children: selectedRevision.runs.map((run) => {
							const state = run.rootState ?? run.state;
							return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								className: "dog-list-button",
								type: "button",
								"data-selected": run.runId === selectedRun?.runId,
								onClick: () => onSelectRun(run.runId),
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: "dog-list-row",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: `dog-state-dot ${stateClass(state)}` }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "dog-list-title",
										children: humanizeState(state)
									})]
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
									className: "dog-list-meta",
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: formatTime(run.updatedAt) }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "·" }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "dog-mono",
											children: shortId(run.runId)
										})
									]
								})]
							}) }, run.runId);
						})
					})
				]
			});
		}
		function Summary({ revision, run, sessions }) {
			const attention = Object.values(run?.goals ?? {}).filter((result) => isAttentionGoal(result.state)).length;
			const total = Object.keys(revision.graph.input.nodes).length;
			const settled = settledGoalCount(run);
			const agents = summarizeRunAgents(run, sessions);
			const state = run?.rootState ?? run?.state ?? "pending";
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: "dog-summary",
				"aria-label": "Run summary",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: `dog-summary-primary ${stateClass(state)}`,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dog-root-orb",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(RootIcon, {})
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dog-summary-copy",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "dog-summary-kicker",
								children: "Root outcome"
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "dog-summary-value",
								children: humanizeState(state)
							})]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Metric, {
						label: "Nodes",
						value: `${settled}/${total}`
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Metric, {
						label: "Agent tokens",
						value: formatTokenMetric(agents.tokens, agents.partialTokens)
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Metric, {
						label: "Agents",
						value: `${agents.linked} · ${agents.running} live`
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Metric, {
						label: "Attention",
						value: String(attention)
					})
				]
			});
		}
		function Metric({ label, value }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dog-metric",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dog-metric-label",
					children: label
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dog-metric-value",
					children: value
				})]
			});
		}
		function CanvasToolbar({ zoom, onZoom }) {
			const adjust = (delta) => onZoom(clampZoom(zoom + delta));
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dog-canvas-toolbar",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dog-legend",
						"aria-label": "Edge legend",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: "dog-legend-item",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "dog-legend-line" }), "Contains"]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: "dog-legend-item",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dog-legend-line",
								"data-kind": "depends"
							}), "Depends on"]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "dog-canvas-spacer" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dog-zoom",
						"aria-label": "Canvas zoom",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								className: "dog-zoom-button",
								type: "button",
								"aria-label": "Zoom out",
								onClick: () => adjust(-.1),
								children: "−"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: "dog-zoom-value",
								children: [Math.round(zoom * 100), "%"]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								className: "dog-zoom-button",
								type: "button",
								"aria-label": "Zoom in",
								onClick: () => adjust(.1),
								children: "+"
							})
						]
					})
				]
			});
		}
		function GraphCanvas({ graph, run, sessions, selectedNodeId, zoom, onSelectNode, openSession }) {
			const layout = (0, react.useMemo)(() => layoutDag(graph.input), [graph]);
			const [expandedAgentNodeId, setExpandedAgentNodeId] = (0, react.useState)();
			const scaledWidth = layout.width * zoom;
			const scaledHeight = layout.height * zoom;
			const stageStyle = {
				width: layout.width,
				height: layout.height,
				transform: `scale(${zoom})`
			};
			const wrapStyle = {
				width: scaledWidth,
				height: scaledHeight,
				minWidth: "100%"
			};
			(0, react.useEffect)(() => setExpandedAgentNodeId(void 0), [graph.graphDigest, run?.runId]);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dog-canvas-scroll",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dog-canvas-stage-wrap",
					style: wrapStyle,
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dog-canvas-stage",
						style: stageStyle,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
							className: "dog-edges",
							width: layout.width,
							height: layout.height,
							"aria-hidden": "true",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("marker", {
								id: "dog-dependency-arrow",
								markerWidth: "8",
								markerHeight: "8",
								refX: "7",
								refY: "4",
								orient: "auto",
								markerUnits: "strokeWidth",
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
									d: "M 0 0 L 8 4 L 0 8 z",
									fill: "#c07a39"
								})
							}) }), layout.edges.map((edge) => {
								const connected = selectedNodeId === void 0 || edge.source === selectedNodeId || edge.target === selectedNodeId;
								return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
									className: "dog-edge",
									"data-kind": edge.kind,
									"data-muted": !connected,
									"data-highlighted": connected && selectedNodeId !== void 0,
									d: edge.path,
									markerEnd: edge.kind === "dependsOn" ? "url(#dog-dependency-arrow)" : void 0
								}, edge.id);
							})]
						}), layout.nodes.map((position) => {
							const node = graph.input.nodes[position.id];
							if (node === void 0) return null;
							const result = run?.goals[position.id] ?? { state: "pending" };
							const agents = goalAgentRefs(run, position.id);
							const expanded = expandedAgentNodeId === position.id;
							const style = {
								left: position.x,
								top: position.y,
								width: position.width,
								height: position.height
							};
							return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								className: "dog-node",
								type: "button",
								style,
								"data-selected": position.id === selectedNodeId,
								"data-root": position.id === graph.input.root,
								"data-agents-expanded": expanded || void 0,
								"aria-expanded": expanded,
								"aria-label": `${node.title}: ${humanizeState(result.state)}. Click to ${expanded ? "hide" : "show"} ${agents.length} related Agents.`,
								onClick: () => {
									onSelectNode(position.id);
									setExpandedAgentNodeId((current) => current === position.id ? void 0 : position.id);
								},
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
										className: "dog-node-top",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: position.id === graph.input.root ? "dog-node-kind dog-node-root" : "dog-node-kind",
											children: position.id === graph.input.root ? "Root goal" : `${node.constraint} · ${node.kind}`
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(StatusChip, { state: result.state })]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "dog-node-title",
										children: node.title
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
										className: "dog-node-foot",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "dog-node-id",
											children: position.id
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
											className: "dog-node-agents",
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(AgentIcon, {}), agents.length]
										})]
									})
								]
							}), expanded ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(AgentFlyout, {
								goalTitle: node.title,
								refs: agents,
								sessions,
								style: agentFlyoutStyle(position, layout.width, layout.height),
								onClose: () => setExpandedAgentNodeId(void 0),
								openSession
							}) : null] }, position.id);
						})]
					})
				})
			});
		}
		function AgentFlyout({ goalTitle, refs, sessions, style, onClose, openSession }) {
			const [openingSession, setOpeningSession] = (0, react.useState)();
			const [error, setError] = (0, react.useState)();
			const agents = refs.map((ref) => goalAgentTelemetry(ref, sessions));
			const open = async (ref) => {
				setOpeningSession(ref.sessionId);
				setError(void 0);
				try {
					if (!await openSession(ref.sessionId, ref.parentSessionId)) setError("This Agent session is no longer addressable.");
				} catch (cause) {
					setError(cause instanceof Error ? cause.message : String(cause));
				} finally {
					setOpeningSession(void 0);
				}
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: "dog-agent-flyout",
				style,
				"aria-label": `Agents related to ${goalTitle}`,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
						className: "dog-agent-flyout-head",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(AgentIcon, {}), " Related Agents"] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: onClose,
							"aria-label": "Close related Agents",
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(CloseIcon, {})
						})]
					}),
					agents.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dog-agent-empty",
						children: "No Agent has bound itself to this node."
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
						className: "dog-agent-list",
						children: agents.map((agent) => {
							const activity = agent.needsInput ? "Needs input" : agent.running ? "Running" : agent.available ? "Finished" : "Unavailable";
							return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								className: "dog-agent-row",
								type: "button",
								disabled: openingSession !== void 0,
								onClick: () => void open(agent.ref),
								"aria-label": `Open ${agent.label}, ${activity}`,
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: `dog-agent-state ${agent.running ? "dog-state-running" : agent.available ? "dog-state-success" : "dog-state-blocked"}` }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
										className: "dog-agent-copy",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "dog-agent-name",
											children: agent.label
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
											className: "dog-agent-meta",
											children: [
												humanizeState(agent.ref.role),
												" · ",
												activity
											]
										})]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
										className: "dog-agent-metrics",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: agent.tokens === void 0 ? "— tok" : `${formatCompactNumber(agent.tokens)} tok` }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: agent.durationMs === void 0 ? "—" : formatAgentDuration(agent.durationMs) })]
									})
								]
							}) }, agent.ref.sessionId);
						})
					}),
					error === void 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dog-agent-error",
						role: "status",
						children: error
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dog-agent-hint",
						children: "Click an Agent to open its native DSH conversation."
					})
				]
			});
		}
		function Inspector({ graph, run, nodeId, readGoalRuntime, openSession }) {
			const node = nodeId === void 0 ? void 0 : graph.input.nodes[nodeId];
			if (node === void 0 || nodeId === void 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("aside", {
				className: "dog-inspector",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: "dog-empty-small",
					children: "Select a goal to inspect its contract and evidence."
				})
			});
			const result = run?.goals[nodeId] ?? { state: "pending" };
			const plan = graph.acceptancePlans[nodeId];
			const parents = graph.input.contains.filter((edge) => edge.child === nodeId);
			const children = graph.input.contains.filter((edge) => edge.parent === nodeId);
			const dependencies = graph.input.dependsOn.filter((edge) => edge.source === nodeId || edge.target === nodeId);
			const reason = result.reason ?? (result.verification?.passed === false ? "Trusted verifier returned false for this sandboxed input." : void 0);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("aside", {
				className: "dog-inspector",
				"aria-label": "Selected goal details",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dog-inspector-head",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dog-inspector-title-wrap",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "dog-inspector-eyebrow",
								children: nodeId === graph.input.root ? "Root goal" : "Goal contract"
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
								className: "dog-inspector-title",
								children: node.title
							})]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(StatusChip, { state: result.state })]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dog-inspector-chips",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dog-mini-chip",
								children: node.constraint
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dog-mini-chip",
								children: node.kind
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dog-mini-chip dog-mono",
								children: nodeId
							})
						]
					}),
					reason === void 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: `dog-inspector-section ${stateClass(result.state)}`,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h4", {
							className: "dog-inspector-section-title",
							children: "Why this state"
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dog-reason",
							children: reason
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: "dog-inspector-section",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h4", {
							className: "dog-inspector-section-title",
							children: "Contract"
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dl", {
							className: "dog-definition",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "Constraint" }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: node.constraint }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "Completion" }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", {
									className: "dog-mono",
									children: node.completion === void 0 ? "atomic verifier" : formatExpression(node.completion)
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "Updated" }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: run === void 0 ? "No run yet" : formatTimestamp(run.updatedAt) }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "Graph digest" }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", {
									className: "dog-mono",
									title: graph.graphDigest,
									children: shortDigest(graph.graphDigest)
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(RuntimeContextPanel, {
						run,
						goalId: nodeId,
						readGoalRuntime,
						openSession
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(Evidence, {
						node,
						result,
						plan
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
						className: "dog-inspector-section",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h4", {
							className: "dog-inspector-section-title",
							children: "Relations"
						}), parents.length + children.length + dependencies.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: "dog-empty-small",
							children: "No graph relations."
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("ul", {
							className: "dog-relation-list",
							children: [
								parents.map((edge, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
									className: "dog-relation",
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: edge.parent }),
										" contains this goal · ",
										edge.required ? "required" : "optional",
										" · ",
										edge.failure
									]
								}, `parent:${index}`)),
								children.map((edge, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
									className: "dog-relation",
									children: [
										"Contains ",
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: edge.child }),
										" · ",
										edge.required ? "required" : "optional",
										" · ",
										edge.failure
									]
								}, `child:${index}`)),
								dependencies.map((edge, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
									className: "dog-relation",
									"data-kind": "dependsOn",
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: edge.source }),
										" depends on ",
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: edge.target }),
										edge.data === void 0 ? "" : ` · ${edge.data.join(", ")}`
									]
								}, `dependency:${index}`))
							]
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("section", {
						className: "dog-inspector-section",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("details", {
							className: "dog-raw",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("summary", { children: "Raw goal record" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", { children: JSON.stringify({
								nodeId,
								node,
								result,
								acceptancePlan: plan
							}, null, 2) })]
						})
					})
				]
			});
		}
		function RuntimeContextPanel({ run, goalId, readGoalRuntime, openSession }) {
			const [trace, setTrace] = (0, react.useState)();
			const [loading, setLoading] = (0, react.useState)(false);
			const [error, setError] = (0, react.useState)();
			const [sessionError, setSessionError] = (0, react.useState)();
			const [openingSession, setOpeningSession] = (0, react.useState)(false);
			const runId = run?.runId;
			const runState = run?.state;
			(0, react.useEffect)(() => {
				setTrace(void 0);
				setError(void 0);
				setSessionError(void 0);
				setOpeningSession(false);
				if (runId === void 0 || runState === void 0) {
					setLoading(false);
					return;
				}
				let disposed = false;
				let inFlight = false;
				const controller = new AbortController();
				const refresh = async () => {
					if (inFlight) return;
					inFlight = true;
					setLoading(true);
					try {
						const next = parseGoalRuntimeTrace(await readGoalRuntime(runId, goalId, controller.signal));
						if (next.runId !== runId || next.goalId !== goalId) throw new Error("runtime trace identity mismatch");
						if (!disposed) {
							setTrace(next);
							setError(void 0);
						}
					} catch (cause) {
						if (!disposed && !controller.signal.aborted) setError(cause instanceof Error ? cause.message : String(cause));
					} finally {
						inFlight = false;
						if (!disposed) setLoading(false);
					}
				};
				refresh();
				const timer = runState === "running" ? window.setInterval(() => void refresh(), 1500) : void 0;
				return () => {
					disposed = true;
					controller.abort();
					if (timer !== void 0) window.clearInterval(timer);
				};
			}, [
				goalId,
				readGoalRuntime,
				runId,
				runState
			]);
			if (run === void 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: "dog-inspector-section",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h4", {
					className: "dog-inspector-section-title",
					children: "Runtime context"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: "dog-empty-small dog-runtime-empty",
					children: "Run this graph to capture node activity and failure context."
				})]
			});
			const events = trace?.events ?? [];
			const latestEvent = events[events.length - 1];
			const errorEvent = [...events].reverse().find((event) => event.phase === "structured_error");
			const attempts = new Set(events.map((event) => event.attempt ?? 1)).size;
			const invocation = trace?.invocation;
			const goalState = trace?.result.state ?? run.goals[goalId]?.state ?? "pending";
			const activity = runtimeActivity(goalState, latestEvent, loading);
			const openInvoker = async () => {
				setSessionError(void 0);
				const sessionId = invocation?.agentSessionId;
				const parentSessionId = invocation?.parentSessionId;
				if (sessionId === void 0) return;
				setOpeningSession(true);
				try {
					if (!await openSession(sessionId, parentSessionId)) setSessionError("The invoking session is no longer available in this client.");
				} catch (cause) {
					setSessionError(cause instanceof Error ? cause.message : String(cause));
				} finally {
					setOpeningSession(false);
				}
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: "dog-inspector-section",
				"aria-label": "Goal runtime context",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dog-runtime-heading",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h4", {
							className: "dog-inspector-section-title",
							children: "Runtime context"
						}), loading ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: "dog-runtime-live",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "dog-runtime-pulse" }), "refreshing"]
						}) : null]
					}),
					error === void 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dog-runtime-warning",
						children: ["Context unavailable: ", error]
					}),
					trace?.runtimeWarning === void 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dog-runtime-warning",
						children: trace.runtimeWarning
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: `dog-runtime-card ${stateClass(goalState)}`,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "dog-runtime-orb" }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dog-runtime-card-copy",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "dog-runtime-activity",
								children: activity
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "dog-runtime-meta",
								children: [events.length === 0 ? "No events yet" : `${events.length} events · ${attempts} attempt${attempts === 1 ? "" : "s"}`, latestEvent?.durationMs === void 0 ? "" : ` · ${formatDuration(latestEvent.durationMs)}`]
							})]
						})]
					}),
					errorEvent === void 0 || errorEvent.reason === void 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: `dog-runtime-error ${stateClass(errorEvent.state ?? "needs_human")}`,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "Verification error" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: errorEvent.reason })]
					}),
					invocation === void 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dog-runtime-session",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "dog-runtime-session-head",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "Invoking DSH session" }), invocation.agentSessionId === void 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									className: "dog-runtime-session-button",
									type: "button",
									disabled: openingSession,
									onClick: () => void openInvoker(),
									children: openingSession ? "Opening…" : "Open session"
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dl", {
								className: "dog-definition",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "Session" }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", {
										className: "dog-mono",
										children: invocation.agentSessionId === void 0 ? "headless / unavailable" : shortId(invocation.agentSessionId)
									}),
									invocation.parentSessionId === void 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "Parent" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", {
										className: "dog-mono",
										children: shortId(invocation.parentSessionId)
									})] }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "Tool call" }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", {
										className: "dog-mono",
										title: invocation.callId,
										children: shortId(invocation.callId)
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "Invoked" }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: formatTimestamp(invocation.invokedAt) })
								]
							}),
							sessionError === void 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "dog-runtime-session-error",
								children: sessionError
							})
						]
					}),
					events.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "dog-empty-small dog-runtime-empty",
						children: loading ? "Loading node activity…" : "No runtime events were recorded for this node."
					}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ol", {
						className: "dog-runtime-timeline",
						"aria-label": "Runtime event timeline",
						children: events.map((event, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
							className: `dog-runtime-event ${stateClass(event.state ?? "running")}`,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "dog-runtime-marker" }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "dog-runtime-event-copy",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "dog-runtime-event-head",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: runtimeEventLabel(event.phase) }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("time", {
											dateTime: event.at,
											children: formatTime(event.at)
										})]
									}),
									event.attempt === void 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "dog-runtime-event-meta",
										children: ["Attempt ", event.attempt]
									}),
									runtimeEventDetail(event) === void 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
										className: "dog-runtime-event-detail",
										children: runtimeEventDetail(event)
									})
								]
							})]
						}, index))
					}),
					trace?.truncated === true ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dog-runtime-warning",
						children: "Showing the latest 64 events for this goal."
					}) : null,
					trace === void 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("details", {
						className: "dog-raw dog-runtime-raw",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("summary", { children: "Raw runtime trace" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", { children: JSON.stringify(trace, null, 2) })]
					})
				]
			});
		}
		function runtimeActivity(state, event, loading) {
			if (event === void 0) return loading ? "Loading runtime context" : state === "pending" ? "Waiting for scheduler" : humanizeState(state);
			if (event.phase === "verifier_started" && event.verifier !== void 0) return `Running ${event.verifier.mode} kernel`;
			if (event.phase === "dependency_blocked") return "Blocked by an upstream dependency";
			if (event.phase === "structured_error") return "Execution needs human review";
			if (event.phase === "goal_settled") return `Settled as ${humanizeState(event.state ?? state)}`;
			return runtimeEventLabel(event.phase);
		}
		function runtimeEventLabel(phase) {
			switch (phase) {
				case "goal_started": return "Goal started";
				case "dependency_blocked": return "Dependency blocked";
				case "grounding_extracted": return "Grounding material extracted";
				case "workspace_allocated": return "Isolated workspace allocated";
				case "verifier_started": return "Verifier started";
				case "verifier_passed": return "Verifier passed";
				case "verifier_failed": return "Verifier failed";
				case "verifier_inconclusive": return "Verifier inconclusive";
				case "composite_evaluated": return "Completion rule evaluated";
				case "result_inherited": return "Verification reused: material unchanged";
				case "verifier_released": return "Verifier worker released";
				case "verifier_bind_failed": return "Verifier worker binding failed";
				case "structured_error": return "Runtime error";
				case "goal_settled": return "Goal settled";
				case "run_warning": return "Run warning";
			}
		}
		function runtimeEventDetail(event) {
			if (event.reason !== void 0) return event.reason;
			if (event.verifier !== void 0) return `${event.verifier.mode} kernel`;
		}
		function formatDuration(value) {
			return value < 1e3 ? `${value} ms` : `${(value / 1e3).toFixed(value < 1e4 ? 1 : 0)} s`;
		}
		function Evidence({ node, result, plan }) {
			if (node.kind !== "leaf") return null;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: "dog-inspector-section",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h4", {
					className: "dog-inspector-section-title",
					children: "Trusted evidence"
				}), plan === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dog-reason dog-state-needs_human",
					children: "No compiled acceptance plan is available."
				}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dog-evidence",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dog-evidence-head",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dog-evidence-name",
							children: plan.verifier.mode === "programmatic" ? `script:${plan.verifier.script}` : "agentic"
						}), result.verification === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dog-mini-chip",
							children: "not run"
						}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(StatusChip, { state: result.verification.passed ? "success" : "failure" })]
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dog-evidence-body",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dl", {
							className: "dog-definition",
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "Sandbox file" }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", {
									className: "dog-mono",
									children: typeof plan.input?.path === "string" && plan.input.path.length > 0 ? plan.input.path : "(run workspace)"
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "Digest" }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", {
									className: "dog-mono",
									title: plan.input?.digest,
									children: plan.input === void 0 ? "—" : shortId(plan.input.digest)
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "Bytes" }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: plan.input === void 0 ? "—" : plan.input.byteLength.toLocaleString() }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "Target" }),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", {
									className: "dog-mono",
									children: plan.target
								})
							]
						}), result.verification === void 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dog-inspector-section",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h5", {
								className: "dog-inspector-section-title",
								children: "Evidence"
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "dog-observation",
								children: Object.entries(result.verification.evidence ?? {}).map(([key, value]) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "dog-observation-row",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "dog-observation-key",
										children: key
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: "dog-observation-value",
										children: formatJson(value)
									})]
								}, key))
							})]
						})]
					})]
				})]
			});
		}
		function EmptyWorkspace({ loading, error }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "dog-workspace",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
					className: "dog-empty",
					children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "dog-empty-card",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
								className: "dog-empty-icon",
								children: loading ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)(RefreshIcon, {}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(NetworkIcon, { size: 22 })
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
								className: "dog-empty-title",
								children: loading ? "Loading DoG revisions…" : error === void 0 ? "No persisted graphs yet" : "Debugger data unavailable"
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								className: "dog-empty-copy",
								children: error ?? "Create a graph with dog_create, then run it. The immutable revision and verifier evidence will appear here automatically."
							})
						]
					})
				})
			});
		}
		function StatusChip({ state }) {
			const title = state === "inherited" ? "Reused the prior run verification record: same material digest (GM) and same verifier contract. Not re-run." : void 0;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				className: `dog-status-chip ${stateClass(state)}`,
				title,
				children: humanizeState(state)
			});
		}
		function IconButton({ label, busy, onClick, children }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
				className: "dog-icon-button",
				type: "button",
				"aria-label": label,
				title: label,
				"aria-busy": busy,
				onClick,
				children
			});
		}
		function readDogDockCollapsed() {
			try {
				if (typeof window === "undefined") return true;
				const stored = window.localStorage.getItem(DOG_DOCK_COLLAPSED_KEY);
				return stored === null ? true : stored === "true";
			} catch {
				return true;
			}
		}
		function writeDogDockCollapsed(collapsed) {
			try {
				window.localStorage.setItem(DOG_DOCK_COLLAPSED_KEY, String(collapsed));
			} catch {}
		}
		function latestRun(revision) {
			return revision.runs[0];
		}
		function isAttentionGoal(state) {
			return state === "failure" || state === "needs_human" || state === "blocked" || state === "partial";
		}
		function stateClass(state) {
			return `dog-state-${state}`;
		}
		function humanizeState(state) {
			return state.replaceAll("_", " ").replace(/\b\w/gu, (letter) => letter.toUpperCase());
		}
		function formatExpression(expression) {
			switch (expression.op) {
				case "ref": return expression.id;
				case "not": return `NOT(${formatExpression(expression.item)})`;
				case "all": return `ALL(${expression.items.map(formatExpression).join(", ")})`;
				case "any": return `ANY(${expression.items.map(formatExpression).join(", ")})`;
				case "atLeast": return `AT_LEAST ${expression.count}(${expression.items.map(formatExpression).join(", ")})`;
			}
		}
		function formatJson(value) {
			return typeof value === "string" ? value : JSON.stringify(value);
		}
		function formatTime(value) {
			const date = new Date(value);
			if (Number.isNaN(date.getTime())) return value;
			return new Intl.DateTimeFormat(void 0, {
				hour: "2-digit",
				minute: "2-digit",
				month: "short",
				day: "numeric"
			}).format(date);
		}
		function formatTimestamp(value) {
			const date = new Date(value);
			if (Number.isNaN(date.getTime())) return value;
			return new Intl.DateTimeFormat(void 0, {
				dateStyle: "medium",
				timeStyle: "short"
			}).format(date);
		}
		function shortDigest(value) {
			return `${value.slice(0, 8)}…${value.slice(-5)}`;
		}
		function shortId(value) {
			return value.length <= 17 ? value : `${value.slice(0, 9)}…${value.slice(-6)}`;
		}
		function formatCompactNumber(value) {
			return new Intl.NumberFormat("en-US", {
				notation: "compact",
				maximumFractionDigits: 1
			}).format(value);
		}
		function formatTokenMetric(tokens, partial) {
			if (tokens === void 0) return "—";
			const formatted = formatCompactNumber(tokens);
			return partial ? `≥${formatted}` : formatted;
		}
		function formatAgentDuration(value) {
			if (value < 6e4) return `${Math.max(1, Math.round(value / 1e3))}s`;
			if (value < 36e5) return `${Math.round(value / 6e4)}m`;
			return `${(value / 36e5).toFixed(value < 36e6 ? 1 : 0)}h`;
		}
		function agentFlyoutStyle(position, canvasWidth, canvasHeight) {
			const width = 228;
			const gap = 10;
			const right = position.x + position.width + gap;
			const left = right + width <= canvasWidth ? right : Math.max(gap, position.x - width - gap);
			const maxHeight = Math.max(150, canvasHeight - 20);
			return {
				left,
				top: Math.min(Math.max(gap, position.y - 4), Math.max(gap, canvasHeight - Math.min(250, maxHeight) - gap)),
				width,
				maxHeight
			};
		}
		function clampZoom(value) {
			return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(value * 10) / 10));
		}
		function NetworkIcon({ size = 16 }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 24 24",
				fill: "none",
				"aria-hidden": "true",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
						cx: "12",
						cy: "5",
						r: "2.5",
						fill: "currentColor"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
						cx: "5",
						cy: "18",
						r: "2.5",
						fill: "currentColor"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
						cx: "19",
						cy: "18",
						r: "2.5",
						fill: "currentColor"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						d: "M10.6 7.1 6.4 15.6M13.4 7.1l4.2 8.5M7.5 18h9",
						stroke: "currentColor",
						strokeWidth: "1.6",
						strokeLinecap: "round"
					})
				]
			});
		}
		function AgentIcon() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				width: "13",
				height: "13",
				viewBox: "0 0 24 24",
				fill: "none",
				"aria-hidden": "true",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
						cx: "12",
						cy: "8",
						r: "3.2",
						stroke: "currentColor",
						strokeWidth: "1.7"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						d: "M5.5 19c.5-3.4 2.7-5.3 6.5-5.3s6 1.9 6.5 5.3",
						stroke: "currentColor",
						strokeWidth: "1.7",
						strokeLinecap: "round"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
						d: "M18.3 7.2h2.2M19.4 6.1v2.2",
						stroke: "currentColor",
						strokeWidth: "1.5",
						strokeLinecap: "round"
					})
				]
			});
		}
		function RefreshIcon() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				width: "16",
				height: "16",
				viewBox: "0 0 24 24",
				fill: "none",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					d: "M19 8a8 8 0 1 0 1 7M19 4v4h-4",
					stroke: "currentColor",
					strokeWidth: "1.8",
					strokeLinecap: "round",
					strokeLinejoin: "round"
				})
			});
		}
		function CloseIcon() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				width: "17",
				height: "17",
				viewBox: "0 0 24 24",
				fill: "none",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					d: "m6 6 12 12M18 6 6 18",
					stroke: "currentColor",
					strokeWidth: "1.8",
					strokeLinecap: "round"
				})
			});
		}
		function DockCollapseIcon() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				width: "16",
				height: "16",
				viewBox: "0 0 24 24",
				fill: "none",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					d: "m14.5 6-6 6 6 6",
					stroke: "currentColor",
					strokeWidth: "1.8",
					strokeLinecap: "round",
					strokeLinejoin: "round"
				})
			});
		}
		function DockExpandIcon() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				width: "14",
				height: "14",
				viewBox: "0 0 24 24",
				fill: "none",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					d: "m9.5 6 6 6-6 6",
					stroke: "currentColor",
					strokeWidth: "1.8",
					strokeLinecap: "round",
					strokeLinejoin: "round"
				})
			});
		}
		function RootIcon() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("svg", {
				width: "16",
				height: "16",
				viewBox: "0 0 24 24",
				fill: "none",
				"aria-hidden": "true",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					d: "M12 3 4.5 7.2v9.6L12 21l7.5-4.2V7.2L12 3Z",
					stroke: "currentColor",
					strokeWidth: "1.7"
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("circle", {
					cx: "12",
					cy: "12",
					r: "2.3",
					fill: "currentColor"
				})]
			});
		}
		//#endregion
		//#region src/client/sessionNavigation.ts
		const DEFAULT_SELECTION_TIMEOUT_MS = 2e3;
		function selected(sessions, id) {
			const snapshot = sessions.list.getSnapshot();
			if ("current" in snapshot) return snapshot.current === id;
			return ((snapshot.byId?.[id])?.retainedBy?.mainView ?? 0) > 0;
		}
		async function refreshInvocationCatalog(sessions, parent) {
			if (typeof sessions.refreshSubagents === "function") await sessions.refreshSubagents(parent);
		}
		/**
		* Select a persisted invocation session and confirm that DSH actually staged it.
		* Returns false only when neither the ordinary session list nor a refreshed
		* direct-parent catalog can address the target.
		*/
		async function openInvocationSession(sessions, rawSessionId, rawParentSessionId, timeoutMs = DEFAULT_SELECTION_TIMEOUT_MS, uiWorkspace) {
			const sessionId = rawSessionId;
			if (selected(sessions, sessionId)) return true;
			if (sessions.list.getSnapshot().ids.includes(sessionId)) {
				await selectAndConfirm(sessions, sessionId, () => {
					if (uiWorkspace) uiWorkspace.openSession(sessionId);
					else if (sessions.open) sessions.open(sessionId);
					else throw new Error("DSH exposes no session navigation API");
				}, timeoutMs);
				return true;
			}
			let address = sessions.subagentAddress?.(sessionId);
			if (address === void 0 && rawParentSessionId !== void 0) {
				await refreshInvocationCatalog(sessions, rawParentSessionId);
				address = sessions.subagentAddress?.(sessionId);
				if (!address && uiWorkspace) address = {
					parentSessionId: rawParentSessionId,
					childSessionId: sessionId,
					mode: "continuable"
				};
			}
			if (address === void 0) return false;
			const target = address;
			await selectAndConfirm(sessions, sessionId, () => {
				if (uiWorkspace) uiWorkspace.openSession(target);
				else if (sessions.openSubagent) sessions.openSubagent(target);
				else throw new Error("DSH exposes no subagent navigation API");
			}, timeoutMs);
			return true;
		}
		async function selectAndConfirm(sessions, sessionId, select, timeoutMs) {
			await new Promise((resolve, reject) => {
				let settled = false;
				let unsubscribe = () => void 0;
				const finish = (error) => {
					if (settled) return;
					settled = true;
					clearTimeout(timer);
					unsubscribe();
					if (error === void 0) resolve();
					else reject(error);
				};
				const confirm = () => {
					if (selected(sessions, sessionId)) finish();
				};
				const timer = setTimeout(() => {
					finish(/* @__PURE__ */ new Error(`DSH did not select session ${sessionId} within ${timeoutMs} ms`));
				}, timeoutMs);
				unsubscribe = sessions.list.subscribe(confirm);
				try {
					select();
					confirm();
				} catch (cause) {
					finish(cause instanceof Error ? cause : new Error(String(cause)));
				}
			});
		}
		//#endregion
		//#region src/client/styles.ts
		/** Scoped styles for the frame overlay; installed and removed with the client plugin fiber. */
		const DOG_DEBUG_STYLE_ID = "@dsh-external/dsh-dog/debugger";
		const DOG_DEBUG_CSS = String.raw`
.dog-overlay-root,
.dog-overlay-root * { box-sizing: border-box; }
.dog-overlay-root { pointer-events: none; font-family: inherit; }
.dog-dock {
  pointer-events: auto; position: fixed; top: 14px; right: 16px; bottom: 14px; z-index: 380;
  width: min(354px, calc(100vw - 24px)); display: flex; flex-direction: column;
  color: var(--dsw-alias-label-primary); background: color-mix(in srgb, var(--dsw-alias-bg-base) 92%, #7065e9 8%);
  border: 1px solid color-mix(in srgb, #7165e9 35%, var(--dsw-alias-border-l1)); border-radius: 16px;
  box-shadow: 0 16px 48px rgba(12, 16, 29, .22); backdrop-filter: blur(18px) saturate(1.08); overflow: hidden;
}
.dog-overlay-root[data-dog-dock-layout=hidden] .dog-dock { display: none; }
.dog-overlay-root[data-dog-dock-layout=floating] .dog-dock { top: 70px; bottom: auto; max-height: min(346px, calc(100dvh - 84px)); }
.dog-overlay-root[data-dog-dock-layout=collapsed] .dog-dock { top: 50%; right: 10px; bottom: auto; width: 46px; max-height: none; transform: translateY(-50%); border-radius: 14px; }
.dog-dock-rail { width: 100%; min-height: 112px; border: 0; padding: 9px 4px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 9px; color: var(--dsw-alias-label-secondary); background: transparent; cursor: pointer; font: inherit; }
.dog-dock-rail:hover { color: var(--dsw-alias-label-primary); background: color-mix(in srgb, #7165e9 9%, transparent); }
.dog-dock-rail-mark { width: 28px; height: 28px; border-radius: 9px; display: grid; place-items: center; color: #fff; background: linear-gradient(145deg, #8174ff, #4b41ba); box-shadow: 0 5px 13px rgba(92, 78, 203, .22); }
.dog-dock-rail strong { font-size: 10px; line-height: 14px; letter-spacing: .035em; }
.dog-dock[data-collapsed=false] { display: grid; grid-template-columns: 32px minmax(0, 1fr); }
.dog-dock-collapse-slot { min-height: 0; display: flex; align-items: center; justify-content: center; border-right: 1px solid color-mix(in srgb, var(--dsw-alias-border-l2) 72%, transparent); background: color-mix(in srgb, #7165e9 4%, transparent); }
.dog-dock-collapse-handle { width: 24px; height: 64px; border: 1px solid color-mix(in srgb, #7165e9 28%, var(--dsw-alias-border-l2)); border-radius: 8px; display: grid; place-items: center; color: var(--dsw-alias-label-secondary); background: color-mix(in srgb, var(--dsw-alias-bg-layer-3, var(--dsw-alias-bg-base)) 92%, #7165e9 8%); cursor: pointer; }
.dog-dock-collapse-handle:hover { color: var(--dsw-alias-label-primary); border-color: color-mix(in srgb, #7165e9 48%, var(--dsw-alias-border-l2)); background: color-mix(in srgb, #7165e9 13%, var(--dsw-alias-bg-base)); }
.dog-dock-content { min-width: 0; min-height: 0; display: flex; flex-direction: column; overflow: hidden; }
.dog-dock-header { min-height: 50px; padding: 7px 8px 7px 10px; display: flex; align-items: center; gap: 9px; border-bottom: 1px solid var(--dsw-alias-border-l2); }
.dog-dock-mark { width: 30px; height: 30px; flex: none; border-radius: 10px; display: grid; place-items: center; color: #fff; background: linear-gradient(145deg, #8174ff, #4b41ba); box-shadow: 0 6px 16px rgba(92, 78, 203, .23); }
.dog-dock-heading { min-width: 0; flex: 1; display: flex; flex-direction: column; }
.dog-dock-heading h2 { margin: 0; font-size: 12px; line-height: 17px; font-weight: 680; letter-spacing: -.01em; }
.dog-dock-heading span { color: var(--dsw-alias-label-tertiary); font-size: 9.5px; line-height: 14px; }
.dog-dock-error { padding: 4px 10px; color: #c94a45; background: color-mix(in srgb, #d5534d 7%, transparent); font-size: 8.5px; line-height: 12px; }
.dog-dock-list { min-height: 0; flex: 1; margin: 0; padding: 7px; list-style: none; display: flex; flex-direction: column; gap: 5px; overflow: auto; }
.dog-dock-list li { min-width: 0; }
.dog-dock-card { width: 100%; min-width: 0; border: 1px solid var(--dsw-alias-border-l2); border-radius: 11px; padding: 8px 9px; display: block; color: inherit; background: color-mix(in srgb, var(--dsw-alias-bg-layer-3, var(--dsw-alias-bg-base)) 92%, #7165e9 3%); cursor: pointer; text-align: left; font: inherit; transition: border-color 120ms ease, background 120ms ease, transform 120ms ease; }
.dog-dock-card:hover { transform: translateY(-1px); border-color: color-mix(in srgb, #7165e9 42%, var(--dsw-alias-border-l2)); background: color-mix(in srgb, var(--dsw-alias-bg-layer-3, var(--dsw-alias-bg-base)) 88%, #7165e9 7%); }
.dog-dock-card:has(.dog-state-failure), .dog-dock-card:has(.dog-state-needs_replan), .dog-dock-card:has(.dog-state-needs_human) { border-color: color-mix(in srgb, #d18135 34%, var(--dsw-alias-border-l2)); }
.dog-dock-card-head { min-width: 0; display: flex; align-items: flex-start; gap: 7px; }
.dog-dock-title-wrap { min-width: 0; flex: 1; display: flex; flex-direction: column; }
.dog-dock-title { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 11px; line-height: 16px; font-weight: 630; }
.dog-dock-id { margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--dsw-alias-label-tertiary); font: 8px/12px ui-monospace, SFMono-Regular, Menlo, monospace; }
.dog-dock-progress { height: 3px; margin-top: 7px; display: block; border-radius: 999px; background: color-mix(in srgb, var(--dsw-alias-label-tertiary) 16%, transparent); overflow: hidden; }
.dog-dock-progress > span { display: block; height: 100%; border-radius: inherit; background: #7165e9; transition: width 180ms ease; }
.dog-dock-metrics { min-width: 0; margin-top: 5px; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 5px; color: var(--dsw-alias-label-tertiary); font-size: 8px; line-height: 12px; }
.dog-dock-metrics > span { min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dog-dock-metrics strong { color: var(--dsw-alias-label-secondary); font-weight: 650; }
.dog-dock-empty { padding: 17px 14px; display: flex; flex-direction: column; align-items: center; gap: 3px; color: var(--dsw-alias-label-tertiary); text-align: center; font-size: 9px; line-height: 14px; }
.dog-dock-empty strong { margin-top: 3px; color: var(--dsw-alias-label-secondary); font-size: 10px; }
.dog-dock-empty-icon { width: 32px; height: 32px; border-radius: 10px; display: grid; place-items: center; color: #7165e9; background: color-mix(in srgb, #7165e9 11%, transparent); }
.dog-dock-footer { padding: 6px 10px 7px; border-top: 1px solid var(--dsw-alias-border-l2); color: var(--dsw-alias-label-caption, var(--dsw-alias-label-tertiary)); font-size: 8.5px; line-height: 12px; text-align: center; }
.dog-dock-card:focus-visible, .dog-dock-rail:focus-visible, .dog-dock-collapse-handle:focus-visible, .dog-icon-button:focus-visible, .dog-list-button:focus-visible, .dog-node:focus-visible, .dog-agent-row:focus-visible,
.dog-segment-button:focus-visible, .dog-zoom-button:focus-visible, .dog-runtime-session-button:focus-visible { outline: 2px solid #776cf1; outline-offset: 2px; }
.dog-backdrop { pointer-events: auto; position: fixed; inset: 0; z-index: 400; display: block; background: var(--dsw-alias-bg-base); animation: dog-fade-in 120ms ease-out; }
.dog-dialog {
  width: 100vw; height: 100dvh; min-height: 0; display: grid; grid-template-rows: 68px minmax(0, 1fr);
  color: var(--dsw-alias-label-primary); background: var(--dsw-alias-bg-base); overflow: hidden; animation: dog-dialog-in 160ms cubic-bezier(.2,.8,.2,1);
}
.dog-header { min-width: 0; padding: 0 18px 0 20px; display: flex; align-items: center; gap: 14px; border-bottom: 1px solid var(--dsw-alias-border-l2); background: color-mix(in srgb, var(--dsw-alias-bg-base) 94%, #7065e9 6%); }
.dog-brand { min-width: 0; display: flex; align-items: center; gap: 11px; }
.dog-brand-mark { width: 34px; height: 34px; border-radius: 11px; display: grid; place-items: center; color: #fff; background: linear-gradient(145deg, #8174ff, #4b41ba); box-shadow: 0 7px 18px rgba(92, 78, 203, .24); }
.dog-brand-copy { min-width: 0; }
.dog-brand-title { margin: 0; font-size: 15px; line-height: 21px; font-weight: 680; letter-spacing: -.01em; }
.dog-brand-subtitle { margin: 1px 0 0; color: var(--dsw-alias-label-tertiary); font-size: 11px; line-height: 16px; }
.dog-header-divider { width: 1px; height: 28px; margin: 0 2px; background: var(--dsw-alias-border-l2); }
.dog-context { min-width: 0; display: flex; flex: 1; align-items: center; gap: 9px; }
.dog-context-title { min-width: 0; max-width: 420px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 13px; font-weight: 560; }
.dog-revision-chip, .dog-status-chip, .dog-mini-chip { border-radius: 999px; white-space: nowrap; display: inline-flex; align-items: center; gap: 5px; }
.dog-revision-chip { height: 24px; padding: 0 8px; color: #655acb; background: color-mix(in srgb, #7165e9 13%, transparent); font-size: 10px; font-weight: 650; letter-spacing: .045em; text-transform: uppercase; }
.dog-header-actions { flex: none; display: flex; align-items: center; gap: 7px; }
.dog-sync-copy { margin-right: 3px; color: var(--dsw-alias-label-caption, var(--dsw-alias-label-tertiary)); font-size: 10px; white-space: nowrap; }
.dog-icon-button, .dog-zoom-button { border: 0; color: var(--dsw-alias-label-secondary); background: transparent; cursor: pointer; font: inherit; display: inline-grid; place-items: center; }
.dog-icon-button { width: 34px; height: 34px; border-radius: 10px; }
.dog-icon-button:hover, .dog-zoom-button:hover { color: var(--dsw-alias-label-primary); background: var(--dsw-alias-interactive-bg-hover); }
.dog-icon-button[aria-busy=true] svg { animation: dog-spin .8s linear infinite; }
.dog-workspace { position: relative; min-width: 0; min-height: 0; display: grid; grid-template-columns: 246px minmax(0, 1fr) 324px; }
.dog-sidebar, .dog-inspector { min-width: 0; min-height: 0; background: color-mix(in srgb, var(--dsw-specific-sidebar-fill, var(--dsw-alias-bg-base)) 82%, var(--dsw-alias-bg-base) 18%); overflow: auto; }
.dog-sidebar { border-right: 1px solid var(--dsw-alias-border-l2); padding: 17px 12px 18px; }
.dog-inspector { border-left: 1px solid var(--dsw-alias-border-l2); padding: 18px 16px 28px; }
.dog-section-label { margin: 0 7px 9px; color: var(--dsw-alias-label-caption, var(--dsw-alias-label-tertiary)); font-size: 10px; line-height: 16px; font-weight: 700; letter-spacing: .095em; text-transform: uppercase; }
.dog-graph-list, .dog-run-list { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 4px; }
.dog-sidebar-divider { height: 1px; margin: 17px 7px; background: var(--dsw-alias-border-l2); }
.dog-list-button { width: 100%; border: 1px solid transparent; border-radius: 11px; padding: 9px 9px 8px; color: inherit; background: transparent; cursor: pointer; text-align: left; font: inherit; transition: background 120ms ease, border-color 120ms ease; }
.dog-list-button:hover { background: var(--dsw-alias-interactive-bg-hover); }
.dog-list-button[data-selected=true] { border-color: color-mix(in srgb, #7165e9 30%, var(--dsw-alias-border-l2)); background: color-mix(in srgb, #7165e9 10%, var(--dsw-alias-bg-base)); }
.dog-list-row { min-width: 0; display: flex; align-items: center; gap: 8px; }
.dog-list-title { min-width: 0; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 12px; line-height: 18px; font-weight: 590; }
.dog-list-meta { min-width: 0; margin-top: 4px; padding-left: 16px; display: flex; align-items: center; gap: 6px; overflow: hidden; white-space: nowrap; color: var(--dsw-alias-label-tertiary); font-size: 10px; line-height: 15px; }
.dog-list-meta > :last-child { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
.dog-list-current { color: #6e63dd; font-weight: 650; }
.dog-state-dot { width: 8px; height: 8px; border-radius: 50%; flex: none; background: #8a929c; box-shadow: 0 0 0 3px color-mix(in srgb, currentColor 12%, transparent); }
.dog-empty-small { margin: 0 7px; color: var(--dsw-alias-label-tertiary); font-size: 11px; line-height: 18px; }
.dog-main { min-width: 0; min-height: 0; display: grid; grid-template-rows: auto minmax(0, 1fr); background: var(--dsw-alias-bg-base); }
.dog-summary { min-width: 0; padding: 14px 18px 13px; display: grid; grid-template-columns: minmax(190px, 1fr) repeat(4, minmax(82px, 116px)); gap: 10px; border-bottom: 1px solid var(--dsw-alias-border-l2); }
.dog-summary-primary, .dog-metric { min-width: 0; min-height: 55px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 12px; background: color-mix(in srgb, var(--dsw-alias-bg-layer-3, var(--dsw-alias-bg-base)) 88%, #7065e9 3%); }
.dog-summary-primary { padding: 9px 11px; display: flex; align-items: center; gap: 11px; }
.dog-root-orb { width: 34px; height: 34px; flex: none; border-radius: 50%; display: grid; place-items: center; color: white; }
.dog-summary-copy { min-width: 0; }
.dog-summary-kicker, .dog-metric-label { color: var(--dsw-alias-label-tertiary); font-size: 9px; line-height: 14px; font-weight: 680; letter-spacing: .08em; text-transform: uppercase; }
.dog-summary-value { margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 12px; line-height: 18px; font-weight: 610; }
.dog-metric { padding: 8px 10px; }
.dog-metric-value { margin-top: 1px; font-size: 17px; line-height: 23px; font-weight: 680; letter-spacing: -.025em; }
.dog-canvas-shell { min-width: 0; min-height: 0; display: grid; grid-template-rows: 40px minmax(0, 1fr); }
.dog-canvas-toolbar { padding: 0 15px 0 18px; display: flex; align-items: center; gap: 14px; border-bottom: 1px solid color-mix(in srgb, var(--dsw-alias-border-l2) 70%, transparent); }
.dog-legend { display: flex; align-items: center; gap: 12px; color: var(--dsw-alias-label-tertiary); font-size: 10px; }
.dog-legend-item { display: inline-flex; align-items: center; gap: 5px; }
.dog-legend-line { width: 21px; height: 0; border-top: 1.5px solid #857ce2; }
.dog-legend-line[data-kind=depends] { border-top-style: dashed; border-color: #c07a39; }
.dog-canvas-spacer { flex: 1; }
.dog-zoom { height: 28px; padding: 0 3px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 9px; display: flex; align-items: center; }
.dog-zoom-button { width: 24px; height: 22px; border-radius: 6px; font-size: 15px; }
.dog-zoom-value { width: 39px; text-align: center; color: var(--dsw-alias-label-tertiary); font-size: 10px; }
.dog-canvas-scroll { min-width: 0; min-height: 0; position: relative; overflow: auto; background-color: color-mix(in srgb, var(--dsw-alias-bg-base) 96%, #7065e9 4%); background-image: radial-gradient(color-mix(in srgb, var(--dsw-alias-label-tertiary) 20%, transparent) .7px, transparent .7px); background-size: 20px 20px; }
.dog-canvas-stage-wrap { position: relative; margin: 0 auto; }
.dog-canvas-stage { position: absolute; top: 0; left: 0; transform-origin: top left; }
.dog-edges { position: absolute; inset: 0; overflow: visible; pointer-events: none; }
.dog-edge { fill: none; stroke-width: 1.5; }
.dog-edge[data-kind=contains] { stroke: #857ce2; }
.dog-edge[data-kind=dependsOn] { stroke: #c07a39; stroke-width: 1.35; stroke-dasharray: 6 5; }
.dog-edge[data-muted=true] { opacity: .22; }
.dog-edge[data-highlighted=true] { stroke-width: 2.4; filter: drop-shadow(0 0 3px color-mix(in srgb, currentColor 45%, transparent)); }
.dog-node { position: absolute; border: 1px solid var(--dsw-alias-border-l2); border-radius: 14px; padding: 10px 11px 9px; display: flex; flex-direction: column; color: var(--dsw-alias-label-primary); background: color-mix(in srgb, var(--dsw-alias-bg-layer-3, var(--dsw-alias-bg-base)) 94%, #7165e9 2%); box-shadow: 0 4px 14px rgba(14, 18, 29, .05); cursor: pointer; text-align: left; font: inherit; transition: border-color 120ms ease, box-shadow 120ms ease, transform 120ms ease; }
.dog-node:hover { transform: translateY(-2px); border-color: color-mix(in srgb, #7165e9 45%, var(--dsw-alias-border-l2)); box-shadow: 0 8px 22px rgba(28, 31, 52, .11); }
.dog-node[data-selected=true] { border-color: #7165e9; box-shadow: 0 0 0 3px color-mix(in srgb, #7165e9 14%, transparent), 0 9px 24px rgba(28,31,52,.12); }
.dog-node[data-root=true] { background: color-mix(in srgb, var(--dsw-alias-bg-layer-3, var(--dsw-alias-bg-base)) 88%, #7165e9 8%); }
.dog-node-top { display: flex; align-items: center; gap: 7px; }
.dog-node-kind { flex: 1; color: var(--dsw-alias-label-tertiary); font-size: 9px; line-height: 13px; font-weight: 700; letter-spacing: .085em; text-transform: uppercase; }
.dog-node-root { color: #6c61d6; }
.dog-node-title { margin-top: 8px; min-height: 34px; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; font-size: 12px; line-height: 17px; font-weight: 620; }
.dog-node-foot { margin-top: auto; display: flex; align-items: center; justify-content: space-between; gap: 7px; }
.dog-node-id { min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--dsw-alias-label-caption, var(--dsw-alias-label-tertiary)); font: 9px/13px ui-monospace, SFMono-Regular, Menlo, monospace; }
.dog-status-chip { height: 19px; padding: 0 6px; color: var(--dog-state-color); background: color-mix(in srgb, var(--dog-state-color) 13%, transparent); font-size: 9px; line-height: 14px; font-weight: 700; letter-spacing: .035em; text-transform: uppercase; }
.dog-status-chip:before { content: ''; width: 5px; height: 5px; border-radius: 50%; background: var(--dog-state-color); }
.dog-node[data-agents-expanded=true] { border-color: color-mix(in srgb, #7165e9 62%, var(--dsw-alias-border-l2)); }
.dog-node-agents { flex: none; display: inline-flex; align-items: center; gap: 3px; color: #6b60d4; font-size: 9px; line-height: 13px; font-weight: 650; }
.dog-agent-flyout { position: absolute; z-index: 8; min-height: 116px; display: flex; flex-direction: column; color: var(--dsw-alias-label-primary); background: color-mix(in srgb, var(--dsw-alias-bg-base) 96%, #7165e9 4%); border: 1px solid color-mix(in srgb, #7165e9 35%, var(--dsw-alias-border-l2)); border-radius: 13px; box-shadow: 0 14px 34px rgba(12, 16, 29, .22); overflow: hidden; }
.dog-agent-flyout-head { min-height: 35px; padding: 6px 7px 6px 9px; display: flex; align-items: center; gap: 6px; border-bottom: 1px solid var(--dsw-alias-border-l2); }
.dog-agent-flyout-head > span { min-width: 0; flex: 1; display: inline-flex; align-items: center; gap: 5px; font-size: 9.5px; line-height: 14px; font-weight: 680; }
.dog-agent-flyout-head button { width: 25px; height: 25px; border: 0; border-radius: 7px; display: grid; place-items: center; color: var(--dsw-alias-label-tertiary); background: transparent; cursor: pointer; }
.dog-agent-flyout-head button:hover { color: var(--dsw-alias-label-primary); background: var(--dsw-alias-interactive-bg-hover); }
.dog-agent-list { min-height: 0; margin: 0; padding: 5px; list-style: none; overflow: auto; }
.dog-agent-list li + li { margin-top: 3px; }
.dog-agent-row { width: 100%; min-width: 0; border: 0; border-radius: 8px; padding: 7px 6px; display: grid; grid-template-columns: 8px minmax(0, 1fr) auto; align-items: center; gap: 7px; color: inherit; background: transparent; cursor: pointer; text-align: left; font: inherit; }
.dog-agent-row:hover { background: var(--dsw-alias-interactive-bg-hover); }
.dog-agent-row:disabled { cursor: wait; opacity: .66; }
.dog-agent-state { width: 7px; height: 7px; border-radius: 50%; background: var(--dog-state-color); box-shadow: 0 0 0 3px color-mix(in srgb, var(--dog-state-color) 12%, transparent); }
.dog-agent-copy, .dog-agent-metrics { min-width: 0; display: flex; flex-direction: column; }
.dog-agent-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 9.5px; line-height: 14px; font-weight: 630; }
.dog-agent-meta { color: var(--dsw-alias-label-tertiary); font-size: 8px; line-height: 12px; }
.dog-agent-metrics { align-items: flex-end; color: var(--dsw-alias-label-tertiary); font: 8px/12px ui-monospace, SFMono-Regular, Menlo, monospace; white-space: nowrap; }
.dog-agent-empty { margin: auto 0; padding: 13px 10px; color: var(--dsw-alias-label-tertiary); text-align: center; font-size: 9px; line-height: 14px; }
.dog-agent-hint { padding: 5px 8px 6px; border-top: 1px solid var(--dsw-alias-border-l2); color: var(--dsw-alias-label-caption, var(--dsw-alias-label-tertiary)); text-align: center; font-size: 7.5px; line-height: 11px; }
.dog-agent-error { padding: 5px 8px; color: #c94a45; background: color-mix(in srgb, #d5534d 7%, transparent); font-size: 8px; line-height: 12px; overflow-wrap: anywhere; }
.dog-inspector-head { display: flex; align-items: flex-start; gap: 10px; }
.dog-inspector-title-wrap { min-width: 0; flex: 1; }
.dog-inspector-eyebrow { color: var(--dsw-alias-label-tertiary); font-size: 9px; line-height: 14px; font-weight: 700; letter-spacing: .09em; text-transform: uppercase; }
.dog-inspector-title { margin: 3px 0 0; overflow-wrap: anywhere; font-size: 15px; line-height: 21px; font-weight: 660; }
.dog-inspector-chips { margin-top: 10px; display: flex; flex-wrap: wrap; gap: 6px; }
.dog-mini-chip { height: 21px; padding: 0 7px; color: var(--dsw-alias-label-secondary); background: var(--dsw-alias-interactive-bg-hover); font-size: 9px; font-weight: 650; text-transform: uppercase; letter-spacing: .045em; }
.dog-inspector-section { margin-top: 18px; }
.dog-inspector-section-title { margin: 0 0 8px; color: var(--dsw-alias-label-tertiary); font-size: 9px; line-height: 14px; font-weight: 700; letter-spacing: .09em; text-transform: uppercase; }
.dog-reason { border: 1px solid color-mix(in srgb, var(--dog-state-color) 33%, var(--dsw-alias-border-l2)); border-radius: 10px; padding: 9px 10px; color: var(--dsw-alias-label-secondary); background: color-mix(in srgb, var(--dog-state-color) 7%, transparent); font-size: 11px; line-height: 17px; overflow-wrap: anywhere; }
.dog-definition { margin: 0; display: grid; grid-template-columns: minmax(82px, .7fr) minmax(0, 1.3fr); gap: 7px 9px; font-size: 10px; line-height: 16px; }
.dog-definition dt { color: var(--dsw-alias-label-tertiary); }
.dog-definition dd { min-width: 0; margin: 0; color: var(--dsw-alias-label-secondary); overflow-wrap: anywhere; }
.dog-mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 9.5px; }
.dog-evidence { border: 1px solid var(--dsw-alias-border-l2); border-radius: 11px; overflow: hidden; }
.dog-evidence-head { min-height: 35px; padding: 7px 9px; display: flex; align-items: center; gap: 8px; background: color-mix(in srgb, var(--dsw-alias-bg-layer-3, var(--dsw-alias-bg-base)) 90%, #7165e9 4%); border-bottom: 1px solid var(--dsw-alias-border-l2); }
.dog-evidence-name { min-width: 0; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font: 10px/16px ui-monospace, SFMono-Regular, Menlo, monospace; }
.dog-evidence-body { padding: 8px 9px 9px; }
.dog-observation { margin: 0; display: grid; gap: 5px; }
.dog-observation-row { display: grid; grid-template-columns: minmax(76px, .75fr) minmax(0, 1.25fr); gap: 8px; font-size: 10px; line-height: 15px; }
.dog-observation-key { color: var(--dsw-alias-label-tertiary); overflow-wrap: anywhere; }
.dog-observation-value { color: var(--dsw-alias-label-secondary); overflow-wrap: anywhere; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
.dog-relation-list { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 6px; }
.dog-relation { border-left: 2px solid #857ce2; padding-left: 8px; color: var(--dsw-alias-label-secondary); font-size: 10px; line-height: 15px; }
.dog-relation[data-kind=dependsOn] { border-color: #c07a39; }
.dog-relation strong { color: var(--dsw-alias-label-primary); font-weight: 600; }
.dog-raw { border: 1px solid var(--dsw-alias-border-l2); border-radius: 10px; overflow: hidden; }
.dog-raw summary { padding: 7px 9px; color: var(--dsw-alias-label-secondary); cursor: pointer; font-size: 10px; }
.dog-raw pre { max-height: 240px; margin: 0; padding: 9px; border-top: 1px solid var(--dsw-alias-border-l2); color: var(--dsw-alias-label-tertiary); background: color-mix(in srgb, var(--dsw-alias-bg-base) 94%, #000 6%); white-space: pre-wrap; overflow: auto; font: 9px/15px ui-monospace, SFMono-Regular, Menlo, monospace; }
.dog-runtime-heading { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.dog-runtime-heading .dog-inspector-section-title { margin-bottom: 8px; }
.dog-runtime-live { display: inline-flex; align-items: center; gap: 5px; color: #3c7fe1; font-size: 9px; font-weight: 650; letter-spacing: .04em; text-transform: uppercase; }
.dog-runtime-pulse { width: 6px; height: 6px; border-radius: 50%; background: #3c7fe1; box-shadow: 0 0 0 0 rgba(60,127,225,.35); animation: dog-runtime-pulse 1.5s ease-out infinite; }
.dog-runtime-card { min-width: 0; border: 1px solid color-mix(in srgb, var(--dog-state-color) 25%, var(--dsw-alias-border-l2)); border-radius: 11px; padding: 9px 10px; display: flex; align-items: center; gap: 9px; background: color-mix(in srgb, var(--dog-state-color) 6%, var(--dsw-alias-bg-base)); }
.dog-runtime-orb { width: 10px; height: 10px; flex: none; border-radius: 50%; background: var(--dog-state-color); box-shadow: 0 0 0 4px color-mix(in srgb, var(--dog-state-color) 13%, transparent); }
.dog-runtime-card-copy { min-width: 0; }
.dog-runtime-activity { color: var(--dsw-alias-label-primary); overflow-wrap: anywhere; font-size: 11px; line-height: 16px; font-weight: 620; }
.dog-runtime-meta { margin-top: 2px; color: var(--dsw-alias-label-tertiary); font-size: 9px; line-height: 14px; }
.dog-runtime-warning { margin-top: 7px; border: 1px solid color-mix(in srgb, #d18135 28%, var(--dsw-alias-border-l2)); border-radius: 9px; padding: 7px 8px; color: #b66d28; background: color-mix(in srgb, #d18135 7%, transparent); overflow-wrap: anywhere; font-size: 9.5px; line-height: 15px; }
.dog-runtime-error { margin-top: 8px; border-left: 3px solid var(--dog-state-color); border-radius: 8px; padding: 8px 9px; display: flex; flex-direction: column; gap: 3px; color: var(--dsw-alias-label-secondary); background: color-mix(in srgb, var(--dog-state-color) 8%, transparent); font-size: 9.5px; line-height: 15px; overflow-wrap: anywhere; }
.dog-runtime-error strong { color: var(--dog-state-color); font-size: 9px; letter-spacing: .035em; text-transform: uppercase; }
.dog-runtime-session { margin-top: 8px; border: 1px solid var(--dsw-alias-border-l2); border-radius: 10px; padding: 8px 9px; background: color-mix(in srgb, var(--dsw-alias-bg-layer-3, var(--dsw-alias-bg-base)) 92%, #7165e9 3%); }
.dog-runtime-session-head { margin-bottom: 7px; display: flex; align-items: center; justify-content: space-between; gap: 8px; color: var(--dsw-alias-label-secondary); font-size: 10px; font-weight: 620; }
.dog-runtime-session-button { flex: none; border: 1px solid color-mix(in srgb, #7165e9 32%, var(--dsw-alias-border-l2)); border-radius: 7px; padding: 4px 7px; color: #655acb; background: color-mix(in srgb, #7165e9 8%, var(--dsw-alias-bg-base)); cursor: pointer; font: 600 9px/13px inherit; }
.dog-runtime-session-button:hover { background: color-mix(in srgb, #7165e9 15%, var(--dsw-alias-bg-base)); }
.dog-runtime-session-button:disabled { cursor: wait; opacity: .62; }
.dog-runtime-session-error { margin-top: 7px; color: #c94a45; font-size: 9px; line-height: 14px; overflow-wrap: anywhere; }
.dog-runtime-empty { margin: 8px 0 0; }
.dog-runtime-timeline { margin: 10px 0 0; padding: 0; list-style: none; }
.dog-runtime-event { --dog-runtime-line: color-mix(in srgb, var(--dog-state-color) 32%, var(--dsw-alias-border-l2)); position: relative; min-width: 0; padding: 0 0 12px 19px; }
.dog-runtime-event:not(:last-child):before { content: ''; position: absolute; left: 4px; top: 10px; bottom: 0; width: 1px; background: var(--dog-runtime-line); }
.dog-runtime-marker { position: absolute; left: 0; top: 4px; width: 9px; height: 9px; border: 2px solid var(--dsw-alias-bg-base); border-radius: 50%; background: var(--dog-state-color); box-shadow: 0 0 0 1px var(--dog-runtime-line); }
.dog-runtime-event-copy { min-width: 0; }
.dog-runtime-event-head { min-width: 0; display: flex; align-items: baseline; justify-content: space-between; gap: 7px; color: var(--dsw-alias-label-secondary); font-size: 9.5px; line-height: 14px; }
.dog-runtime-event-head strong { min-width: 0; overflow-wrap: anywhere; font-weight: 620; }
.dog-runtime-event-head time { flex: none; color: var(--dsw-alias-label-tertiary); font-size: 8.5px; }
.dog-runtime-event-meta { margin-top: 1px; color: var(--dsw-alias-label-caption, var(--dsw-alias-label-tertiary)); font: 8px/12px ui-monospace, SFMono-Regular, Menlo, monospace; }
.dog-runtime-event-detail { margin-top: 3px; color: var(--dsw-alias-label-tertiary); overflow-wrap: anywhere; font-size: 9px; line-height: 14px; }
.dog-runtime-raw { margin-top: 4px; }
.dog-empty { grid-column: 1 / -1; min-height: 320px; display: grid; place-items: center; padding: 40px; text-align: center; }
.dog-empty-card { max-width: 380px; }
.dog-empty-icon { width: 48px; height: 48px; margin: 0 auto 13px; border-radius: 16px; display: grid; place-items: center; color: #7165e9; background: color-mix(in srgb, #7165e9 12%, transparent); }
.dog-empty-title { margin: 0; font-size: 15px; line-height: 22px; font-weight: 650; }
.dog-empty-copy { margin: 6px 0 0; color: var(--dsw-alias-label-tertiary); font-size: 11px; line-height: 18px; }
.dog-error-banner { margin: 12px 18px 0; border: 1px solid color-mix(in srgb, #d5534d 35%, var(--dsw-alias-border-l2)); border-radius: 10px; padding: 8px 10px; color: #c94a45; background: color-mix(in srgb, #d5534d 8%, transparent); font-size: 11px; line-height: 17px; }
.dog-loading { opacity: .65; }
.dog-state-success { --dog-state-color: #1c9a69; }
.dog-state-failure { --dog-state-color: #d5534d; }
.dog-state-needs_human { --dog-state-color: #d18135; }
.dog-state-partial { --dog-state-color: #b88a22; }
.dog-state-blocked, .dog-state-cancelled, .dog-state-invalidated { --dog-state-color: #828b97; }
.dog-state-running { --dog-state-color: #3c7fe1; }
.dog-state-pending, .dog-state-created { --dog-state-color: #8c859f; }
.dog-state-partial_success { --dog-state-color: #b88a22; }
.dog-state-infeasible, .dog-state-needs_replan { --dog-state-color: #d18135; }
.dog-root-orb { background: var(--dog-state-color); box-shadow: 0 7px 18px color-mix(in srgb, var(--dog-state-color) 26%, transparent); }
@keyframes dog-fade-in { from { opacity: 0; } }
@keyframes dog-dialog-in { from { opacity: 0; transform: translateY(8px) scale(.992); } }
@keyframes dog-runtime-pulse { 70%, 100% { box-shadow: 0 0 0 6px rgba(60,127,225,0); } }
@keyframes dog-spin { to { transform: rotate(360deg); } }
@media (max-width: 1180px) {
  .dog-workspace { grid-template-columns: 220px minmax(0, 1fr) 292px; }
  .dog-summary { grid-template-columns: minmax(170px, 1fr) repeat(4, minmax(76px, 92px)); gap: 7px; }
}
@media (min-width: 981px) and (max-width: 1080px) {
  .dog-workspace { grid-template-columns: 190px minmax(0, 1fr) 270px; }
  .dog-summary { grid-template-columns: minmax(160px, 1fr) repeat(3, minmax(72px, 84px)); }
  .dog-metric:last-child { display: none; }
}
@media (max-width: 980px) {
  .dog-dialog { width: 100%; height: 100dvh; min-height: 0; }
  .dog-workspace { grid-template-columns: 210px minmax(0, 1fr); }
  .dog-inspector { position: absolute; z-index: 3; top: 0; right: 0; bottom: 0; width: min(330px, 84%); box-shadow: -16px 0 36px rgba(7, 10, 18, .16); }
  .dog-summary { grid-template-columns: minmax(170px, 1fr) repeat(3, minmax(72px, 88px)); }
  .dog-metric:last-child { display: none; }
}
@media (max-width: 720px) {
  .dog-overlay-root[data-dog-dock-layout=floating] .dog-dock { top: 64px; right: 8px; bottom: auto; width: calc(100vw - 16px); max-height: min(286px, calc(100dvh - 72px)); }
  .dog-workspace { grid-template-columns: 1fr; }
  .dog-sidebar { display: none; }
  .dog-header-divider, .dog-brand-subtitle, .dog-sync-copy { display: none; }
  .dog-summary { grid-template-columns: minmax(145px, 1fr) repeat(2, minmax(66px, 76px)); padding-inline: 10px; }
  .dog-metric:nth-of-type(n+4) { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .dog-launcher, .dog-node, .dog-backdrop, .dog-dialog, .dog-runtime-pulse { animation: none; transition: none; }
}
`;
		//#endregion
		//#region src/client/sessionState.ts
		/** DSH 0.2 folds pending interactions into the unified session status source. */
		function debuggerSessionState(sessions, uiSession) {
			const status = uiSession.sessionStatus;
			const source = status ?? uiSession.pendingInteractions;
			if (!source || typeof source.getSnapshot !== "function" || typeof source.subscribe !== "function") throw new Error("DSH session UI exposes neither sessionStatus nor pendingInteractions");
			let lastSessions;
			let lastStatus;
			let combined;
			return {
				getSnapshot() {
					const next = sessions.getSnapshot();
					const pending = source.getSnapshot();
					if (next !== lastSessions || pending !== lastStatus) {
						lastSessions = next;
						lastStatus = pending;
						const interactions = status ? new Map([...status.getSnapshot()].flatMap(([id, value]) => value.pendingInteraction === void 0 ? [] : [[id, value.pendingInteraction]])) : pending;
						combined = {
							...next,
							pendingInteractions: interactions
						};
					}
					return combined;
				},
				subscribe(listener) {
					const stopSessions = sessions.subscribe(listener);
					try {
						const stopStatus = source.subscribe(listener);
						return () => {
							stopStatus();
							stopSessions();
						};
					} catch (error) {
						stopSessions();
						throw error;
					}
				}
			};
		}
		//#endregion
		//#region src/client/index.tsx
		/** The overlay uses the shared trusted RPC transport and canonical session navigator. */
		const inject = [
			"slots",
			"sessions",
			"connection",
			"uiSession",
			"uiWorkspace"
		];
		/** Register the debugger beside other frame-wide overlays without replacing shipped UI. */
		function apply(ctx) {
			try {
				ctx.effect(() => install(ctx), "openwrite-dog: client activation");
			} catch (error) {
				console.error("[OpenWrite/DoG] Debugger disabled: client activation failed", error);
			}
		}
		function* install(ctx) {
			const connection = ctx.get("connection");
			const sessions = ctx.get("sessions");
			const call = async (endpoint, payload, signal) => {
				const result = await connection.rpc.call(DOG_DEBUG_RPC_CHANNEL, endpoint, payload, signal);
				if (!result.ok) throw new Error(result.error.message);
				return result.value;
			};
			const openSession = (sessionId, parentSessionId) => openInvocationSession(sessions, sessionId, parentSessionId, void 0, typeof ctx.uiWorkspace.openSession === "function" ? ctx.uiWorkspace : void 0);
			const state = debuggerSessionState(sessions.list, ctx.uiSession);
			state.getSnapshot();
			const DogDebuggerHost = () => {
				const [request, setRequest] = (0, react.useState)(0);
				(0, react.useEffect)(() => {
					const show = () => setRequest((value) => value + 1);
					window.addEventListener("openwrite:dog-open", show);
					return () => window.removeEventListener("openwrite:dog-open", show);
				}, []);
				return request === 0 ? null : /* @__PURE__ */ (0, react_jsx_runtime.jsx)(DogDebugger, {
					initialOpen: true,
					hideDock: true,
					readSnapshot: (signal) => call(DOG_DEBUG_SNAPSHOT_ENDPOINT, {}, signal),
					readGoalRuntime: (runId, goalId, signal) => call(DOG_RUNTIME_TRACE_ENDPOINT, {
						runId,
						goalId
					}, signal),
					openSession,
					getSessionState: state.getSnapshot,
					subscribeSessions: state.subscribe,
					refreshAgentCatalog: (parentSessionId) => refreshInvocationCatalog(sessions, parentSessionId)
				}, request);
			};
			yield ctx.effect(installStyles, "dog-debugger: styles");
			yield ctx.slots.inject("shell.overlay", () => {
				try {
					return ctx.slots.register({
						name: "shell.overlay",
						id: "openwrite.dog-debugger",
						order: 80
					}, DogDebuggerHost);
				} catch (error) {
					console.error("[OpenWrite/DoG] Debugger disabled: overlay registration failed", error);
					return () => {};
				}
			});
		}
		function installStyles() {
			if (document.querySelector(`style[data-plugin-css="@dsh-external/dsh-dog/debugger"]`) !== null) return () => void 0;
			const style = document.createElement("style");
			style.dataset.plugin = "@dsh-external/dsh-dog";
			style.dataset.pluginCss = DOG_DEBUG_STYLE_ID;
			style.textContent = DOG_DEBUG_CSS;
			document.head.appendChild(style);
			return () => style.remove();
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map