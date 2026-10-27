const urls = [
  'https://raw.githubusercontent.com/LHL473962/dsh-meme-lookup/main/package.json',
  'https://cdn.jsdelivr.net/gh/LHL473962/dsh-meme-lookup@main/package.json',
]
for (const u of urls) {
  try {
    const r = await fetch(u, { headers: { 'user-agent': 'dsh' } })
    console.log(u.split('/')[2], r.status, (await r.text()).slice(0, 40).replace(/\n/g, ' '))
  } catch (e) { console.log(u.split('/')[2], 'ERR', e.message) }
}
