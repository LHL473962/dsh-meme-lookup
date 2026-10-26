import { readFileSync } from 'node:fs'
const auto = JSON.parse(readFileSync('D:/VoiceData/house/plugins/dsh-meme-lookup/lexicon_auto.json', 'utf8'))
const rvRaw = JSON.parse(readFileSync('D:/VoiceData/house/plugins/dsh-meme-lookup/tiers_review.json', 'utf8'))
const rev = Array.isArray(rvRaw) ? rvRaw : (rvRaw.reviews || [])
console.log('auto count', auto.length, '| review count', rev.length)
const target = rev[0]
console.log('review[0]:', JSON.stringify(target))
const matchAuto = auto.find((x) => x.slug === target.slug || x.title === target.title)
console.log('match in auto:', matchAuto ? JSON.stringify(matchAuto).slice(0, 160) : 'NONE')
const common = rev.filter((r) => r.should === 'common' || r.should === 'slang')
console.log('common/slang reviews:', common.length, common.map((r) => r.title).join(','))
