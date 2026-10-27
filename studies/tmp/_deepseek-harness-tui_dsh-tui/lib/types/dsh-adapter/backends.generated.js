import { manifest as claudeManifest } from '../backends/claude/manifest.js';
import { manifest as codexManifest } from '../backends/codex/manifest.js';
export const GENERATED_BACKENDS = [
    { manifest: claudeManifest, load: () => import('../backends/claude/index.js') },
    { manifest: codexManifest, load: () => import('../backends/codex/index.js') },
];
