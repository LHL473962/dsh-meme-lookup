// 工具层入口：core + text 两组都挂到 ctx 上（index.js 只认这个）
import { registerCoreTools } from './tools-core.js'
import { registerTextTools } from './tools-text.js'

export function registerTools(ctx) {
  registerCoreTools(ctx)
  registerTextTools(ctx)
}
