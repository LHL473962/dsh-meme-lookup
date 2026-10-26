import { spawnSync } from 'node:child_process'
const f = 'D:/bili_frames/giab/g03.jpg'
for (const exe of ['powershell', 'pwsh']) {
  const r = spawnSync(exe, ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', 'C:/Users/a1599/.dsh/input/ocr.ps1', '-Path', f], { encoding: 'utf8' })
  const out = (r.stdout || '').replace(/\s+/g, ' ').slice(0, 80)
  const err = (r.error && r.error.message) || (r.stderr || '').replace(/\s+/g, ' ').slice(0, 160)
  console.log(exe, '| status:', r.status, '| out:', out, '| err:', err)
}
