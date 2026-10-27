/**
 * 求 star 的"一键"动作：`gh repo star <owner>/<repo>`。
 *
 * 为什么是 `gh` 而不是 `git`：star 是 GitHub 的 API 概念，`git` 本身没有这个能力；
 * 而且终端里的 OSC 8 链接**只能打开 URL**，点不出命令来——所以"一键"必须是 TUI 里
 * 一个显式动作（`/star` 或弹窗按钮），由用户按下去才执行。
 *
 * 三条硬约束：
 * 1. **绝不自动 star**：没有用户动作就不会调用这里；
 * 2. **绝不阻塞界面**：全部走 `execFileNoThrow`（永不 reject）+ 每步都有超时；
 * 3. **失败要说人话**：没装 `gh` / 没登录 / 网络失败分别给不同结论，调用方好回一句
 *    有意义的提示，并回落到"在浏览器里打开"。
 */
/** 要 star 的仓库（`owner/name`）。 */
export declare const STAR_REPO = "ccch1mneyyy/dsh-TUI";
/** 一键 star 的结果：`starred` 以外都是"没成，但说清了为什么"。 */
export type StarOutcome = {
    readonly kind: 'starred';
} | {
    readonly kind: 'no-gh';
} | {
    readonly kind: 'not-authed';
} | {
    readonly kind: 'failed';
    readonly detail: string;
};
/** 执行器签名（测试注入用；生产就是 `execFileNoThrow`）。 */
export type StarExec = (file: string, args: readonly string[], options?: {
    timeout?: number;
}) => Promise<{
    code: number | null;
    stdout: string;
    stderr: string;
}>;
/**
 * 让本机 `gh` 给仓库点一个 star。
 * @param options - `exec` 是测试缝；`timeoutMs` 是 star 那一步的超时（探测步骤固定短超时）。
 * @returns 结果；只有 `starred` 表示真的点上了。
 */
export declare function starRepo(options?: {
    exec?: StarExec;
    timeoutMs?: number;
}): Promise<StarOutcome>;
//# sourceMappingURL=starAction.d.ts.map