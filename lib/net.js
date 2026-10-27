// 网络层：cnmeme.wiki 公开 API
export const API = 'https://cnmeme.wiki/api/v1/public'

// 学自 dsh-im 的更新检查：禁重定向、限超时、限长度；5xx/429 退避重试一次
export async function getJson(url, attempt = 0) {
  try {
    const res = await fetch(url, {
      headers: { accept: 'application/json', 'user-agent': 'dsh-meme-lookup/1.6.x' },
      redirect: 'error',
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) {
      const err = new Error('HTTP_' + res.status)
      err.status = res.status
      // 给上游失败分类：限流要能和「真没这个词」区分开（自检据此 SKIP 而不是假绿）
      err.code = res.status === 429 ? 'RATE_LIMITED'
        : res.status >= 500 ? 'UPSTREAM_ERROR'
          : 'HTTP_ERROR'
      throw err
    }
    return await res.json()
  } catch (e) {
    const status = e && e.status
    if (e && !e.code) e.code = 'UPSTREAM_ERROR' // 网络错 / 超时 / JSON 坏
    const retryable = !status || status === 429 || status >= 500
    if (retryable && attempt < 1) {
      await new Promise((r) => setTimeout(r, 500))
      return getJson(url, attempt + 1)
    }
    throw e
  }
}
