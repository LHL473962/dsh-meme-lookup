import type { AssistantStreamFrame } from '@deepseek-ai/dsh-agent';
import type { CostTokenBuckets, SubagentCostEntry, SubagentState, SubagentOutputKind, SubagentToolCall } from '../adapter/ports/channel-view.js';
export type { SubagentState, SubagentStatus, SubagentOutputLine, SubagentOutputKind, SubagentToolCall, SubagentTokenUsage, SubagentCostEntry } from '../adapter/ports/channel-view.js';
/** 子代理 durable 用量的费用快照：entries 供多模型计价，unpriced 是
 *  非官方/未收录用量的独立副本（展示与回归断言用）。 */
export interface SubagentCostSnapshot {
    entries: SubagentCostEntry[];
    unpriced: CostTokenBuckets;
}
export declare class SubagentActivityStore {
    private states;
    private sessionToAgent;
    private listeners;
    private streams;
    /** 会话级 durable usage 费用桶，key = `${provider}\u0000${model}`。 */
    private costByModel;
    /** 非官方 provider / 未收录模型的用量副本（只展示 token，不计金额）。 */
    private costUnpriced;
    /** 每个 agent 已消费的最大 durable 事件 seq（同一事件重投不重复计费）。 */
    private costSeq;
    /** 描述的来源。spawn 首帧的描述来自一条**无身份**的 FIFO 队列（并发派发
     *  时可能是别的 child 的），只有 childId-keyed 的权威 label
     *  （`subagent/catalog`、子会话 `subagent/descriptor`）能定案：`bound`
     *  之后不再改写，`queue`/`placeholder` 允许被 label 覆盖。 */
    private descriptionSource;
    /** keyed label 可能比它那一行先到：子会话的 `subagent/descriptor` 在会话
     *  链接建立之前就已投递。丢掉它，这一行就只剩队列猜出来的名字，而外部
     *  子代理上游不写 catalog ⇒ 没有第二条 keyed 事实来救，永久错名。先寄存在
     *  这里，建行时直接当描述用：keyed 事实不因到达先后而失效。有界，理由同
     *  队列（没人建行时不能无界增长）。 */
    private earlyLabels;
    private commitLine;
    private pushLine;
    onSpawned(agentId: string, provider?: string, model?: string, info?: Partial<SubagentState> & {
        descriptionFromQueue?: boolean;
    }): void;
    /** Park a keyed label whose row does not exist yet — a child session's
     *  `subagent/descriptor` can be published before the host's spawn edge, and
     *  dropping it there would leave the row with the identity-less queue's
     *  guess and no second keyed fact to correct it (an external child gets no
     *  catalog). `onSpawned` adopts it when the row is created. Bounded: when
     *  full, the oldest parked label goes first — the least likely to still be
     *  waiting for its row. */
    holdKeyedLabel(agentId: string, label: unknown): void;
    /** Bind the authoritative description of one child (a `subagent/catalog`
     *  label or a child session's own `subagent/descriptor`). The identity-less
     *  spawn queue may have handed this row a concurrent delegation's term, so
     *  the keyed fact wins, once, until it is the source of truth for this row.
     *  Returns whether the displayed description changed. */
    private describeFromLabel;
    /** Durable discovery (`subagent/catalog`, workflow member events, registry
     * back-fill): register a child WITHOUT disturbing an already-tracked run.
     * `live` marks a child the agents registry currently holds, which keeps the
     * row running; an idle historical child shows as `unknown` (the parent log
     * alone cannot prove how its last epoch ended). */
    onDiscovered(agentId: string, info?: {
        label?: string;
        childCreatedAt?: number;
        live?: boolean;
        provider?: string;
        model?: string;
        mode?: 'one-shot' | 'continuable' | 'unknown';
    }): void;
    linkSession(agentId: string, session: unknown): void;
    getSubagentIdBySession(session: unknown): string | undefined;
    has(agentId: string): boolean;
    /** The run key of one tracked child: its current epoch's key, or `undefined`
     *  when the row is tracked but has no run fact yet (a durable discovery row
     *  carries none). That is the same value an untracked child yields, so a
     *  caller that must tell the two apart asks `has()` as well. */
    runIdOf(agentId: string): string | undefined;
    appendOutput(agentId: string, text: string, kind?: SubagentOutputKind): void;
    /** Mark the streaming tail line complete (run settlement). */
    flushOutput(agentId: string): void;
    /** 0.1.5 live stream: transient attempt frames replace `assistant/chunk`
     *  session events (the durable settlement keeps flowing as session events). */
    onStreamFrame(agentId: string, frame: AssistantStreamFrame): void;
    private restoreAttempt;
    private settleAssistant;
    onSessionEvent(agentId: string, event: unknown): void;
    /** Merge partial updates (model discovery, session id) into one subagent. */
    patch(agentId: string, partial: Partial<SubagentState>): void;
    /** One-line preview of a tool-result content block (text or item list). */
    private previewOf;
    recordTool(agentId: string, input: Partial<SubagentToolCall> & {
        name?: string;
    }): void;
    setTokens(agentId: string, usage: {
        inputTokens?: number;
        outputTokens?: number;
        input?: number;
        output?: number;
        total?: number;
        context?: number;
    }): void;
    /** durable usage 的计价字段；全零/非法返回 undefined（不建零桶）。 */
    private costDeltaOf;
    /** 一笔 durable usage 按发生时刻落 peak/idle 桶，model/provider 取事件
     *  发生时的子代理身份；非官方/未收录同时进 unpriced 副本。
     *
     *  `seq` 是同一 binding 内的事件序号：重放/回放把同一条 durable 事件再投
     *  一次时只计第一笔（重投即双计会让"并入子代理"的估算凭空变大）。判据与
     *  `settleAssistant` 的 `settledSeq` 同源但**各自独立**——两处都要消费
     *  同一个 seq，共用字段会让后消费的那处被前一处挡掉。 */
    private accumulateCost;
    /** durable 用量的费用快照（深拷贝）：entries 供计价，unpriced 供展示。 */
    costSnapshot(): SubagentCostSnapshot;
    onCompleted(agentId: string, summary?: string, stopReason?: string, endedAt?: number): void;
    onFailed(agentId: string, error: string, endedAt?: number): void;
    onCancelled(agentId: string, reason?: string, summary?: string, endedAt?: number): void;
    private finish;
    /** Drop all tracked subagents and session links (session swap: the old
     * session's children were disposed with their parent — nothing may keep
     * routing events of a session the channel no longer projects). The
     * session-scoped cost buckets reset with them. */
    reset(): void;
    snapshot(): SubagentState[];
    get(agentId: string): SubagentState | undefined;
    subscribe(listener: () => void): () => void;
    private notify;
}
//# sourceMappingURL=subagents.d.ts.map