import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Text } from '../ui.js';
import { getLang, subscribeLang, t } from '../i18n.js';
/**
 * The dim "interrupted" row shown when the user stops a turn.
 */
export function TurnInterruptedRow({ backendLabel } = {}) {
    React.useSyncExternalStore(subscribeLang, getLang);
    const askNext = backendLabel ? t('interrupted-ask-backend', { name: backendLabel }) : t('interrupted-ask-next');
    return (_jsxs(_Fragment, { children: [_jsx(Text, { dimColor: true, children: t('interrupted-by-user') }), _jsx(Text, { dimColor: true, children: askNext })] }));
}
