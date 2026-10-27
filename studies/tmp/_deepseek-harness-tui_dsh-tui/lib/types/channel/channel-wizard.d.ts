import type { BackendChannelsHost } from '../adapter/ports/channel-ui.js';
import { type QuestionAnswer, type QuestionRequest } from './questions.js';
/**
 * `/channel` 管理向导：与 providerWizard.ts 一样由一串 QuestionStore ask 驱动
 * （模型 ask_user_question 用的同一个面板），自身不持有 UI 状态，所有副作用
 * 都经 deps 上的通道动作。token 以 redact 方式询问，直接交给凭据库。
 *
 * 不依赖 React，scripts/verify-claude-channels.ts 用脚本化答案无头驱动。
 */
export interface ChannelWizardDeps {
    readonly ask: (request: QuestionRequest, options?: {
        redact?: boolean;
    }) => Promise<QuestionAnswer>;
    readonly notify: (text: string, options?: {
        color?: 'error' | 'warning' | 'success';
        timeoutMs?: number;
    }) => void;
    readonly pushLocal: (title: string, lines: readonly string[]) => void;
    readonly host: BackendChannelsHost;
}
/** What the wizard did (the caller refreshes the roster). `restart` says
 * the active connection changed and the running session cannot pick it up
 * in place, so the caller routes through the fresh-session funnel. */
export interface ChannelWizardOutcome {
    readonly kind: 'saved' | 'switched' | 'deleted' | 'cancelled' | 'failed';
    readonly restart: boolean;
}
/** Run the /channel management wizard (the picker's add/manage rows). */
export declare function runChannelWizard(deps: ChannelWizardDeps): Promise<ChannelWizardOutcome>;
//# sourceMappingURL=channel-wizard.d.ts.map