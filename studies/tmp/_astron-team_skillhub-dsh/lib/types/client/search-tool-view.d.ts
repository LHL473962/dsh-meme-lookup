import type { ToolCallViewProps } from '@deepseek-ai/dsh-client-ui-tool/client';
import type { SearchViewServices } from './conversation-detail.js';
/** Only the original call's validated metadata is rendered; opening a transcript makes no requests. */
export declare function SearchToolView(props: ToolCallViewProps & {
    services: SearchViewServices;
}): import("react/jsx-runtime").JSX.Element;
