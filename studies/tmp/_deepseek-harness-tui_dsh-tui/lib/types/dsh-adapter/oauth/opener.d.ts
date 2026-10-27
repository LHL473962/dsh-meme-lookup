/**
 * Best-effort host-side conveniences for OAuth flows: opening the default
 * browser and copying short text to the clipboard.
 *
 * pi-ai's flows emit an `auth_url` event whose instructions assume the host
 * opens the browser itself ("A browser window should open…"), because the
 * authorize URL is hundreds of characters — unclickable and practically
 * uncopyable once a terminal panel wraps it (wrap artifacts inside the
 * encoded `redirect_uri` are exactly how hand-copied URLs die with
 * `invalid_authorize_request`). These helpers restore that host contract.
 * Every path is best-effort and never throws: a missing opener or clipboard
 * degrades to the URL staying on screen with a copy action.
 *
 * @module @deepseek-harness-tui/dsh-tui/oauth/opener
 */
/** The browser-opening command for this platform, or undefined when unknown. */
export declare function openerFor(url: string): {
    command: string;
    args: readonly string[];
    verbatim: boolean;
} | undefined;
/**
 * Open `url` in the default browser, detached; the TUI keeps running.
 * @returns whether the opener process could be spawned at all (not whether
 *   a browser eventually appeared — that is not observable here).
 */
export declare function openInBrowser(url: string): boolean;
/**
 * Copy `text` to the system clipboard, trying this platform's helpers in
 * order. Resolves whether one succeeded; never rejects.
 */
export declare function copyToClipboard(text: string): Promise<boolean>;
//# sourceMappingURL=opener.d.ts.map