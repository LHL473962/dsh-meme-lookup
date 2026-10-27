// 工具层 B：判定 / 对话 / 建议 / 写作 / 人格 / 设置 / 加梗（从 lib/tools.js 拆出，v1.6.1）
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
  PY,
  run,
  ffmpegPath,
  ocrImage,
  keywords,
  searchOneStrict,
  HEAT_INDEX,
  USER_LEX_FILE,
  SETTINGS_FILE,
  heatLevelOf,
  heatOf,
  SC,
  rerankWithModel,
  freshnessOf,
  fishCheck,
  norm,
  titleScore,
  CARE_WORDS,
  provenanceOf,
  PROVIDENCE_TEXT,
  RISKY_TAGS,
  PLACE_NAMES,
  MEME_LEX,
  detectEvasion,
  AUTO_LEX,
  maybeReloadUserLex,
  titleHits,
  splitClauses,
  detectPatterns,
  detectReactionScene,
  detectMemes,
  classifyContext,
  PERSONA_FILE,
  personaBank,
  currentPersona,
  redactPaths,
  withFileLock,
  withLexiconLock,
  writeIfChanged,
  writeFileAtomic,
  looksLikeSecret,
  failWithHint,
  loadSettings,
  replyPolicy
} from './engine.js'

const textOutput = {
  schema: { type: 'object', properties: {}, additionalProperties: true },
  render: (_args, value) => [{
    type: 'text',
    text: typeof value === 'string' ? value : JSON.stringify(value, null, 2),
  }],
}

const clip = (s, n = 400) => (typeof s === 'string' && s.length > n ? s.slice(0, n) + '…' : s)

export function registerTextTools(ctx) {
  // 学自 dsh-tools：参数必须是 JSON Schema（{type:object,properties}），扁平 map 会被 provider 拒
  const registerTool = (def) => {
    if (def && def.parameters && def.parameters.type !== 'object') {
      def.parameters = { type: 'object', properties: def.parameters, additionalProperties: false }
    }
    return ctx.tools.register(def)
  }
  registerTool({
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
        let upstreamCode = null
        for (const k of kws) {
          let items = []
          try { items = await searchOneStrict(k, 3) } catch (e) {
            upstreamCode = (e && e.code) || 'UPSTREAM_ERROR'
            continue
          }
          for (const it of items) {
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
          // 上游限流/挂了，跟「真没收录」不是一回事：报错让调用方重试，别伪装成查不到
          if (upstreamCode) {
            return { ok: false, error: upstreamCode, hint: '上游检索暂时不可用（' + upstreamCode + '），本地没命中，稍后再试' }
          }
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
        let detailCode = null
        let detailStatus = 0
        try {
          const raw = await getJson(API + '/memes/' + encodeURIComponent(top.slug))
          detail = raw.item || raw
        } catch (e) { detailCode = (e && e.code) || 'UPSTREAM_ERROR'; detailStatus = (e && e.status) || 0 }

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
          // 404 = 词条被删/改名，是数据问题不是限流；单独给码，别混进 HTTP_ERROR 一起猜
          if (detailCode === 'HTTP_ERROR' && detailStatus === 404) {
            return { ok: false, error: 'ENTRY_GONE', hint: '词条详情 404（可能被删/改名），本地词表该更新了' }
          }
          // 详情没拉到 ≠ 真没出处：上游限流/挂了要报错，别把「没抓到」说成「无出处」
          if (detailCode) {
            return { ok: false, error: detailCode, hint: '出处详情拉取失败（' + detailCode + '），无法盖章，稍后再试' }
          }
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
          // 学自 dsh-im live-cot：输出要有界，不能因为条目多就把整份文档撑大
          advice: advice.slice(0, 12),
          advice_total: advice.length,
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
  registerTool({
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
  registerTool({
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
          // allowRisky 开关要真生效（此前只存不用，是个死设置）
          if (!loadSettings().allowRisky && tags.some((t) => RISKY_TAGS.some((r) => String(t).includes(r)))) continue
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
  registerTool({
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

        const allowRiskyNow = loadSettings().allowRisky
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
  registerTool({
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
        writeIfChanged(SETTINGS_FILE, JSON.stringify({ ...st, persona: found.id }, null, 2))
        return { ok: true, persona: found }
      }
      return { ok: false, error: 'BAD_ACTION' }
    },
  })
  registerTool({
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
        withFileLock(SETTINGS_FILE, () => writeIfChanged(SETTINGS_FILE, JSON.stringify(cur, null, 2)))
        return { ok: true, settings: cur }
      }
      return { ok: false, error: 'BAD_ACTION' }
    },
  })
  registerTool({
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
      if (looksLikeSecret(title)) return { ok: false, error: 'SECRET_LIKE_TITLE', hint: '这条看起来像密钥，不会存进词库' }
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
}
