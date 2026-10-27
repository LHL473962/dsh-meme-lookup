// HTTP 面板层：/api/meme-panel 路由（设置页 client.js 的数据源）
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { realpathSync } from 'node:fs'
import { openSync, closeSync, statSync as statSync2 } from 'node:fs'
import { renameSync } from 'node:fs'
import { statSync } from 'node:fs'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, delimiter } from 'node:path'
import { fileURLToPath } from 'node:url'
import { copyFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { existsSync as existsSync2, readFileSync as readFileSync2, writeFileSync as writeFileSync2 } from 'node:fs'
import { homedir as homedir2 } from 'node:os'
import {
  USER_LEX_FILE,
  SETTINGS_FILE,
  loadUserLexicon,
  normalizeSettings,
  withFileLock,
  withLexiconLock,
  readBodyBounded,
  writeIfChanged,
  writeFileAtomic,
  looksLikeSecret,
  loadSettings,
  keywords,
  AUTO_LEX,
} from './engine.js'
import {
  loadFeedback,
  loadWeights,
  setWeights,
  recordFeedback,
  rankCandidates,
  MIN_SAMPLES,
  DEFAULT_W,
  DIM_NAMES,
  KEYS,
} from './feedback.js'

export function registerPanel(ctx) {
  // 设置页（client.js）通过这条路由读写：/api/meme-panel/*
  try {
    ctx.effect(() => ctx.webServer.register({
      kind: 'prefix',
      path: '/api/meme-panel',
      handler: async (req, res) => {
        const send = (code, body) => { res.writeHead(code, { 'content-type': 'application/json; charset=utf-8' }); res.end(JSON.stringify(body)) }
        // 学自 dsh-image-gen：同源检查，不让跨站页面读写词表
        { const o = String(req.headers.origin || '')
          if (o) {
            const h = String(req.headers.host || '')
            let same = false
            try { same = new URL(o).host === h } catch { same = false }
            if (!same) return send(403, { ok: false, error: 'origin-rejected' })
          } }
        try {
          const url = new URL(req.url, 'http://127.0.0.1')
          const sub = url.pathname.replace('/api/meme-panel', '') || '/'
          // 学自 dsh-vision-router：请求体设上限，防止被打爆内存
          const readBody = () => readBodyBounded(req)
          if (sub === '/settings' && req.method === 'GET') return send(200, loadSettings())
          if (sub === '/settings' && req.method === 'POST') {
            // 学自 wallpaper-engine：未知键要回报，静默忽略和“写丢了”分不清
            const patch = await readBody()
            const KNOWN = ['tendency', 'density', 'allowRisky', 'autoUpdate', 'persona']
            const ignored = Object.keys(patch || {}).filter((k) => !KNOWN.includes(k))
            const cur = normalizeSettings({ ...loadSettings(), ...patch })
            withFileLock(SETTINGS_FILE, () => writeIfChanged(SETTINGS_FILE, JSON.stringify(cur, null, 2)))
            return send(200, ignored.length ? { ...cur, ignored } : cur)
          }
          if (sub === '/userlex' && req.method === 'GET') {
            let list = []
            try { list = JSON.parse(readFileSync(USER_LEX_FILE, 'utf8')) || [] } catch {}
            return send(200, { items: list })
          }
          if (sub === '/userlex' && req.method === 'POST') {
            // 学自 workspace-upload：只收白名单字段（strict），多出来的键回报而不是默默写进库
            const body = await readBody()
            if (!body.title) return send(400, { ok: false, error: 'EMPTY_TITLE', hint: '梗名必填' })
            if (looksLikeSecret(body.title)) return send(400, { ok: false, error: 'SECRET_LIKE_TITLE', hint: '这条看起来像密钥，不会存进词库' })
            const ENTRY_KEYS = ['title', 'meaning', 'usage', 'avoid', 'tone', 'example', 'source', 'sourceType', 'variants', 'visibility', 'kind']
            const ignored = Object.keys(body || {}).filter((k) => !ENTRY_KEYS.includes(k))
            const e = {}
            for (const k of ENTRY_KEYS) if (body[k] !== undefined) e[k] = body[k]
            let list = []
            withLexiconLock(() => {
              try { list = JSON.parse(readFileSync(USER_LEX_FILE, 'utf8')) || [] } catch {}
              const idx = list.findIndex((x) => x.title === e.title)
              const row = { ...e, addedAt: new Date().toISOString(), review: e.visibility === 'public' ? 'pending' : 'private' }
              if (idx >= 0) list[idx] = row; else list.push(row)
              writeFileAtomic(USER_LEX_FILE, JSON.stringify(list, null, 2))
            })
            loadUserLexicon()
            return send(200, ignored.length ? { ok: true, total: list.length, ignored } : { ok: true, total: list.length })
          }
          if (sub === '/userlex' && req.method === 'DELETE') {
            const idx = Number(url.searchParams.get('id'))
            let list = []
            try { list = JSON.parse(readFileSync(USER_LEX_FILE, 'utf8')) || [] } catch {}
            if (idx >= 0) list.splice(idx, 1)
            writeFileAtomic(USER_LEX_FILE, JSON.stringify(list, null, 2))
            return send(200, { ok: true, total: list.length })
          }
          // ---- 相关度反馈 + 权重（v1.7.0）----
          if (sub === '/feedback' && req.method === 'GET') {
            const st = loadWeights()
            return send(200, {
              ok: true,
              items: loadFeedback().items.slice(-20).reverse(),
              weights: st.w, locked: st.locked, samples: st.samples,
              lastLearnedAt: st.lastLearnedAt, minSamples: MIN_SAMPLES, dims: DIM_NAMES,
            })
          }
          if (sub === '/feedback' && req.method === 'POST') {
            const body = (await readBody()) || {}
            const KNOWN = ['query', 'slug', 'title', 'grade', 'note']
            const ignored = Object.keys(body).filter((k) => !KNOWN.includes(k))
            const r = recordFeedback(body)
            return send(r.ok ? 200 : 400, { ...r, ignored })
          }
          if (sub === '/weights' && req.method === 'GET') {
            const st = loadWeights()
            return send(200, { ok: true, ...st, defaults: DEFAULT_W, dims: DIM_NAMES, keys: KEYS, minSamples: MIN_SAMPLES })
          }
          if (sub === '/weights' && req.method === 'POST') {
            // 未知键回报，不静默丢（同 /settings 的规矩；顶层与 w/locked 内部都算）
            const body = (await readBody()) || {}
            const topIgnored = Object.keys(body).filter((k) => !['w', 'locked'].includes(k))
            const { state, ignored } = setWeights(body.w, body.locked)
            return send(200, { ok: true, ...state, ignored: [...topIgnored, ...ignored] })
          }
          if (sub === '/rank' && req.method === 'POST') {
            // 面板「查一个词 → 列候选 → 打三档」用；只读本地词表，不发网络请求
            const body = (await readBody()) || {}
            const q = String(body.q || '').trim()
            if (!q) return send(400, { ok: false, error: 'EMPTY_QUERY', hint: '给 q' })
            const qs = keywords(q, 8)
            const cands = AUTO_LEX.filter((e) => e && e.title && qs.some((w) => String(e.title).includes(w))).slice(0, 300)
            const st = loadWeights()
            const top = rankCandidates(q, cands, st.w).filter((x) => x.score > 0).slice(0, 3).map((x) => ({
              title: x.item.title,
              slug: x.item.slug || null,
              tags: (x.item.tags_raw || []).slice(0, 3),
              feats: x.feats,
              score: x.score,
            }))
            return send(200, { ok: true, query: q, candidates: top, weights: st.w })
          }
          return send(404, { ok: false, error: 'NOT_FOUND' })
        } catch (e) { return send(500, { ok: false, error: String((e && e.message) || e) }) }
      },
    }), 'meme-panel: /api/meme-panel 路由')
  } catch (e) { /* 路由挂不上不影响工具 */ }
}
