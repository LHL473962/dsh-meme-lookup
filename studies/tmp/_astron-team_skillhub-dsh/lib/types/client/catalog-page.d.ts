import { type UiAvailability } from './ui-availability.js';
import { QueryClient } from '@tanstack/react-query';
import type { TypertRemoteNamespaceMap } from '@deepseek-ai/dsh-typert-protocol';
import { type InstalledNavigation } from './installed-navigation.js';
import type { InstalledServices } from './installed-skills.js';
import type { InstallationServices } from './install-control.js';
import type { SkillList } from '../host/types.js';
import '../../lib/typert.remote-client.js';
type Item = SkillList['items'][number];
type Remote = TypertRemoteNamespaceMap['skillhub'];
type Sort = 'newest' | 'downloads' | 'rating';
export interface CatalogNavigation {
    installedNavigation?: InstalledNavigation;
    installedOrigin?: {
        sessionId: string;
        sourceRevision: string;
    };
    tab: 'browse' | 'installed';
    query: string;
    draft: string;
    sort?: Sort;
    labelSelection?: {
        sourceRevision: string;
        slug: string;
    };
    selected: Item | null;
    sourceRevision: string | null;
    scrollTop: number;
}
export declare const createCatalogNavigation: () => CatalogNavigation;
export declare function CatalogPage({ remote, navigation, client, onReturn, installation, installed, availability }: {
    remote: Remote;
    navigation: CatalogNavigation;
    client: QueryClient;
    onReturn: () => void;
    installation?: InstallationServices;
    installed?: InstalledServices;
    availability: UiAvailability;
}): import("react/jsx-runtime").JSX.Element;
export {};
