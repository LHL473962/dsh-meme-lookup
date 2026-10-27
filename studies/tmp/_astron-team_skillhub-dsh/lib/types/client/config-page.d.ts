import type { ConfigForm } from '@deepseek-ai/dsh-client-ui-settings/client';
import type { RegistryConnectionTest, SkillHubConfig } from '../host/types.js';
type ConnectionResponse = {
    ok: true;
    value: RegistryConnectionTest;
} | {
    ok: false;
    error: {
        code: string;
        details?: unknown;
    };
};
export declare function ConfigPage({ form, testConnection }: {
    form: ConfigForm<SkillHubConfig>;
    testConnection(url: string, signal: AbortSignal): Promise<ConnectionResponse>;
}): import("react/jsx-runtime").JSX.Element;
export {};
