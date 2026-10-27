import { readFileSync, writeFileSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/index.js'
let s = readFileSync(P, 'utf8')
// 代价句式：不预设利他，只要出现“我背代价换目的”的迹象
s = s.replace("const sacrifice = /(让|为了).{0,12}(看到|知道|明白|用上|学会)/.test(text) || /(代价|豁出去|我垫|贷款)/.test(text)", "const sacrifice = /(我贷|我垫|我氪|我熬|我花|押上|豁出去|代价)/.test(text) || /(让|为了).{0,12}(看到|知道|用上|学会)/.test(text)")
// 句式建议改成“代价 + 目的”，目的原样保留，不硬塞“让你们”
s = s.replace("          purpose = text.replace(/^.*?(让你们?|就?是为了|为了|也要)/, '').trim().replace(/^让/, '')", "          purpose = text.replace(/^.*?(让你们?|就?是为了|为了|也要|我贷了?笔?大的?)/, '').trim().replace(/^让/, '')")
s = s.replace("          if (/看到/.test(purpose)) purpose = '都能' + purpose.slice(purpose.indexOf('看到'))", "          if (/看到/.test(purpose)) purpose = '都能' + purpose.slice(purpose.indexOf('看到'))")
writeFileSync(P, s)
console.log('sacrifice rule updated')