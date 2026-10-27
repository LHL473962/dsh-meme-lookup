// 引擎层：识别 / 判定链 / 热度 / 时效 / 语境 / 人设
// 从 index.js 拆出（v1.6.0）。数据文件路径以 ../ 指回包根。
import { API, getJson } from './net.js'
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

// ============ 梗理解：抽帧 + OCR + 检索 ============

// 学自 dsh-im：profile 可能用符号链接/junction 装载插件，走 realpath 才能找到真实目录
const _pkgDir = (() => {
  try { return realpathSync(fileURLToPath(new URL('..', import.meta.url))) } catch { return fileURLToPath(new URL('..', import.meta.url)) }
})()
// 学自 dsh-memsearch：按 PATH+PATHEXT 找可执行文件，找不到就返回 null（不盲 spawn）
function findExecutable(command) {
  const isWin = process.platform === 'win32'
  const exts = isWin && !/\.[a-z0-9]+$/i.test(command)
    ? (process.env.PATHEXT || '.COM;.EXE;.BAT;.CMD').split(';').filter(Boolean)
    : ['']
  const dirs = /[/\\]/.test(command) ? [''] : String(process.env.PATH || '').split(delimiter).filter(Boolean)
  for (const d of dirs) for (const ext of exts) {
    const p = d ? join(d, command + ext) : command + ext
    try { if (existsSync(p)) return p } catch {}
  }
  return null
}

// 选一个能用的 Python：环境变量 > 本机已知 venv > PATH 上的 python
function resolvePython() {
  const env = process.env.DSH_PY || process.env.DSH_FRAMES_PY || process.env.DSH_OCR_PYEXE
  if (env && existsSync(env)) return env
  const cands = [
    'D:/Apps/dsh-soundcheck-src/engine/venv/Scripts/python.exe',
    join(homedir2(), '.dsh', 'bili-humanism', 'venv-frames', 'Scripts', 'python.exe'),
  ]
  for (const c of cands) { try { if (existsSync(c)) return c } catch {} }
  return findExecutable('python') || 'python'
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

const HEAT_INDEX_FILE = new URL('../heat_index.json', import.meta.url)
let HEAT_INDEX = {}
try { HEAT_INDEX = JSON.parse(readFileSync(HEAT_INDEX_FILE, 'utf8')) || {} } catch {}

const pluginDir = fileURLToPath(new URL('..', import.meta.url))
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
  // 学自 vision-router 的有界状态：缓存条目设上限，超了按最旧淘汰
  {
    const MAX = 500
    const ks = Object.keys(FRESH_CACHE)
    if (ks.length > MAX) {
      ks.sort((a, b) => (FRESH_CACHE[a].at || 0) - (FRESH_CACHE[b].at || 0))
      for (const k of ks.slice(0, ks.length - MAX)) delete FRESH_CACHE[k]
    }
  }
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
const LEX_FILE = new URL('../lexicon.json', import.meta.url)
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
const ALIAS_FILE = new URL('../aliases.json', import.meta.url)
let ALIAS = {}
try {
  const raw = JSON.parse(readFileSync(LEX_FILE, 'utf8'))
  if (Array.isArray(raw) && raw.length) MEME_LEX = raw
} catch {}
try {
  ALIAS = JSON.parse(readFileSync(ALIAS_FILE, 'utf8')) || {}
} catch {}

const REVIEW_FILE = new URL('../tiers_review.json', import.meta.url)
const PATTERN_FILE = new URL('../patterns.json', import.meta.url)
let PATTERNS = []
try {
  const raw = JSON.parse(readFileSync(PATTERN_FILE, 'utf8'))
  PATTERNS = (raw && raw.patterns) || []
} catch {}

const REACTION_FILE = new URL('../reaction_map.json', import.meta.url)
let REACTIONS = []
try {
  const raw = JSON.parse(readFileSync(REACTION_FILE, 'utf8'))
  REACTIONS = (raw && raw.scenes) || []
} catch {}

const EVASION_FILE = new URL('../evasion.json', import.meta.url)
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
const VARIANT_FILE = new URL('../variants.json', import.meta.url)
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

const AUTO_FILE = new URL(process.env.DSH_MEME_LEXICON || '../lexicon_all.json', import.meta.url)
let AUTO_LEX = []
try {
  const raw = JSON.parse(readFileSync(AUTO_FILE, 'utf8'))
  if (Array.isArray(raw)) AUTO_LEX = raw.filter((x) => x && x.title && x.slug)
} catch {}

// 评论区高频（2026-10-27 扫 220 个视频的评论 + 楼中楼）
const COMMENT_FILE = new URL('../lexicon_comment.json', import.meta.url)
try {
  const rows = JSON.parse(readFileSync(COMMENT_FILE, 'utf8'))
  const have4 = new Set(AUTO_LEX.map((e) => e.title))
  if (Array.isArray(rows)) for (const e of rows) {
    if (!e || !e.title || have4.has(e.title)) continue
    AUTO_LEX.push(e); have4.add(e.title)
  }
} catch {}
// 弹幕高频短语（2026-10-27 扫 160 条热门视频得来）：这些是「正在被使用」的证据
const DANMAKU_FILE = new URL('../lexicon_danmaku.json', import.meta.url)
try {
  const raw = JSON.parse(readFileSync(DANMAKU_FILE, 'utf8'))
  if (Array.isArray(raw) && raw.length) {
    const have = new Set(AUTO_LEX.map((e) => e.title))
    for (const e of raw) if (e.title && !have.has(e.title)) AUTO_LEX.push(e)
  }
} catch {}

// 学自 dsh-remote 的 method-policy：字段类型逐个收紧，脏数据不进内存
function normalizeUserEntry(e) {
  const str = (v, n) => (typeof v === 'string' ? v.trim().slice(0, n) : '')
  const arr = (v) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string').map((x) => x.slice(0, 40)).slice(0, 12) : [])
  return {
    ...e,
    title: str(e.title, 40),
    meaning: str(e.meaning, 500),
    usage: str(e.usage, 300),
    avoid: str(e.avoid, 200),
    example: str(e.example, 200),
    source: str(e.source, 300),
    sourceType: ['自创', '出处不详', '有 BV'].includes(e.sourceType) ? e.sourceType : '出处不详',
    tone: arr(e.tone),
    variants: arr(e.variants),
    visibility: e.visibility === 'public' ? 'public' : 'private',
    kind: e.kind === 'phrase' ? 'phrase' : 'meme',
  }
}

// 用户自己录的条目（2026-10-27）：kind=meme 当梗，kind=phrase 当私人口癖
function loadUserLexicon() {
  let rows = []
  try { rows = JSON.parse(stripBom(readFileSync(USER_LEX_FILE, 'utf8'))) || [] } catch { return 0 }
  // 学自 openviking：坏条目跳过并计数，不让一条脏数据拖垮整份词库
  const bad = []
  rows = (Array.isArray(rows) ? rows : []).filter((e, i) => {
    if (!e || typeof e !== 'object' || typeof e.title !== 'string' || !e.title.trim()) { bad.push(i); return false }
    return true
  })
  _userLexBad = bad.length
  rows = rows.map(normalizeUserEntry)
  const have = new Set(AUTO_LEX.map((e) => e.title))
  let added = 0
  for (const e of rows) {
    if (have.has(e.title)) continue
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
var _userLexBad = 0 // var：loadUserLexicon() 在声明之前就会被调用
function maybeReloadUserLex() {
  try {
    const raw = readFileSync(USER_LEX_FILE, 'utf8')
    const rev = String(raw.length) + ':' + createHash('sha256').update(raw).digest('hex').slice(0, 16)
    if (rev !== _userLexRev) { _userLexRev = rev; loadUserLexicon() }
  } catch {}
}
// 口语/抽象补充（2026-10-27）：公开梗库不收这类词
const SLANG_FILE = new URL('../slang.json', import.meta.url)
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

const PERSONA_FILE = new URL('../personas.json', import.meta.url)
const BANKS_FILE = new URL('../persona_banks.json', import.meta.url)
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
  // 学自 dsh-im 的 clean()：控制字符与格式字符（含零宽）一并清掉
  let s = String(text == null ? '' : text).replace(/[\p{Cc}\p{Cf}]+/gu, ' ').replace(/\s+/g, ' ')
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
// 通用文件锁（学自 vision-toolkit 的锁 + 心跳、dshmarket 的原子写）
function withFileLock(file, fn, timeoutMs = 2000) {
  const lock = file + '.lock'
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

function withLexiconLock(fn, timeoutMs = 2000) {
  return withFileLock(USER_LEX_FILE, fn, timeoutMs)
}

// 唯一的请求体读取实现（学自 wallpaper 的 http-body：累加 · 计闸 · 一次解码）
async function readBodyBounded(req, maxBytes = 32 * 1024) {
  let size = 0
  const chunks = []
  for await (const c of req) {
    const buf = Buffer.isBuffer(c) ? c : Buffer.from(c)
    size += buf.byteLength
    if (size > maxBytes) { const e = new Error('BODY_TOO_LARGE'); e.code = 'BODY_TOO_LARGE'; throw e }
    chunks.push(buf)
  }
  if (!chunks.length) return {}
  try { return JSON.parse(stripBom(Buffer.concat(chunks).toString('utf8')) || '{}') } catch { return {} }
}

// 学自 dsh-im 的 identity 思路：内容没变就不要写盘（避免无谓 mtime 变动与重载）
function writeIfChanged(file, content) {
  try {
    if (readFileSync(file, 'utf8') === content) return false
  } catch {}
  writeFileAtomic(file, content)
  return true
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
// 学自 dsh-im 的 safeSecretRef：条目名不允许长得像凭证
const SECRET_LIKE = /(sk-[A-Za-z0-9]{16,}|AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{20,}|Bearer\s+[A-Za-z0-9._-]{20,})/
function looksLikeSecret(value) {
  return SECRET_LIKE.test(String(value || ''))
}

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


export {
  _pkgDir,
  findExecutable,
  PY,
  OCR_PYEXE,
  run,
  ffmpegPath,
  ocrImage,
  keywords,
  searchOne,
  HEAT_INDEX,
  pluginDir,
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
  loadUserLexicon,
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
  normalizeSettings,
  withFileLock,
  withLexiconLock,
  readBodyBounded,
  writeIfChanged,
  writeFileAtomic,
  looksLikeSecret,
  failWithHint,
  loadSettings,
  replyPolicy
}
