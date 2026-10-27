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
    function Panel() {
      const [s, setS] = React.useState(null)
      const [lex, setLex] = React.useState([])
      const [q, setQ] = React.useState({ title: '', meaning: '' })
      const [msg, setMsg] = React.useState('')
      const load = React.useCallback(async () => {
        try { setS(await jget('/settings')) } catch (e) { setMsg('读设置失败：' + e.message) }
        try { const d = await jget('/userlex'); setLex(d.items || []) } catch {}
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