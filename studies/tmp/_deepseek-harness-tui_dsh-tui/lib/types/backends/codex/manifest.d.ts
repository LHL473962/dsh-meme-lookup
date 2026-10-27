/**
 * Static description of the Codex backend (P0 manifest; see
 * `src/agent/backend-manifest.ts` for the field semantics). Values mirror what
 * `src/kernelPrefs.ts`'s `KERNEL_INFO` used to hardcode, byte for byte.
 *
 * Pure data, zero imports: the build-time index imports this module statically
 * on every boot, DSH-only ones included.
 *
 * `unloadExport` is the hook that used to hide in `backends.ts`'s loader
 * (`.then(m => { closeCodexHubs = m.closeAllCodexHubs })`). The app-server hub is
 * a process-wide pool keyed by settings fingerprint and reused across sessions
 * (`rpc/hub.ts`), so no session's `dispose()` can own it — but the registry only
 * remembers the hook of an entry it actually loaded (P0 D4).
 *
 * `vendorPackages: []` states the fact explicitly: this backend drives the
 * user's own `codex` binary and imports no vendor package. `install` is absent
 * for the same reason, and that absence is a first-class answer rather than a
 * gap (§6 item 12): there is no package for the host to add — what the row owes
 * a user is detection's own "how to get it" hint, never an install button that
 * could not do anything.
 *
 * `nativeKey` is deliberately absent (B-5): this backend does not read a
 * `native.<key>` channel — its sessions write `native: {}` — and deriving one
 * from a stray declaration would *widen* the boundary gate (P0 §6). The slot it
 * held until B-5 had no consumer at all, which is exactly the manifest claiming
 * a channel no one speaks; claude never had one.
 */
import type { BackendManifest } from '../../agent/backend-manifest.js';
export declare const manifest: BackendManifest;
//# sourceMappingURL=manifest.d.ts.map