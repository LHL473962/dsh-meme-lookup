/**
 * Loader for the optional `@anthropic-ai/claude-agent-sdk` peer.
 * The package is an optional peer dependency: a DSH-only install never has
 * it, so it is only ever reached through a dynamic `import()` whose
 * specifier is not a string literal — bundlers, `verify:package` and the bun
 * package check never try to resolve it statically, and loading dsh-tui
 * without it costs nothing until the Claude backend is selected.
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
/** Assembled at runtime on purpose (see the module comment). */
const SDK_SPECIFIER = ['@anthropic-ai', 'claude-agent-sdk'].join('/');
let loading;
/** Import the SDK once per process; a failed import is retried next time. */
export function loadClaudeSdk() {
    loading ??= import(SDK_SPECIFIER).catch((error) => {
        loading = undefined;
        throw error;
    });
    return loading;
}
/** The installed SDK version, or undefined when it cannot be read. */
export function installedSdkVersion() {
    try {
        const entry = createRequire(import.meta.url).resolve(SDK_SPECIFIER);
        const manifest = JSON.parse(readFileSync(join(dirname(entry), 'package.json'), 'utf8'));
        const version = typeof manifest === 'object' && manifest !== null ? manifest.version : undefined;
        return typeof version === 'string' ? version : undefined;
    }
    catch {
        return undefined;
    }
}
