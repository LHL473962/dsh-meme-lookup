import { createUserMessage } from "@deepseek-ai/dsh-llm";
import { ReMeClient } from "./reme/client.js";
import { resolveConfig } from "./config.js";
import { hasGuidance, memoryGuidance, REME_PLUGIN_SOURCE } from "./guidance.js";
import { ReMeRuntime } from "./runtime.js";
import { ReMeStatusGateway } from "./status-gateway.js";
import { registerReMeTools } from "./tools.js";
export const name = "reme-memory";
export const inject = ["agents", "sessions", "tools"];
export function apply(ctx, input = {}) {
    let config = resolveConfig(input);
    const current = () => config;
    const client = new ReMeClient(current);
    const runtime = new ReMeRuntime(client, current, ctx.logger);
    ctx.provide("remeMemory", runtime);
    void ctx.plugin(ReMeStatusGateway);
    ctx.effect(() => registerReMeTools(ctx, client, current), "remeMemory.tools()");
    ctx.effect(() => {
        runtime.start();
        return () => runtime.disposeAll();
    }, "remeMemory.lifecycle()");
    ctx.on("loader/volatile-update", () => {
        config = resolveConfig(input);
        runtime.reconfigure();
    });
    ctx.on("agent/created", ({ agent }) => {
        const config = current();
        if (config.rootAgentsOnly && agent.session.header?.origin === "subagent")
            return;
        agent.ctx.effect(() => () => runtime.dispose(agent.session), "remeMemory.disposeSession()");
        if (agent.status !== "idle" ||
            hasGuidance(agent.session, agent.inbox.nextStep))
            return;
        agent.inject(createUserMessage({
            content: [{ type: "text", text: memoryGuidance(config.language) }],
            source: {
                kind: REME_PLUGIN_SOURCE,
                form: "instructions",
            },
        }));
    });
    ctx.on("session/event", (session, event) => {
        const config = current();
        if (config.rootAgentsOnly && session.header?.origin === "subagent")
            return;
        runtime.capture(session, event);
    });
}
export { Config } from "./config.js";
//# sourceMappingURL=index.js.map