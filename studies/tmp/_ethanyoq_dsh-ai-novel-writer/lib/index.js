import { fileURLToPath } from "node:url";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { dshHomePath } from "@deepseek-ai/dsh-home-paths";
import { WorkspaceId } from "@deepseek-ai/dsh-workspace";
import z from "@deepseek-ai/schemastery";
import { createHash } from "node:crypto";
import { lstat, mkdir, mkdtemp, readFile, readdir, realpath, rename, rm } from "node:fs/promises";
import { withFileLock, writeFileAtomic } from "@deepseek-ai/dsh-atomic-write";
import { HarnessError, assertNever } from "@deepseek-ai/dsh-llm";
//#region src/context-types.ts
function recordOf(value, keys) {
	if (typeof value !== "object" || value === null || Array.isArray(value)) throw invalidResponse();
	const record = value;
	if (Object.keys(record).sort().join("\0") !== [...keys].sort().join("\0")) throw invalidResponse();
	return record;
}
function invalidResponse() {
	return /* @__PURE__ */ new Error("AI novel context response is invalid");
}
function integerOf(value, minimum = 0) {
	if (!Number.isSafeInteger(value) || Number(value) < minimum) throw invalidResponse();
	return value;
}
/**
* Validate one untrusted discriminated asset reference at a wire boundary.
*
* @param value Unknown target received from Host RPC or browser transport.
* @returns One recognized project-owned asset reference with no path fields.
* @throws {Error} When the discriminant, chapter, or exact property set is invalid.
*/
function parseNovelAssetRef(value) {
	if (typeof value !== "object" || value === null || Array.isArray(value)) throw invalidResponse();
	const kind = value.kind;
	switch (kind) {
		case "project":
		case "characters":
		case "story-blueprint":
			recordOf(value, ["kind"]);
			return { kind };
		case "chapter-blueprint":
		case "chapter-draft": return {
			kind,
			chapter: integerOf(recordOf(value, ["kind", "chapter"]).chapter, 1)
		};
		default: throw invalidResponse();
	}
}
//#endregion
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
//#region src/context-window.ts
/** Host-side projection for the read-only novel context window. */
function parseObject(asset) {
	if (asset.revision === "absent" || asset.truncated) return void 0;
	return JSON.parse(asset.text);
}
function charactersOf(asset) {
	if (asset === void 0) return [];
	const value = parseObject(asset);
	if (value === void 0) return [];
	return value.characters.map((character) => ({
		id: character.id,
		name: character.name,
		role: character.role,
		summary: character.summary
	}));
}
function storyOf(asset) {
	if (asset === void 0) return null;
	const value = parseObject(asset);
	if (value === void 0) return null;
	return {
		premise: value.premise,
		themes: value.themes,
		world: value.world,
		mainPlot: value.mainPlot,
		endingGoal: value.endingGoal
	};
}
function chapterOf(asset) {
	if (asset === void 0) return null;
	const value = parseObject(asset);
	if (value === void 0) return null;
	return {
		chapter: value.chapter,
		title: value.title,
		purpose: value.purpose,
		beats: value.beats,
		characterIds: value.characterIds,
		continuityNotes: value.continuityNotes,
		status: value.status
	};
}
/**
* Read one exact project-owned asset without exposing its filesystem source.
*
* @param root Canonical Workspace directory resolved by the Host registry.
* @param target Recognized asset identity with no caller-provided path segment.
* @param signal Cancellation signal propagated to the domain read.
* @returns Normalized text, revision, byte count, and the recognized target.
* @throws {@link NovelProjectError} when the project or asset is invalid, unsafe, over budget, or cancelled.
*/
async function readNovelAsset(root, target, signal) {
	const result = await openNovelProject(root).read({
		kind: "asset",
		target
	}, signal);
	if (result.kind !== "asset") throw new Error("NovelProject returned a non-asset exact read result");
	return {
		target: result.target,
		revision: result.revision,
		text: result.text,
		bytes: result.bytes
	};
}
/**
* Read one Workspace's bounded, non-mutating novel context projection.
*
* @param root Canonical Workspace directory resolved by the Host registry.
* @param chapter Selected one-based chapter number.
* @param signal Cancellation signal propagated through every project read.
* @returns An initialized projection or an explicit not-initialized result.
* @throws {@link NovelProjectError} when the project is invalid, unsafe, over budget, cancelled, or the chapter is outside the plan.
*/
async function readNovelContext(root, chapter, signal) {
	const project = openNovelProject(root);
	let manifestAsset;
	try {
		const result = await project.read({
			kind: "asset",
			target: { kind: "project" }
		}, signal);
		if (result.kind !== "asset") throw new Error("NovelProject returned a non-asset manifest result");
		manifestAsset = result;
	} catch (error) {
		if (error instanceof NovelProjectError && error.code === "NOT_INITIALIZED") return { status: "not-initialized" };
		throw error;
	}
	const manifest = JSON.parse(manifestAsset.text);
	const plannedChapters = manifest.plannedChapters;
	if (!Number.isSafeInteger(chapter) || chapter <= 0 || chapter > plannedChapters) throw new NovelProjectError("INVALID_CONTENT", `chapter must be between 1 and ${plannedChapters}`);
	const result = await project.read({
		kind: "working-set",
		chapter
	}, signal);
	if (result.kind !== "working-set") throw new Error("NovelProject returned a non-working-set context result");
	const bySource = new Map(result.assets.map((asset) => [asset.source, asset]));
	const charactersAsset = bySource.get(".ai-novel/characters.json");
	const storyAsset = bySource.get(".ai-novel/blueprints/story.json");
	const chapterName = String(chapter).padStart(4, "0");
	const chapterAsset = bySource.get(`.ai-novel/blueprints/chapters/${chapterName}.json`);
	const draftAsset = bySource.get(`chapters/${chapterName}.md`);
	const chapterBlueprint = chapterOf(chapterAsset);
	const draftPresent = draftAsset !== void 0 && draftAsset.revision !== "absent";
	const omittedSources = [.../* @__PURE__ */ new Set([...result.omittedSources, ...result.assets.filter((asset) => asset.truncated).map((asset) => asset.source)])];
	return {
		status: "ready",
		project: {
			projectId: manifest.projectId,
			title: manifest.title,
			language: manifest.language,
			genre: manifest.genre,
			plannedChapters,
			targetWordsPerChapter: manifest.targetWordsPerChapter,
			creativeStrategy: manifest.creativeStrategy,
			updatedAt: manifest.updatedAt
		},
		progress: {
			selectedChapter: chapter,
			plannedChapters,
			status: chapterBlueprint?.status ?? "unplanned",
			draftPresent,
			draftBytes: draftPresent ? draftAsset.bytes : 0
		},
		characters: charactersOf(charactersAsset),
		storyBlueprint: storyOf(storyAsset),
		chapterBlueprint,
		draft: draftPresent ? {
			revision: draftAsset.revision,
			preview: draftAsset.text,
			bytes: draftAsset.bytes,
			truncated: draftAsset.truncated
		} : null,
		omittedSources
	};
}
//#endregion
//#region src/preset-installer.ts
const PRESET_DIRECTORY = "ai-novel-writer";
const PRESET_FILES = ["agent.cordis.yml", "preset.yml"];
function throwIfAborted(signal) {
	signal?.throwIfAborted();
}
function isMissing(error) {
	return error instanceof Error && "code" in error && error.code === "ENOENT";
}
async function inspectTarget(templateRoot, targetRoot, signal) {
	throwIfAborted(signal);
	let targetStat;
	try {
		targetStat = await lstat(targetRoot);
	} catch (error) {
		if (isMissing(error)) return { status: "not-installed" };
		throw error;
	}
	if (!targetStat.isDirectory() || targetStat.isSymbolicLink()) return { status: "conflict" };
	const entries = (await readdir(targetRoot)).sort();
	if (entries.length !== PRESET_FILES.length || entries.some((entry, index) => entry !== PRESET_FILES[index])) return { status: "conflict" };
	for (const filename of PRESET_FILES) {
		throwIfAborted(signal);
		const entry = await lstat(join(targetRoot, filename));
		if (!entry.isFile() || entry.isSymbolicLink()) return { status: "conflict" };
		const [expected, actual] = await Promise.all([readFile(join(templateRoot, filename)), readFile(join(targetRoot, filename))]);
		if (!expected.equals(actual)) return { status: "conflict" };
	}
	return { status: "installed" };
}
/**
* Create the package preset installer for one configured user preset root.
*
* @param templateRoot Absolute directory containing the immutable package preset.
* @param presetRoot Absolute user preset root selected by Host configuration.
* @returns An installer that never overwrites an existing target.
* @throws {TypeError} When either root is not absolute.
*/
function createPresetInstaller(templateRoot, presetRoot) {
	if (!isAbsolute(templateRoot) || !isAbsolute(presetRoot)) throw new TypeError("Preset template and destination roots must be absolute");
	const targetRoot = join(presetRoot, PRESET_DIRECTORY);
	return {
		status: (signal) => inspectTarget(templateRoot, targetRoot, signal),
		async install(signal) {
			const initial = await inspectTarget(templateRoot, targetRoot, signal);
			if (initial.status !== "not-installed") return {
				status: initial.status,
				changed: false
			};
			await mkdir(presetRoot, {
				recursive: true,
				mode: 448
			});
			const stagingRoot = await mkdtemp(join(presetRoot, `.${PRESET_DIRECTORY}-`));
			let published = false;
			try {
				for (const filename of PRESET_FILES) {
					throwIfAborted(signal);
					const contents = await readFile(join(templateRoot, filename), "utf8");
					await writeFileAtomic(join(stagingRoot, filename), contents, {
						mode: 384,
						dirMode: 448
					});
				}
				throwIfAborted(signal);
				try {
					await rename(stagingRoot, targetRoot);
					published = true;
					return {
						status: "installed",
						changed: true
					};
				} catch (error) {
					const raced = await inspectTarget(templateRoot, targetRoot, signal);
					if (raced.status === "not-installed") throw error;
					return {
						status: raced.status,
						changed: false
					};
				}
			} finally {
				if (!published) await rm(stagingRoot, {
					recursive: true,
					force: true
				});
			}
		}
	};
}
//#endregion
//#region src/index.ts
/** Host entry and public domain exports for the AI novel bundle. */
/** Stable Host plugin name used by Cordis diagnostics. */
const name = "dsh-ai-novel-writer";
/** Required Host services. */
const inject = ["connection", "workspaceRegistry"];
/** Host configuration schema. */
const Config = z.object({ presetRoot: z.string().default(dshHomePath(".agent-presets")) });
function templateRoot() {
	return join(dirname(fileURLToPath(import.meta.url)), "..", "presets", "ai-novel-writer");
}
function badRequest(message) {
	return {
		ok: false,
		error: {
			code: "bad-request",
			message,
			details: { issues: [] }
		}
	};
}
function internalFailure(message) {
	return {
		ok: false,
		error: {
			code: "internal",
			message,
			details: {}
		}
	};
}
function reportInternalFailure(report, error) {
	try {
		report(error);
	} catch (reportingError) {}
}
function isEmptyObject(value) {
	return typeof value === "object" && value !== null && Object.getPrototypeOf(value) === Object.prototype && Reflect.ownKeys(value).length === 0;
}
function contextRequest(value) {
	if (typeof value !== "object" || value === null || Array.isArray(value)) return void 0;
	const record = value;
	if (Object.keys(record).sort().join("\0") !== ["chapter", "workspaceId"].join("\0")) return void 0;
	if (typeof record.workspaceId !== "string" || record.workspaceId.trim() === "") return void 0;
	if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(record.workspaceId)) return void 0;
	if (!Number.isSafeInteger(record.chapter) || Number(record.chapter) <= 0) return void 0;
	return {
		workspaceId: WorkspaceId(record.workspaceId),
		chapter: record.chapter
	};
}
function assetRequest(value) {
	if (typeof value !== "object" || value === null || Array.isArray(value)) return void 0;
	const record = value;
	if (Object.keys(record).sort().join("\0") !== ["target", "workspaceId"].join("\0")) return void 0;
	if (typeof record.workspaceId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(record.workspaceId)) return void 0;
	try {
		return {
			workspaceId: WorkspaceId(record.workspaceId),
			target: parseNovelAssetRef(record.target)
		};
	} catch {
		return;
	}
}
/**
* Create the loopback preset setup RPC handler.
*
* @param installer Preset installer owned by the Host plugin instance.
* @param reportFailure Host-only diagnostic sink for underlying errors.
* @returns A handler for the two closed setup endpoints.
*/
function createPresetSetupRpcHandler(installer, reportFailure = () => {}) {
	return async (endpoint, payload, signal) => {
		if (!isEmptyObject(payload)) return badRequest("Preset setup payload must be an empty object");
		try {
			switch (endpoint) {
				case "preset/status": return {
					ok: true,
					value: await installer.status(signal)
				};
				case "preset/install": return {
					ok: true,
					value: await installer.install(signal)
				};
				default: return badRequest(`Unknown AI novel endpoint: ${endpoint}`);
			}
		} catch (error) {
			if (signal.aborted) return {
				ok: false,
				error: {
					code: "cancelled",
					message: "Preset setup request was cancelled",
					details: {}
				}
			};
			reportInternalFailure(reportFailure, error);
			return internalFailure("Preset setup request failed");
		}
	};
}
/**
* Create the complete loopback RPC handler for setup and read-only project context.
*
* @param installer Preset installer owned by the Host plugin instance.
* @param workspaces Authoritative Workspace registry read face.
* @param reportFailure Host-only diagnostic sink for underlying errors.
* @returns A handler whose read endpoints accept only opaque Workspace identity and recognized selectors.
*/
function createAiNovelRpcHandler(installer, workspaces, reportFailure = () => {}) {
	const setup = createPresetSetupRpcHandler(installer, reportFailure);
	return async (endpoint, payload, signal) => {
		if (endpoint === "preset/status" || endpoint === "preset/install") return setup(endpoint, payload, signal);
		if (endpoint !== "context/read" && endpoint !== "asset/read") return badRequest(`Unknown AI novel endpoint: ${endpoint}`);
		let workspaceId;
		let read;
		if (endpoint === "context/read") {
			const request = contextRequest(payload);
			if (request === void 0) return badRequest("Novel context payload must contain only a Workspace UUID and a positive chapter");
			workspaceId = request.workspaceId;
			read = (root) => readNovelContext(root, request.chapter, signal);
		} else {
			const request = assetRequest(payload);
			if (request === void 0) return badRequest("Novel asset payload must contain only a Workspace UUID and a recognized target");
			workspaceId = request.workspaceId;
			read = (root) => readNovelAsset(root, request.target, signal);
		}
		const workspace = workspaces.get(workspaceId);
		if (workspace === void 0) return badRequest(`Unknown Workspace: ${workspaceId}`);
		try {
			return {
				ok: true,
				value: await read(workspace.path)
			};
		} catch (error) {
			if (signal.aborted) return {
				ok: false,
				error: {
					code: "cancelled",
					message: endpoint === "context/read" ? "Novel context request was cancelled" : "Novel asset request was cancelled",
					details: {}
				}
			};
			reportInternalFailure(reportFailure, error);
			return internalFailure(endpoint === "context/read" ? "Novel context request failed" : "Novel asset request failed");
		}
	};
}
/**
* Register the loopback-only preset setup channel.
*
* @param ctx Host Cordis context with Connection available.
* @param config Resolved user preset root.
* @returns Nothing.
*/
function apply(ctx, config) {
	const presetRoot = config.presetRoot ?? dshHomePath(".agent-presets");
	const installer = createPresetInstaller(templateRoot(), presetRoot);
	const connection = ctx.get("connection");
	const workspaces = ctx.get("workspaceRegistry");
	ctx.effect(() => connection.rpc.handle("/ai-novel", createAiNovelRpcHandler(installer, workspaces, (error) => {
		ctx.logger.error("dsh-ai-novel-writer: request failed: %o", error);
	}), { authority: "loopback" }), "ai-novel-writer: setup and read-only context RPC");
}
//#endregion
export { Config, NovelProjectError, apply, createAiNovelRpcHandler, createPresetInstaller, createPresetSetupRpcHandler, inject, name, openNovelProject };
