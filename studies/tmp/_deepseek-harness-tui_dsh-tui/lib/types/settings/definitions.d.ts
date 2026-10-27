/**
 * The single definition of every dsh-tui setting: label, help text (en/zh),
 * kind, options and /settings group. The /settings page, the editable-key
 * list, and the settings.json shipped in the npm package (the website's
 * settings reference) are all built from this module, so a setting is
 * described once. Side-effect free: no runtime state, safe to import from
 * build scripts. Runtime behaviour (format/parse, dynamic labels) stays with
 * the field in dsh-adapter/plugin.ts.
 *
 * Keys are sorted; add a setting at its sorted position.
 */
import type { TuiSettingsField } from '../adapter/ports/channel-settings.js';
import type { ShortcutActionId } from '../utils/keymap.js';
export type SettingDefinition = Pick<TuiSettingsField, 'label' | 'descriptions' | 'hint' | 'hintDescriptions' | 'kind' | 'group' | 'options'>;
export declare const SETTING_DEFINITIONS: {
    brand: {
        label: string;
        descriptions: {
            zh: string;
        };
        group: string;
        hint: string;
        hintDescriptions: {
            zh: string;
        };
        kind: "select";
        options: readonly {
            readonly value: import("../branding.js").BrandSetting;
            readonly label: string;
            readonly descriptions: {
                readonly zh: string;
            };
        }[];
    };
    'btw.contextBudget': {
        label: string;
        descriptions: {
            zh: string;
        };
        group: string;
        hint: string;
        hintDescriptions: {
            zh: string;
        };
        kind: "number";
    };
    'btw.contextTurns': {
        label: string;
        descriptions: {
            zh: string;
        };
        group: string;
        hint: string;
        hintDescriptions: {
            zh: string;
        };
        kind: "number";
    };
    codeFrameStyle: {
        label: string;
        descriptions: {
            zh: string;
        };
        group: string;
        hint: string;
        hintDescriptions: {
            zh: string;
        };
        kind: "select";
        options: {
            value: string;
            label: string;
            descriptions: {
                zh: string;
            };
        }[];
    };
    'companion.skin': {
        label: string;
        descriptions: {
            zh: string;
        };
        group: string;
        hint: string;
        hintDescriptions: {
            zh: string;
        };
        kind: "select";
        options: {
            value: string;
            label: string;
            descriptions: {
                zh: string;
            };
        }[];
    };
    diffLayout: {
        label: string;
        descriptions: {
            zh: string;
        };
        group: string;
        hint: string;
        hintDescriptions: {
            zh: string;
        };
        kind: "select";
        options: {
            value: string;
            label: string;
            descriptions: {
                zh: string;
            };
        }[];
    };
    effortDefault: {
        label: string;
        descriptions: {
            zh: string;
        };
        group: string;
        hint: string;
        hintDescriptions: {
            zh: string;
        };
        kind: "select";
        options: {
            value: string;
            label: string;
            descriptions: {
                zh: string;
            };
        }[];
    };
    expandEditor: {
        label: string;
        descriptions: {
            zh: string;
        };
        group: string;
        hint: string;
        hintDescriptions: {
            zh: string;
        };
        kind: "boolean";
    };
    foldTerminalCommand: {
        label: string;
        descriptions: {
            zh: string;
        };
        group: string;
        hint: string;
        hintDescriptions: {
            zh: string;
        };
        kind: "boolean";
    };
    fullscreen: {
        label: string;
        descriptions: {
            zh: string;
        };
        group: string;
        hint: string;
        hintDescriptions: {
            zh: string;
        };
        kind: "boolean";
    };
    imageBacking: {
        label: string;
        descriptions: {
            zh: string;
        };
        group: string;
        hint: string;
        hintDescriptions: {
            zh: string;
        };
        kind: "select";
        options: {
            value: string;
            label: string;
            descriptions: {
                zh: string;
            };
        }[];
    };
    jobGroupFold: {
        label: string;
        descriptions: {
            zh: string;
        };
        group: string;
        hint: string;
        hintDescriptions: {
            zh: string;
        };
        kind: "select";
        options: {
            value: string;
            label: string;
            descriptions: {
                zh: string;
            };
        }[];
    };
    lang: {
        label: string;
        descriptions: {
            zh: string;
        };
        group: string;
        hint: string;
        hintDescriptions: {
            zh: string;
        };
        kind: "select";
        options: {
            value: string;
            label: string;
            descriptions: {
                zh: string;
            };
        }[];
    };
    launchpad: {
        label: string;
        descriptions: {
            zh: string;
        };
        group: string;
        hint: string;
        hintDescriptions: {
            zh: string;
        };
        kind: "boolean";
    };
    mathImageBacking: {
        label: string;
        descriptions: {
            zh: string;
        };
        group: string;
        hint: string;
        hintDescriptions: {
            zh: string;
        };
        kind: "select";
        options: {
            value: string;
            label: string;
            descriptions: {
                zh: string;
            };
        }[];
    };
    mathImageScale: {
        label: string;
        descriptions: {
            zh: string;
        };
        group: string;
        hint: string;
        hintDescriptions: {
            zh: string;
        };
        kind: "select";
        options: {
            value: string;
            label: string;
            descriptions: {
                zh: string;
            };
        }[];
    };
    mathRendering: {
        label: string;
        descriptions: {
            zh: string;
        };
        group: string;
        hint: string;
        hintDescriptions: {
            zh: string;
        };
        kind: "select";
        options: {
            value: string;
            label: string;
            descriptions: {
                zh: string;
            };
        }[];
    };
    mermaidDiagrams: {
        label: string;
        descriptions: {
            zh: string;
        };
        group: string;
        hint: string;
        hintDescriptions: {
            zh: string;
        };
        kind: "boolean";
    };
    minimal: {
        label: string;
        descriptions: {
            zh: string;
        };
        group: string;
        hint: string;
        hintDescriptions: {
            zh: string;
        };
        kind: "boolean";
    };
    notificationMethod: {
        label: string;
        descriptions: {
            zh: string;
        };
        group: string;
        hint: string;
        hintDescriptions: {
            zh: string;
        };
        kind: "select";
        options: {
            value: string;
            label: string;
            descriptions: {
                zh: string;
            };
        }[];
    };
    pageMargin: {
        label: string;
        descriptions: {
            zh: string;
        };
        group: string;
        hint: string;
        hintDescriptions: {
            zh: string;
        };
        kind: "text";
        options: {
            value: string;
            label: string;
            descriptions: {
                zh: string;
            };
        }[];
    };
    promptSessionLabel: {
        label: string;
        descriptions: {
            zh: string;
        };
        group: string;
        hint: string;
        hintDescriptions: {
            zh: string;
        };
        kind: "boolean";
    };
    recapOnOpen: {
        label: string;
        descriptions: {
            zh: string;
        };
        group: string;
        hint: string;
        hintDescriptions: {
            zh: string;
        };
        kind: "boolean";
    };
    scrollGutter: {
        label: string;
        descriptions: {
            zh: string;
        };
        group: string;
        hint: string;
        hintDescriptions: {
            zh: string;
        };
        kind: "select";
        options: {
            value: string;
            label: string;
            descriptions: {
                zh: string;
            };
        }[];
    };
    'sidePanel.open': {
        label: string;
        descriptions: {
            zh: string;
        };
        group: string;
        hint: string;
        hintDescriptions: {
            zh: string;
        };
        kind: "boolean";
    };
    'sidePanel.panels': {
        label: string;
        descriptions: {
            zh: string;
        };
        group: string;
        hint: string;
        hintDescriptions: {
            zh: string;
        };
        kind: "text";
    };
    'sidePanel.ratio': {
        label: string;
        descriptions: {
            zh: string;
        };
        group: string;
        hint: string;
        hintDescriptions: {
            zh: string;
        };
        kind: "number";
    };
    'sidePanel.splitEnabled': {
        label: string;
        descriptions: {
            zh: string;
        };
        group: string;
        hint: string;
        hintDescriptions: {
            zh: string;
        };
        kind: "boolean";
    };
    smoothStreaming: {
        label: string;
        descriptions: {
            zh: string;
        };
        group: string;
        hint: string;
        hintDescriptions: {
            zh: string;
        };
        kind: "boolean";
    };
    splashFont: {
        label: string;
        descriptions: {
            zh: string;
        };
        group: string;
        hint: string;
        hintDescriptions: {
            zh: string;
        };
        kind: "select";
        options: readonly import("../components/splashFonts.js").SplashFontOption[];
    };
    'statusBar.activity': {
        label: string;
        descriptions: {
            zh: string;
        };
        hint: string;
        hintDescriptions: {
            zh: string;
        };
        kind: "boolean";
        group: string;
    };
    'statusBar.cache': {
        label: string;
        descriptions: {
            zh: string;
        };
        hint: string;
        hintDescriptions: {
            zh: string;
        };
        kind: "boolean";
        group: string;
    };
    'statusBar.compact': {
        label: string;
        descriptions: {
            zh: string;
        };
        hint: string;
        hintDescriptions: {
            zh: string;
        };
        kind: "boolean";
        group: string;
    };
    'statusBar.contextBar': {
        label: string;
        descriptions: {
            zh: string;
        };
        hint: string;
        hintDescriptions: {
            zh: string;
        };
        kind: "boolean";
        group: string;
    };
    'statusBar.contextUsage': {
        label: string;
        descriptions: {
            zh: string;
        };
        hint: string;
        hintDescriptions: {
            zh: string;
        };
        kind: "boolean";
        group: string;
    };
    'statusBar.cost': {
        label: string;
        descriptions: {
            zh: string;
        };
        hint: string;
        hintDescriptions: {
            zh: string;
        };
        kind: "boolean";
        group: string;
    };
    'statusBar.cwd': {
        label: string;
        descriptions: {
            zh: string;
        };
        hint: string;
        hintDescriptions: {
            zh: string;
        };
        kind: "boolean";
        group: string;
    };
    'statusBar.gitBranch': {
        label: string;
        descriptions: {
            zh: string;
        };
        hint: string;
        hintDescriptions: {
            zh: string;
        };
        kind: "boolean";
        group: string;
    };
    'statusBar.goal': {
        label: string;
        descriptions: {
            zh: string;
        };
        hint: string;
        hintDescriptions: {
            zh: string;
        };
        kind: "boolean";
        group: string;
    };
    'statusBar.mode': {
        label: string;
        descriptions: {
            zh: string;
        };
        hint: string;
        hintDescriptions: {
            zh: string;
        };
        kind: "boolean";
        group: string;
    };
    'statusBar.model': {
        label: string;
        descriptions: {
            zh: string;
        };
        hint: string;
        hintDescriptions: {
            zh: string;
        };
        kind: "boolean";
        group: string;
    };
    'statusBar.pluginFields': {
        label: string;
        descriptions: {
            zh: string;
        };
        hint: string;
        hintDescriptions: {
            zh: string;
        };
        kind: "boolean";
        group: string;
    };
    'statusBar.pluginFieldsOrder': {
        label: string;
        descriptions: {
            zh: string;
        };
        hint: string;
        hintDescriptions: {
            zh: string;
        };
        kind: "text";
        group: string;
    };
    'statusBar.sessionId': {
        label: string;
        descriptions: {
            zh: string;
        };
        hint: string;
        hintDescriptions: {
            zh: string;
        };
        kind: "boolean";
        group: string;
    };
    'statusBar.sessionTitle': {
        label: string;
        descriptions: {
            zh: string;
        };
        hint: string;
        hintDescriptions: {
            zh: string;
        };
        kind: "boolean";
        group: string;
    };
    'statusBar.shortcutHint': {
        label: string;
        descriptions: {
            zh: string;
        };
        hint: string;
        hintDescriptions: {
            zh: string;
        };
        kind: "boolean";
        group: string;
    };
    'statusBar.thinking': {
        label: string;
        descriptions: {
            zh: string;
        };
        hint: string;
        hintDescriptions: {
            zh: string;
        };
        kind: "boolean";
        group: string;
    };
    'statusBar.tokens': {
        label: string;
        descriptions: {
            zh: string;
        };
        hint: string;
        hintDescriptions: {
            zh: string;
        };
        kind: "boolean";
        group: string;
    };
    'statusBar.tps': {
        label: string;
        descriptions: {
            zh: string;
        };
        hint: string;
        hintDescriptions: {
            zh: string;
        };
        kind: "boolean";
        group: string;
    };
    'statusBar.trajectory': {
        label: string;
        descriptions: {
            zh: string;
        };
        hint: string;
        hintDescriptions: {
            zh: string;
        };
        kind: "boolean";
        group: string;
    };
    taskNotifications: {
        label: string;
        descriptions: {
            zh: string;
        };
        group: string;
        hint: string;
        hintDescriptions: {
            zh: string;
        };
        kind: "select";
        options: {
            value: string;
            label: string;
            descriptions: {
                zh: string;
            };
        }[];
    };
    terminalImages: {
        label: string;
        descriptions: {
            zh: string;
        };
        group: string;
        hint: string;
        hintDescriptions: {
            zh: string;
        };
        kind: "boolean";
    };
    thinkingFold: {
        label: string;
        descriptions: {
            zh: string;
        };
        group: string;
        hint: string;
        hintDescriptions: {
            zh: string;
        };
        kind: "select";
        options: {
            value: string;
            label: string;
            descriptions: {
                zh: string;
            };
        }[];
    };
    toolBackground: {
        label: string;
        descriptions: {
            zh: string;
        };
        group: string;
        hint: string;
        hintDescriptions: {
            zh: string;
        };
        kind: "select";
        options: {
            value: string;
            label: string;
            descriptions: {
                zh: string;
            };
        }[];
    };
    turnUsageRow: {
        label: string;
        descriptions: {
            zh: string;
        };
        group: string;
        hint: string;
        hintDescriptions: {
            zh: string;
        };
        kind: "boolean";
    };
    whale: {
        label: string;
        descriptions: {
            zh: string;
        };
        group: string;
        hint: string;
        hintDescriptions: {
            zh: string;
        };
        kind: "boolean";
    };
    whaleGirl: {
        label: string;
        descriptions: {
            zh: string;
        };
        group: string;
        hint: string;
        hintDescriptions: {
            zh: string;
        };
        kind: "boolean";
    };
    whaleIdle: {
        label: string;
        descriptions: {
            zh: string;
        };
        group: string;
        hint: string;
        hintDescriptions: {
            zh: string;
        };
        kind: "boolean";
    };
};
export type SettingKey = keyof typeof SETTING_DEFINITIONS;
/**
 * Topic groups for /settings, in root-page order. Two presentations share
 * this list: 'inline' groups render their fields directly on the root page
 * under a small header (shallow topics — hiding a handful of fields behind
 * a navigation row costs more clicks than the ordering buys), 'page' groups
 * render one navigation row and keep their fields a level down (deep,
 * cohesive domains: the formula trio, the status-bar block, the shortcut
 * remaps). Every built-in setting names one of these (verified by
 * scripts/verify-settings-definitions.ts); a field without a group would
 * render on the root under "general". */
export declare const SETTING_GROUPS: readonly [{
    readonly id: "appearance";
    readonly mode: "inline";
    readonly title: "Appearance";
    readonly descriptions: {
        readonly zh: "外观与布局";
    };
}, {
    readonly id: "splash";
    readonly mode: "inline";
    readonly title: "Splash";
    readonly descriptions: {
        readonly zh: "开屏与吉祥物";
    };
}, {
    readonly id: "conversation";
    readonly mode: "inline";
    readonly title: "Conversation";
    readonly descriptions: {
        readonly zh: "对话与输入";
    };
}, {
    readonly id: "rendering";
    readonly mode: "inline";
    readonly title: "Rendering";
    readonly descriptions: {
        readonly zh: "图表与图片";
    };
}, {
    readonly id: "math";
    readonly mode: "page";
    readonly title: "Formula";
    readonly descriptions: {
        readonly zh: "公式设置";
    };
}, {
    readonly id: "status-bar";
    readonly mode: "page";
    readonly title: "Status bar";
    readonly descriptions: {
        readonly zh: "底栏设置";
    };
}, {
    readonly id: "side-panel";
    readonly mode: "page";
    readonly title: "Side panel";
    readonly descriptions: {
        readonly zh: "侧栏";
    };
}, {
    readonly id: "shortcuts";
    readonly mode: "page";
    readonly title: "Shortcuts";
    readonly descriptions: {
        readonly zh: "快捷键";
    };
}];
/**
 * Top-level Config keys the settings service may edit at runtime: every
 * defined setting's root, plus the shortcut remaps. Keys without a Config
 * schema field (state read straight from the settings namespace) are
 * ignored by editableConfig.
 */
export declare const EDITABLE_CONFIG_KEYS: readonly string[];
/** The static part of a /settings field for `key` (path included). */
export declare function settingField(key: SettingKey): SettingDefinition & {
    path: readonly string[];
};
/**
 * Shortcut remap fields (`shortcuts.<action>`): one per SHORTCUT_ACTIONS
 * entry; the help text names the platform's default combos.
 */
export declare const SHORTCUT_FIELD_META: Record<ShortcutActionId, {
    label: string;
    zh: string;
    hintEn: (defaults: string) => string;
    hintZh: (defaults: string) => string;
}>;
//# sourceMappingURL=definitions.d.ts.map