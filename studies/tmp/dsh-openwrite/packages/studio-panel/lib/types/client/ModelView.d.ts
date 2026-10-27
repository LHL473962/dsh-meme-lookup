import type { ConvViewProps } from "@deepseek-ai/dsh-client-ui-conversation/client";
import type { InjectFace, PropsLocale } from "@deepseek-ai/dsh-client-ui-slots";
import { type StudioApiInjected } from "./api.ts";
export type ModelNavigationGuard = (navigate: () => void) => void;
type Props = ConvViewProps & InjectFace<StudioApiInjected> & PropsLocale<"studio-panel"> & {
    onNavigationGuardChange?: (guard: ModelNavigationGuard | null) => void;
};
export declare function ModelView({ fetchStudioApi, postStudioApi, t, onNavigationGuardChange }: Props): import("react").JSX.Element;
export {};
