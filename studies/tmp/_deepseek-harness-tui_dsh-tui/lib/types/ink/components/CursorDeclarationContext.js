import { createContext } from 'react';
/**
 * React context that provides the cursor-declaration setter to descendants.
 */
const CursorDeclarationContext = createContext(() => { });
export default CursorDeclarationContext;
/** Whether the mounted renderer can display a native terminal caret. */
export const NativeCursorContext = createContext(false);
