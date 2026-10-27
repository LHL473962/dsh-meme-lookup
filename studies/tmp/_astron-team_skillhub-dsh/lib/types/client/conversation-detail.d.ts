import type { QueryClient } from '@tanstack/react-query';
import type { RemoteResult, TypertRemoteNamespaceMap } from '@deepseek-ai/dsh-typert-protocol';
import type { ConversationDetail as ConversationDetailData } from '../host/types.js';
import type { InstallationServices } from './install-control.js';
import '../../lib/typert.remote-client.js';
import type { ConversationSearchResult } from '../host/search-result.js';
export interface SearchViewServices {
    client: QueryClient;
    remote: TypertRemoteNamespaceMap['skillhub'];
    openDetail: (reference: string, signal: AbortSignal) => Promise<RemoteResult<ConversationDetailData>>;
    reopenDetail: (callId: string, reference: string, signal: AbortSignal) => Promise<RemoteResult<ConversationDetailData>>;
    acknowledgeDetail: (reference: string, token: string) => Promise<RemoteResult<boolean>>;
    installation: InstallationServices;
    openCatalog: (result: ConversationSearchResult) => Promise<void>;
}
export declare function ConversationDetail({ reference, callId, originalSource, services, close, browseVersions, allowHistoricalReopen }: {
    reference: string;
    callId: string;
    originalSource: string;
    services: SearchViewServices;
    close: () => void;
    browseVersions?: () => void;
    allowHistoricalReopen?: boolean;
}): import("react/jsx-runtime").JSX.Element;
