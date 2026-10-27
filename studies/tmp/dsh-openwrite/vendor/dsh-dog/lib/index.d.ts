import { $ as VerifierShape, A as FailurePolicy, B as GoalRuntimeTrace, C as ConstraintKind, D as DogConfig, E as DependencyEdge, F as GoalNodeInput, G as JsonPrimitive, H as GoalState, I as GoalResult, J as NotExpr, K as JsonValue, L as GoalRuntimeError, M as GoalAgentSessionRef, N as GoalId, O as DogGraphInput, P as GoalKind, Q as VerificationRecord, R as GoalRuntimeEvent, S as CompiledGraph, T as DOG_SCHEMA_VERSION, U as GraphLimits, V as GoalRuntimeVerifier, W as GraphValidationReport, X as RootTerminalState, Y as RefExpr, Z as RunInvocationContext, _ as AtLeastExpr, b as CiGoalReport, c as AgenticRunner, d as runPlan, et as isJsonValue, f as DogRepository, g as AnyExpr, h as AllExpr, j as GoalAgentRole, k as DogRun, l as ProgrammaticRunner, m as AcceptancePlan, p as loadSchemaSet, q as JudgmentIdentity, r as DogEngine, s as WorkspaceManager, u as Verdict, v as BoolExpr, w as ContainsEdge, x as CiReport, y as CapturedInput, z as GoalRuntimePhase } from "./core-BiEBMLz3.js";
import z from "@deepseek-ai/schemastery";
import { Agent } from "@deepseek-ai/dsh-agent";
import { ToolDefinition } from "@deepseek-ai/dsh-tools";
import { Context } from "@deepseek-ai/cordis";
import { ConnectionRpcHandler } from "@deepseek-ai/dsh-client-connection";
import { SessionId } from "@deepseek-ai/dsh-session";
import { JobRegistry } from "@deepseek-ai/dsh-jobs";
//#region src/debug-contract.d.ts
/**
 * Dedicated debugger channel. It is served by this plugin directly on the Web
 * carrier (see serveDogDebugRpc): Connection's generic channel registry mounts
 * its HTTP route through the Connection plugin's own context, which only sees
 * `webServer` when a bundle patch injects it into the shared connection row —
 * and per-key patch semantics make any such patch clobber other bundles
 * (OpenWrite issue #81), while the shared `/api` channel already belongs to
 * the host's Typert gateway. The wire envelope mirrors Connection's, so the
 * browser side keeps using its stock `connection.rpc.call`.
 */
declare const DOG_DEBUG_RPC_CHANNEL = "/dog-rpc";
declare const DOG_DEBUG_SNAPSHOT_ENDPOINT = "snapshot";
declare const DOG_RUNTIME_TRACE_ENDPOINT = "goal-runtime";
/** One immutable graph revision and every run bound to that exact digest. */
interface DogDebugGraphRevision {
  readonly graph: CompiledGraph;
  readonly current: boolean;
  readonly runs: readonly DogRun[];
}
/** Complete, point-in-time view exposed to the debugger. */
interface DogDebugSnapshot {
  readonly schemaVersion: '0.1';
  readonly generatedAt: string;
  readonly graphs: readonly DogDebugGraphRevision[];
}
//#endregion
//#region src/debug.d.ts
/** Build a digest-safe view: an old run is never shown against a newer graph revision. */
declare function buildDogDebugSnapshot(repository: DogRepository, now?: () => Date): Promise<DogDebugSnapshot>;
/** Build one bounded node trace without loading any DSH transcript or artifact bytes. */
declare function buildGoalRuntimeTrace(repository: DogRepository, runId: string, goalId: string): Promise<GoalRuntimeTrace>;
/** Register this handler on the trusted-host Connection channel, never as an unauthenticated raw HTTP route. */
declare function createDogDebugRpcHandler(repository: DogRepository): ConnectionRpcHandler;
//#endregion
//#region src/graph.d.ts
/** Structured validation failure at the model-to-core boundary. */
declare class DogValidationError extends Error {
  readonly errors: readonly string[];
  constructor(errors: readonly string[]);
}
/** Parse an untrusted graph value into a normalized, acyclic DoG graph. */
declare function parseGraph(value: unknown, limits: GraphLimits): DogGraphInput;
//#endregion
//#region src/logic.d.ts
type TruthValue = true | false | 'unknown';
interface ExpressionLimits {
  readonly maxNodes: number;
  readonly maxDepth: number;
}
interface ParsedExpression {
  readonly expression?: BoolExpr;
  readonly errors: readonly string[];
}
/**
 * Parse and type-check the only expression language accepted by DoG.
 * @param value - untrusted JSON value from a graph draft.
 * @param allowedRefs - child IDs that the enclosing composite may reference.
 * @param limits - expression size limits.
 * @returns a typed AST or validation errors; never evaluates source text.
 */
declare function parseBoolExpr(value: unknown, allowedRefs: ReadonlySet<string>, limits: ExpressionLimits): ParsedExpression;
/**
 * Evaluate a typed AST against settled child truth values.
 * @param expression - validated DoG Boolean AST.
 * @param values - child success values; missing values are unresolved.
 * @returns three-valued result so pending work cannot be mistaken for failure.
 */
declare function evaluateBoolExpr(expression: BoolExpr, values: ReadonlyMap<string, boolean | undefined>): TruthValue;
//#endregion
//#region src/tools.d.ts
declare module '@deepseek-ai/dsh-jobs' {
  interface JobKindMap {
    dog: 'dog';
  }
}
interface DogAgentLauncher {
  launch(input: {
    readonly label: string;
    readonly prompt: string;
    readonly parent: Agent;
    readonly signal: AbortSignal;
  }): Promise<{
    readonly sessionId: SessionId;
  }>;
  interrupt?(sessionId: SessionId, parent: Agent): void | Promise<void>;
}
declare const DOG_VALIDATE_TOOL = "dog_validate";
declare const DOG_CREATE_TOOL = "dog_create";
declare const DOG_RUN_TOOL = "dog_run";
declare const DOG_BIND_AGENT_TOOL = "dog_bind_agent";
declare const DOG_DELEGATE_AGENT_TOOL = "dog_delegate_agent";
declare const DOG_STATUS_TOOL = "dog_status";
declare const DOG_WAIT_TOOL = "dog_wait";
/** Build the complete DoG v0.1 tool surface around one engine instance. */
declare function createDogTools(engine: () => DogEngine, hostJobs?: () => JobRegistry | undefined): readonly ToolDefinition[];
/** Build the DoG-aware continuable Agent launcher once the host subagent service is available. */
declare function createDogDelegateAgentTool(engine: () => DogEngine, launcher: DogAgentLauncher): ToolDefinition;
//#endregion
//#region src/index.d.ts
/** Cordis plugin name. */
declare const name = "dsh-dog";
/** Required Harness services. */
declare const inject: string[];
declare module '@deepseek-ai/cordis' {
  interface Context {
    openwriteDog: {
      tools: ToolDefinition[];
    };
  }
}
/** Host-owned deployment configuration. */
interface Config {
  storageDirectory: string;
  /** Verifier workspace root (WorkspaceManager.baseDir): verifiers only read files inside this tree. */
  workspaceRoot: string;
  /** Host-registered programmatic script library (relative to DSH_HOME, or absolute). */
  scriptsDirectory: string;
  maxGraphNodes: number;
  maxExpressionNodes: number;
  maxExpressionDepth: number;
  maxSandboxBytes: number;
  allowPartialRoot: boolean;
  maxConcurrentVerifications: number;
  revalidateThreshold: number;
  gmDigestAlgo: string;
  subagentProvider: string;
  subagentMaxDepth: number;
}
/** Loader-validated DoG deployment configuration. */
declare const Config: z<Config>;
/** Register all DoG tools as Cordis-owned effects so fiber disposal removes them. */
declare function apply(ctx: Context, config: Config): Promise<void>;
//#endregion
export { type AcceptancePlan, type AgenticRunner, type AllExpr, type AnyExpr, type AtLeastExpr, type BoolExpr, type CapturedInput, type CiGoalReport, type CiReport, type CompiledGraph, Config, type ConstraintKind, type ContainsEdge, DOG_BIND_AGENT_TOOL, DOG_CREATE_TOOL, DOG_DEBUG_RPC_CHANNEL, DOG_DEBUG_SNAPSHOT_ENDPOINT, DOG_DELEGATE_AGENT_TOOL, DOG_RUNTIME_TRACE_ENDPOINT, DOG_RUN_TOOL, type DOG_SCHEMA_VERSION, DOG_STATUS_TOOL, DOG_VALIDATE_TOOL, DOG_WAIT_TOOL, type DependencyEdge, type DogConfig, type DogDebugGraphRevision, type DogDebugSnapshot, DogEngine, type DogGraphInput, type DogRun, DogValidationError, type FailurePolicy, type GoalAgentRole, type GoalAgentSessionRef, type GoalId, type GoalKind, type GoalNodeInput, type GoalResult, type GoalRuntimeError, type GoalRuntimeEvent, type GoalRuntimePhase, type GoalRuntimeTrace, type GoalRuntimeVerifier, type GoalState, type GraphLimits, type GraphValidationReport, type JsonPrimitive, type JsonValue, type JudgmentIdentity, type NotExpr, type ProgrammaticRunner, type RefExpr, type RootTerminalState, type RunInvocationContext, type Verdict, type VerificationRecord, type VerifierShape, WorkspaceManager, apply, buildDogDebugSnapshot, buildGoalRuntimeTrace, createDogDebugRpcHandler, createDogDelegateAgentTool, createDogTools, evaluateBoolExpr, inject, type isJsonValue, loadSchemaSet, name, parseBoolExpr, parseGraph, runPlan };