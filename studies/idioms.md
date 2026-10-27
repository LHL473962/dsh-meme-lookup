# 源码细读笔记（60 个插件 / 3094 js 文件）

时间：2026-10-27 21:50–22:15｜数据：`studies/profiles.json`、`studies/tmp/`

## 一、规模画像

| 插件 | LOC | 工具 | 路由 | 槽位 | try/catch |
|---|---|---|---|---|---|
| dsh-univer-office | 1,323,811 | 14 | 3 | 0 | 1896 |
| dsh-openwrite | 174,428 | **203** | 4 | 0 | 327 |
| dsh-image-gen | 158,687 | 15 | 12 | 0 | 438 |
| dsh-better-sidebar | 359,817 | 2 | 7 | 8 | 619 |
| dsh-vision-router | 55,230 | 2 | 17 | 8 | 791 |

**规律：工具多的插件不一定代码多（openwrite 203 工具、17 万行）；UI 重的插件行数大但工具少。**

## 二、路由注册：一律包 `ctx.effect`

```js
ctx.effect(() => ctx.webServer.register({
  kind: "exact",
  path: SUBSCRIPTION_LOGIN_ROUTE,
  handler: (req, res) => serveLogin(req, res, manager),
}), "dsh-image-gen: subscription login route");
```

第二个参数是清理时的名字——**便于排错**。

## 三、路由必须自己做安全检查（我原来没做）

image-gen 的 handler 开头三连：

```js
if (!sameOrigin(req)) return jsonError(res, 403, "origin-rejected");
if (req.method !== "POST") return jsonError(res, 405, "method-not-allowed");
if (!(req.headers["content-type"] ?? "").toLowerCase().startsWith("application/json"))
  return jsonError(res, 415, "json-required");
```

**已抄进我们插件**：`/api/meme-panel/*` 现在做同源校验，跨站直接 403。

## 四、工具定义的包装器

openwrite 自己包了一层：

```js
function defineTool(options) {
  if (!Number.isFinite(options.timeoutMs) || options.timeoutMs <= 0)
    throw new Error(`defineTool(${options.name}): timeoutMs must be a positive finite number`);
  ...
}
ctx.tools.register(defineTool({ ... }))
```

好处：**注册期就把参数校验掉**，而不是等用户触发才崩。

## 五、工具命名的家族制

openwrite 的 203 个工具全是 `novel_*` 前缀：`novel_embedding_profiles`、`novel_status`、`novel_outline_read`……

**前缀 = 功能域**，模型看到名字就知道该不该调。我们的 `meme_*` 已经是这个路子。

## 六、槽位不止 settings.section

better-sidebar 用了三个：

```
ctx.slots.inject("conversation.session.header.utilities", ...)
ctx.slots.inject("shell.overlay", ...)
settings.section
```

结论：**可以做悬浮层、可以往会话头部塞按钮**，不只是设置页。

## 七、client 端不用打包器

vision-router 的 client.js 头部：

```js
// Self-contained by hand (no bundler in this repo)
window.__ModuleLoader__.load({
  id: 'dsh-vision-router',
  factory: (require) => {
    const module = { exports: {} }
    const exports = module.exports
    const React = require('react')
    ...
```

**手写 CJS 工厂 + require 宿主模块** 就是标准做法，不需要构建。

## 八、两种配置路线

| 路线 | 例子 | 适合 |
|---|---|---|
| 宿主 settings 命名空间 | vision-router（`vision-router` namespace）、free-search（schemastery z） | 想要原生设置 UI |
| 自己的 json + 自己设置页 | speak-up、fish-memory、我们 | 不想依赖 schemastery |

## 九、defineTool 与 ctx.tools.register 并存

全库统计：`defineTool(` 235 次、`ctx.tools.register(` 205 次**几乎对半**。

前者来自 `@deepseek-ai/dsh-tools`（free-search 直接 import），后者是底层 API。**两条路都活着。**

## 十、我们这轮改了什么

| 版本 | 改动 | 学自 |
|---|---|---|
| 1.4.4 | compatibility + locale | 目录统计 / archive-manager |
| 1.4.5 | client.inject slots + engines | fish-memory / speak-up |
| 1.4.6 | capabilityRedLines | 目录字段 |
| 1.4.7 | 路由同源校验 | **dsh-image-gen** |

## 十一、还没抄但值得抄的

- 工具定义包装器（注册期校验）：openwrite 那套
- `shell.overlay` 槽位：可以做常驻悬浮件
- schemastery 原生设置页：想要和别的插件一致的 UI 时