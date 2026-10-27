import Schema from '@deepseek-ai/schemastery';
import type { SkillHubConfig } from './types.js';
export declare const Config: Schema<{
    registryUrl?: string | null;
    detailTabs?: Partial<SkillHubConfig['detailTabs']> | null;
}, SkillHubConfig, 'volatile-defined'>;
