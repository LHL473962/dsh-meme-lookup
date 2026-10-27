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
const API = 'https://cnmeme.wiki/api/v1/public'

export const name = 'meme-lookup'
export const inject = ['tools', 'webServer']

const textOutput = {
  schema: { type: 'object', properties: {}, additionalProperties: true },
  render: (_args, value) => [{
    type: 'text',
    text: typeof value === 'string' ? value : JSON.stringify(value, null, 2),
  }],
}

const clip = (s, n = 400) => (typeof s === 'string' && s.length > n ? s.slice(0, n) + '…' : s)

async function getJson(url, attempt = 0) {
  try {
    const res = await fetch(url, { headers: { accept: 'application/json', 'user-agent': 'dsh-meme-lookup/0.2' } })
    if (!res.ok) {
      const err = new Error('HTTP_' + res.status)
      err.status = res.status
      throw err
    }
    return await res.json()
  } catch (e) {
    // 5xx / 429 / 连接抖动：退避重试一次（4xx 业务错误不重试）
    const status = e && e.status
    const retryable = !status || status === 429 || status >= 500
    if (retryable && attempt < 1) {
      await new Promise((r) => setTimeout(r, 500))
      return getJson(url, attempt + 1)
    }
    throw e
  }
}

export function apply(ctx) {
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
          const readBody = async () => { let b = ''; let n = 0; for await (const c of req) { n += Buffer.byteLength(c); if (n > 32 * 1024) throw new Error('BODY_TOO_LARGE'); b += c } try { return JSON.parse(b || '{}') } catch { return {} } }
          if (sub === '/settings' && req.method === 'GET') return send(200, loadSettings())
          if (sub === '/settings' && req.method === 'POST') {
            const cur = { ...loadSettings(), ...(await readBody()) }
            writeFileAtomic(SETTINGS_FILE, JSON.stringify(cur, null, 2))
            return send(200, cur)
          }
          if (sub === '/userlex' && req.method === 'GET') {
            let list = []
            try { list = JSON.parse(readFileSync(USER_LEX_FILE, 'utf8')) || [] } catch {}
            return send(200, { items: list })
          }
          if (sub === '/userlex' && req.method === 'POST') {
            const e = await readBody()
            if (!e.title) return send(400, { ok: false, error: 'EMPTY_TITLE' })
            let list = []
            try { list = JSON.parse(readFileSync(USER_LEX_FILE, 'utf8')) || [] } catch {}
            const idx = list.findIndex((x) => x.title === e.title)
            const row = { ...e, addedAt: new Date().toISOString(), review: e.visibility === 'public' ? 'pending' : 'private' }
            if (idx >= 0) list[idx] = row; else list.push(row)
            writeFileAtomic(USER_LEX_FILE, JSON.stringify(list, null, 2))
            loadUserLexicon()
            return send(200, { ok: true, total: list.length })
          }
          if (sub === '/userlex' && req.method === 'DELETE') {
            const idx = Number(url.searchParams.get('id'))
            let list = []
            try { list = JSON.parse(readFileSync(USER_LEX_FILE, 'utf8')) || [] } catch {}
            if (idx >= 0) list.splice(idx, 1)
            writeFileAtomic(USER_LEX_FILE, JSON.stringify(list, null, 2))
            return send(200, { ok: true, total: list.length })
          }
          return send(404, { ok: false, error: 'NOT_FOUND' })
        } catch (e) { return send(500, { ok: false, error: String((e && e.message) || e) }) }
      },
    }), 'meme-panel: /api/meme-panel 路由')
  } catch (e) { /* 路由挂不上不影响工具 */ }
  ctx.tools.register({
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
        let url = API + '/memes?limit=' + n + '&offset=' + off
        if (q) url += '&q=' + encodeURIComponent(q)
        if (tag) url += '&tag=' + encodeURIComponent(tag)
        const data = await getJson(url)
        const items = Array.isArray(data.items) ? data.items : []
        return {
          ok: true,
          mode: 'search',
          query: q,
          tag: tag || null,
          guessed_total: typeof data.total === 'number' ? data.total : null,
          count: items.length,
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

  ctx.tools.register({
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

  ctx.tools.register({
    name: 'meme_coach',
    description: '梗教练：输入一段文案/一张图/一个BV，输出「这个梗是什么、出处、能不能用、怎么用、有什么风险」。给的是可用判断，不是搜索结果。',
    parameters: {
      text: { type: 'string', description: '你的文案或你想用的梗名（与 path/bv 至少给一个）' },
      path: { type: 'string', description: '图片路径' },
      bv: { type: 'string', description: 'B站 BV 号' },
      frames: { type: 'number', description: 'BV 抽几帧，默认 4' },
      scene: { type: 'string', description: '打算用在哪：开场/中段/结尾，或一句话描述' },
    },
    output: textOutput,
    async execute(args) {
      let workdir = null
      try {
        let rawText = String((args && args.text) || '').trim()
        const evidence = []

        if (!rawText && args && args.path) {
          const o = ocrImage(String(args.path))
          rawText = o.text
          evidence.push({ kind: 'image', chars: o.text.length, error: o.error || null })
        }
        if (!rawText && args && args.bv) {
          const bv = String(args.bv).trim()
          const n = Math.min(Math.max(Number(args.frames) || 4, 1), 8)
          workdir = join(tmpdir(), 'meme-coach-' + Date.now())
          mkdirSync(workdir, { recursive: true })
          run(PY, ['-m', 'yt_dlp', '-f', 'bv*[height<=480]+ba/b[height<=480]', '--no-warnings', '--no-playlist',
            '-o', join(workdir, '%(id)s.%(ext)s'), 'https://www.bilibili.com/video/' + bv])
          const files = readdirSync(workdir).filter((f) => /\.(mp4|flv|mkv|webm)$/i.test(f))
          if (!files.length) return { ok: false, error: 'DOWNLOAD_FAILED' }
          const ff = ffmpegPath()
          const outdir = join(workdir, 'frames')
          mkdirSync(outdir, { recursive: true })
          run(ff, ['-y', '-i', join(workdir, files[0]), '-vf', 'fps=1/2,scale=960:-1', '-frames:v', String(n), join(outdir, 'f%02d.jpg')])
          const texts = []
          for (const f of readdirSync(outdir).filter((f) => f.endsWith('.jpg')).sort()) {
            const o = ocrImage(join(outdir, f))
            if (o.text) texts.push(o.text)
            evidence.push({ kind: 'frame', file: f, chars: o.text.length })
          }
          rawText = texts.join(' ')
        }
        if (!rawText) return { ok: false, error: 'NO_TEXT', hint: '给 text / path / bv 之一' }

        const kws = keywords(rawText, 8)
        const hits = new Map()
        const queryText = rawText.replace(/\s+/g, '')
        for (const k of kws) {
          for (const it of await searchOne(k, 3)) {
            const key = it.slug || it.title
            const cur = hits.get(key) || { title: it.title, slug: it.slug, score: 0, via: [] }
            cur.score += k.length
            cur.via.push(k)
            // 查询文本里直接出现条目名 = 强命中
            if (it.title && queryText.includes(String(it.title))) cur.score += 20
            hits.set(key, cur)
          }
        }
        // 先按标题直接命中，命中就是强证据
        for (const th of titleHits(rawText)) {
          const key = th.slug
          const cur = hits.get(key) || { title: th.title, slug: th.slug, score: 0, via: [] }
          cur.score += 100
          cur.via.push('title:' + th.title)
          hits.set(key, cur)
        }
        const scored = [...hits.values()].map((x) => ({ ...x, ts: titleScore(rawText, x) }))
        const rankedAll = scored.filter((x) => x.ts >= 80).sort((a, b) => b.ts - a.ts)
        const ranked = rankedAll.slice(0, 3)
        const soft = scored.filter((x) => x.ts < 80 && x.ts >= 40).sort((a, b) => b.ts - a.ts).slice(0, 3)

        const scene0 = String((args && args.scene) || '')
        const fish0 = fishCheck(rawText + ' ' + scene0)

        if (!ranked.length) {
          // 库没收录，但如果是我们认识的词：给标题 + 强制标注，别装不认识（知止规则）
          const lexHit = MEME_LEX.find(([w]) => rawText.includes(w))
          if (lexHit) {
            const [w, , tier] = lexHit
            const f = await freshnessOf(w, [])
            const label = tier === 'slang' ? '口语 · 无出处 · 不当梗用'
              : tier === 'common' ? '日常语 · 无出处 · 不当梗用'
              : '梗 · 库里暂无出处'
            return {
              ok: true,
              verdict: 'UNKNOWN',
              provenance: 'missing',
              meme: { title: w, kind: tier },
              label,
              freshness: f,
              hidden_note: null,
              advice: ['这个词我们认识，但库里没有它的出处', '要上片先补溯源，补到就给完整判定'],
            }
          }
          return {
            ok: true,
            verdict: 'UNKNOWN',
            reason: '库里没收录，或关键词没命中',
            keywords: kws,
            evidence,
            fish_banned: fish0,
            advice: (fish0.length ? ['文案有鱼八股：' + fish0.map((f) => f.kind).join('、') + '，先改文案'] : [])
              .concat(['查不到就别硬用：要么自己补溯源（看评论、看原视频），要么换一个查得到的梗']),
          }
        }

        const top = ranked[0]
        let detail = null
        try {
          const raw = await getJson(API + '/memes/' + encodeURIComponent(top.slug))
          detail = raw.item || raw
        } catch {}

        const tags = (detail && detail.tags) || []
        const risky = tags.filter((t) => RISKY_TAGS.some((r) => String(t).includes(r)))
        const careHit = CARE_WORDS.filter(([w]) => rawText.includes(w))
        const updated = detail && detail.updated_at ? Date.parse(detail.updated_at) : null
        const ageDays = updated ? Math.round((Date.now() - updated) / 86400000) : null

        const scene = scene0
        const fish = fish0

        const typeName = tags.map((t) => PLACE_NAMES[t]).find(Boolean) || '未判定'
        const advice = []
        advice.push('定位：' + typeName + '类，用的时候按这一类来设计画面，别硬套')
        advice.push('时长：当句号用 1.2~2.5 秒；必要时缩成 15% 角标')
        advice.push('间隔：同一支片子里至少隔 30 秒复用')
        if (risky.length) advice.push('风险：标签里有 ' + risky.join('、') + '，涉及争议，慎用或不用')
        for (const [w, why] of careHit) advice.push('慎用：' + w + ' —— ' + why)
        if (fish.length) advice.push('文案有鱼八股：' + fish.map((f) => f.kind).join('、') + '，先改文案再配梗')
        if (detail) advice.push('出处：' + PROVIDENCE_TEXT[provenanceOf(detail)])
        const heat = await heatOf(detail && detail.source_video && detail.source_video.bvid, tags)
        const fresh = await freshnessOf(detail && detail.title, tags)
        const FRESH_TEXT = { fresh: '还在有人用', usable: '不算过时', stale: '已经过时', unknown: '说不准' }
        advice.push('时效：' + FRESH_TEXT[fresh.label] + (fresh.last_used_days !== null ? '（最近有人用是 ' + fresh.last_used_days + ' 天前）' : ''))
        const ev = detectEvasion(rawText)
        if (ev.some((x) => x.level >= 2)) advice.push("风险：侮辱性/脏话类，别当玩笑甩（" + ev.map((x) => x.canonical).join("、") + "）")
      if (fresh.label === 'stale') advice.push('慎用：老梗，现在玩只会尴尬')
        if (fresh.applicability >= 0.7) advice.push('易用性高：场景广、好套用，所以寿命比同类长')
        const HEAT_TEXT = { broad: '大众都认识', medium: '不少人认识', narrow: '小圈子居多', niche: '圈内才懂', unknown: '热度未知' }
        advice.push('认识度：' + HEAT_TEXT[heat.level] + (heat.view ? '（源视频 ' + heat.view + ' 播放）' : ''))
        if (heat.level === 'niche' || heat.level === 'narrow') advice.push('慎用：对方很可能不认识，解释一句就变尬聊')
        if (detail && detail.source_video) {
          advice.push('署名：梗出处 ' + (detail.source_video.bvid || '未知') + '，作者 ' + (detail.source_video.creator_name || '未知') + '，成片里要标')
        }

        // 人工/自动档位：common 和 slang 不算梗，不出 verdict（见微 2026-10-27）
        const autoEntry = AUTO_LEX.find((e) => e.slug === top.slug)
        if (autoEntry && (autoEntry.tier === 'common' || autoEntry.tier === 'slang')) {
          return {
            ok: true,
            verdict: 'UNKNOWN',
            provenance: provenanceOf(detail),
            meme: { title: autoEntry.title, kind: autoEntry.tier },
            label: autoEntry.tier === 'common' ? '日常语 · 不当梗用' : '口语 · 不当梗用',
            tier_source: autoEntry.tier_source,
            why: autoEntry.why || null,
            advice: ['它已经被当日常说话用了，不盖章', '真要玩，当语气用，别做卡片'],
          }
        }

        const topProv = provenanceOf(detail)
        if (topProv === 'missing') {
          const t = norm(rawText)
          const title = detail && detail.title ? String(detail.title) : top.title
          const isPart = t && title && (t.includes(norm(title)) || norm(title).includes(t))
          return {
            ok: true,
            verdict: 'UNKNOWN',
            provenance: 'missing',
            meme: isPart ? { title, kind: 'unknown' } : null,
            label: '日常语 · 无出处 · 不当梗用',
            hidden_note: isPart ? null : '另有相近条目，未展开（都不是你输入的词）',
            advice: ['这条我们没查到出处，当语气用，别当梗标', '要上片先补溯源'],
          }
        }

        return {
          ok: true,
          verdict: (function () {
            const prov = provenanceOf(detail)
            if (prov === 'missing') return 'UNKNOWN'                       // 没出处不配盖章
            if (prov === 'partial') return 'USE_WITH_CARE'                 // 有 BV 但作者未知
            if (fresh.label === 'stale') return 'USE_WITH_CARE'             // 老梗别当新梗用
            return risky.length || careHit.length ? 'USE_WITH_CARE' : 'USABLE'
          })(),
          meme: { title: detail && detail.title, slug: top.slug, tags, summary: (detail && detail.summary || '').slice(0, 300) },
          evidence: evidence.concat([{ kind: 'db', matched_by: top.via }]),
          age_days: ageDays,
          fish_banned: fish,
          advice,
          provenance: provenanceOf(detail),
          heat,
          freshness: fresh,
          // 知止规则：标题是查询的一部分才显示；只是长得像就藏起来
          missing_shown: (function () {
            const q = norm(rawText)
            return ranked
              .filter((x) => x.slug !== top.slug)
              .map((x) => {
                const t = norm(x.title)
                const isPart = t && q && (q.includes(t) || t.includes(q))
                return isPart
                  ? { title: x.title, kind: 'unknown', label: '日常语 · 无出处 · 不当梗用' }
                  : null
              })
              .filter(Boolean)
          })(),
          missing_hidden_count: ranked.filter((x) => {
            const q = norm(rawText)
            const t = norm(x.title)
            return !(t && q && (q.includes(t) || t.includes(q)))
          }).length,
          alternatives: ranked.slice(1).map((x) => x.title).concat(soft.map((x) => x.title)),
        }
      } catch (e) {
        return { ok: false, error: 'COACH_FAILED', message: redactPaths((e && e.message) || e) }
      } finally {
        if (workdir) { try { rmSync(workdir, { recursive: true, force: true }) } catch {} }
      }
    },
  })

  ctx.tools.register({
    name: 'meme_chat',
    description: '读一句话：哪些是梗、什么语境（正事/调侃/讽刺/情绪）、该不该用梗回，以及「说这话的人可以给自己贴哪张图」。',
    parameters: {
      text: { type: 'string', description: '用户发来的那句话' },
      strict: { type: 'boolean', description: '严格模式：只在确信的梗上标注' },
    },
    output: textOutput,
    async execute(args) {
      try {
        const text = String((args && args.text) || '').trim()
        if (!text) return failWithHint('EMPTY_TEXT')
        const clauses = splitClauses(text)
        maybeReloadUserLex()
        const lexMemes = detectMemes(text)
        const patMemes = detectPatterns(text).filter((p) => !lexMemes.some((m) => p.at < m.at + m.span.length && p.at + p.span.length > m.at))
        const memes = lexMemes.concat(patMemes)
        // 语境判断前先摘掉梗本身，避免「难崩」里的「崩」被当成情绪词
        let ctxText = text
        for (const m of memes) ctxText = ctxText.split(m.span).join(' ')
        // 摘掉梗再判语境有时会误伤（「笑死，这也能崩」被当成情绪），原句也判一次
        const ctxRaw = classifyContext(text, memes)
        let context = classifyContext(ctxText, memes)
        if (ctxRaw.type === '调侃' && context.type === '情绪') context = ctxRaw
        const evasionNow = detectEvasion(text)
        const policy = replyPolicy(context, memes)
// 脏话类（含避审写法）不接
if (policy && policy.use_meme && evasionNow.some((e) => e.level >= 3)) {
  policy.use_meme = false
  policy.why = "脏话类（避审写法也算脏话），别接"
  policy.max = 0
}
        const scenes = detectReactionScene(text)
        const heatNotes = []
        for (const m of memes) {
          if (!m.bvid) continue
          if (m.tier !== 'live' && m.tier !== 'fading') continue
          const h = await heatOf(m.bvid, [])
          m.heat = h
          if (h.level === 'niche' || h.level === 'narrow') {
            // 重要：这是「对方说出来的梗」，说明对方认识——顺着接是安全的。
            // 只有我们主动抛新梗时才需要顾虑热度（当前版本不做主动抛梗）。
            heatNotes.push(m.span + ' 偏冷门（源视频 ' + (h.view ?? '?') + ' 播放）；对方既然用了，顺着接没问题，别主动拿去跟别人用')
          }
        }
        if (heatNotes.length) policy.why += '｜' + heatNotes.join('；')

        // 非梗成分：不含梗的句子片段，判断它们是不是「正事/信息」
        const nonMeme = clauses.filter((c) => !memes.some((m) => c.includes(m.span)))
        const infoClauses = nonMeme.filter((c) => /[？?]|怎么|为什么|帮我|报错|时间|钱|文件|代码/.test(c))

        return {
          ok: true,
          memes,
          scenes,
          evasion: detectEvasion(text),
          persona: currentPersona(),
          persona_lines: personaBank(currentPersona().id).slice(0, 4),
          self_reaction: scenes.length ? { scene: scenes[0].name, character: scenes[0].reaction.name, note: scenes[0].usage } : null,
          meme_tiers: {
            live: memes.filter((m) => m.tier === 'live').map((m) => m.span),
            fading: memes.filter((m) => m.tier === 'fading').map((m) => m.span),
            common: memes.filter((m) => m.tier === 'common').map((m) => m.span),
            slang: memes.filter((m) => m.tier === 'slang').map((m) => m.span),
          },
          is_meme: memes.some((m) => m.tier === 'live' || m.tier === 'fading'),
          context,
          policy,
          non_meme: { clauses: nonMeme, info: infoClauses },
          hints: [
            policy.why,
            memes.length ? '梗：' + memes.map((m) => m.span).join('、') : '这句话里没识别到梗',
            infoClauses.length ? '有 ' + infoClauses.length + ' 句是需要正面回答的信息' : '',
            '别用「好的/确实/你说得对」开场；先给反应，再给立场',
          ].filter(Boolean),
        }
      } catch (e) {
        return { ok: false, error: 'CHAT_FAILED', message: redactPaths((e && e.message) || e) }
      }
    },
  })

  ctx.tools.register({
    name: 'meme_suggest',
    description: '主动抛梗：给一段对话上下文，推荐 1~3 个「对方大概率认识、且不冒犯」的梗。只推荐大众认识的，冷门不抛。',
    parameters: {
      context: { type: 'string', description: '对话上下文（对方刚说的话）' },
      limit: { type: 'number', description: '推荐几个，默认 3，最多 5' },
      tone: { type: 'string', description: '想要的味道：稳/皮/损，默认稳' },
    },
    output: textOutput,
    async execute(args) {
      try {
        const ctxText = String((args && args.context) || '').trim()
        const n = Math.min(Math.max(Number(args.limit) || 3, 1), 5)
        const tone = String((args && args.tone) || '稳')
        const already = new Set(detectMemes(ctxText).map((m) => m.span))

        // 先按话题算“想要的标签”，候选池据此放宽热度门槛
        const TOPIC_MAP0 = [
          { keys: ['加班', '上班', '工作', '打工', '工资', '下班', '累', '熬', '社畜'], tags: ['打工人', '社畜', '上班', '自嘲', '生活梗', '职场', '吐槽'] },
          { keys: ['游戏', '开黑', '排位', '打团', '上分', '队友', '崩'], tags: ['游戏梗', '电竞梗', '玩家社群'] },
          { keys: ['AI', '模型', '提示词', '插件', '代码', '报错', 'bug', '崩了'], tags: ['AI梗', '科技', '程序员', '电脑', '吐槽'] },
          { keys: ['吃', '饿', '外卖', '夜宵', '饭'], tags: ['美食', '生活梗'] },
          { keys: ['困', '睡', '熬夜', '失眠'], tags: ['生活梗', '自嘲'] },
          { keys: ['猫', '狗', '动物'], tags: ['动物梗', '宠物'] },
        ]
        const wantTags0 = new Set()
        for (const m of TOPIC_MAP0) if (m.keys.some((k) => ctxText.includes(k))) m.tags.forEach((t) => wantTags0.add(t))

        const pool = []
        for (const e of AUTO_LEX) {
          if (!e.title || e.title.length < 2 || e.title.length > 10) continue
          if (already.has(e.title)) continue
          if (e.provenance !== 'complete') continue
          if (e.tier !== 'live' && e.tier !== 'fading') continue
          const tags = e.tags_raw || []
          if (tags.some((t) => RISKY_TAGS.some((r) => String(t).includes(r)))) continue
          const view = HEAT_INDEX[e.bvid] || 0
          const tierOk = e.tier === undefined || e.tier === 'live' || e.tier === 'fading'
          if (!tierOk) continue
          const topicHit = wantTags0.size > 0 && tags.some((t) => wantTags0.has(t))
          if (view < 100000 && !topicHit) continue
          pool.push({ ...e, view })
        }
        if (!pool.length) return { ok: true, suggestions: [], note: '没有够大众的候选' }

        const ctxWords = keywords(ctxText, 8)
        // 话题 → 标签映射（没有语义模型的情况下，靠这张表提升相关度）
        const TOPIC_MAP = [
          { keys: ['加班', '上班', '工作', '打工', '工资', '下班', '累', '熬'], tags: ['打工人', '社畜', '上班', '自嘲', '生活梗', '职场'] },
          { keys: ['游戏', '开黑', '排位', '打团', '上分', '队友'], tags: ['游戏梗', '电竞梗', '玩家社群'] },
          { keys: ['AI', '模型', '提示词', '插件', '代码', '报错'], tags: ['AI梗', '科技', '程序员', '电脑'] },
          { keys: ['吃', '饿', '外卖', '夜宵'], tags: ['美食', '生活梗'] },
          { keys: ['困', '睡', '熬夜', '失眠'], tags: ['生活梗', '自嘲'] },
          { keys: ['猫', '狗', '动物'], tags: ['动物梗', '宠物'] },
        ]
        const wantTags = new Set()
        for (const m of TOPIC_MAP) if (m.keys.some((k) => ctxText.includes(k))) m.tags.forEach((t) => wantTags.add(t))
        // 话题命中优先：有相关标签的候选先筛出来，避免永远推同几个热门游戏梗
        const relPool = wantTags.size ? pool.filter((e) => (e.tags_raw || []).some((t) => wantTags.has(t))) : []
        const usePool = relPool.length >= 3 ? relPool : pool
        const scored = usePool.map((e) => {
          let rel = 0
          const hay = String(e.title) + ' ' + (e.tags_raw || []).join(' ')
          for (const w of ctxWords) if (hay.includes(w)) rel += w.length
          for (const t of wantTags) if (hay.includes(t)) rel += 8
          // 场景梗惩罚：上下文没聊游戏/动画，就别推游戏动画梗
          const tagStr = (e.tags_raw || []).join(' ')
          const ctxAboutGame = /游戏|动画|二次元|星穹|番|角色|up主|主播/.test(ctxText)
          const offTopic = !ctxAboutGame && /游戏梗|动画梗|二次创作|电竞梗|番剧/.test(tagStr)
          if (offTopic) rel -= 30
          const dailyBonus = /文字梗|吐槽|生活梗|自嘲|网络迷因|谐音梗|调侃|口头禅/.test(tagStr) ? 6 : 0
          rel += dailyBonus
          const heatBonus = e.view >= 1000000 ? 30 : e.view >= 300000 ? 18 : 8
          const usableBonus = /句式模板|句式套用|口头禅|网络用语/.test((e.tags_raw || []).join(' ')) ? 12 : 0
          return { ...e, score: rel * 2 + heatBonus + usableBonus, rel }
        }).sort((a, b) => b.score - a.score)

        // 抛出去的梗必须还新鲜：陈年老梗只会尴尬
        const freshChecked = []
        for (const e of scored.slice(0, 12)) {
          const f = await freshnessOf(e.title, e.tags_raw)
          if (f.label === 'stale') continue
          freshChecked.push({ ...e, freshness: f })
        }

        const picked = freshChecked.slice(0, n).map((e) => ({
          title: e.title,
          slug: e.slug,
          view: e.view,
          heat: heatLevelOf(e.view),
          tags: (e.tags_raw || []).slice(0, 3),
          why: e.rel > 0 ? '跟当前话题有词重叠，好接' : '大众梗，安全但不算贴题',
        }))

        // 模型重排默认关：这个接口每次要 2 万多 token，贵且慢；需要时在 meme-suggest.json 加 "rerank": true
        const reranked = SC.rerank ? await rerankWithModel(ctxText, scored.slice(0, 12)) : null
        if (reranked && reranked.length) {
          const byTitle = new Map(picked.map((p) => [p.title, p]))
          const final = reranked.map((x) => ({ ...(byTitle.get(x.title) || { title: x.title }), why: x.why || '模型推荐' }))
          return { ok: true, tone, count: final.length, suggestions: final, reranked: true, note: '模型重排过；只抛对方大概率认识的梗' }
        }

        return { ok: true, tone, count: picked.length, suggestions: picked, reranked: false, note: '只抛对方大概率认识的梗；冷门不出现在这里' }
      } catch (e) {
        return { ok: false, error: 'SUGGEST_FAILED', message: redactPaths((e && e.message) || e) }
      }
    },
  })


  ctx.tools.register({
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


  ctx.tools.register({
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



  ctx.tools.register({
    name: 'meme_write',
    description: '写文案时用梗：给一段主题/草稿，挑出能用的梗，说明放在哪、怎么用、要不要署名，按你的玩梗浓度控制数量。',
    parameters: {
      text: { type: 'string', description: '文案草稿或主题' },
      limit: { type: 'number', description: '最多给几个梗位，默认跟设置里的浓度走' },
      tone: { type: 'string', description: '稳/皮/损，默认稳' },
    },
    output: textOutput,
    async execute(args) {
      try {
        const text = String((args && args.text) || '').trim()
        if (!text) return { ok: false, error: 'EMPTY_TEXT' }
        const st = loadSettings()
        const n = Math.min(Math.max(Number((args && args.limit) || st.density || 2), 0), 5)
        if (n === 0) return { ok: true, suggestions: [], note: '你的浓度设为 0，这篇不给梗位' }

        const ctxWords = keywords(text, 8)
        const scenes = detectReactionScene(text)
        const used = new Set(detectMemes(text).map((m) => m.canonical))

        // 场景优先：常见文案场景用手工清单，比关键词乱撞准（2026-10-27 定）
        const CURATED = [
          { keys: ['加班', '上班', '打工', '社畜', '班味', '累'], memes: ['打工人', '社畜', '班味', '摸鱼', '电子榨菜', '牛马'] },
          { keys: ['崩', '报错', 'bug', '挂了', '失败'], memes: ['破防', '摆烂', '草台班子', '麻了', '裂开'] },
          { keys: ['赌', '梭哈', '全压', '搏一把', '押'], memes: ['梭哈'] },
          { keys: ['聪明', '妙', '技巧', '破解', '白嫖', '教你', '绕过去', '诀窍', '方法'], memes: ['学到了', '计划通'] },
          { keys: ['离谱', '逆天', '抽象', '看不懂'], memes: ['离谱', '逆天', '抽象'] },
          { keys: ['跑一下', '上线', '庆功', '验证', '灰测'], memes: ['先别庆功', '跑一下', '闭环'] },
          { keys: ['冷笑话', '谐音', '段子', '讲个笑话'], memes: ['冻住', '笑死'] },
        ]
        // 宿傩句式：先写「代价」，再写「目的」——不是赌一把，是我愿意为你们付这个代价
        const sacrifice = /(我贷|我垫|我氪|我熬|我花|押上|豁出去|代价)/.test(text) || /(让|为了).{0,12}(看到|知道|用上|学会)/.test(text)
        // 只取「目的」那半句，两种模板：让你们 X / 只为了让 X
        let purpose = text.split(/让你们|让你|为了让|为了|只为了/).pop().trim()
        purpose = purpose.replace(/^[，,、\s]+/, '').replace(/^(你们|大家|我)/, '')
        if (/让/.test(purpose)) purpose = purpose.slice(purpose.lastIndexOf('让') + 1).trim()
        while (purpose.startsWith('让') || purpose.startsWith('使')) purpose = purpose.slice(1)
        const sacrificeLine = sacrifice ? ('我贷了笔大的，' + (/让你们|让你/.test(text) ? '让你们' + purpose : '只为了让' + purpose)) : null
        const titleSet = new Set(AUTO_LEX.map((e) => e.title))
        const curatedOut = []
        for (const c of CURATED) {
          if (!c.keys.some((k) => text.includes(k))) continue
          for (const m of c.memes) {
            if (curatedOut.length >= n) break
            if (!titleSet.has(m)) continue
            curatedOut.push({
              meme: m,
              where: curatedOut.length === 0 ? '开头 5 秒内（抓人）' : (curatedOut.length === 1 ? '中段转折处' : '结尾收束'),
              how: '当句号用：一句话说完接它，别硬塞在句子中间',
              why: '场景命中（' + c.keys.find((k) => text.includes(k)) + '），日常词、不容易翻车',
              source: { bvid: null, creator: null },
              risk: '低',
            })
          }
          if (curatedOut.length >= n) break
        }

        // 话题相关标签（跟 suggest 同一套，保持行为一致）
        const TOPIC = [
          { keys: ['加班', '上班', '工作', '打工', '累', '社畜'], tags: ['打工人', '社畜', '上班', '自嘲', '生活梗', '职场', '吐槽'] },
          { keys: ['游戏', '排位', '队友', '开黑'], tags: ['游戏梗', '电竞梗'] },
          { keys: ['AI', '模型', '代码', '报错', '插件'], tags: ['AI梗', '科技', '程序员', '电脑'] },
          { keys: ['吃', '饿', '外卖', '夜宵'], tags: ['美食', '生活梗'] },
          { keys: ['睡', '熬夜', '失眠', '困'], tags: ['生活梗', '自嘲'] },
          { keys: ['猫', '狗', '宠物'], tags: ['动物梗', '宠物'] },
        ]
        const want = new Set()
        for (const m of TOPIC) if (m.keys.some((k) => text.includes(k))) m.tags.forEach((t) => want.add(t))

        const cands = []
        for (const e of AUTO_LEX) {
          const t = String(e.title || '')
          if (!t || t.length < 2 || t.length > 12 || used.has(t)) continue
          if (e.provenance !== 'complete') continue
          const tierOk = e.tier === undefined || e.tier === 'live' || e.tier === 'fading'
          if (!tierOk) continue
          const tags = e.tags_raw || []
          if (tags.some((x) => RISKY_TAGS.some((r) => String(x).includes(r)))) continue
          const hay = t + ' ' + tags.join(' ')
          let score = 0
          for (const w of ctxWords) if (hay.includes(w)) score += w.length * 2
          for (const tg of want) if (tags.some((x) => String(x).includes(tg))) score += 8
          const ctxAboutGame = /游戏|动画|二次元|星穹|番|主播/.test(text)
          if (!ctxAboutGame && /游戏梗|动画梗|二次创作|番剧/.test(tags.join(' '))) score -= 25
          if (/文字梗|吐槽|生活梗|自嘲|网络迷因|谐音梗|调侃/.test(tags.join(' '))) score += 5
          score += (HEAT_INDEX[e.bvid] || 0) >= 300000 ? 10 : 4
          if (score <= 0) continue
          cands.push({ ...e, score, view: HEAT_INDEX[e.bvid] || 0 })
        }
        cands.sort((a, b) => b.score - a.score)

        const out = curatedOut.slice(0, n)
        for (const c of cands.slice(0, 12)) {
          if (curatedOut.length) break // 场景清单已给出，不再用关键词检索凑数
          if (out.length >= n) break
          const f = await freshnessOf(c.title, c.tags_raw)
          if (f.label === 'stale') continue
          const tags = (c.tags_raw || []).join(' ')
          const how = /图像梗|表情包/.test(tags)
            ? '当反应图用：说到这段时把图贴出来，不加字也行'
            : /谐音梗/.test(tags)
              ? '当双关用：字幕里把谐音点写清楚，别让观众猜'
              : /句式模板|口头禅/.test(tags)
                ? '当句式用：套进自己的话里，别整句照搬'
                : '当句号用：一句话说完接它，1.2~2.5 秒'
          out.push({
            meme: c.title,
            where: out.length === 0 ? '开头 5 秒内（抓人）' : (out.length === 1 ? '中段转折处' : '结尾收束'),
            how,
            why: '话题相关度 ' + c.score + ' 分，' + (f.label === 'fresh' ? '还在有人用' : f.label === 'usable' ? '不算过时' : '时效存疑'),
            source: { bvid: c.bvid, creator: c.creator || null },
            risk: f.label === 'stale' ? '已过时' : '低',
          })
        }

        const self = scenes.length ? { scene: scenes[0].name, character: scenes[0].reaction.name, when: scenes[0].usage } : null
        return {
          ok: true,
          density: n,
          suggestions: out,
          persona: currentPersona(),
          self_reaction: sacrifice ? { scene: '我付出代价，让你们得到', character: '宿傩', when: sacrificeLine } : self,
          attribution: out.map((o) => o.meme + ' 出自 ' + (o.source.bvid || '无') + (o.source.creator ? ' / ' + o.source.creator : '')),
          notes: [
            '同一支片子里，同一个梗别用两次',
            '梗位之间至少隔 30 秒',
            out.length === 0 ? '没找到又相关又没过时的梗，这篇建议不玩梗' : '',
          ].filter(Boolean),
        }
      } catch (e) {
        return { ok: false, error: 'WRITE_FAILED', message: redactPaths((e && e.message) || e) }
      }
    },
  })


  ctx.tools.register({
    name: 'meme_persona',
    description: '人格/说话风格：稳重、损友、贴吧、捧场、自嘲、冷面。只管怎么说，不管该不该说。',
    parameters: {
      action: { type: 'string', description: 'list 列出 / get 当前 / set 切换' },
      id: { type: 'string', description: '人格 id：steady/roast/tieba/hype/selfmock/deadpan' },
    },
    output: textOutput,
    async execute(args) {
      const a = String((args && args.action) || 'list')
      let list = []
      try { list = (JSON.parse(readFileSync(PERSONA_FILE, 'utf8')) || {}).items || [] } catch {}
      const cur = loadSettings().persona || 'steady'
      if (a === 'list') return { ok: true, current: cur, personas: list.map((p) => ({ id: p.id, name: p.name, desc: p.desc })) }
      if (a === 'get') return { ok: true, persona: list.find((p) => p.id === cur) || null }
      if (a === 'set') {
        const want = String((args && args.id) || '').trim()
        const found = list.find((p) => p.id === want || p.name === want)
        if (!found) return { ok: false, error: 'UNKNOWN_PERSONA', available: list.map((p) => p.id) }
        const st = loadSettings()
        writeFileSync(SETTINGS_FILE, JSON.stringify({ ...st, persona: found.id }, null, 2))
        return { ok: true, persona: found }
      }
      return { ok: false, error: 'BAD_ACTION' }
    },
  })
  ctx.tools.register({
    name: 'meme_settings',
    description: '玩梗开关：调「玩梗倾向」（稳重/正常/活泛）和「玩梗浓度」（每条回复最多几个梗），也可开关自动更新。',
    parameters: {
      action: { type: 'string', description: 'get 读取 / set 设置' },
      tendency: { type: 'number', description: '0=稳重 1=正常 2=活泛' },
      density: { type: 'number', description: '0~3，每条回复最多几个梗' },
      allow_risky: { type: 'boolean', description: '是否允许「慎用」级梗' },
      auto_update: { type: 'boolean', description: '是否允许自动更新词库' },
    },
    output: textOutput,
    async execute(args) {
      const a = String((args && args.action) || 'get')
      const def = { tendency: 1, density: 1, allowRisky: false, autoUpdate: true }
      let cur = { ...def }
      try { cur = { ...def, ...(JSON.parse(readFileSync(SETTINGS_FILE, 'utf8')) || {}) } } catch {}
      if (a === 'get') return { ok: true, settings: cur }
      if (a === 'set') {
        if (args.tendency !== undefined) cur.tendency = Math.max(0, Math.min(2, Number(args.tendency) || 0))
        if (args.density !== undefined) cur.density = Math.max(0, Math.min(3, Number(args.density) || 0))
        if (args.allow_risky !== undefined) cur.allowRisky = !!args.allow_risky
        if (args.auto_update !== undefined) cur.autoUpdate = !!args.auto_update
        writeFileAtomic(SETTINGS_FILE, JSON.stringify(cur, null, 2))
        return { ok: true, settings: cur }
      }
      return { ok: false, error: 'BAD_ACTION' }
    },
  })

  ctx.tools.register({
    name: 'meme_add',
    description: '手动加梗：用户自己录一条，写清含义和用法。存进用户词表，优先级高于公共库。',
    parameters: {
      title: { type: 'string', description: '梗名' },
      meaning: { type: 'string', description: '一句话含义' },
      usage: { type: 'string', description: '什么场景下用' },
      avoid: { type: 'string', description: '什么场景别用（可选）' },
      tone: { type: 'string', description: '语气：正经/调侃/自嘲/阴阳（可选）' },
      example: { type: 'string', description: '示例句子（可选）' },
      source: { type: 'string', description: '出处 BV 或链接（可选）' },
      variants: { type: 'string', description: '变体，逗号分隔（可选）' },
    },
    output: textOutput,
    async execute(args) {
      const title = String((args && args.title) || '').trim().slice(0, 40)
      if (!title) return { ok: false, error: 'EMPTY_TITLE' }
      const entry = {
        title,
        meaning: String((args && args.meaning) || '').trim().slice(0, 500),
        usage: String((args && args.usage) || '').trim(),
        avoid: String((args && args.avoid) || '').trim(),
        tone: String((args && args.tone) || '').trim(),
        example: String((args && args.example) || '').trim(),
        source: String((args && args.source) || '').trim(),
        variants: String((args && args.variants) || '').split(',').map((s) => s.trim()).filter(Boolean),
        addedAt: new Date().toISOString(),
      }
      let list = []
      withLexiconLock(() => {
        try { list = JSON.parse(readFileSync(USER_LEX_FILE, 'utf8')) || [] } catch {}
        list = list.filter((e) => e.title !== title)
        list.push(entry)
        writeFileAtomic(USER_LEX_FILE, JSON.stringify(list, null, 2))
      })
      // 立刻进内存，别等重启
const isPhraseNew = entry.sourceType === "自创"
if (!AUTO_LEX.some((x) => x.title === title)) {
  AUTO_LEX.push({ title, slug: "user:" + title, tags_raw: [isPhraseNew ? "私人用语" : "用户录入"], bvid: null, creator: entry.source || null, provenance: entry.sourceType === "有 BV" ? "partial" : "missing", source: "user", kind: isPhraseNew ? "phrase" : "meme", tier: isPhraseNew ? "slang" : "live" })
}
      return { ok: true, added: entry, total: list.length, path: String(USER_LEX_FILE) }
    },
  })

  ctx.tools.register({
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
        const r = run('git', ['clone', '--depth', '1', repo, tmp])
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
// ============ 梗理解：抽帧 + OCR + 检索 ============
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { realpathSync } from 'node:fs'
import { openSync, closeSync, statSync as statSync2 } from 'node:fs'
import { renameSync } from 'node:fs'
import { statSync } from 'node:fs'
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { copyFileSync } from 'node:fs'
import { tmpdir } from 'node:os'

// 学自 dsh-im：profile 可能用符号链接/junction 装载插件，走 realpath 才能找到真实目录
const _pkgDir = (() => {
  try { return realpathSync(fileURLToPath(new URL('.', import.meta.url))) } catch { return fileURLToPath(new URL('.', import.meta.url)) }
})()
// 选一个能用的 Python：环境变量 > 本机已知 venv > PATH 上的 python
function resolvePython() {
  const env = process.env.DSH_PY || process.env.DSH_FRAMES_PY || process.env.DSH_OCR_PYEXE
  if (env && existsSync(env)) return env
  const cands = [
    'D:/Apps/dsh-soundcheck-src/engine/venv/Scripts/python.exe',
    join(homedir2(), '.dsh', 'bili-humanism', 'venv-frames', 'Scripts', 'python.exe'),
  ]
  for (const c of cands) { try { if (existsSync(c)) return c } catch {} }
  return 'python'
}

const PY = resolvePython()
const OCR_PY = process.env.DSH_OCR_PY || join(_pkgDir, 'tools', 'ocr_win.py')
const OCR_PYEXE = PY

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, ...opts })
  if (r.error) throw r.error
  return { code: r.status, out: r.stdout || '', err: r.stderr || '' }
}

function ffmpegPath() {
  const r = run(PY, ['-c', 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())'])
  if (r.code !== 0) throw new Error('ffmpeg not found: ' + r.err.slice(0, 200))
  return r.out.trim().split(/\r?\n/).pop()
}

function ocrImage(path) {
  const outFile = join(tmpdir(), 'ocr-' + Date.now() + '-' + Math.random().toString(36).slice(2) + '.txt')
  const r = run(OCR_PYEXE, [OCR_PY, path, outFile])
  if (r.code !== 0) return { text: '', error: ((r.err || '') + '').slice(0, 300) }
  let text = ''
  try { text = readFileSyncSafe(outFile) } catch {}
  try { rmSync(outFile, { force: true }) } catch {}
  return { text: text.replace(/\s+/g, ' ').trim() }
}

function readFileSyncSafe(p) {
  return readFileSync(p, 'utf8')
}

const STOP = new Set(['什么','这个','那个','就是','可以','没有','一个','我们','他们','自己','时候','不是','还是','这样','怎么','因为','所以','但是','如果','已经','现在','这里','那里','什么','么','的','了','是','在','和','与','也','都','就','要','会','吗','呢','吧','啊','我','你','他','她','它','这','那','有','没','不','很','太','再','又','把','被','让','给','对','从','到','为'])

function keywords(text, n = 10) {
  // OCR 常把汉字之间加空格：先把「汉字 空格 汉字」的空格去掉
  const joined = text.replace(/(?<=[\p{Script=Han}])\s+(?=[\p{Script=Han}])/gu, '')
  const clean = joined.replace(/[^\p{Script=Han}A-Za-z0-9]+/gu, ' ').trim()
  const clauses = clean.split(/\s+/).filter((c) => c.length >= 2)
  const freq = new Map()
  for (const c of clauses) {
    const s = c.slice(0, 24)
    for (let len = 2; len <= 4; len++) {
      for (let i = 0; i + len <= s.length; i++) {
        const g = s.slice(i, i + len)
        if (/^\d+$/.test(g)) continue
        if (STOP.has(g)) continue
        // 只保留「首尾不是虚词」的片段，降低噪音
        if (STOP.has(g[0]) && g.length <= 2) continue
        freq.set(g, (freq.get(g) || 0) + 1)
      }
    }
  }
  // 别名扩展：用户写「破防了」，也去查「破防」
  const extra = []
  for (const [alias, canonical] of Object.entries(ALIAS)) {
    if (joined.includes(alias) && canonical && !extra.includes(canonical)) extra.push(canonical)
  }

  return [...new Set([...[...freq.entries()]
    .filter(([g]) => g.length >= 2)
    .sort((a, b) => b[0].length - a[0].length || b[1] - a[1])
    .slice(0, n)
    .map(([w]) => w), ...extra])]
}

async function searchOne(q, limit = 3) {
  try {
    const d = await getJson(API + '/memes?q=' + encodeURIComponent(q) + '&limit=' + limit)
    return Array.isArray(d.items) ? d.items : []
  } catch { return [] }
}

// ============ 热度：陌生人认不认识 ============
import { existsSync as existsSync2, readFileSync as readFileSync2, writeFileSync as writeFileSync2 } from 'node:fs'
import { homedir as homedir2 } from 'node:os'

const HEAT_INDEX_FILE = new URL('./heat_index.json', import.meta.url)
let HEAT_INDEX = {}
try { HEAT_INDEX = JSON.parse(readFileSync(HEAT_INDEX_FILE, 'utf8')) || {} } catch {}

const pluginDir = fileURLToPath(new URL('.', import.meta.url))
const USER_LEX_FILE = join(process.env.DSH_HOME || join(homedir2(), '.dsh'), 'meme-user-lexicon.json')
const SETTINGS_FILE = join(process.env.DSH_HOME || join(homedir2(), '.dsh'), 'meme-settings.json')
const HEAT_FILE = join(process.env.DSH_HOME || join(homedir2(), '.dsh'), 'meme-heat-cache.json')
let HEAT_CACHE = {}
try { HEAT_CACHE = JSON.parse(readFileSync2(HEAT_FILE, 'utf8')) || {} } catch {}

const IP_TAGS = ['原神', '米哈游', '明日方舟', '崩坏', '星穹铁道', '王者荣耀', '第五人格', '鸣潮', '绝区零']

function heatLevelOf(view) {
  if (view >= 1000000) return 'broad'
  if (view >= 100000) return 'medium'
  if (view >= 10000) return 'narrow'
  return 'niche'
}

async function heatOf(bvid, tags) {
  let view = null
  if (bvid) {
    const key = String(bvid)
    const cached = HEAT_CACHE[key]
    if (cached && Date.now() - (cached.at || 0) < 7 * 86400000) {
      view = cached.view
    } else {
      try {
        const r = await fetch('https://api.bilibili.com/x/web-interface/view?bvid=' + encodeURIComponent(key), {
          headers: { 'user-agent': 'Mozilla/5.0', accept: 'application/json' },
        })
        const d = await r.json()
        if (d && d.code === 0 && d.data && d.data.stat) {
          view = d.data.stat.view
          HEAT_CACHE[key] = { view, at: Date.now() }
          try { writeFileSync2(HEAT_FILE, JSON.stringify(HEAT_CACHE)) } catch {}
        }
      } catch {}
    }
  }
  let level = view === null ? 'unknown' : heatLevelOf(view)
  const circleOnly = (tags || []).some((t) => IP_TAGS.some((ip) => String(t).includes(ip)))
  if (circleOnly && level !== 'unknown') level = level === 'broad' ? 'medium' : 'niche'
  return { level, view, circle_only: circleOnly }
}


// ============ 模型重排（可选，走中转站小模型） ============
const SUGGEST_CFG = join(process.env.DSH_HOME || join(homedir2(), '.dsh'), 'meme-suggest.json')
let SC = { enabled: false, baseURL: '', apiKey: '', model: '' }
try { SC = { ...SC, ...(JSON.parse(readFileSync2(SUGGEST_CFG, 'utf8')) || {}) } } catch {}

async function rerankWithModel(ctxText, candidates) {
  if (!SC.enabled || !SC.apiKey || !SC.baseURL || !SC.model) return null
  const list = candidates.slice(0, 20).map((c, i) => i + 1 + '. ' + c.title + ' [' + (c.tags_raw || []).slice(0, 3).join('/') + ']').join('\n')
  const body = {
    model: SC.model,
    messages: [
      { role: 'system', content: '你是中文网络用语顾问。只输出 JSON，不要解释。' },
      { role: 'user', content: '对方说：「' + ctxText + '」\n下面这些梗，挑 0~3 个最合适接这句话的。规则：\n1) 必须和这句话的具体处境相关（职场/情绪/日常），不能只是“理论上能接”\n2) 游戏、动画、特定作品的角色梗，除非这句话本身在聊那个作品，否则不要选\n3) 宁可少选，也不要凑数；一个都不合适就返回 []\n' + list + '\n输出格式：[{"title":"梗名","why":"一句话理由（不超过20字）"}]' },
    ],
    max_completion_tokens: 300,
  }
  try {
    const r = await fetch(SC.baseURL.replace(/\/$/, '') + '/chat/completions', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Bearer ' + SC.apiKey },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(25000),
    })
    const d = await r.json()
    const text = (d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content) || ''
    const m = text.match(/\[[\s\S]*\]/)
    if (!m) return null
    const arr = JSON.parse(m[0])
    return Array.isArray(arr) ? arr.slice(0, 3) : null
  } catch { return null }
}


// ============ 时效：还在不在有人用 ============
const FRESH_CACHE_FILE = join(process.env.DSH_HOME || join(homedir2(), '.dsh'), 'meme-fresh-cache.json')
let FRESH_CACHE = {}
try { FRESH_CACHE = JSON.parse(readFileSync2(FRESH_CACHE_FILE, 'utf8')) || {} } catch {}

// 不同品类的半衰期（天）：表情包活得久，时事的梗死得快
function halfLifeOf(tags) {
  const t = (tags || []).join(' ')
  if (/表情包|图像梗/.test(t)) return 365
  if (/文字梗|网络用语|口头禅|谐音梗|句式/.test(t)) return 150
  if (/科技|AI梗|时事|新闻/.test(t)) return 45
  if (/游戏梗|电竞/.test(t)) return 120
  return 120
}

async function freshnessOf(title, tags) {
  const key = String(title || '')
  if (!key) return { score: 0, label: 'unknown' }
  const cached = FRESH_CACHE[key]
  if (cached && Date.now() - (cached.at || 0) < 24 * 3600000) return cached.value

  let lastUsedDays = null
  let recent30 = 0
  try {
    const url = 'https://api.bilibili.com/x/web-interface/search/all/v2?keyword=' + encodeURIComponent(key)
    const r = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0', referer: 'https://www.bilibili.com/' } })
    const d = await r.json()
    const vids = ((d.data && d.data.result) || []).find((x) => x.result_type === 'video')
    const arr = (vids && vids.data) || []
    const now = Date.now() / 1000
    const pubdates = arr.map((v) => v.pubdate).filter(Boolean)
    if (pubdates.length) {
      const newest = Math.max(...pubdates)
      lastUsedDays = Math.round((now - newest) / 86400)
      recent30 = pubdates.filter((p) => now - p <= 30 * 86400).length
    }
  } catch {}

  // 易用性：场景越广、梗越好用 → 寿命越长（大哥 2026-10-27 的观察）
  const tagText = (tags || []).join(' ')
  let applicability = 0.3
  if (/句式模板|句式套用|口头禅|网络用语/.test(tagText)) applicability += 0.4   // 可以随便套
  if (/谐音梗|缩写梗/.test(tagText)) applicability += 0.2
  if (recent30 >= 15) applicability += 0.3                                     // 最近还在被大量使用
  else if (recent30 >= 5) applicability += 0.15
  applicability = Math.min(1, applicability)

  const half = Math.round(halfLifeOf(tags) * (1 + 0.8 * applicability))
  let score = 0
  if (lastUsedDays !== null) score = Math.exp(-lastUsedDays / half)
  const recentBoost = Math.min(recent30 / 10, 1) * 0.3
  score = Math.min(1, score * 0.8 + recentBoost)
  // 最近 30 天一条新的都没有 = 实际上没人用了，不管半衰期多长
  if (recent30 === 0 && (lastUsedDays === null || lastUsedDays > 30)) score = Math.min(score, 0.25)
  // 超过 1.5 个半衰期
  if (lastUsedDays !== null && lastUsedDays > half * 1.5) score = Math.min(score, 0.2)

  const label = score >= 0.6 ? 'fresh' : score >= 0.3 ? 'usable' : score > 0 ? 'stale' : 'unknown'
  const value = { score: Number(score.toFixed(2)), label, last_used_days: lastUsedDays, recent30, half_life_days: half, applicability: Number(applicability.toFixed(2)) }
  FRESH_CACHE[key] = { value, at: Date.now() }
  try { writeFileSync2(FRESH_CACHE_FILE, JSON.stringify(FRESH_CACHE)) } catch {}
  return value
}

// ============ 鱼八股检查（照 house/技巧 的十条） ============
const BAN = [
  [/我认了|这条我认|我认/, '认了式认同'],
  [/我记下了|记下了/, '打卡式记录'],
  [/说到根上/, '点评腔'],
  [/不是[^，。]{1,12}，?而是/, '不是A而是B对仗'],
  [/这本身|本质上|归根结底/, '总结腔'],
  [/与其[^，。]{1,12}不如|看似[^，。]{1,12}实则|不仅[^，。]{1,12}而且/, '作文腔'],
  [/总之|所以说|由此可见/, '开头总结'],
  [/作为(一个)?(AI|一条鱼|助手)/, '身份挡箭牌'],
  [/已阅|看完了/, '打卡'],
  [/值得注意的是|需要指出的是/, '论文腔'],
]

function fishCheck(text) {
  const hits = []
  for (const [re, name] of BAN) {
    const m = text.match(re)
    if (m) hits.push({ kind: name, sample: m[0] })
  }
  return hits
}

const norm = (s) => String(s || '').toLowerCase().replace(/[\s\p{P}\p{S}]/gu, '')

function lcs(a, b) {
  let best = 0
  const dp = new Array(b.length + 1).fill(0)
  for (let i = 1; i <= a.length; i++) {
    let prev = 0
    for (let j = 1; j <= b.length; j++) {
      const t = dp[j]
      dp[j] = a[i - 1] === b[j - 1] ? prev + 1 : 0
      if (dp[j] > best) best = dp[j]
      prev = t
    }
  }
  return best
}

function titleScore(originalText, item) {
  const Q = norm(originalText)
  if (!Q) return 0
  const names = [item.title, ...(item.aliases || [])].map(norm).filter(Boolean)
  let best = 0
  for (const n of names) {
    if (Q.includes(n)) best = Math.max(best, 100 + Math.min(n.length, 8))
    else if (n.includes(Q) && Q.length >= 3) best = Math.max(best, 80 + Q.length)
    else {
      const l = lcs(Q, n)
      if (l >= 3 && l / n.length >= 0.6) best = Math.max(best, l * 8)
    }
  }
  return Math.max(best, Math.min(79, aliasBoost(originalText, item)))
}

// 慎用词表：语义风险靠词表，不靠标签
const CARE_WORDS = [
  ['遥遥领先', '可能带出品牌或时事联想，看上下文'],
  ['躺平', '容易被读成消极，别替人贴标签'],
  ['不想努力', '容易被读成消极，别替人贴标签'],
  ['鼠鼠', '自嘲味重，不能放进严肃段落'],
  ['芭比Q', '夸张负面，别用在真实事故上'],
  ['雪糕刺客', '消费争议语境明显'],
  ['拿来吧你', '索取语气，别指向具体人或群体'],
  ['孔乙己', '阶级话题敏感'],
  ['小镇做题家', '群体标签敏感'],
  ['韭菜', '群体贬义'],
  ['润了', '敏感迁移联想'],
]

// 出处三档（知止 2026-10-27）：complete 有 BV+作者 / partial 只有 BV / missing 都没有
function provenanceOf(item) {
  const v = (item && item.source_video) || {}
  if (v.bvid && v.creator_name) return 'complete'
  if (v.bvid) return 'partial'
  return 'missing'
}

const PROVIDENCE_TEXT = {
  complete: '出处已核',
  partial: '作者未核',
  missing: '出处缺失',
}

const RISKY_TAGS = ['争议', '讽刺', '反讽', '嘲讽', '阴阳怪气', '地狱笑话', '擦边', '黑称', '网络暴力', '政治梗', '造谣', '抄袭', '学历歧视', '塌房', '黑红', '辱', '死亡', '烂梗']
const PLACE_NAMES = { '视频梗': '片段', '图像梗': 'P图', '文字梗': '语言', '音乐梗': '音乐' }
// ============ 玩梗：识别 / 语境 / 回法 ============
const LEX_FILE = new URL('./lexicon.json', import.meta.url)
let MEME_LEX = [
  // tier: live=还在被人当梗用 / fading=退潮中 / common=已退化成常用语（不当梗处理） / slang=行话
  ['yyds', 'yyds', 'fading'],
  ['绝绝子', '绝绝子', 'fading'],
  ['破防', '破防', 'live'],
  ['破防了', '破防', 'live'],
  ['尊嘟假嘟', '尊嘟假嘟', 'fading'],
  ['芭比Q', '芭比Q', 'fading'],
  ['鼠鼠我啊', '鼠鼠', 'live'],
  ['鼠鼠', '鼠鼠', 'live'],
  ['摆烂', '摆烂', 'common'],
  ['躺平', '躺平', 'common'],
  ['遥遥领先', '遥遥领先', 'live'],
  ['雪糕刺客', '雪糕刺客', 'fading'],
  ['耗子尾汁', '耗子尾汁', 'fading'],
  ['拿来吧你', '拿来吧你', 'live'],
  ['电子榨菜', '电子榨菜', 'live'],
  ['赛博功德', '赛博功德', 'live'],
  ['我真的会谢', '我真的会谢', 'fading'],
  ['绷不住了', '绷不住', 'live'],
  ['难崩', '绷不住', 'common'],
  ['笑死', '笑死', 'common'],
  ['草', '草', 'slang'],
  ['乐', '乐', 'slang'],
  ['乐乐', '乐', 'slang'],
  ['666', '666', 'fading'],
  ['典', '典', 'slang'],
  ['急了', '急了', 'live'],
  ['大肥鱼', '大肥鱼', 'live'],
  ['鱼八股', '鱼八股', 'live'],
  ['傻福', '傻福', 'slang'],
  ['摆', '摆烂', 'slang'],
  ['润', '润', 'fading'],
  ['典中典', '典', 'live'],
  ['急了急了', '急了', 'live'],
  ['家人们', '家人们', 'common'],
  ['谁懂啊', '谁懂啊', 'common'],
  ['狠狠爱住', '爱住', 'fading'],
  ['已阅', '已阅', 'slang'],
]
const ALIAS_FILE = new URL('./aliases.json', import.meta.url)
let ALIAS = {}
try {
  const raw = JSON.parse(readFileSync(LEX_FILE, 'utf8'))
  if (Array.isArray(raw) && raw.length) MEME_LEX = raw
} catch {}
try {
  ALIAS = JSON.parse(readFileSync(ALIAS_FILE, 'utf8')) || {}
} catch {}

const REVIEW_FILE = new URL('./tiers_review.json', import.meta.url)
const PATTERN_FILE = new URL('./patterns.json', import.meta.url)
let PATTERNS = []
try {
  const raw = JSON.parse(readFileSync(PATTERN_FILE, 'utf8'))
  PATTERNS = (raw && raw.patterns) || []
} catch {}

const REACTION_FILE = new URL('./reaction_map.json', import.meta.url)
let REACTIONS = []
try {
  const raw = JSON.parse(readFileSync(REACTION_FILE, 'utf8'))
  REACTIONS = (raw && raw.scenes) || []
} catch {}

const EVASION_FILE = new URL('./evasion.json', import.meta.url)
let EVASION = []
try { EVASION = (JSON.parse(readFileSync(EVASION_FILE, 'utf8')) || {}).items || [] } catch {}

function detectEvasion(text) {
  const hits = []
  const v = normalizeVariant(text)
  for (const it of EVASION) {
    for (const w of it.variants || []) {
      const nw = normalizeVariant(w)
      if (nw && v.includes(nw)) { hits.push({ canonical: it.canonical, matched: w, level: it.level, note: it.note }); break }
    }
  }
  return hits
}
const VARIANT_FILE = new URL('./variants.json', import.meta.url)
let VARIANT = { emoji_map: {}, manual: {} }
try {
  const raw = JSON.parse(readFileSync(VARIANT_FILE, 'utf8'))
  VARIANT = { emoji_map: (raw && raw.emoji_map) || {}, manual: (raw && raw.manual) || {} }
} catch {}

// 变体归一化：emoji → 汉字、去空格标点、压缩重复、小写
function normalizeVariant(text) {
  let s = String(text || '')
  for (const [emo, ch] of Object.entries(VARIANT.emoji_map)) {
    s = s.split(emo).join(ch)
  }
  s = s.toLowerCase().replace(/[\s\p{P}\p{S}]/gu, '')
  // 「冰冰冰」和「冰」都能对上：不做压缩，交给匹配层
  return s
}

const AUTO_FILE = new URL(process.env.DSH_MEME_LEXICON || './lexicon_all.json', import.meta.url)
let AUTO_LEX = []
try {
  const raw = JSON.parse(readFileSync(AUTO_FILE, 'utf8'))
  if (Array.isArray(raw)) AUTO_LEX = raw.filter((x) => x && x.title && x.slug)
} catch {}

// 评论区高频（2026-10-27 扫 220 个视频的评论 + 楼中楼）
const COMMENT_FILE = new URL('./lexicon_comment.json', import.meta.url)
try {
  const rows = JSON.parse(readFileSync(COMMENT_FILE, 'utf8'))
  const have4 = new Set(AUTO_LEX.map((e) => e.title))
  if (Array.isArray(rows)) for (const e of rows) {
    if (!e || !e.title || have4.has(e.title)) continue
    AUTO_LEX.push(e); have4.add(e.title)
  }
} catch {}
// 弹幕高频短语（2026-10-27 扫 160 条热门视频得来）：这些是「正在被使用」的证据
const DANMAKU_FILE = new URL('./lexicon_danmaku.json', import.meta.url)
try {
  const raw = JSON.parse(readFileSync(DANMAKU_FILE, 'utf8'))
  if (Array.isArray(raw) && raw.length) {
    const have = new Set(AUTO_LEX.map((e) => e.title))
    for (const e of raw) if (e.title && !have.has(e.title)) AUTO_LEX.push(e)
  }
} catch {}

// 用户自己录的条目（2026-10-27）：kind=meme 当梗，kind=phrase 当私人口癖
function loadUserLexicon() {
  let rows = []
  try { rows = JSON.parse(readFileSync(USER_LEX_FILE, "utf8")) || [] } catch { return 0 }
  const have = new Set(AUTO_LEX.map((e) => e.title))
  let added = 0
  for (const e of rows) {
    if (!e || !e.title || have.has(e.title)) continue
    const isPhrase = e.kind ? e.kind === 'phrase' : (/自创|自己编/.test(String(e.source || '')) || e.sourceType === '自创')
    AUTO_LEX.push({
      title: e.title,
      slug: "user:" + e.title,
      tags_raw: [isPhrase ? "私人用语" : "用户录入"],
      bvid: null,
      creator: e.source || null,
      provenance: e.sourceType === "有 BV" && e.source ? "partial" : "missing",
      source: "user",
      kind: isPhrase ? "phrase" : "meme",
      tier: isPhrase ? "slang" : "live",
      meaning: e.meaning || "",
      avoid: e.avoid || "",
    })
    have.add(e.title); added++
  }
  return added
}
loadUserLexicon()
// 学自 openwrite：用内容指纹而不是 mtime（同毫秒内两次写入 mtime 可能相同）
let _userLexRev = ''
function maybeReloadUserLex() {
  try {
    const raw = readFileSync(USER_LEX_FILE, 'utf8')
    const rev = String(raw.length) + ':' + createHash('sha256').update(raw).digest('hex').slice(0, 16)
    if (rev !== _userLexRev) { _userLexRev = rev; loadUserLexicon() }
  } catch {}
}
// 口语/抽象补充（2026-10-27）：公开梗库不收这类词
const SLANG_FILE = new URL('./slang.json', import.meta.url)
try {
  const raw = JSON.parse(readFileSync(SLANG_FILE, 'utf8'))
  const have2 = new Set(AUTO_LEX.map((e) => e.title))
  for (const it of (raw && raw.items) || []) {
    if (!it.title || have2.has(it.title)) continue
    AUTO_LEX.push({ title: it.title, slug: "slang:" + it.title, tags_raw: it.tags || [], bvid: null, creator: null, provenance: "missing", source: "slang", kind: it.tier, tier: it.tier || "slang", aliases: it.aliases || [], meaning: it.meaning || "" })
    have2.add(it.title)
  }
} catch {}
// 人工复核（见微 2026-10-27）：覆盖自动档位
let REVIEW = []
try {
  const raw = JSON.parse(readFileSync(REVIEW_FILE, 'utf8'))
  REVIEW = Array.isArray(raw) ? raw : (raw && raw.reviews) || []
} catch {}
const reviewBySlug = new Map(REVIEW.map((r) => [r.slug, r]))
AUTO_LEX = AUTO_LEX.map((e) => {
  const r = reviewBySlug.get(e.slug)
  return r ? { ...e, tier: r.should, tier_source: 'human', why: r.why } : { ...e, tier_source: 'auto' }
})

// 标题直接命中：比关键词检索可靠得多（标题是强证据）
function titleHits(text) {
  const q = norm(text)
  if (!q) return []
  const out = []
  for (const e of AUTO_LEX) {
    const t = norm(e.title)
    if (!t || t.length < 2) continue
    if (q.includes(t)) out.push({ ...e, hitLen: t.length })
  }
  return out.sort((a, b) => b.hitLen - a.hitLen).slice(0, 3)
}

// 别名只做检索入口：命中最高给 79，只能进 alternatives（知止 2026-10-27 定）
function aliasBoost(text, item) {
  const t = String(text || '')
  for (const [alias, canonical] of Object.entries(ALIAS)) {
    if (t.includes(alias) && item && (String(item.title) === canonical || String(item.slug) === canonical)) return 79
  }
  return 0
}

const CONTEXT_RULES = [
  { type: '正事', cues: [/帮我|请看|麻烦|为什么|怎么|报错|错误|失败|截止|明天|钱|额度|部署|安装|配置|修/], weight: 2 },
  { type: '讽刺', cues: [/呵呵|真棒|厉害|牛啊|哦是吗|不愧是|又是你/, /[“”"].+[“”"]/], weight: 2 },
  { type: '调侃', cues: [/哈哈|草|乐|笑死|绷不住|笑出声|梗|玩梗|爽|躺赢|带飞|大爹|上分|下饭|就这/, /[😂🤣😅🐶]/u], weight: 2 },
  { type: '情绪', cues: [/烦|累|崩|焦虑|难受|失眠|压力/, /[😭😞😔]/u], weight: 2 },
]

function splitClauses(text) {
  return String(text || '').split(/[，。！？!?,;；\n]+/).map((s) => s.trim()).filter(Boolean)
}

function detectPatterns(text) {
  const out = []
  for (const p of PATTERNS) {
    try {
      const re = new RegExp(p.re)
      const m = text.match(re)
      if (m) out.push({ span: m[0], canonical: p.label, tier: 'live', kind: 'template', at: m.index || 0, confidence: 'high', tags: p.tags || [] })
    } catch {}
  }
  return out
}

// 反应梗：对方说的内容属于哪类场景 → 该甩哪张图
function detectReactionScene(text) {
  const hits = []
  for (const s of REACTIONS) {
    let score = 0
    const cues = []
    for (const c of s.cues) {
      try {
        if (new RegExp(c).test(text)) { score += 1; cues.push(c) }
      } catch {}
    }
    if (score > 0) hits.push({ id: s.id, name: s.name, score, cues, reaction: s.reaction, usage: s.usage })
  }
  return hits.sort((a, b) => b.score - a.score)
}

function detectMemes(text) {
  const found = []
  const seen = new Set()
  for (const [word, canonical, tier] of MEME_LEX) {
    let idx = text.indexOf(word)
    while (idx >= 0) {
      const key = word + '@' + idx
      if (!seen.has(key)) {
        seen.add(key)
        found.push({ span: word, canonical, tier: tier || 'live', at: idx, confidence: word.length >= 2 ? 'high' : 'medium' })
      }
      idx = text.indexOf(word, idx + 1)
    }
  }
  // 变体匹配：把 emoji/谐音归一化后再找标题
  const vText = normalizeVariant(text)
  for (const e of AUTO_LEX) {
    const w = String(e.title || '')
    if (w.length < 2) continue
    const vw = normalizeVariant(w)
    if (!vw || vw.length < 2) continue
    if (vText.includes(vw) && !text.includes(w)) {
      const key = 'v:' + w
      if (!seen.has(key)) {
        seen.add(key)
        found.push({ span: vw, canonical: w, tier: e.tier || 'live', at: 0, confidence: 'medium', source: 'variant', slug: e.slug, bvid: e.bvid || null })
      }
    }
  }
  // 手写变体表（如 🧊🧊🧊 → 冰冰冰）
  for (const [canonical, list] of Object.entries(VARIANT.manual || {})) {
    for (const v of list) {
      const vv = normalizeVariant(v)
      if (vv && vText.includes(vv)) {
        const key = 'm:' + canonical + ':' + vv
        if (!seen.has(key)) {
          seen.add(key)
          found.push({ span: vv, canonical, tier: 'live', at: 0, confidence: 'high', source: 'manual-variant' })
        }
      }
    }
  }

  // 别名命中（slug 词条的 aliases 字段）：口语词靠别名才认得出来
  for (const e of AUTO_LEX) {
    if (!Array.isArray(e.aliases) || !e.aliases.length) continue
    for (const al of e.aliases) {
      const a = String(al || "")
      if (a.length < 2 || !text.includes(a)) continue
      const key = "al:" + e.title + ":" + a
      if (seen.has(key)) continue
      seen.add(key)
      found.push({ span: a, canonical: e.title, tier: e.tier || "slang", at: text.indexOf(a), confidence: "high", source: "alias", slug: e.slug })
    }
  }
  // 自动词表（含人工复核档位）：标题直接出现在句子里才算
  for (const e of AUTO_LEX) {
    const w = String(e.title || '')
    if (w.length < 2 || w.length > 12) continue
    if (!text.includes(w)) continue
    const key = w + '@' + text.indexOf(w)
    if (seen.has(key)) continue
    seen.add(key)
    found.push({ span: w, canonical: w, tier: e.tier || 'live', at: text.indexOf(w), confidence: 'high', source: e.tier_source || 'auto', slug: e.slug, bvid: e.bvid || null })
  }

  // 同一 canonical 只留一条（优先 manual-variant / 高置信度）
  const byCanon = new Map()
  for (const f of found) {
    const k = f.canonical
    const prev = byCanon.get(k)
    if (!prev) { byCanon.set(k, f); continue }
    const rank = (x) => (x.source === 'manual-variant' ? 3 : x.source === 'variant' ? 2 : 1)
    if (rank(f) > rank(prev)) byCanon.set(k, f)
  }
  found.length = 0
  found.push(...byCanon.values())

  found.sort((a, b) => b.span.length - a.span.length)
  const kept = []
  for (const f of found) {
    const end = f.at + f.span.length
    const overlap = kept.some((k) => f.at < k.at + k.span.length && end > k.at)
    if (!overlap) kept.push(f)
  }
  return kept.sort((a, b) => a.at - b.at)
}

function classifyContext(text, memes) {
  const scores = new Map()
  for (const r of CONTEXT_RULES) {
    let s = 0
    for (const re of r.cues) if (re.test(text)) s += r.weight
    if (s) scores.set(r.type, (scores.get(r.type) || 0) + s)
  }
  // 句长信号：很短 + 有梗 → 更像调侃
  if (text.length <= 8 && memes.length) scores.set('调侃', (scores.get('调侃') || 0) + 1)
  if (!scores.size) scores.set('普通', 1)
  // 同分时的次序：有梗 → 调侃优先；没梗 → 正事优先
  const order = memes.length ? ['讽刺', '调侃', '情绪', '正事', '普通'] : ['讽刺', '情绪', '正事', '调侃', '普通']
  const ranked = [...scores.entries()].sort((a, b) => b[1] - a[1] || order.indexOf(a[0]) - order.indexOf(b[0]))
  return { type: ranked[0][0], scores: Object.fromEntries(ranked) }
}

const PERSONA_FILE = new URL('./personas.json', import.meta.url)
const BANKS_FILE = new URL('./persona_banks.json', import.meta.url)
function personaBank(id) {
  try { const j = JSON.parse(readFileSync(BANKS_FILE, 'utf8')); const it = (j.items || []).find((x) => x.id === id); return it ? it.lines : [] } catch { return [] }
}

function loadPersonas() {
  try { return (JSON.parse(readFileSync(PERSONA_FILE, 'utf8')) || {}).items || [] } catch { return [] }
}
function currentPersona() {
  const id = loadSettings().persona || 'steady'
  return loadPersonas().find((p) => p.id === id) || { id: 'steady', name: '稳重', style: '克制', sample: '' }
}

// 学自 dsh-vision-router：错误文本先脱敏，别把本机路径回传出去
function redactPaths(text) {
  // 学自 open-pets 的 sanitizeStatusLine：压平换行、去掉 URL、替换路径、截断
  let s = String(text == null ? '' : text).replace(/[\r\n]+/g, ' ')
  s = s.replace(/https?:\/\/\S+/gi, '<url>')
  s = s.replace(/[A-Za-z]:\\[^\s"']+/g, '<path>')
  s = s.replace(/\/(?:home|Users|root)\/[^\s"']+/g, '<path>')
  s = s.trim().slice(0, 400)
  // 学自 dsh-im：按字节再兜一层（多字节字符按字符截断可能仍然过长）
  if (Buffer.byteLength(s) > 1200) s = s.slice(0, 300) + '…'
  return s
}
// 学自 dshmarket：原子写，崩在写一半也不会把设置/词表截断
// 学自 dsh-vision-toolkit：Windows 上杀毒/索引会短暂锁住刚写的文件（EBUSY/EPERM/EACCES），重试几次再报错
function withWindowsRetry(fn, attempts = 4) {
  let last
  for (let i = 1; i <= attempts; i++) {
    try { return fn() } catch (e) {
      last = e
      const transient = process.platform === 'win32' && (e.code === 'EBUSY' || e.code === 'EPERM' || e.code === 'EACCES')
      if (!transient || i === attempts) throw e
      try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 120 * i) } catch {}
    }
  }
  throw last
}

// 学自 dsh-ops：配置严格校验（未知键拒绝、范围检查、错误信息可操作）
function normalizeSettings(raw) {
  const def = { tendency: 1, density: 1, allowRisky: false, autoUpdate: true, persona: 'steady' }
  const out = { ...def }
  if (!raw || typeof raw !== 'object') return out
  if (Number.isInteger(raw.tendency) && raw.tendency >= 0 && raw.tendency <= 2) out.tendency = raw.tendency
  if (Number.isInteger(raw.density) && raw.density >= 0 && raw.density <= 3) out.density = raw.density
  if (typeof raw.allowRisky === 'boolean') out.allowRisky = raw.allowRisky
  if (typeof raw.autoUpdate === 'boolean') out.autoUpdate = raw.autoUpdate
  if (typeof raw.persona === 'string' && /^[a-z][a-z0-9-]{1,30}$/.test(raw.persona)) out.persona = raw.persona
  return out
}

// 学自 dsh-vision-toolkit：写词表前加锁，防面板与工具同时写互相覆盖
function withLexiconLock(fn, timeoutMs = 2000) {
  const lock = USER_LEX_FILE + '.lock'
  const started = Date.now()
  for (;;) {
    try {
      const fd = openSync(lock, 'wx')
      try { writeFileSync(fd, String(process.pid)) } finally { closeSync(fd) }
      break
    } catch (e) {
      if (e.code !== 'EEXIST') break
      try {
        const st = statSync(lock)
        if (Date.now() - st.mtimeMs > 15000) { rmSync(lock, { force: true }); continue }
      } catch {}
      if (Date.now() - started > timeoutMs) break
      try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 50) } catch {}
    }
  }
  try { return fn() } finally { try { rmSync(lock, { force: true }) } catch {} }
}

function writeFileAtomic(file, content) {
  const tmp = file + '.tmp-' + process.pid + '-' + Date.now()
  try {
    withWindowsRetry(() => writeFileSync(tmp, content))
    withWindowsRetry(() => renameSync(tmp, file))
  } catch (e) {
    try { rmSync(tmp, { force: true }) } catch {}
    throw e
  }
}

// 学自 dshmarket：用户可能用记事本改过文件，UTF-8 BOM 会让 JSON.parse 直接失败
// 学自 dsh-im 的 ERROR_MESSAGES：每个错误码配一句人能照着做的解释
const ERROR_HINTS = {
  NO_TEXT: 'OCR 没读到字：图片可能太小、只有表情，或字体被特效覆盖。',
  MATCH_FAILED: '表情匹配脚本跑失败：多半是 Python 缺 opencv，装一下 opencv-python-headless。',
  BODY_TOO_LARGE: '请求体超过 32KB：面板一次只接受小请求。',
  EMPTY_TEXT: '输入是空的，先给一句话。',
  EMPTY_PATH: '没给图片路径。',
  DOWNLOAD_FAILED: '视频下载失败：检查 yt-dlp 是否安装、链接是否可访问。',
  CLONE_FAILED: '拉取云端词库失败：检查 git 与网络。',
}
function failWithHint(code, extra) {
  return { ok: false, error: code, hint: ERROR_HINTS[code] || '', ...(extra || {}) }
}

function stripBom(text) {
  return text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text
}

function loadSettings() {
  try { return normalizeSettings(JSON.parse(stripBom(readFileSync(SETTINGS_FILE, 'utf8')))) } catch { return normalizeSettings(null) }
}

function replyPolicy(context, memes) {
  const real = memes.filter((m) => m.tier === 'live' || m.tier === 'fading')
  const t = context.type
  if (t === '正事') return { use_meme: false, why: '在聊正事，先给答案，别玩梗', max: 0 }
  if (t === '情绪') return { use_meme: false, why: '先接住情绪，玩梗会显得敷衍', max: 0 }
  if (t === '讽刺') return { use_meme: false, why: '对方在阴阳，玩梗等于对喷，先顺着说', max: 0 }
  const st = loadSettings()
  if (t === '调侃') return {
    use_meme: real.length > 0 && st.density > 0 && st.tendency > 0,
    why: st.tendency === 0 ? '你在稳重模式，先不玩梗' : '对方在开玩笑，最多接 ' + st.density + ' 个',
    max: st.density,
  }
  return { use_meme: real.length > 0 && st.density > 0 && st.tendency > 0, why: '普通语气，最多 ' + st.density + ' 个轻梗', max: st.density }
}
