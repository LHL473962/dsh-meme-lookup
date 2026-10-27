import type { PresetSetupState } from './setup-store.ts';
/** Props for the framework-independent setup state body. */
export interface PresetSetupBodyProps {
    readonly state: PresetSetupState;
    readonly install: () => void;
    readonly retry: () => void;
}
/**
 * Render the setup result and its explicit action without owning dialog chrome.
 *
 * @param props Current state and user-triggered actions.
 * @returns Accessible status content for the setup dialog.
 */
export declare function PresetSetupBody({ state, install, retry }: PresetSetupBodyProps): import("react").JSX.Element;
