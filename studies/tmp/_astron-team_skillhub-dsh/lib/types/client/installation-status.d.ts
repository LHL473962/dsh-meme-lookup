import type { ConversationSearchResult } from '../host/search-result.js';
type Installation = NonNullable<ConversationSearchResult['items'][number]['installation']>;
export declare function InstallationStatus({ installation, pending, snapshot, hideEmpty }: {
    installation?: Installation;
    pending?: boolean;
    snapshot?: boolean;
    hideEmpty?: boolean;
}): import("react/jsx-runtime").JSX.Element | null;
export {};
