# dsh-meme-lookup

给 DeepSeek Harness 装的「梗」插件：**查梗、看懂梗、判断能不能用、接梗、主动抛梗**。

> 数据源：cnmeme.wiki 公开 API + B 站公开接口。所有判定都带证据，查不到就明说查不到。

> 仓库：https://github.com/LHL473962/dsh-meme-lookup

## 工具（13 个，下面是常用的 6 个）

| 工具 | 作用 |
|---|---|
| `meme_lookup` | 查梗：关键词 / 精确条目 / 标签过滤 / 分页 |
| `meme_understand` | 看懂：图片 OCR / B 站视频抽帧 OCR → 提词 → 找候选 |
| `meme_coach` | 判定：是什么 / 出处 / 能不能用 / 怎么用 / 风险 / 时效 |
| `meme_chat` | 读一句话：哪些是梗、什么语境、该不该用梗回 |
| `meme_suggest` | 主动抛梗：只推对方大概率认识、还没过时的 |
| `meme_feedback` | 相关度反馈：对 / 错 / 义偏，喂给 5 维权重在线学习 |

## 词表规模

- **6673 条**全库抓取（`lexicon_all.json`），出处完整 6619 条
- **1894 条**弹幕高频短语（`lexicon_danmaku.json`），扫了 160 条热门视频的弹幕
  > 这批反映「此刻正在被使用」，比词条库新；出处缺失，所以只做识别不做盖章
- 35 条手写四档词表
- 8 条句式模板（`patterns.json`）
- 8 组「避审脏话」映射（evasion.json）：尼玛→你妈、卧槽→我操、sbxs→傻逼、淦→干…
  > 识别为主、不推；level 3 的脏话一律不接。换个写法不改变它是脏话。
- 17 个 emoji 映射 + 手写变体（`variants.json`）：`🧊🧊🧊` = 「冰冰冰」
- 4 组自我标注梗（`reaction_map.json`）：讲冷笑话贴关西喵、耍聪明贴爱因斯坦、赌一把贴宿傩、算计贴夜神月

## 判定链

```
识别（1041 条自动词表 + 35 条手写 + 8 条句式模板）
  → 档位 live / fading / common / slang
  → 出处 complete / partial / missing
  → 风险标签 18 个
  → 热度 broad / medium / narrow / niche（源视频播放量）
  → 时效 fresh / usable / stale（B 站搜索最近使用 + 品类半衰期 + 易用性）
  → 语境 正事 / 调侃 / 讽刺 / 情绪
  → 输出策略
```

## 三条硬规则

1. **没出处不盖章**：provenance=missing 永不给 verdict，只出「日常语·无出处」小药丸。
2. **别名不算证据**：别名命中封顶 79 分，只能进备选。
3. **陈年老梗不抛**：时效 stale 强制降档，且永不主动推荐。

## 云端更新（不依赖 B 站插件）

`meme_sync` 用 `git clone --depth 1` 拉本仓库，合并词表；没有 B 站插件也能更新。
仓库里 `lexicon_danmaku.json` / `lexicon_all.json` 就是云端词库本体。

## 设置页（内置）

插件带 `client.js`，在 DSH 的 **设置 → 梗** 里有一页：玩梗开关 + 记一句 + 我的词条。
改完重启 DSH 生效（client bundle 在启动时加载）。

## 独立面板（备用）

不重启也能用：`node tools/panel.mjs` → http://127.0.0.1:8797/

- `meme_settings`：玩梗倾向（稳重/正常/活泛）、浓度（0~3）、是否允许慎用级、是否自动更新
- `meme_add`：用户手动加梗（含义/用法/别用场景/语气/示例/出处/变体），存 `~/.dsh/meme-user-lexicon.json`

## 安装

1. 把本目录拷到 `<profile>/node_modules/dsh-meme-lookup/`
2. 在 `cordis.patch.yml` 加：

```yaml
- insert:
    - id: meme-lookup
      name: 'dsh-meme-lookup'
```

3. 重启 DSH

## 依赖

- OCR 用 [winocr](https://pypi.org/project/winocr/)（Windows 自带 OCR，需中文语言包）
- 抽帧用 ffmpeg（imageio-ffmpeg 自带）
- 可选：`~/.dsh/meme-suggest.json` 配模型重排（关掉也能用，只是主动抛梗会退化为本地排序）

## 数据文件

| 文件 | 作用 |
|---|---|
| `lexicon.json` | 手写词表（35 条，四档） |
| `lexicon_auto.json` | 自动词表（1041 条，抓自梗库） |
| `lexicon_tags.json` | 标签白名单 + 脏数据黑名单 |
| `tiers_review.json` | 人工复核（覆盖自动档位） |
| `aliases.json` | 别名表 |
| `patterns.json` | 句式模板 |
| `heat_index.json` | 离线热度（2023 条播放量） |

## 已知局限

- 词表外的新梗认不出（靠人补）
- 反讽靠关键词，遇到真诚夸奖会误判
- 热度用的是源视频播放量，不等于「现在还有人认识」
- 主动抛梗要模型重排才准，纯本地排序会跑题

## 许可

MIT