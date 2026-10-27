import type { SessionLogSnapshot } from '@deepseek-ai/dsh-session-query';
import type { SelectionScope, SelectionSnapshot } from './conversation-selections.js';
/** Coordinates come only from a validated Host log, never from a Client payload. */
export declare function historicalSearchCandidate(history: SessionLogSnapshot, scope: SelectionScope, source: string, callId: string, selectionRef: string): Pick<SelectionSnapshot, 'namespace' | 'slug' | 'version'> | undefined;
