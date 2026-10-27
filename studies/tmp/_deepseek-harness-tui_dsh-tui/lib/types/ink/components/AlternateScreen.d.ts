import React, { type PropsWithChildren } from 'react';
type Props = PropsWithChildren<{
    mouseTracking?: boolean;
}>;
/**
 * Own the alternate buffer and its input modes for the lifetime of this subtree.
 *
 * Kernel-switch handoff: when the process booted as a handoff replacement,
 * the terminal is already in the alternate buffer (the old parent entered
 * it and handed the screen over instead of restoring the main buffer).
 * Adoption skips ENTER_ALT_SCREEN (a second enter would push a stray
 * save-cursor and can double-buffer on some terminals) and reports
 * "adopted" on the ACK pipe. Until the replacement ACKs its first flushed
 * frame the 1049 exit stays with the old parent, so a replacement that dies
 * before it is ready leaves exactly one process to close the bracket.
 */
export declare function AlternateScreen({ children, mouseTracking }: Props): React.JSX.Element;
export {};
//# sourceMappingURL=AlternateScreen.d.ts.map