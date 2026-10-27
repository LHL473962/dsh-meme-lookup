import React from 'react';
import { type Lang } from '../i18n.js';
/**
 * `/lang` en/zh picker: bare `/lang` opens this picker (the current language
 * marked) and Enter applies the choice through the same path as `/lang <id>`.
 */
export declare function LangPicker({ focusIndex, currentLang, onPick, }: {
    focusIndex: number;
    currentLang: Lang;
    /** Mouse pick (fullscreen): clicked row's absolute index (Chat applies
     *  the same code path as the keyboard Enter). */
    onPick?: (index: number) => void;
}): React.ReactNode;
//# sourceMappingURL=LangPicker.d.ts.map