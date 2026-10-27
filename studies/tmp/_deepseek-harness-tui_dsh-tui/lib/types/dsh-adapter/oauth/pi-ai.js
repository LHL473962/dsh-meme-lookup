/**
 * The pi-ai instance owned by the installed dsh-llm-pi-ai adapter.
 *
 * Different host prereleases can depend on different pi-ai versions. Loading
 * a second catalog in this module and handing its Provider objects to the
 * adapter crosses package instances and is neither type- nor runtime-safe.
 * Resolve the adapter's own dependency instead, and derive every public type
 * from the adapter contract so this package owns no pi-ai version.
 */
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
/** Keep the optional second argument compatible with older adapter typings. */
export function loginOAuth(oauth, interaction, options) {
    const compatible = oauth;
    return compatible.login(interaction, options);
}
/** Locate the first pi-ai catalog Node would resolve from dsh-llm-pi-ai. */
function adapterCatalogUrl() {
    const adapterManifest = import.meta.resolve('@deepseek-ai/dsh-llm-pi-ai/package.json');
    const require = createRequire(adapterManifest);
    for (const root of require.resolve.paths('@earendil-works/pi-ai') ?? []) {
        const catalog = join(root, '@earendil-works', 'pi-ai', 'dist', 'providers', 'all.js');
        if (existsSync(catalog))
            return pathToFileURL(catalog).href;
    }
    throw new Error('dsh-auth: dsh-llm-pi-ai has no resolvable pi-ai provider catalog');
}
const catalog = await import(adapterCatalogUrl());
/** Fresh Provider objects from the exact pi-ai module used by dsh-llm-pi-ai. */
export const adapterBuiltinProviders = catalog.builtinProviders;
