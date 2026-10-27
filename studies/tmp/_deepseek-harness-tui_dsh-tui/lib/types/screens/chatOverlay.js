export const NO_OVERLAY = { kind: 'none' };
/**
 * One-step wrap-around cursor move — the single source of the wrapping rule
 * every list overlay uses (Chat.tsx's effort slider reads it too, to apply
 * the newly focused level in the same keystroke that dispatches the move).
 */
export function wrapIndex(index, delta, count) {
    return delta === -1
        ? (index <= 0 ? count - 1 : index - 1)
        : (index >= count - 1 ? 0 : index + 1);
}
export function chatOverlayReducer(state, action) {
    switch (action.type) {
        case 'open':
            return action.overlay;
        case 'close':
            return NO_OVERLAY;
        case 'image-step': {
            if (state.kind !== 'image-preview' || !state.gallery?.length)
                return state;
            const index = Math.max(0, Math.min(state.gallery.length - 1, (state.index ?? 0) + action.delta));
            if (index === state.index)
                return state;
            const entry = state.gallery[index];
            return { kind: 'image-preview', image: entry.image, title: entry.title, gallery: state.gallery, index };
        }
        case 'close-if':
            return state.kind === action.kind ? NO_OVERLAY : state;
        case 'open-if':
            return action.when.includes(state.kind) ? action.overlay : state;
        case 'move': {
            if (action.count <= 0)
                return state;
            if (state.kind === 'rewind') {
                // The confirm pane with plugin modes has its own cursor; the plain
                // confirm pane has none (Enter/Esc only — a move must not disturb
                // the list index behind it).
                if (state.confirm !== null) {
                    return state.modes !== null
                        ? { ...state, modeIndex: wrapIndex(state.modeIndex, action.delta, action.count) }
                        : state;
                }
                return { ...state, index: wrapIndex(state.index, action.delta, action.count) };
            }
            if (state.kind === 'thinking') {
                return { ...state, focus: wrapIndex(state.focus, action.delta, action.count) };
            }
            if (state.kind === 'workspace-picker'
                || state.kind === 'workspace-menu'
                || state.kind === 'workspace-flow'
                || state.kind === 'skills'
                || state.kind === 'migrate'
                || state.kind === 'activity'
                || state.kind === 'color'
                || state.kind === 'effort'
                || state.kind === 'preset'
                || state.kind === 'theme'
                || state.kind === 'permission'
                || state.kind === 'mode'
                || state.kind === 'plan'
                || state.kind === 'lang'
                || state.kind === 'panel'
                || state.kind === 'kernel'
                || state.kind === 'channel'
                || state.kind === 'file-actions') {
                return { ...state, index: wrapIndex(state.index, action.delta, action.count) };
            }
            if (state.kind === 'history') {
                return { ...state, focus: wrapIndex(state.focus, action.delta, action.count) };
            }
            return state;
        }
        case 'set-index':
            return state.kind === action.kind ? { ...state, index: action.index } : state;
        case 'history-edit':
            return state.kind === 'history'
                ? {
                    ...state,
                    ...(action.query === undefined ? {} : { query: action.query }),
                    ...(action.cursor === undefined ? {} : { cursor: action.cursor }),
                    ...(action.focus === undefined ? {} : { focus: action.focus }),
                }
                : state;
        case 'flow-busy':
            return state.kind === 'workspace-flow' ? { ...state, busy: action.busy } : state;
        case 'flow-input':
            return state.kind === 'workspace-flow' ? { ...state, input: action.input } : state;
        case 'flow-input-edit':
            return state.kind === 'workspace-flow' && state.input !== null
                ? { ...state, input: { ...state.input, value: action.value, cursor: action.cursor } }
                : state;
        case 'rewind-busy':
            return state.kind === 'rewind' ? { ...state, busy: action.busy } : state;
        case 'rewind-decision':
            return state.kind === 'rewind'
                ? { ...state, busy: false, confirm: action.confirm, modes: action.modes, modeIndex: 0 }
                : state;
        case 'rewind-back':
            return state.kind === 'rewind' ? { ...state, confirm: null, modes: null } : state;
    }
}
/**
 * Whether the `<OverlayAbove>` wrapper mounts. Mounting is all-or-nothing:
 * the renderer's removed-absolute-node blit detection only fires when the
 * removed subtree itself is `position: absolute` (dom.ts
 * collectRemovedRects), so the whole overlay must leave the tree when its
 * last panel closes — see the mount-site comment in Chat.tsx.
 *
 * The per-kind data gates mirror the per-panel render conditions verbatim:
 * a picker whose async list has not landed (or came back trivially small)
 * paints nothing, so the wrapper must not mount for it either. `tips`
 * returns true even though the panel renders in the prompt slot rather than
 * inside the overlay — preserved verbatim from the boolean-era aggregate
 * (the empty absolute wrapper is zero-size and paints nothing).
 */
export function dialogOverlayVisible(overlay, gates) {
    switch (overlay.kind) {
        case 'none':
            return false;
        // The preview paints its own absolute layer; mounting the empty
        // `<OverlayAbove>` wrapper for it would only churn the prompt area.
        case 'image-preview':
            return false;
        case 'workspace-picker':
            return gates.workspaceTargetCount > 0;
        case 'effort':
            return gates.effortOptionCount > 1;
        case 'preset':
            return gates.presetOptionCount > 0;
        case 'panel':
            return (gates.panelCount ?? 1) > 0;
        case 'permission':
            return overlay.snapshot.options.length > 0;
        case 'mode':
            return overlay.modes.length > 0;
        // The kernel roster always has at least the DSH row (the Claude row is
        // dim while its probe is in flight), so the wrapper always mounts.
        case 'kernel':
            return true;
        default:
            return true;
    }
}
