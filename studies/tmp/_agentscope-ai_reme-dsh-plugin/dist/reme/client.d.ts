import type { AutoMemoryOptions, DreamOptions, ReMeClientConfig, ReMeHealthResult, ReMeFileListingResult, ReMeFileResult, ReMeMessage, ReMeResult, ReMeStatusResult, SearchOptions } from "./types.js";
export declare class ReMeClient {
    private readonly configSource;
    constructor(config: ReMeClientConfig | (() => ReMeClientConfig));
    search(query: string, options?: SearchOptions): Promise<ReMeResult>;
    autoMemory(messages: ReMeMessage[], sessionId: string, options?: AutoMemoryOptions): Promise<ReMeResult>;
    autoDream(options?: DreamOptions): Promise<ReMeResult>;
    healthCheck(options?: {
        signal?: AbortSignal;
    }): Promise<ReMeHealthResult>;
    status(options?: {
        signal?: AbortSignal;
    }): Promise<ReMeStatusResult>;
    appConfig(options?: {
        signal?: AbortSignal;
    }): Promise<ReMeResult>;
    listFiles(path: string, options?: {
        limit?: number;
        signal?: AbortSignal;
    }): Promise<ReMeFileListingResult>;
    loadFile(path: string, options?: {
        signal?: AbortSignal;
    }): Promise<ReMeFileResult>;
    private request;
}
//# sourceMappingURL=client.d.ts.map