import { spawnSync } from 'node:child_process'
const f = 'D:/bili_frames/giab/g03.jpg'
const variants = [
  ['powershell', ['-STA', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', 'C:/Users/a1599/.dsh/input/ocr.ps1', '-Path', f]],
  ['powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', '& "C:/Users/a1599/.dsh/input/ocr.ps1" -Path "' + f + '"']],
]
for (const [exe, args] of variants) {
  const r = spawnSync(exe, args, { encoding: 'utf8' })
  const out = (r.stdout || '').replace(/\s+/g, ' ').slice(0, 100)
  const err = ((r.error && r.error.message) || (r.stderr || '')).replace(/\s+/g, ' ').slice(0, 120)
  console.log(exe, args[0], '| status:', r.status, '| out:', out, '| err:', err)
}
