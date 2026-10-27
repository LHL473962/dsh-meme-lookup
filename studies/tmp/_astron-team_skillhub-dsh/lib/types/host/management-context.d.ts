import type { AssembleContext, PromptAssembly } from '@deepseek-ai/dsh-system-prompt';
import type { InstalledSkillList } from './types.js';
type ReadInstallations = (sessionId: string, cwd: string, signal: AbortSignal) => Promise<InstalledSkillList | null>;
type Listener = (assembly: PromptAssembly, context: AssembleContext, next: () => Promise<PromptAssembly>) => Promise<PromptAssembly>;
type ContextEvents = {
    on(name: 'system-prompt/assemble', listener: Listener): () => void;
};
/** Public facts only; routing keys and local paths never become prompt context. */
export declare function installationContext(list: InstalledSkillList): string;
/** Official async assembly contribution; the Host logs it as runtime-context, not forged chat/tool history. */
export declare function registerManagementContext(events: ContextEvents, read: ReadInstallations): () => void;
export {};
