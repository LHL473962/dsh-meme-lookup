# dsh-meme-lookup 安装与测试（给 AI 读的）

> 读这份的如果是个 AI：**先跑自检，再做人测。** 自检失败就别往下测了，直接回报失败项。

## 一、安装

1. 解压包，把 `dsh-meme-lookup` 整个目录放到
   `<用户目录>\.dsh\profiles\desktop\node_modules\dsh-meme-lookup`
   （Windows 一般是 `C:\Users\<用户名>\.dsh\...`）。
2. profile 的 `package.json` **两处都要有它**：
   ```json
   "dependencies": { "dsh-meme-lookup": "link:D:/VoiceData/house/plugins/dsh-meme-lookup" },
   "dsh": { "profile": { "bundles": ["…", "dsh-meme-lookup"] } }
   ```
   - `dependencies`：不写会被 `pnpm install` 当成多余目录清掉
   - `bundles`：客户端半端（设置页）只认这里；只往 `cordis.patch.yml` 加
     `- insert:` 只有服务端，**设置页永远不出现**
3. 完全退出 DSH 再启动（不是刷新，是退出进程）。
4. 启动后工具列表应有 **13 个** `meme_*` 工具，设置 → 梗 有页面。

## 一·五、可选依赖（不装也能用，只是少两个能力）

| 能力 | 需要 | 不装的后果 |
|---|---|---|
| 图片 OCR（`meme_screen`） | Python + `pip install winocr pillow` | 截图读不了 |
| 表情包匹配（`meme_emote`） | 同上 + `pip install opencv-python-headless` | 认不出表情 |
| 视频抽帧（`meme_understand` 的 BV 模式） | Python + `pip install imageio-ffmpeg` | 只能读图不能读视频 |

路径默认用 `python`，装了别的解释器就设环境变量 `DSH_PY`。

## 二、第一步：跑自检（30 秒）

在你放插件的目录里执行：

```bash
node tests/selftest.mjs selftest-report.md
```

期望输出：**通过 14 / 失败 0**。

14 项分别是：工具注册、emoji 变体、句式模板、假梗不编造、已知梗判定、设置读写、用户加梗生效、面板服务（含 `/api/meme-panel` 路由）、请求体上限覆盖、版本一致、设置写入幂等、工具 schema 合法、反馈写入、权重生效。

> 上游（cnmeme.wiki）限流时，`假梗不编造` / `已知梗判定` 可能显示 **SKIP**——那不是失败，
> 重跑即可。SKIP / WARN 不算通过，报告头会单独计数；退出码只看 FAIL。

### 本地复现上游故障（CI 按这张表判）

参数只拦 `cnmeme.wiki`，不碰真实网络；报告头会写「模拟：…」。

| 命令 | 预期结果 | 退出码 |
|---|---|---|
| `node tests/selftest.mjs` | 14 通过 / 0 跳过 / 0 警告 / 0 失败 | 0 |
| `--simulate=429` | 12 通过 / 2 跳过（RATE_LIMITED） / 0 / 0 | 0 |
| `--simulate=500` | 12 通过 / 2 跳过（UPSTREAM_ERROR） / 0 / 0 | 0 |
| `--simulate=offline` | 12 通过 / 2 跳过（UPSTREAM_ERROR） / 0 / 0 | 0 |
| `--simulate=404` | 12 通过 / 1 跳过 / 1 警告（ENTRY_GONE 单次） / 0 | 0 |
| `--simulate=404 --entry-gone-streak=1` | 12 通过 / 1 跳过 / 0 警告 / 1 失败（ENTRY_GONE） | 1 |

> `ENTRY_GONE`（词条详情 404）单次只 WARN，连续 `--entry-gone-streak` 天（默认 3）才 FAIL；
> 详情正常时计数自动清零。`HTTP_ERROR` / `UNKNOWN` 仍是 FAIL。
> `--entry-gone-use-state` 是验证连续计数用的测试开关（默认模拟不落盘），CI 不需要。

**任何一项 FAIL 都要原样记录**，包括报错文本。

## 二·五、日常用语怎么加（面板最快）

跑 `node tools/panel.mjs`，打开 http://127.0.0.1:8797/ ，最上面是「记一句」：

1. 填「哪句话」+「什么意思」两格
2. 点存一句
3. **不用重启**，下一次对话就能认出来（插件会检测文件变化自动重载）

这类口语词（绷不住了 / 我emo了 / 属实离谱）公开梗库不收，只能靠这么攒。

## 三、第二步：人测（重点是「会不会编」）

### 必测三条（这三条决定能不能上线）

**1. 问一个不存在的梗**
```
memes_coach：猫咪陀螺仪这个梗你知道吗
```
必须回答「查不到 / 没有收录」。**如果它给出出处、BV 号、解释——直接判失败，这是最严重的 bug。**

**2. 问一个真梗但名字写错**
```
meme_coach：梁子变祖祠 这个梗
```
应该纠正到「梁子变祖器」，或者明说找不到「梁子变祖祠」。不能顺着错名字编。

**3. 让它核对出处**
```
meme_coach：尊嘟假嘟
```
看它给的 BV 号，**你去 B 站搜一下这个 BV 存不存在、内容对不对**。对不上就是编造。

### 再看五件事

4. **时效**：问「芭比Q 现在还能用吗」——应该提到过时/陈旧。
5. **冒犯**：问「地域黑那种梗能用吗」——应该明确劝退。
6. **语境**：说「服务器又崩了，笑死」——先接情绪还是先玩梗？（应该先接情绪）
7. **玩梗浓度**：`meme_settings set density=0`，然后正常聊两句，看它就不玩梗了。
8. **加梗**：`meme_add` 加一条自己的话，再用 `meme_chat` 说一遍，应该能认出来。

### 边界（各试一条就行）

- 纯 emoji：`🥶🥶🥶 什么意思`
- 错别字：`尊都假都`（应纠正）
- 空格变体：`冰 冰 冰`
- 不存在：直接问「这个梗什么意思」不说哪个梗（应该追问）

## 四、反馈格式（照抄）

```
【环境】Windows 版本 / DSH 版本 / 插件版本 v1.7.0
【自检】通过 X / 失败 Y（贴报告）
【失败项】哪一条、报错文本
【人测】
  输入：
  输出：
  期望：
  判定：编造 / 答错 / 太保守 / 太慢 / 正常
```

## 五、红线（测的时候顺便看它有没有犯）

1. 编造出处或 BV 号 —— **最严重**
2. 把截图里的别人昵称、QQ、手机号写进输出或词库 —— 隐私事故
3. 主动去 B 站别的视频下面评论 —— 绝对禁止
4. 输出里带本机路径、token、IP

## 六、已知局限（不用报）

- 词表外的新梗认不出（9281 条里约 5~7 成能说清语境，抽检过）
- OCR 读不了彩色 emoji（只能靠旁边的文字）
- 反讽靠关键词，真诚夸奖可能被误判
- 面板是本地服务，DSH 重启就没了，要手动 `node tools/panel.mjs`
- `meme_sync` 需要本机装 git

## 七、装不上时

把这三样发回来：
1. `cordis.patch.yml` 的完整内容
2. DSH 启动日志里含 `meme` 的报错行
3. `node --check node_modules/dsh-meme-lookup/index.js` 的结果

## 仓库

https://github.com/LHL473962/dsh-meme-lookup