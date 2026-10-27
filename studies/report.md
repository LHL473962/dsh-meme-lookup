# 全量插件调研（7211 在册 / 3731 npm 命中）

日期：2026-10-27｜数据：awesome-dsh-plugin.com 目录 + npm registry 最新版 package.json

## 一、目录规模

| 项 | 数 |
|---|---|
| 在册插件 | **7211** |
| 带 npm 包名 | 3731 |
| 总 star | 569,425 |

分类前十二：ui 1401、tools 952、session 505、dev 457、workflow 404、model 387、usage 380、memory 313、theme 289、skill 263、notify 262、fun 222。

能力申报（说明宿主允许什么）：fs-read 4750、network 3761、env 3761、fs-write 3734、shell 2465、credentials 708、llm 606、host-runtime 459、dynamic-code 352、subagent 153。

## 二、manifest 字段普及率（3731 个包）

| 字段 | 有 | 占比 |
|---|---|---|
| `dsh` | 3723 | 99.8% |
| `dsh.bundle` | 3720 | 99.7% |
| `dsh.client` | 2839 | 76.1% |
| `dsh.compatibility` | 301 | 8.1% |
| `engines.dsh` | 233 | 6.2% |

**结论：bundle 是硬要求；compatibility 很少人写，属于加分项不是必需。**

## 三、client.inject 都在注入什么

| 注入项 | 次数 |
|---|---|
| dsh-client-locale | 1162 |
| dsh-client-ui-settings | 863 |
| dsh-client-ui-conversation | 667 |
| dsh-client-runtime | 577 |
| dsh-client-ui-slots | 537 |
| dsh-client-connection | 411 |
| dsh-client-ui-renderer | 335 |
| dsh-api-remotes | 309 |

注意：本地装的两个插件（fish-memory、speak-up）注入的是 **`slots`** 这个服务名，不是包名——说明两种写法都存在，`slots` 是本地服务别名。

## 四、exports 习惯

| 入口 | 次数 |
|---|---|
| `.` | 3543 |
| `./package.json` | 3295 |
| `./client` | 2842 |
| `./cordis.patch.yml` | 1121 |
| `./locale/*.json` | 580 |
| `./icon` | 256 |

## 五、版本区间习惯

出现最多的写法：`>=0.2.0-rc.2`（60）、`>=0.2.1-rc.2`（49）、`>=0.2.1-0 <0.3.0`（48）、`>=0.1.7-rc.2`（37）。

## 六、对 dsh-meme-lookup 的改动（v1.4.5）

| 项 | 改前 | 改后 |
|---|---|---|
| `dsh.client.inject` | 未声明 | `["slots"]`（对齐 fish-memory / speak-up） |
| `engines.dsh` | 未声明 | `>=0.2.0-rc.2` |
| `compatibility` | 无 | 已有（少数派写法，保留） |
| `locale` | 无 | 已加 + exports |

## 七、还没学但值得学的

- 星最多的前 50 个插件的 `lib/` 实现（工具定义方式、错误处理、降级链）
- `capabilityRedLines` 字段（目录里有，说明插件主动声明“我不做什么”）
- 带 `./icon` 导出的 256 个插件——说明插件市场会读图标

## 数据文件

- `studies/catalog.json`（7211 条目录）
- `studies/pkgs.json`（3731 条 npm 元数据）