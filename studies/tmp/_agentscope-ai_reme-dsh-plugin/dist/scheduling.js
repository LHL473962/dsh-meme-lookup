const DAILY_CRON = /^(\d{1,2})\s+(\d{1,2})\s+\*\s+\*\s+\*$/;
/** Check the daily cron syntax without searching for its next occurrence. */
export function validateDailyCron(cron) {
    const match = DAILY_CRON.exec(String(cron || "").trim());
    if (!match)
        throw new Error("dreamCron must use the daily form '<minute> <hour> * * *'");
    if (Number(match[1]) > 59 || Number(match[2]) > 23)
        throw new Error("dreamCron contains an invalid hour or minute");
}
/** Resolve the next occurrence of ReMe's deliberately narrow daily cron form. */
export function nextDailyRun(cron, timezone, now = new Date()) {
    validateDailyCron(cron);
    const match = DAILY_CRON.exec(String(cron || "").trim());
    const minute = Number(match[1]);
    const hour = Number(match[2]);
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "numeric",
        minute: "numeric",
        hourCycle: "h23",
    });
    const next = new Date(now.getTime() - 26 * 60 * 60 * 1000);
    next.setUTCSeconds(0, 0);
    const scheduledDays = new Set();
    for (let checked = 0; checked < 5 * 24 * 60; checked += 1) {
        const parts = formatter.formatToParts(next);
        const part = (type) => parts.find((candidate) => candidate.type === type)?.value;
        const candidateHour = Number(part("hour"));
        const candidateMinute = Number(part("minute"));
        if (candidateHour === hour && candidateMinute === minute) {
            const day = `${part("year")}-${part("month")}-${part("day")}`;
            if (!scheduledDays.has(day)) {
                scheduledDays.add(day);
                if (next.getTime() > now.getTime())
                    return next;
            }
        }
        next.setUTCMinutes(next.getUTCMinutes() + 1);
    }
    throw new Error("dreamCron has no occurrence in the scheduling window");
}
/** Return the latest message date in the ReMe workspace timezone. */
export function messagesDay(messages, timezone) {
    const days = messages
        .map((message) => timestampDay(message.created_at, timezone))
        .filter(Boolean);
    return days.sort().at(-1) || "";
}
/** Format an instant as a workspace-local calendar date. */
export function dateInTimezone(date, timezone) {
    return timestampDay(date.toISOString(), timezone);
}
/** Validate an IANA timezone without maintaining a second timezone catalog. */
export function validTimezone(value) {
    if (typeof value !== "string" || !value.trim())
        return false;
    try {
        new Intl.DateTimeFormat("en", { timeZone: value }).format(0);
        return true;
    }
    catch {
        return false;
    }
}
function timestampDay(value, timezone) {
    if (!value)
        return "";
    const date = new Date(value);
    if (!Number.isFinite(date.getTime()))
        return value.slice(0, 10);
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(date);
    const part = (type) => parts.find((item) => item.type === type)?.value || "";
    return `${part("year")}-${part("month")}-${part("day")}`;
}
//# sourceMappingURL=scheduling.js.map