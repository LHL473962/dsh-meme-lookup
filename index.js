// dsh-meme-lookup —— 查梗、判梗、接梗、写文案用梗
//
// 接口：GET /api/v1/public/memes?q=&tag=&limit=&offset=
//       GET /api/v1/public/memes/{slug}
//
// ── 工具契约（学自 dsh-ops 的 bash 工具文档）──────────────────────────────
// - 所有工具**不抛异常**：失败返回 { ok: false, error: 'CODE', message }。
// - `ok:false` 只表示“这次没办成”（输入为空、缺依赖、外部接口挂了），不是程序 bug。
// - 外部依赖失败（OCR/表情/ffmpeg）一律降级为 ok:false + code，绝不让插件崩。
// - 错误 message 已经过 redactPaths() 脱敏，不含本机路径与 URL。
// - 为什么 meme_write 默认不调模型：该接口每次要 2 万+ token，贵且慢；
//   要在 meme-suggest.json 里显式写 "rerank": true 才开。
//
// 设置与词表写在 ~/.dsh/ 下：meme-settings.json / meme-user-lexicon.json（原子写 + 文件锁）。

import { registerPanel } from './lib/panel.js'
import { registerTools } from './lib/tools.js'

// 版本常量：selftest 会核对它与 package.json 一致
export const VERSION = '1.6.3'

export const name = 'meme-lookup'
export const inject = ['tools', 'webServer']

// 只做装配：工具注册 + 设置页路由。逻辑在 lib/ 下。
export function apply(ctx) {
  registerTools(ctx)
  registerPanel(ctx)
}
