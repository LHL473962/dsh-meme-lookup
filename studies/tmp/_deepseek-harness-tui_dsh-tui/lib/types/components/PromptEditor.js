import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { Box, Text, useTerminalSize } from '../ui.js';
import { usePageInset } from './PageMargin.js';
let editorNode = null;
const listeners = new Set();
/** Publish (or withdraw, with null) the fullscreen editor subtree. */
export function setPromptEditorNode(node) {
    if (node === editorNode)
        return;
    editorNode = node;
    for (const listener of listeners)
        listener();
}
function subscribe(callback) {
    listeners.add(callback);
    return () => {
        listeners.delete(callback);
    };
}
function snapshot() {
    return editorNode;
}
function openSnapshot() {
    return editorNode !== null;
}
/** Whether the fullscreen draft editor is currently published (open). */
export function usePromptEditorOpen() {
    return React.useSyncExternalStore(subscribe, openSnapshot);
}
/**
 * The fullscreen sink, mounted once at the very end of Chat's root Box.
 * The absolute cover is `opaque` so its padding/blank cells never bleed
 * the covered transcript through, and it swallows stray clicks so the
 * conversation underneath cannot react to a click meant for the editor.
 */
export function PromptEditorLayer() {
    const node = React.useSyncExternalStore(subscribe, snapshot);
    // Full-bleed cover: under PageMargin the Chat root box starts at the
    // content origin, so the editor must extend into the page margins up to
    // the terminal edges — the editor is a whole-screen surface, and the
    // margin strips must be covered rather than letting the transcript
    // bleed through.
    const inset = usePageInset();
    const size = useTerminalSize();
    if (node === null)
        return null;
    return (_jsx(Box, { position: "absolute", top: -inset.y, left: -inset.x, width: size.columns + 2 * inset.x, height: size.rows + 2 * inset.y, flexDirection: "column", flexShrink: 0, overflow: "hidden", backgroundColor: "inputBackground", opaque: true, onClick: (event) => {
            event.stopImmediatePropagation();
        }, children: node }));
}
/**
 * A mouse-friendly pill button for the editor chrome (send / collapse /
 * the ⤢ close affordance). Hover swaps the surface so the affordance
 * reads at a glance — the same interaction language as the transcript's
 * clickable rows and the session browser's menu items.
 */
export function EditorButton({ label, hint, onClick, primary, accent, }) {
    const [hovered, setHovered] = React.useState(false);
    const text = hint === undefined ? ` ${label} ` : ` ${label} ${hint} `;
    return (_jsx(Box, { flexShrink: 0, backgroundColor: primary
            ? hovered
                ? 'userMessageBackgroundHover'
                : (accent ?? 'accent')
            : hovered
                ? 'userMessageBackgroundHover'
                : undefined, onClick: (event) => {
            event.stopImmediatePropagation();
            onClick();
        }, onMouseEnter: () => {
            setHovered(true);
        }, onMouseLeave: () => {
            setHovered(false);
        }, children: _jsx(Text, { bold: primary || hovered, color: primary && !hovered ? 'inverseText' : undefined, dimColor: !primary && !hovered, children: text }) }));
}
