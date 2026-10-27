# v1.6.1：拆工具层 + 给自检加 SKIP

> 2026-10-27，创造模式鱼书。两件事：`lib/tools.js` 51KB 贴截断线；
> 「已知梗判定」只断言 verdict 非空，限流一多就变成永远绿的摆设。

## 一、工具层拆成 core / text

`lib/tools.js` 979 行 / 51KB → 三个文件：

| 文件 | 工具 | 大小 |
|---|---|---|
| `lib/tools-core.js` | lookup / understand / screen / emote / sync | ~12.7KB |
| `lib/tools-text.js` | coach / chat / suggest / write / persona / settings / add | ~39.9KB |
| `lib/tools.js` | 聚合入口，只调两个 register | ~0.3KB |

`index.js` 不用改，仍 `import { registerTools } from './lib/tools.js'`。

**请求体上限检查**同步改成递归扫 `lib/`（以后即使再分层也扫得到），
现在报告 8 个文件 / 1 处有上限。第一次拆完显示「0 处都有上限」的坑不会再犯。

## 二、上游失败有 code 了

以前 `getJson` 抛 `HTTP_xxx`，`searchOne` 一 `catch { return [] }`，调用方分不清
「没收录」和「限流/上游挂了」，coach 只能返回 `UNKNOWN`。

现在：

- `lib/net.js` 给错误打码：429 → `RATE_LIMITED`；5xx / 网络错 / JSON 坏 → `UPSTREAM_ERROR`；其它 4xx → `HTTP_ERROR`
- `lib/engine.js` 新增 `searchOneStrict()`（不吞错），`searchOne()` 保留给旧调用
- `meme_coach`：两处上游失败都会冒泡，不再伪装成「查不到」——
  - 搜索阶段：`searchOneStrict` 抛错且本地没命中 → `{ ok:false, error }`
  - 详情阶段：`/memes/{slug}` 拉不到 → 出处会变成 `missing`，这时也返回 `{ ok:false, error }`，
    因为「没抓到」不等于「没出处」

## 三、自检：SKIP 是独立状态

- `已知梗判定`：上游报 `RATE_LIMITED` / `UPSTREAM_ERROR` → **SKIP**；
  其余 `UNKNOWN` 一律 **FAIL**；必须给出 `USE_WITH_CARE` / `USABLE` 之类的正面判定
- `假梗不编造`：上游故障同样 SKIP（否则「查不到」会被当成「不编造」的证据）
- 报告头变成 `通过 X / 跳过 Y / 失败 Z`，退出码只看 FAIL
- `已知梗判定` 现在只允许因上游故障跳过，不会因为限流长期假绿

## 验证

- 源码自检：12 项全 PASS（或上游故障时 SKIP，不冒充 PASS）
- 经 junction 安装路径再跑一遍
- 模拟 429：`已知梗判定` / `假梗不编造` 显示 SKIP，其余 PASS，退出码 0
