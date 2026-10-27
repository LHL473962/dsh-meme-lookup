import { apply } from '../index.js'
const c = []
const ctx = { tools: { register: (t) => c.push(t) } }
apply(ctx)
console.log('tools:', c.map((t) => t.name).join(','))
const cases = {
  meme_lookup: { q: '尊嘟假嘟' },
  meme_chat: { text: '没绷住' },
  meme_coach: { text: '芭比Q' },
  meme_settings: { action: 'get' },
  meme_screen: { path: 'D:/VoiceData/out/comment_test.png' },
  meme_emote: { path: 'D:/VoiceData/out/comment_test2.png' },
  meme_suggest: { context: '同事说今天加班到十点' },
  meme_sync: {},
  meme_understand: { text: '尊嘟假嘟' },
  meme_add: { title: '自检占位词', meaning: '测试' },
}
for (const [name, args] of Object.entries(cases)) {
  const t = c.find((x) => x.name === name)
  if (!t) { console.log(name, '→ MISSING'); continue }
  const t0 = Date.now()
  try {
    const r = await t.execute(args)
    const ok = r && r.ok !== false
    console.log(name, ok ? 'OK' : 'FAIL', Date.now() - t0 + 'ms', ok ? '' : JSON.stringify(r).slice(0, 160))
  } catch (e) {
    console.log(name, 'THROW', Date.now() - t0 + 'ms', String(e.message).slice(0, 160))
  }
}
