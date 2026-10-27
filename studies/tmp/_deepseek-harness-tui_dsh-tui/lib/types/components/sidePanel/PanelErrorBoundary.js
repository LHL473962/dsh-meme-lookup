import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * PanelErrorBoundary（照 PluginStatusViewBoundary 的约定）：出错只隐藏
 * 该 Panel、记 reportError，同 key 重注册用 registrationId 重挂。插件
 * Panel 崩溃时，Chat 的输入、流式、工具卡必须完全不受影响——硬要求。
 */
import React from 'react';
import { Box, Text } from '../../ui.js';
import { t } from '../../i18n.js';
import { logError } from '../../utils/log.js';
import { panelStore } from './PanelStore.js';
export class PanelErrorBoundary extends React.Component {
    state = { error: null };
    static getDerivedStateFromError(error) {
        return { error };
    }
    componentDidCatch(error) {
        // 卡片上只显示截断的 message，卸载即失忆——落盘一份带边界的完整
        // 错误（含堆栈），否则"面板渲染出错"永远无法事后归因。
        logError(new Error(`side panel "${this.props.panelId}" render error: ${error.message}`, { cause: error }));
        panelStore.reportError(this.props.panelId, error);
    }
    render() {
        const { error } = this.state;
        if (error !== null) {
            return (_jsxs(Box, { flexDirection: "column", flexGrow: 1, alignItems: "center", justifyContent: "center", paddingX: 1, children: [_jsx(Text, { color: "error", children: t('panel-error-title') }), _jsx(Box, { height: 1 }), _jsx(Text, { dimColor: true, wrap: "truncate-end", children: error.message }), _jsx(Box, { height: 1 }), _jsx(Text, { dimColor: true, children: t('panel-error-hint') })] }));
        }
        return this.props.children;
    }
}
