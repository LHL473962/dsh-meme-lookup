import React from 'react';
import type { ProviderModelEditor as ModelEditor } from '../../adapter/ports/channel-settings.js';
import { type ClipboardRead } from '../../utils/clipboard.js';
/** Draft-only capability form nested in /provider's model-selection question. */
export declare function ProviderModelEditor({ model, editor, onClose, onAbort, readClipboardOverride }: {
    readonly model: string;
    readonly editor: ModelEditor;
    readonly onClose: () => void;
    readonly onAbort: () => void;
    readonly readClipboardOverride?: () => Promise<ClipboardRead>;
}): React.ReactNode;
//# sourceMappingURL=ProviderModelEditor.d.ts.map