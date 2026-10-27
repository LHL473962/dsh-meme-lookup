/**
 * Upstream driver for the TUI workspace capability.
 *
 * This driver detects the `tuiWorkspaces` service and its host-only facade,
 * performs real read-only enumeration/resolution probes in `verifyLive`, and
 * mounts a thin Host Workspace Port over the same legacy host facade. It
 * deliberately does not import Standard/Spec and does not define protocol
 * semantics.
 *
 * Publication is feature-level: only the methods actually verified by a
 * read-only/reversible probe are promoted to live. Mutating methods
 * (rename/runCommand) and command-shell execution remain degraded in P3
 * because they cannot be safely auto-reversed on a real host.
 */
import type { Detection } from './detection.js';
import type { UpstreamDriver } from './driver.js';
export declare function detectWorkspaceCapability(ctx: unknown): Detection;
export declare const workspaceDriver: UpstreamDriver;
//# sourceMappingURL=workspace-driver.d.ts.map