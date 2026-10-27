/**
 * This package's own entry (docs/standalone-host-design.md), started by
 * bin/dsh-tui.js for every kernel: take over the installed dsh's root and
 * module resolution before any TUI module loads, mount the runtime on it, then
 * compose the dsh-tui profile (DSH) or the light profile (other kernels). A DSH
 * launch without a usable installed dsh is handed to `dsh --profile` unchanged.
 */
import '../force-production-react.js';
//# sourceMappingURL=host-entry.d.ts.map