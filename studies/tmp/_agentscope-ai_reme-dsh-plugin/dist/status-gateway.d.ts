import type { Context } from "@deepseek-ai/cordis";
import { TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
import type { ReMeRuntime } from "./runtime.js";
import type { ReMeRuntimeSnapshot } from "./runtime-status.js";
declare module "@deepseek-ai/cordis" {
    interface Context {
        /** Active ReMe integration runtime mounted by the DSH adapter. */
        remeMemory: ReMeRuntime;
    }
}
/** Read-only Host projection consumed by the local ReMe status page. */
export declare class ReMeStatusGateway extends TypertRemoteService {
    static inject: string[];
    constructor(ctx: Context);
    /** Return current queue, task, and Auto Dream scheduling state. */
    runtime(): ReMeRuntimeSnapshot;
}
export default ReMeStatusGateway;
//# sourceMappingURL=status-gateway.d.ts.map