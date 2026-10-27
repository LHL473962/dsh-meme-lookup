import { readFileSync, writeFileSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/index.js'
let s = readFileSync(P, 'utf8')
let n = 0
s = s.replace("{ keys: ['赌', '梭哈', '全压', '搏一把', '押'], memes: ['梭哈', '背水一战'] },", "{ keys: ['赌', '梭哈', '全压', '搏一把', '押'], memes: ['梭哈'] },")
if (!s.includes('const sacrifice =')) {
  const anchor = '        const titleSet = new Set(AUTO_LEX.map((e) => e.title))'
  const i = s.indexOf(anchor)
  const block = [
    '        // 宿傩句式：先写「代价」，再写「目的」——不是赌一把，是我愿意为你们付这个代价',
    "        const sacrifice = /(让|为了).{0,12}(看到|知道|明白|用上|学会)/.test(text) || /(代价|豁出去|我垫|贷款)/.test(text)",
    "        const sacrificeLine = sacrifice ? '我贷了笔大的，让你们' + (text.replace(/^.*?(让你们?|为了让)/, '').slice(0, 20) || '都能看到这期视频') : null",
    anchor,
  ].join('\n')
  if (i > 0) { s = s.slice(0, i) + block + s.slice(i + anchor.length); n++ }
}
if (!s.includes('sacrificeLine')) {
  const a2 = '          self_reaction: self,'
  const j = s.indexOf(a2)
  if (j > 0) { s = s.slice(0, j) + "          self_reaction: sacrifice ? { scene: '我付出代价，让你们得到', character: '宿傩', when: sacrificeLine } : self," + s.slice(j + a2.length); n++ }
}
writeFileSync(P, s)
console.log('patches applied', n)