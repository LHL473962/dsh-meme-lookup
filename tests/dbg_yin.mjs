import { readFileSync } from 'node:fs'
const all = JSON.parse(readFileSync('lexicon_all.json', 'utf8'))
const dm = JSON.parse(readFileSync('lexicon_danmaku.json', 'utf8'))
for (const w of ['阴间', '抽象', '啥阴', '阴']) {
  console.log(w, '| 词条库', all.filter((e) => String(e.title).includes(w)).length, '| 弹幕', dm.filter((e) => String(e.title).includes(w)).length)
}
console.log('含「阴间」的条目:', all.filter((e) => String(e.title).includes('阴间')).map((e) => e.title).slice(0, 6))
