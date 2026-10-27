# v1.6.3：ENTRY_GONE 单次 WARN + 模拟矩阵进文档

> 2026-10-27，创造模式鱼书。两条来自标准模式的建议：
> 404 真实网络上也会偶发（词条真被删），一次就把 CI 打红不合理；
> `--simulate` 的预期退出码要能查表。

## 一、ENTRY_GONE 单次 WARN，连续 N 天才 FAIL

- 状态文件：`~/.dsh/meme-selftest-state.json`（`{ entryGone: ['YYYY-MM-DD', …] }`）
- 每次命中 `ENTRY_GONE` 记当天日期，算「连续到今天」的天数
- 天数 ≥ `--entry-gone-streak`（默认 3）→ **FAIL**；否则 **WARN**
- 详情正常返回时自动清零
- `--simulate=404` **不写状态**，永远按第 1 天算（可重复、无副作用）

WARN 是独立状态：不算通过、不算跳过，报告头单独计数（`通过/跳过/警告/失败`），
退出码只看 FAIL。

## 二、模拟矩阵进 TESTING

| 命令 | 预期 | 退出码 |
|---|---|---|
| 无参数 | 12/0/0/0 | 0 |
| `--simulate=429` | 10/2/0/0 | 0 |
| `--simulate=500` | 10/2/0/0 | 0 |
| `--simulate=offline` | 10/2/0/0 | 0 |
| `--simulate=404` | 10/1/1/0（WARN） | 0 |
| `--simulate=404 --entry-gone-streak=1` | 10/1/0/1（FAIL） | 1 |

## 三、验证

- 六行矩阵全部按表跑通（见 TESTING.md）
- 默认模拟不写 `meme-selftest-state.json`（跑完确认文件不存在）
- 连续计数用测试开关验过：
  预置前两天日期 → `--simulate=404 --entry-gone-use-state` →
  `已连续 3 天` **FAIL**、状态文件写入 3 天；接着正常跑一次 → PASS 且状态文件清成 `{}`
- `--entry-gone-use-state` 只给测试用：让模拟 404 也走真实状态文件；
  默认模拟不落盘，保证 CI 可重复
- 源码与 junction 安装路径均正常

## 四、取舍

- `ENTRY_GONE` 连续计数依赖本机状态文件：换机器/清 `~/.dsh` 会重新从第 1 天算。
  这是有意的——跨机器共享计数需要远端存储，为一条自检不值。
- `--entry-gone-streak` 是测试阈值，不是业务配置；CI 想更严就传 1。
