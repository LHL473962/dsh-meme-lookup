import { type ToolDefinition } from '@deepseek-ai/dsh-tools';
import type { BcnBridge } from './bridge.js';
export declare const BCS_ASSIGN_TASK_TOOL_NAME = "bcs_assign_task";
export declare const BCS_SEND_TASK_MESSAGE_TOOL_NAME = "bcs_send_task_message";
export declare const BCS_TASK_COMPLETE_TOOL_NAME = "bcs_task_complete";
export declare function createBcsAssignTaskTool(bridge: BcnBridge): ToolDefinition;
export declare function createBcsSendTaskMessageTool(bridge: BcnBridge): ToolDefinition;
export declare function createBcsTaskCompleteTool(bridge: BcnBridge): ToolDefinition;
//# sourceMappingURL=task-tools.d.ts.map