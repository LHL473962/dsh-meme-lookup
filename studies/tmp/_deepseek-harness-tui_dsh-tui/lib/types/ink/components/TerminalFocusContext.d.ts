import React, { type PropsWithChildren } from 'react';
import { type TerminalFocusState } from '../terminal-focus-state.js';
export type { TerminalFocusState };
export type TerminalFocusContextProps = {
    readonly isTerminalFocused: boolean;
    readonly terminalFocusState: TerminalFocusState;
};
declare const TerminalFocusContext: React.Context<TerminalFocusContextProps>;
export declare function TerminalFocusProvider({ children }: PropsWithChildren): React.JSX.Element;
export default TerminalFocusContext;
//# sourceMappingURL=TerminalFocusContext.d.ts.map