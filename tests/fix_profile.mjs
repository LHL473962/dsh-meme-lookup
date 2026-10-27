import { readFileSync, writeFileSync } from 'node:fs'
const P = 'C:/Users/a1599/.dsh/profiles/desktop/package.json'
const j = JSON.parse(readFileSync(P, 'utf8'))
// 不写 dependencies，避免 pnpm 解析 link: 失败；只保留 bundles 注册
delete j.dependencies['dsh-meme-lookup']
writeFileSync(P, JSON.stringify(j, null, 2) + '\n')
console.log('bundles tail:', j.dsh.profile.bundles.slice(-2).join(','))
console.log('dep removed:', !j.dependencies['dsh-meme-lookup'])