import { type ReceiptReads } from './receipt-context.js';
import type { ToolCallViewProps } from '@deepseek-ai/dsh-client-ui-tool/client';
import type { QueryClient } from '@tanstack/react-query';
import type { InstallationServices } from './install-control.js';
import type { InstallResult, PendingInstallResult } from './install-result.js';
import type { SearchViewServices } from './conversation-detail.js';
export interface InstallViewServices {
    client: QueryClient;
    receipt: ReceiptReads;
    confirmation?: SearchViewServices;
    installation: Pick<InstallationServices, 'sessionId' | 'operation' | 'installed' | 'skillUse'>;
    openInstalled(result: InstallResult): Promise<void>;
}
export declare class CatalogUnavailableError extends Error {
}
export declare function InstallToolView(props: ToolCallViewProps & {
    services: InstallViewServices;
}): import("react/jsx-runtime").JSX.Element;
export declare function PendingInstallation({ result, services }: {
    result: PendingInstallResult;
    services?: SearchViewServices;
}): import("react/jsx-runtime").JSX.Element;
