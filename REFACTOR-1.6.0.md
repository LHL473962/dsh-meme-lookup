# v1.6.0 重构记录：单文件拆模块

> 2026-10-27，创造模式鱼书。目标：把 95KB / 1927 行的 `index.js` 拆开，
> 让以后「定点 edit」不再贴着 50KB 截断线走。

## 拆完的结构

| 文件 | 行数量级 | 职责 |
|---|---|---|
| `index.js` | ~40 行 | 只做装配：`inject` / `VERSION` / `apply(ctx)` 调两个 register |
| `lib/net.js` | ~40 行 | `API` + `getJson`（禁重定向、限时、5xx 退避一次） |
| `lib/engine.js` | ~950 行 | 识别 / 判定链 / 热度 / 时效 / 语境 / 人设 / 文件锁 / 原子写 |
| `lib/tools.js` | ~980 行 | 12 个 `meme_*` 工具的注册与 handler |
| `lib/panel.js` | ~70 行 | `/api/meme-panel` 路由（设置页 client.js 的数据源） |

依赖方向是单向的：`index → tools/panel → engine → net`，没有环。

## 拆分时改的路径

模块进了 `lib/`，所有 `new URL('./x.json', import.meta.url)` 改成 `'../x.json'`；
`pluginDir` / `_pkgDir` 指回包根（`new URL('..', import.meta.url)`）。
`DSH_MEME_LEXICON` 环境变量的默认值同步改成 `'../lexicon_all.json'`。

## 顺手修的一个真 bug

`findExecutable()` 里用了 `require('node:path').delimiter`——ESM 里没有 `require`。
之前没炸是因为 `resolvePython()` 先命中了硬编码的 venv 路径，没走到那一行。
现在改成顶部 `import { join, delimiter } from 'node:path'`。

## 测试改动（仍是 12 项，不增不减）

1. **请求体上限覆盖**：原来只扫 `index.js`。拆分后 loop 搬进 `lib/engine.js`，
   第一次跑显示「0 处都有上限」——**静默通过**。已改成扫 `index.js + lib/*.js`，
   并且找不到任何读 body 的代码时直接 FAIL（防止不变量没人盯着）。
2. **面板服务**：原来只是探测 `127.0.0.1:8797` 在不在。现在先用假 ctx 跑
   `apply()`，断言 `/api/meme-panel` 路由真的注册了，再 GET `/settings`
   验证返回的是设置对象；最后才探测独立面板。设置页的数据源这条链现在有测试盯着。

## 已知问题（不是这次引入的）

- `已知梗判定` 用「芭比Q」跑，结果会在 `USE_WITH_CARE` / `UNKNOWN` 之间跳。
  原因是 coach 走 cnmeme 实时检索，自检连续两次查询会撞限流。测试只断言
  verdict 非空，所以 12/12 稳定，但这项不适合当强断言。
- `lib/tools.js` 仍有 51KB，贴着读工具的 50KB 截断线。下一步可再拆成
  `tools/core.js` + `tools/text.js`（1.6.1）。
