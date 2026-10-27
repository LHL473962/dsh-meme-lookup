import { createHash } from "node:crypto";
import { messagesDay } from "./scheduling.js";
export function remeSessionId(sessionId) {
    const digest = createHash("sha256")
        .update(String(sessionId))
        .digest("hex")
        .slice(0, 24);
    return `dsh-${digest}`;
}
export function captureMessage(event, sessionId) {
    const message = eventMessage(event);
    if (!message || message.source?.kind === "plugin")
        return null;
    if (event.type === "user/message" && message.source?.kind !== "user")
        return null;
    const role = event.type === "assistant/message" ? "assistant" : "user";
    const text = messageText(message);
    if (!text)
        return null;
    const suffix = Number.isSafeInteger(event.seq)
        ? String(event.seq)
        : stableSuffix(message, text);
    const createdAt = eventTime(event);
    return {
        id: `dsh-${shortHash(sessionId)}-${suffix}`,
        name: role,
        role,
        content: [{ type: "text", text }],
        ...(createdAt ? { created_at: createdAt } : {}),
    };
}
export function messageText(message) {
    if (typeof message.content === "string")
        return message.content.trim();
    if (!Array.isArray(message.content))
        return "";
    return message.content
        .filter((part) => isRecord(part) && part.type === "text" && typeof part.text === "string")
        .map((part) => part.text.trim())
        .filter(Boolean)
        .join("\n\n")
        .trim();
}
function eventMessage(event) {
    if (event.type === "user/message")
        return toMessage(event.data);
    if (event.type === "assistant/message" && isRecord(event.data))
        return toMessage(event.data.message);
    return null;
}
function toMessage(value) {
    if (!isRecord(value))
        return null;
    return {
        id: value.id,
        content: value.content,
        source: isRecord(value.source) ? value.source : undefined,
    };
}
function eventTime(event) {
    if (!Number.isFinite(event.time) || (event.time ?? -1) < 0)
        return "";
    return new Date(event.time).toISOString();
}
function shortHash(value) {
    return createHash("sha256").update(String(value)).digest("hex").slice(0, 12);
}
function stableSuffix(message, text) {
    return shortHash(`${String(message.id || "")}\n${text}`);
}
function isRecord(value) {
    return typeof value === "object" && value !== null;
}
export { messagesDay };
//# sourceMappingURL=messages.js.map