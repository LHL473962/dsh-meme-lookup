import { SkillApi, type SkillEntry } from '../api.ts';
/** Edit tab props. */
export interface EditTabProps {
    /** The skill center API client. */
    api: SkillApi;
    /** The skill whose file this form rewrites. */
    skill: SkillEntry;
    /** Called after a successful save: the list refetches on the way back. */
    onDone: () => void;
    /** Called when the user leaves without saving. */
    onCancel: () => void;
}
/** The edit tab body. */
export declare function EditTab({ api, skill, onDone, onCancel }: EditTabProps): React.JSX.Element;
