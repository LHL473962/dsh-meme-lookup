import { BcnBridge } from './bridge.js';
import { Config, normalizeConfig } from './config.js';
import { loadOrRegisterBotSession, persistBotSession } from './credentials.js';
import { BcnWsClient } from './ws-client.js';
export const name = 'deepseek-harness-channel-bcn';
export const inject = [
    'agentDefaultModel',
    'agentPresets',
    'agents',
    'credentials',
    'sessions',
    'sessionPersistence',
    'systemPrompt',
    'tools',
];
export { Config };
export async function apply(ctx, rawConfig) {
    const config = normalizeConfig(rawConfig);
    const log = ctx.logger(name);
    if (!config.enabled) {
        log.info('BCN channel is installed but disabled');
        return async () => { };
    }
    const { session, endpoint } = await loadOrRegisterBotSession(ctx, config);
    let bridge;
    const client = new BcnWsClient({
        endpoint,
        session,
        config,
        status: () => bridge?.busy ? 'busy' : 'idle',
        onSessionChanged: rotated => persistBotSession(ctx, config, rotated),
        log,
    });
    bridge = new BcnBridge(ctx, client, config, log);
    bridge.start();
    client.start();
    return async () => {
        try {
            await bridge?.dispose();
        }
        finally {
            await client.stop();
        }
    };
}
//# sourceMappingURL=index.js.map