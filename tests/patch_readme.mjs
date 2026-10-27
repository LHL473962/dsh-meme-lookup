import { readFileSync, writeFileSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/README.md'
let s = readFileSync(P, 'utf8')
const head = [
  '# dsh-meme-lookup',
  '',
  '> 仓库：https://github.com/LHL473962/dsh-meme-lookup  ',
  '> 给 DeepSeek Harness 用的梗插件：查梗、看懂梗、判断能不能用、接梗、主动抛梗、读截图、认表情包。',
  '',
].join('\n')
s = s.replace(/^# dsh-meme-lookup\n\n>[^\n]*\n[^\n]*\n/, head)
if (!s.includes('## 云端更新')) {
  s = s.replace('## 安装', [
    '## 云端更新（不依赖 B 站插件）',
    '',
    '`meme_sync` 用 `git clone --depth 1` 拉本仓库，合并词表；没有 B 站插件也能更新。',
    '仓库里 `lexicon_danmaku.json` / `lexicon_all.json` 就是云端词库本体。',
    '',
    '## 面板',
    '',
    '- `meme_settings`：玩梗倾向（稳重/正常/活泛）、浓度（0~3）、是否允许慎用级、是否自动更新',
    '- `meme_add`：用户手动加梗（含义/用法/别用场景/语气/示例/出处/变体），存 `~/.dsh/meme-user-lexicon.json`',
    '',
    '## 安装',
  ].join('\n'))
}
writeFileSync(P, s)
console.log('readme updated')