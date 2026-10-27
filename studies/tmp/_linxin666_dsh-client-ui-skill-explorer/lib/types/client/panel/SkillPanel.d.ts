import { SkillApi } from '../api.ts';
import type { PanelController } from './controller.ts';
/** Panel shell props. */
export interface SkillPanelProps {
    /** The panel state owner (open/close/toggle, active tab, editor target). */
    controller: PanelController;
    /** The skill center API client every tab operates through. */
    api: SkillApi;
}
/** The skill center panel. */
export declare function SkillPanel({ controller, api }: SkillPanelProps): import("react").JSX.Element;
