import type { NativeOperation } from './generated/native-contract.js';
export interface OperationDiagnostic {
    operationId: string;
    kind: NativeOperation['kind'];
    code: string;
}
/** Never copy exception messages, arbitrary codes, paths or request data into diagnostics. */
export declare function operationDiagnostic(operation: NativeOperation, error: unknown): OperationDiagnostic;
