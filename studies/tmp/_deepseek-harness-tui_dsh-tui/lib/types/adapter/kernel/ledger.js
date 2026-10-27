/**
 * Kernel-internal effect ledger entry.
 *
 * This is the internal write channel for the legacy `ctx.tuiEffectLedger`
 * after P1 wiring: `TuiEffectLedgerRuntime` routes every public write through
 * `createKernelLedger()`, which enforces shadow policy and owner derivation
 * before the existing JSONL writer serializes the record. It is NOT an
 * unwired experimental block.
 *
 * The effect ledger is a Kernel cross-cutting concern. This module is NOT a
 * Host Port: callers cannot pass a forged owner, and the Kernel recorder must
 * derive ownership from the current Cordis activation before recording.
 * Use this only inside Kernel/Standard internal services.
 *
 * The public record() method therefore accepts the current Context and lets an
 * injected owner resolver map it to the verified HostOwnerRef. There is no
 * caller-facing path that accepts an owner/principal/activationId.
 */
import { assertCapabilityShadowPolicy } from './runtime.js';
/** Conservative fallback for contexts without a verified component identity. */
export const baseOwnerResolver = () => ({ componentId: 'host' });
/** Build an internal Kernel ledger recorder. The sink receives a complete
 * owner-resolved record; no public Host Port can bypass owner derivation.
 * Every write entry is guarded by the active shadow policy (mutate cannot run
 * in passive or replay shadow). */
export function createKernelLedger(sink, mode = 'new', resolveOwner = baseOwnerResolver, slices) {
    return Object.freeze({
        record(entry, context) {
            assertCapabilityShadowPolicy('host.ledger.record', mode, slices);
            sink({ entry, owner: resolveOwner(context) });
        },
    });
}
