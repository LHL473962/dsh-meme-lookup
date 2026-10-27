import { ensureLegacySessionEventTypes } from './sessionLog.js';
export async function readPersistedSession(source, id) {
    ensureLegacySessionEventTypes();
    if (typeof source.open === 'function') {
        const handle = await source.open(id, 'read');
        try {
            const { events } = await handle.read();
            return { meta: handle.header, events, inheritedEventCount: handle.inheritedEventCount };
        }
        finally {
            await handle.close();
        }
    }
    if (typeof source.load === 'function')
        return source.load(id);
    throw new Error('dsh-tui: session persistence has no read API');
}
