export type TaskNotifications = 'off' | 'unfocused' | 'always';
/** How a task completion is delivered: probe the terminal (`auto`), force
 *  OSC 9 or BEL, or ask for the native Windows toast. */
export type NotificationMethod = 'auto' | 'osc9' | 'bel' | 'windows';
/** Terminal-owned notification transport; never writes to redirected output. */
export declare function createTerminalNotifier(stdout: Pick<NodeJS.WriteStream, 'isTTY' | 'write'>): {
    configure(nextCondition?: TaskNotifications, nextMethod?: NotificationMethod): void;
    notify(title: string, message?: string): void;
};
//# sourceMappingURL=terminal-notification.d.ts.map