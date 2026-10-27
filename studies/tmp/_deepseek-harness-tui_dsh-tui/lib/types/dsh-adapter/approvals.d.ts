/**
 * Approval store — the UI-side answerer half of the DSH approval seam
 * (`ctx.approval`). The harness's permission layer asks
 * `ApprovalService.request()`, which dispatches an `approval/request`
 * waterfall; the listener registered in plugin.ts parks the request here,
 * surfaces one ask at a time to the TUI permission prompt, and settles the
 * harness promise when the user decides, the
 * asker's abort signal fires, or the plugin tears down.
 *
 * Queue semantics mirror QuestionStore: parallel tool calls can trigger
 * several asks before any answer is given, so asks are drained FIFO.
 * Outcomes are the protocol's closed set — `'allowed-once'` and
 * `'rejected'` from the panel, `'cancelled'` on abort/teardown; there is
 * no allow-always or feedback channel in the protocol.
 *
 * The store presents its asks through the shared permission-panel shape
 * (`src/channel/permissions.ts`), so the one approval panel renders DSH and
 * backend prompts alike: a DSH ask offers exactly the protocol's two
 * options (allow once / reject), and the DSH-only facts (the `external`
 * source badge, the background-session id) ride along on the snapshot.
 */
import { compositionRoot } from './host-access.js';
import { type AdapterRuntimeOptions } from '../adapter/kernel/runtime.js';
import type { ApprovalOutcome, ApprovalRequest } from '@deepseek-ai/dsh-user-approval';
import type { SessionEvent } from '@deepseek-ai/dsh-session';
import { type PermissionPanelDecision, type PermissionPanelOutcome, type PermissionPanelSnapshot, type PermissionPanelSource } from '../channel/permissions.js';
/** What the TUI renders while an approval is pending (the shared panel
 *  shape plus the DSH facts it documents below). */
export interface ApprovalSnapshot extends PermissionPanelSnapshot {
    /** Stable key so the panel remounts (fresh focus state) per request. */
    readonly key: string;
    readonly toolName: string;
    /** The asker's human-readable explanation, when given. */
    readonly reason?: string;
    /** The gated command, recovered from the paired tool/call event. */
    readonly command?: string;
    /**
     * The request is not anchored to a live tool call of this session (no or
     * unknown callId, the paired call already settled, or the callId is
     * already in flight or consumed by another ask — a genuine approval is
     * asked exactly once per call). A duplicate callId marks EVERY ask on it
     * (the pre-existing one included — attacker-first order) so the verdict
     * can never invert onto the genuine ask). The approval waterfall is an in-process event
     * any plugin can dispatch, so the panel renders a loud warning instead of
     * presenting the text as the agent's own pending command. Verdicts that
     * depend on the session log are re-checked while the ask is queued or on
     * the panel, so they may also appear late — once a same-callId sibling
     * ask is allowed and its tool/result lands (P-4). The in-flight dedup
     * verdict, by contrast, is determined at park() and needs no result to
     * land.
     */
    readonly external?: true;
    /**
     * The asking agent's session id — `String(channel.agentId)` for the
     * attached session, something else for a background session's ask (the
     * agent view parks those too, so unattended sessions surface as
     * "needs input" instead of hanging on a fail-closed answer).
     */
    readonly agentId: string;
    /** The protocol's two choices: allow once / reject. */
    readonly options: PermissionPanelSnapshot['options'];
}
/** Host-only registration used by the TUI plugin bootstrap. */
export declare function bindApprovalStore(ctx: Parameters<typeof compositionRoot>[0], store: ApprovalStore): void;
/** Host-only lookup used by the presentation Port bridge. */
export declare function getApprovalStore(ctx: Parameters<typeof compositionRoot>[0]): ApprovalStore | undefined;
/**
 * Approval store: parks asks from the harness's approval seam, surfaces
 * one at a time to the TUI, and settles each ask when the user decides or
 * the ask is withdrawn. The TUI subscribes for re-renders and decides via
 * {@link ApprovalStore.decide}.
 */
export declare class ApprovalStore implements PermissionPanelSource {
    private readonly runtime;
    constructor(runtime?: AdapterRuntimeOptions);
    private readonly queue;
    private active;
    private readonly listeners;
    private seq;
    /**
     * Cached snapshot: useSyncExternalStore requires a stable reference while
     * nothing changed (a fresh object per call would loop re-renders).
     */
    private snapshotCache;
    /**
     * Length of the session log at the last liveness evaluation of the active
     * ask. Events only append, so an unchanged length means no verdict can
     * have flipped — re-checks below this guard are skipped.
     */
    private externalCheckedAtEvents;
    /** UI language the parked asks' reasons were resolved in (see
     *  {@link refreshReasonLang}). */
    private reasonLang;
    private notifyQueued;
    /**
     * CallIds whose approval ask already settled (decided or cancelled).
     * Together with the in-flight set this closes the park-after-decide gap:
     * the first ask leaves the queue while its tool is still executing (the
     * callId still reads live), so a twin parked in that window would dodge
     * both the in-flight dedup and the liveness check. A consumed callId
     * never legitimately comes back: the permission layer asks once per call.
     * Fails toward the badge — a hypothetical genuine re-ask after a cancel
     * shows the warning, never the reverse. Evicted when the paired
     * tool/result lands (after that the liveness check marks the twin
     * anyway), keeping the set bounded to in-flight tool executions.
     * Keys are agent-scoped (`agentId::callId`): the store outlives agent
     * switches (/resume, /new) and low-entropy callIds (provider fallback
     * `call-<index>`) repeat across sessions — a bare-callId key would badge
     * the next session's genuine ask with the previous session's residue.
     */
    private readonly consumedCallIds;
    /**
     * Subscribe to store changes (useSyncExternalStore contract).
     * @param listener - Called after every mutation that changes the snapshot.
     * @returns An unsubscribe function removing the listener.
     */
    subscribe(listener: () => void): () => void;
    /**
     * The approval the TUI should render now, or null when idle. Re-checks the
     * active ask's source badge against the current session log (see
     * {@link refreshActiveExternal}) so a badge that flips while the ask is on
     * the panel surfaces without waiting for another store mutation.
     * @returns The cached snapshot; the reference is stable between mutations.
     */
    getSnapshot(): ApprovalSnapshot | null;
    /**
     * Session ids of every agent with a parked ask (active plus queued) — the
     * agent view's "needs input" signal. Deduplicated, in park order.
     * @returns One id per asking agent, or an empty array when none waits.
     */
    pendingAgentIds(): readonly string[];
    /**
     * The first parked ask's detail for one agent — the agent view's row
     * summary while it needs input (the question it is blocked on).
     * @param agentId - The asking session's id.
     * @returns The ask's reason / gated command / tool name, or undefined
     *   when the agent has no parked ask.
     */
    pendingAgentDetail(agentId: string): Pick<ApprovalSnapshot, 'toolName'> & Partial<Pick<ApprovalSnapshot, 'reason' | 'command'>> | undefined;
    private emit;
    /** Notify on a microtask so a re-check triggered inside getSnapshot
     * (during a React render) never fires listeners synchronously mid-render. */
    private scheduleNotify;
    /** Re-resolve every parked ask's localized reason after a `/lang` switch;
     *  Chat re-renders on the switch, so the read below lands on the new
     *  language without a store subscription. */
    private refreshReasonLang;
    /** Rebuild the cached snapshot after any mutation of active. */
    private rebuildSnapshot;
    /**
     * Re-run the source-badge verdict for the active ask (P-4).
     *
     * The external flag computed at park() is only a point-in-time verdict. A
     * forger can dispatch a second request carrying the SAME callId as a
     * genuinely pending one — both look live at park time; once the first is
     * allowed and its tool/result lands, the twin surfaces with a callId that
     * no longer has an unresolved call and must not keep the unmarked panel
     * data. Re-checked when an ask becomes active (promotion), whenever the
     * snapshot is read (the result usually lands AFTER the twin was promoted),
     * and on every session `tool/result` notification (see
     * {@link noteSessionEvent}). The session log only appends, so the verdict
     * can only flip live→external, never back — the badge may appear late but
     * never falsely.
     */
    private refreshActiveExternal;
    /**
     * Session-event notification inlet (wired by plugin.ts to the
     * `session/event` firehose). React does not know the session log
     * appended: a badge flip that only happens inside getSnapshot() surfaces
     * solely when something ELSE re-renders the panel (a streaming spinner,
     * say) — a silent render loop leaves the unmarked panel on screen. A
     * landed `tool/result` is the only event type that can flip the active
     * verdict live→external, so everything else is dropped here; the internal
     * length memo then skips the recheck whenever the event belongs to a
     * different session than the active ask's. The notification the SDK
     * fires arrives after the event is already in the live session log, so the
     * recheck sees the settled result.
     * @param agentId - The emitting session's id (DSH shares agent/session identity).
     * @param event - The appended session event.
     */
    noteSessionEvent(agentId: string, event: SessionEvent): void;
    /**
     * Whether another ask with this callId is already parked (active or
     * queued). A genuine approval is raised once per gated tool call — the
     * permission layer asks, waits, and never re-asks for the same callId —
     * so a second ask reusing an in-flight callId is a forged twin dispatched
     * through the in-process waterfall. This is a DETERMINISTIC verdict: it
     * needs no tool/result to land, unlike {@link isLiveToolApproval}, whose
     * twin-reveal window (result lands only after the first ask is allowed
     * and the tool runs) is exactly when promotion-time rechecks still see no
     * result. Derived from the live active+queue set on each park(), so
     * settled asks free their callId automatically.
     */
    private isCallIdInFlight;
    /**
     * Answerer entry point — called by the `approval/request` waterfall
     * listener for every ask in this process: the attached session's and any
     * background session's alike, so an unattended session surfaces as
     * "needs input" instead of failing closed with nobody to answer it.
     * @param req - The approval request (agent, tool, callId, reason, signal).
     * @returns A promise settling with the user's decision, or `'cancelled'`
     *   when the ask is withdrawn or the plugin tears down.
     */
    park(req: ApprovalRequest): Promise<ApprovalOutcome>;
    /** Advance to the next queued ask, if any. The promoted ask's source
     * badge is re-checked against the log that has kept appending since it
     * was parked (P-4: a same-callId twin parked while live may surface long
     * after its call settled). */
    private startNext;
    /**
     * The user decided on the current approval; settles it and drains the
     * next queued ask if any. No-op when nothing is pending.
     * @param outcome - `'allowed-once'` or `'rejected'`. The protocol has no
     *   allow-always and the panel never offers it for a DSH ask; one arriving
     *   anyway is refused (fail closed). The panel's option detail carries
     *   nothing the protocol can use beyond its panel key.
     */
    decide(outcome: PermissionPanelOutcome, decision?: PermissionPanelDecision): void;
    /**
     * Settle the active and all queued asks (plugin teardown). The panel
     * unmounts as the snapshot clears.
     * @param outcome - The outcome every pending ask resolves with.
     */
    settleAll(outcome: ApprovalOutcome): void;
    /**
     * Record a settling ask's callId as consumed (see {@link consumedCallIds}).
     * @param pending - The ask leaving the active/queue set.
     */
    private noteConsumed;
    /**
     * A same-callId duplicate just parked: every pending ask on that callId is
     * now source-ambiguous. The forged-first order parks the fake ask clean
     * (isLive true, no duplicate visible yet) and the genuine follow-up would
     * carry the only badge — an inverted verdict. Flip them all, then rebuild
     * + notify so an on-screen panel updates immediately. refreshActiveExternal
     * early-returns on an existing external verdict, so the marking is
     * monotonic and never erased. Deliberately badges instead of cancelling:
     * cancelling both would hand the attacker a force-cancel primitive
     * against genuine approvals.
     * @param agentId - The agent domain owning the duplicated call id.
     * @param callId - The duplicated call id (non-undefined by construction).
     */
    private markCallIdAmbiguous;
}
//# sourceMappingURL=approvals.d.ts.map