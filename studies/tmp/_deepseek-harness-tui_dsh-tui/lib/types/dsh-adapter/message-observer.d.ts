/**
 * messages.observe contract surface (C-042,
 * `messages.dsh/v1alpha1#MessageObserver`): the host event broker, mounted
 * by the dsh-tui-plugin-host row as `ctx.tuiMessageObserver`.
 *
 * Mapping (deliberately narrow):
 *
 * - `user/message`      → `message.received` (the user's prompt)
 * - `assistant/message` → `message.sent` (the assembled step reply)
 * - EVERYTHING ELSE (assistant/chunk streaming, tool/*, turn/*, mode
 *   events, …) produces NO envelope — observation starts conservative.
 *
 * Envelope rules (the pinned `@dsh-std/messages` v0.15 definition):
 *
 * - `scope` = `session:<sessionId>`; `sequence` = the session event's own
 *   `seq` (monotonic within scope, gaps allowed — unmapped events simply
 *   leave holes); `eventId` = `<sessionId>:<seq>` with schema-unsafe
 *   characters flattened to `_`.
 * - privacyClass is ALWAYS `sensitive` for now (conservative and
 *   irreversible-safe; finer classification is a future, documented step).
 * - Content carries the text/image subset (MCP ContentBlock): text runs
 *   join (a pure-text message keeps the single trimmed block); session
 *   image blocks are `{type:'image', attachment}` REFERENCES resolved via
 *   the attachments service into base64 `data` with a 192 KiB budget —
 *   an unreadable/oversize image is dropped and marks `truncated`.
 *   `summary` is the sanitized first 200 cells of the joined text;
 *   `truncated` marks summary, content, or image-drop truncation.
 * - EVERY produced envelope passes the official pinned validator before delivery;
 *   a malformed envelope is dropped with a warning, never delivered.
 *
 * Scope isolation (C-042): `subscribe` requires an exact `scope` string
 * and an envelope is delivered ONLY to subscriptions of the same scope —
 * a plugin moving between sessions subscribes per scope and never
 * receives another session's sensitive content.
 *
 * Grant gating (`messages.observe.read`, default deny):
 *
 * - SUBSCRIBE time: a denied plugin gets a no-op disposer + a warning
 *   naming plugin and grant (fast fail, as-if-unsubscribed).
 * - DELIVER time: every publish re-checks each subscription; a revoked
 *   grant RELEASES the subscription (contract cleanup rule) with one
 *   warning.
 *
 * Delivery semantics: at-most-once, no replay; envelope builds serialize
 * broker-wide (image reads are async — delivery order stays the publish
 * order, so sequence stays monotonic); callbacks of ONE subscription run
 * serially (per-subscription promise chain); a throwing listener is
 * isolated (warn, name the plugin, keep delivering to the rest). The host
 * MUST NOT persist payload through this contract — the broker keeps no
 * history.
 *
 * privacyClass: sensitive — envelope content is never logged.
 */
import { Context, Service } from '@deepseek-ai/cordis';
import { type GrantStore } from '../adapter/standard/grants.js';
import type { TuiEffectLedgerRuntime } from './effect-ledger.js';
/** Envelope content block (MCP ContentBlock text/image subset). */
export type MessagesObserveContentBlock = {
    type: 'text';
    text: string;
} | {
    type: 'image';
    data: string;
    mimeType: string;
};
export interface MessagesObservePayload {
    kind: 'message.created' | 'message.received' | 'message.sent';
    messageId?: string;
    author?: string;
    content: MessagesObserveContentBlock[];
    truncated?: boolean;
}
/** The vendored `messages-observe-envelope-0.15.json` shape. */
export interface MessagesObserveEnvelope {
    eventType: 'messages.observe';
    eventVersion: '0.15';
    eventId: string;
    scope: string;
    sequence: number;
    privacyClass: 'public' | 'internal' | 'sensitive';
    summary: string;
    payload: MessagesObservePayload;
}
export type MessagesObserveListener = (envelope: MessagesObserveEnvelope) => void | Promise<void>;
/** Host-only session-event ingress. Plugins receive only `subscribe`; the
 * channel uses this capability to publish events after its own identity check. */
export interface TuiMessageObserverHost {
    publish(session: unknown, event: unknown): void;
}
/** Summary bound (cells; schema maxLength 1024 chars — 200 cells ≤ 1024). */
export declare const OBSERVE_SUMMARY_CELLS = 200;
/** Content text bound (chars; schema maxLength 262144). */
export declare const OBSERVE_CONTENT_MAX_CHARS = 262144;
/** Scope bound (schema maxLength 256). */
export declare const OBSERVE_SCOPE_MAX_CHARS = 256;
/** messageId bound (schema maxLength 256). */
export declare const OBSERVE_ID_MAX_CHARS = 256;
/** Raw image byte budget per block (192 KiB → ≤262144 base64 chars). */
export declare const OBSERVE_IMAGE_MAX_BYTES: number;
/** Base64 length bound implied by OBSERVE_IMAGE_MAX_BYTES. */
export declare const OBSERVE_IMAGE_BASE64_MAX_CHARS = 262144;
/** Per-callback budget; timeout closes the subscription deterministically. */
export declare const OBSERVE_CALLBACK_TIMEOUT_MS = 1500;
/** Bound queued callbacks per subscription so a stalled listener cannot grow
 * an unbounded Promise chain before its timeout closes the subscription. */
export declare const OBSERVE_CALLBACK_QUEUE_LIMIT = 32;
/** Attachment reads are part of the broker build chain and therefore need an
 * independent bound; a wedged reader must not stall every later envelope. */
export declare const OBSERVE_IMAGE_READ_TIMEOUT_MS = 1500;
declare module '@deepseek-ai/cordis' {
    interface Context {
        tuiMessageObserver: TuiMessageObserverRuntime;
    }
}
/**
 * `ctx.tuiMessageObserver` — the messages.observe broker. The channel
 * publishes mapped session events; plugins subscribe with their own
 * context. When the vendored envelope schema is unavailable (packaging
 * accident) the broker fails CLOSED: subscriptions are accepted but nothing
 * is ever delivered (a host that cannot self-check must not emit).
 */
export declare class TuiMessageObserverRuntime extends Service {
    #private;
    constructor(ctx: Context, options?: {
        grants?: GrantStore;
        ledger?: TuiEffectLedgerRuntime;
        validateEnvelope?: (value: unknown) => void;
        /**
         * @deprecated Use `validateEnvelope` instead.
         * Compatibility alias retained as a long-term face for existing
         * embedders/tests. OWNER: dsh-tui adapter. UNTIL: no scheduled removal.
         */
        envelopeSchema?: Record<string, unknown>;
    });
    /** Grants: the plugin-host row's store when mounted, else a private read.
     *  Resolved PER CALL — sibling services mounted later by the same apply()
     *  are not visible to constructors (cordis), so a constructor-time probe
     *  would silently stick to the fallback. */
    private grants;
    /** Optional observability; a bare mount (tests) simply records nothing. */
    private ledger;
    /**
     * Host-internal read-only diagnostic probe. It validates the mounted broker
     * without creating a subscription and without publishing anything.
     */
    probeDiagnostic(): {
        service: 'tuiMessageObserver';
        ok: true;
        subscriptions: number;
    };
    /**
     * Subscribe to observation envelopes for ONE scope. Identity = the verified
     * Component bound to the PASSED activation (the same identity rule as
     * storage); the scope
     * is required and matched exactly — a plugin moving between sessions
     * subscribes per scope and never receives another scope's sensitive
     * content (C-042 isolation). A denied subscription fast-fails: no-op
     * disposer + warning. The subscription releases when the caller's context
     * unloads.
     */
    subscribe(pluginCtx: Context, listener: MessagesObserveListener, options: {
        scope: string;
    }): () => void;
    private buildAndDeliver;
    /** Release a subscription exactly once (disposer, ctx unload, revoke). */
    private drop;
    /** Join the text blocks of a session message's content (text-only view). */
    private textOf;
    /**
     * Map session content blocks to envelope blocks in order (text/image
     * subset). Consecutive text runs join into one block (capped at
     * OBSERVE_CONTENT_MAX_CHARS, pure-text messages keep the exact legacy
     * shape: a single trimmed block); image blocks resolve through the
     * attachments service (soft-probe) with a byte budget. A failed or
     * oversize image becomes NO block plus the truncation mark; zero
     * surviving blocks collapse to a single empty text block (schema
     * minItems 1).
     */
    private contentOf;
    /** Resolve a session image block (`{type:'image', attachment}` — a
     *  REFERENCE, never inline data) to an envelope image block; undefined =
     *  drop (unreadable, oversize, bad media type, no attachment store). */
    private imageBlockOf;
}
export declare function getHostMessageObserver(runtime: TuiMessageObserverRuntime | undefined): TuiMessageObserverHost | undefined;
//# sourceMappingURL=message-observer.d.ts.map