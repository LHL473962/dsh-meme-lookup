window.__ModuleLoader__.load({
	id: "@ethanyoq/dsh-ai-novel-writer",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_dom = require("react-dom");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		let react_jsx_runtime = require("react/jsx-runtime");
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
		function stringOf(value) {
			if (typeof value !== "string") throw invalidResponse();
			return value;
		}
		function integerOf(value, minimum = 0) {
			if (!Number.isSafeInteger(value) || Number(value) < minimum) throw invalidResponse();
			return value;
		}
		function stringsOf(value) {
			if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) throw invalidResponse();
			return value;
		}
		function revisionOf(value) {
			if (value !== "absent" && (typeof value !== "string" || !/^[a-f0-9]{64}$/.test(value))) throw invalidResponse();
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
		/**
		* Validate one path-free exact asset response before it enters editable browser state.
		*
		* @param value Unknown response value from the generic Connection RPC client.
		* @returns Exact normalized text, revision, byte count, and recognized target.
		* @throws {Error} When any field or exact property set is invalid.
		*/
		function parseNovelAssetReadResult(value) {
			const record = recordOf(value, [
				"target",
				"revision",
				"text",
				"bytes"
			]);
			const text = stringOf(record.text);
			const bytes = integerOf(record.bytes);
			if (new TextEncoder().encode(text).byteLength !== bytes) throw invalidResponse();
			return {
				target: parseNovelAssetRef(record.target),
				revision: revisionOf(record.revision),
				text,
				bytes
			};
		}
		/**
		* Validate one untrusted loopback RPC value before it enters browser state.
		*
		* @param value Unknown response value from the generic Connection RPC client.
		* @returns A strict read-only novel context result with no path-bearing fields.
		* @throws {Error} When any required field, value, or exact property set is invalid.
		*/
		function parseNovelContextReadResult(value) {
			if (typeof value !== "object" || value === null || Array.isArray(value)) throw invalidResponse();
			const status = value.status;
			if (status === "not-initialized") {
				recordOf(value, ["status"]);
				return { status };
			}
			if (status !== "ready") throw invalidResponse();
			const root = recordOf(value, [
				"status",
				"project",
				"progress",
				"characters",
				"storyBlueprint",
				"chapterBlueprint",
				"draft",
				"omittedSources"
			]);
			const project = recordOf(root.project, [
				"projectId",
				"title",
				"language",
				"genre",
				"plannedChapters",
				"targetWordsPerChapter",
				"creativeStrategy",
				"updatedAt"
			]);
			if (![
				"auto",
				"fluent-drafting",
				"consistency-first",
				"deep-planning"
			].includes(project.creativeStrategy)) throw invalidResponse();
			const progress = recordOf(root.progress, [
				"selectedChapter",
				"plannedChapters",
				"status",
				"draftPresent",
				"draftBytes"
			]);
			const statuses = [
				"unplanned",
				"planned",
				"drafting",
				"drafted",
				"revised",
				"final"
			];
			if (!statuses.includes(progress.status)) throw invalidResponse();
			if (typeof progress.draftPresent !== "boolean") throw invalidResponse();
			if (!Array.isArray(root.characters)) throw invalidResponse();
			const characters = root.characters.map((value) => {
				const character = recordOf(value, [
					"id",
					"name",
					"role",
					"summary"
				]);
				return {
					id: stringOf(character.id),
					name: stringOf(character.name),
					role: stringOf(character.role),
					summary: stringOf(character.summary)
				};
			});
			const storyBlueprint = root.storyBlueprint === null ? null : (() => {
				const story = recordOf(root.storyBlueprint, [
					"premise",
					"themes",
					"world",
					"mainPlot",
					"endingGoal"
				]);
				return {
					premise: stringOf(story.premise),
					themes: stringsOf(story.themes),
					world: stringOf(story.world),
					mainPlot: stringOf(story.mainPlot),
					endingGoal: stringOf(story.endingGoal)
				};
			})();
			const chapterBlueprint = root.chapterBlueprint === null ? null : (() => {
				const chapter = recordOf(root.chapterBlueprint, [
					"chapter",
					"title",
					"purpose",
					"beats",
					"characterIds",
					"continuityNotes",
					"status"
				]);
				if (!statuses.slice(1).includes(chapter.status)) throw invalidResponse();
				return {
					chapter: integerOf(chapter.chapter, 1),
					title: stringOf(chapter.title),
					purpose: stringOf(chapter.purpose),
					beats: stringsOf(chapter.beats),
					characterIds: stringsOf(chapter.characterIds),
					continuityNotes: stringsOf(chapter.continuityNotes),
					status: chapter.status
				};
			})();
			const draft = root.draft === null ? null : (() => {
				const value = recordOf(root.draft, [
					"revision",
					"preview",
					"bytes",
					"truncated"
				]);
				if (typeof value.truncated !== "boolean") throw invalidResponse();
				return {
					revision: revisionOf(value.revision),
					preview: stringOf(value.preview),
					bytes: integerOf(value.bytes),
					truncated: value.truncated
				};
			})();
			const parsedProject = {
				projectId: stringOf(project.projectId),
				title: stringOf(project.title),
				language: stringOf(project.language),
				genre: stringOf(project.genre),
				plannedChapters: integerOf(project.plannedChapters, 1),
				targetWordsPerChapter: integerOf(project.targetWordsPerChapter, 1),
				creativeStrategy: project.creativeStrategy,
				updatedAt: stringOf(project.updatedAt)
			};
			const updatedAtMilliseconds = Date.parse(parsedProject.updatedAt);
			if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(parsedProject.projectId) || !Number.isFinite(updatedAtMilliseconds) || new Date(updatedAtMilliseconds).toISOString() !== parsedProject.updatedAt) throw invalidResponse();
			const parsedProgress = {
				selectedChapter: integerOf(progress.selectedChapter, 1),
				plannedChapters: integerOf(progress.plannedChapters, 1),
				status: progress.status,
				draftPresent: progress.draftPresent,
				draftBytes: integerOf(progress.draftBytes)
			};
			if (parsedProgress.plannedChapters !== parsedProject.plannedChapters || parsedProgress.selectedChapter > parsedProject.plannedChapters || chapterBlueprint !== null && chapterBlueprint.chapter !== parsedProgress.selectedChapter || parsedProgress.draftPresent !== (draft !== null) || parsedProgress.draftBytes !== (draft?.bytes ?? 0) || draft?.revision === "absent") throw invalidResponse();
			return {
				status,
				project: parsedProject,
				progress: parsedProgress,
				characters,
				storyBlueprint,
				chapterBlueprint,
				draft,
				omittedSources: stringsOf(root.omittedSources)
			};
		}
		//#endregion
		//#region src/client/setup-store.ts
		/** Error emitted when the browser has no live Host connection. */
		var PresetSetupDisconnectedError = class extends Error {
			/**
			* Create a stable disconnected error.
			*
			* @param cause Optional transport failure.
			*/
			constructor(cause) {
				super("Host connection is unavailable", cause === void 0 ? void 0 : { cause });
				this.name = "PresetSetupDisconnectedError";
			}
		};
		/** Framework-independent preset setup state controller. */
		var PresetSetupController = class {
			#listeners = /* @__PURE__ */ new Set();
			#port;
			#reportListenerError;
			#state = {
				status: "idle",
				open: false
			};
			#request = 0;
			#active;
			#disposed = false;
			/**
			* Create a controller over one Host RPC port.
			*
			* @param port RPC operations used for inspection and explicit installation.
			* @param reportListenerError Error sink for isolated render subscriber failures.
			*/
			constructor(port, reportListenerError) {
				this.#port = port;
				this.#reportListenerError = reportListenerError;
			}
			/** @returns The current immutable render state. */
			getSnapshot() {
				return this.#state;
			}
			/**
			* Subscribe to state changes.
			*
			* @param listener Callback invoked after each state transition.
			* @returns A disposer that removes the subscription.
			*/
			subscribe(listener) {
				this.#listeners.add(listener);
				return () => this.#listeners.delete(listener);
			}
			/** @returns Nothing. */
			open() {
				if (this.#disposed) return;
				this.#set({
					...this.#state,
					open: true
				});
			}
			/** @returns Nothing. */
			close() {
				if (this.#disposed) return;
				this.#set({
					...this.#state,
					open: false
				});
			}
			/**
			* Abort the current request and expose the disconnected state without waiting for settlement.
			*
			* @returns Nothing.
			*/
			disconnected() {
				if (this.#disposed) return;
				this.#request += 1;
				this.#active?.abort.abort();
				this.#set({
					status: "disconnected",
					open: this.#state.open
				});
			}
			/**
			* Abort and await the previous request before loading Host installation state.
			* Transport and response failures become error or disconnected state instead of rejection.
			*
			* @returns Completion after the Host installation state has been loaded.
			*/
			async load() {
				await this.#run(async (signal) => {
					const result = await this.#port.status(signal);
					return result.status === "installed" ? {
						status: "installed",
						open: this.#state.open,
						changed: false
					} : {
						status: result.status,
						open: this.#state.open
					};
				});
			}
			/**
			* Abort and await the previous request before starting an explicit Host installation.
			* Transport, validation, and installation failures become error or disconnected state instead of rejection.
			*
			* @returns Completion after the explicit Host installation request settles.
			*/
			async install() {
				await this.#run(async (signal) => {
					const result = await this.#port.install(signal);
					return result.status === "installed" ? {
						status: "installed",
						open: this.#state.open,
						changed: result.changed
					} : {
						status: "conflict",
						open: this.#state.open
					};
				});
			}
			/**
			* Stop publishing state, abort the active Host request, and wait until it settles.
			*
			* @returns Completion after in-flight work reaches quiescence.
			*/
			async dispose() {
				if (this.#disposed) return;
				this.#disposed = true;
				this.#request += 1;
				this.#listeners.clear();
				const active = this.#active;
				active?.abort.abort();
				await active?.done;
				if (this.#active === active) this.#active = void 0;
			}
			async #run(operation) {
				if (this.#disposed) return;
				const request = ++this.#request;
				const previous = this.#active;
				previous?.abort.abort();
				this.#set({
					status: "loading",
					open: this.#state.open
				});
				await previous?.done;
				if (this.#disposed || request !== this.#request) return;
				const abort = new AbortController();
				const done = this.#settle(request, abort.signal, operation);
				const active = {
					abort,
					done
				};
				this.#active = active;
				await done;
				if (this.#active === active) this.#active = void 0;
			}
			async #settle(request, signal, operation) {
				try {
					const state = await operation(signal);
					if (!this.#disposed && request === this.#request) this.#set(state);
				} catch (error) {
					if (!this.#disposed && request === this.#request) this.#setError(error);
				}
			}
			#setError(error) {
				this.#set(error instanceof PresetSetupDisconnectedError ? {
					status: "disconnected",
					open: this.#state.open
				} : {
					status: "error",
					open: this.#state.open,
					message: error instanceof Error ? error.message : String(error)
				});
			}
			#set(state) {
				this.#state = state;
				for (const listener of this.#listeners) try {
					listener();
				} catch (error) {
					try {
						this.#reportListenerError(error);
					} catch (reportingError) {}
				}
			}
		};
		//#endregion
		//#region src/client/setup-view.tsx
		/**
		* Render the setup result and its explicit action without owning dialog chrome.
		*
		* @param props Current state and user-triggered actions.
		* @returns Accessible status content for the setup dialog.
		*/
		function PresetSetupBody({ state, install, retry }) {
			switch (state.status) {
				case "idle":
				case "loading": return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					role: "status",
					children: "正在检查安装状态…"
				});
				case "not-installed": return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					"aria-live": "polite",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "安装后，请新建会话并选择“AI 小说作家”Preset。" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "aiNovelPresetPrimary",
						onClick: install,
						children: "安装 AI 小说作家 Preset"
					})]
				});
				case "installed": return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					role: "status",
					"aria-live": "polite",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "Preset 已安装。" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "请新建会话并选择“AI 小说作家”，现有会话不会被改写。" })]
				});
				case "conflict": return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					role: "alert",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "检测到同名 Preset 冲突。" }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "插件没有覆盖任何用户文件；请重命名或移走现有目录后重试。" }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "aiNovelPresetSecondary",
							onClick: retry,
							children: "重新检查"
						})
					]
				});
				case "error": return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					role: "alert",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", { children: ["安装状态读取失败：", state.message] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "aiNovelPresetSecondary",
						onClick: retry,
						children: "重试"
					})]
				});
				case "disconnected": return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					role: "alert",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "Harness 连接已断开。" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "aiNovelPresetSecondary",
						onClick: retry,
						children: "重新连接后重试"
					})]
				});
			}
		}
		//#endregion
		//#region src/client/workbench-view.tsx
		function TextList({ items, empty }) {
			if (items.length === 0) return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				className: "aiNovelContextMuted",
				children: empty
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", { children: items.map((item, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: item }, `${index}:${item}`)) });
		}
		function initializationField(label, name, value, update, options = {}) {
			const type = options.type ?? "text";
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
				className: "aiNovelWorkbenchField",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: label }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
					name,
					type,
					disabled: options.disabled,
					value,
					min: type === "number" ? 1 : void 0,
					onChange: (event) => {
						update({ [name]: event.currentTarget.value });
					}
				})]
			});
		}
		function characterField(label, name, value, update) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
				className: "aiNovelWorkbenchField",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: label }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
					value,
					onChange: (event) => {
						update({ [name]: event.currentTarget.value });
					}
				})]
			});
		}
		function relationshipRows(text) {
			if (text.trim() === "") return [];
			return text.split(/\r?\n/).filter((line) => line.trim() !== "").map((line) => {
				const [characterId = "", type = "", summary = ""] = line.split("|").map((part) => part.trim());
				return {
					characterId,
					type,
					summary
				};
			});
		}
		function relationshipText(rows) {
			return rows.map((row) => `${row.characterId} | ${row.type} | ${row.summary}`).join("\n");
		}
		function CharacterRelationshipsEditor({ selected, characters, update }) {
			const rows = relationshipRows(selected.relationshipsText);
			const candidates = characters.filter((character) => character.id !== selected.id);
			const replaceRow = (index, patch) => {
				update({ relationshipsText: relationshipText(rows.map((row, rowIndex) => rowIndex === index ? {
					...row,
					...patch
				} : row)) });
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("fieldset", {
				className: "aiNovelRelationshipEditor",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("legend", { children: "人物关系" }),
					rows.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "aiNovelContextMuted",
						children: "尚未添加人物关系。"
					}) : rows.map((row, index) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "aiNovelRelationshipRow",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
								className: "aiNovelWorkbenchField",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: ["关系人物 ", index + 1] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
									"aria-label": `关系人物 ${index + 1}`,
									value: row.characterId,
									onChange: (event) => {
										replaceRow(index, { characterId: event.currentTarget.value });
									},
									children: [candidates.some((character) => character.id === row.characterId) ? void 0 : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
										value: row.characterId,
										children: "未找到的人物"
									}), candidates.map((character) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("option", {
										value: character.id,
										children: [character.name || "未命名人物", character.role === "" ? "" : ` · ${character.role}`]
									}, character.id))]
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
								className: "aiNovelWorkbenchField",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "关系类型" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									value: row.type,
									onChange: (event) => {
										replaceRow(index, { type: event.currentTarget.value });
									}
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
								className: "aiNovelWorkbenchField",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "关系说明" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
									value: row.summary,
									onChange: (event) => {
										replaceRow(index, { summary: event.currentTarget.value });
									}
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "aiNovelPresetSecondary",
								onClick: () => {
									update({ relationshipsText: relationshipText(rows.filter((_row, rowIndex) => rowIndex !== index)) });
								},
								children: "删除关系"
							})
						]
					}, `${index}:${row.characterId}`)),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "aiNovelPresetSecondary",
						disabled: candidates.length === 0,
						onClick: () => {
							update({ relationshipsText: relationshipText([...rows, {
								characterId: candidates[0].id,
								type: "",
								summary: ""
							}]) });
						},
						children: "添加关系"
					})
				]
			});
		}
		function ChapterCastEditor({ characters, selectedIdsText, disabled, update }) {
			const selectedIds = selectedIdsText.split(/\r?\n/).map((id) => id.trim()).filter(Boolean);
			const selected = new Set(selectedIds);
			const known = new Set(characters.map((character) => character.id));
			const hiddenCount = selectedIds.filter((id) => !known.has(id)).length;
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("fieldset", {
				className: "aiNovelCastEditor",
				disabled,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("legend", { children: "出场人物" }),
					characters.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "aiNovelContextMuted",
						children: "请先建立人物设定。"
					}) : characters.map((character) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						type: "checkbox",
						checked: selected.has(character.id),
						onChange: (event) => {
							const next = event.currentTarget.checked ? [...selectedIds, character.id] : selectedIds.filter((id) => id !== character.id);
							update([...new Set(next)].join("\n"));
						}
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [character.name || "未命名人物", character.role === "" ? "" : ` · ${character.role}`] })] }, character.id)),
					hiddenCount === 0 ? void 0 : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
						className: "aiNovelContextMuted",
						children: [
							"已保留 ",
							hiddenCount,
							" 个当前人物列表中未显示的引用。"
						]
					})
				]
			});
		}
		function AssetProposalFields({ screen, disabled, updateSummary }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
				className: "aiNovelWorkbenchField",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "修改摘要" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
					value: screen.summary,
					disabled,
					placeholder: "说明本次单资产修改",
					onChange: (event) => {
						updateSummary(event.currentTarget.value);
					}
				})]
			}), screen.replacement === void 0 ? void 0 : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: "aiNovelInitializationPreview",
				"aria-label": "即将提交的完整资产文本",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h4", { children: "即将提交的完整资产文本" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "审批前磁盘不会变化；提交后请回到对话处理原生 diff 审批。" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", { children: screen.replacement })
				]
			})] });
		}
		function AssetEditorFeedback({ phase, message, reload }) {
			if (message === void 0 && phase !== "submitted") return null;
			if (phase === "stale") return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				role: "alert",
				className: "aiNovelEditorNotice",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: message }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: "aiNovelPresetSecondary",
					onClick: reload,
					children: "重新载入最新版本"
				})]
			});
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
				role: phase === "error" ? "alert" : "status",
				children: message ?? "修改提案已发送；请回到对话处理 Harness 原生审批。"
			});
		}
		function assetEditorLocked(phase) {
			return phase === "submitting" || phase === "submitted" || phase === "stale";
		}
		function generationLabel(screen) {
			switch (screen.kind) {
				case "project": return "项目设置";
				case "characters": return "人物设定";
				case "story-blueprint": return "故事蓝图";
				case "chapter-blueprint": return `第 ${screen.chapter} 章蓝图`;
				case "chapter-draft": return `第 ${screen.chapter} 章正文`;
			}
		}
		function generationPending$1(screen) {
			return screen.generation?.phase === "submitting" || screen.generation?.phase === "submitted" || screen.generation?.phase === "reconciling";
		}
		function AssetGenerationPanel({ screen, blocker, updateBrief, generate }) {
			const label = generationLabel(screen);
			const generation = screen.generation ?? {
				brief: "",
				phase: "editing"
			};
			const pending = generationPending$1(screen);
			const manualBlocked = screen.phase !== "clean" && screen.phase !== "editing";
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
				className: "aiNovelGenerationPanel",
				"aria-labelledby": `ai-novel-generate-${screen.kind}`,
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "aiNovelGenerationHeader",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("h4", {
							id: `ai-novel-generate-${screen.kind}`,
							children: ["AI 生成", label]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "只会生成当前资产，并通过对话展示原生审批。" })]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "aiNovelContextMuted",
						children: "原生审批就是对话中的单文件差异卡片。点击“允许一次”后会立即保存并回填本页字段，不会再出现第二次审批。"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
						className: "aiNovelWorkbenchField",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "补充要求（可选）" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
							"aria-label": `${label} AI 生成要求`,
							value: generation.brief,
							disabled: pending,
							placeholder: "例如：玄幻题材，主角林凡，保持现有世界观一致",
							onChange: (event) => {
								updateBrief(event.currentTarget.value);
							}
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "aiNovelContextMuted",
						children: "留空时，模型会根据当前资产和项目上下文自动完善。"
					}),
					screen.dirty && !manualBlocked && !pending ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "aiNovelContextMuted",
						children: "当前未提交表单会作为 AI 生成参考；模型结果仍需原生审批。"
					}) : void 0,
					manualBlocked && !pending ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "aiNovelContextMuted",
						children: "当前手动修改已进入提案流程。请在底部提交手动修改到当前会话，或放弃修改后再生成。"
					}) : void 0,
					blocker === void 0 ? void 0 : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						role: "alert",
						children: blocker
					}),
					generation.message !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						role: generation.phase === "error" ? "alert" : "status",
						children: generation.message
					}) : void 0,
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "aiNovelPresetSecondary aiNovelGenerationButton",
						disabled: blocker !== void 0 || pending || manualBlocked,
						onClick: generate,
						children: generation.phase === "submitting" ? "正在发送生成请求…" : "让当前模型生成"
					})
				]
			});
		}
		function AssetEditorHeading({ title, detail, back, blocked, icon }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "aiNovelAssetHeading",
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "aiNovelBackButton",
					"aria-label": "返回小说资产列表",
					disabled: blocked,
					onClick: back,
					children: [icon, /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "返回小说资产" })]
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
					"data-ai-novel-screen-focus": true,
					tabIndex: -1,
					children: title
				}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: detail })] })]
			});
		}
		function AssetEditorActions({ dirty, phase, hasPreview, refresh, discard }) {
			const locked = assetEditorLocked(phase);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "aiNovelWorkbenchActions",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "aiNovelPresetSecondary",
						onClick: refresh,
						children: "重新读取"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "aiNovelPresetSecondary",
						disabled: !dirty || locked,
						onClick: discard,
						children: "放弃修改"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "submit",
						className: "aiNovelPresetPrimary",
						disabled: !dirty || locked,
						children: phase === "submitting" ? "正在发送提案…" : hasPreview ? "提交手动修改到当前会话" : "预览手动修改"
					})
				]
			});
		}
		/**
		* Render the initialization tracer bullet and the existing bounded project summary.
		*
		* @param props Workbench state and user actions.
		* @returns Accessible one-column drawer content.
		*/
		function NovelWorkbenchBody({ state, backIcon, refresh, selectChapter, updateInitialization, updateInitializationGenerationBrief, generateInitialization, previewInitialization, submitInitialization, openAsset, backToAssets, updateProjectSettings, updateStoryBlueprint, updateChapterBlueprint, updateChapterDraft, updateAssetSummary, updateAssetGenerationBrief, generateAsset, previewAssetChange, submitAssetChange, discardAssetChanges, reloadStaleAsset, setCharacterSearch, selectCharacter, createCharacter, updateCharacter, deleteCharacter }) {
			switch (state.status) {
				case "idle":
				case "loading": return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					role: "status",
					children: "正在读取小说工作台…"
				});
				case "empty": return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					role: "status",
					children: "当前没有属于已注册工作区的会话。请先打开小说工作区中的会话。"
				});
				case "disconnected": return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					role: "alert",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "Harness 连接已断开，恢复连接后才能读取或提交提案。" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "aiNovelPresetSecondary",
						onClick: refresh,
						children: "重新连接后读取"
					})]
				});
				case "error": return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					role: "alert",
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", { children: ["小说工作台读取失败：", state.message] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: "aiNovelPresetSecondary",
						onClick: refresh,
						children: "重试读取"
					})]
				});
				case "not-initialized": {
					const { blocker, draft, phase, message, preview } = state.initialization;
					const generation = state.initialization.generation ?? {
						brief: "",
						phase: "editing"
					};
					const generationPending = generation.phase === "submitting" || generation.phase === "submitted" || generation.phase === "reconciling";
					const manuallyEdited = draft.title !== "" || draft.language !== "zh-CN" || draft.genre !== "" || draft.plannedChapters !== "20" || draft.targetWordsPerChapter !== "3000" || draft.creativeStrategy !== "auto";
					const disabled = blocker !== void 0 || phase === "submitting" || phase === "submitted" || generationPending;
					return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
						className: "aiNovelWorkbenchForm",
						"aria-labelledby": "ai-novel-initialize-title",
						onSubmit: (event) => {
							event.preventDefault();
							if (preview === void 0) previewInitialization();
							else submitInitialization();
						},
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "aiNovelWorkbenchIntro",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
									id: "ai-novel-initialize-title",
									children: "初始化小说项目"
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "填写项目设置后，工作台只会向当前会话发送一份初始化提案。文件仍需经过 Harness 原生审批才会创建。" })]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
								className: "aiNovelGenerationPanel",
								"aria-labelledby": "ai-novel-generate-initialization",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "aiNovelGenerationHeader",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h4", {
											id: "ai-novel-generate-initialization",
											children: "AI 生成项目设置"
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "描述题材与主角，当前模型会生成一份初始化提案，并通过对话展示原生审批。" })]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										className: "aiNovelContextMuted",
										children: "原生审批就是对话中的单文件差异卡片。点击“允许一次”后会创建项目并回填本页字段，不会再出现第二次审批。"
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
										className: "aiNovelWorkbenchField",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "生成要求（可选）" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
											"aria-label": "项目设置 AI 生成要求",
											value: generation.brief,
											disabled: generationPending,
											placeholder: "例如：玄幻题材，主角林凡，规划 12 章",
											onChange: (event) => {
												updateInitializationGenerationBrief(event.currentTarget.value);
											}
										})]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										className: "aiNovelContextMuted",
										children: "留空时，模型会根据当前表单和默认项目规模自动生成。"
									}),
									manuallyEdited && !generationPending ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										className: "aiNovelContextMuted",
										children: "当前手填项目设置会作为 AI 生成参考；模型结果仍需原生审批。"
									}) : void 0,
									generation.message === void 0 ? void 0 : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
										role: generation.phase === "error" ? "alert" : "status",
										children: generation.message
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: "aiNovelPresetSecondary aiNovelGenerationButton",
										disabled: blocker !== void 0 || generationPending,
										onClick: generateInitialization,
										children: generation.phase === "submitting" ? "正在发送生成请求…" : "让当前模型生成"
									})
								]
							}),
							initializationField("小说标题", "title", draft.title, updateInitialization, { disabled }),
							initializationField("语言", "language", draft.language, updateInitialization, { disabled }),
							initializationField("类型", "genre", draft.genre, updateInitialization, { disabled }),
							initializationField("计划章数", "plannedChapters", draft.plannedChapters, updateInitialization, {
								type: "number",
								disabled
							}),
							initializationField("每章目标字数", "targetWordsPerChapter", draft.targetWordsPerChapter, updateInitialization, {
								type: "number",
								disabled
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
								className: "aiNovelWorkbenchField",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "创作策略" }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
									name: "creativeStrategy",
									value: draft.creativeStrategy,
									disabled,
									onChange: (event) => {
										updateInitialization({ creativeStrategy: event.currentTarget.value });
									},
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: "auto",
											children: "自动平衡"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: "fluent-drafting",
											children: "流畅起草"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: "consistency-first",
											children: "一致性优先"
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
											value: "deep-planning",
											children: "深度规划"
										})
									]
								})]
							}),
							blocker !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								role: "alert",
								children: blocker
							}) : void 0,
							message !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								role: phase === "error" ? "alert" : "status",
								children: message
							}) : void 0,
							preview !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
								className: "aiNovelInitializationPreview",
								"aria-labelledby": "ai-novel-initialization-preview-title",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h4", {
										id: "ai-novel-initialization-preview-title",
										children: "即将提交的完整值"
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "项目 ID 与时间戳由插件自动生成；确认可读的小说设置后，再提交到当前会话。" }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", { children: preview.json })
								]
							}) : void 0,
							phase === "submitted" ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								role: "status",
								children: "初始化提案已发送。请回到对话查看并处理原生审批；批准后工作台会自动重新读取。"
							}) : void 0,
							state.readFeedback !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								role: state.readFeedback.kind === "error" || state.readFeedback.kind === "disconnected" ? "alert" : "status",
								children: state.readFeedback.message
							}) : void 0,
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "aiNovelWorkbenchActions",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: "aiNovelPresetSecondary",
									onClick: refresh,
									children: "重新读取"
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "submit",
									className: "aiNovelPresetPrimary",
									disabled,
									children: phase === "submitting" ? "正在发送提案…" : preview === void 0 ? "预览初始化提案" : "提交到当前会话"
								})]
							})
						]
					});
				}
				case "ready": {
					const screen = state.screen;
					if (screen.kind === "asset-loading") return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						role: "status",
						children: "正在读取资产的精确 revision…"
					});
					if (screen.kind === "asset-error") return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						role: "alert",
						className: "aiNovelWorkbenchForm",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", { children: ["资产读取失败：", screen.message] }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "aiNovelWorkbenchActions aiNovelWorkbenchActionsInline",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "aiNovelPresetSecondary",
								onClick: backToAssets,
								children: "返回资产"
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: "aiNovelPresetPrimary",
								onClick: () => {
									openAsset(screen.target);
								},
								children: "重试"
							})]
						})]
					});
					if (screen.kind === "project") {
						const disabled = assetEditorLocked(screen.phase) || generationPending$1(screen);
						return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
							className: "aiNovelWorkbenchForm",
							onSubmit: (event) => {
								event.preventDefault();
								screen.preview === void 0 ? previewAssetChange() : submitAssetChange();
							},
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(AssetEditorHeading, {
									title: "项目设置",
									detail: `基于 revision ${screen.baseRevision.slice(0, 12)}`,
									back: backToAssets,
									blocked: screen.dirty || disabled,
									icon: backIcon
								}),
								initializationField("小说标题", "title", screen.draft.title, updateProjectSettings, { disabled }),
								initializationField("语言", "language", screen.draft.language, updateProjectSettings, { disabled }),
								initializationField("类型", "genre", screen.draft.genre, updateProjectSettings, { disabled }),
								initializationField("计划章数", "plannedChapters", screen.draft.plannedChapters, updateProjectSettings, {
									type: "number",
									disabled
								}),
								initializationField("每章目标字数", "targetWordsPerChapter", screen.draft.targetWordsPerChapter, updateProjectSettings, {
									type: "number",
									disabled
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: "aiNovelWorkbenchField",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "创作策略" }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
										value: screen.draft.creativeStrategy,
										disabled,
										onChange: (event) => {
											updateProjectSettings({ creativeStrategy: event.currentTarget.value });
										},
										children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
												value: "auto",
												children: "自动平衡"
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
												value: "fluent-drafting",
												children: "流畅起草"
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
												value: "consistency-first",
												children: "一致性优先"
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
												value: "deep-planning",
												children: "深度规划"
											})
										]
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(AssetGenerationPanel, {
									screen,
									blocker: state.submissionBlocker,
									updateBrief: updateAssetGenerationBrief,
									generate: generateAsset
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(AssetProposalFields, {
									screen,
									disabled,
									updateSummary: updateAssetSummary
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(AssetEditorFeedback, {
									phase: screen.phase,
									message: screen.message,
									reload: reloadStaleAsset
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(AssetEditorActions, {
									dirty: screen.dirty,
									phase: screen.phase,
									hasPreview: screen.preview !== void 0,
									refresh,
									discard: discardAssetChanges
								})
							]
						});
					}
					if (screen.kind === "characters") {
						const selected = screen.characters.find((character) => character.id === screen.selectedId);
						const disabled = assetEditorLocked(screen.phase) || generationPending$1(screen);
						return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
							className: "aiNovelWorkbenchForm",
							onSubmit: (event) => {
								event.preventDefault();
								screen.preview === void 0 ? previewAssetChange() : submitAssetChange();
							},
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(AssetEditorHeading, {
									title: "人物设定",
									detail: `${screen.characters.length} 人 · revision ${screen.baseRevision.slice(0, 12)}`,
									back: backToAssets,
									blocked: screen.dirty || disabled,
									icon: backIcon
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "aiNovelCharacterToolbar",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
										className: "aiNovelWorkbenchField",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "搜索人物" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
											value: screen.search,
											onChange: (event) => {
												setCharacterSearch(event.currentTarget.value);
											}
										})]
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: "aiNovelPresetSecondary",
										disabled,
										onClick: createCharacter,
										children: "新建人物"
									})]
								}),
								screen.visibleCharacterIds.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: "aiNovelContextMuted",
									children: "没有匹配的人物。"
								}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
									className: "aiNovelCharacterList",
									"aria-label": "人物列表",
									children: screen.visibleCharacterIds.map((id) => {
										const character = screen.characters.find((item) => item.id === id);
										return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
											type: "button",
											"aria-current": id === screen.selectedId,
											onClick: () => {
												selectCharacter(id);
											},
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: character.name || "未命名人物" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: character.role || "角色未填写" })]
										}) }, id);
									})
								}),
								selected === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: "aiNovelContextMuted",
									children: "选择或新建人物后编辑完整设定。"
								}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("fieldset", {
									className: "aiNovelCharacterEditor",
									disabled,
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("legend", { children: selected.name || "新人物" }),
										characterField("姓名", "name", selected.name, updateCharacter),
										characterField("角色", "role", selected.role, updateCharacter),
										characterField("摘要", "summary", selected.summary, updateCharacter),
										characterField("目标", "goal", selected.goal, updateCharacter),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)(CharacterRelationshipsEditor, {
											selected,
											characters: screen.characters,
											update: updateCharacter
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
											className: "aiNovelWorkbenchField",
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "备注" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
												value: selected.notes,
												onChange: (event) => {
													updateCharacter({ notes: event.currentTarget.value });
												}
											})]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: "aiNovelDangerButton",
											onClick: deleteCharacter,
											children: "删除此人物"
										})
									]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(AssetGenerationPanel, {
									screen,
									blocker: state.submissionBlocker,
									updateBrief: updateAssetGenerationBrief,
									generate: generateAsset
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(AssetProposalFields, {
									screen,
									disabled,
									updateSummary: updateAssetSummary
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(AssetEditorFeedback, {
									phase: screen.phase,
									message: screen.message,
									reload: reloadStaleAsset
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(AssetEditorActions, {
									dirty: screen.dirty,
									phase: screen.phase,
									hasPreview: screen.preview !== void 0,
									refresh,
									discard: discardAssetChanges
								})
							]
						});
					}
					if (screen.kind === "story-blueprint") {
						const disabled = assetEditorLocked(screen.phase) || generationPending$1(screen);
						return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
							className: "aiNovelWorkbenchForm",
							onSubmit: (event) => {
								event.preventDefault();
								screen.preview === void 0 ? previewAssetChange() : submitAssetChange();
							},
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(AssetEditorHeading, {
									title: "故事蓝图",
									detail: `revision ${screen.baseRevision.slice(0, 12)}`,
									back: backToAssets,
									blocked: screen.dirty || disabled,
									icon: backIcon
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: "aiNovelWorkbenchField",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "故事前提" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
										disabled,
										value: screen.draft.premise,
										onChange: (event) => {
											updateStoryBlueprint({ premise: event.currentTarget.value });
										}
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: "aiNovelWorkbenchField",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "主题（每行一项）" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
										disabled,
										value: screen.draft.themesText,
										onChange: (event) => {
											updateStoryBlueprint({ themesText: event.currentTarget.value });
										}
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: "aiNovelWorkbenchField",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "世界设定" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
										disabled,
										value: screen.draft.world,
										onChange: (event) => {
											updateStoryBlueprint({ world: event.currentTarget.value });
										}
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: "aiNovelWorkbenchField",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "故事主线" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
										disabled,
										value: screen.draft.mainPlot,
										onChange: (event) => {
											updateStoryBlueprint({ mainPlot: event.currentTarget.value });
										}
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: "aiNovelWorkbenchField",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "结局目标" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
										disabled,
										value: screen.draft.endingGoal,
										onChange: (event) => {
											updateStoryBlueprint({ endingGoal: event.currentTarget.value });
										}
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(AssetGenerationPanel, {
									screen,
									blocker: state.submissionBlocker,
									updateBrief: updateAssetGenerationBrief,
									generate: generateAsset
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(AssetProposalFields, {
									screen,
									disabled,
									updateSummary: updateAssetSummary
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(AssetEditorFeedback, {
									phase: screen.phase,
									message: screen.message,
									reload: reloadStaleAsset
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(AssetEditorActions, {
									dirty: screen.dirty,
									phase: screen.phase,
									hasPreview: screen.preview !== void 0,
									refresh,
									discard: discardAssetChanges
								})
							]
						});
					}
					if (screen.kind === "chapter-blueprint") {
						const disabled = assetEditorLocked(screen.phase) || generationPending$1(screen);
						return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
							className: "aiNovelWorkbenchForm",
							onSubmit: (event) => {
								event.preventDefault();
								screen.preview === void 0 ? previewAssetChange() : submitAssetChange();
							},
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(AssetEditorHeading, {
									title: `第 ${screen.chapter} 章蓝图`,
									detail: `revision ${screen.baseRevision.slice(0, 12)}`,
									back: backToAssets,
									blocked: screen.dirty || disabled,
									icon: backIcon
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: "aiNovelWorkbenchField",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "章节标题" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
										disabled,
										value: screen.draft.title,
										onChange: (event) => {
											updateChapterBlueprint({ title: event.currentTarget.value });
										}
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: "aiNovelWorkbenchField",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "章节目的" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
										disabled,
										value: screen.draft.purpose,
										onChange: (event) => {
											updateChapterBlueprint({ purpose: event.currentTarget.value });
										}
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: "aiNovelWorkbenchField",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "情节节拍（每行一项）" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
										disabled,
										value: screen.draft.beatsText,
										onChange: (event) => {
											updateChapterBlueprint({ beatsText: event.currentTarget.value });
										}
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ChapterCastEditor, {
									characters: state.characters,
									selectedIdsText: screen.draft.characterIdsText,
									disabled,
									update: (characterIdsText) => {
										updateChapterBlueprint({ characterIdsText });
									}
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: "aiNovelWorkbenchField",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "连续性备注（每行一项）" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
										disabled,
										value: screen.draft.continuityNotesText,
										onChange: (event) => {
											updateChapterBlueprint({ continuityNotesText: event.currentTarget.value });
										}
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: "aiNovelWorkbenchField",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "章节状态" }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("select", {
										disabled,
										value: screen.draft.status,
										onChange: (event) => {
											updateChapterBlueprint({ status: event.currentTarget.value });
										},
										children: [
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
												value: "planned",
												children: "已规划"
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
												value: "drafting",
												children: "起草中"
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
												value: "drafted",
												children: "已起草"
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
												value: "revised",
												children: "已修订"
											}),
											/* @__PURE__ */ (0, react_jsx_runtime.jsx)("option", {
												value: "final",
												children: "已定稿"
											})
										]
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(AssetGenerationPanel, {
									screen,
									blocker: state.submissionBlocker,
									updateBrief: updateAssetGenerationBrief,
									generate: generateAsset
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(AssetProposalFields, {
									screen,
									disabled,
									updateSummary: updateAssetSummary
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(AssetEditorFeedback, {
									phase: screen.phase,
									message: screen.message,
									reload: reloadStaleAsset
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(AssetEditorActions, {
									dirty: screen.dirty,
									phase: screen.phase,
									hasPreview: screen.preview !== void 0,
									refresh,
									discard: discardAssetChanges
								})
							]
						});
					}
					if (screen.kind === "chapter-draft") {
						const disabled = assetEditorLocked(screen.phase) || generationPending$1(screen);
						return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("form", {
							className: "aiNovelWorkbenchForm",
							onSubmit: (event) => {
								event.preventDefault();
								screen.preview === void 0 ? previewAssetChange() : submitAssetChange();
							},
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(AssetEditorHeading, {
									title: `第 ${screen.chapter} 章正文`,
									detail: `Markdown · revision ${screen.baseRevision.slice(0, 12)}`,
									back: backToAssets,
									blocked: screen.dirty || disabled,
									icon: backIcon
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
									className: "aiNovelWorkbenchField",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "章节正文 Markdown" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
										className: "aiNovelChapterDraftEditor",
										"aria-label": "章节正文 Markdown",
										disabled,
										value: screen.text,
										onChange: (event) => {
											updateChapterDraft(event.currentTarget.value);
										}
									})]
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(AssetGenerationPanel, {
									screen,
									blocker: state.submissionBlocker,
									updateBrief: updateAssetGenerationBrief,
									generate: generateAsset
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(AssetProposalFields, {
									screen,
									disabled,
									updateSummary: updateAssetSummary
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(AssetEditorFeedback, {
									phase: screen.phase,
									message: screen.message,
									reload: reloadStaleAsset
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)(AssetEditorActions, {
									dirty: screen.dirty,
									phase: screen.phase,
									hasPreview: screen.preview !== void 0,
									refresh,
									discard: discardAssetChanges
								})
							]
						});
					}
					const blueprint = state.chapterBlueprint;
					return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "aiNovelContextSections",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
								"aria-labelledby": "ai-novel-assets",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "aiNovelContextSectionHeader",
									children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
										id: "ai-novel-assets",
										"data-ai-novel-screen-focus": true,
										tabIndex: -1,
										children: "小说资产"
									}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: "aiNovelPresetSecondary",
										onClick: refresh,
										children: "刷新"
									})]
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
									className: "aiNovelAssetList",
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => {
												openAsset({ kind: "project" });
											},
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "项目设置" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "标题、语言、类型、规模与创作策略" })]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => {
												openAsset({ kind: "characters" });
											},
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "人物设定" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: state.characters.length === 0 ? "尚未建立人物表" : `${state.characters.length} 个人物` })]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => {
												openAsset({ kind: "story-blueprint" });
											},
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "故事蓝图" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: state.storyBlueprint === null ? "尚未建立" : "前提、主题、世界与主线" })]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => {
												openAsset({
													kind: "chapter-blueprint",
													chapter: state.progress.selectedChapter
												});
											},
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "章节蓝图" }), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", { children: [
												"第 ",
												state.progress.selectedChapter,
												" 章的目的、节拍与连续性"
											] })]
										}),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => {
												openAsset({
													kind: "chapter-draft",
													chapter: state.progress.selectedChapter
												});
											},
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "章节正文" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: state.progress.draftPresent ? `${state.progress.draftBytes} 字节` : `第 ${state.progress.selectedChapter} 章尚未创建` })]
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
								"aria-labelledby": "ai-novel-project-summary",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: "aiNovelContextSectionHeader",
									children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
										id: "ai-novel-project-summary",
										children: state.project.title
									})
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dl", {
									className: "aiNovelContextFacts",
									children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "类型" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: state.project.genre })] }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "语言" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: state.project.language })] }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "创作策略" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: state.project.creativeStrategy })] }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "目标字数" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: state.project.targetWordsPerChapter })] })
									]
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
								"aria-labelledby": "ai-novel-chapter-progress",
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
										className: "aiNovelContextSectionHeader",
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
											id: "ai-novel-chapter-progress",
											children: "章节进度"
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
											className: "aiNovelContextSrOnly",
											children: "选择章节"
										}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
											type: "number",
											min: 1,
											max: state.progress.plannedChapters,
											value: state.progress.selectedChapter,
											"aria-label": "选择小说章节",
											onChange: (event) => {
												selectChapter(Number(event.currentTarget.value));
											}
										})] })]
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", { children: [
										"第 ",
										state.progress.selectedChapter,
										" / ",
										state.progress.plannedChapters,
										" 章 · ",
										state.progress.status
									] }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
										className: "aiNovelContextMuted",
										children: ["正文 ", state.progress.draftPresent ? `${state.progress.draftBytes} 字节` : "尚未创建"]
									})
								]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
								"aria-labelledby": "ai-novel-characters",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
									id: "ai-novel-characters",
									children: "人物摘要"
								}), state.characters.length === 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: "aiNovelContextMuted",
									children: "尚未建立人物表。"
								}) : /* @__PURE__ */ (0, react_jsx_runtime.jsx)("ul", {
									className: "aiNovelContextCharacters",
									children: state.characters.map((character) => /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", { children: [
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: character.name }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: character.role }),
										/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: character.summary })
									] }, character.id))
								})]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
								"aria-labelledby": "ai-novel-story-blueprint",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
									id: "ai-novel-story-blueprint",
									children: "故事蓝图"
								}), state.storyBlueprint === null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: "aiNovelContextMuted",
									children: "尚未建立故事蓝图。"
								}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: state.storyBlueprint.premise }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(TextList, {
										items: state.storyBlueprint.themes,
										empty: "暂无主题"
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: state.storyBlueprint.world }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: state.storyBlueprint.mainPlot }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: state.storyBlueprint.endingGoal })
								] })]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
								"aria-labelledby": "ai-novel-chapter-blueprint",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
									id: "ai-novel-chapter-blueprint",
									children: "章节蓝图"
								}), blueprint === null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: "aiNovelContextMuted",
									children: "本章尚未建立蓝图。"
								}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h4", { children: blueprint.title }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: blueprint.purpose }),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(TextList, {
										items: blueprint.beats,
										empty: "暂无情节节拍"
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)(TextList, {
										items: blueprint.continuityNotes,
										empty: "暂无连续性备注"
									})
								] })]
							}),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
								"aria-labelledby": "ai-novel-draft-preview",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
									id: "ai-novel-draft-preview",
									children: "正文预览"
								}), state.draft === null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									className: "aiNovelContextMuted",
									children: "本章尚未创建正文。"
								}) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("pre", {
									className: "aiNovelContextPreview",
									children: state.draft.preview
								}), state.draft.truncated ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
									role: "status",
									children: "预览已截断；完整正文仍保留在项目中。"
								}) : void 0] })]
							}),
							state.omittedSources.length > 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("p", {
								role: "status",
								children: ["读取预算已省略：", state.omittedSources.join("、")]
							}) : void 0,
							state.readFeedback !== void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
								role: state.readFeedback.kind === "error" || state.readFeedback.kind === "disconnected" ? "alert" : "status",
								children: state.readFeedback.message
							}) : void 0
						]
					});
				}
			}
		}
		function hostStatus(state) {
			return state.status === "disconnected" ? "Host 已断开" : "Host 已连接";
		}
		function presetStatus(state) {
			switch (state.status) {
				case "installed": return "Preset 已安装";
				case "not-installed": return "Preset 未安装";
				case "conflict": return "Preset 存在冲突";
				case "disconnected": return "Preset 状态不可用";
				case "error": return "Preset 检查失败";
				case "idle":
				case "loading": return "正在检查 Preset";
			}
		}
		function workspaceStatus(state) {
			return state.status === "empty" || state.status === "idle" ? "Workspace 未选择" : "Workspace 已选择";
		}
		function projectStatus(state) {
			switch (state.status) {
				case "ready": return "项目已初始化";
				case "not-initialized": return "项目未初始化";
				case "loading": return "正在检查项目";
				case "error": return "项目读取失败";
				case "disconnected": return "项目状态不可用";
				case "idle":
				case "empty": return "项目尚不可用";
			}
		}
		/**
		* Render visible evidence that the browser plugin and its Host/Preset/project integrations are active.
		*
		* @param props Current setup and workbench state plus explicit actions.
		* @returns One Plugin Configuration list item.
		*/
		function NovelPluginCardBody({ setupState, workbenchState, openWorkbench, refresh }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
				className: "aiNovelPluginCard",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "aiNovelPluginCardHeader",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: "AI 小说作家" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", { children: "小说项目、专用 Preset 与审批式创作流程" })] }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "aiNovelPluginMounted",
							children: "Client 已挂载"
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("dl", {
						className: "aiNovelPluginFacts",
						children: [
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "Host" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: hostStatus(setupState) })] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "Preset" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: presetStatus(setupState) })] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "Workspace" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: workspaceStatus(workbenchState) })] }),
							/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("dt", { children: "小说项目" }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("dd", { children: projectStatus(workbenchState) })] })
						]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: "aiNovelPluginActions",
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "aiNovelPresetSecondary",
							onClick: refresh,
							children: "刷新状态"
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "aiNovelPresetPrimary",
							onClick: (event) => {
								openWorkbench(event.currentTarget);
							},
							children: "打开小说工作台"
						})]
					})
				]
			});
		}
		//#endregion
		//#region src/client/context-view.tsx
		/** React shell surfaces for the compact novel workbench drawer and Settings evidence card. */
		const drawerReturnTargets = /* @__PURE__ */ new WeakMap();
		function focusableElements(drawer) {
			return [...drawer.querySelectorAll("button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[href],[tabindex]:not([tabindex=\"-1\"])")].filter((element) => !element.hidden);
		}
		/**
		* Contain focus in a non-modal drawer, close it with Escape, and restore its invoking control.
		*
		* @param drawer Drawer element receiving fallback focus.
		* @param initialFocus Preferred element focused after open.
		* @param returnFocus Invoking control restored after close.
		* @param close Close action used by the Escape key.
		* @returns A disposer that removes the key listener and restores focus.
		*/
		function installDrawerKeyboardScope(drawer, initialFocus, returnFocus, close) {
			initialFocus.focus();
			const target = drawer.ownerDocument;
			const onKeyDown = (event) => {
				if (event.key === "Escape") {
					event.preventDefault();
					close();
					return;
				}
				if (event.key !== "Tab") return;
				const focusable = focusableElements(drawer);
				if (focusable.length === 0) {
					event.preventDefault();
					drawer.focus();
					return;
				}
				const first = focusable[0];
				const last = focusable.at(-1);
				if (event.shiftKey && target.activeElement === first) {
					event.preventDefault();
					last.focus();
				} else if (!event.shiftKey && target.activeElement === last) {
					event.preventDefault();
					first.focus();
				}
			};
			target.addEventListener("keydown", onKeyDown);
			return () => {
				target.removeEventListener("keydown", onKeyDown);
				if (returnFocus?.isConnected) returnFocus.focus();
			};
		}
		/**
		* Reserve the drawer's wide-screen column in the owning Harness frame.
		*
		* @param shellSeat Mounted marker or drawer inside the native shell overlay layer.
		* @returns A disposer that restores the frame's original layout.
		* @throws When the shell seat is not mounted inside a Harness shell overlay.
		*/
		function installWorkbenchLayoutReservation(shellSeat) {
			const frame = shellSeat.closest("[data-shell-overlay]")?.parentElement;
			if (frame === null || frame === void 0) throw new Error("AI novel workbench requires the Harness shell overlay");
			frame.classList.add("aiNovelWorkbenchFrameOpen");
			return () => {
				frame.classList.remove("aiNovelWorkbenchFrameOpen");
			};
		}
		/**
		* Render the discoverable sidebar action.
		*
		* @param props Sidebar width state and shared workbench controllers.
		* @returns A keyboard-operable DSH-native button.
		*/
		function NovelWorkbenchTrigger({ wide, workbenchController, setupController }) {
			const workbenchState = (0, react.useSyncExternalStore)((listener) => workbenchController.subscribe(listener), () => workbenchController.getSnapshot());
			const open = (event) => {
				drawerReturnTargets.set(workbenchController, event.currentTarget);
				setupController.open();
				Promise.all([workbenchController.open(), setupController.load()]);
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "aiNovelContextTrigger",
				"aria-label": "打开小说工作台",
				"aria-haspopup": "dialog",
				"aria-expanded": workbenchState.open,
				onClick: open,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconListPenOutline16, {}), wide ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: "小说工作台" }) : void 0]
			});
		}
		/**
		* Render the 400–440 px non-modal workbench in the root shell overlay slot.
		*
		* @param props Shared workbench and Preset setup controllers.
		* @returns The controlled drawer while open, otherwise null.
		*/
		function NovelWorkbenchOverlay({ workbenchController, setupController }) {
			const workbenchState = (0, react.useSyncExternalStore)((listener) => workbenchController.subscribe(listener), () => workbenchController.getSnapshot());
			const setupState = (0, react.useSyncExternalStore)((listener) => setupController.subscribe(listener), () => setupController.getSnapshot());
			const drawer = (0, react.useRef)(null);
			const shellSeat = (0, react.useRef)(null);
			const closeButton = (0, react.useRef)(null);
			const screenKey = workbenchState.status === "ready" ? workbenchState.screen.kind : workbenchState.status;
			const previousScreenKey = (0, react.useRef)(void 0);
			(0, react.useEffect)(() => {
				if (!workbenchState.open || drawer.current === null || shellSeat.current === null) return;
				const releaseLayout = installWorkbenchLayoutReservation(shellSeat.current);
				const releaseKeyboard = installDrawerKeyboardScope(drawer.current, closeButton.current ?? drawer.current, drawerReturnTargets.get(workbenchController), () => {
					workbenchController.close();
					setupController.close();
				});
				return () => {
					releaseLayout();
					releaseKeyboard();
				};
			}, [
				setupController,
				workbenchController,
				workbenchState.open
			]);
			(0, react.useEffect)(() => {
				if (!workbenchState.open) {
					previousScreenKey.current = void 0;
					return;
				}
				if (previousScreenKey.current === void 0) {
					previousScreenKey.current = screenKey;
					return;
				}
				if (previousScreenKey.current === screenKey) return;
				previousScreenKey.current = screenKey;
				drawer.current?.querySelector("[data-ai-novel-screen-focus]")?.focus();
			}, [screenKey, workbenchState.open]);
			if (!workbenchState.open) return null;
			const close = () => {
				workbenchController.close();
				setupController.close();
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
				ref: shellSeat,
				hidden: true,
				"aria-hidden": "true"
			}), (0, react_dom.createPortal)(/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: "aiNovelContextOverlay",
				role: "presentation",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					ref: drawer,
					className: "aiNovelContextDrawer",
					role: "dialog",
					"aria-modal": "false",
					"aria-labelledby": "ai-novel-workbench-title",
					tabIndex: -1,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "aiNovelContextHeader",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h2", {
								id: "ai-novel-workbench-title",
								children: "小说工作台"
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								ref: closeButton,
								type: "button",
								className: "aiNovelPresetClose",
								"aria-label": "关闭小说工作台",
								onClick: close,
								children: "关闭"
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "aiNovelContextBody",
							"data-ai-novel-workbench": true,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(NovelWorkbenchBody, {
								state: workbenchState,
								backIcon: /* @__PURE__ */ (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronLeftOutline14, {}),
								refresh: () => {
									workbenchController.refresh();
								},
								selectChapter: (chapter) => {
									workbenchController.selectChapter(chapter);
								},
								updateInitialization: (patch) => {
									workbenchController.updateInitialization(patch);
								},
								updateInitializationGenerationBrief: (brief) => {
									workbenchController.updateInitializationGenerationBrief(brief);
								},
								generateInitialization: () => {
									workbenchController.generateInitialization();
								},
								previewInitialization: () => {
									workbenchController.previewInitialization();
								},
								submitInitialization: () => {
									workbenchController.submitInitialization();
								},
								openAsset: (target) => {
									workbenchController.openAsset(target);
								},
								backToAssets: () => {
									workbenchController.backToAssets();
								},
								updateProjectSettings: (patch) => {
									workbenchController.updateProjectSettings(patch);
								},
								updateStoryBlueprint: (patch) => {
									workbenchController.updateStoryBlueprint(patch);
								},
								updateChapterBlueprint: (patch) => {
									workbenchController.updateChapterBlueprint(patch);
								},
								updateChapterDraft: (text) => {
									workbenchController.updateChapterDraft(text);
								},
								updateAssetSummary: (summary) => {
									workbenchController.updateAssetSummary(summary);
								},
								updateAssetGenerationBrief: (brief) => {
									workbenchController.updateAssetGenerationBrief(brief);
								},
								generateAsset: () => {
									workbenchController.generateAsset();
								},
								previewAssetChange: () => {
									workbenchController.previewAssetChange();
								},
								submitAssetChange: () => {
									workbenchController.submitAssetChange();
								},
								discardAssetChanges: () => {
									workbenchController.discardAssetChanges();
								},
								reloadStaleAsset: () => {
									workbenchController.reloadStaleAsset();
								},
								setCharacterSearch: (search) => {
									workbenchController.setCharacterSearch(search);
								},
								selectCharacter: (id) => {
									workbenchController.selectCharacter(id);
								},
								createCharacter: () => {
									workbenchController.createCharacter();
								},
								updateCharacter: (patch) => {
									workbenchController.updateCharacter(patch);
								},
								deleteCharacter: () => {
									workbenchController.deleteCharacter();
								}
							})
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
							className: "aiNovelContextSetup",
							"aria-labelledby": "ai-novel-preset-setup-title",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", {
								id: "ai-novel-preset-setup-title",
								children: "AI 小说作家 Preset"
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(PresetSetupBody, {
								state: setupState,
								install: () => {
									setupController.install();
								},
								retry: () => {
									setupController.load();
								}
							})]
						})
					]
				})
			}), document.body)] });
		}
		/**
		* Subscribe the pure Plugin Configuration card to shared controller state.
		*
		* @param props Shared controllers owned by the client plugin fiber.
		* @returns One card contribution with live Host, Preset, Workspace, and project evidence.
		*/
		function NovelPluginStatusCard({ workbenchController, setupController }) {
			const workbenchState = (0, react.useSyncExternalStore)((listener) => workbenchController.subscribe(listener), () => workbenchController.getSnapshot());
			const setupState = (0, react.useSyncExternalStore)((listener) => setupController.subscribe(listener), () => setupController.getSnapshot());
			(0, react.useEffect)(() => {
				Promise.all([setupController.load(), workbenchController.inspect()]);
			}, [setupController, workbenchController]);
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)(NovelPluginCardBody, {
				setupState,
				workbenchState,
				openWorkbench: (returnFocus) => {
					drawerReturnTargets.set(workbenchController, returnFocus);
					setupController.open();
					Promise.all([setupController.load(), workbenchController.open()]);
				},
				refresh: () => {
					Promise.all([setupController.load(), workbenchController.inspect()]);
				}
			});
		}
		//#endregion
		//#region src/client/context-observer.ts
		function markerUserSeq(nodes, marker) {
			const line = `[AI_NOVEL_UI_CORRELATION:${marker}]`;
			let seq;
			for (const node of nodes) {
				if (node.kind !== "user" || !node.content?.some((block) => block.type === "text" && block.text?.includes(line))) continue;
				if (seq === void 0 || node.seq > seq) seq = node.seq;
			}
			return seq;
		}
		function queueContainsMarker(queue, marker) {
			const line = `[AI_NOVEL_UI_CORRELATION:${marker}]`;
			return queue.some((item) => item.text?.includes(line) || item.content.some((block) => block.type === "text" && block.text?.includes(line)));
		}
		function approvalAvailability(value) {
			if (typeof value !== "object" || value === null || Array.isArray(value)) return "unknown";
			const currentValue = value.currentValue;
			if (currentValue === "danger-full-access") return "never";
			if (typeof currentValue === "string" && currentValue !== "custom") return "ask";
			return "unknown";
		}
		function latestNovelApplyResult(nodes) {
			let latest;
			for (const node of nodes) if (node.kind === "tool-result" && node.call?.name === "novel_apply_change") {
				if (latest === void 0 || node.seq > latest.seq) latest = node;
			}
			return latest;
		}
		function applyAttribution(node) {
			const argsRaw = node.call?.argsRaw;
			if (argsRaw === void 0) return void 0;
			let value;
			try {
				value = JSON.parse(argsRaw);
			} catch {
				return;
			}
			if (typeof value !== "object" || value === null || Array.isArray(value)) return void 0;
			const record = value;
			if (record.kind === "initialize") {
				if (Object.keys(record).length !== 10 || typeof record.projectId !== "string" || typeof record.createdAt !== "string" || typeof record.updatedAt !== "string" || typeof record.title !== "string" || typeof record.language !== "string" || typeof record.genre !== "string" || typeof record.plannedChapters !== "number" || typeof record.targetWordsPerChapter !== "number" || typeof record.creativeStrategy !== "string") return void 0;
				return {
					kind: "initialize",
					requestJson: JSON.stringify({
						kind: "initialize",
						projectId: record.projectId,
						createdAt: record.createdAt,
						updatedAt: record.updatedAt,
						title: record.title,
						language: record.language,
						genre: record.genre,
						plannedChapters: record.plannedChapters,
						targetWordsPerChapter: record.targetWordsPerChapter,
						creativeStrategy: record.creativeStrategy
					}, null, 2)
				};
			}
			if (record.kind !== "replace" || typeof record.targetKind !== "string" || typeof record.baseRevision !== "string" || typeof record.replacement !== "string") return void 0;
			return {
				kind: "replace",
				targetKind: record.targetKind,
				...typeof record.chapter === "number" ? { chapter: record.chapter } : {},
				baseRevision: record.baseRevision,
				replacement: record.replacement
			};
		}
		/** Read the tool-owned replayable receipt metadata without interpreting model-facing result text. */
		function commitRevision(node) {
			if (node.isError === true) return void 0;
			if (typeof node.meta !== "object" || node.meta === null || Array.isArray(node.meta)) return void 0;
			const revision = node.meta.newRevision;
			return typeof revision === "string" && /^[0-9a-f]{64}$/.test(revision) ? revision : void 0;
		}
		/**
		* Follow the current registered Workspace and refresh after new completed novel mutations.
		*
		* @param sources Browser runtime selection and conversation observables.
		* @param controller Context controller receiving opaque ids and refresh signals.
		* @returns A disposer that removes every root and per-session subscription.
		*/
		function observeNovelContextSources(sources, controller) {
			let disposed = false;
			let boundSessionId;
			let stopConversation;
			let seenApplySeq;
			let observedMarker;
			let settledMarker;
			let queuedMarkerSeen = false;
			const bindConversation = (sessionId) => {
				if (sessionId === void 0 && boundSessionId === void 0) return;
				if (sessionId === boundSessionId && stopConversation !== void 0) return;
				stopConversation?.();
				stopConversation = void 0;
				boundSessionId = sessionId;
				seenApplySeq = void 0;
				observedMarker = void 0;
				settledMarker = void 0;
				queuedMarkerSeen = false;
				if (sessionId === void 0) return;
				const binding = sources.sessions.binding(sessionId);
				if (binding === void 0) return;
				const inspect = () => {
					if (disposed) return;
					const snapshot = binding.session.getSnapshot();
					const latest = latestNovelApplyResult(snapshot.nodes);
					let refresh = false;
					if (latest !== void 0 && latest.seq !== seenApplySeq) {
						const newRevision = commitRevision(latest);
						controller.novelApplySettled({
							isError: latest.isError === true,
							code: latest.error?.code,
							...newRevision === void 0 ? {} : { newRevision },
							attribution: applyAttribution(latest)
						});
						refresh = true;
					}
					seenApplySeq = latest?.seq;
					const marker = controller.currentGenerationCorrelationMarker();
					if (marker !== observedMarker) {
						observedMarker = marker;
						settledMarker = void 0;
						queuedMarkerSeen = false;
					}
					const userSeq = marker === void 0 ? void 0 : markerUserSeq(snapshot.nodes, marker);
					const queued = marker !== void 0 && snapshot.queue !== void 0 ? queueContainsMarker(snapshot.queue, marker) : false;
					if (queued) queuedMarkerSeen = true;
					const matchingTurnEnd = userSeq === void 0 || snapshot.turnEnds === void 0 ? void 0 : [...snapshot.turnEnds.values()].filter((seq) => seq > userSeq).sort((left, right) => left - right)[0];
					if (marker !== void 0 && queuedMarkerSeen && !queued && userSeq === void 0 && snapshot.running === false) {
						controller.generationPromptLost();
						queuedMarkerSeen = false;
					} else if (marker !== void 0 && matchingTurnEnd !== void 0 && settledMarker !== marker) {
						controller.generationTurnSettled();
						settledMarker = marker;
						refresh = true;
					}
					if (refresh) controller.refresh();
				};
				const initial = binding.session.getSnapshot();
				seenApplySeq = latestNovelApplyResult(initial.nodes)?.seq;
				observedMarker = controller.currentGenerationCorrelationMarker();
				queuedMarkerSeen = observedMarker !== void 0 && initial.queue !== void 0 ? queueContainsMarker(initial.queue, observedMarker) : false;
				stopConversation = binding.session.subscribe(inspect);
			};
			const reconcile = () => {
				if (disposed) return;
				const sessionList = sources.sessions.list.getSnapshot();
				const sessionId = sessionList.current;
				const workspaceId = sessionId === void 0 ? void 0 : sources.workspaces.list.getSnapshot().items.find((workspace) => workspace.sessionIds.includes(sessionId))?.workspaceId;
				controller.setTarget(sessionId === void 0 || workspaceId === void 0 ? void 0 : {
					sessionId,
					workspaceId,
					agentPreset: sessionList.byId?.[sessionId]?.agentPreset,
					approval: approvalAvailability(sessionList.byId?.[sessionId]?.projectionValues?.["permissions"])
				});
				bindConversation(sessionId);
			};
			const stopSessions = sources.sessions.list.subscribe(reconcile);
			const stopWorkspaces = sources.workspaces.list.subscribe(reconcile);
			reconcile();
			return () => {
				if (disposed) return;
				disposed = true;
				stopConversation?.();
				stopSessions();
				stopWorkspaces();
			};
		}
		//#endregion
		//#region src/client/setup-style.ts
		/** Token-based context-window styles embedded into the independently distributed client bundle. */
		const novelContextCss = String.raw`
.aiNovelContextTrigger{display:inline-flex;min-height:32px;align-items:center;gap:8px;border:0;border-radius:8px;padding:6px 10px;color:var(--dsw-alias-label-primary);background:transparent;cursor:pointer}
.aiNovelContextTrigger:hover,.aiNovelContextTrigger:focus-visible{background:var(--dsw-alias-interactive-bg-hover)}
.aiNovelWorkbenchFrameOpen{box-sizing:border-box;padding-right:440px}
.aiNovelContextOverlay{position:fixed;inset:0;z-index:2147483001;display:flex;justify-content:flex-end;pointer-events:none}
.aiNovelContextDrawer{box-sizing:border-box;width:440px;min-width:400px;max-width:calc(100vw - 80px);height:100%;overflow:auto;pointer-events:auto;border-left:1px solid var(--dsw-alias-border-inverted);padding:24px;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-2);box-shadow:var(--dsw-shadow-lv3)}
.aiNovelContextHeader,.aiNovelContextSectionHeader{display:flex;align-items:center;justify-content:space-between;gap:16px}
.aiNovelContextHeader h2,.aiNovelContextSections h3,.aiNovelContextSections h4,.aiNovelContextSections p,.aiNovelContextSetup h3,.aiNovelContextSetup p{margin:0}
.aiNovelContextBody,.aiNovelContextSetup{margin-top:24px}
.aiNovelContextSetup{border-top:1px solid var(--dsw-alias-border-l2);padding-top:20px}
.aiNovelContextSections{display:grid;gap:20px}
.aiNovelContextSections section{display:grid;gap:10px}
.aiNovelContextFacts{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0}
.aiNovelContextFacts div{min-width:0}.aiNovelContextFacts dt{color:var(--dsw-alias-label-secondary)}.aiNovelContextFacts dd{margin:2px 0 0;overflow-wrap:anywhere}
.aiNovelContextCharacters{display:grid;gap:10px;margin:0;padding:0;list-style:none}.aiNovelContextCharacters li{display:grid;gap:4px}.aiNovelContextCharacters span,.aiNovelContextMuted{color:var(--dsw-alias-label-secondary)}
.aiNovelContextPreview{margin:0;max-height:320px;overflow:auto;white-space:pre-wrap;overflow-wrap:anywhere;font:inherit;color:inherit;background:var(--dsw-alias-bg-layer-1);border-radius:8px;padding:12px}
.aiNovelContextSectionHeader input{width:76px;min-height:32px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;padding:4px 8px;color:inherit;background:transparent}
.aiNovelContextSrOnly{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.aiNovelPresetClose,.aiNovelPresetPrimary,.aiNovelPresetSecondary{min-height:32px;border-radius:8px;padding:6px 12px;cursor:pointer}
.aiNovelPresetClose,.aiNovelPresetSecondary{border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary);background:transparent}
.aiNovelPresetPrimary{border:1px solid transparent;color:var(--dsw-alias-label-primary-foreground);background:var(--dsw-alias-button-primary-fill)}
.aiNovelPresetClose:focus-visible,.aiNovelPresetPrimary:focus-visible,.aiNovelPresetSecondary:focus-visible,.aiNovelBackButton:focus-visible,.aiNovelDangerButton:focus-visible,.aiNovelAssetList button:focus-visible,.aiNovelCharacterList button:focus-visible,.aiNovelWorkbenchField input:focus-visible,.aiNovelWorkbenchField select:focus-visible,.aiNovelWorkbenchField textarea:focus-visible,.aiNovelCastEditor input:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.aiNovelPresetPrimary:disabled{opacity:.45;cursor:default}
.aiNovelWorkbenchForm{display:grid;gap:16px}.aiNovelWorkbenchIntro{display:grid;gap:8px}.aiNovelWorkbenchIntro h3,.aiNovelWorkbenchIntro p{margin:0}
.aiNovelWorkbenchField{display:grid;gap:6px;font-size:13px;color:var(--dsw-alias-label-secondary)}
.aiNovelWorkbenchField input,.aiNovelWorkbenchField select,.aiNovelWorkbenchField textarea{box-sizing:border-box;width:100%;min-height:36px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;padding:6px 10px;font:inherit;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1)}.aiNovelWorkbenchField textarea{min-height:84px;resize:vertical}
.aiNovelWorkbenchField .aiNovelChapterDraftEditor{min-height:360px;line-height:1.65;overflow-wrap:anywhere;white-space:pre-wrap}
.aiNovelInitializationPreview{display:grid;gap:8px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;padding:12px;background:var(--dsw-alias-bg-layer-1)}.aiNovelInitializationPreview h4,.aiNovelInitializationPreview p{margin:0}.aiNovelInitializationPreview pre{margin:0;max-height:240px;overflow:auto;white-space:pre-wrap;overflow-wrap:anywhere;font:12px/1.5 ui-monospace,SFMono-Regular,Consolas,monospace;color:var(--dsw-alias-label-secondary)}
.aiNovelWorkbenchActions,.aiNovelPluginActions{display:flex;justify-content:flex-end;gap:8px}.aiNovelWorkbenchActions{position:sticky;bottom:-24px;margin:0 -24px -24px;padding:16px 24px;background:var(--dsw-alias-bg-layer-2);border-top:1px solid var(--dsw-alias-border-l2)}
.aiNovelWorkbenchActionsInline{position:static;margin:0;padding:0;border:0}.aiNovelWorkbenchActions button:disabled,.aiNovelCharacterToolbar button:disabled{opacity:.45;cursor:default}
.aiNovelAssetList{display:grid;gap:8px}.aiNovelAssetList button,.aiNovelCharacterList button{display:grid;gap:3px;width:100%;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;padding:10px 12px;text-align:left;font:inherit;color:inherit;background:var(--dsw-alias-bg-layer-1);cursor:pointer}.aiNovelAssetList button:hover,.aiNovelCharacterList button:hover,.aiNovelCharacterList button[aria-current=true]{background:var(--dsw-alias-interactive-bg-hover)}.aiNovelAssetList span,.aiNovelCharacterList span{font-size:12px;color:var(--dsw-alias-label-secondary)}
.aiNovelAssetHeading{display:grid;gap:12px}.aiNovelAssetHeading h3,.aiNovelAssetHeading p{margin:0}.aiNovelAssetHeading p{margin-top:3px;font-size:12px;color:var(--dsw-alias-label-tertiary);overflow-wrap:anywhere}.aiNovelBackButton{display:inline-flex;justify-self:start;min-height:34px;align-items:center;gap:7px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;padding:6px 10px;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1);font:inherit;font-weight:500;cursor:pointer}.aiNovelBackButton:hover{background:var(--dsw-alias-interactive-bg-hover)}.aiNovelBackButton:disabled{opacity:.45;cursor:default}
.aiNovelGenerationPanel{display:grid;gap:10px;border:1px solid var(--dsw-alias-border-l2);border-radius:10px;padding:12px;background:var(--dsw-alias-bg-layer-1)}.aiNovelGenerationHeader{display:grid;gap:4px}.aiNovelGenerationHeader h4,.aiNovelGenerationHeader p,.aiNovelGenerationPanel>p{margin:0}.aiNovelGenerationHeader p{font-size:12px;color:var(--dsw-alias-label-secondary)}.aiNovelGenerationButton{justify-self:start}
.aiNovelCharacterToolbar{display:grid;grid-template-columns:1fr auto;align-items:end;gap:8px}.aiNovelCharacterList{display:grid;gap:6px;max-height:210px;overflow:auto;margin:0;padding:0;list-style:none}.aiNovelCharacterEditor{display:grid;gap:12px;margin:0;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;padding:12px}.aiNovelCharacterEditor legend{padding:0 5px;color:var(--dsw-alias-label-secondary)}
.aiNovelRelationshipEditor,.aiNovelCastEditor{display:grid;gap:10px;margin:0;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;padding:10px}.aiNovelRelationshipEditor legend,.aiNovelCastEditor legend{padding:0 5px;color:var(--dsw-alias-label-secondary)}.aiNovelRelationshipRow{display:grid;gap:8px;border-bottom:1px solid var(--dsw-alias-border-l2);padding-bottom:10px}.aiNovelRelationshipRow>button,.aiNovelRelationshipEditor>button{justify-self:start}.aiNovelCastEditor>label{display:flex;align-items:center;gap:8px;min-height:30px;color:var(--dsw-alias-label-primary)}.aiNovelCastEditor input{width:16px;height:16px;margin:0;accent-color:var(--dsw-alias-brand-primary)}
.aiNovelDangerButton{justify-self:start;min-height:32px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;padding:6px 10px;color:var(--dsw-alias-state-error-primary);background:transparent;cursor:pointer}.aiNovelEditorNotice{display:grid;gap:8px;border-left:2px solid var(--dsw-alias-brand-primary);padding-left:10px}.aiNovelEditorNotice p{margin:0}
.aiNovelPluginCard{list-style:none;border:1px solid var(--dsw-alias-border-l2);border-radius:12px;padding:16px;background:var(--dsw-alias-bg-layer-3)}
.aiNovelPluginCardHeader{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.aiNovelPluginCardHeader strong{font-size:15px}.aiNovelPluginCardHeader p{margin:4px 0 0;color:var(--dsw-alias-label-tertiary);font-size:13px}
.aiNovelPluginMounted{flex:none;border-radius:999px;padding:2px 8px;color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-module-platform);font-size:11px}
.aiNovelPluginFacts{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:16px 0}.aiNovelPluginFacts div{min-width:0}.aiNovelPluginFacts dt{font-size:12px;color:var(--dsw-alias-label-tertiary)}.aiNovelPluginFacts dd{margin:2px 0 0;font-size:13px;color:var(--dsw-alias-label-primary)}
@media(max-width:899px){.aiNovelWorkbenchFrameOpen{padding-right:0}.aiNovelContextDrawer{width:100%;min-width:0;max-width:none;padding:18px}.aiNovelContextFacts,.aiNovelPluginFacts{grid-template-columns:1fr}.aiNovelWorkbenchActions{bottom:-18px;margin:0 -18px -18px;padding:14px 18px}}
`;
		/**
		* Install this plugin's context-window styles for one client fiber.
		*
		* @param target Browser document receiving the owned style element.
		* @returns A disposer that removes only this plugin's style element.
		*/
		function installNovelContextStyle(target) {
			const style = target.createElement("style");
			style.dataset.plugin = "@ethanyoq/dsh-ai-novel-writer";
			style.dataset.pluginCss = "@ethanyoq/dsh-ai-novel-writer/context-window";
			style.textContent = novelContextCss;
			target.head.appendChild(style);
			return () => {
				style.remove();
			};
		}
		//#endregion
		//#region src/client/asset-editor.ts
		function objectWithKeys(value, keys, label) {
			if (typeof value !== "object" || value === null || Array.isArray(value)) throw new Error(`${label}格式无效`);
			const record = value;
			if (Object.keys(record).sort().join("\0") !== [...keys].sort().join("\0")) throw new Error(`${label}字段无效`);
			return record;
		}
		function nonEmptyString(value, label) {
			if (typeof value !== "string" || value.trim() === "") throw new Error(`${label}不能为空`);
			return value;
		}
		function plainString(value, label) {
			if (typeof value !== "string") throw new Error(`${label}必须是文本`);
			return value;
		}
		function positiveInteger$1(value, label) {
			const parsed = Number(value);
			if (!Number.isSafeInteger(parsed) || parsed <= 0) throw new Error(`${label}必须是正整数`);
			return parsed;
		}
		function parseCanonicalDate(value, label) {
			const text = nonEmptyString(value, label);
			const milliseconds = Date.parse(text);
			if (!Number.isFinite(milliseconds) || new Date(milliseconds).toISOString() !== text) throw new Error(`${label}格式无效`);
			return text;
		}
		function validateProjectDraft(draft) {
			const fields = {
				title: draft.title.trim(),
				language: draft.language.trim(),
				genre: draft.genre.trim(),
				plannedChapters: positiveInteger$1(draft.plannedChapters, "计划章数"),
				targetWordsPerChapter: positiveInteger$1(draft.targetWordsPerChapter, "每章目标字数"),
				creativeStrategy: draft.creativeStrategy
			};
			if (fields.title === "") throw new Error("小说标题不能为空");
			if (fields.language === "") throw new Error("语言不能为空");
			if (fields.genre === "") throw new Error("类型不能为空");
			return fields;
		}
		/**
		* Parse one authoritative manifest into immutable identity plus editable settings.
		*
		* @param text Canonical JSON bytes returned by the Host exact-read endpoint.
		* @returns Strict manifest fields used to preserve identity during replacement.
		* @throws {Error} When durable JSON, exact fields, ids, settings, or timestamps are invalid.
		*/
		function parseProjectManifest(text) {
			const record = objectWithKeys(JSON.parse(text), [
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
			], "项目设置");
			if (record.formatVersion !== 1 || record.kind !== "harness-novel-project") throw new Error("项目格式不受支持");
			const projectId = nonEmptyString(record.projectId, "项目 ID");
			if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(projectId)) throw new Error("项目 ID 格式无效");
			if (![
				"auto",
				"fluent-drafting",
				"consistency-first",
				"deep-planning"
			].includes(record.creativeStrategy)) throw new Error("创作策略不受支持");
			const plannedChapters = positiveInteger$1(String(record.plannedChapters), "计划章数");
			const targetWordsPerChapter = positiveInteger$1(String(record.targetWordsPerChapter), "每章目标字数");
			return {
				formatVersion: 1,
				kind: "harness-novel-project",
				projectId,
				title: nonEmptyString(record.title, "小说标题"),
				language: nonEmptyString(record.language, "语言"),
				genre: nonEmptyString(record.genre, "类型"),
				plannedChapters: String(plannedChapters),
				targetWordsPerChapter: String(targetWordsPerChapter),
				creativeStrategy: record.creativeStrategy,
				createdAt: parseCanonicalDate(record.createdAt, "创建时间"),
				updatedAt: parseCanonicalDate(record.updatedAt, "更新时间")
			};
		}
		/** @param source Parsed manifest source. @returns Its user-editable settings projection. */
		function projectDraft(source) {
			return {
				title: source.title,
				language: source.language,
				genre: source.genre,
				plannedChapters: source.plannedChapters,
				targetWordsPerChapter: source.targetWordsPerChapter,
				creativeStrategy: source.creativeStrategy
			};
		}
		/**
		* Render project settings as the exact canonical replacement while preserving identity.
		*
		* @param source Parsed immutable manifest source.
		* @param draft User-edited settings.
		* @param updatedAt Canonical timestamp generated when the proposal is previewed.
		* @returns Strict two-space JSON with one trailing LF.
		* @throws {Error} When edited settings or the timestamp are invalid.
		*/
		function serializeProject(source, draft, updatedAt) {
			const validated = validateProjectDraft(draft);
			return `${JSON.stringify({
				formatVersion: 1,
				kind: "harness-novel-project",
				projectId: source.projectId,
				title: validated.title,
				language: validated.language,
				genre: validated.genre,
				plannedChapters: validated.plannedChapters,
				targetWordsPerChapter: validated.targetWordsPerChapter,
				creativeStrategy: validated.creativeStrategy,
				createdAt: source.createdAt,
				updatedAt: parseCanonicalDate(updatedAt, "更新时间")
			}, null, 2)}\n`;
		}
		function parseRelationships(value, label) {
			if (!Array.isArray(value)) throw new Error(`${label}必须是列表`);
			return value.map((item, index) => {
				const record = objectWithKeys(item, [
					"characterId",
					"type",
					"summary"
				], `${label}第 ${index + 1} 项`);
				return {
					characterId: nonEmptyString(record.characterId, "关联人物 ID"),
					type: nonEmptyString(record.type, "关系类型"),
					summary: nonEmptyString(record.summary, "关系说明")
				};
			});
		}
		function relationshipsText(relationships) {
			return relationships.map((item) => `${item.characterId} | ${item.type} | ${item.summary}`).join("\n");
		}
		function relationshipsFromText(text) {
			if (text.trim() === "") return [];
			return text.split(/\r?\n/).filter((line) => line.trim() !== "").map((line, index) => {
				const parts = line.split("|").map((part) => part.trim());
				if (parts.length !== 3 || parts.some((part) => part === "")) throw new Error(`人物关系第 ${index + 1} 行格式无效`);
				return {
					characterId: parts[0],
					type: parts[1],
					summary: parts[2]
				};
			});
		}
		/**
		* Parse the authoritative complete characters asset into editable records.
		*
		* @param text Canonical JSON, or empty text for an absent asset.
		* @param revision Authoritative exact-read revision.
		* @returns Ordered character drafts with relationships represented one per line.
		* @throws {Error} When durable content violates the strict character schema.
		*/
		function parseCharacters(text, revision) {
			if (revision === "absent" && text === "") return [];
			const record = objectWithKeys(JSON.parse(text), ["characters"], "人物设定");
			if (!Array.isArray(record.characters)) throw new Error("人物设定必须是列表");
			const ids = /* @__PURE__ */ new Set();
			return record.characters.map((item, index) => {
				const character = objectWithKeys(item, [
					"id",
					"name",
					"role",
					"summary",
					"goal",
					"relationships",
					"notes"
				], `第 ${index + 1} 个人物`);
				const id = nonEmptyString(character.id, "人物 ID");
				if (ids.has(id)) throw new Error(`人物 ID 重复：${id}`);
				ids.add(id);
				return {
					id,
					name: nonEmptyString(character.name, "人物姓名"),
					role: nonEmptyString(character.role, "人物角色"),
					summary: nonEmptyString(character.summary, "人物摘要"),
					goal: nonEmptyString(character.goal, "人物目标"),
					relationshipsText: relationshipsText(parseRelationships(character.relationships, "人物关系")),
					notes: plainString(character.notes, "人物备注")
				};
			});
		}
		/**
		* Render every character draft as the canonical complete asset.
		*
		* @param characters Ordered character drafts.
		* @returns Strict two-space JSON with one trailing LF.
		* @throws {Error} When ids, required fields, or relationship lines are invalid.
		*/
		function serializeCharacters(characters) {
			const ids = /* @__PURE__ */ new Set();
			const canonical = characters.map((character, index) => {
				const id = nonEmptyString(character.id, `第 ${index + 1} 个人物 ID`).trim();
				if (ids.has(id)) throw new Error(`人物 ID 重复：${id}`);
				ids.add(id);
				return {
					id,
					name: nonEmptyString(character.name, "人物姓名").trim(),
					role: nonEmptyString(character.role, "人物角色").trim(),
					summary: nonEmptyString(character.summary, "人物摘要").trim(),
					goal: nonEmptyString(character.goal, "人物目标").trim(),
					relationships: relationshipsFromText(character.relationshipsText),
					notes: character.notes
				};
			});
			return `${JSON.stringify({ characters: canonical }, null, 2)}\n`;
		}
		function linesFromText(text) {
			return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
		}
		/**
		* Parse one authoritative story blueprint, including the explicit absent asset.
		*
		* @param text Canonical JSON, or empty text for an absent asset.
		* @param revision Authoritative exact-read revision.
		* @returns Editable blueprint fields with one theme per line.
		* @throws {Error} When durable content violates the strict story schema.
		*/
		function parseStoryBlueprint(text, revision) {
			if (revision === "absent" && text === "") return {
				premise: "",
				themesText: "",
				world: "",
				mainPlot: "",
				endingGoal: ""
			};
			const record = objectWithKeys(JSON.parse(text), [
				"premise",
				"themes",
				"world",
				"mainPlot",
				"endingGoal"
			], "故事蓝图");
			if (!Array.isArray(record.themes) || record.themes.some((theme) => typeof theme !== "string")) throw new Error("主题必须是文本列表");
			return {
				premise: nonEmptyString(record.premise, "故事前提"),
				themesText: record.themes.join("\n"),
				world: nonEmptyString(record.world, "世界设定"),
				mainPlot: nonEmptyString(record.mainPlot, "主线"),
				endingGoal: nonEmptyString(record.endingGoal, "结局目标")
			};
		}
		/**
		* Render a story blueprint as the canonical complete asset.
		*
		* @param draft Edited story fields.
		* @returns Strict two-space JSON with one trailing LF.
		* @throws {Error} When required fields are empty.
		*/
		function serializeStoryBlueprint(draft) {
			return `${JSON.stringify({
				premise: nonEmptyString(draft.premise.trim(), "故事前提"),
				themes: linesFromText(draft.themesText),
				world: nonEmptyString(draft.world.trim(), "世界设定"),
				mainPlot: nonEmptyString(draft.mainPlot.trim(), "主线"),
				endingGoal: nonEmptyString(draft.endingGoal.trim(), "结局目标")
			}, null, 2)}\n`;
		}
		/**
		* Parse one authoritative chapter blueprint, including the explicit absent asset.
		*
		* @param text Canonical JSON, or empty text for an absent asset.
		* @param revision Authoritative exact-read revision.
		* @param chapter Chapter number encoded by the asset reference.
		* @returns Editable chapter fields with arrays represented one item per line.
		* @throws {Error} When durable content violates the strict chapter schema.
		*/
		function parseChapterBlueprint(text, revision, chapter) {
			if (revision === "absent" && text === "") return {
				title: "",
				purpose: "",
				beatsText: "",
				characterIdsText: "",
				continuityNotesText: "",
				status: "planned"
			};
			const record = objectWithKeys(JSON.parse(text), [
				"chapter",
				"title",
				"purpose",
				"beats",
				"characterIds",
				"continuityNotes",
				"status"
			], "章节蓝图");
			if (record.chapter !== chapter) throw new Error("章节蓝图编号与目标不一致");
			for (const [value, label] of [
				[record.beats, "情节节拍"],
				[record.characterIds, "人物引用"],
				[record.continuityNotes, "连续性备注"]
			]) if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) throw new Error(`${label}必须是文本列表`);
			if (![
				"planned",
				"drafting",
				"drafted",
				"revised",
				"final"
			].includes(record.status)) throw new Error("章节状态不受支持");
			return {
				title: nonEmptyString(record.title, "章节标题"),
				purpose: nonEmptyString(record.purpose, "章节目的"),
				beatsText: record.beats.join("\n"),
				characterIdsText: record.characterIds.join("\n"),
				continuityNotesText: record.continuityNotes.join("\n"),
				status: record.status
			};
		}
		/**
		* Render one chapter blueprint as the canonical complete asset.
		*
		* @param chapter Chapter number fixed by the asset reference.
		* @param draft Edited planning fields.
		* @returns Strict two-space JSON with one trailing LF.
		* @throws {Error} When the chapter or required fields are invalid.
		*/
		function serializeChapterBlueprint(chapter, draft) {
			if (!Number.isSafeInteger(chapter) || chapter <= 0) throw new Error("章节编号无效");
			return `${JSON.stringify({
				chapter,
				title: nonEmptyString(draft.title.trim(), "章节标题"),
				purpose: nonEmptyString(draft.purpose.trim(), "章节目的"),
				beats: linesFromText(draft.beatsText),
				characterIds: linesFromText(draft.characterIdsText),
				continuityNotes: linesFromText(draft.continuityNotesText),
				status: draft.status
			}, null, 2)}\n`;
		}
		/** @param text Edited Markdown. @returns Markdown with canonical LF newlines. */
		function serializeChapterDraft(text) {
			return text.replace(/\r\n?/g, "\n");
		}
		/**
		* Serialize the exact shallow Agent tool arguments for one replacement proposal.
		*
		* @param target Recognized editable asset.
		* @param baseRevision Revision read before editing.
		* @param replacement Exact canonical replacement text.
		* @param summary User-visible modification summary.
		* @returns Deterministic model prompt using the Agent tool's `targetKind` field.
		* @throws {Error} When the summary is empty.
		*/
		function assetProposalPrompt(target, baseRevision, replacement, summary) {
			return `请提交以下单资产小说修改。\n\n先调用 novel_read 重新读取目标资产并核对 revision。然后仅调用一次 novel_apply_change，并把以下 JSON 对象作为浅层参数原样传入；不要嵌套 request，不要改写任何值：\n\n${JSON.stringify({
				kind: "replace",
				targetKind: target.kind,
				..."chapter" in target ? { chapter: target.chapter } : {},
				baseRevision,
				replacement,
				summary: nonEmptyString(summary, "修改摘要").trim()
			}, null, 2)}\n\n这只是提案。必须等待 Harness 原生审批，并且只有收到 CommitReceipt 后才能声明保存成功。`;
		}
		/** @param left First complete character draft list. @param right Second list. @returns Whether ordered fields match exactly. */
		function sameCharacters(left, right) {
			return JSON.stringify(left) === JSON.stringify(right);
		}
		/**
		* Filter character ids for the compact list without changing the complete asset.
		*
		* @param characters Complete ordered drafts.
		* @param search Case-insensitive id, name, role, summary, or goal query.
		* @returns Matching ids in durable order.
		*/
		function visibleCharacterIds(characters, search) {
			const query = search.trim().toLocaleLowerCase();
			if (query === "") return characters.map((character) => character.id);
			return characters.filter((character) => [
				character.id,
				character.name,
				character.role,
				character.summary,
				character.goal
			].some((value) => value.toLocaleLowerCase().includes(query))).map((character) => character.id);
		}
		//#endregion
		//#region src/client/workbench-store.ts
		/** Dedicated Preset id expected on a Session that receives novel proposals. */
		const AI_NOVEL_PRESET_ID = "ai-novel-writer";
		function assertNever(value) {
			throw new Error(`Unexpected novel workbench value: ${String(value)}`);
		}
		function sameAssetTarget(left, right) {
			if (left.kind !== right.kind) return false;
			if (left.kind === "chapter-blueprint" || left.kind === "chapter-draft") return right.kind === left.kind && right.chapter === left.chapter;
			return true;
		}
		/** Error emitted when the browser has no live Host connection. */
		var NovelWorkbenchDisconnectedError = class extends Error {
			/** @param cause Optional transport failure. */
			constructor(cause) {
				super("Host connection is unavailable", cause === void 0 ? void 0 : { cause });
				this.name = "NovelWorkbenchDisconnectedError";
			}
		};
		const DEFAULT_INITIALIZATION = {
			title: "",
			language: "zh-CN",
			genre: "",
			plannedChapters: "20",
			targetWordsPerChapter: "3000",
			creativeStrategy: "auto"
		};
		function defaultIdentity() {
			const timestamp = (/* @__PURE__ */ new Date()).toISOString();
			return {
				projectId: crypto.randomUUID(),
				createdAt: timestamp,
				updatedAt: timestamp
			};
		}
		function positiveInteger(value, label) {
			const parsed = Number(value);
			if (!Number.isSafeInteger(parsed) || parsed <= 0) throw new Error(`${label}必须是正整数`);
			return parsed;
		}
		function linesFromDraft(text) {
			return text === "" ? [] : text.split("\n");
		}
		function validateInitializationDraft(draft) {
			const fields = {
				title: draft.title.trim(),
				language: draft.language.trim(),
				genre: draft.genre.trim(),
				plannedChapters: positiveInteger(draft.plannedChapters, "计划章数"),
				targetWordsPerChapter: positiveInteger(draft.targetWordsPerChapter, "每章目标字数"),
				creativeStrategy: draft.creativeStrategy
			};
			if (fields.title === "") throw new Error("小说标题不能为空");
			if (fields.language === "") throw new Error("语言不能为空");
			if (fields.genre === "") throw new Error("类型不能为空");
			return fields;
		}
		function initializationProposalJson(identity, fields) {
			return JSON.stringify({
				kind: "initialize",
				projectId: identity.projectId,
				createdAt: identity.createdAt,
				updatedAt: identity.updatedAt,
				...fields
			}, null, 2);
		}
		function initializationPromptFromJson(json) {
			return `请初始化当前 Harness 小说项目。

先调用 novel_read，确认项目尚未初始化。然后仅调用一次 novel_apply_change，并把以下 JSON 对象作为浅层参数原样传入；不要嵌套 request，不要改写任何值：

${json}

这只是提案。必须等待 Harness 原生审批，并且只有收到 CommitReceipt 后才能声明保存成功。`;
		}
		function submissionBlocker(target) {
			if (target === void 0) return "当前没有可用会话，请先打开小说工作区中的会话。";
			if (target.agentPreset !== "ai-novel-writer") return "当前会话未使用“AI 小说作家”Preset，请新建或切换到该 Preset 会话。";
			if (target.approval === "never") return "当前会话已关闭原生审批，请将权限切换为“工作区写入”后再提交。";
			if (target.approval === "unknown") return "无法确认当前会话的审批策略，请切换到“工作区写入”后再提交。";
		}
		function generationState(screen) {
			return screen.generation ?? {
				brief: "",
				phase: "editing"
			};
		}
		function generationPending(screen) {
			const phase = generationState(screen).phase;
			return phase === "submitting" || phase === "submitted";
		}
		function generationBlocksMutation(screen) {
			return generationPending(screen) || generationState(screen).phase === "reconciling";
		}
		function generationAfterAssetEdit(screen) {
			const generation = generationState(screen);
			return generation.phase === "applied" ? {
				brief: generation.brief,
				phase: "editing"
			} : generation;
		}
		function generationTargetLabel(target) {
			switch (target.kind) {
				case "project": return "项目设置";
				case "characters": return "人物设定";
				case "story-blueprint": return "故事蓝图";
				case "chapter-blueprint": return `第 ${target.chapter} 章蓝图`;
				case "chapter-draft": return `第 ${target.chapter} 章正文`;
			}
		}
		function generationSchema(target) {
			switch (target.kind) {
				case "project": return "完整严格 JSON：formatVersion、kind、projectId、title、language、genre、plannedChapters、targetWordsPerChapter、creativeStrategy、createdAt、updatedAt。保留 formatVersion、kind、projectId、createdAt；根据要求与上下文重新生成其余项目设置。本次生成至少修改一个用户可见的项目设置字段（title、language、genre、plannedChapters、targetWordsPerChapter、creativeStrategy）；只修改 updatedAt 是无效生成。updatedAt 必须更新为可往返解析的规范 UTC 时间，严格符合 YYYY-MM-DDTHH:mm:ss.sssZ。";
				case "characters": return "完整严格 JSON：顶层只有 characters；每个人物只能包含 id、name、role、summary、goal、relationships、notes，relationships 项只能包含 characterId、type、summary。";
				case "story-blueprint": return "完整严格 JSON：只包含 premise、themes、world、mainPlot、endingGoal；themes 是文本数组。";
				case "chapter-blueprint": return `完整严格 JSON：只包含 chapter、title、purpose、beats、characterIds、continuityNotes、status；chapter 必须是 ${target.chapter}，三个列表字段都是文本数组。`;
				case "chapter-draft": return "完整 Markdown 正文，不要用 JSON 包裹；保持 UTF-8、LF 换行，并生成可直接保存的整章内容。";
			}
		}
		function canonicalInitializationIdentity(identity) {
			if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(identity.projectId) || identity.createdAt !== identity.updatedAt || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(identity.createdAt) || new Date(identity.createdAt).toISOString() !== identity.createdAt) throw new Error("无法生成规范的项目 ID 或 UTC 时间戳。");
			return identity;
		}
		function generationMarkerLine(marker) {
			return `[AI_NOVEL_UI_CORRELATION:${marker}]`;
		}
		function resolvedGenerationBrief(brief) {
			const trimmed = brief.trim();
			return trimmed === "" ? "没有额外补充要求；请根据当前资产和项目上下文自动完善。" : trimmed;
		}
		function initializationGenerationPrompt(identity, brief, draft) {
			const fixed = JSON.stringify({
				kind: "initialize",
				projectId: identity.projectId,
				createdAt: identity.createdAt,
				updatedAt: identity.updatedAt,
				title: "<根据用户要求生成>",
				language: "<BCP 47 语言标签>",
				genre: "<根据用户要求生成>",
				plannedChapters: "<正整数>",
				targetWordsPerChapter: "<正整数>",
				creativeStrategy: "<auto | fluent-drafting | consistency-first | deep-planning>"
			}, null, 2);
			return `请根据用户要求生成当前 Harness 小说项目的完整项目设置。\n\n用户要求：\n${resolvedGenerationBrief(brief)}\n\n当前工作台中的项目设置草稿仅作为用户意图参考，尚未写入磁盘：\n${JSON.stringify(draft, null, 2)}\n\n硬性执行顺序：\n1. 恰好调用一次 novel_read，读取 working-set，并确认结果为 NOT_INITIALIZED。若结果不同，停止且不得调用 novel_apply_change。\n2. 仅当第 1 步确认 NOT_INITIALIZED 时，恰好调用一次 novel_apply_change，kind 必须是 initialize，使用浅层参数，不要嵌套 request。\n3. projectId、createdAt、updatedAt 必须逐字使用下列固定值；createdAt 必须等于 updatedAt，时间格式严格为 YYYY-MM-DDTHH:mm:ss.sssZ。其余占位字段按要求生成：\n${fixed}\n4. novel_apply_change 会等待 Harness 原生审批结果。只有收到 CommitReceipt 后才能声明保存成功；收到 CommitReceipt 说明原生审批已经完成，最终回复不得再说“等待审批”。拒绝、取消或失败时不得重试写入。`;
		}
		function generationContext(state) {
			return JSON.stringify({
				project: state.project,
				characters: state.characters,
				storyBlueprint: state.storyBlueprint,
				selectedChapter: state.progress.selectedChapter,
				chapterBlueprint: state.chapterBlueprint,
				draftPreview: state.draft?.preview ?? null
			}, null, 2);
		}
		function assetDraftGuidance(screen) {
			switch (screen.kind) {
				case "project": return screen.draft;
				case "characters": return screen.characters.map((character) => ({
					id: character.id,
					name: character.name,
					role: character.role,
					summary: character.summary,
					goal: character.goal,
					relationships: character.relationshipsText,
					notes: character.notes
				}));
				case "story-blueprint": return {
					premise: screen.draft.premise,
					themes: screen.draft.themesText,
					world: screen.draft.world,
					mainPlot: screen.draft.mainPlot,
					endingGoal: screen.draft.endingGoal
				};
				case "chapter-blueprint": return {
					chapter: screen.chapter,
					title: screen.draft.title,
					purpose: screen.draft.purpose,
					beats: screen.draft.beatsText,
					characterIds: screen.draft.characterIdsText,
					continuityNotes: screen.draft.continuityNotesText,
					status: screen.draft.status
				};
				case "chapter-draft": return screen.text;
				default: return assertNever(screen);
			}
		}
		function assetGenerationPrompt(state, screen, brief) {
			const target = screen.kind === "chapter-blueprint" || screen.kind === "chapter-draft" ? {
				kind: screen.kind,
				chapter: screen.chapter
			} : { kind: screen.kind };
			const toolTarget = {
				targetKind: target.kind,
				..."chapter" in target ? { chapter: target.chapter } : {}
			};
			const read = JSON.stringify({
				kind: "asset",
				...toolTarget
			}, null, 2);
			const apply = JSON.stringify({
				kind: "replace",
				...toolTarget,
				baseRevision: screen.baseRevision,
				replacement: "<按下述 schema 生成的完整资产文本>",
				summary: `AI 生成${generationTargetLabel(target)}`
			}, null, 2);
			const draftGuidance = screen.dirty ? `\n当前工作台中的未提交草稿仅作为用户意图参考，尚未写入磁盘：\n${JSON.stringify(assetDraftGuidance(screen), null, 2)}\n` : "";
			return `请根据用户要求生成并提议更新“${generationTargetLabel(target)}”这一个小说资产。不要修改其他资产。

用户要求：
${resolvedGenerationBrief(brief)}
${draftGuidance}

当前工作台上下文仅供生成时保持一致：
${generationContext(state)}

硬性执行顺序：
1. 恰好调用一次 novel_read，并使用以下浅层参数：
${read}
2. 检查返回值未截断、未省略，并且 revision 与编辑器读取时的 revision：${screen.baseRevision} 完全一致。若不一致，停止并告知用户重新读取；不得调用 novel_apply_change。
3. 根据 novel_read 返回的完整 text 与上下文生成完整替换文本。格式要求：${generationSchema(target)}
4. 仅当第 2 步通过时，恰好调用一次 novel_apply_change。使用浅层参数，不要嵌套 request，不要把对象 stringify：
${apply}
5. 第 4 步示例已经显式包含编辑器读取到的 baseRevision；本次 novel_read 与第 2 步一致时必须保留它，不得省略。不要在工具参数中重抄 baseText；SHA-256 revision 是唯一的并发检查值，审批卡会展示完整 replacement。novel_apply_change 会等待 Harness 原生审批结果；只有收到 CommitReceipt 才能声明保存成功。收到 CommitReceipt 说明原生审批已经完成，最终回复不得再说“等待审批”。审批拒绝、取消或工具失败时不得重试写入。`;
		}
		/**
		* Serialize one initialization proposal into the exact model-visible prompt.
		*
		* @param identity Stable project identity and timestamps generated for this proposal.
		* @param draft Validated user fields.
		* @returns Deterministic Chinese instructions containing one shallow JSON object.
		*/
		function initializationProposalPrompt(identity, draft) {
			return initializationPromptFromJson(initializationProposalJson(identity, validateInitializationDraft(draft)));
		}
		/** Workbench controller with abort-on-supersede reads and prompt-to-quiescence disposal. */
		var NovelWorkbenchController = class {
			#listeners = /* @__PURE__ */ new Set();
			#port;
			#reportListenerError;
			#createIdentity;
			#now;
			#state = {
				status: "idle",
				open: false
			};
			#target;
			#draft = DEFAULT_INITIALIZATION;
			#initializationGeneration = {
				brief: "",
				phase: "editing"
			};
			#generationCorrelationMarker;
			#chapter = 1;
			#request = 0;
			#promptRequest = 0;
			#activeRead;
			#activePrompt;
			#projectSource;
			#projectOriginal;
			#charactersOriginal;
			#chapterBlueprintOriginal;
			#chapterDraftOriginal;
			#storyOriginal;
			#staleAsset;
			#latest = Promise.resolve();
			#disposed = false;
			/**
			* @param port Closed context-read and Session-prompt operations.
			* @param reportListenerError Error sink for isolated render subscriber failures.
			* @param createIdentity Identity factory invoked only after local form validation succeeds.
			* @param now Canonical timestamp factory used only when previewing a project-settings replacement.
			*/
			constructor(port, reportListenerError, createIdentity = defaultIdentity, now = () => (/* @__PURE__ */ new Date()).toISOString()) {
				this.#port = port;
				this.#reportListenerError = reportListenerError;
				this.#createIdentity = createIdentity;
				this.#now = now;
			}
			/** @returns Current immutable workbench state. */
			getSnapshot() {
				return this.#state;
			}
			/**
			* @param listener Callback invoked after each state transition.
			* @returns A disposer that removes the subscription.
			*/
			subscribe(listener) {
				this.#listeners.add(listener);
				return () => this.#listeners.delete(listener);
			}
			/**
			* @param target Current Workspace, Session, Preset, and known approval availability.
			* @returns Nothing; use {@link whenIdle} to await a triggered read.
			*/
			setTarget(target) {
				if (this.#disposed) return;
				if (target?.workspaceId === this.#target?.workspaceId && target?.sessionId === this.#target?.sessionId && target?.agentPreset === this.#target?.agentPreset && target?.approval === this.#target?.approval) return;
				this.#promptRequest += 1;
				this.#target = target;
				this.#chapter = 1;
				if (target === void 0) {
					this.#cancelRead();
					this.#set({
						status: "empty",
						open: this.#state.open
					});
				} else this.#startRead("inspect");
			}
			/** @returns Completion after the initial context read settles. */
			open() {
				if (this.#disposed) return Promise.resolve();
				this.#set({
					...this.#state,
					open: true
				});
				return this.#startRead("open");
			}
			/**
			* Read project evidence without opening the drawer, for Plugin Configuration and diagnostics.
			*
			* @returns Completion after the Host read settles.
			*/
			inspect() {
				return this.#startRead("inspect");
			}
			/** @returns Nothing. */
			close() {
				if (this.#disposed) return;
				this.#set({
					...this.#state,
					open: false
				});
			}
			/**
			* Replace initialization draft fields and clear a prior submission result.
			*
			* @param patch Fields changed by the user.
			* @returns Nothing; edits are ignored while prompt admission is pending or the proposal awaits approval.
			* @throws When the project is not in the initialization state.
			*/
			updateInitialization(patch) {
				if (this.#state.status !== "not-initialized") throw new Error("Novel project is not awaiting initialization");
				if (this.#activePrompt !== void 0 || this.#state.initialization.phase === "submitted" || this.#initializationGeneration.phase === "submitted" || this.#initializationGeneration.phase === "reconciling") return;
				this.#draft = {
					...this.#draft,
					...patch
				};
				this.#set({
					status: "not-initialized",
					open: this.#state.open,
					initialization: {
						draft: this.#draft,
						phase: "editing",
						generation: this.#initializationGeneration,
						...submissionBlocker(this.#target) === void 0 ? {} : { blocker: submissionBlocker(this.#target) }
					},
					...this.#state.readFeedback === void 0 ? {} : { readFeedback: this.#state.readFeedback }
				});
			}
			/** Update the optional model brief for generating the first project settings proposal. @param brief User intent, or empty text to use the current form and defaults. @returns Nothing. */
			updateInitializationGenerationBrief(brief) {
				if (this.#state.status !== "not-initialized") return;
				if (this.#activePrompt !== void 0 || this.#initializationGeneration.phase === "submitted" || this.#initializationGeneration.phase === "reconciling") return;
				this.#initializationGeneration = {
					brief,
					phase: "editing"
				};
				this.#publishInitializationGeneration();
			}
			/** Ask the selected Session to generate exactly one approval-gated initialization using the current form as guidance. @returns Session admission completion. */
			async generateInitialization() {
				if (this.#disposed || this.#state.status !== "not-initialized" || this.#activePrompt !== void 0 || this.#initializationGeneration.phase === "submitted" || this.#initializationGeneration.phase === "reconciling") return;
				const message = submissionBlocker(this.#target);
				if (message !== void 0 || this.#target === void 0) {
					this.#initializationGeneration = {
						...this.#initializationGeneration,
						phase: "error",
						message
					};
					this.#publishInitializationGeneration();
					return;
				}
				let identity;
				try {
					identity = canonicalInitializationIdentity(this.#createIdentity());
				} catch (error) {
					this.#initializationGeneration = {
						...this.#initializationGeneration,
						phase: "error",
						message: error instanceof Error ? error.message : String(error)
					};
					this.#publishInitializationGeneration();
					return;
				}
				const marker = crypto.randomUUID();
				this.#generationCorrelationMarker = marker;
				const prompt = `${generationMarkerLine(marker)}\n此标记只供小说工作台对账；不得把它写入任何小说资产或工具参数。\n\n${initializationGenerationPrompt(identity, this.#initializationGeneration.brief, this.#draft)}`;
				this.#initializationGeneration = {
					...this.#initializationGeneration,
					identity,
					phase: "submitting",
					message: void 0
				};
				this.#publishInitializationGeneration();
				const request = ++this.#promptRequest;
				const done = this.#submitInitializationGeneration(request, this.#target.sessionId, prompt);
				this.#activePrompt = done;
				await done;
				if (this.#activePrompt === done) this.#activePrompt = void 0;
				if (this.#initializationGeneration.phase === "reconciling") await this.refresh();
			}
			/**
			* Validate the current draft and expose the exact values that a later Session prompt will carry.
			*
			* @returns Nothing; validation failures are published in initialization state and pending submissions are unchanged.
			*/
			previewInitialization() {
				if (this.#disposed || this.#state.status !== "not-initialized") return;
				if (this.#activePrompt !== void 0 || this.#state.initialization.phase === "submitted" || this.#initializationGeneration.phase === "submitted" || this.#initializationGeneration.phase === "reconciling") return;
				const blocker = submissionBlocker(this.#target);
				if (blocker !== void 0) {
					this.#setInitializationError(blocker);
					return;
				}
				try {
					const fields = validateInitializationDraft(this.#draft);
					const json = initializationProposalJson(this.#createIdentity(), fields);
					const prompt = initializationPromptFromJson(json);
					this.#setInitializationPhase("preview", {
						json,
						prompt
					});
				} catch (error) {
					this.#setInitializationError(error instanceof Error ? error.message : String(error));
				}
			}
			/**
			* Read one recognized editable asset and drill into its compact editor.
			*
			* @param target One recognized editable asset; chapter assets include their fixed chapter number.
			* @returns Completion after the exact revision read settles.
			*/
			openAsset(target) {
				if (this.#disposed || this.#state.status !== "ready") return Promise.resolve();
				this.#promptRequest += 1;
				this.#staleAsset = void 0;
				return this.#startAssetRead(target, "open");
			}
			/** Return a clean editor to the asset list; unsaved or pending state stays visible until explicitly resolved. @returns Nothing. */
			backToAssets() {
				if (this.#disposed || this.#state.status !== "ready") return;
				const screen = this.#assetScreen();
				if (screen !== void 0 && (screen.dirty || screen.phase === "submitting" || screen.phase === "submitted" || screen.phase === "stale" || generationBlocksMutation(screen))) return;
				this.#promptRequest += 1;
				this.#cancelRead();
				this.#staleAsset = void 0;
				this.#setReadyScreen({ kind: "root" });
			}
			/**
			* Update project settings while immutable manifest fields remain controller-owned.
			*
			* @param patch Editable fields changed by the user.
			* @returns Nothing; changes are ignored while prompt admission is pending or approval is awaited.
			*/
			updateProjectSettings(patch) {
				const screen = this.#projectScreen();
				if (screen === void 0 || !this.#assetMayChange(screen)) return;
				const draft = {
					...screen.draft,
					...patch
				};
				const dirty = this.#projectOriginal !== void 0 && JSON.stringify(draft) !== JSON.stringify(this.#projectOriginal);
				this.#setReadyScreen({
					...screen,
					draft,
					dirty,
					phase: dirty ? "editing" : "clean",
					replacement: void 0,
					preview: void 0,
					message: void 0,
					generation: generationAfterAssetEdit(screen)
				});
			}
			/**
			* Update the complete story-blueprint draft.
			*
			* @param patch Story fields changed by the user.
			* @returns Nothing; edits are ignored while prompt admission or approval is pending.
			*/
			updateStoryBlueprint(patch) {
				const screen = this.#storyScreen();
				if (screen === void 0 || !this.#assetMayChange(screen)) return;
				const draft = {
					...screen.draft,
					...patch
				};
				const dirty = this.#storyOriginal !== void 0 && JSON.stringify(draft) !== JSON.stringify(this.#storyOriginal);
				this.#setReadyScreen({
					...screen,
					draft,
					dirty,
					phase: dirty ? "editing" : "clean",
					replacement: void 0,
					preview: void 0,
					message: void 0,
					generation: generationAfterAssetEdit(screen)
				});
			}
			/**
			* Update the selected chapter-blueprint draft.
			*
			* @param patch Planning fields changed by the user.
			* @returns Nothing; edits are ignored while prompt admission or approval is pending.
			*/
			updateChapterBlueprint(patch) {
				const screen = this.#chapterBlueprintScreen();
				if (screen === void 0 || !this.#assetMayChange(screen)) return;
				const draft = {
					...screen.draft,
					...patch
				};
				const dirty = this.#chapterBlueprintOriginal !== void 0 && JSON.stringify(draft) !== JSON.stringify(this.#chapterBlueprintOriginal);
				this.#setReadyScreen({
					...screen,
					draft,
					dirty,
					phase: dirty ? "editing" : "clean",
					replacement: void 0,
					preview: void 0,
					message: void 0,
					generation: generationAfterAssetEdit(screen)
				});
			}
			/**
			* Replace the selected chapter's complete Markdown draft.
			*
			* @param text Complete edited Markdown.
			* @returns Nothing; edits are ignored while prompt admission or approval is pending.
			*/
			updateChapterDraft(text) {
				const screen = this.#chapterDraftScreen();
				if (screen === void 0 || !this.#assetMayChange(screen)) return;
				const dirty = this.#chapterDraftOriginal !== void 0 && text !== this.#chapterDraftOriginal;
				this.#setReadyScreen({
					...screen,
					text,
					dirty,
					phase: dirty ? "editing" : "clean",
					replacement: void 0,
					preview: void 0,
					message: void 0,
					generation: generationAfterAssetEdit(screen)
				});
			}
			/**
			* Replace the human-readable summary attached to the eventual single-asset proposal.
			*
			* @param summary Short explanation shown in the model request and approval card.
			* @returns Nothing; changes are ignored while prompt admission is pending or approval is awaited.
			*/
			updateAssetSummary(summary) {
				const screen = this.#assetScreen();
				if (screen === void 0 || !this.#assetMayChange(screen)) return;
				this.#setReadyScreen({
					...screen,
					summary,
					phase: screen.dirty ? "editing" : "clean",
					preview: void 0,
					message: void 0
				});
			}
			/** Update the selected model's optional generation brief without changing any asset draft. @param brief User intent, or empty text to rely on current context. @returns Nothing. */
			updateAssetGenerationBrief(brief) {
				const screen = this.#assetScreen();
				if (screen === void 0 || generationBlocksMutation(screen)) return;
				this.#setReadyScreen({
					...screen,
					generation: {
						brief,
						phase: "editing"
					}
				});
			}
			/** Ask the selected Session model for one read-then-approval-gated asset proposal, including a dirty form as unsaved guidance. @returns Session admission completion. */
			async generateAsset() {
				const screen = this.#assetScreen();
				if (this.#disposed || screen === void 0 || this.#activePrompt !== void 0 || generationBlocksMutation(screen)) return;
				const currentGeneration = generationState(screen);
				const blocker = submissionBlocker(this.#target);
				const manualProposalPending = screen.phase !== "clean" && screen.phase !== "editing";
				const message = blocker ?? (manualProposalPending ? "当前手动修改已进入提案流程。请在底部提交手动修改到当前会话，或放弃修改后再生成。" : void 0);
				if (message !== void 0 || this.#target === void 0 || this.#state.status !== "ready") {
					this.#setReadyScreen({
						...screen,
						generation: {
							...currentGeneration,
							phase: "error",
							message: message ?? "当前会话不可用。"
						}
					});
					return;
				}
				const marker = crypto.randomUUID();
				this.#generationCorrelationMarker = marker;
				const prompt = `${generationMarkerLine(marker)}\n此标记只供小说工作台对账；不得把它写入任何小说资产或工具参数。\n\n${assetGenerationPrompt(this.#state, screen, currentGeneration.brief)}`;
				this.#cancelRead();
				this.#setReadyScreen({
					...screen,
					generation: {
						brief: currentGeneration.brief,
						phase: "submitting"
					}
				});
				const request = ++this.#promptRequest;
				const done = this.#submitGeneration(request, this.#target.sessionId, prompt);
				this.#activePrompt = done;
				await done;
				if (this.#activePrompt === done) this.#activePrompt = void 0;
				if (this.#assetScreen() !== void 0 && generationState(this.#assetScreen()).phase === "reconciling") await this.refresh();
			}
			/**
			* Filter the in-memory characters list without changing durable content.
			*
			* @param search Case-insensitive id, name, role, summary, or goal query.
			* @returns Nothing.
			*/
			setCharacterSearch(search) {
				const screen = this.#charactersScreen();
				if (screen === void 0) return;
				this.#setReadyScreen({
					...screen,
					search,
					visibleCharacterIds: visibleCharacterIds(screen.characters, search)
				});
			}
			/**
			* Select one existing character record.
			*
			* @param id Stable character id in the current complete asset.
			* @returns Nothing.
			* @throws {Error} When the id is not present.
			*/
			selectCharacter(id) {
				const screen = this.#charactersScreen();
				if (screen === void 0) return;
				if (!screen.characters.some((character) => character.id === id)) throw new Error("Character does not exist");
				this.#setReadyScreen({
					...screen,
					selectedId: id
				});
			}
			/**
			* Add and select one empty character draft.
			*
			* @returns Nothing; the stable internal id is generated automatically and submitted editors are unchanged.
			*/
			createCharacter() {
				const screen = this.#charactersScreen();
				if (screen === void 0 || !this.#assetMayChange(screen)) return;
				const generatedId = crypto.randomUUID();
				if (screen.characters.some((character) => character.id === generatedId)) {
					this.#setReadyScreen({
						...screen,
						phase: "error",
						message: "无法生成唯一的人物标识，请重试。"
					});
					return;
				}
				const characters = [...screen.characters, {
					id: generatedId,
					name: "",
					role: "",
					summary: "",
					goal: "",
					relationshipsText: "",
					notes: ""
				}];
				this.#setCharactersDraft(screen, characters, generatedId);
			}
			/**
			* Update the selected character record.
			*
			* @param patch Editable character fields.
			* @returns Nothing; changes are ignored without a selection or during prompt admission.
			*/
			updateCharacter(patch) {
				const screen = this.#charactersScreen();
				if (screen === void 0 || screen.selectedId === void 0 || !this.#assetMayChange(screen)) return;
				const selectedIndex = screen.characters.findIndex((character) => character.id === screen.selectedId);
				const characters = screen.characters.map((character) => character.id === screen.selectedId ? {
					...character,
					...patch
				} : character);
				this.#setCharactersDraft(screen, characters, characters[selectedIndex]?.id);
			}
			/** Remove the selected character from the proposed complete asset. @returns Nothing. */
			deleteCharacter() {
				const screen = this.#charactersScreen();
				if (screen === void 0 || screen.selectedId === void 0 || !this.#assetMayChange(screen)) return;
				const index = screen.characters.findIndex((character) => character.id === screen.selectedId);
				const characters = screen.characters.filter((character) => character.id !== screen.selectedId);
				const selectedId = characters[Math.min(index, characters.length - 1)]?.id;
				this.#setCharactersDraft(screen, characters, selectedId);
			}
			/** Validate and expose the exact single-asset replacement prompt. @returns Nothing; errors remain visible in editor state. */
			previewAssetChange() {
				const screen = this.#assetScreen();
				if (screen === void 0 || this.#activePrompt !== void 0 || screen.phase === "submitted" || screen.phase === "stale") return;
				const blocker = submissionBlocker(this.#target);
				if (blocker !== void 0 || !screen.dirty) {
					this.#setReadyScreen({
						...screen,
						phase: "error",
						message: blocker ?? "没有需要提交的修改。"
					});
					return;
				}
				try {
					const replacement = screen.kind === "project" ? serializeProject(this.#requiredProjectSource(), screen.draft, this.#now()) : screen.kind === "characters" ? serializeCharacters(screen.characters) : screen.kind === "story-blueprint" ? serializeStoryBlueprint(screen.draft) : screen.kind === "chapter-blueprint" ? serializeChapterBlueprint(screen.chapter, screen.draft) : serializeChapterDraft(screen.text);
					const prompt = assetProposalPrompt(this.#screenTarget(screen), screen.baseRevision, replacement, screen.summary);
					this.#setReadyScreen({
						...screen,
						phase: "preview",
						replacement,
						preview: {
							prompt,
							replacement
						},
						message: void 0
					});
				} catch (error) {
					this.#setReadyScreen({
						...screen,
						phase: "error",
						message: error instanceof Error ? error.message : String(error)
					});
				}
			}
			/**
			* Submit the exact preview through the selected Session without writing from the browser.
			*
			* @returns Completion after Session admission; duplicate and stale submissions return immediately.
			*/
			async submitAssetChange() {
				const screen = this.#assetScreen();
				if (this.#disposed || screen === void 0 || this.#activePrompt !== void 0 || screen.preview === void 0 || screen.phase !== "preview" && screen.phase !== "error") return;
				const target = this.#target;
				const blocker = submissionBlocker(target);
				if (target === void 0 || blocker !== void 0) {
					this.#setReadyScreen({
						...screen,
						phase: "error",
						message: blocker ?? "请先预览修改。"
					});
					return;
				}
				this.#cancelRead();
				this.#setReadyScreen({
					...screen,
					phase: "submitting",
					message: void 0
				});
				const request = ++this.#promptRequest;
				const done = this.#submitAsset(request, target.sessionId, screen.preview.prompt);
				this.#activePrompt = done;
				await done;
				if (this.#activePrompt === done) this.#activePrompt = void 0;
			}
			/**
			* Publish one completed `novel_apply_change` outcome before its authoritative asset reread.
			*
			* @param outcome Durable tool error identity; successful values remain filesystem-authoritative.
			* @returns Nothing; rejected edits stay dirty and no result is interpreted as a browser write.
			*/
			novelApplySettled(outcome) {
				if (this.#disposed) return;
				const editor = this.#assetScreen();
				const editorGeneration = editor === void 0 ? void 0 : generationState(editor);
				if (editor !== void 0 && editorGeneration?.phase === "submitted" && outcome.attribution?.kind === "replace" && outcome.attribution.targetKind === editor.kind && outcome.attribution.chapter === ("chapter" in editor ? editor.chapter : void 0) && outcome.attribution.baseRevision === editor.baseRevision) {
					if (!outcome.isError) {
						this.#setReadyScreen({
							...editor,
							generation: {
								...editorGeneration,
								...outcome.newRevision === void 0 ? {} : { expectedRevision: outcome.newRevision },
								expectedReplacement: outcome.attribution.replacement,
								message: "模型生成已通过工具执行，正在重新读取已批准的资产。"
							}
						});
						return;
					}
					this.#setReadyScreen({
						...editor,
						generation: {
							...editorGeneration,
							phase: "error",
							message: outcome.code === "APPROVAL_REJECTED" ? "Harness 原生审批已拒绝；磁盘未改变。" : outcome.code === "STALE_REVISION" ? "生成提案使用的 revision 已过期；请重新读取后再生成。" : outcome.code === void 0 ? "生成提案未保存；请查看对话中的工具结果。" : `生成提案未保存：${outcome.code}`
						}
					});
					return;
				}
				if (editor !== void 0 && editor.phase === "submitted" && outcome.isError && outcome.attribution?.kind === "replace" && outcome.attribution.targetKind === editor.kind && outcome.attribution.chapter === ("chapter" in editor ? editor.chapter : void 0) && outcome.attribution.baseRevision === editor.baseRevision && outcome.attribution.replacement === editor.replacement) {
					if (outcome.code === "STALE_REVISION") {
						this.#setReadyScreen({
							...editor,
							phase: "stale",
							message: "提交使用的 revision 已过期。当前提案仍保留；重新读取最新版本后再核对修改。"
						});
						return;
					}
					const rejected = outcome.code === "APPROVAL_REJECTED";
					this.#setReadyScreen({
						...editor,
						phase: "error",
						message: rejected ? "Harness 原生审批已拒绝；磁盘未改变，当前修改仍保留。" : outcome.code === void 0 ? "修改未保存；原生审批可能被拒绝或工具执行失败。当前修改仍保留，请查看对话详情。" : `修改未保存：${outcome.code}`
					});
					return;
				}
				if (this.#state.status === "not-initialized" && this.#state.initialization.phase === "submitted" && outcome.isError && outcome.attribution?.kind === "initialize" && outcome.attribution.requestJson === this.#state.initialization.preview?.json) {
					this.#setInitializationError(outcome.code === "APPROVAL_REJECTED" ? "Harness 原生审批已拒绝；小说项目仍未初始化。" : outcome.code === void 0 ? "初始化未保存；原生审批可能被拒绝或工具执行失败。请查看对话详情。" : `初始化未保存：${outcome.code}`);
					return;
				}
				if (this.#state.status === "not-initialized" && this.#initializationGeneration.phase === "submitted" && outcome.attribution?.kind === "initialize") {
					const identity = this.#initializationGeneration.identity;
					let attributed;
					try {
						attributed = JSON.parse(outcome.attribution.requestJson);
					} catch {
						attributed = void 0;
					}
					if (identity !== void 0 && attributed?.projectId === identity.projectId && attributed.createdAt === identity.createdAt && attributed.updatedAt === identity.updatedAt) {
						this.#initializationGeneration = outcome.isError ? {
							...this.#initializationGeneration,
							phase: "error",
							message: outcome.code === "APPROVAL_REJECTED" ? "Harness 原生审批已拒绝；小说项目仍未初始化。" : `项目设置生成未保存${outcome.code === void 0 ? "。" : `：${outcome.code}`}`
						} : {
							...this.#initializationGeneration,
							...outcome.newRevision === void 0 ? {} : { expectedRevision: outcome.newRevision },
							message: "模型生成已通过工具执行，正在重新读取项目。"
						};
						this.#publishInitializationGeneration();
					}
				}
			}
			/** Mark the admitted generation turn complete and require an authoritative reread before another generation. @returns Nothing. */
			generationTurnSettled() {
				if (this.#disposed) return;
				const editor = this.#assetScreen();
				if (editor !== void 0 && (generationState(editor).phase === "submitting" || generationState(editor).phase === "submitted")) {
					this.#setReadyScreen({
						...editor,
						generation: {
							...generationState(editor),
							phase: "reconciling",
							message: "模型轮次已结束，正在通过权威资产读取确认结果。"
						}
					});
					return;
				}
				if (this.#state.status === "not-initialized" && (this.#initializationGeneration.phase === "submitting" || this.#initializationGeneration.phase === "submitted")) {
					this.#initializationGeneration = {
						...this.#initializationGeneration,
						phase: "reconciling",
						message: "模型轮次已结束，正在通过权威项目读取确认结果。"
					};
					this.#publishInitializationGeneration();
				}
			}
			/** @returns Correlation marker for the unresolved model-generation prompt, if any. */
			currentGenerationCorrelationMarker() {
				const editor = this.#assetScreen();
				const editorPhase = editor === void 0 ? void 0 : generationState(editor).phase;
				return editorPhase === "submitting" || editorPhase === "submitted" || editorPhase === "reconciling" || this.#initializationGeneration.phase === "submitting" || this.#initializationGeneration.phase === "submitted" || this.#initializationGeneration.phase === "reconciling" ? this.#generationCorrelationMarker : void 0;
			}
			/** Fail an unresolved generation whose admitted queue row vanished before durable execution. @returns Nothing. */
			generationPromptLost() {
				if (this.#disposed) return;
				const editor = this.#assetScreen();
				if (editor !== void 0 && generationBlocksMutation(editor)) {
					this.#promptRequest += 1;
					this.#generationCorrelationMarker = void 0;
					this.#setReadyScreen({
						...editor,
						generation: {
							...generationState(editor),
							phase: "error",
							message: "生成请求已从会话队列移除，且未形成可对账的用户消息；未执行小说修改，可以重试。"
						}
					});
					return;
				}
				if (this.#state.status === "not-initialized" && (this.#initializationGeneration.phase === "submitting" || this.#initializationGeneration.phase === "submitted" || this.#initializationGeneration.phase === "reconciling")) {
					this.#promptRequest += 1;
					this.#generationCorrelationMarker = void 0;
					this.#initializationGeneration = {
						...this.#initializationGeneration,
						phase: "error",
						message: "生成请求已从会话队列移除，且未形成可对账的用户消息；项目仍未初始化，可以重试。"
					};
					this.#publishInitializationGeneration();
				}
			}
			/** Replace a stale dirty editor with the latest authoritative asset. @returns Nothing. */
			reloadStaleAsset() {
				const latest = this.#staleAsset;
				const editor = this.#assetScreen();
				if (latest === void 0) {
					if (editor !== void 0 && editor.phase === "stale") this.#startAssetRead(this.#screenTarget(editor), "reload");
					return;
				}
				if (this.#state.status !== "ready") return;
				this.#staleAsset = void 0;
				this.#loadAsset(latest);
			}
			/** Restore the exact base asset and discard unsent local edits. @returns Nothing. */
			discardAssetChanges() {
				const screen = this.#assetScreen();
				if (screen === void 0 || this.#activePrompt !== void 0) return;
				const target = this.#screenTarget(screen);
				this.#loadAsset({
					target,
					revision: screen.baseRevision,
					text: screen.originalText,
					bytes: new TextEncoder().encode(screen.originalText).byteLength
				});
			}
			/**
			* Select and read one planned chapter while the workbench is open.
			*
			* @param chapter One-based chapter number within the loaded project plan.
			* @returns Completion after the read settles; invalid selections publish recoverable feedback without reading.
			*/
			selectChapter(chapter) {
				const planned = this.#state.status === "ready" ? this.#state.project.plannedChapters : void 0;
				if (!Number.isSafeInteger(chapter) || chapter <= 0 || planned !== void 0 && chapter > planned) {
					if (this.#state.status === "ready") this.#set({
						...this.#state,
						readFeedback: {
							kind: "error",
							message: `章节编号必须在 1 到 ${this.#state.project.plannedChapters} 之间。`
						}
					});
					return Promise.resolve();
				}
				this.#chapter = chapter;
				return this.#state.open ? this.#startRead("refresh") : Promise.resolve();
			}
			/**
			* Validate and submit the current initialization proposal through the selected Session.
			*
			* @returns Completion after the Session accepts or rejects the queued prompt; duplicates return immediately.
			*/
			async submitInitialization() {
				if (this.#disposed || this.#state.status !== "not-initialized") return;
				if (this.#activePrompt !== void 0 || this.#state.initialization.phase === "submitting" || this.#state.initialization.phase === "submitted" || this.#initializationGeneration.phase === "submitted" || this.#initializationGeneration.phase === "reconciling") return;
				const target = this.#target;
				const blocker = submissionBlocker(target);
				if (blocker !== void 0 || target === void 0) {
					this.#setInitializationError(blocker ?? "当前没有可用会话，请先打开小说工作区中的会话。");
					return;
				}
				const preview = this.#state.initialization.preview;
				if (preview === void 0) {
					this.#setInitializationError("请先预览并确认初始化提案的完整值。");
					return;
				}
				this.#setInitializationPhase("submitting", preview);
				const request = ++this.#promptRequest;
				const done = this.#submit(request, target.sessionId, preview.prompt);
				this.#activePrompt = done;
				await done;
				if (this.#activePrompt === done) this.#activePrompt = void 0;
				this.#resetStalePromptState(request);
			}
			/** @returns Completion after an explicit reread settles, or immediately while closed. */
			refresh() {
				if (this.#activePrompt !== void 0) return Promise.resolve();
				const screen = this.#assetScreen();
				if (screen !== void 0) return this.#startAssetRead(this.#screenTarget(screen), "refresh");
				if (!this.#state.open) return Promise.resolve();
				return this.#startRead("refresh");
			}
			/** Abort the active read and expose disconnected state without waiting for settlement. @returns Nothing. */
			disconnected() {
				if (this.#disposed) return;
				this.#cancelRead();
				if (this.#activePrompt !== void 0) {
					const pendingEditor = this.#assetScreen();
					if (pendingEditor !== void 0) {
						const generation = generationState(pendingEditor);
						this.#setReadyScreen(generation.phase === "submitting" ? {
							...pendingEditor,
							generation: {
								...generation,
								message: "Harness 连接已断开；生成请求是否已进入会话尚未确定，结果返回前不能重试。"
							}
						} : {
							...pendingEditor,
							phase: "submitting",
							message: "Harness 连接已断开；提案是否已进入会话尚未确定，结果返回前不能重试。"
						}, {
							kind: "disconnected",
							message: "Harness 连接已断开，正在等待原提案结果。"
						});
					} else if (this.#state.status === "not-initialized") this.#set({
						...this.#state,
						initialization: {
							...this.#state.initialization,
							phase: "submitting",
							message: "Harness 连接已断开；初始化提案是否已进入会话尚未确定，结果返回前不能重试。"
						},
						readFeedback: {
							kind: "disconnected",
							message: "Harness 连接已断开，正在等待原提案结果。"
						}
					});
					return;
				}
				this.#promptRequest += 1;
				const editor = this.#assetScreen();
				if (editor !== void 0) {
					this.#setReadyScreen({
						...editor,
						phase: "error",
						message: "Harness 连接已断开；当前未发送修改仍保留在浏览器中。"
					}, {
						kind: "disconnected",
						message: "读取失败：Harness 连接已断开。"
					});
					return;
				}
				this.#set({
					status: "disconnected",
					open: this.#state.open,
					readFeedback: {
						kind: "disconnected",
						message: "读取失败：Harness 连接已断开。"
					}
				});
			}
			/** @returns Completion after the latest triggered read and prompt settle. */
			async whenIdle() {
				let latest;
				do {
					latest = this.#latest;
					await latest;
				} while (latest !== this.#latest);
				await this.#activePrompt;
			}
			/** Abort reads, await the non-cancellable Session prompt, and stop publishing state. @returns Quiescent completion. */
			async dispose() {
				if (this.#disposed) return;
				this.#disposed = true;
				this.#listeners.clear();
				this.#cancelRead();
				await Promise.all([this.whenIdle(), this.#activePrompt]);
			}
			#startRead(reason = "open") {
				const latest = this.#runRead(reason);
				this.#latest = latest;
				return latest;
			}
			#startAssetRead(target, reason) {
				const latest = this.#runAssetRead(target, reason);
				this.#latest = latest;
				return latest;
			}
			async #runAssetRead(target, reason) {
				if (this.#disposed || this.#state.status !== "ready") return;
				const selected = this.#target;
				if (selected === void 0) return;
				const request = ++this.#request;
				const previous = this.#activeRead;
				previous?.abort.abort();
				if (reason === "open") this.#setReadyScreen({
					kind: "asset-loading",
					target
				});
				else this.#set({
					...this.#state,
					readFeedback: {
						kind: "loading",
						message: "正在重新读取当前资产…"
					}
				});
				await previous?.done;
				if (this.#disposed || request !== this.#request) return;
				const abort = new AbortController();
				const done = this.#settleAssetRead(request, selected, target, reason, abort.signal);
				const active = {
					abort,
					done
				};
				this.#activeRead = active;
				await done;
				if (this.#activeRead === active) this.#activeRead = void 0;
			}
			async #settleAssetRead(request, selected, target, reason, signal) {
				try {
					const result = await this.#port.readAsset(selected.workspaceId, target, signal);
					if (this.#disposed || request !== this.#request || this.#state.status !== "ready") return;
					if (!sameAssetTarget(result.target, target)) throw new Error("Host returned a different novel asset");
					if (reason === "reload") {
						this.#staleAsset = void 0;
						this.#loadAsset(result, {
							kind: "success",
							message: "重新载入完成：已载入最新资产 revision。"
						});
						return;
					}
					const current = this.#assetScreen();
					if (reason === "refresh" && current?.phase === "submitted" && result.revision === current.baseRevision) {
						this.#setReadyScreen({
							...current,
							message: "提案已发送，正在等待原生审批或资产 revision 更新。"
						}, {
							kind: "success",
							message: "重新读取完成：资产尚未发生已批准的修改。"
						});
						return;
					}
					if (reason === "refresh" && current !== void 0 && (generationState(current).phase === "submitted" || generationState(current).phase === "reconciling")) {
						const pending = generationState(current);
						if (pending.expectedRevision !== void 0 && result.revision === pending.expectedRevision || pending.expectedRevision === void 0 && pending.expectedReplacement !== void 0 && result.text === pending.expectedReplacement) {
							this.#staleAsset = void 0;
							const message = `模型生成已批准并载入 revision ${result.revision.slice(0, 12)}；上方字段是磁盘中的最终内容。`;
							this.#loadAsset(result, {
								kind: "success",
								message
							});
							const loaded = this.#assetScreen();
							if (loaded !== void 0 && sameAssetTarget(loaded, result.target)) this.#setReadyScreen({
								...loaded,
								generation: {
									brief: pending.brief,
									phase: "applied",
									message,
									expectedRevision: result.revision,
									expectedReplacement: result.text
								}
							});
						} else if (pending.expectedReplacement === void 0 && result.revision === current.baseRevision) this.#setReadyScreen({
							...current,
							generation: pending.phase === "reconciling" ? {
								...pending,
								phase: "error",
								message: "模型轮次未产生可归因的修改；磁盘仍保持生成前的 revision。可以修改要求后重试。"
							} : {
								...pending,
								message: "生成请求已发送，正在等待模型提案、原生审批或资产 revision 更新。"
							}
						}, {
							kind: "success",
							message: "重新读取完成：资产尚未发生已批准的生成修改。"
						});
						else {
							this.#staleAsset = result;
							this.#setReadyScreen({
								...current,
								phase: "stale",
								latestRevision: result.revision,
								message: pending.expectedReplacement === void 0 ? "模型生成等待审批期间资产发生了其他修改。请重新载入后再生成。" : "批准后的资产内容与模型提交的完整替换文本不一致。请重新载入并核对。",
								generation: {
									...pending,
									phase: "error",
									message: "未把当前磁盘内容识别为本次模型生成结果。"
								}
							}, {
								kind: "success",
								message: "重新读取完成：发现了不属于本次生成提案的资产 revision。"
							});
						}
						return;
					}
					if (reason === "refresh" && current !== void 0 && generationState(current).phase === "error" && result.revision === current.baseRevision) {
						this.#setReadyScreen(current, {
							kind: "success",
							message: "重新读取完成：磁盘仍保持生成前的 revision。"
						});
						return;
					}
					if (reason === "refresh" && current?.phase === "submitted" && result.revision !== current.baseRevision) {
						if (current.replacement === result.text) {
							this.#staleAsset = void 0;
							this.#loadAsset(result, {
								kind: "success",
								message: "重新读取完成：已载入批准后的资产 revision。"
							});
						} else {
							this.#staleAsset = result;
							this.#setReadyScreen({
								...current,
								phase: "stale",
								latestRevision: result.revision,
								message: "资产已被其他修改更新，内容与已提交提案不一致。提案仍保留，请核对后重新载入。"
							}, {
								kind: "success",
								message: "重新读取完成：发现了不同于已提交提案的资产 revision。"
							});
						}
						return;
					}
					if (reason === "refresh" && current !== void 0 && current.dirty && result.revision !== current.baseRevision) {
						this.#staleAsset = result;
						this.#setReadyScreen({
							...current,
							phase: "stale",
							latestRevision: result.revision,
							message: "磁盘内容已变化。当前未发送修改已保留；重新载入后才能继续提交。"
						}, {
							kind: "success",
							message: "重新读取完成：发现了更新的资产 revision。"
						});
						return;
					}
					if (reason === "refresh" && current !== void 0 && current.dirty) {
						this.#setReadyScreen(current, {
							kind: "success",
							message: "重新读取完成：当前 revision 未变化。"
						});
						return;
					}
					this.#staleAsset = void 0;
					this.#loadAsset(result, {
						kind: "success",
						message: "读取完成：已载入精确资产 revision。"
					});
				} catch (error) {
					if (this.#disposed || request !== this.#request || this.#state.status !== "ready") return;
					const message = error instanceof Error ? error.message : String(error);
					const current = this.#assetScreen();
					if (current !== void 0) this.#setReadyScreen({
						...current,
						phase: current.phase === "stale" ? "stale" : "error",
						message: current.phase === "stale" ? `提交使用的 revision 已过期；重新读取失败：${message}` : message
					}, {
						kind: error instanceof NovelWorkbenchDisconnectedError ? "disconnected" : "error",
						message: error instanceof NovelWorkbenchDisconnectedError ? "读取失败：Harness 连接已断开。" : `读取失败：${message}`
					});
					else this.#setReadyScreen({
						kind: "asset-error",
						target,
						message
					});
				}
			}
			async #runRead(reason) {
				if (this.#disposed) return;
				const target = this.#target;
				if (target === void 0) {
					this.#set({
						status: "empty",
						open: this.#state.open
					});
					return;
				}
				const request = ++this.#request;
				const previous = this.#activeRead;
				previous?.abort.abort();
				const feedback = {
					kind: "loading",
					message: reason === "refresh" ? "正在重新读取小说项目…" : "正在读取小说项目状态…"
				};
				this.#set(reason === "refresh" && this.#state.status === "not-initialized" ? {
					...this.#state,
					readFeedback: feedback
				} : {
					status: "loading",
					open: this.#state.open,
					readFeedback: feedback
				});
				await previous?.done;
				if (this.#disposed || request !== this.#request) return;
				const abort = new AbortController();
				const done = this.#settleRead(request, target, abort.signal);
				const active = {
					abort,
					done
				};
				this.#activeRead = active;
				await done;
				if (this.#activeRead === active) this.#activeRead = void 0;
				const generatedInitialization = this.#initializationGeneration;
				if (this.#disposed || this.#state.status !== "ready" || generatedInitialization.phase !== "reconciling" || generatedInitialization.expectedRevision === void 0) return;
				await this.#startAssetRead({ kind: "project" }, "open");
				const project = this.#assetScreen();
				if (project?.kind !== "project") return;
				this.#initializationGeneration = {
					brief: "",
					phase: "editing"
				};
				this.#generationCorrelationMarker = void 0;
				if (project.baseRevision !== generatedInitialization.expectedRevision) {
					this.#setReadyScreen({
						...project,
						generation: {
							brief: generatedInitialization.brief,
							phase: "error",
							message: "项目已初始化，但磁盘 revision 与本次模型生成回执不一致。请核对对话中的工具结果。"
						}
					});
					return;
				}
				const message = `模型生成已批准并载入 revision ${project.baseRevision.slice(0, 12)}；上方字段是磁盘中的最终内容。`;
				this.#setReadyScreen({
					...project,
					generation: {
						brief: generatedInitialization.brief,
						phase: "applied",
						message,
						expectedRevision: project.baseRevision,
						expectedReplacement: project.originalText
					}
				}, {
					kind: "success",
					message
				});
			}
			async #settleRead(request, target, signal) {
				try {
					const result = await this.#port.read(target.workspaceId, this.#chapter, signal);
					if (this.#disposed || request !== this.#request) return;
					if (result.status === "not-initialized" && this.#initializationGeneration.phase === "reconciling") this.#initializationGeneration = {
						...this.#initializationGeneration,
						phase: "error",
						message: this.#initializationGeneration.expectedRevision === void 0 ? "模型轮次未产生可归因的初始化；项目仍未初始化。可以修改要求后重试。" : "工具报告初始化成功，但权威读取仍显示项目未初始化。请先检查对话中的工具结果。"
					};
					this.#set(result.status === "ready" ? {
						...result,
						open: this.#state.open,
						screen: { kind: "root" },
						...submissionBlocker(this.#target) === void 0 ? {} : { submissionBlocker: submissionBlocker(this.#target) },
						readFeedback: {
							kind: "success",
							message: "读取完成：小说项目已初始化。"
						}
					} : {
						status: "not-initialized",
						open: this.#state.open,
						initialization: {
							draft: this.#draft,
							phase: this.#state.status === "not-initialized" && this.#state.initialization.phase === "submitted" ? "submitted" : this.#activePrompt === void 0 ? "editing" : "submitting",
							generation: this.#initializationGeneration,
							...this.#state.status === "not-initialized" && this.#state.initialization.preview !== void 0 ? { preview: this.#state.initialization.preview } : {},
							...submissionBlocker(this.#target) === void 0 ? {} : { blocker: submissionBlocker(this.#target) }
						},
						readFeedback: {
							kind: "success",
							message: "读取完成：当前工作区尚未初始化小说项目。"
						}
					});
				} catch (error) {
					if (this.#disposed || request !== this.#request) return;
					if (error instanceof NovelWorkbenchDisconnectedError) this.#set({
						status: "disconnected",
						open: this.#state.open,
						readFeedback: {
							kind: "disconnected",
							message: "读取失败：Harness 连接已断开。"
						}
					});
					else {
						const message = error instanceof Error ? error.message : String(error);
						this.#set({
							status: "error",
							open: this.#state.open,
							message,
							readFeedback: {
								kind: "error",
								message: `读取失败：${message}`
							}
						});
					}
				}
			}
			async #submit(request, sessionId, text) {
				try {
					const result = await this.#port.prompt(sessionId, text);
					if (this.#disposed || request !== this.#promptRequest) return;
					if (result.ok) this.#setInitializationPhase("submitted");
					else this.#setInitializationError(`初始化提案未发送：${result.error.code}: ${result.error.message}`);
				} catch (error) {
					if (!this.#disposed && request === this.#promptRequest) this.#setInitializationError(`初始化提案未发送：${error instanceof Error ? error.message : String(error)}`);
				}
			}
			async #submitAsset(request, sessionId, text) {
				try {
					const result = await this.#port.prompt(sessionId, text);
					if (this.#disposed || request !== this.#promptRequest) return;
					const screen = this.#assetScreen();
					if (screen === void 0) return;
					this.#setReadyScreen(result.ok ? {
						...screen,
						phase: "submitted",
						message: "修改提案已发送；磁盘仍未改变，等待 Harness 原生审批。"
					} : {
						...screen,
						phase: "error",
						message: `修改提案未发送：${result.error.code}: ${result.error.message}`
					});
				} catch (error) {
					if (this.#disposed || request !== this.#promptRequest) return;
					const screen = this.#assetScreen();
					if (screen !== void 0) this.#setReadyScreen({
						...screen,
						phase: "error",
						message: `修改提案未发送：${error instanceof Error ? error.message : String(error)}`
					});
				}
			}
			async #submitGeneration(request, sessionId, text) {
				try {
					const result = await this.#port.prompt(sessionId, text);
					if (this.#disposed || request !== this.#promptRequest) return;
					const screen = this.#assetScreen();
					if (screen === void 0) return;
					const generation = generationState(screen);
					this.#setReadyScreen({
						...screen,
						generation: result.ok ? generation.phase === "reconciling" ? generation : {
							...generation,
							phase: "submitted",
							message: "生成请求已发送；等待模型提案与 Harness 原生审批。"
						} : {
							...generation,
							phase: "error",
							message: `生成请求未发送：${result.error.code}: ${result.error.message}`
						}
					});
				} catch (error) {
					if (this.#disposed || request !== this.#promptRequest) return;
					const screen = this.#assetScreen();
					if (screen !== void 0) {
						const generation = generationState(screen);
						this.#setReadyScreen({
							...screen,
							generation: {
								...generation,
								phase: "error",
								message: `生成请求未发送：${error instanceof Error ? error.message : String(error)}`
							}
						});
					}
				}
			}
			async #submitInitializationGeneration(request, sessionId, text) {
				try {
					const result = await this.#port.prompt(sessionId, text);
					if (this.#disposed || request !== this.#promptRequest) return;
					this.#initializationGeneration = result.ok ? this.#initializationGeneration.phase === "reconciling" ? this.#initializationGeneration : {
						...this.#initializationGeneration,
						phase: "submitted",
						message: "生成请求已发送；等待模型提案与 Harness 原生审批。"
					} : {
						...this.#initializationGeneration,
						phase: "error",
						message: `生成请求未发送：${result.error.code}: ${result.error.message}`
					};
					this.#publishInitializationGeneration();
				} catch (error) {
					if (this.#disposed || request !== this.#promptRequest) return;
					this.#initializationGeneration = {
						...this.#initializationGeneration,
						phase: "error",
						message: `生成请求未发送：${error instanceof Error ? error.message : String(error)}`
					};
					this.#publishInitializationGeneration();
				}
			}
			#resetStalePromptState(request) {
				if (!this.#disposed && request !== this.#promptRequest && this.#state.status === "not-initialized" && this.#state.initialization.phase === "submitting") this.#setInitializationPhase("editing");
			}
			#setInitializationPhase(phase, preview) {
				const retainedPreview = preview ?? (this.#state.status === "not-initialized" ? this.#state.initialization.preview : void 0);
				this.#set({
					status: "not-initialized",
					open: this.#state.open,
					initialization: {
						draft: this.#draft,
						phase,
						generation: this.#initializationGeneration,
						...retainedPreview === void 0 ? {} : { preview: retainedPreview },
						...submissionBlocker(this.#target) === void 0 ? {} : { blocker: submissionBlocker(this.#target) }
					},
					...this.#state.readFeedback === void 0 ? {} : { readFeedback: this.#state.readFeedback }
				});
			}
			#setInitializationError(message) {
				const preview = this.#state.status === "not-initialized" ? this.#state.initialization.preview : void 0;
				this.#set({
					status: "not-initialized",
					open: this.#state.open,
					initialization: {
						draft: this.#draft,
						phase: "error",
						message,
						generation: this.#initializationGeneration,
						...preview === void 0 ? {} : { preview },
						...submissionBlocker(this.#target) === void 0 ? {} : { blocker: submissionBlocker(this.#target) }
					},
					...this.#state.readFeedback === void 0 ? {} : { readFeedback: this.#state.readFeedback }
				});
			}
			#publishInitializationGeneration() {
				if (this.#state.status !== "not-initialized") return;
				this.#set({
					...this.#state,
					initialization: {
						...this.#state.initialization,
						generation: this.#initializationGeneration
					}
				});
			}
			#loadAsset(result, feedback) {
				if (this.#state.status !== "ready") return;
				switch (result.target.kind) {
					case "project": {
						const source = parseProjectManifest(result.text);
						const draft = projectDraft(source);
						const plannedChapters = Number(source.plannedChapters);
						const selectedChapter = Math.min(this.#state.progress.selectedChapter, plannedChapters);
						const retainedChapter = selectedChapter === this.#state.progress.selectedChapter;
						this.#chapter = selectedChapter;
						this.#projectSource = source;
						this.#projectOriginal = draft;
						this.#set({
							...this.#state,
							project: {
								...this.#state.project,
								title: source.title,
								language: source.language,
								genre: source.genre,
								plannedChapters,
								targetWordsPerChapter: Number(source.targetWordsPerChapter),
								creativeStrategy: source.creativeStrategy,
								updatedAt: source.updatedAt
							},
							progress: retainedChapter ? {
								...this.#state.progress,
								plannedChapters,
								selectedChapter
							} : {
								selectedChapter,
								plannedChapters,
								status: "unplanned",
								draftPresent: false,
								draftBytes: 0
							},
							chapterBlueprint: retainedChapter ? this.#state.chapterBlueprint : null,
							draft: retainedChapter ? this.#state.draft : null,
							screen: {
								kind: "project",
								phase: "clean",
								dirty: false,
								baseRevision: result.revision,
								originalText: result.text,
								summary: "",
								generation: {
									brief: "",
									phase: "editing"
								},
								draft
							},
							...feedback === void 0 ? {} : { readFeedback: feedback }
						});
						return;
					}
					case "characters": {
						const characters = parseCharacters(result.text, result.revision);
						this.#charactersOriginal = characters;
						this.#set({
							...this.#state,
							characters: characters.map(({ id, name, role, summary }) => ({
								id,
								name,
								role,
								summary
							})),
							screen: {
								kind: "characters",
								phase: "clean",
								dirty: false,
								baseRevision: result.revision,
								originalText: result.text,
								summary: "",
								generation: {
									brief: "",
									phase: "editing"
								},
								characters,
								selectedId: characters[0]?.id,
								search: "",
								visibleCharacterIds: characters.map((character) => character.id)
							},
							...feedback === void 0 ? {} : { readFeedback: feedback }
						});
						return;
					}
					case "story-blueprint": {
						const draft = parseStoryBlueprint(result.text, result.revision);
						this.#storyOriginal = draft;
						this.#set({
							...this.#state,
							storyBlueprint: result.revision === "absent" ? null : {
								premise: draft.premise,
								themes: draft.themesText === "" ? [] : draft.themesText.split("\n"),
								world: draft.world,
								mainPlot: draft.mainPlot,
								endingGoal: draft.endingGoal
							},
							screen: {
								kind: "story-blueprint",
								phase: "clean",
								dirty: false,
								baseRevision: result.revision,
								originalText: result.text,
								summary: "",
								generation: {
									brief: "",
									phase: "editing"
								},
								draft
							},
							...feedback === void 0 ? {} : { readFeedback: feedback }
						});
						return;
					}
					case "chapter-blueprint": {
						const draft = parseChapterBlueprint(result.text, result.revision, result.target.chapter);
						const retainedChapter = this.#state.progress.selectedChapter === result.target.chapter;
						this.#chapter = result.target.chapter;
						this.#chapterBlueprintOriginal = draft;
						this.#set({
							...this.#state,
							progress: {
								...this.#state.progress,
								selectedChapter: result.target.chapter,
								status: result.revision === "absent" ? "unplanned" : draft.status,
								draftPresent: retainedChapter ? this.#state.progress.draftPresent : false,
								draftBytes: retainedChapter ? this.#state.progress.draftBytes : 0
							},
							chapterBlueprint: result.revision === "absent" ? null : {
								chapter: result.target.chapter,
								title: draft.title,
								purpose: draft.purpose,
								beats: linesFromDraft(draft.beatsText),
								characterIds: linesFromDraft(draft.characterIdsText),
								continuityNotes: linesFromDraft(draft.continuityNotesText),
								status: draft.status
							},
							draft: retainedChapter ? this.#state.draft : null,
							screen: {
								kind: "chapter-blueprint",
								chapter: result.target.chapter,
								phase: "clean",
								dirty: false,
								baseRevision: result.revision,
								originalText: result.text,
								summary: "",
								generation: {
									brief: "",
									phase: "editing"
								},
								draft
							},
							...feedback === void 0 ? {} : { readFeedback: feedback }
						});
						return;
					}
					case "chapter-draft": {
						const text = serializeChapterDraft(result.text);
						const retainedChapter = this.#state.progress.selectedChapter === result.target.chapter;
						this.#chapter = result.target.chapter;
						this.#chapterDraftOriginal = text;
						this.#set({
							...this.#state,
							progress: {
								...this.#state.progress,
								selectedChapter: result.target.chapter,
								status: retainedChapter ? this.#state.progress.status : "unplanned",
								draftPresent: result.revision !== "absent",
								draftBytes: result.bytes
							},
							chapterBlueprint: retainedChapter ? this.#state.chapterBlueprint : null,
							draft: result.revision === "absent" ? null : {
								revision: result.revision,
								preview: text,
								bytes: result.bytes,
								truncated: false
							},
							screen: {
								kind: "chapter-draft",
								chapter: result.target.chapter,
								phase: "clean",
								dirty: false,
								baseRevision: result.revision,
								originalText: result.text,
								summary: "",
								generation: {
									brief: "",
									phase: "editing"
								},
								text
							},
							...feedback === void 0 ? {} : { readFeedback: feedback }
						});
						return;
					}
					default: throw new Error("Asset is not editable in this workbench slice");
				}
			}
			#setCharactersDraft(screen, characters, selectedId) {
				const dirty = this.#charactersOriginal !== void 0 && !sameCharacters(characters, this.#charactersOriginal);
				this.#setReadyScreen({
					...screen,
					characters,
					selectedId,
					visibleCharacterIds: visibleCharacterIds(characters, screen.search),
					dirty,
					phase: dirty ? "editing" : "clean",
					replacement: void 0,
					preview: void 0,
					message: void 0,
					generation: generationAfterAssetEdit(screen)
				});
			}
			#requiredProjectSource() {
				if (this.#projectSource === void 0) throw new Error("项目设置原始内容不可用");
				return this.#projectSource;
			}
			#assetMayChange(screen) {
				return this.#activePrompt === void 0 && !generationBlocksMutation(screen) && screen.phase !== "submitted" && screen.phase !== "submitting" && screen.phase !== "stale";
			}
			#projectScreen() {
				const screen = this.#state.status === "ready" ? this.#state.screen : void 0;
				return screen?.kind === "project" ? screen : void 0;
			}
			#charactersScreen() {
				const screen = this.#state.status === "ready" ? this.#state.screen : void 0;
				return screen?.kind === "characters" ? screen : void 0;
			}
			#storyScreen() {
				const screen = this.#state.status === "ready" ? this.#state.screen : void 0;
				return screen?.kind === "story-blueprint" ? screen : void 0;
			}
			#chapterBlueprintScreen() {
				const screen = this.#state.status === "ready" ? this.#state.screen : void 0;
				return screen?.kind === "chapter-blueprint" ? screen : void 0;
			}
			#chapterDraftScreen() {
				const screen = this.#state.status === "ready" ? this.#state.screen : void 0;
				return screen?.kind === "chapter-draft" ? screen : void 0;
			}
			#assetScreen() {
				return this.#projectScreen() ?? this.#charactersScreen() ?? this.#storyScreen() ?? this.#chapterBlueprintScreen() ?? this.#chapterDraftScreen();
			}
			#screenTarget(screen) {
				return screen.kind === "chapter-blueprint" || screen.kind === "chapter-draft" ? {
					kind: screen.kind,
					chapter: screen.chapter
				} : { kind: screen.kind };
			}
			#setReadyScreen(screen, readFeedback) {
				if (this.#state.status !== "ready") return;
				this.#set({
					...this.#state,
					screen,
					...readFeedback === void 0 ? {} : { readFeedback }
				});
			}
			#cancelRead() {
				this.#request += 1;
				this.#activeRead?.abort.abort();
			}
			#set(state) {
				this.#state = state;
				for (const listener of this.#listeners) try {
					listener();
				} catch (error) {
					try {
						this.#reportListenerError(error);
					} catch (reportingError) {}
				}
			}
		};
		//#endregion
		//#region src/client/index.ts
		/** Required browser services. */
		const inject = [
			"slots",
			"connection",
			"sessions",
			"workspaces"
		];
		function isRecord(value) {
			return typeof value === "object" && value !== null && !Array.isArray(value);
		}
		function readStatus(value) {
			if (!isRecord(value) || value.status !== "not-installed" && value.status !== "installed" && value.status !== "conflict") throw new Error("AI novel preset status response is invalid");
			return { status: value.status };
		}
		function readInstall(value) {
			if (!isRecord(value) || value.status !== "installed" && value.status !== "conflict" || typeof value.changed !== "boolean") throw new Error("AI novel preset install response is invalid");
			return {
				status: value.status,
				changed: value.changed
			};
		}
		async function callSetup(rpc, endpoint, signal) {
			let result;
			try {
				result = await rpc.call("/ai-novel", endpoint, {}, signal);
			} catch (error) {
				throw new PresetSetupDisconnectedError(error);
			}
			if (!result.ok) throw new Error(`${result.error.code}: ${result.error.message}`);
			return result.value;
		}
		/**
		* Adapt the generic Connection RPC caller to the closed preset setup interface.
		*
		* @param rpc Browser connection RPC caller.
		* @returns A validated setup port with no path-bearing operations.
		*/
		function createPresetSetupPort(rpc) {
			return {
				status: async (signal) => readStatus(await callSetup(rpc, "preset/status", signal)),
				install: async (signal) => readInstall(await callSetup(rpc, "preset/install", signal))
			};
		}
		/**
		* Adapt the generic Connection RPC caller to the path-free context read interface.
		*
		* @param rpc Browser connection RPC caller.
		* @returns A validated context port accepting only opaque Workspace identity and chapter number.
		*/
		function createNovelContextPort(rpc) {
			return {
				read: async (workspaceId, chapter, signal) => {
					let result;
					try {
						result = await rpc.call("/ai-novel", "context/read", {
							workspaceId,
							chapter
						}, signal);
					} catch (error) {
						throw new NovelWorkbenchDisconnectedError(error);
					}
					if (!result.ok) throw new Error(`${result.error.code}: ${result.error.message}`);
					return parseNovelContextReadResult(result.value);
				},
				readAsset: async (workspaceId, target, signal) => {
					let result;
					try {
						result = await rpc.call("/ai-novel", "asset/read", {
							workspaceId,
							target
						}, signal);
					} catch (error) {
						throw new NovelWorkbenchDisconnectedError(error);
					}
					if (!result.ok) throw new Error(`${result.error.code}: ${result.error.message}`);
					return parseNovelAssetReadResult(result.value);
				}
			};
		}
		/**
		* Adapt Host reads and the current Session face to the workbench's closed port.
		*
		* @param rpc Browser connection RPC caller.
		* @param sessions Browser Session registry used only for ordinary prompt submission.
		* @returns A path-free port with no mutation RPC.
		*/
		function createNovelWorkbenchPort(rpc, sessions) {
			const context = createNovelContextPort(rpc);
			return {
				read: context.read,
				readAsset: context.readAsset,
				prompt: async (sessionId, text) => {
					const session = sessions.binding(sessionId)?.session;
					if (session === void 0) return {
						ok: false,
						error: {
							code: "session-unavailable",
							message: "当前会话尚未就绪"
						}
					};
					return session.prompt([{
						type: "text",
						text
					}], "queue");
				}
			};
		}
		/**
		* Register the sidebar setup trigger and shell overlay over one shared controller.
		*
		* @param ctx Browser Cordis context.
		* @returns Nothing.
		*/
		function apply(ctx) {
			const connection = ctx.get("connection");
			const controller = new PresetSetupController(createPresetSetupPort(connection.rpc), (error) => {
				ctx.logger.warn(error);
			});
			const sessions = ctx.get("sessions");
			const workspaces = ctx.get("workspaces");
			if (sessions === void 0 || workspaces === void 0) throw new Error("AI novel context requires the browser Session and Workspace services");
			const workbenchController = new NovelWorkbenchController(createNovelWorkbenchPort(connection.rpc, sessions), (error) => {
				ctx.logger.warn(error);
			});
			ctx.effect(() => {
				const stopObserving = observeNovelContextSources({
					sessions,
					workspaces
				}, workbenchController);
				return async () => {
					stopObserving();
					await Promise.all([controller.dispose(), workbenchController.dispose()]);
				};
			}, "ai-novel-writer: setup and context lifecycle");
			if (typeof document !== "undefined") ctx.effect(() => installNovelContextStyle(document), "ai-novel-writer: context-window styles");
			ctx.effect(() => {
				let stopped = false;
				let refreshScheduled = false;
				const refreshConnectedState = () => {
					if (stopped || refreshScheduled) return;
					refreshScheduled = true;
					queueMicrotask(() => {
						refreshScheduled = false;
						if (stopped || connection.hostDescription.getSnapshot() === void 0) return;
						if (controller.getSnapshot().status !== "idle") controller.load();
						if (workbenchController.getSnapshot().open) workbenchController.refresh();
						else workbenchController.inspect();
					});
				};
				const stopDescription = connection.hostDescription.subscribe(() => {
					if (connection.hostDescription.getSnapshot() === void 0) {
						controller.disconnected();
						workbenchController.disconnected();
						return;
					}
					refreshConnectedState();
				});
				const stopReset = ctx.on("connection/reset", refreshConnectedState);
				return () => {
					stopped = true;
					stopReset();
					stopDescription();
				};
			}, "ai-novel-writer: observe and refresh Host connection");
			const workbenchInjected = () => ({
				workbenchController,
				setupController: controller
			});
			ctx.slots.inject("sidebar.footer.action", () => ctx.slots.register({
				name: "sidebar.footer.action",
				id: "ai-novel-workbench",
				order: 90,
				label: "小说工作台",
				inject: workbenchInjected
			}, NovelWorkbenchTrigger));
			ctx.slots.inject("shell.overlay", () => ctx.slots.register({
				name: "shell.overlay",
				id: "ai-novel-workbench",
				order: 90,
				inject: workbenchInjected
			}, NovelWorkbenchOverlay));
			ctx.slots.inject("settings.plugin.item", () => ctx.slots.register({
				name: "settings.plugin.item",
				id: "ai-novel-writer",
				order: 90,
				inject: workbenchInjected
			}, NovelPluginStatusCard));
		}
		//#endregion
		exports.AI_NOVEL_PRESET_ID = AI_NOVEL_PRESET_ID;
		exports.NovelPluginCardBody = NovelPluginCardBody;
		exports.NovelPluginStatusCard = NovelPluginStatusCard;
		exports.NovelWorkbenchBody = NovelWorkbenchBody;
		exports.NovelWorkbenchController = NovelWorkbenchController;
		exports.NovelWorkbenchDisconnectedError = NovelWorkbenchDisconnectedError;
		exports.NovelWorkbenchOverlay = NovelWorkbenchOverlay;
		exports.NovelWorkbenchTrigger = NovelWorkbenchTrigger;
		exports.PresetSetupBody = PresetSetupBody;
		exports.PresetSetupController = PresetSetupController;
		exports.PresetSetupDisconnectedError = PresetSetupDisconnectedError;
		exports.apply = apply;
		exports.createNovelContextPort = createNovelContextPort;
		exports.createNovelWorkbenchPort = createNovelWorkbenchPort;
		exports.createPresetSetupPort = createPresetSetupPort;
		exports.initializationProposalPrompt = initializationProposalPrompt;
		exports.inject = inject;
		exports.installDrawerKeyboardScope = installDrawerKeyboardScope;
		exports.installNovelContextStyle = installNovelContextStyle;
		exports.installWorkbenchLayoutReservation = installWorkbenchLayoutReservation;
		exports.novelContextCss = novelContextCss;
		exports.observeNovelContextSources = observeNovelContextSources;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map