import React, { type PropsWithChildren } from 'react';
import { type Props as BoxProps } from './Box.js';
type Props = PropsWithChildren<Omit<BoxProps, 'noSelect'> & {
    fromLeftEdge?: boolean;
}>;
/** Exclude rendered cells from fullscreen copy selection, optionally including their left gutter. */
export declare function NoSelect({ fromLeftEdge, ...props }: Props): React.JSX.Element;
export {};
//# sourceMappingURL=NoSelect.d.ts.map