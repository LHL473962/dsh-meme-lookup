import type { TuiThemeHost, TuiThemeRegistration } from '../dsh-adapter/themes.js';
/**
 * Subscribe to the optional runtime theme host and expose its registration
 * snapshot to React. Shared by ThemeProvider and ThemePicker so both observe
 * the same registrations with the same fallbacks: an absent host, a throwing
 * `subscribe`/`getSnapshot` (structural hosts, teardown races) degrade to an
 * empty snapshot instead of breaking the render path.
 */
export declare function useRuntimeThemeSnapshot(themeHost?: TuiThemeHost): readonly TuiThemeRegistration[];
//# sourceMappingURL=useRuntimeThemeSnapshot.d.ts.map