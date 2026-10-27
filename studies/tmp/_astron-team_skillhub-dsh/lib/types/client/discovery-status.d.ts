/** Discovery is an observation at query time, not a permanent installation or execution guarantee. */
export declare function DiscoveryStatus({ confirmed, checkedAt, refreshing, refresh }: {
    confirmed: boolean;
    checkedAt: number;
    refreshing: boolean;
    refresh(): void;
}): import("react/jsx-runtime").JSX.Element;
