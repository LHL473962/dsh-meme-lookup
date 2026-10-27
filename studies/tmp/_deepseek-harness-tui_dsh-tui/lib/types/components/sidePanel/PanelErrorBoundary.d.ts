/**
 * PanelErrorBoundary（照 PluginStatusViewBoundary 的约定）：出错只隐藏
 * 该 Panel、记 reportError，同 key 重注册用 registrationId 重挂。插件
 * Panel 崩溃时，Chat 的输入、流式、工具卡必须完全不受影响——硬要求。
 */
import React from 'react';
interface BoundaryProps {
    readonly panelId: string;
    readonly children: React.ReactNode;
}
interface BoundaryState {
    readonly error: Error | null;
}
export declare class PanelErrorBoundary extends React.Component<BoundaryProps, BoundaryState> {
    state: BoundaryState;
    static getDerivedStateFromError(error: Error): BoundaryState;
    componentDidCatch(error: Error): void;
    render(): React.ReactNode;
}
export {};
//# sourceMappingURL=PanelErrorBoundary.d.ts.map