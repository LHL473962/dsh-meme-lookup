/**
 * Kernel diagnostics surface.
 *
 * @internal P2: a snapshot formatter consumed by `/doctor` and local
 * diagnostics. The richer `KernelRuntime.diagnosticSnapshot()` is the
 * canonical kernel state surface; this helper remains for the legacy
 * /doctor line shape. It never writes, registers, subscribes or mutates host
 * capabilities.
 */
export function collectAdapterDiagnostics(runtime, descriptor, permissions) {
    return Object.freeze({
        runtime: Object.freeze({ ...runtime }),
        descriptor,
        permissions: Object.freeze([...permissions]),
    });
}
