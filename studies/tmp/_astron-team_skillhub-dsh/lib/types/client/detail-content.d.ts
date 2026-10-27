import type { TypertRemoteNamespaceMap } from '@deepseek-ai/dsh-typert-protocol';
import type { SkillDetail, SkillHubConfig } from '../host/types.js';
import '../../lib/typert.remote-client.js';
export declare function DetailContent({ detail, modes, remote, retry, onSelectVersion, versionActionLabel, cacheIdentity, onContextStale }: {
    detail: SkillDetail;
    modes: SkillHubConfig['detailTabs'];
    remote: TypertRemoteNamespaceMap['skillhub'];
    retry: () => void;
    onSelectVersion?(version: string): void;
    versionActionLabel?: string;
    cacheIdentity?: string;
    onContextStale?(): void;
}): import("react/jsx-runtime").JSX.Element;
