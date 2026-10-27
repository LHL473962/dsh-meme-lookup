# v1.6.2：SKIP 分支可复现 + 404 单独归类

> 2026-10-27，创造模式鱼书。1.6.1 的 SKIP 分支当时是临时脚本模拟的，别人没法复现；
> 另外 404（词条被删）被归进 HTTP_ERROR，和限流混在一起。

## 一、`--simulate` 正式参数

```bash
node tests/selftest.mjs --simulate=429      # 限流
node tests/selftest.mjs --simulate=500      # 上游 5xx
node tests/selftest.mjs --simulate=offline  # 网络断
node tests/selftest.mjs --simulate=404      # 词条被删
```

- 只拦 `cnmeme.wiki` 的 fetch，独立面板探测和其它请求走真实网络
- 报告头会写一行「模拟：--simulate=429（只影响 cnmeme.wiki）」，一眼能看出不是真跑
- 报告路径参数同时修好：`--simulate=429` 不会再被当成输出文件名

## 二、404 → `ENTRY_GONE`

`getJson` 仍然把 4xx 标成 `HTTP_ERROR`，但 coach 详情阶段拿到 `404` 时改返回：

```js
{ ok: false, error: 'ENTRY_GONE', hint: '词条详情 404（可能被删/改名），本地词表该更新了' }
```

判定表：

| 情况 | code | 自检 |
|---|---|---|
| 429 限流 | `RATE_LIMITED` | SKIP |
| 5xx / 网络断 / JSON 坏 | `UPSTREAM_ERROR` | SKIP |
| 详情 404（词条被删/改名） | `ENTRY_GONE` | **FAIL**（数据问题） |
| 其它 4xx | `HTTP_ERROR` | **FAIL** |
| 本地有命中但详情拉不到 | 原错误码 | SKIP |
| 真没收录 | `UNKNOWN`（ok:true） | **FAIL**（已知梗判定） |

## 三、验证

| 命令 | 结果 |
|---|---|
| 正常 | 12 通过 / 0 跳过 / 0 失败，退出码 0 |
| `--simulate=429` | 10 通过 / 2 跳过 / 0 失败，退出码 0 |
| `--simulate=500` | 10 通过 / 2 跳过 / 0 失败，退出码 0 |
| `--simulate=offline` | 10 通过 / 2 跳过 / 0 失败，退出码 0 |
| `--simulate=404` | 1 失败（已知梗判定：ENTRY_GONE），退出码 1 |

**404 故意不 SKIP**：词表/上游数据变了要修，不能靠跳过混过去。
