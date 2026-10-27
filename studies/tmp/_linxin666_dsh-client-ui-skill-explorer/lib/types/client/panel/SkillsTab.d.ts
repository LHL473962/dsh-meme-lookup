import { SkillApi, type SkillEntry } from '../api.ts';
import type { SkillDraft } from './controller.ts';
/** The skills tab body. */
export declare function SkillsTab({ api, onEdit, onImport, onDuplicate }: {
    api: SkillApi;
    onEdit: (skill: SkillEntry) => void;
    onImport: () => void;
    onDuplicate: (draft: SkillDraft) => void;
}): React.JSX.Element;
