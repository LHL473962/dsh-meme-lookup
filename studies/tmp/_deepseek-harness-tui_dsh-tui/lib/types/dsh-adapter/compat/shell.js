/** Resolve through the host so workspace, timeout and sandbox policy survive. */
export async function runForegroundShell(shell, request) {
    const spec = shell.resolve(request);
    if (typeof shell.execute === 'function') {
        const execution = await shell.execute(spec);
        return execution.result();
    }
    if (typeof shell.run === 'function')
        return shell.run(spec);
    throw new Error('dsh-tui: shell provides neither execute() nor run()');
}
