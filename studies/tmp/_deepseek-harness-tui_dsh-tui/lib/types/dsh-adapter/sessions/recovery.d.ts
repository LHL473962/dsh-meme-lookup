import { type DerivedEntry } from './store.js';
interface RecoveryWork {
    readonly id: string;
    readonly revision: string;
    readonly path: string;
    readonly bytes: number;
    readonly stamp: string;
    readonly priority: number;
    readonly listeners: Set<(derived: DerivedEntry) => void>;
}
/** Deduplicate recovery per session/revision and retry damaged logs with backoff. */
export declare function scheduleMetadataRecovery(work: Omit<RecoveryWork, 'listeners'>, onComplete?: (derived: DerivedEntry) => void): void;
/** A queued or backed-off revision needs no path lookup on another open. */
export declare function metadataRecoveryNeedsWork(id: string, revision: string, onComplete?: (derived: DerivedEntry) => void): boolean;
export {};
//# sourceMappingURL=recovery.d.ts.map