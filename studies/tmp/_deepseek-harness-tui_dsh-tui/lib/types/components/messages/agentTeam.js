/** Resolve a compose target from the roster's labels (the descriptions):
 *  a unique label addresses by name, duplicates carry `ambiguous` (the
 *  composer shows the stable id), no label at all stays nameless. */
export function agentComposeTargetOf(agentId, labels) {
    const name = labels.get(agentId);
    if (name === undefined || name === '')
        return { agentId };
    let duplicates = 0;
    for (const other of labels.values())
        if (other === name)
            duplicates += 1;
    return duplicates > 1 ? { agentId, name, ambiguous: true } : { agentId, name };
}
/** The parent fact of one roster row from the roster's own fields. */
export function agentParentFactOf(agent) {
    if (agent.parentAgentId !== undefined)
        return { kind: 'agent', agentId: agent.parentAgentId };
    if (agent.depth === 1)
        return { kind: 'main' };
    return { kind: 'unknown' };
}
/** The parent fact of the VIEWED agent, letting the loaded transcript's
 *  explicit parent override the roster's (the disk copy is the durable
 *  truth; a still-loading or absent transcript keeps the roster fact).
 *  transcriptParent follows SubagentTranscriptPage.parentAgentId: null =
 *  depth-1-or-old-format, so it only proves 'main' together with depth 1. */
export function viewedAgentParentFact(agent, transcriptParent) {
    if (transcriptParent !== undefined && transcriptParent !== null)
        return { kind: 'agent', agentId: transcriptParent };
    if (transcriptParent === null && agent.depth === 1)
        return { kind: 'main' };
    return agentParentFactOf(agent);
}
/** The switchable neighbourhood of the viewed agent: its parent and its
 *  siblings, i.e. roster agents with the same known parent. The same depth
 *  alone never makes siblings; an unknown parent yields none. */
export function agentNeighbourhood(self, roster, transcriptParent) {
    const parent = viewedAgentParentFact(self, transcriptParent);
    const parentOf = (other) => agentParentFactOf(other);
    const sameParent = (other) => {
        if (parent.kind === 'main')
            return parentOf(other).kind === 'main';
        if (parent.kind === 'agent') {
            const otherParent = parentOf(other);
            return otherParent.kind === 'agent' && otherParent.agentId === parent.agentId;
        }
        return false;
    };
    const siblings = parent.kind === 'unknown'
        ? []
        : roster.filter(other => other.agentId !== self.agentId && sameParent(other));
    return { parent, siblings };
}
