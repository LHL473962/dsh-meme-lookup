// 相关度反馈 + 5 维权重在线学习（v1.7.0）
//
// 存储：~/.dsh/meme-feedback.json（上限 5000）与 ~/.dsh/meme-weights.json
// 打分：score = Σ w_i·x_i − 离题惩罚（惩罚不参与学习）
// 学习：在线 logistic，p=sigmoid(Σwx)，w += lr·(y−p)·x，clamp 0..3；样本 <20 只记录不动权重
import { join } from 'node:path'
import { homedir } from 'node:os'
import { readFileSync } from 'node:fs'
import {
  withFileLock, writeIfChanged, keywords, HEAT_INDEX, AUTO_LEX, redactPaths,
} from './engine.js'

const HOME = process.env.DSH_HOME || join(homedir(), '.dsh')
const FEEDBACK_FILE = join(HOME, 'meme-feedback.json')
const WEIGHTS_FILE = join(HOME, 'meme-weights.json')

export const KEYS = ['kw', 'tag', 'heat', 'fresh', 'prov']
export const DIM_NAMES = { kw: '关键词', tag: '标签', heat: '热度', fresh: '时效', prov: '出处' }
export const DEFAULT_W = { kw: 1, tag: 1, heat: 1, fresh: 1, prov: 1 }
export const MAX_ITEMS = 5000
export const MIN_SAMPLES = 20
export const LR = 0.05

const round2 = (n) => Math.round(Number(n) * 100) / 100
const readJson = (file, fallback) => { try { return JSON.parse(readFileSync(file, 'utf8')) ?? fallback } catch { return fallback } }

// ---------- 权重 ----------
export function loadWeights() {
  const raw = readJson(WEIGHTS_FILE, null)
  const w = { ...DEFAULT_W }
  if (raw && raw.w) for (const k of KEYS) if (Number.isFinite(Number(raw.w[k]))) w[k] = Math.min(3, Math.max(0, Number(raw.w[k])))
  const locked = {}
  if (raw && raw.locked) for (const k of KEYS) locked[k] = !!raw.locked[k]
  return {
    w,
    locked,
    samples: Math.max(0, Number(raw && raw.samples) || 0),
    lastLearnedAt: (raw && raw.lastLearnedAt) || null,
  }
}

export function saveWeights(state) {
  const body = JSON.stringify({
    version: 1,
    w: state.w,
    locked: state.locked,
    samples: state.samples,
    lastLearnedAt: state.lastLearnedAt || null,
  }, null, 2)
  withFileLock(WEIGHTS_FILE, () => writeIfChanged(WEIGHTS_FILE, body))
  return state
}

// 面板拖滑块：只改给的维度；未知键要回报，不静默丢
export function setWeights(patchW, patchLocked) {
  const state = loadWeights()
  const ignored = []
  for (const [k, v] of Object.entries(patchW || {})) {
    if (!KEYS.includes(k)) { ignored.push('w.' + k); continue }
    const n = Number(v)
    if (!Number.isFinite(n)) { ignored.push('w.' + k); continue }
    state.w[k] = round2(Math.min(3, Math.max(0, n)))
  }
  for (const [k, v] of Object.entries(patchLocked || {})) {
    if (!KEYS.includes(k)) { ignored.push('locked.' + k); continue }
    state.locked[k] = !!v
  }
  saveWeights(state)
  return { state, ignored }
}

// ---------- 反馈 ----------
export function loadFeedback() {
  const raw = readJson(FEEDBACK_FILE, null)
  if (Array.isArray(raw)) return { items: raw }
  if (raw && Array.isArray(raw.items)) return { items: raw.items }
  return { items: [] }
}

function saveFeedback(items) {
  withFileLock(FEEDBACK_FILE, () => writeIfChanged(FEEDBACK_FILE, JSON.stringify({ version: 1, items }, null, 2)))
}

function findBySlugOrTitle(slug, title) {
  if (slug) {
    const hit = AUTO_LEX.find((e) => e.slug === slug)
    if (hit) return hit
  }
  if (title) {
    const exact = AUTO_LEX.find((e) => e.title === title)
    if (exact) return exact
    const part = AUTO_LEX.find((e) => e.title && (title.includes(e.title) || e.title.includes(title)))
    if (part) return part
  }
  return null
}

// ---------- 特征 ----------
export function features(query, item) {
  const q = String(query || '')
  const it = item || {}
  const names = [it.title, ...(Array.isArray(it.aliases) ? it.aliases : [])]
    .filter(Boolean).map(String)
  let hit = 0
  for (const n of names) {
    if (!n) continue
    if (q.includes(n)) hit = Math.max(hit, n.length)
    else if (n.includes(q) && q.length >= 2) hit = Math.max(hit, q.length)
  }
  if (!hit) {
    for (const w of keywords(q, 5)) if (names.some((n) => n.includes(w))) hit = Math.max(hit, w.length)
  }
  const kw = Math.min(1, hit / Math.max(2, q.length))

  const tags = (it.tags_raw || it.tags || []).map(String)
  const qs = keywords(q, 8)
  const tagHits = tags.filter((t) => qs.some((w) => t.includes(w)) || q.includes(t)).length
  const tag = Math.min(1, tagHits / 3)

  const view = Number(it.view) || Number(HEAT_INDEX[it.bvid]) || 0
  const heat = view > 0 ? Math.min(1, Math.log10(view + 1) / 7) : 0

  const updated = it.updated_at ? Date.parse(it.updated_at) : NaN
  const fresh = Number.isFinite(updated)
    ? (Date.now() - updated < 365 * 86400000 ? 1 : 0)
    : (it.tier === 'stale' ? 0 : 1)

  const prov = it.provenance === 'complete' ? 1 : it.provenance === 'partial' ? 0.5 : 0

  return { kw: round2(kw), tag: round2(tag), heat: round2(heat), fresh, prov }
}

// 离题惩罚：上下文没聊游戏/动画，就别把游戏动画梗排上去（不参与学习）
export function offTopicPenalty(query, item) {
  const tags = ((item && (item.tags_raw || item.tags)) || []).join(' ')
  if (!tags) return 0
  const off = /游戏梗|动画梗|电竞梗|番剧|二次创作/
  if (!off.test(tags)) return 0
  if (/游戏|动画|二次元|电竞|番|角色|主播|up主/i.test(String(query || ''))) return 0
  return 0.5
}

export function scoreItem(feats, w, penalty = 0) {
  let s = 0
  for (const k of KEYS) s += (Number(w[k]) || 0) * (Number(feats[k]) || 0)
  return round2(Math.max(0, s - penalty))
}

export function rankCandidates(query, items, weights) {
  const W = weights || loadWeights().w
  return (items || []).map((it) => {
    const f = features(query, it)
    const pen = offTopicPenalty(query, it)
    return { item: it, feats: f, score: scoreItem(f, W, pen) }
  }).sort((a, b) => b.score - a.score)
}

// ---------- 学习 ----------
export function applyFeedback(rec) {
  const state = loadWeights()
  const { items } = loadFeedback()
  items.push(rec)
  while (items.length > MAX_ITEMS) items.shift()
  saveFeedback(items)

  state.samples += 1
  const y = rec.grade === 'ok' ? 1 : rec.grade === 'sense' ? 0.5 : 0
  if (state.samples >= MIN_SAMPLES) {
    const x = rec.feats || {}
    let z = 0
    for (const k of KEYS) z += state.w[k] * (Number(x[k]) || 0)
    const p = 1 / (1 + Math.exp(-z))
    for (const k of KEYS) {
      if (state.locked[k]) continue // 锁定维度回写原值
      const next = state.w[k] + LR * (y - p) * (Number(x[k]) || 0)
      state.w[k] = round2(Math.min(3, Math.max(0, next)))
    }
    state.lastLearnedAt = new Date().toISOString()
  }
  saveWeights(state)
  return state
}

// 工具与面板共用：校验 → 找条目 → 算特征 → 落盘 → 学习
export function recordFeedback(input) {
  const query = String((input && input.query) || '').trim()
  const grade = String((input && input.grade) || '').trim()
  if (!query) return { ok: false, error: 'EMPTY_QUERY', hint: '给 query（用户问的那个词/句子）' }
  if (!['ok', 'off', 'sense'].includes(grade)) return { ok: false, error: 'BAD_GRADE', hint: 'grade 只能是 ok / off / sense' }
  try {
    const item = findBySlugOrTitle(input.slug, input.title)
    const feats = features(query, item || { title: String(input.title || ''), tags_raw: [] })
    const st0 = loadWeights()
    const score = scoreItem(feats, st0.w, offTopicPenalty(query, item || {}))
    const rec = {
      ts: new Date().toISOString(),
      query,
      slug: (input.slug || (item && item.slug)) || null,
      title: (input.title || (item && item.title)) || null,
      grade,
      note: input.note ? String(input.note).slice(0, 200) : null,
      feats,
      score,
    }
    const st = applyFeedback(rec)
    return {
      ok: true,
      matched: !!item,
      recorded: rec,
      weights: st.w,
      locked: st.locked,
      samples: st.samples,
      learned: st.samples >= MIN_SAMPLES,
      lastLearnedAt: st.lastLearnedAt || null,
    }
  } catch (e) {
    return { ok: false, error: 'FEEDBACK_FAILED', message: redactPaths((e && e.message) || e) }
  }
}

// ---------- 工具 ----------
const textOutput = {
  schema: { type: 'object', properties: {}, additionalProperties: true },
  render: (_args, value) => [{
    type: 'text',
    text: typeof value === 'string' ? value : JSON.stringify(value, null, 2),
  }],
}

export function registerFeedbackTool(ctx) {
  ctx.tools.register({
    name: 'meme_feedback',
    description: '相关度反馈：用户说「这个对/不对/意思偏了」时记一笔，用来在线调整 5 维权重。grade 三档：ok / off / sense。',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: '用户问的原词/原句' },
        slug: { type: 'string', description: '被评分的条目 slug（可选）' },
        title: { type: 'string', description: '被评分的条目标题（可选，slug 没给时按标题找）' },
        grade: { type: 'string', enum: ['ok', 'off', 'sense'], description: 'ok=对，off=错，sense=义偏' },
        note: { type: 'string', description: '备注（可选，最多 200 字）' },
      },
      required: ['query', 'grade'],
      additionalProperties: false,
    },
    output: textOutput,
    async execute(args) {
      return recordFeedback(args || {})
    },
  })
}
