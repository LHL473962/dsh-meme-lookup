/**
 * The `/auth` command: a textual veneer over the {@link DshAuthApi} — status
 * listing, login (optionally picking the provider interactively), logout.
 *
 * @module @deepseek-harness-tui/dsh-tui/oauth/command
 */
import type { CommandInvocation, CommandResult } from '@deepseek-ai/dsh-commands';
import type { DshAuthApi } from './service.js';
/**
 * Build the `/auth` handler. Every failure returns a `CommandResult`, never a
 * rejection the host would have to translate; unexpected throws still
 * propagate for the host's own error surface.
 */
export declare function createAuthCommandHandler(api: DshAuthApi): (invocation: CommandInvocation) => Promise<CommandResult>;
//# sourceMappingURL=command.d.ts.map