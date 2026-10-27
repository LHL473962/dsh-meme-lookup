/**
 * The shared platform copy. The keys are the union of what the claude and
 * codex text modules render on a platform surface; the host dictionary spreads
 * this object in, so its `keyof` stays a literal union and `t()` keeps its
 * type safety — do not widen this declaration with a `Record<string, …>`
 * annotation, which would collapse that union to `string`.
 */
export const PLATFORM_TEXT = Object.freeze({
    'capability-failed': Object.freeze({ zh: '{{name}} 失败 · {{err}}', en: '{{name}} failed · {{err}}' }),
    'status-rate-limit-five-hour': Object.freeze({ zh: '5小时', en: '5h' }),
    'status-rate-limit-seven-day': Object.freeze({ zh: '7天', en: '7d' }),
    'doctor-unknown': Object.freeze({ zh: '未知', en: 'unknown' }),
    'effort-invalid': Object.freeze({ zh: '未知推理等级 {{id}}（当前模型可选：{{ids}}）', en: 'Unknown reasoning effort {{id}} (this model offers: {{ids}})' }),
    'tool-name-bash': Object.freeze({ zh: 'Bash', en: 'Bash' }),
    'tool-name-edit': Object.freeze({ zh: '编辑', en: 'Edit' }),
    'rewind-first-message': Object.freeze({ zh: '不能回退到第一条消息之前', en: 'Cannot rewind past the very first message' }),
    'rename-failed': Object.freeze({ zh: '重命名失败 · {{err}}', en: 'Rename failed · {{err}}' }),
    'rename-usage': Object.freeze({ zh: '用法  /rename <新名称>', en: 'Usage  /rename <new title>' }),
});
/**
 * The frozen subset of {@link PLATFORM_TEXT} holding exactly `keys` — the
 * platform strings this backend renders, and nothing else. `K` is constrained
 * to {@link PlatformTextKey}, so a mistyped key is a compile error rather than
 * a string that silently disappears from the screen.
 */
export function pickPlatformText(keys) {
    const picked = {};
    for (const key of keys)
        picked[key] = PLATFORM_TEXT[key];
    // The loop fills exactly `keys`; a mapped type cannot express that, so the
    // assertion is the one step TypeScript cannot check here.
    return Object.freeze(picked);
}
