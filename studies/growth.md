# 学习总结与进步评估（2026-10-27）

## 一、学了多少

| 层级 | 数量 |
|---|---|
| 插件目录（awesome-dsh-plugin） | **7211 条** |
| 拉到真实 package.json | **3731 个** |
| 下载源码细读（star 前 60） | **60 个插件 / 3094 个 js 文件** |

## 二、学到的硬事实（带数字）

| 结论 | 证据 |
|---|---|
| `dsh.bundle` 是硬门槛 | 99.7% 的插件都有；我没有它时设置页永远不出现 |
| `dsh.compatibility` 是少数派 | 只有 8.1% 写 |
| `client.inject` 两种写法都合法 | 包名（`dsh-client-locale` 1162 次）/ 服务名（`slots`，fish-memory、speak-up 都用） |
| 工具注册有两种 API | `defineTool(` 235 次、`ctx.tools.register(` 205 次，都在用 |
| 设置页槽位统一 | `settings.section` 出现在 54 个插件里 |
| 错误处理是常态 | 1100 个文件带 try/catch |
| `agent.followup` 极少人用 | 只有 7 处——说明“AI 自己开口”是少数派功能 |
| 自更新不是标配 | 前 60 里 0 个带 selfupdate |

## 三、直接改到插件里的（可验证）

| 版本 | 改动 | 来源 |
|---|---|---|
| v1.4.3→1.4.4 | 补 `dsh.compatibility`、加 `locale/zh.json` + exports | 目录统计 + archive-manager |
| v1.4.4→1.4.5 | 补 `client.inject: ["slots"]`、`engines.dsh` | fish-memory / speak-up 写法 |
| v1.4.5→1.4.6 | 补 `capabilityRedLines`（四条“我不做什么”） | 目录字段 + 安全边界 |

## 四、进步怎么衡量（我自己评分）

| 维度 | 学之前 | 学之后 |
|---|---|---|
| 知道插件怎么被加载 | 靠猜，改 profile 列表 | 知道 bundle→patch→client 三层 |
| 设置页不出现时 | 乱试 | 先查 `dsh.bundle` 和 `client.inject` |
| 依赖处理 | 写死本机路径 | 知道要“从宿主取、取不到降级” |
| 版本管理 | v1 → v1.4 乱跳 | 四段式，小修 +0.0.1 |
| 学别人代码 | 几乎没读过 | 读了 3094 个文件，抽取了 8 条结论 |

**自评：从“能写出能跑的插件”到“知道插件为什么跑不起来”。** 前者靠试，后者靠读。

## 五、还没学会的（不吹）

- 语义理解：`meme_suggest` 依然会推偏（“加班”推“武汉和平鸟”）
- 贴吧数据：登录态拿不到回复，只读采集卡在风控
- 前端组件：只会用 slots 塞一个 React 面板，复杂交互没写过

## 数据文件

- `studies/catalog.json` 7211 条目录
- `studies/pkgs.json` 3731 条 manifest
- `studies/top50.json` 60 个源码包的特征
- `studies/tmp/` 下载的源码（可删）