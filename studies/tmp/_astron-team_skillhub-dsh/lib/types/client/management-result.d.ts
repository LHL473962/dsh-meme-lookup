import { z } from 'zod';
declare const management: z.ZodObject<{
    kind: z.ZodLiteral<"skillhub-management">;
    item: z.ZodObject<{
        itemKey: z.ZodString;
        namespace: z.ZodString;
        slug: z.ZodString;
        version: z.ZodString;
        scope: z.ZodEnum<{
            user: "user";
            project: "project";
        }>;
        state: z.ZodEnum<{
            present: "present";
            missing: "missing";
            "metadata-invalid": "metadata-invalid";
            mismatch: "mismatch";
            unreadable: "unreadable";
        }>;
    }, z.core.$strip>;
    action: z.ZodEnum<{
        uninstall: "uninstall";
        upgrade: "upgrade";
    }>;
    status: z.ZodEnum<{
        blocked: "blocked";
        "awaiting-confirmation": "awaiting-confirmation";
        cancelled: "cancelled";
        accepted: "accepted";
    }>;
    candidateVersion: z.ZodNullable<z.ZodString>;
    reason: z.ZodString;
    confirmationRef: z.ZodNullable<z.ZodString>;
    operation: z.ZodNullable<z.ZodObject<{
        operationId: z.ZodUUID;
        context: z.ZodObject<{
            hostInstanceId: z.ZodUUID;
        }, z.core.$strip>;
    }, z.core.$strip>>;
    schemaVersion: z.ZodLiteral<1>;
    toolCallId: z.ZodString;
    sourceRevision: z.ZodString;
    sourceLabel: z.ZodString;
}, z.core.$strip>;
export declare const availabilitySchema: z.ZodObject<{
    installation: z.ZodOptional<z.ZodObject<{
        namespace: z.ZodString;
        slug: z.ZodString;
        version: z.ZodString;
        scope: z.ZodEnum<{
            user: "user";
            project: "project";
        }>;
    }, z.core.$strip>>;
    scope: z.ZodOptional<z.ZodEnum<{
        user: "user";
        project: "project";
    }>>;
    checkedAt: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    association: z.ZodEnum<{
        "managed-reference": "managed-reference";
        "not-associated": "not-associated";
    }>;
    integrity: z.ZodEnum<{
        unknown: "unknown";
        missing: "missing";
        verified: "verified";
        changed: "changed";
    }>;
    discovery: z.ZodEnum<{
        unknown: "unknown";
        winner: "winner";
        shadowed: "shadowed";
        "not-discovered": "not-discovered";
    }>;
    invocation: z.ZodOptional<z.ZodObject<{
        userInvocable: z.ZodBoolean;
        modelInvocable: z.ZodBoolean;
    }, z.core.$strip>>;
    reason: z.ZodEnum<{
        "host-unavailable": "host-unavailable";
        "not-discovered": "not-discovered";
        observed: "observed";
        "files-missing": "files-missing";
        "files-unreadable": "files-unreadable";
        "local-changes": "local-changes";
        "baseline-unverified": "baseline-unverified";
        "definition-unverified": "definition-unverified";
        "snapshot-unavailable": "snapshot-unavailable";
        "snapshot-incomplete": "snapshot-incomplete";
        "observation-changed": "observation-changed";
        "same-name-winner": "same-name-winner";
        "definition-changed": "definition-changed";
        "read-failed": "read-failed";
    }>;
}, z.core.$strip>;
declare const schema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    kind: z.ZodLiteral<"skillhub-installed">;
    items: z.ZodArray<z.ZodObject<{
        itemKey: z.ZodString;
        namespace: z.ZodString;
        slug: z.ZodString;
        version: z.ZodString;
        scope: z.ZodEnum<{
            user: "user";
            project: "project";
        }>;
        state: z.ZodEnum<{
            present: "present";
            missing: "missing";
            "metadata-invalid": "metadata-invalid";
            mismatch: "mismatch";
            unreadable: "unreadable";
        }>;
    }, z.core.$strip>>;
    complete: z.ZodBoolean;
    issues: z.ZodArray<z.ZodString>;
    unavailable: z.ZodArray<z.ZodEnum<{
        user: "user";
        project: "project";
    }>>;
    schemaVersion: z.ZodLiteral<1>;
    toolCallId: z.ZodString;
    sourceRevision: z.ZodString;
    sourceLabel: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    kind: z.ZodLiteral<"skillhub-update-check">;
    item: z.ZodObject<{
        itemKey: z.ZodString;
        namespace: z.ZodString;
        slug: z.ZodString;
        version: z.ZodString;
        scope: z.ZodEnum<{
            user: "user";
            project: "project";
        }>;
        state: z.ZodEnum<{
            present: "present";
            missing: "missing";
            "metadata-invalid": "metadata-invalid";
            mismatch: "mismatch";
            unreadable: "unreadable";
        }>;
    }, z.core.$strip>;
    check: z.ZodObject<{
        state: z.ZodEnum<{
            blocked: "blocked";
            upgradable: "upgradable";
            current: "current";
            unavailable: "unavailable";
        }>;
        currentVersion: z.ZodString;
        candidateVersion: z.ZodNullable<z.ZodString>;
        reason: z.ZodString;
        checkedAt: z.ZodString;
    }, z.core.$strip>;
    schemaVersion: z.ZodLiteral<1>;
    toolCallId: z.ZodString;
    sourceRevision: z.ZodString;
    sourceLabel: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    kind: z.ZodLiteral<"skillhub-management">;
    item: z.ZodObject<{
        itemKey: z.ZodString;
        namespace: z.ZodString;
        slug: z.ZodString;
        version: z.ZodString;
        scope: z.ZodEnum<{
            user: "user";
            project: "project";
        }>;
        state: z.ZodEnum<{
            present: "present";
            missing: "missing";
            "metadata-invalid": "metadata-invalid";
            mismatch: "mismatch";
            unreadable: "unreadable";
        }>;
    }, z.core.$strip>;
    action: z.ZodEnum<{
        uninstall: "uninstall";
        upgrade: "upgrade";
    }>;
    status: z.ZodEnum<{
        blocked: "blocked";
        "awaiting-confirmation": "awaiting-confirmation";
        cancelled: "cancelled";
        accepted: "accepted";
    }>;
    candidateVersion: z.ZodNullable<z.ZodString>;
    reason: z.ZodString;
    confirmationRef: z.ZodNullable<z.ZodString>;
    operation: z.ZodNullable<z.ZodObject<{
        operationId: z.ZodUUID;
        context: z.ZodObject<{
            hostInstanceId: z.ZodUUID;
        }, z.core.$strip>;
    }, z.core.$strip>>;
    schemaVersion: z.ZodLiteral<1>;
    toolCallId: z.ZodString;
    sourceRevision: z.ZodString;
    sourceLabel: z.ZodString;
}, z.core.$strip>, z.ZodObject<{
    schemaVersion: z.ZodLiteral<1>;
    kind: z.ZodLiteral<"skillhub-operation">;
    toolCallId: z.ZodString;
    operation: z.ZodNullable<z.ZodObject<{
        operationId: z.ZodUUID;
        context: z.ZodObject<{
            hostInstanceId: z.ZodUUID;
        }, z.core.$strip>;
        kind: z.ZodString;
        namespace: z.ZodOptional<z.ZodString>;
        slug: z.ZodString;
        version: z.ZodString;
        targetLabel: z.ZodString;
        phase: z.ZodString;
        warningCount: z.ZodNumber;
        discovery: z.ZodOptional<z.ZodEnum<{
            failed: "failed";
            confirmed: "confirmed";
            unconfirmed: "unconfirmed";
        }>>;
        recovery: z.ZodOptional<z.ZodEnum<{
            unknown: "unknown";
            restored: "restored";
            "not-needed": "not-needed";
            incomplete: "incomplete";
        }>>;
    }, z.core.$strip>>;
}, z.core.$strip>, z.ZodObject<{
    schemaVersion: z.ZodLiteral<1>;
    kind: z.ZodLiteral<"skillhub-availability">;
    toolCallId: z.ZodString;
    diagnosis: z.ZodObject<{
        installation: z.ZodOptional<z.ZodObject<{
            namespace: z.ZodString;
            slug: z.ZodString;
            version: z.ZodString;
            scope: z.ZodEnum<{
                user: "user";
                project: "project";
            }>;
        }, z.core.$strip>>;
        scope: z.ZodOptional<z.ZodEnum<{
            user: "user";
            project: "project";
        }>>;
        checkedAt: z.ZodString;
        name: z.ZodOptional<z.ZodString>;
        association: z.ZodEnum<{
            "managed-reference": "managed-reference";
            "not-associated": "not-associated";
        }>;
        integrity: z.ZodEnum<{
            unknown: "unknown";
            missing: "missing";
            verified: "verified";
            changed: "changed";
        }>;
        discovery: z.ZodEnum<{
            unknown: "unknown";
            winner: "winner";
            shadowed: "shadowed";
            "not-discovered": "not-discovered";
        }>;
        invocation: z.ZodOptional<z.ZodObject<{
            userInvocable: z.ZodBoolean;
            modelInvocable: z.ZodBoolean;
        }, z.core.$strip>>;
        reason: z.ZodEnum<{
            "host-unavailable": "host-unavailable";
            "not-discovered": "not-discovered";
            observed: "observed";
            "files-missing": "files-missing";
            "files-unreadable": "files-unreadable";
            "local-changes": "local-changes";
            "baseline-unverified": "baseline-unverified";
            "definition-unverified": "definition-unverified";
            "snapshot-unavailable": "snapshot-unavailable";
            "snapshot-incomplete": "snapshot-incomplete";
            "observation-changed": "observation-changed";
            "same-name-winner": "same-name-winner";
            "definition-changed": "definition-changed";
            "read-failed": "read-failed";
        }>;
    }, z.core.$strip>;
}, z.core.$strip>], "kind">;
export type ManagementViewResult = z.infer<typeof schema>;
export type ManagementReceipt = z.infer<typeof management>;
/** Transcript metadata is display data, never authority to mutate. Host rechecks every reference. */
export declare function parseManagementResult(value: unknown, callId: string): ManagementViewResult | undefined;
export declare function managementReason(reason: string): string;
export {};
