export const BCN_PROTOCOL_VERSION = 3;
export const MAX_FRAME_BYTES = 2 * 1024 * 1024;
export function asRecord(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value))
        return undefined;
    return value;
}
export function asNonEmptyString(value) {
    if (typeof value !== 'string')
        return undefined;
    const trimmed = value.trim();
    return trimmed || undefined;
}
export function parseFrame(value) {
    const frame = asRecord(value);
    const id = asNonEmptyString(frame?.id);
    if (!frame || !asNonEmptyString(frame.type))
        return undefined;
    if (frame.type === 'res') {
        if (!id || typeof frame.ok !== 'boolean')
            return undefined;
        const payload = frame.payload === undefined ? undefined : asRecord(frame.payload);
        if (frame.payload !== undefined && !payload)
            return undefined;
        const error = frame.error === undefined ? undefined : parseResponseError(frame.error);
        if (frame.error !== undefined && !error)
            return undefined;
        if (!frame.ok && !error)
            return undefined;
        return {
            type: 'res',
            id,
            ok: frame.ok,
            ...(payload ? { payload } : {}),
            ...(error ? { error } : {}),
        };
    }
    if (frame.type === 'req') {
        const method = asNonEmptyString(frame.method);
        const params = asRecord(frame.params);
        if (!id || !method || !params)
            return undefined;
        return { type: 'req', id, method, params };
    }
    if (frame.type === 'event') {
        const event = asNonEmptyString(frame.event);
        const payload = asRecord(frame.payload);
        const seq = frame.seq === undefined ? undefined : Number(frame.seq);
        if (!event || !payload || (seq !== undefined && (!Number.isSafeInteger(seq) || seq < 0)))
            return undefined;
        return { type: 'event', event, payload, ...(seq !== undefined ? { seq } : {}) };
    }
    return undefined;
}
function parseResponseError(value) {
    const error = asRecord(value);
    const code = asNonEmptyString(error?.code);
    const message = asNonEmptyString(error?.message);
    if (!error || !code || !message || typeof error.retryable !== 'boolean')
        return undefined;
    const retryAfterMs = error.retry_after_ms;
    if (retryAfterMs !== undefined && (!Number.isSafeInteger(retryAfterMs) || Number(retryAfterMs) < 0)) {
        return undefined;
    }
    return {
        code,
        message,
        retryable: error.retryable,
        ...(Object.hasOwn(error, 'details') ? { details: error.details } : {}),
        ...(retryAfterMs !== undefined ? { retry_after_ms: Number(retryAfterMs) } : {}),
    };
}
function parseProviderRegistration(value) {
    const record = asRecord(value);
    const providerId = asNonEmptyString(record?.providerId);
    const providerBotRef = asNonEmptyString(record?.providerBotRef);
    if (!providerId || !providerBotRef || record?.mode !== 'plugin' || record.authMode !== 'static_bearer') {
        throw new Error('BCN Bot Session has invalid Provider registration metadata');
    }
    return { providerId, providerBotRef, mode: 'plugin', authMode: 'static_bearer' };
}
export function parseBotSession(value) {
    let parsed;
    try {
        parsed = JSON.parse(value);
    }
    catch {
        throw new Error('BCN Bot Session credential is not valid JSON');
    }
    const record = asRecord(parsed);
    const endpoint = asNonEmptyString(record?.endpoint);
    const botUuid = asNonEmptyString(record?.botUuid);
    const botToken = asNonEmptyString(record?.botToken);
    const botName = asNonEmptyString(record?.botName);
    if (record?.version !== 1 || !endpoint || !botUuid || !botToken || !botName) {
        throw new Error('BCN Bot Session credential has an unsupported or incomplete shape');
    }
    const registration = record.registration === undefined ? undefined : parseProviderRegistration(record.registration);
    return { version: 1, endpoint, botUuid, botToken, botName, ...(registration ? { registration } : {}) };
}
export function parseChatSendParams(value) {
    return parseChatParams(value, true);
}
export function parseChatInjectParams(value) {
    return parseChatParams(value, false);
}
function parseChatParams(value, allowSendFields) {
    const record = asRecord(value);
    const sessionKey = asNonEmptyString(record?.session_key);
    const groupId = asNonEmptyString(record?.bcs_group_id);
    const message = asRecord(record?.message);
    const channel = asRecord(record?.channel);
    const sessionContext = asRecord(record?.session_context);
    if (!record || !sessionKey || !groupId || !message || !channel || !sessionContext) {
        throw new Error('chat params require session_key, bcs_group_id, message, channel, and session_context');
    }
    if (!Array.isArray(message.content) || !Number.isFinite(message.timestamp) || typeof message.role !== 'string') {
        throw new Error('chat message has an invalid shape');
    }
    const content = message.content.map((block) => {
        const item = asRecord(block);
        if (!item || !asNonEmptyString(item.type))
            throw new Error('chat message contains an invalid content block');
        return item;
    });
    const bcsSessionId = asNonEmptyString(record.bcs_session_id);
    const attachments = Array.isArray(record.attachments)
        ? record.attachments.flatMap((item) => {
            const attachment = asRecord(item);
            return attachment ? [attachment] : [];
        })
        : undefined;
    const base = {
        session_key: sessionKey,
        bcs_group_id: groupId,
        ...(bcsSessionId ? { bcs_session_id: bcsSessionId } : {}),
        message: { role: message.role, content, timestamp: Number(message.timestamp) },
        channel,
        session_context: sessionContext,
        ...(Array.isArray(record.tags) ? { tags: record.tags.filter((item) => typeof item === 'string') } : {}),
        ...(attachments ? { attachments } : {}),
    };
    if (!allowSendFields)
        return base;
    const idempotencyKey = asNonEmptyString(record.idempotency_key);
    return {
        ...base,
        ...(typeof record.timeout_ms === 'number' && Number.isFinite(record.timeout_ms)
            ? { timeout_ms: record.timeout_ms }
            : {}),
        ...(idempotencyKey ? { idempotency_key: idempotencyKey } : {}),
    };
}
export function extractMessageText(message) {
    const chunks = [];
    for (const block of message.content) {
        if (block.type === 'text' && typeof block.text === 'string')
            chunks.push(block.text);
    }
    const text = chunks.join('').trim();
    if (!text)
        throw new Error('BCN message contains no visible text');
    if (Buffer.byteLength(text, 'utf8') > 1024 * 1024)
        throw new Error('BCN message text exceeds 1 MiB');
    return text;
}
//# sourceMappingURL=protocol.js.map