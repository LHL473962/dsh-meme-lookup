import { readFileSync, writeFileSync } from 'node:fs'
const P = 'C:/Users/a1599/.dsh/profiles/desktop/package.json'
const j = JSON.parse(readFileSync(P, 'utf8'))
if (!j.dsh.profile.bundles.includes('dsh-meme-lookup')) j.dsh.profile.bundles.push('dsh-meme-lookup')
if (!j.dependencies['dsh-meme-lookup']) j.dependencies['dsh-meme-lookup'] = 'link:D:/VoiceData/house/plugins/dsh-meme-lookup'
writeFileSync(P, JSON.stringify(j, null, 2) + '\n')
console.log('bundles:', j.dsh.profile.bundles.slice(-3).join(','))
console.log('dep:', j.dependencies['dsh-meme-lookup'])