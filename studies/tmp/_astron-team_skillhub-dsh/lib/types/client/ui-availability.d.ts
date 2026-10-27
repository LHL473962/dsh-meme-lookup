type Entry = 'main' | 'sidebar' | 'conversation' | 'configuration';
/** Client entry availability is independent of the Host's write authorization. */
export declare class UiAvailability {
    private value;
    private readonly listeners;
    readonly getSnapshot: () => Readonly<Record<Entry, boolean>>;
    readonly subscribe: (listener: () => void) => () => void;
    enable(entry: Entry): () => void;
    private update;
}
export declare function unavailableEntries(value: ReturnType<UiAvailability['getSnapshot']>): string[];
export declare function UiAvailabilityNotice({ availability }: {
    availability: UiAvailability;
}): import("react/jsx-runtime").JSX.Element | null;
export {};
