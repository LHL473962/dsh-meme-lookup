/**
 * dsh-meme-lookup —— 浏览器半端（设置页里的一页）
 * 自注册脚本，不是 ESM：window.__ModuleLoader__.load({ id, factory })
 * 进「设置」用 slots.inject('settings.section', ...)
 */
window.__ModuleLoader__.load({
  id: 'dsh-meme-lookup',
  factory: (require) => {
    const React = require('react')
    const h = React.createElement
    const API = '/api/meme-panel'
    const asJson = async (res) => { if (res.ok) return res.json(); throw new Error('HTTP ' + res.status) }
    const jget = (p) => fetch(API + p).then(asJson)
    const jpost = (p, body) => fetch(API + p, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body || {}) }).then(asJson)
    const TEND = ['稳重', '正常', '活泛']
    const DENS = ['0 关', '1 克制', '2 适中', '3 放飞']
    const seg = (value, options, onPick) => h('div', { style: segWrap }, options.map((label, i) =>
      h('button', { key: i, onClick: () => onPick(i), style: i === value ? segOn : segOff }, label)))
    const segWrap = { display: 'flex', background: '#121826', borderRadius: 10, padding: 4, gap: 4 }
    const segOn = { flex: 1, height: 32, border: 0, borderRadius: 8, background: '#7C6BFF', color: '#fff', cursor: 'pointer' }
    const segOff = { flex: 1, height: 32, border: 0, borderRadius: 8, background: 'transparent', color: '#94A3B8', cursor: 'pointer' }
    const card = { background: '#1E2A3C', borderRadius: 12, padding: 16, marginBottom: 12 }
    const label = { display: 'block', color: '#94A3B8', fontSize: 12, margin: '10px 0 4px' }
    const input = { width: '100%', height: 34, background: '#161B26', border: '1px solid #2A3A52', borderRadius: 6, color: '#E2E8F0', padding: '0 8px', boxSizing: 'border-box' }
    const btn = { height: 36, borderRadius: 8, border: 0, background: '#7C6BFF', color: '#fff', cursor: 'pointer', flex: 1 }
    const DIMS = [['kw', '关键词'], ['tag', '标签'], ['heat', '热度'], ['fresh', '时效'], ['prov', '出处']]
    const GRADES = [['ok', '对'], ['off', '错'], ['sense', '义偏']]
    const small = { height: 28, borderRadius: 6, border: 0, background: '#2A3A52', color: '#E2E8F0', cursor: 'pointer', fontSize: 12, padding: '0 10px', marginRight: 6 }
    const rowTxt = { color: '#94A3B8', fontSize: 11, borderTop: '1px solid #24344A', padding: '4px 0' }
    function Panel() {
      const [s, setS] = React.useState(null)
      const [lex, setLex] = React.useState([])
      const [q, setQ] = React.useState({ title: '', meaning: '' })
      const [msg, setMsg] = React.useState('')
      const [fb, setFb] = React.useState({ items: [], weights: null, locked: {}, samples: 0, lastLearnedAt: null, minSamples: 20 })
      const [fq, setFq] = React.useState('')
      const [cands, setCands] = React.useState([])
      const [fmsg, setFmsg] = React.useState('')
      const load = React.useCallback(async () => {
        try { setS(await jget('/settings')) } catch (e) { setMsg('读设置失败：' + e.message) }
        try { const d = await jget('/userlex'); setLex(d.items || []) } catch {}
        try { setFb(await jget('/feedback')) } catch {}
      }, [])
      React.useEffect(() => { load() }, [load])
      const patch = async (p) => { const n = { ...s, ...p }; setS(n); try { await jpost('/settings', p) } catch (e) { setMsg('保存失败：' + e.message) } }
      const quick = async () => {
        if (!q.title.trim() || !q.meaning.trim()) { setMsg('两格都要填'); return }
        try {
          await jpost('/userlex', { title: q.title.trim(), meaning: q.meaning.trim(), kind: 'phrase', sourceType: '自创', tone: [], visibility: 'private' })
          setQ({ title: '', meaning: '' }); setMsg('已存，下一次对话就能认出来'); load()
        } catch (e) { setMsg('保存失败：' + e.message) }
      }
      // ---- 相关度反馈 ----
      const rank = async () => {
        const text = fq.trim()
        if (!text) { setFmsg('先输入一个词'); return }
        try {
          const d = await jpost('/rank', { q: text })
          setCands(d.candidates || [])
          setFmsg((d.candidates || []).length ? '' : '本地词表没找到候选')
        } catch (e) { setFmsg('查询失败：' + e.message) }
      }
      const grade = async (c, g) => {
        try {
          await jpost('/feedback', { query: fq.trim(), slug: c.slug, title: c.title, grade: g })
          setCands([]); setFmsg('已记：' + c.title + ' → ' + g); load()
        } catch (e) { setFmsg('记录失败：' + e.message) }
      }
      const setW = (k, v) => setFb((p) => ({ ...p, weights: { ...(p.weights || {}), [k]: Number(v) } }))
      const toggleLock = (k) => setFb((p) => ({ ...p, locked: { ...(p.locked || {}), [k]: !(p.locked || {})[k] } }))
      const saveW = async () => {
        try {
          const d = await jpost('/weights', { w: fb.weights || {}, locked: fb.locked || {} })
          setFb((p) => ({ ...p, weights: d.w, locked: d.locked, samples: d.samples, lastLearnedAt: d.lastLearnedAt }))
          setFmsg('权重已保存' + (d.ignored && d.ignored.length ? '（忽略 ' + d.ignored.join(',') + '）' : ''))
        } catch (e) { setFmsg('保存失败：' + e.message) }
      }
      if (!s) return h('div', { style: { padding: 16, color: '#94A3B8' } }, '加载中…')
      return h('div', { style: { padding: 4 } },
        h('div', { style: card },
          h('div', { style: label }, '玩梗倾向'), seg(s.tendency, TEND, (i) => patch({ tendency: i })),
          h('div', { style: label }, '玩梗浓度'), seg(s.density, DENS, (i) => patch({ density: i })),
          h('div', { style: { display: 'flex', justifyContent: 'space-between', marginTop: 12, color: '#E2E8F0' } }, '允许「慎用」级梗',
            h('input', { type: 'checkbox', checked: !!s.allowRisky, onChange: (e) => patch({ allowRisky: e.target.checked }) })),
          h('div', { style: { display: 'flex', justifyContent: 'space-between', marginTop: 8, color: '#E2E8F0' } }, '允许自动更新词库',
            h('input', { type: 'checkbox', checked: !!s.autoUpdate, onChange: (e) => patch({ autoUpdate: e.target.checked }) })),
        ),
        h('div', { style: card },
          h('div', { style: { color: '#94A3B8', fontSize: 13, marginBottom: 8 } }, '相关度反馈'),
          h('input', { style: input, value: fq, placeholder: '查一个词，比如：芭比Q', onChange: (e) => setFq(e.target.value) }),
          h('div', { style: { display: 'flex', marginTop: 10 } }, h('button', { style: btn, onClick: rank }, '查候选')),
          cands.length ? h('div', { style: { marginTop: 6 } }, cands.map((c, i) => h('div', { key: i, style: { borderTop: '1px dashed #2A3A52', padding: '8px 0' } },
            h('div', { style: { color: '#E2E8F0', fontSize: 13 } }, (i + 1) + '. ' + c.title + '　' + c.score),
            h('div', { style: { color: '#94A3B8', fontSize: 11, margin: '2px 0 6px' } }, (c.tags || []).join(' / ') || '无标签'),
            h('div', null, GRADES.map(([g, t]) => h('button', { key: g, style: small, onClick: () => grade(c, g) }, t)))))) : null,
          fb.items.length ? h('div', { style: { marginTop: 8 } }, fb.items.slice(0, 5).map((it, i) =>
            h('div', { key: i, style: rowTxt }, it.query + ' → ' + (it.title || '—') + '　[' + it.grade + ']'))) : null,
          fmsg ? h('div', { style: { color: '#7C6BFF', fontSize: 12, marginTop: 8 } }, fmsg) : null,
        ),
        h('div', { style: card },
          h('div', { style: { color: '#94A3B8', fontSize: 13, marginBottom: 4 } }, '相关度权重'),
          h('div', { style: { color: '#64748B', fontSize: 11, marginBottom: 8 } },
            '样本 ' + (fb.samples || 0) + ' 条' +
            ((fb.samples || 0) < (fb.minSamples || 20) ? '（满 ' + (fb.minSamples || 20) + ' 条才开始学习）' : '') +
            (fb.lastLearnedAt ? '｜上次学习 ' + String(fb.lastLearnedAt).slice(0, 16).replace('T', ' ') : '')),
          DIMS.map(([k, name]) => {
            const v = fb.weights && fb.weights[k] != null ? fb.weights[k] : 1
            return h('div', { key: k, style: { marginBottom: 10 } },
              h('div', { style: { display: 'flex', justifyContent: 'space-between', color: '#E2E8F0', fontSize: 12 } },
                name + (fb.locked && fb.locked[k] ? '（锁定）' : '（学习）'), String(v)),
              h('input', { type: 'range', min: 0, max: 3, step: 0.1, value: v, style: { width: '100%' }, onChange: (e) => setW(k, e.target.value) }),
              h('label', { style: { color: '#94A3B8', fontSize: 11 } },
                h('input', { type: 'checkbox', checked: !!(fb.locked && fb.locked[k]), onChange: () => toggleLock(k) }), ' 锁定'))
          }),
          h('div', { style: { display: 'flex', marginTop: 6 } }, h('button', { style: btn, onClick: saveW }, '保存权重')),
        ),
        h('div', { style: card },
          h('div', { style: { color: '#94A3B8', fontSize: 13, marginBottom: 8 } }, '记一句（最快的入口）'),
          h('div', { style: label }, '哪句话'),
          h('input', { style: input, value: q.title, placeholder: '例：绷不住了', onChange: (e) => setQ({ ...q, title: e.target.value }) }),
          h('div', { style: label }, '什么意思'),
          h('input', { style: input, value: q.meaning, placeholder: '例：忍不住笑出来', onChange: (e) => setQ({ ...q, meaning: e.target.value }) }),
          h('div', { style: { display: 'flex', marginTop: 12 } }, h('button', { style: btn, onClick: quick }, '存一句')),
          msg ? h('div', { style: { color: '#7C6BFF', fontSize: 12, marginTop: 8 } }, msg) : null,
        ),
        h('div', { style: card },
          h('div', { style: { color: '#94A3B8', fontSize: 13, marginBottom: 8 } }, '我加的（' + lex.length + '）'),
          lex.slice().reverse().slice(0, 20).map((e, i) => h('div', { key: i, style: { borderBottom: '1px dashed #2A3A52', padding: '6px 0' } },
            h('div', { style: { color: '#E2E8F0', fontSize: 13 } }, e.title,
              h('span', { style: { fontSize: 11, marginLeft: 6, color: e.visibility === 'public' ? '#C4B5FD' : '#9FB3D1' } }, e.visibility === 'public' ? '申请公开' : '仅自己')),
            h('div', { style: { color: '#94A3B8', fontSize: 12 } }, e.meaning || ''))),
          lex.length === 0 ? h('div', { style: { color: '#64748B', fontSize: 12 } }, '还没有') : null,
        ),
      )
    }
    return {
      inject: ['slots'],
      apply(ctx) {
        const slots = ctx.get('slots')
        if (!slots) return
        slots.inject('settings.section', () => slots.register(
          { name: 'settings.section', id: 'meme-panel', order: 40, label: '梗' },
          () => h(Panel),
        ))
      },
    }
  },
})