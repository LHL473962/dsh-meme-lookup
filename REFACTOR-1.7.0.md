# v1.7.0：相关度反馈面板 + 5 维权重在线学习

> 2026-10-28，创造模式鱼书。规格：`mail/yushu/20261028-0013-反馈面板需求.md`。

## 一、三档标签

| 面板 | 内部值 | 含义 | 学习目标 |
|---|---|---|---|
| 对 | `ok` | 正是我要的 | y=1 |
| 错 | `off` | 不相干 | y=0 |
| 义偏 | `sense` | 是这梗但意思不对 | y=0.5 |

## 二、5 维特征与权重

| 维度 | 特征 | 默认权重 |
|---|---|---|
| `kw` 关键词 | 命中词长 / 查询词长（封顶 1） | 1.0 |
| `tag` 标签 | 命中标签数 / 3 | 1.0 |
| `heat` 热度 | log10(播放+1) / 7 | 1.0 |
| `fresh` 时效 | 未过期 1 / 过期 0 | 1.0 |
| `prov` 出处 | complete 1 / partial 0.5 / missing 0 | 1.0 |

`score = Σ wᵢxᵢ − 离题惩罚`（游戏/动画梗在非对应语境里 −0.5，惩罚不参与学习）。

## 三、学习

- 在线 logistic：`p=sigmoid(Σwx)`，`wᵢ += 0.05·(y−p)·xᵢ`，clamp 0–3，保留两位小数
- 样本 < 20 只记录、不动权重；锁定的维度不更新（回写锁定值）
- 每次学习更新 `lastLearnedAt`

## 四、存储（writeIfChanged + 文件锁）

- `~/.dsh/meme-feedback.json`：`{version:1, items:[{ts,query,slug,title,grade,note,feats,score}]}`，上限 5000
- `~/.dsh/meme-weights.json`：`{version:1, w, locked, samples, lastLearnedAt}`

## 五、接口

- 工具 `meme_feedback`：`{query, slug?, title?, grade, note?}`（JSON Schema 原生 object）
- `GET /api/meme-panel/feedback`：最近 20 条 + 权重 + samples
- `POST /api/meme-panel/feedback`：记一条
- `GET /api/meme-panel/weights` / `POST /weights`：读 / 改权重（未知键回报 `ignored`，含顶层键，范围 0–3）
- `POST /api/meme-panel/rank`：面板「查一个词」用，只读本地词表，返回 top3 候选 + 特征

都沿用同源校验、32KB 体上限。

## 六、面板

设置 → 梗 里新增两块：

1. **相关度反馈**：输入词 → 查候选（显示分数/标签）→ 对/错/义偏；下面列最近 5 条
2. **相关度权重**：5 个 0–3 滑块 + 锁定勾选，显示样本数 / 上次学习时间 / 保存

## 七、自检（12 → 14 项）

1. **反馈写入**：写一条 → 文件里字段齐全、条数 +1、不超 5000；跑完恢复权重（自检不污染学习）
2. **权重生效**：固定夹具，`kw` 1.0→0.1 时排序必须翻转；再经落盘权重验一次，证明权重真的接进打分

## 八、取舍

- `fresh` 用 `updated_at`（一年内算新鲜）或 `tier` 判断，不额外发网络请求
- `/rank` 只读本地词表（AUTO_LEX），不保证覆盖全网；面板是调整器，不是查询器
- 学习样本来自反馈文件；删掉 `meme-feedback.json` 不会回滚权重（权重在另一个文件）
