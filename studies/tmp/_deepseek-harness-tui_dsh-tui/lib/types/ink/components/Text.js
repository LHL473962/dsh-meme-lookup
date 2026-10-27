import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
const wrapStyles = new Map();
/** A text leaf. Empty children produce no layout node. */
function Text({ children, ref, wrap = 'wrap', color, backgroundColor, bold, dim, italic, underline, strikethrough, inverse, decoration, }) {
    const textStyles = React.useMemo(() => {
        const values = { color, backgroundColor, bold, dim, italic, underline, strikethrough, inverse };
        return Object.fromEntries(Object.entries(values).filter(([, value]) => Boolean(value)));
    }, [color, backgroundColor, bold, dim, italic, underline, strikethrough, inverse]);
    // A decorated leaf cannot share the wrapStyles cache. This hook must run
    // on every render: one instance can gain or lose its decoration (a code
    // frame narrowing into its plain fallback) and the hook count must not
    // change.
    const decoratedStyle = React.useMemo(() => decoration === undefined
        ? undefined
        : { flexDirection: 'row', flexGrow: 0, flexShrink: 1, textWrap: wrap, decoration }, [wrap, decoration]);
    if (children == null)
        return null;
    if (decoratedStyle !== undefined) {
        return _jsx("ink-text", { ref: ref, style: decoratedStyle, textStyles: textStyles, children: children });
    }
    let style = wrapStyles.get(wrap);
    if (!style) {
        style = { flexDirection: 'row', flexGrow: 0, flexShrink: 1, textWrap: wrap };
        wrapStyles.set(wrap, style);
    }
    return _jsx("ink-text", { ref: ref, style: style, textStyles: textStyles, children: children });
}
export default React.memo(Text);
