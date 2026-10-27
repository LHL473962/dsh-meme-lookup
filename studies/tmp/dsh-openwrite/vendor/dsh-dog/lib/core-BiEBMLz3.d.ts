import { ValidateFunction } from "ajv/dist/2020.js";
import { Agent } from "@deepseek-ai/dsh-agent";
//#region src/model.d.ts
/** Core JSON-compatible types for the DoG v0.9 protocol. */
declare const DOG_SCHEMA_VERSION: "0.9";
type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | {
  [key: string]: JsonValue;
};
type GoalId = string;
type ConstraintKind = 'hard' | 'soft';
type GoalKind = 'leaf' | 'composite';
type FailurePolicy = 'fatal' | 'tolerable' | 'degrade';
type GoalState = 'pending' | 'running' | 'success' | 'failure' | 'blocked' | 'needs_human' | 'cancelled' | 'invalidated' | 'partial' | 'inherited';
interface RefExpr {
  readonly op: 'ref';
  readonly id: GoalId;
}
interface AllExpr {
  readonly op: 'all';
  readonly items: readonly BoolExpr[];
}
interface AnyExpr {
  readonly op: 'any';
  readonly items: readonly BoolExpr[];
}
interface NotExpr {
  readonly op: 'not';
  readonly item: BoolExpr;
}
interface AtLeastExpr {
  readonly op: 'atLeast';
  readonly count: number;
  readonly items: readonly BoolExpr[];
}
type BoolExpr = RefExpr | AllExpr | AnyExpr | NotExpr | AtLeastExpr;
/** One of exactly two judgment kernels: a script, or a natural-language instruction. */
type VerifierShape = {
  readonly mode: 'programmatic';
  readonly script: string;
} | {
  readonly mode: 'agentic';
  readonly instruction: string;
};
interface GoalNodeInput {
  readonly kind: GoalKind;
  readonly title: string;
  readonly constraint: ConstraintKind;
  /** Single file path or a directory/collection (engine packs it into .tar). */
  readonly target: string;
  /** Leaf: required. Composite: optional whole-object assertion (runs after subtree settles). */
  readonly verifier?: VerifierShape;
  /** Composite only: boolean combination of children. */
  readonly completion?: BoolExpr;
}
interface ContainsEdge {
  readonly parent: GoalId;
  readonly child: GoalId;
  readonly required: boolean;
  readonly failure: FailurePolicy;
  readonly degradeTo?: GoalId;
}
interface DependencyEdge {
  readonly source: GoalId;
  readonly target: GoalId;
  readonly data?: readonly string[];
}
interface DogGraphInput {
  readonly schemaVersion: typeof DOG_SCHEMA_VERSION;
  readonly id: string;
  readonly root: GoalId;
  readonly nodes: Record<GoalId, GoalNodeInput>;
  readonly contains: readonly ContainsEdge[];
  readonly dependsOn: readonly DependencyEdge[];
}
interface DogConfig {
  readonly storageDirectory: string;
  /** Sandbox/root for captured inputs: verifiers' objects come from this tree. */
  readonly workspaceRoot: string;
  /** Host-registered script library directory (programmatic kernels). */
  readonly scriptsDirectory: string;
  readonly maxGraphNodes: number;
  readonly maxExpressionNodes: number;
  readonly maxExpressionDepth: number;
  readonly maxSandboxBytes: number;
  readonly allowPartialRoot: boolean;
  readonly maxConcurrentVerifications: number;
  readonly revalidateThreshold: number;
  readonly gmDigestAlgo: string;
}
interface GraphLimits {
  readonly maxGraphNodes: number;
  readonly maxExpressionNodes: number;
  readonly maxExpressionDepth: number;
}
/** One captured object (file, or packed .tar for a collection). */
interface CapturedInput {
  readonly path: string;
  readonly digest: string;
  readonly exists: boolean;
  readonly byteLength: number;
  readonly sha256: string;
  /** True when the capture is a .tar of a directory/collection. */
  readonly packed?: boolean;
}
/** Deterministic or agentic: judgment identity double-anchors incremental reuse. */
type JudgmentIdentity = {
  readonly mode: 'programmatic';
  readonly script: string;
  readonly scriptDigest: string;
} | {
  readonly mode: 'agentic';
  readonly instructionHash: string;
};
interface AcceptancePlan {
  readonly goalId: GoalId;
  /** Which kernel judges this goal. */
  readonly verifier: VerifierShape;
  /** Identity of the judgment source; part of the inheritance anchor. */
  readonly judgment: JudgmentIdentity;
  readonly target: string;
  /** Captured object metadata (absent when target is missing/empty). */
  readonly input?: CapturedInput;
  readonly gmDigest?: string;
}
interface VerificationRecord {
  readonly schemaVersion: '0.1';
  readonly runId: string;
  readonly graphId: string;
  readonly graphDigest: string;
  readonly goalId: GoalId;
  readonly judgment: JudgmentIdentity;
  readonly gmDigest?: string;
  readonly passed: boolean | null;
  readonly evidence?: JsonValue;
  readonly at: string;
}
interface GoalRuntimeVerifier {
  readonly mode: 'programmatic' | 'agentic';
}
interface GoalRuntimeError {
  readonly kind: 'acceptance_plan_missing' | 'completion_expression_missing' | 'verification_error' | 'agentic_unavailable';
  readonly stage: 'scheduling' | 'verification' | 'composition';
  readonly message: string;
}
type GoalRuntimePhase = 'goal_started' | 'dependency_blocked' | 'grounding_extracted' | 'workspace_allocated' | 'verifier_started' | 'verifier_passed' | 'verifier_failed' | 'verifier_inconclusive' | 'composite_evaluated' | 'result_inherited' | 'verifier_released' | 'verifier_bind_failed' | 'structured_error' | 'goal_settled' | 'run_warning';
interface GoalRuntimeEvent {
  readonly schemaVersion: '0.1';
  readonly runId: string;
  readonly goalId: GoalId;
  readonly phase: GoalRuntimePhase;
  readonly state?: GoalState;
  readonly at: string;
  readonly reason?: string;
  readonly verifier?: GoalRuntimeVerifier;
  readonly gmDigest?: string;
  readonly attempt?: number;
  readonly durationMs?: number;
}
type GoalAgentRole = 'orchestrator' | 'verifier' | 'reviewer';
interface GoalAgentSessionRef {
  readonly sessionId: string;
  readonly parentSessionId?: string;
  readonly role: GoalAgentRole;
  readonly boundAt: string;
}
interface RunInvocationContext {
  readonly callId: string;
  readonly agentSessionId?: string;
  readonly parentSessionId?: string;
  readonly invokedAt: string;
}
interface GoalResult {
  readonly state: GoalState;
  readonly reason?: string;
  readonly verification?: VerificationRecord;
  readonly inheritedFrom?: string;
  readonly agentSessions?: readonly GoalAgentSessionRef[];
}
type RootTerminalState = 'success' | 'partial_success' | 'failure' | 'infeasible' | 'needs_replan' | 'cancelled';
interface CompiledGraph {
  readonly input: DogGraphInput;
  readonly graphDigest: string;
  readonly acceptancePlans: Readonly<Record<GoalId, AcceptancePlan>>;
}
interface DogRun {
  readonly runId: string;
  readonly graphId: string;
  readonly graphDigest: string;
  /** Calling session's cwd; verifier workspaces are allocated under it. */
  readonly workspaceBaseDir?: string;
  readonly state: 'running' | 'completed' | 'cancelled' | 'failed';
  readonly rootState?: RootTerminalState;
  readonly invocation?: RunInvocationContext;
  readonly runtimeWarning?: string;
  readonly gmDigests: Readonly<Record<GoalId, string>>;
  readonly goals: Readonly<Record<GoalId, GoalResult>>;
  readonly createdAt: string;
  readonly updatedAt: string;
}
interface GoalRuntimeTrace {
  readonly schemaVersion: '0.1';
  readonly runId: string;
  readonly graphId: string;
  readonly graphDigest: string;
  readonly runState: DogRun['state'];
  readonly rootState?: RootTerminalState;
  readonly goalId: GoalId;
  readonly result: GoalResult;
  readonly invocation?: RunInvocationContext;
  readonly runtimeWarning?: string;
  readonly events: readonly GoalRuntimeEvent[];
  readonly truncated: boolean;
}
interface GraphValidationReport {
  readonly valid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
}
interface CiGoalReport {
  readonly goalId: GoalId;
  readonly state: GoalState;
  readonly verifier?: GoalRuntimeVerifier;
  readonly evidence?: readonly Record<string, JsonValue>[];
  readonly defect?: string;
  readonly settledAt?: string;
}
interface CiReport {
  readonly runId: string;
  readonly graphId: string;
  readonly graphDigest?: string;
  readonly rootState: RootTerminalState | 'running' | 'cancelled';
  readonly goals: readonly CiGoalReport[];
  readonly revalidated?: readonly GoalId[];
  readonly inherited?: readonly {
    goalId: GoalId;
    fromRunId: string;
    state: 'inherited';
  }[];
  readonly warning?: string;
  readonly generatedAt: string;
}
declare function isJsonValue(value: unknown): value is JsonValue;
//#endregion
//#region src/schema.d.ts
interface SchemaSet {
  readonly validateGraph: ValidateFunction;
  readonly validateRun: ValidateFunction;
  readonly validateVerification: ValidateFunction;
  readonly validateRuntimeEvent: ValidateFunction;
  readonly validateReport: ValidateFunction;
}
/** Load the five normative schemas from schemas/schema-0.2 (checked into the package root). */
declare function loadSchemaSet(): Promise<SchemaSet>;
//#endregion
//#region src/storage.d.ts
declare class DogRepository {
  readonly rootPath: string;
  private readonly runMutationTails;
  private readonly schema;
  constructor(rootPath: string, schema?: SchemaSet | undefined);
  /** Create the repository directory layout. */
  initialize(): Promise<void>;
  /** Persist one immutable compiled graph revision and its ID index. */
  saveGraph(compiled: CompiledGraph): Promise<void>;
  /** Load the latest graph revision for a graph ID. */
  loadGraph(graphId: string): Promise<CompiledGraph>;
  /** Enumerate immutable graph revisions. Pre-v0.2 records (no grounding/gmDigest contract) are skipped, not deleted. */
  listGraphs(): Promise<readonly CompiledGraph[]>;
  /** Persist a run snapshot. */
  saveRun(run: DogRun): Promise<void>;
  /** Atomically read, transform, and replace one run within this repository process. */
  updateRun(runId: string, update: (run: DogRun) => DogRun): Promise<DogRun>;
  private withRunMutation;
  /** Load one run snapshot, fail-closed against the run schema. */
  loadRun(runId: string): Promise<DogRun>;
  /**
   * Load the most recently updated non-running run for a graph ID
   * (revalidate_select input). Any terminal record may carry verification
   * settlements worth inheriting — including orphaned runs that a host restart
   * left running and that recovery later invalidated or cancelled.
   */
  loadLatestSettledRun(graphId: string): Promise<DogRun | undefined>;
  /** Enumerate persisted run snapshots, newest update first. Pre-v0.2 records are skipped. */
  listRuns(): Promise<readonly DogRun[]>;
  /**
   * Cancel every persisted run still in `running` state. Called at host boot
   * (before any engine instance exists), so runs from a killed/restarted host
   * surface as cancelled instead of frozen "running" forever. Their settled
   * leaves stay inheritable by the next run of the same graph.
   */
  markOrphanedRunningRuns(nowIso: string): Promise<number>;
  /** Append one verification record without rewriting prior records. */
  appendVerification(record: VerificationRecord): Promise<void>;
  /** Append diagnostic runtime context to the selected goal shard, separately from trusted verifier evidence. */
  appendRuntimeEvent(event: GoalRuntimeEvent): Promise<void>;
  /** Load one goal's validated event shard. A torn final line is ignored. */
  loadGoalRuntimeEvents(runId: string, goalId: string): Promise<readonly GoalRuntimeEvent[]>;
  /** Persist the verbatim verifier settlement text (survives workspace cleanup). */
  saveSettlement(runId: string, goalId: string, content: string): Promise<void>;
  /** Store captured input bytes and its metadata manifest under content identity. */
  putSandboxFile(input: CapturedInput, bytes: Uint8Array | undefined): Promise<void>;
  /** Read and re-hash a captured input named by a verification plan. */
  readCapturedFile(input: CapturedInput): Promise<Uint8Array>;
  /** InputReader contract: read one captured input. */
  read(input: CapturedInput): Promise<Uint8Array>;
  /** Copy a captured input into one run workspace (or resolve to the workspace dir). */
  copyCapturedInput(input: CapturedInput | undefined, workspacePath: string): Promise<string>;
}
//#endregion
//#region src/verifiers.d.ts
/** A verdict is a two-field minimum: the judgment and free-form evidence. */
interface Verdict {
  readonly state: 'pass' | 'fail' | 'inconclusive';
  readonly evidence: JsonValue;
  readonly reason?: string;
}
interface IsolatedWorkspace {
  /** Absolute path of the mutually exclusive workspace directory. */
  readonly path: string;
}
interface VerifierExecutionEnv {
  readonly parent?: Agent | undefined;
  readonly signal?: AbortSignal;
  readonly runId?: string;
  readonly goalId?: string;
}
/** Programmatic kernel: runs a host-registered script with the captured object path. */
type ProgrammaticRunner = (script: string, inputPath: string, env: VerifierExecutionEnv) => Promise<Verdict>;
/** Agentic kernel: hands one natural-language instruction + the object to a worker agent. */
type AgenticRunner = (instruction: string, workspace: IsolatedWorkspace, inputPath: string, env: VerifierExecutionEnv) => Promise<Verdict>;
/** Result of one judgment, unified across both kernels. */
interface Settlement {
  readonly state: 'pass' | 'fail' | 'inconclusive';
  readonly observation: Record<string, JsonValue>;
  readonly evidence?: JsonValue;
}
/**
 * Run one plan through the selected kernel. The engine holds none of the
 * judgment semantics: programmatic goes to a script, agentic to a worker agent
 * with only the instruction text — no parameter schema, no evidence format,
 * no tool allow-list.
 */
declare function runPlan(plan: {
  readonly verifier: VerifierShape;
  readonly target: string;
}, workspace: IsolatedWorkspace, inputPath: string, env: VerifierExecutionEnv, programmatic: ProgrammaticRunner | undefined, agentic: AgenticRunner | undefined): Promise<Settlement>;
//#endregion
//#region src/workspace.d.ts
interface WorkspaceOptions {
  readonly baseDir?: string;
}
declare class WorkspaceManager {
  private readonly baseDir;
  private readonly pending;
  constructor(options?: WorkspaceOptions);
  /**
   * Allocate one mutually exclusive workspace directory.
   *
   * `baseDir` overrides the construction default: the engine passes the calling
   * session's cwd so the workspace lands inside the session workspace, which is
   * exactly the tree the verifier subagent's sandbox (workspace-write) permits.
   * Defaults to the manager's configured base dir when no override is given.
   */
  acquire(baseDir?: string): Promise<IsolatedWorkspace>;
  /** Release a workspace after verification completes; contents are discarded. */
  release(workspace: IsolatedWorkspace): Promise<void>;
  /** Wait for every in-flight release (host shutdown). */
  drain(): Promise<void>;
  /** Release a batch at once — used at run teardown, after every verifier settled. */
  releaseAll(workspaces: readonly IsolatedWorkspace[]): Promise<void>;
}
//#endregion
//#region src/core.d.ts
interface DogEngineOptions {
  readonly config: DogConfig;
  readonly repository: DogRepository;
  /** Runtime knob source: read once per run, so host settings changes apply without a restart. */
  readonly liveConfig?: () => Partial<Pick<DogConfig, 'maxConcurrentVerifications'>>;
  /** Host hook fired after a run is cancelled — used to interrupt its verifier subagents. */
  readonly onRunCancelled?: (runId: string) => void;
  /** Programmatic kernel (script executor) — host wiring; may be installed later. */
  readonly programmatic?: ProgrammaticRunner;
  /** Agentic kernel (worker-agent launcher) — host wiring; may be installed later. */
  readonly agentic?: AgenticRunner;
  readonly workspaces?: WorkspaceManager;
  readonly now?: () => Date;
  readonly nextRunId?: () => string;
  readonly heartbeatMs?: number;
  /** Resolve a live Agent by its session id (host wiring: AgentRegistry.get). */
  readonly resolveLivingAgent?: (sessionId: string) => Agent | undefined;
}
interface DogRunOptions {
  readonly invocation?: {
    readonly callId: string;
    readonly agentSessionId?: string;
    readonly parentSessionId?: string;
  };
  readonly signal?: AbortSignal;
  readonly agent?: Agent | undefined;
}
interface DogBindAgentOptions {
  readonly runId: string;
  readonly goalId: string;
  readonly role: GoalAgentRole;
  readonly sessionId: string;
  readonly parentSessionId?: string;
}
interface DogAgentDelegationOptions {
  readonly runId: string;
  readonly goalId: string;
  readonly parentSessionId: string;
}
/** Agentic CI engine used by the DSH tools and tests. */
declare class DogEngine {
  private readonly config;
  private readonly repository;
  private readonly liveConfig;
  private readonly onRunCancelled;
  private readonly runControllers;
  private programmatic;
  private agentic;
  private readonly workspaces;
  private readonly now;
  private readonly nextRunId;
  private readonly heartbeatMs;
  private readonly workspaceRoot;
  private readonly backgroundTasks;
  private readonly runStops;
  private readonly workspaceBaseDirs;
  private readonly resolveLivingAgent;
  /** Install the two judgment kernels (host wiring; may arrive later than construction). */
  setKernels(programmatic: ProgrammaticRunner | undefined, agentic: AgenticRunner | undefined): void;
  constructor(options: DogEngineOptions);
  validate(value: unknown): GraphValidationReport;
  /** Compile and persist one graph revision against the captured input files. */
  create(value: unknown, options?: {
    readonly captureBaseDir?: string;
  }): Promise<CompiledGraph>;
  /** Synchronous run: prepare + execute to completion (tests, CLI). */
  run(graphId: string, options?: DogRunOptions): Promise<DogRun>;
  /** Asynchronous run: returns after the initial record is persisted; verification continues in background. */
  startRun(graphId: string, options?: DogRunOptions): Promise<DogRun>;
  /** Execute a prepared run on the engine's process-level loop, independent of any caller session. */
  private enqueueBackground;
  /** Stop this engine's owned runs before awaiting their settlement. */
  dispose(): Promise<void>;
  /** Wait for every in-flight background run (host shutdown). */
  drainBackground(): Promise<void>;
  /** Persist a bounded run-level warning (verifier binding/release diagnostics). */
  annotateRun(runId: string, warning: string): Promise<void>;
  /** Append a verifier worker lifecycle event (verifier_released / verifier_bind_failed). */
  recordVerifierLifecycle(runId: string, goalId: string, phase: 'verifier_released' | 'verifier_bind_failed', _sessionId: string, reason?: string): Promise<void>;
  /** Cancel one run and stop its heartbeat; partial records remain inspectable. */
  cancelRun(runId: string, reason: string): Promise<DogRun>;
  /**
   * Block on one run's settlement. Keeps the calling agent/session alive in
   * the process while verifier workers (continuable children of this process)
   * run to completion — the deterministic automation gate after dog_run. A
   * one-shot process that returns before this settles kills the workers it
   * spawned, so automation MUST wait through a dog_wait/monitor step.
   * @param options - bounded wait: default 15 minutes; abort (tool cancel)
   *   and timeout both return the current run with a non-terminal state.
   */
  waitRun(runId: string, options?: {
    readonly timeoutMs?: number;
    readonly pollMs?: number;
    readonly signal?: AbortSignal;
  }): Promise<DogRun>;
  private prepareRun;
  /** The Agentic CI cycle: revalidate-select, parallel verification, recompute. */
  private executeRun;
  /**
   * Merge in-memory goal progress with host-agent-session bindings recorded
   * concurrently inside an atomic read-modify-write: bindAgent (and future
   * host writers) update the same row under updateRun's serialization, so a
   * progress save can never overwrite a binding it never saw.
   */
  private mergeGoalsKeepingHostSessions;
  /** Mark any prior run of the same graph that never reached a terminal state, so a host restart cannot leave zombies. */
  private supersedePriorRunningRuns;
  status(runId: string): Promise<DogRun>;
  assertAgentCanDelegate(options: DogAgentDelegationOptions): Promise<void>;
  bindAgent(options: DogBindAgentOptions, policy?: {
    readonly allowUnrooted?: boolean;
  }): Promise<{
    readonly run: DogRun;
    readonly agent: GoalAgentSessionRef;
  }>;
  private parse;
  private validateWorkspaceRefs;
}
declare function resolveScriptPath(scriptsDirectory: string, script: string): string;
//#endregion
export { VerifierShape as $, FailurePolicy as A, GoalRuntimeTrace as B, ConstraintKind as C, DogConfig as D, DependencyEdge as E, GoalNodeInput as F, JsonPrimitive as G, GoalState as H, GoalResult as I, NotExpr as J, JsonValue as K, GoalRuntimeError as L, GoalAgentSessionRef as M, GoalId as N, DogGraphInput as O, GoalKind as P, VerificationRecord as Q, GoalRuntimeEvent as R, CompiledGraph as S, DOG_SCHEMA_VERSION as T, GraphLimits as U, GoalRuntimeVerifier as V, GraphValidationReport as W, RootTerminalState as X, RefExpr as Y, RunInvocationContext as Z, AtLeastExpr as _, DogRunOptions as a, CiGoalReport as b, AgenticRunner as c, runPlan as d, isJsonValue as et, DogRepository as f, AnyExpr as g, AllExpr as h, DogEngineOptions as i, GoalAgentRole as j, DogRun as k, ProgrammaticRunner as l, AcceptancePlan as m, DogBindAgentOptions as n, resolveScriptPath as o, loadSchemaSet as p, JudgmentIdentity as q, DogEngine as r, WorkspaceManager as s, DogAgentDelegationOptions as t, Verdict as u, BoolExpr as v, ContainsEdge as w, CiReport as x, CapturedInput as y, GoalRuntimePhase as z };