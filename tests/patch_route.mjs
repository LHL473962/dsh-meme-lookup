import { readFileSync, writeFileSync } from 'node:fs'
const P = 'D:/VoiceData/house/plugins/dsh-meme-lookup/index.js'
let s = readFileSync(P, 'utf8')
s = s.replace("export const inject = ['tools']", "export const inject = ['tools', 'webServer']")
const marker = 'export function apply(ctx) {'
const i = s.indexOf(marker)
const route = [
  '',
  '  // 设置页（client.js）通过这条路由读写：/api/meme-panel/*',
  '  try {',
  '    ctx.effect(() => ctx.webServer.register({',
  '      kind: \'prefix\',',
  '      path: \'/api/meme-panel\',',
  '      handler: async (req, res) => {',
  '        const send = (code, body) => { res.writeHead(code, { \'content-type\': \'application/json; charset=utf-8\' }); res.end(JSON.stringify(body)) }',
  '        try {',
  '          const url = new URL(req.url, \'http://127.0.0.1\')',
  '          const sub = url.pathname.replace(\'/api/meme-panel\', \'\') || \'/\'',
  '          const readBody = async () => { let b = \'\'; for await (const c of req) b += c; try { return JSON.parse(b || \'{}\') } catch { return {} } }',
  '          if (sub === \'/settings\' && req.method === \'GET\') return send(200, loadSettings())',
  '          if (sub === \'/settings\' && req.method === \'POST\') {',
  '            const cur = { ...loadSettings(), ...(await readBody()) }',
  '            writeFileSync(SETTINGS_FILE, JSON.stringify(cur, null, 2))',
  '            return send(200, cur)',
  '          }',
  '          if (sub === \'/userlex\' && req.method === \'GET\') {',
  '            let list = []',
  '            try { list = JSON.parse(readFileSync(USER_LEX_FILE, \'utf8\')) || [] } catch {}',
  '            return send(200, { items: list })',
  '          }',
  '          if (sub === \'/userlex\' && req.method === \'POST\') {',
  '            const e = await readBody()',
  '            if (!e.title) return send(400, { ok: false, error: \'EMPTY_TITLE\' })',
  '            let list = []',
  '            try { list = JSON.parse(readFileSync(USER_LEX_FILE, \'utf8\')) || [] } catch {}',
  '            const idx = list.findIndex((x) => x.title === e.title)',
  '            const row = { ...e, addedAt: new Date().toISOString(), review: e.visibility === \'public\' ? \'pending\' : \'private\' }',
  '            if (idx >= 0) list[idx] = row; else list.push(row)',
  '            writeFileSync(USER_LEX_FILE, JSON.stringify(list, null, 2))',
  '            loadUserLexicon()',
  '            return send(200, { ok: true, total: list.length })',
  '          }',
  '          if (sub === \'/userlex\' && req.method === \'DELETE\') {',
  '            const idx = Number(url.searchParams.get(\'id\'))',
  '            let list = []',
  '            try { list = JSON.parse(readFileSync(USER_LEX_FILE, \'utf8\')) || [] } catch {}',
  '            if (idx >= 0) list.splice(idx, 1)',
  '            writeFileSync(USER_LEX_FILE, JSON.stringify(list, null, 2))',
  '            return send(200, { ok: true, total: list.length })',
  '          }',
  '          return send(404, { ok: false, error: \'NOT_FOUND\' })',
  '        } catch (e) { return send(500, { ok: false, error: String((e && e.message) || e) }) }',
  '      },',
  '    }), \'meme-panel: /api/meme-panel 路由\')',
  '  } catch (e) { /* 路由挂不上不影响工具 */ }',
].join('\n')
s = s.slice(0, i + marker.length) + route + s.slice(i + marker.length)
writeFileSync(P, s)
console.log('route added')