import React from 'react';
import type { SubagentRow } from '../../dsh-adapter/channel.js';
import type { ClickEvent } from '../../ink/events/click-event.js';
/**
 * Borderless, fixed-height activity card embedded directly in the transcript
 * (Kimi Code visual language). Running: header + one-line current tool + a
 * constant 3-row waterfall (each row hard-clipped to one terminal line so
 * the card height never changes). Settled: folds to the header line alone
 * (failure keeps one error line). The running glyph reuses the user's
 * working-activity preset (`/activity`), so the indicator follows the same
 * setting as the main spinner.
 */
export declare function SubagentMessage({ subagent, marginTopOnTurn, activityFrames, onClick, onOpenView }: {
    subagent: SubagentRow;
    marginTopOnTurn: boolean;
    activityFrames?: string;
    isExpanded: boolean;
    onClick?(event: ClickEvent): void;
    /** 在主屏打开子代理转录：与卡片点击（→ 详情）并列的独立动作；拦截冒泡，
     *  普通正文点击与选区不受影响。 */
    onOpenView?(): void;
}): React.ReactNode;
//# sourceMappingURL=SubagentMessage.d.ts.map