export type TerminalImageProtocol = 'kitty' | 'sixel' | 'none';
/** Overrides only choose a protocol; TTY/accessibility/handoff guards still apply. */
export declare function selectTerminalImageProtocol(kittyStatus: string | undefined, attributes: readonly number[] | undefined, override: string | undefined): TerminalImageProtocol;
//# sourceMappingURL=terminal-image-protocol.d.ts.map