import { arr, num, rec, str } from '../narrow.js';
import { closeTurn, itemEvents } from './items.js';
import { turnEndReason } from './notices.js';
/** Replay turns (oldest first) into events, advancing `ctx`. */
export function replayTurns(turns, ctx) {
    const out = [];
    for (const raw of turns) {
        const turn = rec(raw);
        if (turn === undefined)
            continue;
        const id = str(turn.id);
        if (id !== undefined)
            ctx.turnId = id;
        const startedAt = num(turn.startedAt);
        const completedAt = num(turn.completedAt);
        const start = startedAt === undefined ? ctx.now() : startedAt * 1000;
        const end = completedAt === undefined ? start : completedAt * 1000;
        const running = str(turn.status) === 'inProgress';
        for (const entry of arr(turn.items)) {
            const item = rec(entry);
            if (item === undefined)
                continue;
            out.push(...itemEvents(item, 'started', ctx, start));
            // A running turn's unfinished item completes live.
            if (running && str(item.status) === 'inProgress')
                continue;
            out.push(...itemEvents(item, 'completed', ctx, start));
        }
        if (!running)
            closeTurn(ctx, out, turnEndReason(turn), end);
    }
    return out;
}
