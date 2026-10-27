import type { MouseEventHandler, ReactNode } from 'react';
export declare function Icon({ name }: {
    name: 'download' | 'bookmark' | 'star' | 'arrow' | 'search' | 'grid' | 'info' | 'close';
}): import("react/jsx-runtime").JSX.Element;
export declare function SkillAvatar({ name, slug, namespace, avatarUrl }: {
    name?: string;
    slug: string;
    namespace: string;
    avatarUrl?: string;
}): import("react/jsx-runtime").JSX.Element;
export interface SkillPresentation {
    namespace: string;
    slug: string;
    displayName?: string;
    summary?: string;
    downloadCount?: number;
    starCount?: number;
    ratingAvg?: number;
    ratingCount?: number;
}
export declare function SkillMetrics({ item }: {
    item: SkillPresentation;
}): import("react/jsx-runtime").JSX.Element;
export declare const SkillCard: import("react").ForwardRefExoticComponent<{
    item: SkillPresentation;
    version: string;
    onOpen: MouseEventHandler<HTMLButtonElement>;
    status?: ReactNode;
    actions?: ReactNode;
    accessibleLabel?: string;
    descriptionId?: string;
} & import("react").RefAttributes<HTMLButtonElement>>;
