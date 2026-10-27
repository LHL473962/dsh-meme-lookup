import type { ModelNavigationGuard } from './ModelView.tsx';
import type { OperationsViewProps } from './OperationsView.tsx';
/** Deterministic chapter diagnostics and author-owned serial-writing assets. */
export declare function SerialWritingView({ fetchStudioApi, postStudioApi, t, onNavigationGuardChange }: Pick<OperationsViewProps, 'fetchStudioApi' | 'postStudioApi' | 't'> & {
    onNavigationGuardChange?: (guard: ModelNavigationGuard | null) => void;
}): import("react").JSX.Element;
