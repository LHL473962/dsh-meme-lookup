// 工具层 A：查梗 / 看懂 / 截图 / 表情 / 同步（从 lib/tools.js 拆出，v1.6.1）
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
import { API, getJson } from './net.js'
import {
  _pkgDir,
  findExecutable,
  PY,
  OCR_PYEXE,
  run,
  ffmpegPath,
  ocrImage,
  keywords,
  searchOne,
  pluginDir,
  AUTO_LEX,
  STOP_WORDS,
  detectPatterns,
  detectReactionScene,
  detectMemes,
  redactPaths,
  failWithHint
} from './engine.js'

// 本地检索：先在 6673 条词表里找，不要全押远程（学自外部实测：q= 召回 2/10）
function localIndexMatches(q, limit) {
  const Q = String(q || '').trim().toLowerCase()
  if (!Q) return []
  const exact = []
  const scored = []
  for (const e of AUTO_LEX) {
    const title = String(e.title || '')
    if (!title) continue
    if (STOP_WORDS && STOP_WORDS.has(title)) continue
    const t = title.toLowerCase()
    const aliases = Array.isArray(e.aliases) ? e.aliases.map((x) => String(x).toLowerCase()) : []
    if (t === Q || aliases.includes(Q)) { exact.push(e); continue }
    let sc = 0
    if (t.includes(Q)) sc = 80 + Math.min(Q.length, 6)
    else if (Q.includes(t) && t.length >= 2) sc = 60 + t.length
    else {
      let hit = 0
      for (let i = 0; i < Q.length - 1; i++) { const bg = Q.slice(i, i + 2); if (t.includes(bg)) hit++ }
      if (hit) sc = hit * 6
    }
    if (sc > 0) scored.push({ e, sc })
  }
  scored.sort((a, b) => b.sc - a.sc)
  const out = exact.slice(0, limit)
  for (const s of scored) { if (out.length >= limit) break; if (!out.some((x) => x.slug === s.e.slug)) out.push(s.e) }
  return out
}

function localCard(e) {
  return { title: e.title, slug: e.slug, tags: e.tags_raw || [], provenance: e.provenance || 'missing', source: 'local' }
}
const textOutput = {
  schema: { type: 'object', properties: {}, additionalProperties: true },
  render: (_args, value) => [{
    type: 'text',
    text: typeof value === 'string' ? value : JSON.stringify(value, null, 2),
  }],
}

const clip = (s, n = 400) => (typeof s === 'string' && s.length > n ? s.slice(0, n) + '…' : s)

export function registerCoreTools(ctx) {
  // 学自 dsh-tools：参数必须是 JSON Schema（{type:object,properties}），扁平 map 会被 provider 拒
  const registerTool = (def) => {
    if (def && def.parameters && def.parameters.type !== 'object') {
      def.parameters = { type: 'object', properties: def.parameters, additionalProperties: false }
    }
    return ctx.tools.register(def)
  }
  registerTool({
    name: 'meme_lookup',
    description: '查梗：给关键词返回标题/摘要/标签/出处 BV 号；给 slug 返回完整条目。数据来自 cnmeme.wiki 公开库，实时请求。',
    parameters: {
      q: { type: 'string', description: '关键词（与 slug 二选一）' },
      slug: { type: 'string', description: '精确条目名，拿到完整详情（与 q 二选一）' },
      tag: { type: 'string', description: '按标签过滤，例如 动物梗 / 图像梗 / 表情包' },
      limit: { type: 'number', description: '返回几条，默认 5，最多 20' },
      offset: { type: 'number', description: '分页偏移，默认 0' },
    },
    output: textOutput,
    async execute(args) {
      try {
        if (args && args.slug) {
          const raw = await getJson(API + '/memes/' + encodeURIComponent(String(args.slug)))
          const d = raw.item || raw
          return {
            ok: true,
            mode: 'detail',
            slug: d.slug,
            title: d.title,
            summary: clip(d.summary, 1200),
            tags: d.tags,
            cover_url: d.cover_url,
            updated_at: d.updated_at,
            source_video: d.source_video || null,
          }
        }
        const q = String((args && args.q) || '').trim()
        const tag = String((args && args.tag) || '').trim()
        if (!q && !tag) return { ok: false, error: 'EMPTY_QUERY', hint: '给 q（关键词）、tag（标签）或 slug（条目名），至少一个' }
        const n = Math.min(Math.max(Number(args.limit) || 5, 1), 20)
        const off = Math.max(Number(args.offset) || 0, 0)
        // 先查本地词表：命中就不必打网络
        if (q && !tag) {
          const local = localIndexMatches(q, n)
          if (local.length) {
            const first = local[0]
            if (first.slug) {
              try {
                const raw = await getJson(API + '/memes/' + encodeURIComponent(String(first.slug)))
                const d = raw.item || raw
                return {
                  ok: true,
                  mode: 'detail',
                  match: 'local-exact',
                  slug: d.slug || first.slug,
                  title: d.title || first.title,
                  summary: clip(d.summary, 1200),
                  tags: d.tags || first.tags_raw || [],
                  source_video: d.source_video || null,
                }
              } catch (err) {
                // 远程挂了也不让本地条目消失
                return {
                  ok: true,
                  mode: 'detail',
                  match: 'local-only',
                  degraded: (err && err.code) || 'UPSTREAM_ERROR',
                  slug: first.slug,
                  title: first.title,
                  summary: first.meaning || '',
                  tags: first.tags_raw || [],
                  hint: '远程详情不可用，只返回本地词条',
                }
              }
            }
            return { ok: true, mode: 'list', match: 'local', items: local.map(localCard) }
          }
        }
        let url = API + '/memes?limit=' + n + '&offset=' + off
        if (q) url += '&q=' + encodeURIComponent(q)
        if (tag) url += '&tag=' + encodeURIComponent(tag)
        const data = await getJson(url)
        const items = Array.isArray(data.items) ? data.items : []
        const remoteSource = q ? 'remote-fuzzy' : 'remote-tag'
        return {
          ok: true,
          mode: 'search',
          query: q,
          tag: tag || null,
          guessed_total: typeof data.total === 'number' ? data.total : null,
          count: items.length,
          match: remoteSource,
          items: items.map((it) => ({
            title: it.title,
            slug: it.slug,
            summary: clip(it.summary, 300),
            tags: it.tags,
            bvid: it.source_video && it.source_video.bvid,
            source_title: it.source_video && it.source_video.title,
            creator: it.source_video && it.source_video.creator_name,
            updated_at: it.updated_at,
          })),
        }
      } catch (e) {
        return { ok: false, error: 'REQUEST_FAILED', status: (e && e.status) || null, message: redactPaths((e && e.message) || e) }
      }
    },
  })
  registerTool({
    name: 'meme_understand',
    description: '看懂一个梗：从图片或 B站视频抽帧做 OCR，提关键词，再去梗库找候选。给的是证据+候选，不是拍脑袋的答案。',
    parameters: {
      path: { type: 'string', description: '本地图片路径（与 bv 二选一）' },
      bv: { type: 'string', description: 'B站 BV 号，会下载并抽帧（与 path 二选一）' },
      frames: { type: 'number', description: '抽几帧，默认 6，最多 12' },
      text: { type: 'string', description: '直接给一段字幕/文案，跳过 OCR' },
    },
    output: textOutput,
    async execute(args) {
      const started = Date.now()
      let workdir = null
      try {
        let rawText = String((args && args.text) || '').trim()
        const evidence = []

        if (!rawText && args && args.path) {
          const p = String(args.path)
          if (!existsSync(p)) return { ok: false, error: 'FILE_NOT_FOUND', path: p }
          const o = ocrImage(p)
          rawText = o.text
          evidence.push({ kind: 'image', path: p, chars: o.text.length, error: o.error || null })
        }

        if (!rawText && args && args.bv) {
          const bv = String(args.bv).trim()
          const n = Math.min(Math.max(Number(args.frames) || 6, 1), 12)
          workdir = join(tmpdir(), 'meme-understand-' + Date.now())
          mkdirSync(workdir, { recursive: true })
          const dl = run(PY, ['-m', 'yt_dlp', '-f', 'bv*[height<=480]+ba/b[height<=480]', '--no-warnings', '--no-playlist',
            '-o', join(workdir, '%(id)s.%(ext)s'), 'https://www.bilibili.com/video/' + bv])
          const files = readdirSync(workdir).filter((f) => /\.(mp4|flv|mkv|webm)$/i.test(f))
          if (!files.length) return { ok: false, error: 'DOWNLOAD_FAILED', detail: (dl.err || dl.out).slice(0, 300) }
          const video = join(workdir, files[0])
          const ff = ffmpegPath()
          const outdir = join(workdir, 'frames')
          mkdirSync(outdir, { recursive: true })
          run(ff, ['-y', '-i', video, '-vf', 'fps=1/3,scale=960:-1', '-frames:v', String(n), join(outdir, 'f%02d.jpg')])
          const frames = readdirSync(outdir).filter((f) => f.endsWith('.jpg')).sort()
          const texts = []
          for (const f of frames) {
            const o = ocrImage(join(outdir, f))
            if (o.text) texts.push(o.text)
            evidence.push({ kind: 'frame', file: f, chars: o.text.length, sample: o.text.slice(0, 80) })
          }
          rawText = texts.join(' ')
        }

        if (!rawText) return { ok: false, error: 'NO_TEXT', hint: '给图片/BV/文本之一；也可能画面文字太少' }

        const kws = keywords(rawText, 8)
        const hits = new Map()
        for (const k of kws) {
          for (const it of await searchOne(k, 3)) {
            const key = it.slug || it.title
            const cur = hits.get(key) || { title: it.title, slug: it.slug, bvid: it.source_video && it.source_video.bvid, score: 0, via: [], summary: (it.summary || '').slice(0, 200) }
            cur.score += 1
            cur.via.push(k)
            hits.set(key, cur)
          }
        }
        const candidates = [...hits.values()].sort((a, b) => b.score - a.score).slice(0, 5)

        return {
          ok: true,
          took_ms: Date.now() - started,
          keywords: kws,
          text_chars: rawText.length,
          text_sample: rawText.slice(0, 300),
          evidence,
          candidates,
          note: candidates.length ? '按关键词命中数排序，分数低的不等于无关，需要人工看' : '没命中：可能库里没收录，或画面文字太少',
        }
      } catch (e) {
        return { ok: false, error: 'UNDERSTAND_FAILED', message: redactPaths((e && e.message) || e) }
      } finally {
        if (workdir) { try { rmSync(workdir, { recursive: true, force: true }) } catch {} }
      }
    },
  })
  registerTool({
    name: 'meme_screen',
    description: '读一张截图（评论区/弹幕/聊天）：OCR 出文字，识别里面的梗、句式、场景。用于看别人评论区怎么玩梗。',
    parameters: {
      path: { type: 'string', description: '截图路径' },
    },
    output: textOutput,
    async execute(args) {
      try {
        const p = String((args && args.path) || '').trim()
        if (!p) return failWithHint('EMPTY_PATH')
        const o = ocrImage(p)
        // OCR 常把汉字用空格隔开，先并回来再识别
        const text = (o.text || '').replace(/(?<=[\p{Script=Han}]) +(?=[\p{Script=Han}])/gu, '')
        if (!text) return failWithHint('NO_TEXT')
        const memes = detectMemes(text).concat(detectPatterns(text))
        const scenes = detectReactionScene(text)
        return {
          ok: true,
          chars: text.length,
          text_sample: text.slice(0, 300),
          memes: memes.map((m) => ({ span: m.span, canonical: m.canonical, tier: m.tier, source: m.source || 'lexicon' })),
          scenes: scenes.map((s) => ({ name: s.name, reaction: s.reaction.name, cues: s.cues })),
          limits: ['OCR 读不了彩色 emoji（🥶 这类会整行丢失）', '图片太小或字太密会漏字'],
        }
      } catch (e) {
        return { ok: false, error: 'SCREEN_FAILED', message: redactPaths((e && e.message) || e) }
      }
    },
  })
  registerTool({
    name: 'meme_emote',
    description: '认截图里的 B 站表情包：和本地 360 张素材做模板匹配，返回最像的几个名字和分数。用于看评论区用了哪个表情。',
    parameters: {
      path: { type: 'string', description: '截图路径' },
    },
    output: textOutput,
    async execute(args) {
      try {
        const p = String((args && args.path) || '').trim()
        if (!p) return { ok: false, error: 'EMPTY_PATH' }
        const r = run(OCR_PYEXE, [process.env.DSH_EMOTE_PY || join(_pkgDir, 'tools', 'emote_match.py'), p])
        if (r.code !== 0) return failWithHint('MATCH_FAILED', { detail: redactPaths(r.err || '') })
        return JSON.parse(r.out.trim() || '{"ok":false}')
      } catch (e) {
        return { ok: false, error: 'EMOTE_FAILED', message: redactPaths((e && e.message) || e) }
      }
    },
  })
  registerTool({
    name: 'meme_sync',
    description: '从云端仓库拉取最新梗库（git clone 浅拷贝），合并进当前词表。没有 B 站插件也能更新。',
    parameters: {
      repo: { type: 'string', description: '仓库地址，默认官方仓库' },
    },
    output: textOutput,
    async execute(args) {
      const repo = String((args && args.repo) || 'https://github.com/LHL473962/dsh-meme-lookup.git')
      const tmp = join(tmpdir(), 'meme-sync-' + Date.now())
      try {
        const git = findExecutable('git')
        if (!git) return failWithHint('GIT_MISSING')
        const r = run(git, ['clone', '--depth', '1', repo, tmp])
        if (r.code !== 0) return { ok: false, error: 'CLONE_FAILED', detail: (r.err || '').slice(0, 300) }
        const merged = { added: 0, updated: 0 }
        for (const f of ['lexicon_danmaku.json', 'lexicon_all.json']) {
          let rows = []
          try { rows = JSON.parse(readFileSync(join(tmp, f), 'utf8')) } catch { continue }
          if (!Array.isArray(rows)) continue
          const have = new Set(AUTO_LEX.map((e) => e.title))
          for (const e of rows) {
            if (!e || !e.title) continue
            if (have.has(e.title)) continue
            AUTO_LEX.push(e); have.add(e.title); merged.added++
          }
        }
        // 顺手更新本地数据文件，下次启动直接用
        for (const f of ['lexicon_danmaku.json', 'lexicon_all.json', 'variants.json', 'patterns.json', 'aliases.json']) {
          try { copyFileSync(join(tmp, f), join(pluginDir, f)) } catch {}
        }
        return { ok: true, added: merged.added, total: AUTO_LEX.length, repo }
      } catch (e) {
        return { ok: false, error: 'SYNC_FAILED', message: redactPaths((e && e.message) || e) }
      } finally {
        try { rmSync(tmp, { recursive: true, force: true }) } catch {}
      }
    },
  })
}
