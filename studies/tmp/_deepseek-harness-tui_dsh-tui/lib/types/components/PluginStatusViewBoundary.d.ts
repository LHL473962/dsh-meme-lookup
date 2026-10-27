/**
 * Error boundary for rich `tuiStatus` views. These components are trusted
 * in-process plugin code, but one broken render must collapse only its own
 * compact view instead of reaching Ink's app-level boundary and taking down
 * the conversation.
 *
 * As with plugin scenes, async callback/effect failures remain the plugin's
 * responsibility; React boundaries cover render and lifecycle failures.
 */
import React from 'react';
type PluginStatusViewBoundaryProps = {
    readonly viewKey: string;
    readonly onError: (key: string, error: Error) => void;
    readonly children: React.ReactNode;
};
type PluginStatusViewBoundaryState = {
    readonly crashed: boolean;
};
export declare class PluginStatusViewBoundary extends React.Component<PluginStatusViewBoundaryProps, PluginStatusViewBoundaryState> {
    state: PluginStatusViewBoundaryState;
    static getDerivedStateFromError(): PluginStatusViewBoundaryState;
    componentDidCatch(error: Error): void;
    render(): React.ReactNode;
}
export {};
//# sourceMappingURL=PluginStatusViewBoundary.d.ts.map