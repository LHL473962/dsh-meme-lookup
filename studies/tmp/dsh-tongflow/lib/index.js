import { createRequire } from "node:module";
import { basename, dirname, extname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { chmod, copyFile, mkdir, readFile, readdir, rename, rm, stat, unlink, writeFile } from "node:fs/promises";
import { KNOWN_NODE_TYPES, NODE_TYPE_TO_ABI_FEATURE, PluginsRegistrySchema, TaskStatus, createFlowStore, describeNodeType, executeGraphTool, exportWorkflow, featureForNodeType, getAbiNodeBySlot, getAbiOutputRoutesBySlot, isAbiNodeType, parseWorkflowImportJson, renderCanvas, resolveEdgeHandles, resolvedSpecForNodeType } from "tongflow";
import { homedir } from "node:os";
import { createHash, randomUUID } from "node:crypto";
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";
import { createInterface } from "node:readline";
import { createReadStream } from "node:fs";
import { Readable } from "node:stream";
import { fileURLToPath } from "node:url";
import { defineTool } from "@deepseek-ai/dsh-tools";
import z from "@deepseek-ai/schemastery";
//#region \0rolldown/runtime.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
//#endregion
//#region ../tongflow-studio/src/engine/node-categories.ts
const NODE_CATEGORY_ORDER = [
	"add",
	"modality",
	"transfer",
	"compose",
	"decompose",
	"batch"
];
const NODE_TYPE_CATEGORY = {
	addImageNode: "add",
	addTextNode: "add",
	addAudioNode: "add",
	addVideoNode: "add",
	addLinkNode: "add",
	addFileNode: "add",
	addModelNode: "add",
	imageNode: "modality",
	textNode: "modality",
	videoNode: "modality",
	audioNode: "modality",
	fileNode: "modality",
	modelNode: "modality",
	linkNode: "modality",
	imageGenVideoNode: "transfer",
	textGenVideoNode: "transfer",
	imageGenModelNode: "transfer",
	imagePoseNode: "transfer",
	imageBodySegNode: "transfer",
	imageNormalNode: "transfer",
	imageMattingNode: "transfer",
	videoGenModelNode: "transfer",
	speechGenVideoNode: "transfer",
	imageGenImageNode: "transfer",
	imageGenImageUpscaleNode: "transfer",
	genTextNode: "transfer",
	textGenImageNode: "transfer",
	textGenMusicNode: "transfer",
	textGenAudioNode: "transfer",
	textGenSpeechCloneNode: "transfer",
	textGenSpeechPresetNode: "transfer",
	textGenSpeechInstructNode: "transfer",
	removeVideoSubtitleNode: "transfer",
	videoUpscaleNode: "transfer",
	videoEditNode: "transfer",
	removeWatermarkNode: "transfer",
	extractAudioNode: "transfer",
	removeVideoAudioNode: "transfer",
	denoiseAudioSubtitleNode: "transfer",
	separateAudioTrackNode: "transfer",
	separateSpeakerNode: "transfer",
	convertVoiceNode: "transfer",
	audioDescribeNode: "transfer",
	imageGenTextNode: "transfer",
	videoGenTextNode: "transfer",
	videoGenTextSpeechRecognizeNode: "transfer",
	audioGenTextSpeechRecognizeNode: "transfer",
	fileGenTextNode: "transfer",
	linkGenTextNode: "transfer",
	getFirstFrameNode: "transfer",
	getLastFrameNode: "transfer",
	musicRepaintNode: "transfer",
	musicExtractNode: "transfer",
	musicLegoNode: "transfer",
	musicCompleteNode: "transfer",
	imageGenVideoComposeNode: "compose",
	textGenSpeechCloneComposeNode: "compose",
	concatVideoNode: "compose",
	mergeVideoAudioNode: "compose",
	audioVideoLipSyncNode: "compose",
	imageFusionNode: "compose",
	imagesGenVideoNode: "compose",
	refsGenVideoNode: "compose",
	speechImageGenVideoNode: "compose",
	speechTextGenVideoNode: "compose",
	speechVideoGenVideoNode: "compose",
	videoImageGenVideoMixNode: "compose",
	videoImageGenVideoMoveNode: "compose",
	imageImageGenVideoNode: "compose",
	textAudioGenSpeechNode: "compose",
	textsGenTextNode: "compose",
	concatVideoComposeNode: "compose",
	musicCoverNode: "compose",
	splitVideoNode: "decompose",
	splitTextNode: "decompose",
	musicBriefNode: "decompose",
	separateSoundNode: "decompose",
	dropVideoNode: "batch",
	arrangeNode: "batch"
};
function categoryOf(nodeType) {
	return NODE_TYPE_CATEGORY[nodeType];
}
//#endregion
//#region ../tongflow-studio/src/util/fsx.ts
/** Small filesystem helpers: JSON read/write, atomic writes, existence probes. */
async function exists(path) {
	try {
		await stat(path);
		return true;
	} catch {
		return false;
	}
}
async function isDir$1(path) {
	try {
		return (await stat(path)).isDirectory();
	} catch {
		return false;
	}
}
async function readJson$1(path) {
	return JSON.parse(await readFile(path, "utf8"));
}
async function readJsonOr(path, fallback) {
	try {
		return await readJson$1(path);
	} catch (error) {
		if (error.code === "ENOENT") return fallback;
		throw error;
	}
}
/** Write via a temp file + rename so readers never observe a partial file. */
async function writeFileAtomic(path, data) {
	await mkdir(dirname(path), { recursive: true });
	const tmp = join(dirname(path), `.${process.pid}.${Date.now()}.tmp`);
	await writeFile(tmp, data);
	await rename(tmp, path);
}
async function writeJson(path, value) {
	await writeFileAtomic(path, `${JSON.stringify(value, null, 2)}\n`);
}
function nowIso() {
	return (/* @__PURE__ */ new Date()).toISOString();
}
//#endregion
//#region ../tongflow-studio/src/project/paths.ts
/**
* Where things live — the studio root and project-relative keys. A project
* is a plain folder: the agent and the user shape its structure; the only
* fixed names are `project.json` and the `.tongflow.json` workflow suffix.
*/
/**
* Studio data root: the configured path, else `$TONGFLOW_STUDIO_ROOT`, else
* `~/.tongflow/studio`. A leading `~` is the home directory: the value often
* comes from a JSON settings file, where no shell has expanded it.
*/
function resolveStudioRoot(configured) {
	const root = configured?.trim() || process.env.TONGFLOW_STUDIO_ROOT?.trim();
	if (!root) return join(homedir(), ".tongflow", "studio");
	if (root === "~") return homedir();
	return resolve(/^~[/\\]/.test(root) ? join(homedir(), root.slice(2)) : root);
}
function studioPaths(root) {
	return {
		root,
		projects: join(root, "projects"),
		venv: join(root, "venv"),
		plugins: join(root, "plugins"),
		data: join(root, "data"),
		tmp: join(root, "tmp")
	};
}
const PROJECT_MANIFEST = "project.json";
const WORKFLOW_EXT = ".tongflow.json";
/** Sidecar next to a workflow listing every run that produced outputs. */
const RUNS_SUFFIX = ".runs.json";
/** Scratch dir for engine outputs before they are placed next to their workflow. */
const RUNS_DIR = ".runs";
const PROJECT_ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
function isProjectId(id) {
	return PROJECT_ID_RE.test(id);
}
/** kebab-case slug for a project id derived from its title. */
function projectIdFor(title, fallback = "project") {
	return title.normalize("NFKD").replace(/\p{M}+/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || fallback;
}
/** POSIX-style path relative to the project root (the file-key form used in workflows and URLs). */
function toProjectKey(projectRoot, absPath) {
	const rel = relative(projectRoot, absPath);
	if (rel.startsWith("..") || isAbsolute(rel)) throw new Error(`path escapes the project: ${absPath}`);
	return rel.split(sep).join("/");
}
/** Resolve a project-relative key to an absolute path, refusing escapes. */
function fromProjectKey(projectRoot, key) {
	const abs = resolve(projectRoot, key);
	const rel = relative(projectRoot, abs);
	if (rel.startsWith("..") || isAbsolute(rel)) throw new Error(`key escapes the project: ${key}`);
	return abs;
}
function isInsideProject(projectRoot, absPath) {
	const rel = relative(projectRoot, absPath);
	return !(rel.startsWith("..") || isAbsolute(rel));
}
/** Directory part of a project key (`a/b/c.png` → `a/b`, `c.png` → ``). */
function keyDir(key) {
	const i = key.lastIndexOf("/");
	return i < 0 ? "" : key.slice(0, i);
}
/** Normalize a user/agent supplied path to a project key (POSIX separators, no leading `./`, no `..`). */
function normalizeKey(input) {
	const key = input.trim().replace(/\\/g, "/").replace(/^\.?\/+/, "").replace(/\/+/g, "/").replace(/\/$/, "");
	if (key.split("/").includes("..")) throw new Error(`invalid path "${input}"`);
	return key;
}
//#endregion
//#region ../tongflow-studio/src/project/refs.ts
/**
* How workflows point at project files. No registry, no scheme — just paths:
*
*   ./mei_ref.02.png            relative to the workflow file's directory
*   ../style/palette.png        (may climb, but never out of the project)
*   characters/mei/mei.md       relative to the project root
*   https://… / data:…          passed through untouched
*
* Inside any text (a prompt, a config field) `{{./file.md}}` is replaced by
* that text file's content at run time, so a shared style note or a
* character description is written once and included where needed.
*/
function isUrlLike(value) {
	return /^(https?:|data:|blob:)/i.test(value);
}
/** `./x` / `../x` are anchored at the workflow file; anything else at the project root. */
function isDirRelative(value) {
	return value.startsWith("./") || value.startsWith("../");
}
var RefResolutionError = class extends Error {
	ref;
	constructor(ref, detail) {
		super(`cannot resolve "${ref}": ${detail}`);
		this.ref = ref;
		this.name = "RefResolutionError";
	}
};
/**
* Resolve one file reference to an absolute path. `baseDir` is the absolute
* directory of the workflow file (project root for inline documents).
* Root-relative keys that do not exist are retried against `baseDir`, so a
* hand-written `mei.png` next to the workflow still resolves.
*/
async function resolveFileRef(projectRoot, baseDir, ref) {
	const value = ref.trim();
	if (!value) throw new RefResolutionError(ref, "empty");
	if (value.startsWith("tf://")) throw new RefResolutionError(ref, "tf:// references no longer exist — use a path relative to the workflow file (./name.png) or to the project root");
	if (isUrlLike(value)) return value;
	if (isAbsolute(value)) return value;
	if (isDirRelative(value)) {
		const abs = resolve(baseDir, value);
		if (!isInsideProject(projectRoot, abs)) throw new RefResolutionError(ref, "escapes the project");
		return abs;
	}
	const fromRoot = fromProjectKey(projectRoot, value);
	if (await exists(fromRoot)) return fromRoot;
	const fromBase = resolve(baseDir, value);
	if (isInsideProject(projectRoot, fromBase) && await exists(fromBase)) return fromBase;
	return fromRoot;
}
const TEMPLATE_RE = /\{\{\s*([^{}\s][^{}]*?)\s*\}\}/g;
/** True when a string embeds `{{path}}` placeholders. */
function hasTemplateRefs(value) {
	if (typeof value !== "string") return false;
	TEMPLATE_RE.lastIndex = 0;
	const hit = TEMPLATE_RE.test(value);
	TEMPLATE_RE.lastIndex = 0;
	return hit;
}
/**
* Expand `{{path}}` placeholders with the (trimmed) content of those text
* files. Missing files throw — a prompt silently losing its style block is
* worse than a failed run.
*/
async function expandTemplate(projectRoot, baseDir, text) {
	const matches = [...text.matchAll(TEMPLATE_RE)];
	if (matches.length === 0) return text;
	let out = "";
	let last = 0;
	for (const m of matches) {
		out += text.slice(last, m.index);
		const abs = await resolveFileRef(projectRoot, baseDir, m[1]);
		if (isUrlLike(abs)) throw new RefResolutionError(m[1], "URLs cannot be inlined");
		let content;
		try {
			content = await readFile(abs, "utf8");
		} catch {
			throw new RefResolutionError(m[1], `no such text file (looked at ${abs})`);
		}
		out += content.trim();
		last = (m.index ?? 0) + m[0].length;
	}
	return out + text.slice(last);
}
/** Absolute directory a workflow key's references are anchored at. */
function baseDirOf(projectRoot, workflowKey) {
	return workflowKey ? dirname(fromProjectKey(projectRoot, workflowKey)) : projectRoot;
}
//#endregion
//#region ../tongflow-studio/src/engine/single-node.ts
/**
* Wrap one canvas node execution (`POST /api/task/create` body from
* `tongflow/canvas`) into a one-node executable workflow the engine can run.
* Every prompt field becomes a static binding; the slot's ABI output routes
* become workflow outputs keyed by their source field.
*/
async function singleNodeDocument(projectRoot, body) {
	if (!getAbiNodeBySlot(body.feature)) throw new Error(`unknown ABI slot "${body.feature}"`);
	if (!body.pluginId) throw new Error("pluginId is required");
	const routes = getAbiOutputRoutesBySlot(body.feature);
	const prompt = await resolvePromptRefs(projectRoot, body.prompt ?? {});
	const bindings = {};
	for (const [field, value] of Object.entries(prompt)) {
		if (value === void 0 || value === null) continue;
		bindings[field] = {
			kind: "static",
			value
		};
	}
	const nodeId = body.nodeId || "node";
	const workflow = {
		name: `canvas:${body.feature}`,
		version: "1.0",
		exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
		inputs: [],
		outputs: routes.map((r) => ({
			name: r.sourceField,
			type: outputType(r.nodeType),
			nodeId,
			field: r.sourceField
		})),
		dataNodes: [],
		executableNodes: [{
			id: nodeId,
			type: `${body.feature}`,
			feature: body.feature,
			pluginId: body.pluginId,
			...body.model ? { model: body.model } : {},
			label: body.feature,
			bindings,
			outputs: routes.map((r) => ({
				sourceField: r.sourceField,
				nodeType: r.nodeType,
				dataField: r.dataField,
				expandEach: r.expandEach,
				...r.itemValuePath ? { itemValuePath: r.itemValuePath } : {},
				...r.isArrayOfArrays ? { isArrayOfArrays: true } : {}
			})),
			dependencies: [],
			level: 0
		}],
		executionLevels: [[nodeId]],
		dataNodeEdges: [],
		originalFlow: {
			nodes: [],
			edges: []
		}
	};
	return {
		name: workflow.name,
		flow: {
			nodes: [],
			edges: []
		},
		executable: workflow,
		meta: {}
	};
}
function outputType(nodeType) {
	if (nodeType === "textNode") return "text";
	return nodeType.replace(/Node$/, "");
}
/** Deep-walk the prompt: `{{file}}` includes inside strings are expanded (canvas prompts are otherwise passed through). */
async function resolvePromptRefs(projectRoot, value) {
	const walk = async (v) => {
		if (typeof v === "string") {
			if (hasTemplateRefs(v)) return expandTemplate(projectRoot, projectRoot, v);
			return v;
		}
		if (Array.isArray(v)) {
			const out = [];
			for (const item of v) out.push(await walk(item));
			return out;
		}
		if (v && typeof v === "object") {
			const out = {};
			for (const [k, item] of Object.entries(v)) out[k] = await walk(item);
			return out;
		}
		return v;
	};
	return await walk(value);
}
//#endregion
//#region ../tongflow-studio/src/project/outputs.ts
/**
* Generated files live next to the workflow that made them:
*
*   characters/mei/mei_ref.tongflow.json     the workflow
*   characters/mei/mei_ref.01.png            output of run #1
*   characters/mei/mei_ref.02.png            run #2 (a run never overwrites)
*   characters/mei/mei_ref.03.image.png      run #3 produced several outputs
*   characters/mei/mei_ref.03.caption.txt      → the workflow output name is kept
*   characters/mei/mei_ref.runs.json         provenance of every run
*
* The number is per workflow and shared by every file of one run.
*/
/** `characters/mei/mei_ref.tongflow.json` → `mei_ref`. */
function outputStem(workflowKey) {
	return basename(workflowKey, WORKFLOW_EXT);
}
function runsLogKey(workflowKey) {
	const dir = keyDir(workflowKey);
	return `${dir ? `${dir}/` : ""}${outputStem(workflowKey)}${RUNS_SUFFIX}`;
}
function formatNo(no) {
	return String(no).padStart(2, "0");
}
/** Sanitize a workflow output name for use inside a file name. */
function safeOutputName(name) {
	return name.replace(/[^A-Za-z0-9_-]+/g, "_").replace(/^_+|_+$/g, "") || "out";
}
function outputFileName(stem, no, ext, output) {
	const cleanExt = ext.replace(/^\./, "");
	return `${stem}.${formatNo(no)}${output ? `.${safeOutputName(output)}` : ""}.${cleanExt}`;
}
function escapeRe(s) {
	return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
/** Parse `<stem>.<no>[.<output>].<ext>`; undefined for anything else. */
function parseOutputFileName(stem, fileName) {
	const m = new RegExp(`^${escapeRe(stem)}\\.(\\d+)(?:\\.([A-Za-z0-9_-]+))?\\.([A-Za-z0-9]+)$`).exec(fileName);
	if (!m) return void 0;
	return {
		no: Number(m[1]),
		...m[2] ? { output: m[2] } : {},
		ext: m[3].toLowerCase()
	};
}
async function readRunsLog(projectRoot, workflowKey) {
	const raw = await readJsonOr(fromProjectKey(projectRoot, runsLogKey(workflowKey)), []);
	return Array.isArray(raw) ? raw : [];
}
async function appendRunsLog(projectRoot, workflowKey, record) {
	const records = await readRunsLog(projectRoot, workflowKey);
	records.push(record);
	await writeJson(fromProjectKey(projectRoot, runsLogKey(workflowKey)), records);
}
/** Every generated file next to a workflow, oldest number first. */
async function listOutputs(projectRoot, workflowKey) {
	const stem = outputStem(workflowKey);
	const dirKey = keyDir(workflowKey);
	const dirAbs = fromProjectKey(projectRoot, dirKey || ".");
	let names;
	try {
		names = await readdir(dirAbs);
	} catch {
		return [];
	}
	const records = await readRunsLog(projectRoot, workflowKey);
	const byNo = new Map(records.map((r) => [r.no, r]));
	const out = [];
	for (const name of names) {
		const parsed = parseOutputFileName(stem, name);
		if (!parsed) continue;
		const st = await stat(join(dirAbs, name)).catch(() => void 0);
		if (!st?.isFile()) continue;
		const record = byNo.get(parsed.no);
		out.push({
			key: `${dirKey ? `${dirKey}/` : ""}${name}`,
			fileName: name,
			no: parsed.no,
			...parsed.output ? { output: parsed.output } : {},
			ext: parsed.ext,
			size: st.size,
			mtime: st.mtime.toISOString(),
			workflow: workflowKey,
			...record ? { record } : {}
		});
	}
	out.sort((a, b) => a.no - b.no || a.fileName.localeCompare(b.fileName));
	return out;
}
/** Next free output number: one above every numbered file and every logged run. */
async function nextOutputNo(projectRoot, workflowKey) {
	const [files, records] = await Promise.all([listOutputs(projectRoot, workflowKey), readRunsLog(projectRoot, workflowKey)]);
	let max = 0;
	for (const f of files) max = Math.max(max, f.no);
	for (const r of records) max = Math.max(max, r.no);
	return max + 1;
}
//#endregion
//#region ../tongflow-studio/src/project/workflow-file.ts
/**
* `*.tongflow.json` files — the agent-authored workflow documents. The file on
* disk is the single source of truth: tools hydrate a headless store from it,
* apply a change, re-export and write it back; the canvas loads and saves the
* same file. Shape (a superset of what the TongFlow app imports):
*
*   { name, description?, flow: { nodes, edges }, executable?, meta }
*/
function isWorkflowKey(key) {
	return key.endsWith(WORKFLOW_EXT);
}
/**
* Normalize a user/agent supplied workflow path to a project key: POSIX
* separators, the `.tongflow.json` suffix added when missing, no `..`.
* A bare name lands at the project root; otherwise the path is taken as
* given (`characters/mei/mei_ref` → `characters/mei/mei_ref.tongflow.json`).
*/
function normalizeWorkflowKey(input) {
	let key = normalizeKey(input);
	if (!key) throw new Error("workflow path is required");
	if (!key.endsWith(".tongflow.json")) key = key.endsWith(".json") ? key.slice(0, -5) + WORKFLOW_EXT : key + WORKFLOW_EXT;
	return key;
}
/**
* The canvas resolves file keys against the project root (`/api/uploads/<key>`),
* so `./x` / `../x` references written relative to the workflow file are
* rewritten to project keys in the copy handed to the canvas. Saving from the
* canvas therefore writes root-relative keys — equally valid.
*/
function canvasView(doc, key) {
	const dir = keyDir(key);
	const fix = (v) => {
		if (typeof v !== "string" || !isDirRelative(v) || isUrlLike(v)) return v;
		const parts = dir ? dir.split("/") : [];
		for (const seg of v.split("/")) {
			if (seg === "." || seg === "") continue;
			if (seg === "..") parts.pop();
			else parts.push(seg);
		}
		return parts.join("/");
	};
	const nodes = doc.flow.nodes.map((n) => {
		const data = n.data ?? {};
		if (!Array.isArray(data.fileKeys)) return n;
		return {
			...n,
			data: {
				...data,
				fileKeys: data.fileKeys.map(fix)
			}
		};
	});
	return {
		...doc,
		flow: {
			nodes,
			edges: doc.flow.edges
		}
	};
}
async function readWorkflowFile(projectRoot, key) {
	const abs = fromProjectKey(projectRoot, key);
	return parseWorkflowDocument(await readFile(abs, "utf8"), basename(key, WORKFLOW_EXT));
}
function parseWorkflowDocument(raw, fallbackName) {
	const parsed = parseWorkflowImportJson(raw);
	let obj = {};
	try {
		obj = JSON.parse(raw);
	} catch {}
	const meta = obj.meta && typeof obj.meta === "object" ? obj.meta : {};
	const executable = obj.executable && typeof obj.executable === "object" ? obj.executable : void 0;
	return {
		name: parsed.name ?? fallbackName,
		...parsed.description ? { description: parsed.description } : {},
		flow: {
			nodes: parsed.nodes,
			edges: parsed.edges
		},
		...executable ? { executable } : {},
		...typeof obj.exportError === "string" ? { exportError: obj.exportError } : {},
		meta
	};
}
function hydrateStore(doc) {
	return createFlowStore({ initial: {
		nodes: doc.flow.nodes,
		edges: doc.flow.edges,
		workflowName: doc.name,
		workflowDescription: doc.description ?? ""
	} });
}
/**
* Give every executable node without an explicit plugin the registry's
* default for its slot. Headless authoring never mounts the canvas' plugin
* resolver, so this is what makes an exported node runnable.
*/
function fillDefaultPlugins(store, registry) {
	if (!registry) return [];
	const missing = [];
	const { nodes } = store.getState();
	const next = nodes.map((node) => {
		const type = node.type ?? "";
		if (!isAbiNodeType(type)) return node;
		const data = node.data ?? {};
		if (typeof data.pluginId === "string" && data.pluginId.trim()) return node;
		const feature = featureForNodeType(type);
		const candidates = feature ? registry.nodePluginMap[feature] ?? [] : [];
		if (candidates.length === 0) {
			missing.push(`${node.id.slice(0, 8)} (${type}) — no plugin installed for "${feature}"`);
			return node;
		}
		return {
			...node,
			data: {
				...data,
				pluginId: candidates[0]
			}
		};
	});
	store.setState({ nodes: next });
	return missing;
}
/**
* Mirror upstream data-node payloads (texts / fileKeys) into the downstream
* executable node's `data`, the way the canvas' compose action snapshots them.
* Canvas node components gate their execute button on that snapshot, while
* the exporter reads edges — so a headless patch must keep both in step.
*/
function mirrorUpstreamPayloads(store) {
	const { nodes, edges } = store.getState();
	const byId = new Map(nodes.map((n) => [n.id, n]));
	let changed = false;
	const next = nodes.map((node) => {
		const type = node.type ?? "";
		if (!isAbiNodeType(type)) return node;
		const texts = [];
		const fileKeys = [];
		for (const e of edges) {
			if (e.target !== node.id) continue;
			const src = byId.get(e.source);
			if (!src || isAbiNodeType(src.type ?? "")) continue;
			const d = src.data ?? {};
			if (Array.isArray(d.texts)) texts.push(...d.texts.filter((t) => typeof t === "string"));
			if (Array.isArray(d.fileKeys)) fileKeys.push(...d.fileKeys.filter((k) => typeof k === "string"));
		}
		const data = { ...node.data ?? {} };
		const same = (a, b) => Array.isArray(a) && a.length === b.length && a.every((v, i) => v === b[i]);
		let touched = false;
		if (texts.length > 0 && !same(data.texts, texts)) {
			data.texts = texts;
			touched = true;
		}
		if (fileKeys.length > 0 && !same(data.fileKeys, fileKeys)) {
			data.fileKeys = fileKeys;
			touched = true;
		}
		if (!touched) return node;
		changed = true;
		return {
			...node,
			data
		};
	});
	if (changed) store.setState({ nodes: next });
}
/** Export the store and write the document; returns the saved document. */
async function saveWorkflowFile(projectRoot, key, store, options = {}) {
	fillDefaultPlugins(store, options.registry);
	mirrorUpstreamPayloads(store);
	const state = store.getState();
	const name = options.name ?? state.workflowName ?? basename(key, ".tongflow.json");
	const description = options.description ?? state.workflowDescription ?? "";
	let executable;
	let exportError;
	try {
		executable = exportWorkflow(state.nodes, state.edges, {
			name,
			description,
			includeOriginalFlow: false
		});
	} catch (error) {
		exportError = error instanceof Error ? error.message : String(error);
	}
	const doc = {
		name,
		...description ? { description } : {},
		flow: {
			nodes: state.nodes,
			edges: state.edges
		},
		...executable ? { executable } : {},
		...exportError ? { exportError } : {},
		meta: options.meta ?? {}
	};
	await writeWorkflowDocument(projectRoot, key, doc);
	return doc;
}
async function writeWorkflowDocument(projectRoot, key, doc) {
	const abs = fromProjectKey(projectRoot, key);
	await mkdir(dirname(abs), { recursive: true });
	await writeFileAtomic(abs, `${JSON.stringify(doc, null, 2)}\n`);
}
async function deleteWorkflowFile(projectRoot, key) {
	await unlink(fromProjectKey(projectRoot, key));
}
function workflowHash(doc) {
	return createHash("sha256").update(JSON.stringify(doc.executable ?? doc.flow)).digest("hex").slice(0, 16);
}
async function summarizeWorkflow(projectRoot, key) {
	const abs = fromProjectKey(projectRoot, key);
	const [doc, st, outputs] = await Promise.all([
		readWorkflowFile(projectRoot, key),
		stat(abs),
		listOutputs(projectRoot, key)
	]);
	return {
		key,
		name: doc.name,
		...doc.description ? { description: doc.description } : {},
		nodeCount: doc.flow.nodes.length,
		inputs: (doc.executable?.inputs ?? []).map((i) => ({
			name: i.name,
			type: i.type,
			required: i.required
		})),
		outputs: (doc.executable?.outputs ?? []).map((o) => ({
			name: o.name,
			type: o.type
		})),
		meta: doc.meta,
		mtime: st.mtime.toISOString(),
		outputCount: outputs.length,
		lastNo: outputs.reduce((m, o) => Math.max(m, o.no), 0)
	};
}
/** Every workflow file in the project (recursive, hidden dirs skipped), sorted by key. */
async function listWorkflowKeys(projectRoot) {
	const keys = [];
	const walk = async (dir, depth) => {
		if (depth > 12) return;
		let entries;
		try {
			entries = await readdir(dir, { withFileTypes: true });
		} catch {
			return;
		}
		for (const e of entries) {
			if (e.name.startsWith(".")) continue;
			const abs = join(dir, e.name);
			if (e.isDirectory()) await walk(abs, depth + 1);
			else if (e.name.endsWith(".tongflow.json")) keys.push(toProjectKey(projectRoot, abs));
		}
	};
	await walk(projectRoot, 0);
	return keys.sort();
}
async function listWorkflows(projectRoot) {
	const out = [];
	for (const key of await listWorkflowKeys(projectRoot)) try {
		out.push(await summarizeWorkflow(projectRoot, key));
	} catch {}
	return out;
}
//#endregion
//#region ../tongflow-studio/src/project/compose.ts
/**
* Compose several small workflows into one big one — for a whole-picture
* view on the canvas and one-shot re-runs.
*
* Small workflows link to each other by files: `shot/i2v.tongflow.json` has an
* imageNode whose fileKey is `./keyframe.02.png`, which is an output of
* `shot/keyframe.tongflow.json` in the same folder. Composition copies every
* part onto one canvas and, wherever a data node references a file that
* another part *produces*, replaces the static file by a real edge from that
* part's producing executable node. Every stage's product stays an output
* (a terminal "tap" data node), and `meta.outputLabels` names those outputs
* after their part so a run of the composed workflow lands
* `<all>.01.keyframe.png`, `<all>.01.i2v.mp4`, …. Labels are keyed both by the
* exporter's output name (`output_<id8>`) and by the producing node's id,
* because the engine reports outputs under either form.
*/
/** Suffix of the composed file when none is given. */
const COMPOSED_SUFFIX = "_all";
/**
* Every workflow under `folder`, at any depth, sorted by project key so the
* order is stable and folders stay together; composed files are excluded at
* every level.
*
* A parent composes the LEAVES beneath it, never its children's own composed
* files: a part is linked to a producer by the file it references, and a
* composed file's outputs are named after the composition (`a_all.01.x.png`),
* not after the part that a sibling actually references (`a/x.02.png`). Taking
* the leaves keeps every reference matchable, so the parent's graph is
* connected the whole way down instead of silently reading stale files.
*/
async function workflowsInFolder(projectRoot, folderKey) {
	const dir = fromProjectKey(projectRoot, normalizeKey(folderKey) || ".");
	if (!await exists(dir)) return [];
	const out = [];
	const walk = async (at) => {
		for (const entry of await readdir(at, { withFileTypes: true })) {
			const full = join(at, entry.name);
			if (entry.isDirectory()) {
				await walk(full);
				continue;
			}
			if (entry.name.endsWith(".tongflow.json") && !basename(entry.name, ".tongflow.json").endsWith("_all")) out.push(toProjectKey(projectRoot, full));
		}
	};
	await walk(dir);
	return out.sort();
}
/** Resolve a data-node file reference of part `partKey` to a project key (URLs / absolute paths → undefined). */
function refToKey(partKey, value) {
	if (typeof value !== "string" || !value.trim()) return void 0;
	const v = value.trim();
	if (isUrlLike(v) || v.startsWith("/")) return void 0;
	if (!isDirRelative(v)) return normalizeKey(v);
	const parts = keyDir(partKey) ? keyDir(partKey).split("/") : [];
	for (const seg of v.split("/")) {
		if (seg === "." || seg === "") continue;
		if (seg === "..") parts.pop();
		else parts.push(seg);
	}
	return parts.join("/");
}
/** Terminal executable nodes of a part whose ABI outputs include the wanted data node type. */
function producersFor(part, dataNodeType) {
	const hasOut = new Set(part.edges.map((e) => e.source));
	return part.nodes.filter((n) => {
		const type = n.type ?? "";
		if (!isAbiNodeType(type) || hasOut.has(n.id)) return false;
		const spec = resolvedSpecForNodeType(type);
		return Boolean(spec?.topology.outputs.some((o) => o.nodeType === dataNodeType));
	});
}
/**
* Record a stage label under every key the engine might report the output as:
* the exporter's `output_<id8>` for the output node, and the id (full and
* short) of each node that actually produces the file.
*/
function labelOutput(labels, stem, outputNodeId, ...producerIds) {
	labels[`output_${outputNodeId.substring(0, 8)}`] = stem;
	for (const id of [outputNodeId, ...producerIds]) {
		labels[id] = stem;
		labels[id.substring(0, 8)] = stem;
	}
}
function edge(source, target) {
	const h = resolveEdgeHandles({
		sourceType: source.type,
		targetType: target.type
	});
	return {
		id: randomUUID(),
		source: source.id,
		target: target.id,
		type: "custom-edge",
		...h.sourceHandle ? { sourceHandle: h.sourceHandle } : {},
		...h.targetHandle ? { targetHandle: h.targetHandle } : {}
	};
}
/** Data-node file references of a part, as project keys. */
function fileRefsOf(part) {
	const out = [];
	for (const n of part.doc.flow.nodes) {
		if (isAbiNodeType(n.type ?? "")) continue;
		const data = n.data ?? {};
		if (!Array.isArray(data.fileKeys)) continue;
		for (const k of data.fileKeys) {
			const key = refToKey(part.key, k);
			if (key) out.push(key);
		}
	}
	return out;
}
/**
* Which part produces the file at `key`, if any. `key` arrives already
* resolved to a project key by {@link refToKey}, so comparing it against each
* part's own directory matches across folders as well as within one — a
* workflow's outputs land beside it, wherever it lives.
*/
function producerIndex(parts, key) {
	const dir = keyDir(key);
	const file = key.slice(dir ? dir.length + 1 : 0);
	return parts.findIndex((p) => keyDir(p.key) === dir && parseOutputFileName(p.stem, file));
}
/**
* Sort parts so producers come before consumers (a part that references
* `./ref.01.png` follows `ref.tongflow.json`), keeping the given order as the
* tie-break. Cycles fall back to the given order.
*/
function orderByDependencies(parts) {
	const deps = parts.map((p) => {
		const set = /* @__PURE__ */ new Set();
		for (const key of fileRefsOf(p)) {
			const i = producerIndex(parts, key);
			if (i >= 0 && parts[i] !== p) set.add(i);
		}
		return set;
	});
	const done = /* @__PURE__ */ new Set();
	const order = [];
	let progress = true;
	while (order.length < parts.length && progress) {
		progress = false;
		for (let i = 0; i < parts.length; i++) {
			if (done.has(i)) continue;
			if ([...deps[i]].every((d) => done.has(d))) {
				done.add(i);
				order.push(i);
				progress = true;
			}
		}
	}
	if (order.length < parts.length) return;
	const sorted = order.map((i) => parts[i]);
	parts.splice(0, parts.length, ...sorted);
}
async function composeWorkflows(projectRoot, options) {
	const keys = options.workflows.map(normalizeWorkflowKey);
	if (keys.length < 2) throw new Error("compose needs at least two workflows");
	const parts = [];
	for (const key of keys) {
		const doc = await readWorkflowFile(projectRoot, key);
		if (doc.flow.nodes.length === 0) continue;
		parts.push({
			key,
			stem: outputStem(key),
			doc
		});
	}
	if (parts.length < 2) throw new Error("fewer than two of the given workflows have nodes");
	orderByDependencies(parts);
	const outKey = options.path !== void 0 ? normalizeWorkflowKey(options.path) : (() => {
		const dir = keyDir(parts[0].key);
		const name = `${basename(dir || "project")}${COMPOSED_SUFFIX}`;
		return `${dir ? `${dir}/` : ""}${name}${WORKFLOW_EXT}`;
	})();
	if (keys.includes(outKey)) throw new Error(`${outKey} is one of the parts — pick another path`);
	const nodes = [];
	const edges = [];
	const partNodes = [];
	let xOffset = 0;
	for (const part of parts) {
		const idMap = /* @__PURE__ */ new Map();
		const pnodes = [];
		let width = 0;
		for (const n of part.doc.flow.nodes) {
			const id = randomUUID();
			idMap.set(n.id, id);
			width = Math.max(width, (n.position?.x ?? 0) + 520);
			pnodes.push({
				...structuredClone(n),
				id,
				position: {
					x: (n.position?.x ?? 0) + xOffset,
					y: n.position?.y ?? 0
				},
				selected: false
			});
		}
		const pedges = part.doc.flow.edges.filter((e) => idMap.has(e.source) && idMap.has(e.target)).map((e) => ({
			...structuredClone(e),
			id: randomUUID(),
			source: idMap.get(e.source),
			target: idMap.get(e.target)
		}));
		xOffset += width + 200;
		nodes.push(...pnodes);
		edges.push(...pedges);
		partNodes.push({
			part,
			nodes: pnodes,
			edges: pedges
		});
	}
	let links = 0;
	const unlinked = [];
	const outputLabels = {};
	const tapped = /* @__PURE__ */ new Set();
	const producerOf = (key) => {
		const dir = keyDir(key);
		const file = key.slice(dir ? dir.length + 1 : 0);
		for (let i = 0; i < partNodes.length; i++) {
			const pn = partNodes[i];
			if (keyDir(pn.part.key) !== dir) continue;
			if (parseOutputFileName(pn.part.stem, file)) return {
				pn,
				index: i
			};
		}
	};
	for (let bi = 0; bi < partNodes.length; bi++) {
		const B = partNodes[bi];
		for (const dn of B.nodes) {
			const type = dn.type ?? "";
			if (isAbiNodeType(type) || !type.endsWith("Node")) continue;
			const data = dn.data ?? {};
			const fileKeys = Array.isArray(data.fileKeys) ? data.fileKeys : [];
			if (fileKeys.length === 0) continue;
			const remaining = [];
			let linkedAny = false;
			for (const raw of fileKeys) {
				const key = refToKey(B.part.key, raw);
				const producer = key ? producerOf(key) : void 0;
				if (!producer || producer.index >= bi) {
					remaining.push(raw);
					if (producer) unlinked.push(String(raw));
					continue;
				}
				const execs = producersFor(producer.pn, type);
				if (execs.length === 0) {
					remaining.push(raw);
					unlinked.push(String(raw));
					continue;
				}
				linkedAny = true;
				for (const n of execs) {
					edges.push(edge(n, dn));
					links++;
					if (tapped.has(n.id)) continue;
					tapped.add(n.id);
					const tap = {
						id: randomUUID(),
						type,
						position: {
							x: (n.position?.x ?? 0) + 560,
							y: (n.position?.y ?? 0) + 260
						},
						data: { label: producer.pn.part.stem }
					};
					nodes.push(tap);
					edges.push(edge(n, tap));
					labelOutput(outputLabels, producer.pn.part.stem, tap.id, n.id);
				}
			}
			if (linkedAny) {
				const nd = { ...dn.data };
				if (remaining.length > 0) nd.fileKeys = remaining;
				else delete nd.fileKeys;
				dn.data = nd;
			}
		}
	}
	const hasOut = new Set(edges.map((e) => e.source));
	for (const pn of partNodes) for (const n of pn.nodes) {
		if (hasOut.has(n.id)) continue;
		const type = n.type ?? "";
		const isExec = isAbiNodeType(type);
		const isFedData = !isExec && type.endsWith("Node") && edges.some((e) => e.target === n.id);
		if (!isExec && !isFedData) continue;
		const feeders = isExec ? [n.id] : edges.filter((e) => e.target === n.id).map((e) => e.source);
		labelOutput(outputLabels, pn.part.stem, n.id, ...feeders);
	}
	const name = options.name ?? `${basename(outKey, ".tongflow.json")} (composed)`;
	const meta = {
		purpose: `Composed from ${parts.length} workflows (${parts.map((p) => p.stem).join(" → ")}); edit here and re-run to regenerate the whole.`,
		outputLabels,
		composed: {
			parts: parts.map((p) => p.key),
			at: (/* @__PURE__ */ new Date()).toISOString()
		}
	};
	const store = hydrateStore({
		name,
		flow: {
			nodes,
			edges
		},
		meta
	});
	try {
		store.getState().autoLayout(void 0, { history: false });
	} catch {}
	await saveWorkflowFile(projectRoot, outKey, store, {
		registry: options.registry,
		meta,
		name
	});
	return {
		key: outKey,
		parts: parts.map((p) => p.key),
		links,
		unlinked,
		nodeCount: nodes.length
	};
}
//#endregion
//#region ../tongflow-studio/src/project/manifest.ts
/** Project discovery, creation and `project.json` handling. */
var ProjectNotFoundError = class extends Error {
	projectId;
	constructor(projectId) {
		super(`project "${projectId}" not found`);
		this.projectId = projectId;
		this.name = "ProjectNotFoundError";
	}
};
function projectRoot(studioRoot, projectId) {
	if (!isProjectId(projectId)) throw new Error(`invalid project id "${projectId}"`);
	return join(studioPaths(studioRoot).projects, projectId);
}
async function loadProject(studioRoot, projectId) {
	const root = projectRoot(studioRoot, projectId);
	const manifestPath = join(root, PROJECT_MANIFEST);
	if (!await exists(manifestPath)) throw new ProjectNotFoundError(projectId);
	return {
		id: projectId,
		root,
		manifest: await readJson$1(manifestPath)
	};
}
async function listProjects(studioRoot) {
	const dir = studioPaths(studioRoot).projects;
	if (!await isDir$1(dir)) return [];
	const names = (await readdir(dir)).filter(isProjectId).sort();
	const out = [];
	for (const id of names) try {
		const ref = await loadProject(studioRoot, id);
		out.push(await summarize(ref));
	} catch {}
	out.sort((a, b) => a.updatedAt < b.updatedAt ? 1 : -1);
	return out;
}
async function summarize(ref) {
	let workflowCount = 0;
	let fileCount = 0;
	const walk = async (dir, depth) => {
		if (depth > 12) return;
		let entries;
		try {
			entries = await readdir(dir, { withFileTypes: true });
		} catch {
			return;
		}
		for (const e of entries) {
			if (e.name.startsWith(".")) continue;
			if (e.isDirectory()) await walk(join(dir, e.name), depth + 1);
			else {
				fileCount++;
				if (e.name.endsWith(".tongflow.json")) workflowCount++;
			}
		}
	};
	await walk(ref.root, 0);
	return {
		...ref.manifest,
		root: ref.root,
		workflowCount,
		fileCount
	};
}
/** Pick a free project id derived from the title. */
async function allocateProjectId(studioRoot, title, preferred) {
	const base = preferred && isProjectId(preferred) ? preferred : projectIdFor(title);
	const projects = studioPaths(studioRoot).projects;
	await mkdir(projects, { recursive: true });
	if (!await exists(join(projects, base))) return base;
	for (let i = 2; i < 1e3; i++) {
		const candidate = `${base}-${i}`;
		if (!await exists(join(projects, candidate))) return candidate;
	}
	throw new Error(`cannot allocate a project id for "${title}"`);
}
/**
* Create an empty project: a folder with `project.json` and nothing else —
* the agent designs the structure for what the user wants to make.
*/
async function createProject(studioRoot, input) {
	const title = input.title.trim();
	if (!title) throw new Error("title is required");
	const id = await allocateProjectId(studioRoot, title, input.id);
	const root = projectRoot(studioRoot, id);
	await mkdir(root, { recursive: true });
	const at = nowIso();
	const manifest = {
		id,
		title,
		createdAt: at,
		updatedAt: at,
		...input.brief?.trim() ? { brief: input.brief.trim() } : {},
		...input.locale?.trim() ? { locale: input.locale.trim() } : {}
	};
	await writeJson(join(root, PROJECT_MANIFEST), manifest);
	return {
		id,
		root,
		manifest
	};
}
//#endregion
//#region ../tongflow-studio/src/shared/types.ts
const MEDIA_EXT = {
	png: "image",
	jpg: "image",
	jpeg: "image",
	webp: "image",
	gif: "image",
	mp4: "video",
	mov: "video",
	webm: "video",
	mp3: "audio",
	wav: "audio",
	m4a: "audio",
	ogg: "audio",
	flac: "audio",
	md: "text",
	txt: "text",
	json: "text",
	yaml: "text",
	yml: "text",
	csv: "text",
	srt: "text",
	glb: "model",
	gltf: "model",
	obj: "model",
	ply: "model",
	splat: "model"
};
function modalityOfExt(ext) {
	return MEDIA_EXT[ext.toLowerCase().replace(/^\./, "")] ?? "file";
}
//#endregion
//#region ../tongflow-studio/src/api.ts
/**
* StudioApi — the one service layer both the agent tools and the HTTP routes
* call. Everything is keyed by project id; the project directory on disk is
* the source of truth (no in-memory canvas state).
*/
/** Where a folder's composed workflow lives: inside that folder, named after it. */
function composedKeyForFolder(folderKey) {
	const dir = normalizeKey(folderKey);
	const name = `${basename(dir || "project")}${COMPOSED_SUFFIX}${WORKFLOW_EXT}`;
	return dir ? `${dir}/${name}` : name;
}
var StudioApi = class {
	studio;
	constructor(studio) {
		this.studio = studio;
	}
	listProjects() {
		return listProjects(this.studio.paths.root);
	}
	async createProject(input) {
		const { id } = await createProject(this.studio.paths.root, {
			locale: this.studio.config.locale,
			...input
		});
		return summarize(await this.project(id));
	}
	project(projectId) {
		return loadProject(this.studio.paths.root, projectId);
	}
	async projectSummary(projectId) {
		return summarize(await this.project(projectId));
	}
	/**
	* What exists: the folder tree (as indented text), every workflow with
	* its outputs, recent runs. This is what the agent reads first.
	*/
	async status(projectId) {
		const ref = await this.project(projectId);
		const [summary, workflows, tree] = await Promise.all([
			summarize(ref),
			listWorkflows(ref.root),
			this.tree(projectId)
		]);
		return {
			project: summary,
			tree: renderTree(tree),
			workflows: workflows.map((w) => ({
				key: w.key,
				name: w.name,
				...w.description ? { description: w.description } : {},
				nodes: w.nodeCount,
				inputs: w.inputs,
				outputs: w.outputCount,
				lastNo: w.lastNo
			})),
			runs: this.studio.runs.list(projectId).slice(0, 10)
		};
	}
	async listWorkflows(projectId) {
		return listWorkflows((await this.project(projectId)).root);
	}
	async readWorkflow(projectId, key) {
		return readWorkflowFile((await this.project(projectId)).root, normalizeWorkflowKey(key));
	}
	/** The document as the canvas should see it (references anchored at the project root). */
	async readWorkflowForCanvas(projectId, keyInput) {
		const key = normalizeWorkflowKey(keyInput);
		return canvasView(await this.readWorkflow(projectId, key), key);
	}
	async workflowSummary(projectId, key) {
		return summarizeWorkflow((await this.project(projectId)).root, normalizeWorkflowKey(key));
	}
	/** Create an empty workflow file, or copy another workflow — never overwrites. */
	async newWorkflow(projectId, keyInput, options = {}) {
		const ref = await this.project(projectId);
		const key = normalizeWorkflowKey(keyInput);
		if (await exists(fromProjectKey(ref.root, key))) throw new Error(`${key} already exists — patch it, or pick another name`);
		let doc;
		if (options.copyFrom) {
			const src = await this.readWorkflow(projectId, options.copyFrom);
			doc = {
				...src,
				meta: {
					...src.meta,
					...options.meta ?? {}
				}
			};
			if (options.name) doc.name = options.name;
			if (options.description !== void 0) doc.description = options.description;
		} else doc = {
			name: options.name ?? basename(key, ".tongflow.json"),
			...options.description ? { description: options.description } : {},
			flow: {
				nodes: [],
				edges: []
			},
			meta: options.meta ?? {}
		};
		const store = hydrateStore(doc);
		const registry = (await this.studio.registry.get()).registry;
		await saveWorkflowFile(ref.root, key, store, {
			registry,
			meta: doc.meta,
			name: doc.name,
			description: doc.description ?? ""
		});
		return summarizeWorkflow(ref.root, key);
	}
	/** Run one of the tongflow graph tools (apply_graph_patch / read_canvas / validate_workflow / describe_node_type) against a file. */
	async graphTool(projectId, keyInput, tool, args) {
		const ref = await this.project(projectId);
		const key = normalizeWorkflowKey(keyInput);
		const doc = await readWorkflowFile(ref.root, key);
		const store = hydrateStore(doc);
		const registry = (await this.studio.registry.get()).registry;
		const context = {
			registry,
			statusByNodeId: this.nodeStatuses(projectId, key)
		};
		const result = executeGraphTool(store, tool, args, context);
		if (tool === "apply_graph_patch") {
			await saveWorkflowFile(ref.root, key, store, {
				registry,
				meta: doc.meta
			});
			const state = store.getState();
			return {
				...result,
				workflow: key,
				rendered: renderCanvas(state.nodes, state.edges, { maxText: 80 })
			};
		}
		return {
			...result,
			workflow: key
		};
	}
	async patchWorkflow(projectId, key, patch) {
		return this.graphTool(projectId, key, "apply_graph_patch", patch);
	}
	/** Full read: rendered canvas + inputs/outputs + generated files + validation. */
	async describeWorkflow(projectId, keyInput) {
		const ref = await this.project(projectId);
		const key = normalizeWorkflowKey(keyInput);
		const doc = await readWorkflowFile(ref.root, key);
		const store = hydrateStore(doc);
		const registry = (await this.studio.registry.get()).registry;
		const validation = executeGraphTool(store, "validate_workflow", {}, { registry });
		const [summary, outputs] = await Promise.all([summarizeWorkflow(ref.root, key), listOutputs(ref.root, key)]);
		return {
			ok: true,
			workflow: key,
			name: doc.name,
			description: doc.description,
			canvas: renderCanvas(doc.flow.nodes, doc.flow.edges, { maxText: 200 }),
			inputs: summary.inputs,
			outputs: summary.outputs,
			meta: doc.meta,
			executable: Boolean(doc.executable),
			exportError: doc.exportError,
			validation,
			hash: workflowHash(doc),
			files: outputs.map((o) => ({
				key: o.key,
				no: o.no,
				...o.output ? { output: o.output } : {},
				size: o.size,
				mtime: o.mtime,
				...o.record?.note ? { note: o.record.note } : {}
			}))
		};
	}
	/**
	* Compose small workflows (explicit list, or every workflow directly in
	* a folder) into one big one; see project/compose.ts.
	*/
	async composeWorkflows(projectId, options) {
		const ref = await this.project(projectId);
		const workflows = options.workflows && options.workflows.length > 0 ? options.workflows : options.folder !== void 0 ? await workflowsInFolder(ref.root, options.folder) : [];
		if (workflows.length === 0) throw new Error("nothing to compose — pass workflows: [...] or a folder that holds workflow files");
		const registry = (await this.studio.registry.get()).registry;
		const path = options.path ?? (options.folder !== void 0 ? composedKeyForFolder(options.folder) : void 0);
		return composeWorkflows(ref.root, {
			workflows,
			...path !== void 0 ? { path } : {},
			...options.name ? { name: options.name } : {},
			registry
		});
	}
	/** Generated files next to a workflow, with provenance. */
	async workflowOutputs(projectId, keyInput) {
		return listOutputs((await this.project(projectId)).root, normalizeWorkflowKey(keyInput));
	}
	/** Save a document coming from the canvas (flow already edited client-side). */
	async saveWorkflowDocument(projectId, keyInput, doc) {
		const ref = await this.project(projectId);
		const key = normalizeWorkflowKey(keyInput);
		const store = hydrateStore(doc);
		const registry = (await this.studio.registry.get()).registry;
		await saveWorkflowFile(ref.root, key, store, {
			registry,
			meta: doc.meta,
			name: doc.name,
			description: doc.description ?? ""
		});
		return summarizeWorkflow(ref.root, key);
	}
	async deleteWorkflow(projectId, key) {
		await deleteWorkflowFile((await this.project(projectId)).root, normalizeWorkflowKey(key));
	}
	/** How a plugin is billed, from what the registry knows about it. */
	async pluginBilling(pluginId) {
		const { registry, meta } = await this.studio.registry.get();
		const plugin = registry.plugins[pluginId];
		const env = meta[pluginId]?.env ?? [];
		if (plugin?.needsDeploy) return {
			billing: "modal",
			note: "Runs on your Modal account: GPU time is billed per second while it runs (plus a cold start); the first run deploys the app, which can take minutes."
		};
		if (env.some((e) => e.required)) return {
			billing: "api",
			note: `Calls a paid API with your own key (${env.filter((e) => e.required).map((e) => e.key).join(", ")}); every run is billed by that provider.`
		};
		return {
			billing: "local",
			note: "Runs locally / free of charge as far as the studio knows."
		};
	}
	/**
	* Paid plugins (API / Modal) a workflow run would use, with what the user
	* needs to know to say yes. Empty means the run is free and may start
	* without asking.
	*/
	async paidPlugins(projectId, keyInput) {
		const ref = await this.project(projectId);
		const key = normalizeWorkflowKey(keyInput);
		const nodes = (await readWorkflowFile(ref.root, key)).executable?.executableNodes ?? [];
		const byPlugin = /* @__PURE__ */ new Map();
		for (const n of nodes) {
			if (!n.pluginId) continue;
			const e = byPlugin.get(n.pluginId) ?? {
				slots: /* @__PURE__ */ new Set(),
				models: /* @__PURE__ */ new Set()
			};
			e.slots.add(n.feature);
			if (n.model) e.models.add(n.model);
			byPlugin.set(n.pluginId, e);
		}
		if (byPlugin.size === 0) return [];
		const { registry, meta } = await this.studio.registry.get();
		const envNow = await this.studio.pluginEnv();
		const out = [];
		for (const [pluginId, e] of byPlugin) {
			const { billing, note } = await this.pluginBilling(pluginId);
			if (billing === "local") continue;
			const plugin = registry.plugins[pluginId];
			const slots = [...e.slots];
			const availableModels = [...new Set(slots.flatMap((slot) => plugin?.methodsByNodeSlot?.[slot]?.models ?? []))];
			const alternatives = [];
			for (const [otherId, otherPlugin] of Object.entries(registry.plugins)) {
				if (otherId === pluginId) continue;
				const shared = slots.filter((slot) => otherPlugin.methodsByNodeSlot?.[slot]);
				if (shared.length === 0) continue;
				alternatives.push({
					pluginId: otherId,
					billing: (await this.pluginBilling(otherId)).billing,
					slots: shared
				});
			}
			out.push({
				pluginId,
				...plugin?.name ? { name: plugin.name } : {},
				billing,
				billingNote: note,
				models: [...e.models],
				availableModels,
				env: (meta[pluginId]?.env ?? []).map((v) => ({
					key: v.key,
					required: Boolean(v.required),
					set: Boolean(envNow[v.key] || process.env[v.key])
				})),
				slots,
				alternatives
			});
		}
		return out;
	}
	async startRun(request) {
		const project = await this.project(request.projectId);
		const req = { ...request };
		if (req.workflowKey) req.workflowKey = normalizeWorkflowKey(req.workflowKey);
		return this.studio.runs.start(project, req);
	}
	/** Canvas single-node execution → a run of a one-node inline document. */
	async startCanvasRun(projectId, body) {
		const project = await this.project(projectId);
		const document = await singleNodeDocument(project.root, body);
		return this.studio.runs.start(project, {
			projectId,
			document,
			label: `canvas ${body.feature}`,
			keepRunDir: true
		});
	}
	getRun(runId) {
		return this.studio.runs.get(runId);
	}
	listRuns(projectId) {
		return this.studio.runs.list(projectId);
	}
	/** nodeId → status for the given workflow, from the latest run touching it. */
	nodeStatuses(projectId, key) {
		const latest = this.studio.runs.list(projectId).find((r) => r.workflow === key);
		if (!latest) return {};
		return Object.fromEntries(Object.entries(latest.nodes).map(([id, n]) => [id, n.status]));
	}
	async registry() {
		return this.studio.registry.get();
	}
	async installPlugin(idOrUrl) {
		return this.studio.registry.install(idOrUrl);
	}
	async uninstallPlugin(id) {
		return this.studio.registry.uninstall(id);
	}
	async updatePlugins(ids) {
		return this.studio.registry.update(ids);
	}
	/**
	* The node catalog the agent reads before writing a workflow: TongFlow's
	* grammar (six node categories, how edges and outputs work, batch vs
	* collect), then one line per node type grouped by category — ABI slot,
	* wires (with the data node each accepts), config fields, outputs, and
	* which installed plugins implement it. Everything per-type comes from
	* the ABI registry, so it cannot drift from what the exporter accepts.
	*/
	async nodeCatalog() {
		const { registry } = await this.studio.registry.get();
		const byCat = /* @__PURE__ */ new Map();
		for (const c of NODE_CATEGORY_ORDER) byCat.set(c, []);
		const uncategorized = [];
		for (const type of KNOWN_NODE_TYPES) {
			const cat = categoryOf(type);
			const feature = NODE_TYPE_TO_ABI_FEATURE[type];
			let line;
			if (!feature) line = cat === "add" ? `- ${type}: canvas input widget — do NOT use in agent-written workflows; use the ${type.replace(/^add/, "").replace(/^[A-Z]/, (m) => m.toLowerCase())} modality node with data instead` : `- ${type}: carries ${type.replace(/Node$/, "")} (data: ${type === "textNode" || type === "linkNode" ? "{texts:[…]}" : "{fileKeys:[…]}"})`;
			else {
				const spec = resolvedSpecForNodeType(type);
				if (!spec) continue;
				const wires = [];
				const config = [];
				for (const field of spec.topology.inputOrder) {
					const f = spec.fields[field];
					if (f.kind === "handle") {
						const flag = f.batch ? " batch" : f.collect ? " collect" : f.array ? "[]" : "";
						wires.push(`${field}←${f.nodeType.replace(/Node$/, "")}${flag}${f.required ? "*" : ""}`);
					} else config.push(`${field}${f.required ? "*" : ""}`);
				}
				const outs = spec.topology.outputs.map((o) => `${o.field}→${o.nodeType.replace(/Node$/, "")}`);
				const plugins = registry.nodePluginMap[feature] ?? [];
				line = `- ${type} (${feature}): wires ${wires.join(", ") || "-"}; config ${config.join(", ") || "-"}; out ${outs.join(", ") || "-"}; plugins: ${plugins.length ? plugins.join(", ") : "NONE INSTALLED"}`;
			}
			if (cat) byCat.get(cat).push(line);
			else uncategorized.push(line);
		}
		const sections = [CATALOG_GRAMMAR.trim()];
		const titles = {
			add: "add/ — canvas input widgets (not for agent workflows)",
			modality: "modality/ — data nodes, one asset each (what you wire INTO executables; also what executables emit)",
			transfer: "transfer/ — 1 → 1 executables",
			compose: "compose/ — N → 1 executables",
			decompose: "decompose/ — 1 → N executables",
			batch: "batch/ — N → 1 groupings"
		};
		for (const c of NODE_CATEGORY_ORDER) {
			const lines = byCat.get(c) ?? [];
			if (lines.length === 0) continue;
			sections.push(`## ${titles[c]}\n${lines.join("\n")}`);
		}
		if (uncategorized.length > 0) sections.push(`## other\n${uncategorized.join("\n")}`);
		return sections.join("\n\n");
	}
	async readTextFile(projectId, key) {
		const ref = await this.project(projectId);
		return readFile(fromProjectKey(ref.root, normalizeKey(key)), "utf8");
	}
	async writeTextFile(projectId, key, text) {
		await writeFileAtomic(fromProjectKey((await this.project(projectId)).root, normalizeKey(key)), text);
	}
	async deleteFile(projectId, key) {
		const ref = await this.project(projectId);
		await unlink(fromProjectKey(ref.root, normalizeKey(key)));
	}
	/**
	* Store a user-supplied file under `dirKey` (created as needed) without
	* overwriting: a clash gets a short suffix. Returns the project key.
	*/
	async uploadFile(projectId, dirKey, fileName, data) {
		const ref = await this.project(projectId);
		const dir = fromProjectKey(ref.root, normalizeKey(dirKey) || ".");
		await mkdir(dir, { recursive: true });
		const safe = sanitizeFileName(basename(fileName || "upload")) || "upload";
		let dest = join(dir, safe);
		if (await exists(dest)) {
			const ext = safe.includes(".") ? safe.slice(safe.lastIndexOf(".")) : "";
			const stem = safe.slice(0, safe.length - ext.length);
			let i = 2;
			while (await exists(join(dir, `${stem}-${i}${ext}`))) i++;
			dest = join(dir, `${stem}-${i}${ext}`);
		}
		await writeFile(dest, data);
		return {
			key: toProjectKey(ref.root, dest),
			size: data.byteLength
		};
	}
	async filePath(projectId, key) {
		return fromProjectKey((await this.project(projectId)).root, normalizeKey(key));
	}
	/**
	* The project folder as a tree. Generated files (`<stem>.NN…`) and the
	* runs log are nested under their workflow so the pane shows "workflow +
	* what it made" as one unit; everything else is listed as-is.
	*/
	async tree(projectId) {
		const ref = await this.project(projectId);
		return this.dirTree(ref.root, ref.root, "");
	}
	async dirTree(root, dir, prefix) {
		if (!await exists(dir)) return [];
		const entries = (await readdir(dir, { withFileTypes: true })).filter((e) => !e.name.startsWith(".") && e.name !== ".runs");
		entries.sort((a, b) => {
			if (a.isDirectory() !== b.isDirectory()) return a.isDirectory() ? -1 : 1;
			return a.name.localeCompare(b.name);
		});
		const keyOf = (name) => prefix ? `${prefix}/${name}` : name;
		const claimed = /* @__PURE__ */ new Set();
		const workflowNodes = /* @__PURE__ */ new Map();
		for (const e of entries) {
			if (!e.isFile() || !isWorkflowKey(e.name)) continue;
			const key = keyOf(e.name);
			const outputs = await listOutputs(root, key);
			const logKey = runsLogKey(key);
			const children = outputs.map((o) => {
				claimed.add(o.fileName);
				return {
					id: o.key,
					label: o.fileName.slice(basename(key, WORKFLOW_EXT).length + 1),
					kind: "output",
					key: o.key,
					meta: {
						size: o.size,
						mtime: o.mtime,
						modality: modalityOfExt(o.ext),
						no: o.no,
						...o.output ? { output: o.output } : {}
					}
				};
			});
			claimed.add(basename(logKey));
			const st = await stat(join(dir, e.name));
			workflowNodes.set(e.name, {
				id: key,
				label: e.name.slice(0, -14),
				kind: "workflow",
				key,
				meta: {
					size: st.size,
					mtime: st.mtime.toISOString(),
					outputCount: outputs.length
				},
				...children.length > 0 ? { children } : {}
			});
		}
		const out = [];
		for (const e of entries) {
			const key = keyOf(e.name);
			if (e.isDirectory()) {
				out.push({
					id: key,
					label: e.name,
					kind: "folder",
					key,
					children: await this.dirTree(root, join(dir, e.name), key)
				});
				continue;
			}
			const wf = workflowNodes.get(e.name);
			if (wf) {
				out.push(wf);
				continue;
			}
			if (claimed.has(e.name)) continue;
			const st = await stat(join(dir, e.name));
			out.push({
				id: key,
				label: e.name,
				kind: "file",
				key,
				meta: {
					size: st.size,
					mtime: st.mtime.toISOString(),
					modality: modalityOfExt(e.name.split(".").pop() ?? "")
				}
			});
		}
		return out;
	}
	/** Provenance log of a workflow (`<stem>.runs.json`). */
	async runsLog(projectId, keyInput) {
		return readRunsLog((await this.project(projectId)).root, normalizeWorkflowKey(keyInput));
	}
	toKey(projectRoot, abs) {
		return toProjectKey(projectRoot, abs);
	}
};
/** Keep a user-supplied file name safe for the project folder: no control chars, no separators, no leading dots. */
function sanitizeFileName(name) {
	return [...name].map((ch) => ch.charCodeAt(0) < 32 || "/\\:*?\"<>|".includes(ch) ? "_" : ch).join("").replace(/\s+/g, "_").replace(/^\.+/, "");
}
/** The grammar preamble of the node catalog. */
const CATALOG_GRAMMAR = `
# TongFlow node grammar (follow it exactly — the patch tool rejects anything else)

A workflow is a graph of MODALITY data nodes and EXECUTABLE nodes.
- Modality nodes (textNode, imageNode, videoNode, audioNode, fileNode, modelNode, linkNode) carry one asset each: data:{texts:[…]} for text/link, data:{fileKeys:[…]} for the others (paths relative to the workflow file or the project root, or URLs). They are the ONLY things you wire into an executable.
- Executable nodes come in four categories (each maps to one ABI slot = one plugin method): transfer (1 → 1), compose (N → 1), decompose (1 → N), batch (N → 1 grouping). Pick the node whose slot matches the transformation; never fake a compose with a chain of transfers or vice versa.
- Each executable's "wires" are its input handles: field←modality (* = required). Draw an edge FROM a modality node (or an upstream executable's output) TO that field; handles are derived automatically, pass toHandle only to disambiguate. Its "config" fields are set in data:{…} at creation or by update_nodes. Its "out" lists the modality nodes it emits — those are created automatically when you save; wire the NEXT executable from the executable node itself (or its emitted modality node), never invent an output node.
- Batch semantics: a wire marked "batch" runs the executable once per upstream item (a textNode with 3 texts → 3 outputs); "collect" gathers every incoming edge into one array for a single run (e.g. images collect → one video); "[]" is an intrinsically array-typed input. Do not build loops by copying nodes — use batch.
- Level-0 modality nodes WITHOUT data become workflow inputs supplied at run time (name them with data:{inputName:'…'}); prefer writing the data in.
- Text you author goes into textNode data (or {{file}} includes) — genTextNode / textsGenTextNode are for mechanical transforms only.
- After every patch read the result: ok:false steps mean the grammar or ABI rejected it — fix, do not retry blindly. tongflow_node_describe(type) gives the full config schema (enums, ranges, defaults) of one node.
`;
/** Indented text view of the tree (what the agent reads in project_status). */
function renderTree(nodes, depth = 0) {
	const lines = [];
	for (const n of nodes) {
		const pad = "  ".repeat(depth);
		if (n.kind === "folder") {
			lines.push(`${pad}${n.label}/`);
			if (n.children) lines.push(renderTree(n.children, depth + 1));
		} else if (n.kind === "workflow") {
			const count = n.meta?.outputCount ?? 0;
			lines.push(`${pad}${n.label}${WORKFLOW_EXT}  [workflow${count ? `, ${count} output file${count === 1 ? "" : "s"}` : ""}]`);
			for (const c of n.children ?? []) lines.push(`${pad}  ${c.key.split("/").pop()}`);
		} else if (n.kind === "file") lines.push(`${pad}${n.label}`);
	}
	return lines.filter((l) => l.length > 0).join("\n");
}
//#endregion
//#region ../tongflow-studio/src/engine/bootstrap.ts
/**
* Python bootstrap: find an interpreter (≥ 3.10), create the studio venv and
* install the `tongflow` SDK into it. That venv's python is what launches
* `python -m tongflow engine` / `scan`; the engine then provisions its own
* shared plugin venv under the studio data dir.
*/
const execFile$4 = promisify(execFile);
/** SDK version installed into the studio venv when `sdkSpec` is not configured. */
const DEFAULT_TONGFLOW_SDK_VERSION = "0.3.0";
const MIN_PYTHON = [3, 10];
const CANDIDATES = [
	"python3.13",
	"python3.12",
	"python3.11",
	"python3.10",
	"python3",
	"python"
];
async function probe(path) {
	try {
		const { stdout } = await execFile$4(path, ["-c", "import sys; print('%d.%d.%d' % sys.version_info[:3])"]);
		const [a, b, c] = stdout.trim().split(".").map(Number);
		if (!Number.isFinite(a) || !Number.isFinite(b)) return void 0;
		return {
			path,
			version: [
				a,
				b,
				c ?? 0
			]
		};
	} catch {
		return;
	}
}
function meetsMin(v) {
	return v[0] > MIN_PYTHON[0] || v[0] === MIN_PYTHON[0] && v[1] >= MIN_PYTHON[1];
}
/** Locate a usable interpreter: explicit path first, then PATH candidates, then `uv python find`. */
async function findPython(explicit) {
	const tried = [];
	if (explicit?.trim()) {
		const info = await probe(explicit.trim());
		if (info && meetsMin(info.version)) return info;
		tried.push(explicit);
		throw new Error(`configured pythonPath "${explicit}" is ${info ? `Python ${info.version.join(".")}` : "not runnable"}; tongflow-studio needs Python >= ${MIN_PYTHON.join(".")}`);
	}
	for (const c of CANDIDATES) {
		const info = await probe(c);
		if (info && meetsMin(info.version)) return info;
		tried.push(c);
	}
	try {
		const { stdout } = await execFile$4("uv", [
			"python",
			"find",
			`>=${MIN_PYTHON.join(".")}`
		]);
		const info = await probe(stdout.trim());
		if (info && meetsMin(info.version)) return info;
	} catch {}
	throw new Error(`no Python >= ${MIN_PYTHON.join(".")} found (tried ${tried.join(", ")}); install one (e.g. \`brew install python@3.12\` or \`uv python install 3.12\`) or set pythonPath in the tongflow settings`);
}
function venvPython(venvDir) {
	return process.platform === "win32" ? join(venvDir, "Scripts", "python.exe") : join(venvDir, "bin", "python");
}
/** Create the studio venv if needed and make sure the requested SDK spec is installed. Returns the venv python. */
async function ensureVenv(options) {
	const { venvDir, log = () => void 0 } = options;
	const spec = options.sdkSpec?.trim() || `tongflow==0.3.0`;
	const py = venvPython(venvDir);
	const marker = join(venvDir, ".tongflow-sdk-spec");
	if (await exists(py)) {
		if ((await readFile(marker, "utf8").catch(() => "")).trim() === spec) return py;
	} else {
		const base = await findPython(options.pythonPath);
		log(`creating studio venv with ${base.path} (Python ${base.version.join(".")})`);
		await run(base.path, [
			"-m",
			"venv",
			venvDir
		], log, options.signal);
	}
	log(`installing ${spec} into the studio venv`);
	await run(py, [
		"-m",
		"pip",
		"install",
		"--disable-pip-version-check",
		"--upgrade",
		...specArgs(spec)
	], log, options.signal);
	await writeFileAtomic(marker, `${spec}\n`);
	return py;
}
function specArgs(spec) {
	return spec.split(/\s+/).filter(Boolean);
}
function run(cmd, args, log, signal) {
	return new Promise((resolve, reject) => {
		const child = spawn(cmd, args, {
			stdio: [
				"ignore",
				"pipe",
				"pipe"
			],
			signal
		});
		let tail = "";
		const onData = (chunk) => {
			const text = chunk.toString();
			tail = (tail + text).slice(-4e3);
			for (const line of text.split(/\r?\n/)) if (line.trim()) log(line.trim());
		};
		child.stdout.on("data", onData);
		child.stderr.on("data", onData);
		child.on("error", reject);
		child.on("close", (code) => {
			if (code === 0) resolve();
			else reject(/* @__PURE__ */ new Error(`${cmd} ${args.join(" ")} exited with ${code}\n${tail}`));
		});
	});
}
//#endregion
//#region ../tongflow-studio/src/engine/registry.ts
/**
* Plugin registry: what TongFlow plugins are installed under the studio
* plugins dir and which ABI slots they implement. Produced headlessly by
* `python -m tongflow scan`, cached in memory, invalidated on install /
* uninstall. Presentation metadata (name / description / icon / env) is merged
* from each plugin's `tongflow.plugin.json`, as the TongFlow app does.
*/
const execFile$3 = promisify(execFile);
const OFFICIAL_ORG = "https://github.com/tong-io";
/**
* Official plugin ids — fallback snapshot of `config/official-plugins.json`
* in the TongFlow repo; `RegistryManager.officialIds()` fetches the live list
* and falls back to this one offline.
*/
const OFFICIAL_PLUGINS = [
	"tongflow-router-openrouter",
	"tongflow-router-cometapi",
	"tongflow-router-toapis",
	"tongflow-api-gemini",
	"tongflow-api-openai",
	"tongflow-api-deepseek",
	"tongflow-api-bytedance",
	"tongflow-router-apimart",
	"tongflow-api-xai",
	"tongflow-router-replicate",
	"tongflow-router-fal",
	"tongflow-api-runway",
	"tongflow-modal-ffmpeg",
	"tongflow-modal-pyscenedetect",
	"tongflow-modal-z-image",
	"tongflow-modal-ernie-image",
	"tongflow-modal-krea2",
	"tongflow-modal-flux2-klein9b",
	"tongflow-modal-boogu",
	"tongflow-modal-infinitetalk",
	"tongflow-modal-wan-animate",
	"tongflow-modal-scail2",
	"tongflow-modal-minimax-h3",
	"tongflow-modal-bernini",
	"tongflow-modal-sam3",
	"tongflow-modal-triposplat",
	"tongflow-modal-sam-3d-objects",
	"tongflow-modal-sam-3d-body",
	"tongflow-modal-sapiens2",
	"tongflow-modal-sensenova-vision",
	"tongflow-modal-seedvr2",
	"tongflow-modal-gemma4",
	"tongflow-modal-qwen38",
	"tongflow-modal-qwen3asr",
	"tongflow-modal-qwen3tts",
	"tongflow-modal-indextts2",
	"tongflow-modal-whisper",
	"tongflow-modal-ace-step",
	"tongflow-modal-levo",
	"tongflow-modal-minimax-music3",
	"tongflow-modal-sam-audio",
	"tongflow-modal-docling",
	"tongflow-modal-paddle",
	"tongflow-modal-unlimited-ocr",
	"tongflow-modal-crawl4ai",
	"tongflow-modal-scrapling"
];
/** Where the live official list is fetched from. */
const OFFICIAL_PLUGINS_URL = "https://raw.githubusercontent.com/tong-io/tongflow/main/config/official-plugins.json";
const PLUGIN_ID_RE = /^tongflow-(modal|api|router|local)-[a-z0-9-]+$/;
function isPluginId(id) {
	return PLUGIN_ID_RE.test(id);
}
var RegistryManager = class {
	opts;
	cache;
	inflight;
	officialCache;
	constructor(opts) {
		this.opts = opts;
	}
	invalidate() {
		this.cache = void 0;
	}
	async get() {
		if (this.cache) return this.cache;
		if (!this.inflight) this.inflight = this.scan().finally(() => {
			this.inflight = void 0;
		});
		return this.inflight;
	}
	async scan() {
		await mkdir(this.opts.pluginsDir, { recursive: true });
		const python = await this.opts.python();
		const args = [
			"-m",
			"tongflow",
			"scan",
			"--root",
			this.opts.pluginsDir
		];
		if (this.opts.abiPath) args.push("--abi", this.opts.abiPath);
		const { stdout } = await execFile$3(python, args, { maxBuffer: 33554432 });
		const registry = PluginsRegistrySchema.parse(JSON.parse(stdout));
		const meta = {};
		for (const id of Object.keys(registry.plugins)) {
			const m = await readJsonOr(join(this.opts.pluginsDir, id, "tongflow.plugin.json"), {});
			meta[id] = {
				...m.plugin ?? {},
				env: m.env ?? []
			};
			const p = registry.plugins[id];
			if (m.plugin?.name) p.name = m.plugin.name;
			if (m.plugin?.description) p.description = m.plugin.description;
		}
		this.cache = {
			registry,
			meta,
			scannedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
		return this.cache;
	}
	/** The official plugin list: live from GitHub (cached 1 h), else the built-in snapshot. */
	async officialIds() {
		const now = Date.now();
		if (this.officialCache && now - this.officialCache.at < 36e5) return this.officialCache.ids;
		let ids = [...OFFICIAL_PLUGINS];
		try {
			const res = await fetch(OFFICIAL_PLUGINS_URL, { signal: AbortSignal.timeout(8e3) });
			if (res.ok) {
				const body = await res.json();
				if (Array.isArray(body.plugins) && body.plugins.every((p) => typeof p === "string" && isPluginId(p))) ids = body.plugins;
			}
		} catch {}
		this.officialCache = {
			ids,
			at: now
		};
		return ids;
	}
	/**
	* Clone every official plugin that is not installed yet (shallow, a few
	* hundred KB each) so the canvas offers the full catalog like the hosted
	* app. Runs in the background at studio start; failures are logged, not
	* thrown. Returns the ids that were newly installed.
	*/
	async ensureOfficialInstalled(concurrency = 4) {
		const [official, installed] = await Promise.all([this.officialIds(), this.installedIds()]);
		const have = new Set(installed);
		const missing = official.filter((id) => !have.has(id));
		if (missing.length === 0) return [];
		this.opts.log(`tongflow-studio: installing ${missing.length} official plugin(s)…`);
		const done = [];
		let next = 0;
		const worker = async () => {
			while (next < missing.length) {
				const id = missing[next++];
				try {
					if (!(await this.install(id)).alreadyInstalled) done.push(id);
				} catch (error) {
					this.opts.log(`tongflow-studio: install ${id} failed: ${error instanceof Error ? error.message : String(error)}`);
				}
			}
		};
		await Promise.all(Array.from({ length: Math.min(concurrency, missing.length) }, worker));
		if (done.length > 0) this.invalidate();
		this.opts.log(`tongflow-studio: installed ${done.length} official plugin(s)`);
		return done;
	}
	/** Installed plugin ids (directories under pluginsDir). */
	async installedIds() {
		if (!await isDir$1(this.opts.pluginsDir)) return [];
		return (await readdir(this.opts.pluginsDir, { withFileTypes: true })).filter((e) => e.isDirectory() && isPluginId(e.name)).map((e) => e.name).sort();
	}
	gitUrlFor(pluginId) {
		return this.opts.pluginGitUrls[pluginId] ?? `${this.opts.org.replace(/\/$/, "")}/${pluginId}.git`;
	}
	/** `git clone --depth 1` a plugin (id → official org, or a full git URL). */
	async install(idOrUrl, signal) {
		let id;
		let url;
		if (/^(https?:\/\/|git@|ssh:\/\/)/.test(idOrUrl)) {
			url = idOrUrl;
			id = idOrUrl.replace(/\/+$/, "").split("/").pop().replace(/\.git$/, "");
		} else {
			id = idOrUrl;
			url = this.gitUrlFor(id);
		}
		if (!isPluginId(id)) throw new Error(`"${id}" is not a TongFlow plugin id (tongflow-modal-*/api-*/router-*/local-*)`);
		const dest = join(this.opts.pluginsDir, id);
		if (await exists(dest)) return {
			id,
			url,
			alreadyInstalled: true
		};
		await mkdir(this.opts.pluginsDir, { recursive: true });
		this.opts.log(`cloning ${url}`);
		await execFile$3("git", [
			"clone",
			"--depth",
			"1",
			"--recursive",
			url,
			dest
		], { signal });
		this.invalidate();
		return {
			id,
			url,
			alreadyInstalled: false
		};
	}
	async uninstall(id) {
		if (!isPluginId(id)) throw new Error(`invalid plugin id "${id}"`);
		await rm(join(this.opts.pluginsDir, id), {
			recursive: true,
			force: true
		});
		this.invalidate();
	}
	/** `git pull` every installed plugin; returns ids that changed. */
	async update(ids) {
		const targets = ids ?? await this.installedIds();
		const changed = [];
		for (const id of targets) {
			const dir = join(this.opts.pluginsDir, id);
			if (!await isDir$1(join(dir, ".git"))) continue;
			try {
				const before = (await execFile$3("git", [
					"-C",
					dir,
					"rev-parse",
					"HEAD"
				])).stdout.trim();
				await execFile$3("git", [
					"-C",
					dir,
					"pull",
					"--ff-only",
					"--recurse-submodules"
				]);
				if (before !== (await execFile$3("git", [
					"-C",
					dir,
					"rev-parse",
					"HEAD"
				])).stdout.trim()) changed.push(id);
			} catch (error) {
				this.opts.log(`update ${id} failed: ${error instanceof Error ? error.message : String(error)}`);
			}
		}
		if (changed.length > 0) this.invalidate();
		return changed;
	}
};
//#endregion
//#region ../tongflow-studio/src/engine/ingest.ts
/**
* Place engine outputs next to the workflow that produced them: every file
* becomes `<stem>.<no>[.<output>].<ext>` in the workflow's directory (one
* number per run), text outputs are written as `.txt` files too, and one
* record is appended to `<stem>.runs.json`.
*/
/** Collect `file_key` strings from a raw node output object (fallback when outputs_by_name is empty). */
function collectFileKeys(value, into) {
	if (!value) return;
	if (typeof value === "string") return;
	if (Array.isArray(value)) {
		for (const v of value) collectFileKeys(v, into);
		return;
	}
	if (typeof value === "object") {
		const obj = value;
		if (typeof obj.file_key === "string") {
			into.push(obj.file_key);
			return;
		}
		for (const v of Object.values(obj)) collectFileKeys(v, into);
	}
}
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/**
* A readable file-name tag: real output names (`image`, `caption`) are kept;
* a raw node id is shortened to its first segment.
*/
function shortTag(output, all) {
	if (!UUID_RE.test(output)) return output;
	const short = output.slice(0, 8);
	return [...all].some((o) => o !== output && o !== short && o.startsWith(short)) ? output : short;
}
function looksLikeFile(value) {
	return /\.[A-Za-z0-9]{1,5}$/.test(value) && !/\s/.test(value) && (value.includes("/") || value.startsWith("."));
}
async function ingestOutputs(options) {
	const { projectRoot, result, workflowKey } = options;
	const outcome = {
		files: [],
		loose: [],
		texts: {},
		no: 0
	};
	const label = (key) => options.outputLabels?.[key] ?? key;
	const byName = {};
	for (const [name, values] of Object.entries(result.outputs_by_name ?? {})) {
		const l = label(name);
		if (!byName[l]) byName[l] = [];
		byName[l].push(...values);
	}
	if (Object.keys(byName).length === 0) for (const [nodeId, out] of Object.entries(result.outputs ?? {})) {
		const keys = [];
		collectFileKeys(out, keys);
		if (keys.length === 0) continue;
		const l = label(nodeId);
		if (!byName[l]) byName[l] = [];
		byName[l].push(...keys);
	}
	const fileOutputs = [];
	for (const [output, values] of Object.entries(byName)) for (const value of values) {
		const abs = isAbsolute(value) ? value : resolve(projectRoot, value);
		if (looksLikeFile(value) && isInsideProject(projectRoot, abs)) fileOutputs.push({
			output,
			abs
		});
		else {
			if (!outcome.texts[output]) outcome.texts[output] = [];
			outcome.texts[output].push(value);
		}
	}
	if (!workflowKey) {
		for (const f of fileOutputs) outcome.loose.push({
			output: f.output,
			key: toProjectKey(projectRoot, f.abs)
		});
		return outcome;
	}
	const stem = outputStem(workflowKey);
	const dirAbs = fromProjectKey(projectRoot, keyDir(workflowKey) || ".");
	await mkdir(dirAbs, { recursive: true });
	const no = await nextOutputNo(projectRoot, workflowKey);
	outcome.no = no;
	const outputNames = /* @__PURE__ */ new Set([...fileOutputs.map((f) => f.output), ...Object.keys(outcome.texts)]);
	const several = outputNames.size > 1;
	const perOutput = /* @__PURE__ */ new Map();
	const written = [];
	const nameFor = (output, ext, count) => {
		const idx = perOutput.get(output) ?? 0;
		perOutput.set(output, idx + 1);
		const parts = [];
		if (several) parts.push(shortTag(output, outputNames));
		if (count > 1) parts.push(String(idx + 1));
		return outputFileName(stem, no, ext, parts.length > 0 ? parts.join("_") : void 0);
	};
	const countBy = /* @__PURE__ */ new Map();
	for (const f of fileOutputs) countBy.set(f.output, (countBy.get(f.output) ?? 0) + 1);
	for (const f of fileOutputs) {
		const ext = extname(f.abs).replace(/^\./, "") || "bin";
		const name = nameFor(f.output, ext, countBy.get(f.output) ?? 1);
		const dest = join(dirAbs, name);
		try {
			await rename(f.abs, dest);
		} catch {
			await copyFile(f.abs, dest);
		}
		written.push(name);
	}
	for (const [output, texts] of Object.entries(outcome.texts)) {
		const name = nameFor(output, "txt", 1);
		await writeFile(join(dirAbs, name), texts.join("\n\n"), "utf8");
		written.push(name);
	}
	await appendRunsLog(projectRoot, workflowKey, {
		...options.record,
		no,
		files: written,
		...Object.keys(outcome.texts).length > 0 ? { texts: outcome.texts } : {}
	});
	outcome.files = (await listOutputs(projectRoot, workflowKey)).filter((o) => o.no === no);
	return outcome;
}
//#endregion
//#region ../tongflow-studio/src/engine/runner.ts
/**
* Spawn `python -m tongflow engine` for one workflow run and translate its
* NDJSON stream into typed events. Mirrors the TongFlow app's
* `engine-delegate.server.ts`, minus the DB/SSE shell.
*/
var EngineError = class extends Error {
	stderr;
	constructor(message, stderr) {
		super(message);
		this.stderr = stderr;
		this.name = "EngineError";
	}
};
/** Run the engine to completion; resolves with the final result or throws EngineError. */
function runEngine(options) {
	const { python, request, signal, onEvent = () => void 0 } = options;
	return new Promise((resolve, reject) => {
		const child = spawn(python, [
			"-m",
			"tongflow",
			"engine"
		], {
			cwd: options.cwd,
			env: {
				...process.env,
				PYTHONUNBUFFERED: "1",
				...options.env ?? {}
			},
			stdio: [
				"pipe",
				"pipe",
				"pipe"
			]
		});
		let stderr = "";
		let result;
		let fatal;
		let settled = false;
		const abort = () => {
			if (settled) return;
			child.kill("SIGTERM");
			setTimeout(() => child.kill("SIGKILL"), 5e3).unref();
		};
		signal?.addEventListener("abort", abort, { once: true });
		child.stderr.on("data", (chunk) => {
			stderr = (stderr + chunk.toString()).slice(-16e3);
		});
		createInterface({ input: child.stdout }).on("line", (line) => {
			const trimmed = line.trim();
			if (!trimmed) return;
			let msg;
			try {
				msg = JSON.parse(trimmed);
			} catch {
				onEvent({
					type: "log",
					at: nowIso(),
					message: trimmed
				});
				return;
			}
			if ("ready" in msg) return;
			if ("event" in msg && msg.event && typeof msg.event === "object") {
				onEvent(translateEvent(msg.event));
				return;
			}
			if ("result" in msg) {
				result = msg.result;
				return;
			}
			if ("error" in msg) fatal = String(msg.error);
		});
		child.on("error", (error) => {
			settled = true;
			signal?.removeEventListener("abort", abort);
			reject(new EngineError(`failed to start the tongflow engine: ${error.message}`, stderr));
		});
		child.on("close", (code) => {
			settled = true;
			signal?.removeEventListener("abort", abort);
			if (signal?.aborted) {
				reject(new EngineError("run cancelled", stderr));
				return;
			}
			if (result) {
				resolve(result);
				return;
			}
			reject(new EngineError(`${fatal ?? (code === 0 ? "engine exited without a result" : `engine exited with code ${code}`)}${stderr ? `\n${lastLines(stderr, 12)}` : ""}`, stderr));
		});
		child.stdin.write(JSON.stringify(request));
		child.stdin.end();
	});
}
function lastLines(text, n) {
	return text.trim().split(/\r?\n/).slice(-n).join("\n");
}
function translateEvent(e) {
	const type = String(e.type ?? "log");
	const out = {
		type,
		at: nowIso()
	};
	if (typeof e.nodeId === "string") out.nodeId = e.nodeId;
	if (typeof e.label === "string") out.label = e.label;
	if (typeof e.feature === "string") out.feature = e.feature;
	if (typeof e.level === "number") out.level = e.level;
	if (typeof e.message === "string") out.message = e.message;
	if (typeof e.percent === "number") out.percent = e.percent;
	if (typeof e.error === "string") out.error = e.error;
	if (typeof e.totalNodes === "number") out.totalNodes = e.totalNodes;
	if (typeof e.levels === "number") out.levels = e.levels;
	if (type === "plugin_progress" && !out.nodeId && typeof e.pluginId === "string") out.label = String(e.pluginId);
	if (type === "workflow_failed" && Array.isArray(e.errors) && !out.error) out.error = e.errors.map(String).join("; ");
	return out;
}
//#endregion
//#region ../tongflow-studio/src/engine/run.ts
/**
* One workflow run against one project: bind inputs, resolve file references
* and `{{file}}` includes, launch the engine, place outputs next to the
* workflow, log provenance.
*/
async function executeRun(studio, project, request, runId, signal, emit, summary) {
	const startedAt = nowIso();
	const started = Date.now();
	const doc = request.document ?? await readWorkflowFile(project.root, request.workflowKey);
	if (!doc.executable) throw new Error(`workflow "${request.workflowKey ?? doc.name}" has no executable graph${doc.exportError ? `: ${doc.exportError}` : " — save it once it validates"}`);
	const baseDir = baseDirOf(project.root, request.workflowKey);
	const workflow = structuredClone(doc.executable);
	const missingPlugins = workflow.executableNodes.filter((n) => !n.pluginId).map((n) => `${n.label ?? n.id.slice(0, 8)} (${n.feature})`);
	if (missingPlugins.length > 0) throw new Error(`no plugin selected for: ${missingPlugins.join(", ")} — install one with tongflow_plugins_install and re-save the workflow`);
	const given = {};
	for (const [k, v] of Object.entries(request.inputs ?? {})) {
		if (v === void 0 || v === null) continue;
		given[k] = Array.isArray(v) ? v.map(String) : typeof v === "object" ? JSON.stringify(v) : String(v);
	}
	const inputs = {};
	const missing = [];
	for (const spec of workflow.inputs) {
		const bound = given[spec.name];
		if (bound === void 0) {
			if (spec.required && spec.defaultValue === void 0) missing.push(`${spec.name} (${spec.type})`);
			continue;
		}
		inputs[spec.name] = await bindValue(project.root, baseDir, spec.type, bound);
	}
	if (missing.length > 0) throw new Error(`unbound required inputs: ${missing.join(", ")} — pass them via inputs (text, or file paths relative to the workflow / project root), or write the values into the workflow's nodes`);
	await resolveEmbeddedRefs(project.root, baseDir, workflow);
	const runDir = join(project.root, RUNS_DIR, runId);
	await mkdir(runDir, { recursive: true });
	const result = await runEngine({
		python: await studio.python(emitLog(emit)),
		request: {
			workflow,
			inputs,
			options: {
				plugins_dir: studio.paths.plugins,
				data_dir: studio.paths.data,
				out_dir: runDir,
				...studio.abiPath ? { abi_path: studio.abiPath } : {},
				file_key_base: project.root,
				inline_outputs: false,
				auto_install: true,
				org: studio.config.pluginOrg,
				plugin_git_urls: studio.config.pluginGitUrls,
				task_id: runId,
				env: await studio.pluginEnv()
			}
		},
		signal,
		cwd: project.root,
		onEvent: emit
	});
	if (result.status !== "success") {
		const detail = result.errors.length > 0 ? result.errors.join("; ") : "workflow failed";
		throw new Error(detail);
	}
	const finishedAt = nowIso();
	const record = {
		runId,
		workflowHash: workflowHash(doc),
		inputs: given,
		pluginIds: [...new Set(workflow.executableNodes.map((n) => n.pluginId))],
		startedAt,
		finishedAt,
		durationMs: Date.now() - started,
		...request.note ? { note: request.note } : {}
	};
	const ingest = await ingestOutputs({
		projectRoot: project.root,
		result,
		...request.workflowKey ? { workflowKey: request.workflowKey } : {},
		...doc.meta.outputLabels ? { outputLabels: doc.meta.outputLabels } : {},
		record
	});
	if (!request.keepRunDir && ingest.loose.length === 0) await rm(runDir, {
		recursive: true,
		force: true
	}).catch(() => void 0);
	summary.files = ingest.files;
	emit({
		type: "ingested",
		at: nowIso(),
		files: ingest.files,
		outputs: result.outputs
	});
	return {
		summary,
		result,
		texts: ingest.texts,
		loose: ingest.loose,
		no: ingest.no
	};
}
function emitLog(emit) {
	return (line) => emit({
		type: "log",
		at: nowIso(),
		message: line
	});
}
/** Resolve one bound value into the engine's `{texts}` / `{fileKeys}` input form. */
async function bindValue(projectRoot, baseDir, type, bound) {
	const values = Array.isArray(bound) ? bound : [bound];
	if (type === "text" || type === "text[]") {
		const texts = [];
		for (const v of values) texts.push(hasTemplateRefs(v) ? await expandTemplate(projectRoot, baseDir, v) : v);
		return { texts };
	}
	const fileKeys = [];
	for (const v of values) fileKeys.push(await resolveFileRef(projectRoot, baseDir, v));
	return { fileKeys };
}
/** Replace file references inside static data nodes / static bindings with absolute paths, and expand `{{file}}` includes in texts. */
async function resolveEmbeddedRefs(projectRoot, baseDir, workflow) {
	for (const dn of workflow.dataNodes) {
		const sd = dn.staticData;
		if (!sd) continue;
		if (sd.fileKeys?.length) {
			const out = [];
			for (const k of sd.fileKeys) out.push(await resolveFileRef(projectRoot, baseDir, k));
			sd.fileKeys = out;
		}
		if (sd.texts?.some(hasTemplateRefs)) {
			const out = [];
			for (const t of sd.texts) out.push(hasTemplateRefs(t) ? await expandTemplate(projectRoot, baseDir, t) : t);
			sd.texts = out;
		}
	}
	for (const node of workflow.executableNodes) for (const binding of Object.values(node.bindings)) {
		if (binding.kind !== "static" && binding.kind !== "config") continue;
		if (hasTemplateRefs(binding.value)) binding.value = await expandTemplate(projectRoot, baseDir, binding.value);
	}
}
function newRunSummary(runId, projectId, workflow) {
	return {
		runId,
		projectId,
		workflow,
		status: "queued",
		startedAt: nowIso(),
		files: [],
		nodes: {}
	};
}
//#endregion
//#region ../tongflow-studio/src/engine/runs.ts
/**
* Run manager: queues runs (bounded concurrency), keeps their event logs for
* late subscribers (SSE / job output), supports cancellation.
*/
const MAX_EVENTS = 2e3;
var RunManager = class {
	studio;
	records = /* @__PURE__ */ new Map();
	active = 0;
	queue = [];
	constructor(studio) {
		this.studio = studio;
	}
	get(runId) {
		return this.records.get(runId);
	}
	list(projectId) {
		return [...this.records.values()].map((r) => r.summary).filter((s) => !projectId || s.projectId === projectId).sort((a, b) => a.startedAt < b.startedAt ? 1 : -1);
	}
	/** Start (or queue) a run and return its record immediately. */
	start(project, request) {
		const runId = `run-${randomUUID().slice(0, 8)}`;
		const label = request.label ?? request.workflowKey ?? request.document?.name ?? "workflow";
		const summary = newRunSummary(runId, project.id, label);
		const controller = new AbortController();
		const listeners = /* @__PURE__ */ new Set();
		const events = [];
		let cursor = 0;
		const emit = (event) => {
			events.push(event);
			if (events.length > MAX_EVENTS) events.splice(0, events.length - MAX_EVENTS);
			applyToSummary(summary, event);
			for (const l of listeners) try {
				l(event, summary);
			} catch {}
		};
		let resolveDone;
		const record = {
			summary,
			events,
			done: new Promise((resolve) => {
				resolveDone = resolve;
			}),
			cancel: (reason) => {
				if (summary.status === "queued" || summary.status === "running") controller.abort(reason ?? "cancelled");
			},
			subscribe: (listener) => {
				listeners.add(listener);
				return () => listeners.delete(listener);
			},
			readOutput: () => {
				const slice = events.slice(cursor);
				cursor = events.length;
				return slice.map(formatEvent).filter(Boolean).join("\n");
			}
		};
		this.records.set(runId, record);
		this.trim();
		const launch = async () => {
			this.active += 1;
			summary.status = "running";
			summary.startedAt = nowIso();
			emit({
				type: "log",
				at: nowIso(),
				message: `run ${runId} started: ${label}`
			});
			try {
				if (controller.signal.aborted) throw new Error("cancelled before start");
				record.outcome = await executeRun(this.studio, project, request, runId, controller.signal, emit, summary);
				summary.status = "completed";
			} catch (error) {
				const message = error instanceof Error ? error.message : String(error);
				summary.status = controller.signal.aborted ? "cancelled" : "failed";
				summary.error = message;
				record.error = message;
				emit({
					type: "error",
					at: nowIso(),
					error: message
				});
			} finally {
				summary.finishedAt = nowIso();
				this.active -= 1;
				resolveDone(record);
				this.pump();
			}
		};
		this.queue.push(() => void launch());
		this.pump();
		return record;
	}
	pump() {
		while (this.active < Math.max(1, this.studio.config.maxConcurrentRuns) && this.queue.length > 0) this.queue.shift()();
	}
	/** Keep memory bounded: drop the oldest finished records beyond 200. */
	trim() {
		const finished = [...this.records.values()].filter((r) => r.summary.finishedAt);
		if (finished.length <= 200) return;
		finished.sort((a, b) => a.summary.finishedAt < b.summary.finishedAt ? -1 : 1);
		for (const r of finished.slice(0, finished.length - 200)) this.records.delete(r.summary.runId);
	}
};
function applyToSummary(summary, event) {
	switch (event.type) {
		case "node_started":
			if (event.nodeId) summary.nodes[event.nodeId] = {
				status: "running",
				...event.label ? { label: event.label } : {}
			};
			break;
		case "plugin_progress":
			if (event.nodeId && summary.nodes[event.nodeId]) Object.assign(summary.nodes[event.nodeId], {
				...event.message ? { message: event.message } : {},
				...event.percent !== void 0 ? { percent: event.percent } : {}
			});
			else for (const n of Object.values(summary.nodes)) if (n.status === "running") {
				if (event.message) n.message = event.message;
				if (event.percent !== void 0) n.percent = event.percent;
			}
			break;
		case "node_completed":
			if (event.nodeId) summary.nodes[event.nodeId] = {
				...summary.nodes[event.nodeId] ?? {},
				status: "completed"
			};
			break;
		case "node_failed": if (event.nodeId) summary.nodes[event.nodeId] = {
			...summary.nodes[event.nodeId] ?? {},
			status: "failed",
			...event.error ? { message: event.error } : {}
		};
	}
}
function formatEvent(e) {
	switch (e.type) {
		case "log": return e.message ? `· ${e.message}` : "";
		case "workflow_started": return `▶ workflow started (${e.totalNodes ?? "?"} nodes, ${e.levels ?? "?"} levels)`;
		case "node_started": return `▶ ${e.label ?? e.nodeId} [${e.feature ?? ""}] started`;
		case "plugin_progress": return `… ${e.label ?? e.nodeId ?? ""} ${e.message ?? ""}${e.percent !== void 0 ? ` ${Math.round(e.percent)}%` : ""}`.trim();
		case "node_completed": return `✓ ${e.label ?? e.nodeId} completed`;
		case "node_failed": return `✗ ${e.label ?? e.nodeId} failed: ${e.error ?? ""}`;
		case "workflow_completed": return "✓ workflow completed";
		case "workflow_failed": return `✗ workflow failed: ${e.error ?? ""}`;
		case "ingested": return e.files && e.files.length > 0 ? `★ outputs: ${e.files.map((f) => f.key).join(", ")}` : "";
		case "error": return `✗ ${e.error ?? "error"}`;
		default: return "";
	}
}
//#endregion
//#region ../tongflow-studio/src/session-projects.ts
/**
* Which studio project each host session (agent) is working in — set by every
* tongflow_* tool call, read by the Studio UI so its project selector follows
* the agent. In-memory; sessions re-establish it with their next tool call.
*/
const bySession = /* @__PURE__ */ new Map();
function setSessionProject(sessionId, projectId) {
	bySession.set(sessionId, projectId);
}
function getSessionProject(sessionId) {
	return bySession.get(sessionId);
}
//#endregion
//#region ../tongflow-studio/src/http/util.ts
var util_exports = /* @__PURE__ */ __exportAll({
	HttpError: () => HttpError,
	assertSameOrigin: () => assertSameOrigin,
	compileRoute: () => compileRoute,
	readBody: () => readBody,
	readFormData: () => readFormData,
	readJson: () => readJson,
	sendError: () => sendError,
	sendJson: () => sendJson
});
var HttpError = class extends Error {
	status;
	code;
	constructor(status, message, code) {
		super(message);
		this.status = status;
		this.code = code;
		this.name = "HttpError";
	}
};
function sendJson(res, status, body) {
	const payload = JSON.stringify(body ?? null);
	res.writeHead(status, {
		"content-type": "application/json; charset=utf-8",
		"cache-control": "no-store",
		"content-length": Buffer.byteLength(payload)
	});
	res.end(payload);
}
function sendError(res, error) {
	if (error instanceof HttpError) {
		sendJson(res, error.status, {
			error: error.message,
			...error.code ? { code: error.code } : {}
		});
		return;
	}
	const message = error instanceof Error ? error.message : String(error);
	sendJson(res, /not found|does not exist|no such/i.test(message) ? 404 : /invalid|required|unknown|escapes|not a/i.test(message) ? 400 : 500, { error: message });
}
async function readBody(req, limit = 67108864) {
	const chunks = [];
	let total = 0;
	for await (const chunk of req) {
		const buf = chunk;
		total += buf.length;
		if (total > limit) throw new HttpError(413, "request body too large");
		chunks.push(buf);
	}
	return Buffer.concat(chunks);
}
async function readJson(req) {
	const buf = await readBody(req);
	if (buf.length === 0) return {};
	try {
		return JSON.parse(buf.toString("utf8"));
	} catch {
		throw new HttpError(400, "invalid JSON body");
	}
}
/** Parse multipart/form-data via the WHATWG Request implementation. */
async function readFormData(req) {
	const headers = new Headers();
	for (const [k, v] of Object.entries(req.headers)) if (typeof v === "string") headers.set(k, v);
	else if (Array.isArray(v)) headers.set(k, v.join(", "));
	return new Request("http://localhost/", {
		method: "POST",
		headers,
		body: Readable.toWeb(req),
		duplex: "half"
	}).formData();
}
/** Reject cross-origin state-changing requests: browser calls must come from the host's own origin. */
function assertSameOrigin(req) {
	const origin = req.headers.origin;
	if (!origin) return;
	const host = req.headers.host;
	try {
		const o = new URL(origin);
		if (host && o.host === host) return;
	} catch {}
	throw new HttpError(403, "cross-origin request rejected");
}
function compileRoute(route) {
	const parts = route.pattern.split("/").filter(Boolean);
	const wildcard = parts[parts.length - 1] === "*";
	const fixed = wildcard ? parts.slice(0, -1) : parts;
	return {
		route,
		match(path) {
			const segs = path.split("/").filter(Boolean);
			if (wildcard ? segs.length < fixed.length : segs.length !== fixed.length) return void 0;
			const params = {};
			for (let i = 0; i < fixed.length; i++) {
				const p = fixed[i];
				if (p.startsWith(":")) params[p.slice(1)] = decodeURIComponent(segs[i]);
				else if (p !== segs[i]) return void 0;
			}
			return {
				params,
				rest: wildcard ? segs.slice(fixed.length).map(decodeURIComponent).join("/") : ""
			};
		}
	};
}
//#endregion
//#region ../tongflow-studio/src/http/files.ts
/** Static file serving with HTTP Range support (video scrubbing) for project files. */
const MIME = {
	png: "image/png",
	jpg: "image/jpeg",
	jpeg: "image/jpeg",
	webp: "image/webp",
	gif: "image/gif",
	svg: "image/svg+xml",
	mp4: "video/mp4",
	mov: "video/quicktime",
	webm: "video/webm",
	mp3: "audio/mpeg",
	wav: "audio/wav",
	m4a: "audio/mp4",
	ogg: "audio/ogg",
	flac: "audio/flac",
	json: "application/json; charset=utf-8",
	md: "text/markdown; charset=utf-8",
	txt: "text/plain; charset=utf-8",
	srt: "text/plain; charset=utf-8",
	glb: "model/gltf-binary",
	gltf: "model/gltf+json",
	ply: "application/octet-stream",
	splat: "application/octet-stream",
	pdf: "application/pdf"
};
function mimeFor(path) {
	return MIME[extname(path).slice(1).toLowerCase()] ?? "application/octet-stream";
}
async function serveFile(req, res, path) {
	let st;
	try {
		st = await stat(path);
	} catch {
		throw new HttpError(404, "file not found");
	}
	if (!st.isFile()) throw new HttpError(404, "not a file");
	const size = st.size;
	const headers = {
		"content-type": mimeFor(path),
		"accept-ranges": "bytes",
		"cache-control": "no-cache",
		"last-modified": st.mtime.toUTCString()
	};
	const range = req.headers.range;
	if (range) {
		const m = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
		if (!m) {
			res.writeHead(416, { "content-range": `bytes */${size}` });
			res.end();
			return;
		}
		let start = m[1] ? Number(m[1]) : void 0;
		let end = m[2] ? Number(m[2]) : void 0;
		if (start === void 0 && end !== void 0) {
			start = Math.max(0, size - end);
			end = size - 1;
		} else {
			start = start ?? 0;
			end = end === void 0 || end >= size ? size - 1 : end;
		}
		if (start > end || start >= size) {
			res.writeHead(416, { "content-range": `bytes */${size}` });
			res.end();
			return;
		}
		res.writeHead(206, {
			...headers,
			"content-range": `bytes ${start}-${end}/${size}`,
			"content-length": end - start + 1
		});
		if (req.method === "HEAD") {
			res.end();
			return;
		}
		createReadStream(path, {
			start,
			end
		}).pipe(res);
		return;
	}
	res.writeHead(200, {
		...headers,
		"content-length": size
	});
	if (req.method === "HEAD") {
		res.end();
		return;
	}
	createReadStream(path).pipe(res);
}
//#endregion
//#region ../tongflow-studio/src/http/sse.ts
function openSse(req, res) {
	res.writeHead(200, {
		"content-type": "text/event-stream; charset=utf-8",
		"cache-control": "no-cache, no-transform",
		connection: "keep-alive",
		"x-accel-buffering": "no"
	});
	res.write(": ok\n\n");
	let closed = false;
	const heartbeat = setInterval(() => {
		if (!closed) res.write(": ping\n\n");
	}, 15e3);
	heartbeat.unref();
	const finish = () => {
		if (closed) return;
		closed = true;
		clearInterval(heartbeat);
		try {
			res.end();
		} catch {}
	};
	req.on("close", finish);
	return {
		send(data, event) {
			if (closed) return;
			if (event) res.write(`event: ${event}\n`);
			res.write(`data: ${JSON.stringify(data)}\n\n`);
		},
		close: finish,
		get closed() {
			return closed;
		}
	};
}
//#endregion
//#region ../tongflow-studio/src/http/routes.ts
/**
* The studio's HTTP routes as one `node:http` handler, mounted by the host
* under `<prefix>` (default `/tongflow`):
*
*   Studio API (JSON)              /tongflow/projects, /tongflow/p/:pid/…, /tongflow/runs/…, /tongflow/plugins…
*   Files (Range)                  /tongflow/p/:pid/files/<key>
*   Canvas-compat API              /tongflow/p/:pid/api/…  — what `tongflow/canvas` calls when its
*                                  apiBaseUrl is `/tongflow/p/:pid` (task create/wait/stop, plugins registry,
*                                  upload, uploads, material stubs).
*/
/** Where files dropped onto the canvas land inside a project. */
const UPLOADS_DIR = "uploads";
/** The prefix as routes match it: no trailing slash, `/tongflow` when empty. */
function routePrefix(prefix) {
	return prefix.replace(/\/+$/, "") || "/tongflow";
}
function createRouteHandler(env) {
	const prefix = routePrefix(env.prefix);
	const routes = buildRoutes(env).map(compileRoute);
	return async (req, res) => {
		const url = new URL(req.url ?? "/", "http://localhost");
		const path = url.pathname.slice(prefix.length) || "/";
		const method = req.method ?? "GET";
		try {
			for (const { route, match } of routes) {
				if (route.method !== method && !(route.method === "GET" && method === "HEAD")) continue;
				const m = match(path);
				if (!m) continue;
				if (method !== "GET" && method !== "HEAD") assertSameOrigin(req);
				await route.handler({
					req,
					res,
					url,
					params: m.params,
					rest: m.rest
				});
				return;
			}
			sendJson(res, 404, { error: `no route for ${method} ${path}` });
		} catch (error) {
			if (!res.headersSent) sendError(res, error);
			else res.end();
		}
	};
}
function q(url, name) {
	const v = url.searchParams.get(name);
	return v === null ? void 0 : v;
}
function requireQ(url, name) {
	const v = q(url, name);
	if (!v) throw new HttpError(400, `missing query parameter "${name}"`);
	return v;
}
function buildRoutes(env) {
	const { api, studio } = env;
	const json = (c, body, status = 200) => sendJson(c.res, status, body);
	return [
		{
			method: "GET",
			pattern: "/health",
			handler: async (c) => {
				let python;
				let error;
				try {
					python = await studio.python();
				} catch (e) {
					error = e instanceof Error ? e.message : String(e);
				}
				json(c, {
					ok: !error,
					studioRoot: studio.paths.root,
					python,
					sdkSpec: studio.config.sdkSpec,
					locale: studio.config.locale,
					...error ? { error } : {}
				});
			}
		},
		{
			method: "GET",
			pattern: "/env",
			handler: async (c) => {
				const stored = await studio.readEnvFile();
				const { meta } = await api.registry();
				const wanted = /* @__PURE__ */ new Map();
				for (const [pid, m] of Object.entries(meta)) for (const e of m.env) {
					const w = wanted.get(e.key) ?? {
						plugins: [],
						required: false
					};
					w.plugins.push(pid);
					w.required = w.required || Boolean(e.required);
					if (e.description) w.description = e.description;
					if (e.url) w.url = e.url;
					wanted.set(e.key, w);
				}
				const keys = [...wanted.entries()].map(([key, w]) => ({
					key,
					...w,
					set: Boolean(stored[key] || studio.config.env[key] || process.env[key]),
					source: stored[key] ? "studio" : studio.config.env[key] ? "config" : process.env[key] ? "process" : void 0
				}));
				for (const key of Object.keys(stored)) if (!wanted.has(key)) keys.push({
					key,
					plugins: [],
					required: false,
					set: true,
					source: "studio"
				});
				json(c, { keys });
			}
		},
		{
			method: "PUT",
			pattern: "/env",
			handler: async (c) => {
				const body = await readJson(c.req);
				const saved = await studio.updateEnvFile(body);
				json(c, { keys: Object.keys(saved) });
			}
		},
		(
		/** The project the given host session's agent is working in (set by its tool calls). */
		{
			method: "GET",
			pattern: "/session/:sid/project",
			handler: async (c) => json(c, { project: getSessionProject(c.params.sid) ?? null })
		}),
		{
			method: "GET",
			pattern: "/projects",
			handler: async (c) => json(c, await api.listProjects())
		},
		{
			method: "POST",
			pattern: "/projects",
			handler: async (c) => {
				const body = await readJson(c.req);
				if (!body.title) throw new HttpError(400, "title is required");
				json(c, await api.createProject({
					title: body.title,
					...body.brief ? { brief: body.brief } : {},
					...body.id ? { id: body.id } : {},
					...body.locale ? { locale: body.locale } : {}
				}), 201);
			}
		},
		{
			method: "GET",
			pattern: "/p/:pid",
			handler: async (c) => json(c, await api.projectSummary(c.params.pid))
		},
		{
			method: "GET",
			pattern: "/p/:pid/status",
			handler: async (c) => json(c, await api.status(c.params.pid))
		},
		{
			method: "GET",
			pattern: "/p/:pid/tree",
			handler: async (c) => json(c, await api.tree(c.params.pid))
		},
		{
			method: "GET",
			pattern: "/p/:pid/workflows",
			handler: async (c) => json(c, await api.listWorkflows(c.params.pid))
		},
		{
			method: "GET",
			pattern: "/p/:pid/workflow",
			handler: async (c) => json(c, await api.readWorkflowForCanvas(c.params.pid, requireQ(c.url, "key")))
		},
		{
			method: "PUT",
			pattern: "/p/:pid/workflow",
			handler: async (c) => {
				const key = requireQ(c.url, "key");
				const doc = await readJson(c.req);
				json(c, await api.saveWorkflowDocument(c.params.pid, key, doc));
			}
		},
		{
			method: "DELETE",
			pattern: "/p/:pid/workflow",
			handler: async (c) => {
				await api.deleteWorkflow(c.params.pid, requireQ(c.url, "key"));
				json(c, { ok: true });
			}
		},
		{
			method: "POST",
			pattern: "/p/:pid/workflows",
			handler: async (c) => {
				const body = await readJson(c.req);
				if (!body.path) throw new HttpError(400, "path is required");
				json(c, await api.newWorkflow(c.params.pid, body.path, body), 201);
			}
		},
		{
			method: "POST",
			pattern: "/p/:pid/workflow/patch",
			handler: async (c) => {
				const key = requireQ(c.url, "key");
				const patch = await readJson(c.req);
				json(c, await api.graphTool(c.params.pid, key, "apply_graph_patch", patch));
			}
		},
		{
			method: "POST",
			pattern: "/p/:pid/compose",
			handler: async (c) => {
				const body = await readJson(c.req);
				json(c, await api.composeWorkflows(c.params.pid, body), 201);
			}
		},
		{
			method: "GET",
			pattern: "/p/:pid/workflow/describe",
			handler: async (c) => json(c, await api.describeWorkflow(c.params.pid, requireQ(c.url, "key")))
		},
		{
			method: "GET",
			pattern: "/p/:pid/workflow/summary",
			handler: async (c) => json(c, await api.workflowSummary(c.params.pid, requireQ(c.url, "key")))
		},
		{
			method: "GET",
			pattern: "/p/:pid/workflow/confirmations",
			handler: async (c) => json(c, await api.paidPlugins(c.params.pid, requireQ(c.url, "key")))
		},
		{
			method: "GET",
			pattern: "/p/:pid/workflow/outputs",
			handler: async (c) => json(c, await api.workflowOutputs(c.params.pid, requireQ(c.url, "key")))
		},
		{
			method: "GET",
			pattern: "/p/:pid/runs",
			handler: async (c) => json(c, api.listRuns(c.params.pid))
		},
		{
			method: "POST",
			pattern: "/p/:pid/runs",
			handler: async (c) => {
				const body = await readJson(c.req);
				if (!body.workflowKey) throw new HttpError(400, "workflowKey is required");
				const record = await api.startRun({
					projectId: c.params.pid,
					...body
				});
				json(c, record.summary, 202);
			}
		},
		{
			method: "GET",
			pattern: "/runs/:runId",
			handler: async (c) => {
				const r = api.getRun(c.params.runId);
				if (!r) throw new HttpError(404, "unknown run");
				json(c, r.summary);
			}
		},
		{
			method: "GET",
			pattern: "/runs/:runId/events",
			handler: async (c) => {
				const r = api.getRun(c.params.runId);
				if (!r) throw new HttpError(404, "unknown run");
				streamRun(c, r, (event, summary) => ({
					event,
					summary
				}));
			}
		},
		{
			method: "POST",
			pattern: "/runs/:runId/cancel",
			handler: async (c) => {
				const r = api.getRun(c.params.runId);
				if (!r) throw new HttpError(404, "unknown run");
				r.cancel("cancelled from studio");
				json(c, { ok: true });
			}
		},
		{
			method: "GET",
			pattern: "/plugins",
			handler: async (c) => {
				const { registry, meta, scannedAt } = await api.registry();
				const OFFICIAL_PLUGINS = await studio.registry.officialIds();
				json(c, {
					registry,
					meta,
					scannedAt,
					official: OFFICIAL_PLUGINS
				});
			}
		},
		{
			method: "POST",
			pattern: "/plugins/install",
			handler: async (c) => {
				const body = await readJson(c.req);
				if (!body.idOrUrl) throw new HttpError(400, "idOrUrl is required");
				json(c, await api.installPlugin(body.idOrUrl));
			}
		},
		{
			method: "DELETE",
			pattern: "/plugins/:id",
			handler: async (c) => {
				await api.uninstallPlugin(c.params.id);
				json(c, { ok: true });
			}
		},
		{
			method: "POST",
			pattern: "/plugins/update",
			handler: async (c) => json(c, { changed: await api.updatePlugins() })
		},
		{
			method: "GET",
			pattern: "/catalog",
			handler: async (c) => json(c, { catalog: await api.nodeCatalog() })
		},
		(
		/** Studio upload: multipart `file` field(s) into `?dir=<project key>` (default `uploads/`). */
		{
			method: "POST",
			pattern: "/p/:pid/upload",
			handler: async (c) => {
				const form = await readFormData(c.req);
				const dir = q(c.url, "dir") || UPLOADS_DIR;
				const files = form.getAll("file").filter((f) => f instanceof File);
				if (files.length === 0) throw new HttpError(400, "multipart field 'file' is required");
				const out = [];
				for (const file of files) {
					const r = await api.uploadFile(c.params.pid, dir, file.name, new Uint8Array(await file.arrayBuffer()));
					out.push({
						...r,
						name: file.name
					});
				}
				json(c, { files: out }, 201);
			}
		}),
		{
			method: "GET",
			pattern: "/p/:pid/files/*",
			handler: async (c) => serveFile(c.req, c.res, await api.filePath(c.params.pid, c.rest))
		},
		{
			method: "PUT",
			pattern: "/p/:pid/files/*",
			handler: async (c) => {
				const buf = await (await Promise.resolve().then(() => util_exports)).readBody(c.req);
				await writeFileAtomic(await api.filePath(c.params.pid, c.rest), buf);
				json(c, {
					ok: true,
					key: c.rest
				});
			}
		},
		{
			method: "DELETE",
			pattern: "/p/:pid/files/*",
			handler: async (c) => {
				await unlink(await api.filePath(c.params.pid, c.rest));
				json(c, { ok: true });
			}
		},
		{
			method: "GET",
			pattern: "/p/:pid/api/plugins/registry",
			handler: async (c) => json(c, (await api.registry()).registry)
		},
		{
			method: "POST",
			pattern: "/p/:pid/api/task/create",
			handler: async (c) => {
				const body = await readJson(c.req);
				if (!body.feature || !body.pluginId) throw new HttpError(400, "feature and pluginId are required");
				const record = await api.startCanvasRun(c.params.pid, body);
				json(c, { taskId: record.summary.runId });
			}
		},
		{
			method: "GET",
			pattern: "/p/:pid/api/task/wait",
			handler: async (c) => {
				const taskId = requireQ(c.url, "taskId");
				const r = api.getRun(taskId);
				if (!r) throw new HttpError(404, "unknown task");
				const nodeId = r.summary.workflow.startsWith("canvas ") ? canvasNodeId(r) : null;
				streamRun(c, r, (event, summary) => canvasFrame(taskId, nodeId, event, summary, r));
			}
		},
		{
			method: "POST",
			pattern: "/p/:pid/api/task/stop",
			handler: async (c) => {
				const body = await readJson(c.req);
				const r = body.taskId ? api.getRun(body.taskId) : void 0;
				if (!r) throw new HttpError(404, "unknown task");
				const wasRunning = r.summary.status === "running" || r.summary.status === "queued";
				r.cancel("stopped from canvas");
				json(c, {
					status: "cancelled",
					wasRunning
				});
			}
		},
		{
			method: "POST",
			pattern: "/p/:pid/api/task/update-status",
			handler: async (c) => json(c, {
				success: true,
				skipped: true
			})
		},
		{
			method: "GET",
			pattern: "/p/:pid/api/task/list",
			handler: async (c) => json(c, { tasks: [] })
		},
		{
			method: "POST",
			pattern: "/p/:pid/api/upload",
			handler: async (c) => {
				const file = (await readFormData(c.req)).get("file");
				if (!(file instanceof File)) throw new HttpError(400, "multipart field 'file' is required");
				const { key, size } = await api.uploadFile(c.params.pid, UPLOADS_DIR, file.name, new Uint8Array(await file.arrayBuffer()));
				json(c, {
					fileKey: key,
					url: `${env.prefix}/p/${c.params.pid}/files/${key}`,
					size,
					name: file.name
				});
			}
		},
		{
			method: "GET",
			pattern: "/p/:pid/api/uploads/*",
			handler: async (c) => serveFile(c.req, c.res, await api.filePath(c.params.pid, c.rest))
		},
		{
			method: "GET",
			pattern: "/p/:pid/api/material",
			handler: async (c) => json(c, {
				materials: [],
				total: 0
			})
		},
		{
			method: "POST",
			pattern: "/p/:pid/api/material",
			handler: async (c) => json(c, { id: 0 })
		},
		{
			method: "POST",
			pattern: "/p/:pid/api/material/save-from-task",
			handler: async (c) => json(c, { saved: false })
		},
		{
			method: "GET",
			pattern: "/p/:pid/api/feature/list",
			handler: async (c) => json(c, { features: [] })
		}
	];
}
function streamRun(c, r, map) {
	const sse = openSse(c.req, c.res);
	const send = (event, summary) => {
		const frame = map(event, summary);
		if (frame !== void 0) sse.send(frame);
	};
	for (const e of r.events) send(e, r.summary);
	if (r.summary.finishedAt) {
		sse.close();
		return;
	}
	const off = r.subscribe(send);
	r.done.then(() => {
		off();
		setTimeout(() => sse.close(), 50);
	});
	c.req.on("close", off);
}
function canvasNodeId(r) {
	r.outcome?.result;
	return Object.keys(r.summary.nodes)[0] ?? null;
}
/** Translate a run event into the SSE envelope `tongflow/canvas` expects. */
function canvasFrame(taskId, nodeIdHint, event, summary, r) {
	const nodeId = event.nodeId ?? nodeIdHint ?? Object.keys(summary.nodes)[0] ?? null;
	switch (event.type) {
		case "log": return {
			id: taskId,
			status: TaskStatus.RUNNING,
			nodeId,
			data: { message: event.message }
		};
		case "workflow_started":
		case "node_started": return {
			id: taskId,
			status: TaskStatus.RUNNING,
			nodeId,
			data: { message: event.label ?? "started" }
		};
		case "plugin_progress": return {
			id: taskId,
			status: TaskStatus.RUNNING,
			nodeId,
			data: {
				message: event.message,
				...event.percent !== void 0 ? { progress: event.percent } : {}
			}
		};
		case "node_failed": return {
			id: taskId,
			status: TaskStatus.FAILED,
			nodeId,
			data: { error: event.error }
		};
		case "workflow_failed":
		case "error": return {
			id: taskId,
			status: summary.status === "cancelled" ? TaskStatus.CANCELLED : TaskStatus.FAILED,
			nodeId,
			data: { error: event.error ?? summary.error }
		};
		case "ingested": {
			const outputs = event.outputs ?? r.outcome?.result.outputs ?? {};
			const raw = nodeId && outputs[nodeId] || Object.values(outputs)[0] || {};
			return {
				id: taskId,
				status: TaskStatus.COMPLETED,
				nodeId,
				data: raw
			};
		}
		default: return;
	}
}
//#endregion
//#region ../tongflow-studio/src/instructions.ts
/**
* The studio's working rules, as the agent reads them: every host puts this
* text where its agent finds standing instructions (dsh's system prompt, the
* MCP server's `instructions`) and adds what its own user interface shows.
*/
const STUDIO_RULES = `## TongFlow studio
A media studio is available through the tongflow_* tools. Rules: (1) all image / audio / video / 3D generation happens by creating and running a saved workflow file — one file per generated asset, placed in the folder where that asset belongs: tongflow_workflow_new → _patch → _run — there is no direct generate tool; its outputs land next to it as <name>.01.png, <name>.02.png … with <name>.runs.json (a run never overwrites); (2) the project folder is the source of truth and has NO fixed layout: read the brief, research the format if needed, propose a folder structure to the user, create it with the file tools and document it in a README/plan file; the user may reorganize by hand at any time, so call tongflow_project_status before assuming; (3) paid runs (API keys or Modal GPU) need the user's yes EVERY time: tongflow_workflow_run without user_confirmed stops with needs_confirmation — explain what will run, how it is billed and the choices, wait for the user's answer, then call again with user_confirmed=true; never set it on your own; (4) workflows follow TongFlow's own grammar and ABI — modality data nodes wired into transfer / compose / decompose / batch executables, exactly the handles, config fields and outputs tongflow_node_catalog lists (read it first; tongflow_node_describe for details); the patch tool rejects anything else; (5) review generated media with tongflow_look / tongflow_perceive before building on it.`;
const STUDIO_LANGUAGE = "Language: always answer in the language the user writes in (中文 → 中文, 日本語 → 日本語, …), and write project text files in that language unless asked otherwise. Folder / file names stay short lowercase ASCII; prompts sent to image/video models are English unless the plugin needs otherwise.";
//#endregion
//#region ../tongflow-studio/src/tools/spec.ts
/** Define a tool with its arguments inferred from the parameter spec. */
function tool(spec) {
	return spec;
}
//#endregion
//#region ../tongflow-studio/src/tools/support.ts
/**
* Which project a call refers to: explicit `project` argument, else the
* session's cwd when it lives under the studio projects dir, else the only
* project, else an error listing the choices.
*/
async function resolveProjectId(env, call, explicit) {
	const { sessionId } = call;
	const remember = (id) => {
		if (sessionId) setSessionProject(sessionId, id);
		return id;
	};
	if (explicit?.trim()) {
		const id = explicit.trim();
		if (!isProjectId(id)) throw new Error(`invalid project id "${id}"`);
		await env.api.project(id);
		return remember(id);
	}
	const memo = sessionId ? getSessionProject(sessionId) : void 0;
	if (memo) try {
		await env.api.project(memo);
		return memo;
	} catch {}
	const { cwd } = call;
	if (cwd && isInsideProject(env.studio.paths.projects, cwd)) {
		const id = cwd.slice(env.studio.paths.projects.length).replace(/^[/\\]/, "").split(/[/\\]/)[0];
		if (id && isProjectId(id)) try {
			await env.api.project(id);
			return remember(id);
		} catch {}
	}
	const projects = await env.api.listProjects();
	if (projects.length === 1) return remember(projects[0].id);
	if (projects.length === 0) throw new Error("no studio project yet — create one with tongflow_project_create({ title, brief })");
	throw new Error(`several projects exist; pass project: one of ${projects.map((p) => p.id).join(", ")} (or open one with tongflow_project_open)`);
}
/** Mark a project as the session's working project (project_create / project_open). */
function rememberSessionProject(call, projectId) {
	if (call.sessionId) setSessionProject(call.sessionId, projectId);
}
/** Trim big JSON so a tool result stays readable for the model, and brand it as plain JSON. */
function compact(value) {
	return JSON.parse(JSON.stringify(value, (_k, v) => {
		if (typeof v === "string" && v.length > 4e3) return `${v.slice(0, 4e3)}… (${v.length} chars)`;
		return v;
	}) ?? "null");
}
const PROJECT_PARAM = {
	type: "string",
	description: "Project id. Optional when the session is opened inside a project folder or only one project exists."
};
function errorMessage(error) {
	return error instanceof Error ? error.message : String(error);
}
//#endregion
//#region ../tongflow-studio/src/tools/project-tools.ts
/** Project tools: create / open / list / status. Structure inside a project is made with the ordinary file tools. */
function projectTools(env) {
	const { api } = env;
	return [
		tool({
			name: "tongflow_project_create",
			description: "Create a new, empty studio project (a folder with project.json). Returns its id and root path. There is no template: design the folder structure for what the user wants to make, and write it with the file tools. Ask the user to open the project (or call tongflow_project_open) so the session's working directory is the project folder.",
			parameters: {
				title: {
					type: "string",
					required: true,
					description: "Human title of the project."
				},
				brief: {
					type: "string",
					description: "What the user wants to make, in their words (stored in project.json for later sessions)."
				},
				id: {
					type: "string",
					description: "Preferred kebab-case project id (derived from the title when omitted)."
				},
				locale: {
					type: "string",
					description: "Language of the project's text files (en, zh, ja…). Defaults to the studio locale."
				}
			},
			async execute(args, call) {
				const summary = await api.createProject({
					title: args.title,
					...args.brief ? { brief: args.brief } : {},
					...args.id ? { id: args.id } : {},
					...args.locale ? { locale: args.locale } : {}
				});
				rememberSessionProject(call, summary.id);
				return compact({
					ok: true,
					project: summary.id,
					root: summary.root,
					hint: "Work under `root` with the file tools (in the Studio, open the project so the panel follows it). Then design the folder structure with the user."
				});
			}
		}),
		tool({
			name: "tongflow_project_open",
			description: "Make a project the working project of this session (the Studio panel follows it) and return its status. Use when the user names a project or several exist.",
			parameters: { project: {
				type: "string",
				required: true,
				description: "Project id (see tongflow_project_list)."
			} },
			async execute(args, call) {
				const id = await resolveProjectId(env, call, args.project);
				rememberSessionProject(call, id);
				return compact(await api.status(id));
			}
		}),
		tool({
			name: "tongflow_project_list",
			description: "List studio projects.",
			parameters: {},
			async execute() {
				return compact({ projects: (await api.listProjects()).map((p) => ({
					id: p.id,
					title: p.title,
					...p.brief ? { brief: p.brief } : {},
					root: p.root,
					workflows: p.workflowCount,
					files: p.fileCount,
					updatedAt: p.updatedAt
				})) });
			}
		}),
		tool({
			name: "tongflow_project_status",
			description: "What exists in a project: the folder tree (workflows shown with the files they generated), every workflow with its inputs and output count, recent runs, and the brief. Call this first — the user may have moved or edited things by hand.",
			parameters: { project: PROJECT_PARAM },
			async execute(args, call) {
				const id = await resolveProjectId(env, call, args.project);
				return compact(await api.status(id));
			}
		})
	];
}
//#endregion
//#region ../tongflow-studio/src/tools/run-tools.ts
/**
* Execution & perception tools: run a workflow (foreground or in the
* background), look at a generated image (handed to the host as an image when
* the session's model takes images, otherwise described through TongFlow's own
* image-describe slot), perceive video/audio through TongFlow's own
* describe / transcribe slots, and manage plugins.
*/
const execFile$2 = promisify(execFile);
/**
* The clone URL as something a person or `web_fetch` can open: git remotes
* carry a `.git` suffix and sometimes an `scp`-style host, neither of which
* belongs in a link. A non-GitHub or already-clean URL passes through.
*/
function browsableRepo(gitUrl) {
	return gitUrl.replace(/^git@([^:]+):/, "https://$1/").replace(/\.git$/, "");
}
/**
* A plugin's own README, when the clone shipped one. Only the path travels in
* the catalog: the agent reads the file when it needs to choose between
* plugins, set an unfamiliar model, or understand a failure. An installed
* plugin is not a new trust surface — its code already runs on this machine.
*/
async function pluginReadme(pluginsDir, id) {
	const path = join(pluginsDir, id, "README.md");
	try {
		if ((await stat(path)).isFile()) return { readme: path };
	} catch {}
	return {};
}
/**
* What `tongflow_look` says when this session's model cannot see the asset.
* A free plugin has already described it; a billing one has not run, and the
* agent is told to ask the user and go through `tongflow_perceive`, the one
* tool that carries the confirmation flag.
*/
function blindSummary(head, kind, described) {
	const blind = `${head}. This session's model does not take images`;
	if (described.ok) return `${blind}, so it was described by ${described.pluginId} instead of shown:\n${described.answer}`;
	if (described.needs_confirmation) return `${blind}, and describing it would run ${described.pluginId}, which bills you (${described.billing}: ${described.note}). Tell the user what it costs, ask, and then call tongflow_perceive with user_confirmed=true — or switch this session to a vision-capable model.`;
	return `${blind} and it could not be described (${described.error}). Switch to a vision-capable model, or install a plugin for the ${kind}-describe slot.`;
}
/**
* Understand a media file through TongFlow's own describe / transcribe slots.
* Shared by `tongflow_perceive` and by `tongflow_look`'s fallback for a model
* that does not take images.
*/
async function describeViaSlot(env, pid, feature, prompt, pluginId, confirmed) {
	const { registry } = await env.api.registry();
	const chosen = pluginId ?? registry.nodePluginMap[feature]?.[0];
	if (!chosen) return {
		ok: false,
		feature,
		error: `no installed plugin implements ${feature}; install one (e.g. tongflow-api-gemini or tongflow-modal-qwen38) with tongflow_plugins_install`
	};
	if (!confirmed) {
		const { billing, note } = await env.api.pluginBilling(chosen);
		if (billing !== "local") return {
			ok: false,
			feature,
			pluginId: chosen,
			needs_confirmation: true,
			billing,
			note
		};
	}
	const record = await env.api.startCanvasRun(pid, {
		feature,
		pluginId: chosen,
		prompt,
		nodeId: "perceive"
	});
	await record.done;
	if (record.summary.status !== "completed") return {
		ok: false,
		feature,
		pluginId: chosen,
		error: record.error ?? "perception run failed",
		log: record.events.slice(-10).map(formatEvent)
	};
	const texts = record.outcome?.texts ?? {};
	return {
		ok: true,
		feature,
		pluginId: chosen,
		answer: Object.values(texts).flat().join("\n").trim() || "(empty answer)",
		raw: record.outcome?.result.outputs
	};
}
const WORKFLOW_PARAM$1 = {
	type: "string",
	required: true,
	description: "Workflow file, project-relative, e.g. 'characters/mei/mei_ref' or 'characters/mei/mei_ref.tongflow.json'."
};
const IMAGE_MIME = {
	png: "image/png",
	jpg: "image/jpeg",
	jpeg: "image/jpeg",
	webp: "image/webp",
	gif: "image/gif"
};
/** A finished (or failed) run as the agent reads it. */
function runResult(record) {
	const s = record.summary;
	return compact({
		runId: s.runId,
		status: s.status,
		...s.error ? { error: s.error } : {},
		no: record.outcome?.no ?? 0,
		files: s.files.map((f) => f.key),
		texts: record.outcome?.texts ?? {},
		loose: record.outcome?.loose ?? [],
		nodes: s.nodes,
		log: record.events.slice(-30).map(formatEvent).filter(Boolean)
	});
}
function runTools(env) {
	const { api, studio } = env;
	return [
		tool({
			name: "tongflow_workflow_run",
			description: "Execute a workflow file with the TongFlow engine. Its outputs land next to the file as <name>.NN.<ext> (NN = this run's number; a run never overwrites earlier outputs) and the run is logged in <name>.runs.json. Media generation takes seconds to minutes; use run_in_background for long jobs (video, batches) and continue working — check on it with tongflow_run_status. After a run, inspect the result with tongflow_look (images) or tongflow_perceive (video/audio) before moving on; if it is off, fix the workflow and run again. BILLING CHECKPOINT: a run that uses a paid plugin (API key billing or Modal GPU time) needs the user's yes EVERY time. Without user_confirmed=true this tool does not run — it returns needs_confirmation with the plugins, how each is billed, whether keys are set, available models and alternatives. Tell the user in plain words what will run and what it costs, ask, and only after they agree in this conversation call again with user_confirmed=true. Never set it on your own; nothing is remembered between runs.",
			parameters: {
				project: PROJECT_PARAM,
				workflow: WORKFLOW_PARAM$1,
				inputs: {
					type: "object",
					additionalProperties: true,
					description: "input name → text | file path (relative to the workflow file or the project root) | URL | array of those. Only for workflows that left inputs open."
				},
				note: {
					type: "string",
					description: "Why this run / what changed (recorded in provenance)."
				},
				run_in_background: {
					type: "boolean",
					description: "Return immediately with the run id; poll with tongflow_run_status (a host with a job runtime also returns a job id and notifies you when it completes)."
				},
				user_confirmed: {
					type: "boolean",
					description: "Set to true ONLY after the user explicitly agreed, in this conversation, to this run and its billing (the plugins / models listed in the needs_confirmation answer). Required whenever the workflow uses a paid plugin."
				}
			},
			async execute(args, call) {
				const pid = await resolveProjectId(env, call, args.project);
				if (!args.user_confirmed) {
					const paid = await api.paidPlugins(pid, args.workflow);
					if (paid.length > 0) return compact({
						ok: false,
						needs_confirmation: true,
						plugins: paid,
						hint: "This run costs money. Tell the user which plugin(s) / model(s) will run and how they are billed (mention alternatives when there are any, and missing API keys), ask whether to go ahead, and only after they say yes call again with user_confirmed=true. Ask every time; do not assume a previous yes still holds."
					});
				}
				const record = await api.startRun({
					projectId: pid,
					workflowKey: args.workflow,
					...args.inputs ? { inputs: args.inputs } : {},
					...args.note ? { note: args.note } : {}
				});
				if (args.run_in_background) {
					const runId = record.summary.runId;
					if (call.startBackground) return compact({
						kind: "background",
						jobId: call.startBackground(args.workflow, record),
						runId,
						hint: "poll with job_output or wait for the completion notice; then tongflow_look the new file"
					});
					return compact({
						kind: "background",
						runId,
						hint: `poll with tongflow_run_status({ runId: "${runId}" }) until it is no longer running; then tongflow_look the new file`
					});
				}
				const stop = call.progress ? record.subscribe((event) => {
					const line = formatEvent(event);
					if (line) call.progress?.(line);
				}) : () => {};
				return runResult(await Promise.race([record.done, new Promise((_, reject) => call.signal.addEventListener("abort", () => reject(/* @__PURE__ */ new Error("cancelled")), { once: true }))]).catch((error) => {
					record.cancel(errorMessage(error));
					throw error;
				}).finally(stop));
			}
		}),
		tool({
			name: "tongflow_run_status",
			description: "Status, node progress and log of a run (or the recent runs of a project).",
			parameters: {
				project: PROJECT_PARAM,
				runId: {
					type: "string",
					description: "Run id from tongflow_workflow_run; omit to list recent runs."
				}
			},
			async execute(args, call) {
				if (args.runId) {
					const r = api.getRun(args.runId);
					if (!r) return {
						ok: false,
						error: `unknown run ${args.runId}`
					};
					return runResult(r);
				}
				const pid = await resolveProjectId(env, call, args.project);
				return compact(api.listRuns(pid).slice(0, 20));
			}
		}),
		tool({
			name: "tongflow_look",
			description: "Look at an asset. Images come back as an image you can see, videos as a contact sheet of sampled frames plus duration/resolution. When this session's model does not take images, both are routed through TongFlow's describe slots instead and come back as text, saying so — so a look is never silently blind. Audio returns metadata only — use tongflow_perceive for content. Takes a project-relative path (e.g. 'characters/mei/mei_ref.02.png').",
			parameters: {
				project: PROJECT_PARAM,
				ref: {
					type: "string",
					required: true,
					description: "Project-relative path of the file."
				},
				frames: {
					type: "integer",
					description: "Frames in the video contact sheet (default 9, max 16)."
				}
			},
			async execute(args, call) {
				const pid = await resolveProjectId(env, call, args.project);
				const path = await resolveToFile(env, pid, args.ref);
				const ext = extname(path).slice(1).toLowerCase();
				const modality = modalityOfExt(ext);
				const st = await stat(path);
				if (modality === "image") {
					const mime = IMAGE_MIME[ext];
					if (!mime) return compact({ summary: `${args.ref}: ${ext} image (${st.size} bytes) — unsupported for inline viewing (png/jpg/webp/gif only)` });
					if (!call.showImage) return compact({ summary: `${args.ref}: image ${st.size} bytes at ${path} (this host cannot show images inline)` });
					if (!await takesImages(call)) {
						const described = await describeViaSlot(env, pid, "image-describe", {
							image: path,
							text: "Describe this image in detail."
						});
						return compact({
							...described,
							summary: blindSummary(`${args.ref}: ${st.size} bytes`, "image", described),
							path
						});
					}
					const shown = await call.showImage({
						data: new Uint8Array(await readFile(path)),
						mediaType: mime,
						name: path.split("/").pop()
					});
					const size = shown.width && shown.height ? `, ${shown.width}×${shown.height}` : "";
					return compact({
						summary: `${args.ref} → ${st.size} bytes${size}`,
						attachment: shown.attachment,
						path
					});
				}
				if (modality === "video") {
					const probe = await ffprobe(path).catch((e) => ({ error: errorMessage(e) }));
					if (!call.showImage) return compact({
						summary: `${args.ref}: video ${st.size} bytes`,
						probe
					});
					if (!await takesImages(call)) {
						const described = await describeViaSlot(env, pid, "video-describe", {
							video: path,
							text: "Describe this video in detail: subjects, action, camera, continuity issues."
						});
						return compact({
							...described,
							summary: blindSummary(`${args.ref}: video ${st.size} bytes; ${JSON.stringify(probe)}`, "video", described),
							probe
						});
					}
					try {
						const sheet = await contactSheet(path, Math.min(Math.max(args.frames ?? 9, 1), 16), studio.paths.tmp);
						const shown = await call.showImage({
							data: new Uint8Array(await readFile(sheet)),
							mediaType: "image/jpeg",
							name: "contact-sheet.jpg"
						});
						return compact({
							summary: `${args.ref}: video ${st.size} bytes; ${JSON.stringify(probe)}. Contact sheet of ${args.frames ?? 9} frames follows (left→right, top→bottom).`,
							probe,
							attachment: shown.attachment
						});
					} catch (error) {
						return compact({
							summary: `${args.ref}: video ${st.size} bytes; ${JSON.stringify(probe)}. (contact sheet unavailable: ${errorMessage(error)}; use tongflow_perceive)`,
							probe
						});
					}
				}
				if (modality === "audio") {
					const probe = await ffprobe(path).catch((e) => ({ error: errorMessage(e) }));
					return compact({
						summary: `${args.ref}: audio ${st.size} bytes; ${JSON.stringify(probe)}. Use tongflow_perceive to transcribe / describe.`,
						probe
					});
				}
				if (modality === "text") {
					const body = await readFile(path, "utf8");
					return compact({ summary: body.length > 8e3 ? `${body.slice(0, 8e3)}\n… (${body.length} chars)` : body });
				}
				return compact({ summary: `${args.ref}: ${modality} file, ${st.size} bytes at ${path}` });
			}
		}),
		tool({
			name: "tongflow_perceive",
			description: "Understand a video, audio or image through TongFlow's describe/transcribe slots (video-describe, audio-describe / transcribe, image-describe) using an installed plugin — this is how you review generated media the chat model cannot ingest directly. Ask a concrete question: continuity with the reference, lip sync, motion quality, whether the line was spoken correctly, etc. BILLING CHECKPOINT: this runs a plugin. When that plugin bills the user, the call returns needs_confirmation instead of running — tell the user which plugin will describe the file and how it is billed, ask, and only after they agree call again with user_confirmed=true. Ask every time. A plugin that runs locally needs no confirmation.",
			parameters: {
				project: PROJECT_PARAM,
				ref: {
					type: "string",
					required: true,
					description: "Project-relative path of the media file."
				},
				question: {
					type: "string",
					description: "What to look/listen for. Default: a detailed description (or transcript for audio)."
				},
				mode: {
					type: "string",
					enum: ["describe", "transcribe"],
					description: "For audio: 'transcribe' (default) or 'describe'."
				},
				pluginId: {
					type: "string",
					description: "Force a specific plugin (default: the first installed one for the slot)."
				},
				user_confirmed: {
					type: "boolean",
					description: "Set to true ONLY after the user explicitly agreed, in this conversation, to this plugin running and its billing. Never set it on your own; nothing is remembered between calls."
				}
			},
			async execute(args, call) {
				const pid = await resolveProjectId(env, call, args.project);
				const path = await resolveToFile(env, pid, args.ref);
				const modality = modalityOfExt(extname(path).slice(1));
				let feature;
				let prompt;
				const question = args.question ?? "";
				if (modality === "video") {
					feature = "video-describe";
					prompt = {
						video: path,
						text: question || "Describe this video in detail: subjects, action, camera, continuity issues.",
						userPrompt: question
					};
				} else if (modality === "audio") {
					if ((args.mode ?? "transcribe") === "transcribe") {
						feature = "transcribe";
						prompt = {
							audio: path,
							...question ? { context: question } : {}
						};
					} else {
						feature = "audio-describe";
						prompt = {
							audio: path,
							text: question || "Describe this audio.",
							userPrompt: question
						};
					}
				} else if (modality === "image") {
					feature = "image-describe";
					prompt = {
						image: path,
						text: question || "Describe this image in detail.",
						userPrompt: question
					};
				} else return {
					ok: false,
					error: `${args.ref} is not a video/audio/image`
				};
				return compact(await describeViaSlot(env, pid, feature, prompt, args.pluginId, args.user_confirmed));
			}
		}),
		tool({
			name: "tongflow_plugins_list",
			description: "Installed TongFlow plugins (id, name, ABI slots they implement, required env keys, the path of the plugin's own README, and its source repo) and the official plugins that can be installed, each with its repo. A plugin's README is written by whoever wrote the plugin: which models it offers and which is the default, what each env key does, resolutions and aspect ratios it accepts, and its quirks. For an INSTALLED plugin read the local `readme` — it is the clone's own file, costs nothing and is already trusted, since that plugin's code runs on this machine. For an official plugin that is NOT installed there is no local file: fetch its README at <repo>/blob/main/README.md (raw: replace github.com with raw.githubusercontent.com and drop /blob) to see what it does before suggesting the user install it. Never recommend an install from the id alone.",
			parameters: {},
			async execute() {
				const { registry, meta } = await api.registry();
				const OFFICIAL_PLUGINS = await studio.registry.officialIds();
				return compact({
					installed: await Promise.all(Object.entries(registry.plugins).map(async ([id, p]) => ({
						id,
						name: p.name ?? id,
						slots: Object.keys(p.methodsByNodeSlot),
						env: (meta[id]?.env ?? []).map((e) => `${e.key}${e.required ? "*" : ""}`),
						...await pluginReadme(studio.paths.plugins, id),
						repo: browsableRepo(studio.registry.gitUrlFor(id))
					}))),
					official: OFFICIAL_PLUGINS.filter((id) => !registry.plugins[id]).map((id) => ({
						id,
						repo: browsableRepo(studio.registry.gitUrlFor(id))
					})),
					errors: registry.errors ?? []
				});
			}
		}),
		tool({
			name: "tongflow_plugins_install",
			description: "Install a TongFlow plugin by official id (e.g. tongflow-api-gemini, tongflow-modal-qwen38) or git URL. Plugins run in their own Python env; API keys go into the tongflow settings.",
			parameters: { idOrUrl: {
				type: "string",
				required: true
			} },
			async execute(args) {
				const r = await api.installPlugin(args.idOrUrl);
				const { meta } = await api.registry();
				return compact({
					...r,
					env: meta[r.id]?.env ?? []
				});
			}
		}),
		tool({
			name: "tongflow_plugins_uninstall",
			description: "Remove an installed TongFlow plugin.",
			parameters: { id: {
				type: "string",
				required: true
			} },
			async execute(args) {
				await api.uninstallPlugin(args.id);
				return { ok: true };
			}
		})
	];
}
/** Absent means "assume it takes images": guessing the other way would spend a plugin run on every look. */
async function takesImages(call) {
	return call.takesImages ? call.takesImages() : true;
}
async function resolveToFile(env, projectId, ref) {
	return env.api.filePath(projectId, ref);
}
async function ffprobe(path) {
	const { stdout } = await execFile$2("ffprobe", [
		"-v",
		"error",
		"-show_entries",
		"format=duration:stream=codec_type,codec_name,width,height,r_frame_rate,sample_rate,channels",
		"-of",
		"json",
		path
	]);
	const parsed = JSON.parse(stdout);
	return compact({
		duration: parsed.format?.duration ? Number(Number(parsed.format.duration).toFixed(2)) : void 0,
		streams: (parsed.streams ?? []).map((s) => Object.fromEntries(Object.entries(s).filter(([, v]) => v !== void 0)))
	});
}
/** Sample `n` frames evenly across the video and tile them into one JPEG. */
async function contactSheet(path, n, tmpDir) {
	const cols = n <= 4 ? 2 : n <= 9 ? 3 : 4;
	const rows = Math.ceil(n / cols);
	const out = join(tmpDir, `sheet-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`);
	const probe = await ffprobe(path);
	const fps = n / (probe.duration && probe.duration > 0 ? probe.duration : 1);
	await execFile$2("ffmpeg", [
		"-v",
		"error",
		"-y",
		"-i",
		path,
		"-vf",
		`fps=${fps},scale=480:-2,tile=${cols}x${rows}`,
		"-frames:v",
		"1",
		"-q:v",
		"4",
		out
	]);
	return out;
}
//#endregion
//#region ../tongflow-studio/src/tools/workflow-tools.ts
/**
* Workflow tools: create / patch / read / list / validate.
*
* The graph-editing tools wrap tongflow's own agent tools
* (apply_graph_patch, read_canvas, validate_workflow, describe_node_type),
* adding the `workflow` file argument — the file on disk is the canvas.
*/
const WORKFLOW_PARAM = {
	type: "string",
	required: true,
	description: "Workflow file, project-relative, e.g. 'characters/mei/mei_ref' or 'characters/mei/mei_ref.tongflow.json'."
};
const NODE_REF = "A node reference: an alias declared in this patch's add_nodes, or an existing node's short id (8 chars, as shown by tongflow_workflow_read).";
function workflowTools(env) {
	const { api } = env;
	return [
		tool({
			name: "tongflow_workflow_new",
			description: "Create a new, empty workflow file at a path you choose inside the project — ONE FILE PER GENERATED ASSET, placed in the folder where that asset belongs (e.g. 'characters/mei/mei_ref', 'episodes/ep01/shots/sh010/keyframe'). Its outputs will land next to it as <name>.01.png, <name>.02.png … plus <name>.runs.json. Every image / audio / video / 3D asset is made this way: create → patch nodes (concrete prompt, file refs, params) → run. Never overwrite an existing file; patch it instead. copy_from clones another workflow of this project as the starting point.",
			parameters: {
				project: PROJECT_PARAM,
				path: {
					type: "string",
					required: true,
					description: "Project-relative path of the new file, without or with the .tongflow.json suffix. Folders are created as needed."
				},
				copy_from: {
					type: "string",
					description: "Another workflow of this project to copy the graph from (its outputs are not copied)."
				},
				name: {
					type: "string",
					description: "Display name."
				},
				description: {
					type: "string",
					description: "What this workflow makes and why."
				},
				purpose: {
					type: "string",
					description: "Free-form purpose recorded in meta."
				}
			},
			async execute(args, call) {
				const pid = await resolveProjectId(env, call, args.project);
				const meta = {};
				if (args.purpose) meta.purpose = args.purpose;
				return compact(await api.newWorkflow(pid, args.path, {
					...args.copy_from ? { copyFrom: args.copy_from } : {},
					...args.name ? { name: args.name } : {},
					...args.description ? { description: args.description } : {},
					meta
				}));
			}
		}),
		tool({
			name: "tongflow_workflow_patch",
			description: "The ONLY way to change a workflow's graph. Describes one coherent change: nodes to create, edges to draw, params to set, nodes to delete. Patch incrementally — never rebuild an existing workflow from scratch. Reference new nodes by the alias you give them; existing nodes by their short id. Never invent uuids. Graph grammar: data node (textNode / imageNode / audioNode / videoNode …) → executable node → its output data nodes are created automatically. For a data node use data:{texts:[…]} or data:{fileKeys:['./mei_ref.02.png']} — file paths are relative to the workflow file ('./x', '../x') or to the project root ('characters/mei/x.png'); URLs pass through. Include text files inside ONE prompt with {{path}} placeholders, e.g. texts:['{{../style.md}} {{./mei.md}} full-body reference sheet, front view'] (expanded at run time) — never chain text-combining nodes for that. A level-0 data node WITHOUT static data becomes a workflow INPUT supplied at run time (tongflow_workflow_run inputs) — give it a readable name with data:{inputName:'prompt'} (else it is input_<id>). Prefer writing values into the nodes so the file is self-contained. Use tongflow_node_catalog / tongflow_node_describe to see node types, their wires and config fields.",
			parameters: {
				project: PROJECT_PARAM,
				workflow: WORKFLOW_PARAM,
				add_nodes: {
					type: "array",
					description: "Nodes to create. Layout is automatic — never supply coordinates.",
					items: {
						type: "object",
						additionalProperties: false,
						properties: {
							alias: {
								type: "string",
								required: true,
								description: "Short local name (e.g. 't1', 'gen1') used in add_edges within this patch."
							},
							type: {
								type: "string",
								required: true,
								description: "Canvas node type from the catalog (e.g. 'textNode', 'textGenImageNode', 'imageGenVideoNode')."
							},
							data: {
								type: "object",
								additionalProperties: true,
								description: "Initial data. textNode: {texts:[…]}; imageNode etc.: {fileKeys:[…]} (project paths); executable node: its config fields (e.g. {aspect_ratio:'16:9', duration:5}). Never set 'prompt'."
							},
							pluginId: {
								type: "string",
								description: "Explicit plugin for an executable node (see catalog). Omit to use the installed default."
							},
							pluginModel: {
								type: "string",
								description: "Model id, only for plugins that advertise models."
							}
						}
					}
				},
				add_edges: {
					type: "array",
					description: "Edges to draw. Handles are derived automatically; supply them only to disambiguate (e.g. several images into 'in:images').",
					items: {
						type: "object",
						additionalProperties: false,
						properties: {
							from: {
								type: "string",
								required: true,
								description: NODE_REF
							},
							to: {
								type: "string",
								required: true,
								description: NODE_REF
							},
							fromHandle: {
								type: "string",
								description: "Optional source handle, e.g. 'out:image'."
							},
							toHandle: {
								type: "string",
								description: "Optional target handle, e.g. 'in:images'."
							}
						}
					}
				},
				update_nodes: {
					type: "array",
					description: "Change params on existing nodes. Merged into current data — send only the keys you are changing.",
					items: {
						type: "object",
						additionalProperties: false,
						properties: {
							id: {
								type: "string",
								required: true,
								description: NODE_REF
							},
							data: {
								type: "object",
								additionalProperties: true,
								required: true
							}
						}
					}
				},
				remove_nodes: {
					type: "array",
					description: "Node references to delete.",
					items: { type: "string" }
				}
			},
			async execute(args, call) {
				const pid = await resolveProjectId(env, call, args.project);
				const patch = {};
				if (args.add_nodes) patch.add_nodes = args.add_nodes;
				if (args.add_edges) patch.add_edges = args.add_edges;
				if (args.update_nodes) patch.update_nodes = args.update_nodes;
				if (args.remove_nodes) patch.remove_nodes = args.remove_nodes;
				return compact(await api.graphTool(pid, args.workflow, "apply_graph_patch", patch));
			}
		}),
		tool({
			name: "tongflow_workflow_read",
			description: "Read a workflow file in full: rendered graph (nodes with short ids, params, edges), inputs, outputs, the files it has generated so far (with numbers and notes) and a validation report. Read before patching a workflow you did not just create, and after the user edited it on the canvas.",
			parameters: {
				project: PROJECT_PARAM,
				workflow: WORKFLOW_PARAM
			},
			async execute(args, call) {
				const pid = await resolveProjectId(env, call, args.project);
				return compact(await api.describeWorkflow(pid, args.workflow));
			}
		}),
		tool({
			name: "tongflow_workflow_list",
			description: "List every workflow file in the project (any folder) with its inputs and how many files it has generated.",
			parameters: { project: PROJECT_PARAM },
			async execute(args, call) {
				const pid = await resolveProjectId(env, call, args.project);
				return compact(await api.listWorkflows(pid));
			}
		}),
		tool({
			name: "tongflow_workflow_validate",
			description: "Health-check a workflow: cycles, unconnected required inputs, empty required config, missing / uninstalled plugins. Run it before executing.",
			parameters: {
				project: PROJECT_PARAM,
				workflow: WORKFLOW_PARAM
			},
			async execute(args, call) {
				const pid = await resolveProjectId(env, call, args.project);
				return compact(await api.graphTool(pid, args.workflow, "validate_workflow", {}));
			}
		}),
		tool({
			name: "tongflow_workflow_compose",
			description: "Compose several small workflows into ONE big workflow file for a whole-picture canvas view and one-shot re-runs (e.g. a shot's keyframe → i2v → lip-sync, or everything under a scene folder). Where a part references another part's output file (an imageNode with './keyframe.02.png' while keyframe.tongflow.json sits in the same folder), that file becomes a real edge from the producing node; other file refs stay files. Every stage's product remains an output, named after its part (<all>.01.keyframe.png, <all>.01.i2v.mp4). The parts are not modified. Do this after the parts exist and were reviewed; tell the user to open the composed file on the canvas.",
			parameters: {
				project: PROJECT_PARAM,
				workflows: {
					type: "array",
					items: { type: "string" },
					description: "Workflow files in production order (project-relative). Either this or folder."
				},
				folder: {
					type: "string",
					description: "Compose every workflow under this folder, at any depth, sorted by path (previous *_all files excluded at every level). This is how a parent folder gets the whole picture of everything beneath it: it takes the leaf workflows, not its children's composed files, so every file reference still matches the part that produces it."
				},
				path: {
					type: "string",
					description: "Where to write the composed file (default: <folder of the first part>/<folder name>_all)."
				},
				name: {
					type: "string",
					description: "Display name."
				}
			},
			async execute(args, call) {
				const pid = await resolveProjectId(env, call, args.project);
				return compact(await api.composeWorkflows(pid, {
					...args.workflows ? { workflows: args.workflows } : {},
					...args.folder !== void 0 ? { folder: args.folder } : {},
					...args.path ? { path: args.path } : {},
					...args.name ? { name: args.name } : {}
				}));
			}
		}),
		tool({
			name: "tongflow_node_catalog",
			description: "One line per canvas node type: ABI slot, wires (inputs from other nodes; * = required), config fields, outputs, and which installed plugins implement it. Consult before patching.",
			parameters: {},
			returns: "string",
			async execute() {
				return api.nodeCatalog();
			}
		}),
		tool({
			name: "tongflow_node_describe",
			description: "Full config schema for one node type (enums, ranges, defaults) — more detail than the catalog line. Use before setting an unfamiliar param.",
			parameters: { type: {
				type: "string",
				required: true,
				description: "Canvas node type, e.g. 'imageGenVideoNode'."
			} },
			async execute(args) {
				return compact(describeNodeType(args.type));
			}
		})
	];
}
//#endregion
//#region ../tongflow-studio/src/tools/index.ts
/** Every tongflow_* tool, host-neutral; a host adapts the list to its own registry. */
function allTools(env) {
	return [
		...projectTools(env),
		...workflowTools(env),
		...runTools(env)
	];
}
promisify(execFile);
//#endregion
//#region ../tongflow-studio/src/studio.ts
/**
* The Studio: one object holding resolved config, paths, the python
* bootstrap, the plugin registry and the run manager. Tools, HTTP routes and
* skills all talk to this instead of to each other.
*/
var Studio = class {
	config;
	paths;
	abiPath;
	registry;
	runs;
	log;
	resolveEnv;
	pythonPromise;
	constructor(options) {
		this.config = options.config;
		this.log = options.log ?? (() => void 0);
		this.resolveEnv = options.resolveEnv;
		this.paths = studioPaths(resolveStudioRoot(options.config.studioRoot));
		this.abiPath = resolveAbiPath();
		this.registry = new RegistryManager({
			pluginsDir: this.paths.plugins,
			abiPath: this.abiPath,
			python: () => this.python(),
			org: options.config.pluginOrg,
			pluginGitUrls: options.config.pluginGitUrls,
			log: this.log
		});
		this.runs = new RunManager(this);
	}
	async init() {
		await mkdir(this.paths.projects, { recursive: true });
		await mkdir(this.paths.plugins, { recursive: true });
		await mkdir(this.paths.data, { recursive: true });
		await mkdir(this.paths.tmp, { recursive: true });
		if (this.config.autoInstallOfficial) this.registry.ensureOfficialInstalled().catch((error) => {
			this.log(`tongflow-studio: official plugin install failed: ${error instanceof Error ? error.message : String(error)}`);
		});
	}
	/** The studio venv python (bootstrapped on first use). */
	python(log = this.log) {
		if (!this.pythonPromise) this.pythonPromise = ensureVenv({
			venvDir: this.paths.venv,
			pythonPath: this.config.pythonPath,
			sdkSpec: this.config.sdkSpec,
			log
		}).catch((error) => {
			this.pythonPromise = void 0;
			throw error;
		});
		return this.pythonPromise;
	}
	/** Environment handed to the engine (inherited by plugin subprocesses): config.env < env.json < resolver. */
	async pluginEnv() {
		const stored = await this.readEnvFile();
		const extra = this.resolveEnv ? await this.resolveEnv() : {};
		return {
			...this.config.env,
			...stored,
			...extra
		};
	}
	get envFile() {
		return join(this.paths.root, "env.json");
	}
	/** Secrets the user entered in the studio UI (plugin API keys, Modal tokens). */
	readEnvFile() {
		return readJsonOr(this.envFile, {});
	}
	/** Merge updates into env.json (`null` deletes); file is created 0600. */
	async updateEnvFile(patch) {
		const current = await this.readEnvFile();
		for (const [k, v] of Object.entries(patch)) {
			if (!/^[A-Z][A-Z0-9_]*$/.test(k)) throw new Error(`invalid env key "${k}"`);
			if (v === null || v === "") delete current[k];
			else current[k] = v;
		}
		await writeJson(this.envFile, current);
		await chmod(this.envFile, 384).catch(() => void 0);
		return current;
	}
	project(projectId) {
		return loadProject(this.paths.root, projectId);
	}
};
function resolveAbiPath() {
	try {
		return createRequire(import.meta.url).resolve("tongflow/abi");
	} catch {
		return;
	}
}
//#endregion
//#region src/skills/provider.ts
/**
* Packaged skills: the studio working method, shipped as markdown under
* `<package>/skills/`.
*/
const PROVIDER = "dsh-tongflow";
/** Below user/project skills (100–500) so a project can override the packaged method. */
const RANK = 620;
async function isDir(path) {
	try {
		return (await stat(path)).isDirectory();
	} catch {
		return false;
	}
}
async function skillsRoot() {
	const here = dirname(fileURLToPath(import.meta.url));
	for (const candidate of [join(here, "..", "skills"), join(here, "..", "..", "skills")]) if (await isDir(candidate)) return candidate;
	throw new Error("dsh-tongflow: skills directory not found");
}
/** Minimal front matter parser: `--- key: value ... ---` at the top of the file. */
function parseFront(text) {
	const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text);
	if (!m) throw new Error("skill file lacks front matter");
	const front = {};
	for (const line of m[1].split(/\r?\n/)) {
		const kv = /^([A-Za-z_-]+):\s*(.*)$/.exec(line);
		if (kv) front[kv[1]] = kv[2].replace(/^["']|["']$/g, "");
	}
	if (!front.name || !front.description) throw new Error("skill front matter needs name and description");
	return {
		front: {
			name: front.name,
			description: front.description,
			...front.whenToUse ? { whenToUse: front.whenToUse } : {}
		},
		body: text.slice(m[0].length)
	};
}
async function candidates() {
	const root = await skillsRoot();
	const out = [];
	for (const name of (await readdir(root)).filter((n) => n.endsWith(".md")).sort()) {
		const path = join(root, name);
		const { front } = parseFront(await readFile(path, "utf8"));
		out.push({
			name: front.name,
			description: front.description,
			...front.whenToUse ? { whenToUse: front.whenToUse } : {},
			invocation: {
				modelInvocable: true,
				userInvocable: true
			},
			source: "bundled",
			provider: PROVIDER,
			resourceBase: {
				kind: "directory",
				path: root
			},
			rank: RANK,
			locator: path,
			path
		});
	}
	return out;
}
function registerSkills(ctx) {
	const provider = {
		name: PROVIDER,
		list: () => candidates(),
		async get(candidate) {
			const path = candidate.locator;
			if (typeof path !== "string") return void 0;
			const { front, body } = parseFront(await readFile(path, "utf8"));
			return {
				...candidate,
				name: front.name,
				description: front.description,
				content: body
			};
		}
	};
	ctx.effect(() => ctx.skills.registerProvider(() => provider), "dsh-tongflow: skills");
}
//#endregion
//#region src/tools.ts
/**
* Whether the model this call runs under accepts image content. Mirrors the
* llm runtime's own predicate: it only projects images away for a model that
* *declares* modalities without "image", so an undeclared catalog stays
* image-capable here too. Unknown agent or absent llm service means "assume it
* takes images" — the runtime degrades gracefully either way, and guessing the
* other direction would spend a plugin run on every look.
*/
async function modelTakesImages(ctx, exec) {
	const llm = ctx.get("llm");
	const { provider, model } = exec.agent?.options ?? {};
	if (!llm || !provider || !model) return true;
	try {
		const info = await llm.resolveModelInfo(provider, model, exec.signal);
		return info.inputModalities === void 0 || info.inputModalities.includes("image");
	} catch {
		return true;
	}
}
/**
* Background job spec for a workflow run, valid on both job APIs we support.
* dsh >= 0.1.7 keys ownership by session id, passes a JobHandle to `run` for
* streaming output, and returns the final value as `result`. dsh 0.1.5 took
* the live Agent as owner, pulled `readOutput()`, and read `output`. The newer
* registry is the one exposing `events` (0.1.5 had `onJobDone`).
*/
function backgroundJobSpec(jobs, agent, workflow, record) {
	const modern = "events" in jobs;
	const owner = agent ? { owner: modern ? agent.id : agent } : {};
	return {
		kind: "tongflow",
		label: `tongflow ${workflow}`,
		...owner,
		run: (job) => {
			let stop = () => {};
			if (job) {
				const append = (text) => {
					if (text) job.append(`${text}\n`);
				};
				append(record.readOutput());
				stop = record.subscribe((event) => append(formatEvent(event)));
			}
			return {
				cancel: (reason) => record.cancel(reason),
				done: record.done.then((r) => {
					stop();
					const final = JSON.stringify(runResult(r), null, 2);
					return {
						status: r.summary.status === "completed" ? "completed" : r.summary.status === "cancelled" ? "killed" : "failed",
						...r.error ? { detail: r.error } : {},
						result: final,
						output: final
					};
				}),
				readOutput: () => record.readOutput()
			};
		}
	};
}
/** One dsh execution as the neutral tools see it; absent services stay absent so the tools degrade. */
function toolCall(ctx, exec) {
	const attachments = ctx.get("attachments");
	const jobs = ctx.get("jobs");
	const cwd = exec.agent?.session.header.cwd;
	return {
		signal: exec.signal,
		...exec.agent?.id ? { sessionId: String(exec.agent.id) } : {},
		...cwd ? { cwd } : {},
		takesImages: () => modelTakesImages(ctx, exec),
		...attachments ? { showImage: async (image) => {
			const attachment = await attachments.saveImage(image);
			return {
				attachment,
				width: attachment.width,
				height: attachment.height
			};
		} } : {},
		...jobs ? { startBackground: (workflow, record) => String(jobs.start(backgroundJobSpec(jobs, exec.agent, workflow, record))) } : {}
	};
}
function text(value) {
	return [{
		type: "text",
		text: typeof value === "string" ? value : JSON.stringify(value, null, 2)
	}];
}
/** Text for the model, plus the image when the value carries one (tongflow_look). */
function render(_args, value) {
	const val = value;
	if (!val || typeof val !== "object" || !val.attachment) return text(value);
	return [...text(val.summary ?? JSON.stringify(value)), {
		type: "image",
		attachment: val.attachment
	}];
}
function dshTool(ctx, spec) {
	return defineTool({
		name: spec.name,
		description: spec.description,
		parameters: spec.parameters,
		output: {
			schema: { type: spec.returns === "string" ? "string" : "json" },
			render
		},
		execute: (args, exec) => spec.execute(args, toolCall(ctx, exec))
	});
}
/** Register every tongflow_* tool on ctx.tools; registrations are effects (disposed on unload). */
function registerTools(ctx, env) {
	for (const spec of allTools(env)) {
		const tool = dshTool(ctx, spec);
		ctx.effect(() => ctx.tools.register(tool), `dsh-tongflow: tool ${tool.name}`);
	}
}
function isTriggerText(text) {
	return typeof text === "string" && text.trimStart().toLowerCase().startsWith("@tongflow");
}
function firstText(content) {
	for (const b of content ?? []) {
		const block = b;
		if (block?.type === "text" && typeof block.text === "string") return block.text;
	}
}
/** First user message already in the durable log (restored / continued sessions). */
function firstLoggedUserText(agent) {
	for (const e of agent.session.snapshotEvents()) if (e.type === "user/message") {
		const msg = e.data;
		return firstText(msg?.content);
	}
}
/**
* Wire the activation waterfall. Returns nothing; registrations ride the
* agent's scoped context and unwind when the agent is disposed.
*/
function installActivation(ctx, options) {
	const activated = /* @__PURE__ */ new WeakSet();
	const decided = /* @__PURE__ */ new WeakSet();
	const activate = (agent) => {
		if (activated.has(agent)) return;
		activated.add(agent);
		const actx = agent.ctx;
		registerTools(actx, options.env);
		actx.inject(["systemPrompt"], (pctx) => {
			pctx.effect(() => pctx.systemPrompt.section({
				name: "tool:tongflow",
				order: 150,
				text: options.systemSection
			}), "dsh-tongflow: system prompt section (agent scope)");
		});
		actx.inject(["skills"], (sctx) => registerSkills(sctx));
		options.studio.log(`dsh-tongflow: studio mode on for session ${agent.id}`);
	};
	const isStudioSession = (agent, incoming) => {
		const logged = firstLoggedUserText(agent);
		if (logged !== void 0) return isTriggerText(logged);
		return isTriggerText(firstText(incoming[0]?.content));
	};
	ctx.on("agent/pre-step", async (payload, next) => {
		const agent = payload.agent;
		if (!decided.has(agent)) {
			let studio = false;
			try {
				studio = isStudioSession(agent, payload.messages);
			} catch {
				studio = false;
			}
			if (studio) {
				decided.add(agent);
				activate(agent);
			} else if (payload.messages.length > 0 || firstLoggedUserText(agent) !== void 0) decided.add(agent);
		}
		return next();
	});
}
//#endregion
//#region src/config.ts
/** Plugin configuration (cordis.yml row `config`), validated by schemastery at load. */
/** `$DSH_HOME`, else `~/.dsh` (mirrors dsh's own resolution). */
function resolveDshHome() {
	const env = process.env.DSH_HOME;
	return env?.trim() ? resolve(env) : join(homedir(), ".dsh");
}
const Config = z.object({
	studioRoot: z.string(),
	pythonPath: z.string(),
	sdkSpec: z.string().default(`tongflow==${DEFAULT_TONGFLOW_SDK_VERSION}`),
	pluginOrg: z.string().default(OFFICIAL_ORG),
	pluginGitUrls: z.dict(z.string()).default({}),
	env: z.dict(z.string()).default({}),
	maxConcurrentRuns: z.number().default(2),
	httpPrefix: z.string().default("/tongflow"),
	locale: z.string().default("en"),
	autoInstallOfficial: z.boolean().default(true)
});
//#endregion
//#region src/index.ts
/**
* dsh-tongflow — host (Node) half.
*
* A Cordis plugin mounted by the dsh Loader. It stands up the Studio (paths,
* python bootstrap, plugin registry, run manager) and registers, as effects:
* the tongflow_* agent tools, packaged skills, a short system-prompt section
* and the HTTP routes the embedded canvas / studio UI talk to.
*/
const name = "dsh-tongflow";
/** The tool registry and agent registry are the hard requirements; other seams attach when they mount. */
const inject = ["tools", "agents"];
function apply(ctx, config) {
	const log = (line) => ctx.logger?.info?.(line);
	const studio = new Studio({
		config: {
			...config,
			studioRoot: config.studioRoot?.trim() || join(resolveDshHome(), "tongflow")
		},
		log
	});
	const api = new StudioApi(studio);
	studio.init().catch((error) => {
		ctx.logger?.warn?.(`dsh-tongflow: studio init failed: ${error instanceof Error ? error.message : String(error)}`);
	});
	installActivation(ctx, {
		studio,
		env: {
			studio,
			api
		},
		systemSection: SYSTEM_SECTION
	});
	ctx.inject(["webServer"], (webCtx) => {
		const handler = createRouteHandler({
			studio,
			api,
			prefix: config.httpPrefix
		});
		webCtx.effect(() => webCtx.webServer.register({
			kind: "prefix",
			path: routePrefix(config.httpPrefix),
			handler
		}), "dsh-tongflow: http routes");
	});
}
const SYSTEM_SECTION = `${STUDIO_RULES} Load the "tongflow-studio" skill for the full method.
What the user sees (say this, never invent panels): the Studio panel next to the chat shows a project selector, the project's folder tree (a workflow row expands to the files it generated) and a preview area — clicking any file previews or edits it, clicking a .tongflow.json opens it on the canvas. To point at a result say e.g. "在右侧面板:characters → mei → mei_ref.02.png" (the panel follows the project you work in). Never give absolute file paths as the way to view something.
${STUDIO_LANGUAGE}`;
//#endregion
export { Config, apply, inject, name };
