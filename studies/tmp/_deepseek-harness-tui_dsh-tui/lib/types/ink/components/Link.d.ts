import React, { type ReactNode } from 'react';
export type Props = {
    readonly children?: ReactNode;
    readonly url: string;
    readonly fallback?: ReactNode;
};
export default function Link({ children, url, fallback }: Props): React.JSX.Element;
//# sourceMappingURL=Link.d.ts.map