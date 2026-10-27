/** Declare only UI preferences as live fields, never the agent/session route. */
export function editableConfig(schema, keys) {
    for (const key of keys) {
        const field = schema.dict?.[String(key)];
        if (field !== undefined && typeof field.volatile === 'function')
            schema.dict[String(key)] = field.volatile();
    }
    return schema;
}
/** Settings forms use the Config owner's Loader ID, not the plugin name. */
export function resolveSettingsNamespace(ctx, schema) {
    const settings = ctx.get('settings');
    if (!settings || typeof settings.register === 'function')
        return 'dsh-tui';
    if (!Object.values(schema.dict ?? {}).some(field => field.meta.volatile === true)) {
        throw new Error('dsh-tui: profile-backed settings require @deepseek-ai/schemastery >= 3.18.3 with volatile Config support. Update DSH and reinstall the current profile dependencies before starting the TUI.');
    }
    const owner = ctx.fiber;
    const ns = owner.entry?.options.id;
    if (!ns)
        throw new Error('dsh-tui: profile-backed settings require a Loader entry for the Config owner.');
    return ns;
}
/** Snapshot at an operation boundary; retain the host refs for later updates. */
export function configValues(config) {
    return Object.fromEntries(Object.entries(config).map(([key, value]) => [
        key,
        value !== null && typeof value === 'object' && 'get' in value && typeof value.get === 'function'
            ? value.get()
            : value,
    ]));
}
/**
 * 0.1.7 owns settings in Config; older hosts still own registered scopes.
 * Pass the Config owner's context, and dispose watch with the consumer's lifecycle.
 */
export function createSettingsScope(ctx, service, ns, schema, current) {
    const settings = service;
    if (typeof settings.register === 'function') {
        const scope = settings.register(ns, schema);
        return { legacy: true, get: () => scope.get(), watch: callback => scope.watch(callback) };
    }
    return {
        legacy: false,
        get: current,
        watch(callback) {
            // The event is absent from the old framework's type map. Cordis owns
            // listener disposal and emits it only to the updated plugin fiber.
            const events = ctx;
            return events.on('loader/volatile-update', () => callback(current()));
        },
    };
}
/** New settings forms expose values through describe(), not get(). */
export function settingsValue(settings, ns) {
    return typeof settings.get === 'function' ? settings.get(ns) : settings.describe().find(row => row.ns === ns)?.value;
}
