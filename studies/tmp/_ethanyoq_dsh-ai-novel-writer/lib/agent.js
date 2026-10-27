import { ToolArgsError, defineTool } from "@deepseek-ai/dsh-tools";
import z from "@deepseek-ai/schemastery";
import { createHash } from "node:crypto";
import { lstat, mkdir, readFile, readdir, realpath } from "node:fs/promises";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
import { withFileLock, writeFileAtomic } from "@deepseek-ai/dsh-atomic-write";
import { HarnessError, assertNever } from "@deepseek-ai/dsh-llm";
//#region src/types.ts
/** Error carrying a stable machine-readable novel-project code. */
var NovelProjectError = class extends HarnessError {
	/**
	* Create a stable novel-project failure.
	*
	* @param code Machine-readable failure code.
	* @param message Human-readable failure detail.
	* @param options Standard error cause options.
	*/
	constructor(code, message, options) {
		super(message, code, options);
	}
};
//#endregion
//#region src/novel-project.ts
const PROJECT_DIR = ".ai-novel";
const MANIFEST_PATH = ".ai-novel/project.json";
const FORMAT_VERSION = 1;
const PROJECT_KIND = "harness-novel-project";
const DEFAULT_ASSET_LIMIT = 524288;
const DEFAULT_WORKING_SET_LIMIT = 524288;
const DEFAULT_QUERY_LIMIT = 20;
/** Convert text to the canonical on-disk newline form. */
function normalizeText(text) {
	return text.replace(/\r\n?/g, "\n");
}
/** Return the revision of exactly the UTF-8 bytes written to disk. */
function revisionOf(text) {
	return createHash("sha256").update(Buffer.from(text, "utf8")).digest("hex");
}
/** Serialize a JSON asset with stable indentation and one trailing newline. */
function stableJson(value) {
	return `${JSON.stringify(value, null, 2)}\n`;
}
function requireNotAborted(signal) {
	if (signal.aborted) throw new NovelProjectError("CANCELLED", "novel project operation was cancelled");
}
function requireNonEmpty(value, field) {
	if (typeof value !== "string" || value.trim() === "") throw new NovelProjectError("INVALID_CONTENT", `${field} must be a non-empty string`);
}
function requirePositiveInteger(value, field) {
	if (!Number.isSafeInteger(value) || Number(value) <= 0) throw new NovelProjectError("INVALID_CONTENT", `${field} must be a positive integer`);
}
function requireIsoTimestamp(value, field) {
	requireNonEmpty(value, field);
	const milliseconds = Date.parse(value);
	if (!Number.isFinite(milliseconds) || new Date(milliseconds).toISOString() !== value) throw new NovelProjectError("INVALID_CONTENT", `${field} must be a canonical ISO-8601 timestamp`);
}
function requireCreativeStrategy(value) {
	if (![
		"auto",
		"fluent-drafting",
		"consistency-first",
		"deep-planning"
	].includes(value)) throw new NovelProjectError("INVALID_CONTENT", "creativeStrategy is not supported");
}
function requireLimit(value, field) {
	if (!Number.isSafeInteger(value) || value <= 0) throw new NovelProjectError("INVALID_CONTENT", `${field} must be a positive integer`);
}
function truncateUtf8(text, limit) {
	const bytes = Buffer.from(text, "utf8");
	if (bytes.length <= limit) return text;
	let end = limit;
	while (end > 0 && (bytes[end] ?? 0) >= 128 && (bytes[end] ?? 0) < 192) end -= 1;
	return bytes.subarray(0, end).toString("utf8");
}
function parseManifest(text) {
	let value;
	try {
		value = JSON.parse(text);
	} catch (cause) {
		throw new NovelProjectError("INVALID_CONTENT", "project manifest is not valid JSON", { cause });
	}
	if (typeof value !== "object" || value === null || Array.isArray(value)) throw new NovelProjectError("INVALID_CONTENT", "project manifest must be a JSON object");
	const record = value;
	if (Object.keys(record).sort().join("\0") !== [...[
		"formatVersion",
		"kind",
		"projectId",
		"title",
		"language",
		"genre",
		"plannedChapters",
		"targetWordsPerChapter",
		"creativeStrategy",
		"createdAt",
		"updatedAt"
	]].sort().join("\0")) throw new NovelProjectError("INVALID_CONTENT", "project manifest contains missing or unknown fields");
	if (record.formatVersion !== FORMAT_VERSION || record.kind !== PROJECT_KIND) throw new NovelProjectError("UNSUPPORTED_FORMAT", "project manifest format is not supported");
	requireNonEmpty(record.projectId, "projectId");
	if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(record.projectId)) throw new NovelProjectError("INVALID_CONTENT", "projectId must be a UUID");
	requireNonEmpty(record.title, "title");
	requireNonEmpty(record.language, "language");
	requireNonEmpty(record.genre, "genre");
	requirePositiveInteger(record.plannedChapters, "plannedChapters");
	requirePositiveInteger(record.targetWordsPerChapter, "targetWordsPerChapter");
	requireCreativeStrategy(record.creativeStrategy);
	requireIsoTimestamp(record.createdAt, "createdAt");
	requireIsoTimestamp(record.updatedAt, "updatedAt");
	return {
		formatVersion: FORMAT_VERSION,
		kind: PROJECT_KIND,
		projectId: record.projectId,
		title: record.title,
		language: record.language,
		genre: record.genre,
		plannedChapters: record.plannedChapters,
		targetWordsPerChapter: record.targetWordsPerChapter,
		creativeStrategy: record.creativeStrategy,
		createdAt: record.createdAt,
		updatedAt: record.updatedAt
	};
}
function parseJsonObject(text, label) {
	let value;
	try {
		value = JSON.parse(text);
	} catch (cause) {
		throw new NovelProjectError("INVALID_CONTENT", `${label} is not valid JSON`, { cause });
	}
	if (typeof value !== "object" || value === null || Array.isArray(value)) throw new NovelProjectError("INVALID_CONTENT", `${label} must be a JSON object`);
	return value;
}
function requireExactKeys(record, keys, label) {
	if (Object.keys(record).sort().join("\0") !== [...keys].sort().join("\0")) throw new NovelProjectError("INVALID_CONTENT", `${label} contains missing or unknown fields`);
}
function requireStringArray(value, field) {
	if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) throw new NovelProjectError("INVALID_CONTENT", `${field} must be an array of strings`);
}
function canonicalCharacters(record) {
	requireExactKeys(record, ["characters"], "characters asset");
	if (!Array.isArray(record.characters)) throw new NovelProjectError("INVALID_CONTENT", "characters must be an array");
	const ids = /* @__PURE__ */ new Set();
	const characters = [];
	for (const [index, value] of record.characters.entries()) {
		if (typeof value !== "object" || value === null || Array.isArray(value)) throw new NovelProjectError("INVALID_CONTENT", `characters[${index}] must be an object`);
		const character = value;
		requireExactKeys(character, [
			"id",
			"name",
			"role",
			"summary",
			"goal",
			"relationships",
			"notes"
		], `characters[${index}]`);
		for (const field of [
			"id",
			"name",
			"role",
			"summary",
			"goal"
		]) requireNonEmpty(character[field], `characters[${index}].${field}`);
		if (ids.has(character.id)) throw new NovelProjectError("INVALID_CONTENT", `duplicate character id: ${character.id}`);
		ids.add(character.id);
		if (!Array.isArray(character.relationships)) throw new NovelProjectError("INVALID_CONTENT", `characters[${index}].relationships must be an array`);
		for (const [relationIndex, relation] of character.relationships.entries()) {
			if (typeof relation !== "object" || relation === null || Array.isArray(relation)) throw new NovelProjectError("INVALID_CONTENT", `relationship ${relationIndex} must be an object`);
			const fields = relation;
			requireExactKeys(fields, [
				"characterId",
				"type",
				"summary"
			], `relationship ${relationIndex}`);
			requireNonEmpty(fields.characterId, "relationship.characterId");
			requireNonEmpty(fields.type, "relationship.type");
			requireNonEmpty(fields.summary, "relationship.summary");
		}
		if (typeof character.notes !== "string") throw new NovelProjectError("INVALID_CONTENT", `characters[${index}].notes must be a string`);
		characters.push({
			id: character.id,
			name: character.name,
			role: character.role,
			summary: character.summary,
			goal: character.goal,
			relationships: character.relationships.map((relation) => {
				const fields = relation;
				return {
					characterId: fields.characterId,
					type: fields.type,
					summary: fields.summary
				};
			}),
			notes: character.notes
		});
	}
	return { characters };
}
function canonicalStoryBlueprint(record) {
	requireExactKeys(record, [
		"premise",
		"themes",
		"world",
		"mainPlot",
		"endingGoal"
	], "story blueprint");
	requireNonEmpty(record.premise, "premise");
	requireStringArray(record.themes, "themes");
	requireNonEmpty(record.world, "world");
	requireNonEmpty(record.mainPlot, "mainPlot");
	requireNonEmpty(record.endingGoal, "endingGoal");
	return {
		premise: record.premise,
		themes: record.themes,
		world: record.world,
		mainPlot: record.mainPlot,
		endingGoal: record.endingGoal
	};
}
function canonicalChapterBlueprint(record, expectedChapter) {
	requireExactKeys(record, [
		"chapter",
		"title",
		"purpose",
		"beats",
		"characterIds",
		"continuityNotes",
		"status"
	], "chapter blueprint");
	requirePositiveInteger(record.chapter, "chapter");
	if (record.chapter !== expectedChapter) throw new NovelProjectError("INVALID_CONTENT", "chapter blueprint number does not match its target");
	requireNonEmpty(record.title, "title");
	requireNonEmpty(record.purpose, "purpose");
	requireStringArray(record.beats, "beats");
	requireStringArray(record.characterIds, "characterIds");
	requireStringArray(record.continuityNotes, "continuityNotes");
	if (typeof record.status !== "string" || ![
		"planned",
		"drafting",
		"drafted",
		"revised",
		"final"
	].includes(record.status)) throw new NovelProjectError("INVALID_CONTENT", "chapter blueprint status is not supported");
	return {
		chapter: record.chapter,
		title: record.title,
		purpose: record.purpose,
		beats: record.beats,
		characterIds: record.characterIds,
		continuityNotes: record.continuityNotes,
		status: record.status
	};
}
/**
* Validate and render one replacement exactly as it would be stored.
*
* @param target Project-owned asset identity.
* @param text Proposed UTF-8 text.
* @returns Canonical LF text with schema-ordered JSON for structured assets.
* @throws {@link NovelProjectError} when the proposed content is invalid.
*/
function canonicalNovelAssetText(target, text) {
	const normalized = normalizeText(text);
	if (target.kind === "chapter-draft") return normalized;
	const record = parseJsonObject(normalized, novelAssetSource(target));
	switch (target.kind) {
		case "project": return stableJson(parseManifest(stableJson(record)));
		case "characters": return stableJson(canonicalCharacters(record));
		case "story-blueprint": return stableJson(canonicalStoryBlueprint(record));
		case "chapter-blueprint": return stableJson(canonicalChapterBlueprint(record, target.chapter));
		default: return assertNever(target);
	}
}
/**
* Validate and render an initialization request exactly as it will be stored.
*
* @param request Complete manifest identity and writing settings approved by the user.
* @returns Canonical project-manifest bytes.
* @throws {@link NovelProjectError} when any manifest field is invalid.
*/
function canonicalNovelInitialization(request) {
	if (request.createdAt !== request.updatedAt) throw new NovelProjectError("INVALID_CONTENT", "createdAt and updatedAt must match during initialization");
	return canonicalNovelAssetText({ kind: "project" }, stableJson({
		formatVersion: FORMAT_VERSION,
		kind: PROJECT_KIND,
		projectId: request.projectId,
		title: request.title.trim(),
		language: request.language.trim(),
		genre: request.genre.trim(),
		plannedChapters: request.plannedChapters,
		targetWordsPerChapter: request.targetWordsPerChapter,
		creativeStrategy: request.creativeStrategy,
		createdAt: request.createdAt,
		updatedAt: request.updatedAt
	}));
}
function normalizeAssetContent(target, replacement, currentManifest) {
	const canonical = canonicalNovelAssetText(target, replacement);
	if (target.kind !== "project") return canonical;
	const next = parseManifest(canonical);
	if (next.projectId !== currentManifest.projectId || next.createdAt !== currentManifest.createdAt) throw new NovelProjectError("INVALID_CONTENT", "project identity and createdAt are immutable");
	if (next.title === currentManifest.title && next.language === currentManifest.language && next.genre === currentManifest.genre && next.plannedChapters === currentManifest.plannedChapters && next.targetWordsPerChapter === currentManifest.targetWordsPerChapter && next.creativeStrategy === currentManifest.creativeStrategy) throw new NovelProjectError("INVALID_CONTENT", "project settings replacement must change at least one visible field");
	return canonical;
}
function revisionMatches(current, request) {
	return current.revision === request.baseRevision;
}
function validateAssetText(target, text) {
	if (target.kind === "chapter-draft") return;
	if (target.kind === "project") {
		parseManifest(text);
		return;
	}
	const record = parseJsonObject(text, novelAssetSource(target));
	switch (target.kind) {
		case "characters":
			canonicalCharacters(record);
			return;
		case "story-blueprint":
			canonicalStoryBlueprint(record);
			return;
		case "chapter-blueprint":
			canonicalChapterBlueprint(record, target.chapter);
			return;
		default: assertNever(target);
	}
}
/**
* Return the fixed project-relative path for one discriminated asset reference.
*
* @param target Project-owned asset identity.
* @returns A normalized project-relative path that never contains caller-provided path segments.
*/
function novelAssetSource(target) {
	switch (target.kind) {
		case "project": return MANIFEST_PATH;
		case "characters": return ".ai-novel/characters.json";
		case "story-blueprint": return ".ai-novel/blueprints/story.json";
		case "chapter-blueprint": return `.ai-novel/blueprints/chapters/${chapterName(target.chapter)}.json`;
		case "chapter-draft": return `chapters/${chapterName(target.chapter)}.md`;
		default: return assertNever(target);
	}
}
function chapterName(chapter) {
	if (!Number.isSafeInteger(chapter) || chapter < 1 || chapter > 9999) throw new NovelProjectError("PATH_REJECTED", "chapter must be an integer between 1 and 9999");
	return chapter.toString().padStart(4, "0");
}
/** Filesystem implementation whose only mutation is an atomic single-asset commit. */
var FileNovelProject = class {
	#root;
	#assetLimit;
	#workingSetLimit;
	#queryLimit;
	constructor(root, options) {
		if (!isAbsolute(root)) throw new NovelProjectError("PATH_REJECTED", "workspace root must be absolute");
		this.#root = resolve(root);
		this.#assetLimit = options.assetBytes;
		this.#workingSetLimit = options.workingSetBytes;
		this.#queryLimit = options.queryMatches;
	}
	async read(request, signal) {
		requireNotAborted(signal);
		await this.#requireCanonicalRoot();
		await this.#readManifest(signal);
		switch (request.kind) {
			case "asset": return this.#readAsset(request.target, signal);
			case "working-set": return this.#readWorkingSet(request.chapter, signal);
			case "query": return this.#query(request.text, request.limit, signal);
			default: return assertNever(request);
		}
	}
	async apply(request, signal) {
		requireNotAborted(signal);
		const root = await this.#requireCanonicalRoot();
		if (request.kind === "replace") return this.#replace(root, request, signal);
		const text = canonicalNovelInitialization(request);
		const manifest = parseManifest(text);
		const bytes = Buffer.byteLength(text, "utf8");
		if (bytes > this.#assetLimit) throw new NovelProjectError("SIZE_LIMIT_EXCEEDED", `asset exceeds ${this.#assetLimit} bytes`);
		const projectDir = join(root, PROJECT_DIR);
		await this.#rejectSymlinkChain(projectDir);
		await mkdir(projectDir, {
			recursive: true,
			mode: 448
		});
		await this.#rejectSymlinkChain(projectDir);
		const filename = join(root, MANIFEST_PATH);
		return withFileLock(filename, async () => {
			requireNotAborted(signal);
			if (await this.#exists(filename)) throw new NovelProjectError("ALREADY_INITIALIZED", "novel project is already initialized");
			requireNotAborted(signal);
			try {
				await writeFileAtomic(filename, text, {
					mode: 384,
					dirMode: 448
				});
			} catch (cause) {
				throw new NovelProjectError("WRITE_FAILED", "failed to initialize novel project", { cause });
			}
			return {
				projectId: manifest.projectId,
				target: { kind: "project" },
				oldRevision: "absent",
				newRevision: revisionOf(text),
				bytes
			};
		});
	}
	async #replace(root, request, signal) {
		requireNonEmpty(request.summary, "summary");
		if (request.baseRevision !== "absent" && !/^[a-f0-9]{64}$/.test(request.baseRevision)) throw new NovelProjectError("INVALID_CONTENT", "baseRevision must be absent or a SHA-256 digest");
		const manifest = await this.#readManifest(signal);
		const nextText = normalizeAssetContent(request.target, request.replacement, manifest);
		const bytes = Buffer.byteLength(nextText, "utf8");
		if (bytes > this.#assetLimit) throw new NovelProjectError("SIZE_LIMIT_EXCEEDED", `asset exceeds ${this.#assetLimit} bytes`);
		const source = novelAssetSource(request.target);
		const filename = join(root, source);
		const parent = resolve(filename, "..");
		if (!revisionMatches(await this.#readAsset(request.target, signal), request)) throw new NovelProjectError("STALE_REVISION", `${source} changed since it was read`);
		await this.#rejectSymlinkChain(parent);
		await mkdir(parent, {
			recursive: true,
			mode: 448
		});
		await this.#rejectSymlinkChain(parent);
		try {
			return await withFileLock(filename, async () => {
				requireNotAborted(signal);
				const current = await this.#readAsset(request.target, signal);
				if (!revisionMatches(current, request)) throw new NovelProjectError("STALE_REVISION", `${source} changed since it was read`);
				requireNotAborted(signal);
				try {
					await writeFileAtomic(filename, nextText, {
						mode: 384,
						dirMode: 448
					});
				} catch (cause) {
					throw new NovelProjectError("WRITE_FAILED", `failed to replace ${source}`, { cause });
				}
				return {
					projectId: manifest.projectId,
					target: request.target,
					oldRevision: current.revision,
					newRevision: revisionOf(nextText),
					bytes
				};
			});
		} catch (cause) {
			if (cause instanceof NovelProjectError) throw cause;
			throw new NovelProjectError("WRITE_FAILED", `failed to coordinate replacement of ${source}`, { cause });
		}
	}
	async #readAsset(target, signal) {
		const source = novelAssetSource(target);
		const filename = join(this.#root, source);
		requireNotAborted(signal);
		let text;
		try {
			await this.#rejectSymlinkChain(filename);
			text = normalizeText(await readFile(filename, {
				encoding: "utf8",
				signal
			}));
		} catch (cause) {
			if (this.#isMissing(cause)) {
				if (target.kind === "project") throw new NovelProjectError("NOT_INITIALIZED", "novel project is not initialized", { cause });
				return {
					kind: "asset",
					target,
					source,
					revision: "absent",
					text: "",
					bytes: 0,
					truncated: false,
					omitted: false
				};
			}
			if (cause instanceof NovelProjectError) throw cause;
			throw new NovelProjectError("INVALID_CONTENT", `failed to read ${source}`, { cause });
		}
		validateAssetText(target, text);
		const bytes = Buffer.byteLength(text, "utf8");
		if (bytes > this.#assetLimit) throw new NovelProjectError("SIZE_LIMIT_EXCEEDED", `${source} exceeds ${this.#assetLimit} bytes`);
		return {
			kind: "asset",
			target,
			source,
			revision: revisionOf(text),
			text,
			bytes,
			truncated: false,
			omitted: false
		};
	}
	async #readWorkingSet(chapter, signal) {
		if (chapter !== void 0) chapterName(chapter);
		const targets = [
			{ kind: "project" },
			{ kind: "characters" },
			{ kind: "story-blueprint" }
		];
		if (chapter !== void 0) targets.push({
			kind: "chapter-blueprint",
			chapter
		}, {
			kind: "chapter-draft",
			chapter
		});
		const assets = [];
		const omittedSources = [];
		let bytes = 0;
		for (const target of targets) {
			requireNotAborted(signal);
			const asset = await this.#readAsset(target, signal);
			const remaining = this.#workingSetLimit - bytes;
			if (remaining <= 0) {
				omittedSources.push(asset.source);
				continue;
			}
			const returnedText = truncateUtf8(asset.text, remaining);
			const returnedBytes = Buffer.byteLength(returnedText, "utf8");
			const truncated = returnedBytes < asset.bytes;
			assets.push({
				...asset,
				text: returnedText,
				truncated
			});
			bytes += returnedBytes;
			if (truncated) {
				for (const later of targets.slice(targets.indexOf(target) + 1)) omittedSources.push(novelAssetSource(later));
				break;
			}
		}
		return {
			kind: "working-set",
			assets,
			bytes,
			truncated: omittedSources.length > 0 || assets.some((asset) => asset.truncated),
			omittedSources
		};
	}
	async #query(text, requestedLimit, signal) {
		requireNonEmpty(text, "query text");
		if (requestedLimit !== void 0) requireLimit(requestedLimit, "query limit");
		const limit = Math.min(requestedLimit ?? this.#queryLimit, this.#queryLimit);
		const matches = [];
		let truncated = false;
		let limitReached = false;
		for (const target of await this.#queryTargets()) {
			requireNotAborted(signal);
			const asset = await this.#readAsset(target, signal);
			if (asset.revision === "absent") continue;
			if (asset.truncated) truncated = true;
			for (const line of asset.text.split("\n")) {
				if (!line.toLocaleLowerCase().includes(text.toLocaleLowerCase())) continue;
				if (matches.length >= limit) {
					truncated = true;
					limitReached = true;
					break;
				}
				const excerptTruncated = line.length > 240;
				matches.push({
					source: asset.source,
					revision: asset.revision,
					excerpt: line.slice(0, 240),
					truncated: excerptTruncated
				});
				if (excerptTruncated) truncated = true;
			}
			if (limitReached) break;
		}
		return {
			kind: "query",
			matches,
			truncated
		};
	}
	async #queryTargets() {
		const targets = [
			{ kind: "project" },
			{ kind: "characters" },
			{ kind: "story-blueprint" }
		];
		const blueprints = await this.#numberedAssets(join(this.#root, ".ai-novel", "blueprints", "chapters"), ".json");
		const drafts = await this.#numberedAssets(join(this.#root, "chapters"), ".md");
		for (const chapter of blueprints) targets.push({
			kind: "chapter-blueprint",
			chapter
		});
		for (const chapter of drafts) targets.push({
			kind: "chapter-draft",
			chapter
		});
		return targets;
	}
	async #numberedAssets(directory, extension) {
		try {
			await this.#rejectSymlinkChain(directory);
			return (await readdir(directory, { withFileTypes: true })).filter((entry) => entry.isFile() && new RegExp(`^[0-9]{4}\\${extension}$`).test(entry.name)).map((entry) => Number.parseInt(entry.name.slice(0, 4), 10)).sort((left, right) => left - right);
		} catch (cause) {
			if (this.#isMissing(cause)) return [];
			throw cause;
		}
	}
	async #readManifest(signal) {
		return parseManifest((await this.#readAsset({ kind: "project" }, signal)).text);
	}
	async #requireCanonicalRoot() {
		let canonical;
		try {
			canonical = await realpath(this.#root);
		} catch (cause) {
			throw new NovelProjectError("PATH_REJECTED", "workspace root does not exist", { cause });
		}
		const rel = relative(this.#root, canonical);
		if (rel !== "" && (rel === ".." || rel.startsWith(`..${sep}`))) throw new NovelProjectError("PATH_REJECTED", "workspace root resolves outside its configured path");
		return canonical;
	}
	async #rejectSymlink(path) {
		try {
			if ((await lstat(path)).isSymbolicLink()) throw new NovelProjectError("PATH_REJECTED", `symbolic link is not allowed: ${path}`);
		} catch (cause) {
			if (this.#isMissing(cause)) return;
			throw cause;
		}
	}
	async #rejectSymlinkChain(path) {
		const target = resolve(path);
		const rel = relative(this.#root, target);
		if (rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel)) throw new NovelProjectError("PATH_REJECTED", `path escapes the workspace root: ${path}`);
		let current = this.#root;
		if (rel === "") {
			await this.#rejectSymlink(current);
			return;
		}
		for (const segment of rel.split(sep)) {
			current = join(current, segment);
			try {
				await this.#rejectSymlink(current);
			} catch (cause) {
				if (this.#isMissing(cause)) return;
				throw cause;
			}
			if (!await this.#exists(current)) return;
		}
	}
	async #exists(path) {
		try {
			await lstat(path);
			return true;
		} catch (cause) {
			if (this.#isMissing(cause)) return false;
			throw cause;
		}
	}
	#isMissing(cause) {
		return typeof cause === "object" && cause !== null && "code" in cause && cause.code === "ENOENT";
	}
};
/**
* Open the filesystem-backed implementation for a Harness workspace.
*
* @param root Absolute workspace directory; the project may be initialized after opening.
* @param options Validated read, write, working-set, and query limits.
* @returns A project implementation that performs bounded reads and atomic single-asset writes.
* @throws {@link NovelProjectError} when the root or a configured limit is invalid.
*/
function openNovelProject(root, options = {}) {
	const resolved = {
		assetBytes: options.assetBytes ?? DEFAULT_ASSET_LIMIT,
		workingSetBytes: options.workingSetBytes ?? DEFAULT_WORKING_SET_LIMIT,
		queryMatches: options.queryMatches ?? DEFAULT_QUERY_LIMIT
	};
	requireLimit(resolved.assetBytes, "assetBytes");
	requireLimit(resolved.workingSetBytes, "workingSetBytes");
	requireLimit(resolved.queryMatches, "queryMatches");
	if (resolved.queryMatches > DEFAULT_QUERY_LIMIT) throw new NovelProjectError("INVALID_CONTENT", `queryMatches must not exceed ${DEFAULT_QUERY_LIMIT}`);
	return new FileNovelProject(root, resolved);
}
//#endregion
//#region src/agent.ts
const DEFAULT_ASSET_BYTES = 524288;
const DEFAULT_WORKING_SET_BYTES = 524288;
const DEFAULT_QUERY_MATCHES = 20;
const NOVEL_PRESET_ID = "ai-novel-writer";
const NOVEL_TOOL_NAMES = /* @__PURE__ */ new Set(["novel_read", "novel_apply_change"]);
/** Fail-loud validation and defaults for deployment-varying tool bounds. */
const Config = z.object({
	assetBytes: z.number().step(1).min(1).default(DEFAULT_ASSET_BYTES),
	workingSetBytes: z.number().step(1).min(1).default(DEFAULT_WORKING_SET_BYTES),
	queryMatches: z.number().step(1).min(1).max(20).default(DEFAULT_QUERY_MATCHES)
});
const TARGET_KINDS = [
	"project",
	"characters",
	"story-blueprint",
	"chapter-blueprint",
	"chapter-draft"
];
const CREATIVE_STRATEGIES = [
	"auto",
	"fluent-drafting",
	"consistency-first",
	"deep-planning"
];
/** Keep inherited host plugins out of every agent composed from the dedicated novel Preset. */
function installDedicatedPresetSurface(ctx) {
	ctx.inject(["agentPresets"], (presetCtx) => {
		const installed = /* @__PURE__ */ new Map();
		const owns = (agent) => agent !== void 0 && presetCtx.agentPresets.composedPreset(agent.ctx) === NOVEL_PRESET_ID;
		const install = (agent) => {
			if (installed.has(agent)) return;
			const disposeRestriction = agent.ctx.tools.restrict({ allow: ["novel_read", "novel_apply_change"] });
			let disposeOwner = () => void 0;
			let agentDisposing = false;
			const disposeAgentCleanup = agent.ctx.effect(() => () => {
				installed.delete(agent);
				agentDisposing = true;
				try {
					disposeOwner();
				} finally {
					agentDisposing = false;
				}
			}, "dsh-ai-novel-writer.agent-surface-agent-lifecycle");
			disposeOwner = presetCtx.effect(() => () => {
				if (!agentDisposing) disposeAgentCleanup();
				disposeRestriction();
				installed.delete(agent);
			}, "dsh-ai-novel-writer.agent-surface-isolation");
			installed.set(agent, disposeOwner);
		};
		presetCtx.on("system-prompt/assemble", async (_assembly, context, next) => {
			const result = await next();
			if (!owns(context.agent)) return result;
			const tools = result.tools.filter((tool) => NOVEL_TOOL_NAMES.has(tool.name));
			if (tools.length !== NOVEL_TOOL_NAMES.size || tools.some((tool, index) => tools.findIndex((candidate) => candidate.name === tool.name) !== index)) throw new Error("AI 小说作家 requires exactly novel_read and novel_apply_change in every model request");
			return {
				...result,
				tools
			};
		}, {
			prepend: true,
			global: true
		});
		presetCtx.on("tools/pre-execute", (exec, next) => {
			if (!owns(exec.agent) || NOVEL_TOOL_NAMES.has(exec.name)) return next();
			return Promise.resolve({
				kind: "deny",
				reason: "AI 小说作家 is dedicated to novel_read and novel_apply_change"
			});
		}, {
			prepend: true,
			global: true
		});
		presetCtx.on("agent/created", ({ agent }) => {
			if (owns(agent)) install(agent);
		}, { global: true });
		presetCtx.on("agent-preset/selected", (sessionId) => {
			const agent = presetCtx.agents.get(sessionId);
			if (owns(agent)) install(agent);
		}, { global: true });
	});
}
const readParameters = {
	kind: {
		type: "string",
		enum: [
			"asset",
			"working-set",
			"query"
		],
		required: true
	},
	targetKind: {
		type: "string",
		enum: TARGET_KINDS
	},
	chapter: { type: "integer" },
	text: { type: "string" },
	limit: { type: "integer" }
};
const applyParameters = {
	kind: {
		type: "string",
		enum: ["initialize", "replace"],
		required: true,
		description: "Use initialize only after novel_read reports NOT_INITIALIZED. Otherwise use replace."
	},
	targetKind: {
		type: "string",
		enum: TARGET_KINDS,
		description: "Required only when kind is replace. Forbidden when kind is initialize."
	},
	chapter: {
		type: "integer",
		description: "Required only for a replace whose targetKind is chapter-blueprint or chapter-draft."
	},
	projectId: {
		type: "string",
		description: "Required only when kind is initialize. Forbidden when kind is replace."
	},
	title: {
		type: "string",
		description: "Required only when kind is initialize. Forbidden when kind is replace."
	},
	language: {
		type: "string",
		description: "Required only when kind is initialize. Forbidden when kind is replace."
	},
	genre: {
		type: "string",
		description: "Required only when kind is initialize. Forbidden when kind is replace."
	},
	plannedChapters: {
		type: "integer",
		description: "Required only when kind is initialize. Forbidden when kind is replace."
	},
	targetWordsPerChapter: {
		type: "integer",
		description: "Required only when kind is initialize. Forbidden when kind is replace."
	},
	creativeStrategy: {
		type: "string",
		enum: CREATIVE_STRATEGIES,
		description: "Required only when kind is initialize. Forbidden when kind is replace."
	},
	createdAt: {
		type: "string",
		description: "Required only when kind is initialize. Use canonical UTC YYYY-MM-DDTHH:mm:ss.sssZ, including milliseconds. Forbidden when kind is replace."
	},
	updatedAt: {
		type: "string",
		description: "Required only when kind is initialize. Use the exact same canonical UTC YYYY-MM-DDTHH:mm:ss.sssZ value as createdAt. Forbidden when kind is replace."
	},
	baseRevision: {
		type: "string",
		description: "Required only when kind is replace. Copy the revision from novel_read; use absent for a missing non-manifest asset."
	},
	replacement: {
		type: "string",
		description: "Required only when kind is replace. The complete replacement text for exactly one asset."
	},
	summary: {
		type: "string",
		description: "Required only when kind is replace. A concise description for the approval diff."
	}
};
function invalid(message) {
	throw new ToolArgsError([message]);
}
function requiredString(args, name) {
	const value = args[name];
	return typeof value === "string" ? value : invalid(`missing required property "${name}"`);
}
function requiredInteger(args, name) {
	const value = args[name];
	return Number.isInteger(value) ? value : invalid(`missing required property "${name}"`);
}
function rejectUnexpected(args, allowed) {
	const unexpected = Object.keys(args).filter((key) => !allowed.includes(key));
	if (unexpected.length > 0) invalid(`unexpected propert${unexpected.length === 1 ? "y" : "ies"} ${unexpected.map((key) => `"${key}"`).join(", ")}`);
}
function targetFrom(args) {
	const targetKind = requiredString(args, "targetKind");
	if (targetKind === "chapter-blueprint" || targetKind === "chapter-draft") return {
		kind: targetKind,
		chapter: requiredInteger(args, "chapter")
	};
	if (targetKind === "project" || targetKind === "characters" || targetKind === "story-blueprint") {
		if (args.chapter !== void 0) invalid("property \"chapter\" is only valid for chapter assets");
		return { kind: targetKind };
	}
	return invalid("property \"targetKind\" must name a supported novel asset");
}
function parseReadRequest(args) {
	if (args.kind === "asset") {
		rejectUnexpected(args, [
			"kind",
			"targetKind",
			"chapter"
		]);
		return {
			kind: "asset",
			target: targetFrom(args)
		};
	}
	if (args.kind === "working-set") {
		rejectUnexpected(args, ["kind", "chapter"]);
		return args.chapter === void 0 ? { kind: "working-set" } : {
			kind: "working-set",
			chapter: requiredInteger(args, "chapter")
		};
	}
	if (args.kind === "query") {
		rejectUnexpected(args, [
			"kind",
			"text",
			"limit"
		]);
		const text = requiredString(args, "text");
		return args.limit === void 0 ? {
			kind: "query",
			text
		} : {
			kind: "query",
			text,
			limit: requiredInteger(args, "limit")
		};
	}
	return invalid("property \"kind\" must be \"asset\", \"working-set\", or \"query\"");
}
function parseApplyRequest(args) {
	if (args.kind === "initialize") {
		rejectUnexpected(args, [
			"kind",
			"projectId",
			"title",
			"language",
			"genre",
			"plannedChapters",
			"targetWordsPerChapter",
			"creativeStrategy",
			"createdAt",
			"updatedAt"
		]);
		return {
			kind: "initialize",
			projectId: requiredString(args, "projectId"),
			title: requiredString(args, "title"),
			language: requiredString(args, "language"),
			genre: requiredString(args, "genre"),
			plannedChapters: requiredInteger(args, "plannedChapters"),
			targetWordsPerChapter: requiredInteger(args, "targetWordsPerChapter"),
			creativeStrategy: requiredString(args, "creativeStrategy"),
			createdAt: requiredString(args, "createdAt"),
			updatedAt: requiredString(args, "updatedAt")
		};
	}
	if (args.kind === "replace") {
		rejectUnexpected(args, [
			"kind",
			"targetKind",
			"chapter",
			"baseRevision",
			"replacement",
			"summary"
		]);
		return {
			kind: "replace",
			target: targetFrom(args),
			baseRevision: requiredString(args, "baseRevision"),
			replacement: requiredString(args, "replacement"),
			summary: requiredString(args, "summary")
		};
	}
	return invalid("property \"kind\" must be \"initialize\" or \"replace\"");
}
function resolvedOptions(config) {
	return {
		assetBytes: config.assetBytes ?? DEFAULT_ASSET_BYTES,
		workingSetBytes: config.workingSetBytes ?? DEFAULT_WORKING_SET_BYTES,
		queryMatches: config.queryMatches ?? DEFAULT_QUERY_MATCHES
	};
}
function workspaceRoot(agent) {
	const cwd = agent?.session.header.cwd;
	if (cwd === void 0) throw new Error("AI novel tools require a session with a workspace cwd");
	return cwd;
}
function normalizeLineEndings(text) {
	return text.replace(/\r\n?/g, "\n");
}
function displayReplacement(target, text) {
	const normalized = normalizeLineEndings(text);
	try {
		return canonicalNovelAssetText(target, normalized);
	} catch {
		return normalized;
	}
}
function initializePreview(request) {
	return canonicalNovelInitialization(request);
}
function commitReceiptMeta(value) {
	if (typeof value !== "object" || value === null || Array.isArray(value)) return {};
	const newRevision = value.newRevision;
	return typeof newRevision === "string" && /^[0-9a-f]{64}$/.test(newRevision) ? { newRevision } : {};
}
/**
* Render one proposed mutation as a deterministic Harness diff card.
*
* @param request Initialization or one-asset replacement proposed by the model.
* @returns A presentation containing the affected project-relative location and complete final text.
*/
function presentNovelChange(request) {
	if (request.kind === "initialize") return {
		card: "diff",
		title: `创建小说项目：${request.title}`,
		diffs: [{
			path: ".ai-novel/project.json",
			oldText: null,
			newText: initializePreview(request)
		}],
		locations: [{ path: ".ai-novel/project.json" }]
	};
	const path = novelAssetSource(request.target);
	return {
		card: "diff",
		title: request.summary,
		diffs: [{
			path,
			oldText: null,
			newText: displayReplacement(request.target, request.replacement)
		}],
		locations: [{ path }]
	};
}
/**
* Require native approval for the mutation tool and delegate every other tool decision.
*
* @param exec Tool execution identity.
* @param next Remaining scoped approval listeners.
* @returns An approval request for `novel_apply_change`, otherwise the delegated decision.
*/
function novelApprovalGate(exec, next) {
	if (exec.name !== "novel_apply_change") return next();
	return Promise.resolve({
		kind: "ask",
		reason: "批准后仅修改这一个小说资产。"
	});
}
/**
* Construct the two model-visible novel tool definitions.
*
* @param config Deployment-specific read, write, working-set, and query limits.
* @returns The read tool followed by the approval-gated single-asset mutation tool.
*/
function createNovelToolDefinitions(config = {}) {
	const options = resolvedOptions(config);
	return [defineTool({
		name: "novel_read",
		description: "Read a bounded, revisioned projection of the current Harness novel project. Pass kind and its branch fields directly; do not nest or stringify them.",
		parameters: readParameters,
		output: {
			schema: { type: "json" },
			render: (_args, value) => [{
				type: "text",
				text: JSON.stringify(value, null, 2)
			}]
		},
		isConcurrencySafe: () => true,
		async execute(args, exec) {
			const request = parseReadRequest(args);
			return await openNovelProject(workspaceRoot(exec.agent), options).read(request, exec.signal);
		},
		presentCall: (args) => {
			const request = parseReadRequest(args);
			return {
				card: "generic",
				title: request.kind === "query" ? "查询小说上下文" : "读取小说上下文",
				kind: request.kind === "query" ? "search" : "read",
				rawInput: request
			};
		}
	}), defineTool({
		name: "novel_apply_change",
		description: "Propose one revision-checked novel asset change with shallow arguments. Use initialize only when novel_read reports NOT_INITIALIZED. For every existing project, including project-setting changes, use replace. Missing non-manifest assets also use replace with baseRevision absent. Never mix branch fields: initialize fields: kind, projectId, title, language, genre, plannedChapters, targetWordsPerChapter, creativeStrategy, createdAt, updatedAt; replace fields: kind, targetKind, chapter only for chapter assets, baseRevision, replacement, summary. Native user approval is required before execution.",
		parameters: applyParameters,
		output: {
			schema: { type: "json" },
			render: (_args, value) => [{
				type: "text",
				text: JSON.stringify(value, null, 2)
			}],
			presentationMeta: (_args, value) => commitReceiptMeta(value)
		},
		async execute(args, exec) {
			const request = parseApplyRequest(args);
			return await openNovelProject(workspaceRoot(exec.agent), options).apply(request, exec.signal);
		},
		presentCall: (args) => presentNovelChange(parseApplyRequest(args)),
		presentResult: (args, result) => result.isError ? {
			card: "generic",
			content: result.content
		} : presentNovelChange(parseApplyRequest(args))
	})];
}
/** Stable Cordis plugin name. */
const name = "dsh-ai-novel-writer-agent";
/** Required host services for agent lookup, scoped tools, prompt projection, and policy. */
const inject = [
	"agents",
	"systemPrompt",
	"tools"
];
/**
* Register the two domain tools and their mandatory one-shot approval policy.
*
* @param ctx Agent preset scope that owns registrations and lifecycle cleanup.
* @param config Deployment-specific read, write, working-set, and query limits.
* @returns Nothing.
*/
function apply(ctx, config = {}) {
	for (const definition of createNovelToolDefinitions(config)) ctx.tools.register(definition);
	installDedicatedPresetSurface(ctx);
	ctx.on("tools/pre-execute", (exec, next) => novelApprovalGate(exec, next));
}
//#endregion
export { Config, apply, createNovelToolDefinitions, inject, name, novelApprovalGate, presentNovelChange };
