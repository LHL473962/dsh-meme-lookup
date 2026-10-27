/**
 * Security gate for URLs that leave the TUI via a click action.
 *
 * Link targets originate from model output (prompt injection can shape
 * them), plugin-rendered text, and file contents. Handing an arbitrary
 * scheme to the OS handler (`xdg-open` / `open` / cmd `start`) lets that
 * content launch registered protocol handlers — `ssh:`, custom IM
 * handlers, anything installed. Only http(s) and the TUI's own file
 * link forms may reach the OS; everything else is dropped here.
 */
export type OpenTargetClassification = {
    kind: 'file-actions';
    path: string;
} | {
    kind: 'external';
} | {
    kind: 'rejected';
};
/**
 * Classify a clicked link target. Mirrors the previous handleOpenTarget
 * dispatch order (dsh-file: and file: keep going through the file-action
 * menu), with the final fall-through narrowed from "open anything" to
 * "open http(s) only".
 * @param url - the clicked link target.
 * @returns the action the click handler should take.
 */
export declare function classifyOpenTarget(url: string): OpenTargetClassification;
//# sourceMappingURL=urlGuard.d.ts.map