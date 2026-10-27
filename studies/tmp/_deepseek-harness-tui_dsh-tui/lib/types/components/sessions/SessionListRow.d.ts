import React from 'react';
import type { ClickEvent } from '../../ink/events/click-event.js';
import type { ContextMenuEvent } from '../../ink/events/context-menu-event.js';
import type { SessionSummary } from '../../dsh-adapter/sessions/index.js';
import type { AgentViewStatus } from '../../adapter/ports/channel-view.js';
/**
 * One session in the browser's list: a title line and a metadata line.
 *
 * Two lines rather than one because the two carry different jobs. The title
 * answers "is this the conversation I mean"; the metadata gives its age and
 * branch. Size and model are available in the title tooltip rather than taking
 * space in every row. Folding both lines into one makes the title compete with
 * facts nobody reads first, and on a narrow terminal the title is what loses.
 *
 * Widths are resolved here rather than delegated to flexbox: the row must
 * stay exactly two lines at every terminal width, and a row that wraps
 * destroys the alignment that lets the eye scan a list at all.
 */
export declare function SessionListRow({ session, width, depth, focused, declareCursor, pinned, now, onClick, onContextMenu, onTogglePin, liveStatus, current, occupiedPid, }: {
    session: SessionSummary;
    /** Columns available to the row, indentation included. */
    width: number;
    /** 0 for a conversation, 1 for a sub-agent run under its parent. */
    depth: number;
    focused: boolean;
    /** Park the native caret on this row while the list owns it. */
    declareCursor?: boolean;
    /** Whether the user pinned this session to the top of the browser. */
    pinned: boolean;
    /** Epoch ms used for every relative time in this render pass. */
    now: number;
    /** 鼠标点击行（fullscreen）：恢复该会话（与 Enter 同路径）。 */
    onClick?(event: ClickEvent): void;
    /** 鼠标右键（fullscreen）：在该行弹出操作菜单（打开/固定/重命名/删除）。 */
    onContextMenu?(event: ContextMenuEvent): void;
    /** 点击行内 ★/☆（fullscreen）：切换固定状态，不冒泡成"打开会话"。 */
    onTogglePin?(): void;
    /**
     * Live status of an agent THIS terminal is running, when there is one.
     * `working` animates instead of holding a static glyph, so a busy session
     * is legible at a glance — the same vocabulary the session overview uses,
     * which is what lets the two surfaces read as one feature.
     */
    liveStatus?: AgentViewStatus;
    /** True when this is the session the terminal is attached to. */
    current?: boolean;
    /**
     * The pid of ANOTHER TUI terminal holding this session, when one does. The
     * row turns red and says so: the session stays visible but cannot be
     * entered, which is the honest presentation of a claim this process must
     * not break. Undefined means free, or already ours.
     */
    occupiedPid?: number;
}): React.ReactNode;
//# sourceMappingURL=SessionListRow.d.ts.map