import { readFileSync, writeFileSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/'
let s = readFileSync(P + 'index.js', 'utf8')
const old = "      return { ok: true, added: entry, total: list.length, path: String(USER_LEX_FILE) }",
console.log('anchor found', s.includes(old))
const neo = [
  '      // 立刻进内存，别等重启',
  '      const isPhrase = entry.sourceType === \"自创\"',
  '      if (!AUTO_LEX.some((x) => x.title === title)) {',
  '        AUTO_LEX.push({ title, slug: \"user:\" + title, tags_raw: [isPhrase ? \"私人用语\" : \"用户录入\"], bvid: null, creator: entry.source || null, provenance: entry.sourceType === \"有 BV\" ? \"partial\" : \"missing\", source: \"user\", kind: isPhrase ? \"phrase\" : \"meme\", tier: isPhrase ? \"slang\" : \"live\" })',
  '      }',
  '      return { ok: true, added: entry, total: list.length, path: String(USER_LEX_FILE) }',
].join('\n')
if (s.includes(old)) {
  s = s.replace(old, neo)
  writeFileSync(P + 'index.js', s)
  console.log('patched meme_add')
}