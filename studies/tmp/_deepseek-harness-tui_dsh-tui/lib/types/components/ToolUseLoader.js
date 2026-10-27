import { jsx as _jsx } from "react/jsx-runtime";
import Box from '../ink/components/Box.js';
import { Text } from '../ui.js';
import { useBlink } from '../hooks/useBlink.js';
import { BLACK_CIRCLE, BULLET, MULTIPLICATION_X } from '../terminal-utils/figures.js';
const CATEGORY_BY_TOOL = {
    bash: 'exec',
    powershell: 'exec',
    pwsh: 'exec',
    read: 'read',
    grep: 'read',
    glob: 'read',
    search: 'read',
    file_search: 'read',
    edit: 'write',
    write: 'write',
    str_replace_editor: 'write',
    multiedit: 'write',
    web_search: 'web',
    web_fetch: 'web',
    browser: 'web',
    subagent: 'task',
    task: 'task',
    job: 'task',
    workflow: 'task',
};
const CATEGORY_TOKEN = {
    exec: 'toolDotExec',
    read: 'toolDotRead',
    write: 'toolDotWrite',
    web: 'toolDotWeb',
    task: 'toolDotTask',
    default: 'success',
};
/**
 * The status dot on tool-call rows. State shapes the glyph, the tool
 * category picks the settled color: blinking `●` while running (attention),
 * a smaller category-colored `•` once settled (quiet), and a red `✗` on
 * error — a glyph swap, not just a hue, so failures read at a glance
 * (Codex-style category colors; every color is a theme token).
 */
export function ToolUseLoader({ isError, isUnresolved, shouldAnimate, toolName, }) {
    const [ref, isBlinking] = useBlink(shouldAnimate);
    if (isError) {
        return (_jsx(Box, { ref: ref, minWidth: 2, children: _jsx(Text, { color: "error", children: MULTIPLICATION_X }) }));
    }
    const category = CATEGORY_BY_TOOL[toolName ?? ''] ?? 'default';
    const color = isUnresolved ? undefined : CATEGORY_TOKEN[category];
    const char = shouldAnimate ? (isBlinking ? BLACK_CIRCLE : ' ') : BULLET;
    return (_jsx(Box, { ref: ref, minWidth: 2, children: _jsx(Text, { color: color, dimColor: isUnresolved, children: char }) }));
}
