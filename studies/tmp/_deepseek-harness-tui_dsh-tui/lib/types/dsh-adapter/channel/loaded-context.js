import { assembleContextFor } from '@deepseek-ai/dsh-agent';
import { loadBaselineInstructions } from '@deepseek-ai/dsh-agent-instructions';
import { isModelInvocable } from '@deepseek-ai/dsh-skill';
import { renderContextSections, renderPrompt } from '@deepseek-ai/dsh-system-prompt';
/** Assembles the loaded-context panel. A result belongs only to its origin Agent. */
export function createLoadedContextRefresher(ctx, deps) {
    const refresh = async () => {
        if (!deps.owner.current())
            return;
        const target = deps.agent();
        const sections = [];
        const contexts = [];
        const files = [];
        const skills = [];
        const tools = [];
        try {
            const systemPrompt = ctx.get('systemPrompt');
            if (systemPrompt !== undefined) {
                const assembly = await systemPrompt.assemble(assembleContextFor(target));
                if (!deps.owner.current() || target !== deps.agent())
                    return;
                for (const section of assembly.sections) {
                    const text = renderPrompt({ sections: [section], contexts: [], tools: [], variables: assembly.variables });
                    if (text.length > 0)
                        sections.push({ name: section.name, text });
                }
                contexts.push(...renderContextSections(assembly));
                for (const tool of assembly.tools)
                    tools.push({ name: tool.name, description: tool.description ?? '' });
            }
            const renderedInstructions = await loadBaselineInstructions({
                cwd: deps.cwd(), maxBytes: 1024 * 1024, maxSourceBytes: 1024 * 1024,
            }, ctx.get('fs'));
            if (!deps.owner.current() || target !== deps.agent())
                return;
            const sources = renderedInstructions;
            const paths = new Set([
                ...(sources?.represented ?? []).map(file => file.displayPath),
                ...(renderedInstructions?.omitted ?? []).map(file => file.displayPath),
                ...(renderedInstructions?.truncated ?? []).map(file => file.displayPath),
            ]);
            files.push(...[...paths].map(displayPath => ({ displayPath })));
            const registry = tools.some(tool => tool.name === 'skill') ? deps.skillRegistryFor(target) : undefined;
            if (registry !== undefined) {
                const observation = await registry.snapshot(deps.skillViewOptions(target));
                if (!deps.owner.current() || target !== deps.agent())
                    return;
                if (observation.complete) {
                    skills.push(...observation.skills.filter(isModelInvocable).map(skill => ({ name: skill.name, description: skill.description })));
                }
            }
        }
        catch (error) {
            ctx.logger.warn('loaded-context snapshot failed: %o', error);
            return;
        }
        if (!deps.owner.current() || target !== deps.agent())
            return;
        deps.publish({ sections, contexts, files, skills, tools });
    };
    return { refresh };
}
