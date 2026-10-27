import type { TypertRemoteNamespaceMap } from '@deepseek-ai/dsh-typert-protocol';
import type { SkillDetail, SkillHubConfig } from '../host/types.js';
import type { ReactNode } from 'react';
import '../../lib/typert.remote-client.js';
type Remote = TypertRemoteNamespaceMap['skillhub'];
export declare function DetailTabs({ detail, modes, remote, children, onSelectVersion, versionActionLabel, cacheIdentity, onContextStale }: {
    detail: SkillDetail;
    modes: SkillHubConfig['detailTabs'];
    remote: Remote;
    children: ReactNode;
    onSelectVersion?(version: string): void;
    versionActionLabel?: string;
    cacheIdentity?: string;
    onContextStale?(): void;
}): import("react/jsx-runtime").JSX.Element;
export {};
