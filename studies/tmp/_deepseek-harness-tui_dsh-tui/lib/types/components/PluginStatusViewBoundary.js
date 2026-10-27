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
export class PluginStatusViewBoundary extends React.Component {
    state = { crashed: false };
    static getDerivedStateFromError() {
        return { crashed: true };
    }
    componentDidCatch(error) {
        this.props.onError(this.props.viewKey, error);
    }
    render() {
        return this.state.crashed ? null : this.props.children;
    }
}
