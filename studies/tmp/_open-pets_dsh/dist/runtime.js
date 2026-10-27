import { pickHookSpeech, validateHookSpeech } from "@open-pets/agent-events";
import { createOpenPetsClient } from "@open-pets/client";
const automaticTimeoutMs = 500;
const errorSuccessSuppressionMs = 5_000;
const minSpeechIntervalMs = 1_200;
export function sanitizeStatusLine(text) {
    if (!text || typeof text !== "string")
        return null;
    let s = text.replace(/[\r\n]+/g, " ").trim();
    s = s.replace(/https?:\/\/\S+/gi, "");
    s = s.replace(/[`{};]/g, "");
    s = s.replace(/(?:^|\s)(?:~|\.{1,2}|[A-Za-z]:)?[\\/]\S+\/([^\s/]+)/g, " $1");
    if (s.length > 100)
        s = s.slice(0, 97) + "...";
    s = s.trim();
    if (s.length === 0)
        return null;
    try {
        return validateHookSpeech(s);
    }
    catch {
        return null;
    }
}
/**
 * Map only the categorical values defined by DSH. Event payloads are
 * deliberately not inspected or forwarded. For agent/status, only the
 * categorical `status` property is read from the event envelope.
 */
export function classifyDshEvent(eventName, event) {
    if (eventName === "agent/status") {
        const status = typeof event === "string" ? event : getStatusCategory(event);
        if (status === "running")
            return { reaction: "thinking", speechCategory: "thinking" };
        if (status === "idle")
            return { reaction: "success", speechCategory: "success" };
        return undefined;
    }
    if (eventName === "agent/error")
        return { reaction: "error", speechCategory: "error" };
    if (eventName === "approval/request")
        return { reaction: "waiting", speechCategory: "permission" };
    return undefined;
}
export function createOpenPetsDshRuntime(options = {}) {
    const clientFactory = options.clientFactory ?? createOpenPetsDshClient;
    const schedule = options.schedule ?? defaultSchedule;
    const minSpeech = options.minSpeechIntervalMs ?? minSpeechIntervalMs;
    const enableStatusLineStream = options.enableStatusLineStream !== false;
    const enableToolEvents = options.enableToolEvents !== false;
    const enableApprovalEvents = options.enableApprovalEvents !== false;
    let client;
    let recentErrorAt = Number.NEGATIVE_INFINITY;
    let lastCustomSpeechAt = Number.NEGATIVE_INFINITY;
    let streamBuffer = "";
    let statusExtractedForTurn = false;
    const getClient = () => {
        client ??= clientFactory();
        return client;
    };
    const dispatch = (decision) => {
        if (!decision)
            return;
        const now = options.now?.() ?? Date.now();
        if (decision.reaction === "error") {
            recentErrorAt = now;
        }
        else if (decision.reaction === "success" && now - recentErrorAt < errorSuccessSuppressionMs) {
            return;
        }
        const work = async () => {
            try {
                const speech = validateHookSpeech(pickHookSpeech(decision.speechCategory, options.random));
                await getClient().say(speech, { reaction: decision.reaction });
            }
            catch {
                // Automatic agent listeners must never affect the DSH operation.
            }
        };
        try {
            const scheduled = schedule(work);
            if (isPromiseLike(scheduled))
                void scheduled.catch(() => undefined);
        }
        catch {
            // A scheduler supplied by the host is optional infrastructure.
        }
    };
    const dispatchCustom = (message, reaction) => {
        const now = options.now?.() ?? Date.now();
        if (now - lastCustomSpeechAt < minSpeech)
            return;
        lastCustomSpeechAt = now;
        const work = async () => {
            try {
                const validated = validateHookSpeech(message);
                await getClient().say(validated, { reaction });
            }
            catch {
                // Automatic agent listeners must never affect the DSH operation.
            }
        };
        try {
            const scheduled = schedule(work);
            if (isPromiseLike(scheduled))
                void scheduled.catch(() => undefined);
        }
        catch {
            // Ignored
        }
    };
    return {
        handleStatus(event) {
            const status = typeof event === "string" ? event : getStatusCategory(event);
            if (status === "running") {
                streamBuffer = "";
                statusExtractedForTurn = false;
            }
            dispatch(classifyDshEvent("agent/status", event));
        },
        handleEvent(eventName, event) {
            dispatch(classifyDshEvent(eventName, event));
        },
        handleApproval() {
            if (!enableApprovalEvents)
                return;
            dispatch(classifyDshEvent("approval/request"));
        },
        handleStream(payload) {
            if (!enableStatusLineStream)
                return;
            if (!payload || typeof payload !== "object")
                return;
            const frame = payload.frame;
            if (!frame)
                return;
            if (frame.type === "start") {
                streamBuffer = "";
                statusExtractedForTurn = false;
                return;
            }
            if (frame.type === "end") {
                streamBuffer = "";
                return;
            }
            if (frame.type === "chunk" && frame.chunk?.type === "text-delta" && typeof frame.chunk.text === "string") {
                if (statusExtractedForTurn)
                    return;
                streamBuffer += frame.chunk.text;
                const arrowIndex = streamBuffer.search(/[⏵▶]/);
                if (arrowIndex !== -1) {
                    const newlineIndex = streamBuffer.indexOf("\n", arrowIndex);
                    if (newlineIndex !== -1) {
                        statusExtractedForTurn = true;
                        const rawStatus = streamBuffer.slice(arrowIndex + 1, newlineIndex).trim();
                        const clean = sanitizeStatusLine(rawStatus);
                        if (clean) {
                            dispatchCustom(clean, "working");
                        }
                    }
                }
            }
        },
        handleToolResult(exec) {
            if (!enableToolEvents)
                return;
            if (!exec || typeof exec !== "object")
                return;
            const e = exec;
            if (!e.name)
                return;
            const args = e.arguments ?? e.params;
            if (e.name === "bash" && args?.description) {
                const clean = sanitizeStatusLine(String(args.description));
                if (clean)
                    dispatchCustom(clean, "running");
            }
            else if (e.name === "edit" || e.name === "write") {
                const filePath = args?.file_path ? String(args.file_path).split(/[\\/]/).pop() : "";
                const action = e.name === "edit" ? "Chỉnh sửa" : "Ghi file";
                const clean = sanitizeStatusLine(filePath ? `${action} ${filePath}` : action);
                if (clean)
                    dispatchCustom(clean, "editing");
            }
            else if (e.name === "read") {
                const filePath = args?.file_path ? String(args.file_path).split(/[\\/]/).pop() : "";
                const clean = sanitizeStatusLine(filePath ? `Đọc ${filePath}` : "Đang đọc file");
                if (clean)
                    dispatchCustom(clean, "working");
            }
        },
    };
}
export function createOpenPetsDshClient() {
    return createOpenPetsClient({
        remote: false,
        connectTimeoutMs: automaticTimeoutMs,
        responseTimeoutMs: automaticTimeoutMs,
    });
}
/** Register the DSH listeners without taking ownership of their flow. */
export function registerDshListeners(cordis, options = {}) {
    const runtime = createOpenPetsDshRuntime(options);
    if (options.enabled === false)
        return runtime;
    const on = cordis.on;
    on("agent/status", (event) => runtime.handleStatus(event));
    on("agent/error", () => runtime.handleEvent("agent/error"));
    on("approval/request", (_request, next) => {
        runtime.handleApproval();
        return typeof next === "function" ? next() : undefined;
    });
    on("agent/assistant-stream", (payload) => runtime.handleStream(payload));
    on("tools/result", (exec, result) => runtime.handleToolResult(exec, result));
    return runtime;
}
function defaultSchedule(work) {
    void Promise.resolve().then(work).catch(() => undefined);
}
function isPromiseLike(value) {
    return typeof value === "object" && value !== null && typeof value.then === "function";
}
function getStatusCategory(event) {
    if (typeof event !== "object" || event === null)
        return undefined;
    return event.status;
}
//# sourceMappingURL=runtime.js.map