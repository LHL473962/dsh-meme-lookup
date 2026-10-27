import React from 'react';
import type { StarMilestone } from '../usageStats.js';
import type { WhaleCouponNotice } from '../dsh-adapter/oauth/bonus.js';
/** What a star attempt came back with (the modal renders each outcome). */
export type StarAttempt = {
    readonly kind: 'starred';
} | {
    readonly kind: 'no-gh';
    readonly url: string;
} | {
    readonly kind: 'not-authed';
    readonly url: string;
} | {
    readonly kind: 'failed';
    readonly detail: string;
    readonly url: string;
};
/** The two things the modal can do (Chat supplies the real actions; tests
 * override them through the same seam). `onStar` reports the outcome so the
 * modal can celebrate a real star instead of guessing. */
export interface StarPromptActions {
    onStar: () => StarAttempt | Promise<StarAttempt>;
    onOpen: () => void;
}
/**
 * The one-time "asks for a star" startup modal (usage milestones `99h` /
 * `999 launches`, see `usageStats.ts`). Chat mounts it over a dimmed
 * click-catcher on boot when `dueStarModal()` says the moment arrived —
 * never mid-turn, at most one milestone per boot, `Esc`/click-outside
 * closes, and unmounting hands the keyboard straight back (nothing is left
 * registered, so it cannot steal keys after closing).
 *
 * Composition follows the house design system: the milestone title sits in
 * the card's top border, the two actions are `ListItem` rows (pointer,
 * focus colour, hover background — the same component every picker uses),
 * a `Divider` separates the footer, and the hint line is a `HintLine` with
 * its bold key. The art slot shows the raster maid first, the animated
 * pixel whale otherwise.
 *
 * A successful star switches the card into a short CELEBRATION instead of
 * closing silently: confetti falls over the whale, which spouts on a loop,
 * with a thank-you line — then the card closes itself. A failed attempt
 * keeps the card open with the reason and the browser escape hatch.
 */
export declare function StarPrompt({ milestone, actions, onClose, initialPhase, }: {
    /** The reached milestone (drives the title's hours/launches wording). */
    readonly milestone: StarMilestone;
    readonly actions: StarPromptActions;
    readonly onClose: () => void;
    /** 起始阶段：`done` 直接进庆祝态——`/star`、`Alt+S`、标语点击成功后就
     *  走这条（只演感谢，不再问一次）。 */
    readonly initialPhase?: 'ask' | 'done';
}): React.ReactNode;
export declare function WhaleCouponPrompt({ notice, onShown, onClose, }: {
    readonly notice: WhaleCouponNotice;
    readonly onShown: (orderId: WhaleCouponNotice['orderId']) => void;
    readonly onClose: () => void;
}): React.ReactNode;
//# sourceMappingURL=StarPrompt.d.ts.map