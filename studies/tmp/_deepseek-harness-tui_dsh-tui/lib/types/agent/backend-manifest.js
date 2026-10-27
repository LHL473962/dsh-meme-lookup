/**
 * The syntax every backend id must match: readable, sortable, usable as a file
 * name. `:` is deliberately excluded — a plugin id could otherwise not become
 * `~/.dsh-tui/backends/<id>/` on Windows (drive letters / alternate data
 * streams), and `AgentSessionRef` disambiguation would need the full id set,
 * which is exactly what a plugin registry cannot enumerate (P0 §5).
 *
 * Mirrored in `bin/dsh-tui.js`, which must work without compiled modules.
 */
export const BACKEND_ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,31}$/u;
/** Whether an untrusted value may pass into a session ref, a path or a log. */
export function isBackendIdSyntax(value) {
    return typeof value === 'string' && BACKEND_ID_PATTERN.test(value);
}
