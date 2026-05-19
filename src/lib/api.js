/**
 * Fetch wrapper:
 *   - prefixes API_BASE
 *   - attaches Bearer access_token from localStorage
 *   - on 401 → calls /auth/refresh with refresh_token, retries once
 *   - throws { status, body } on non-2xx
 */
import { API_BASE } from '@/config'

const ACCESS_KEY  = 'fristine.access_token'
const REFRESH_KEY = 'fristine.refresh_token'
const USER_KEY    = 'fristine.user'

export const tokenStore = {
  get access()  { return localStorage.getItem(ACCESS_KEY)  || '' },
  get refresh() { return localStorage.getItem(REFRESH_KEY) || '' },
  get user()    {
    try   { return JSON.parse(localStorage.getItem(USER_KEY) || 'null') }
    catch { return null }
  },
  save({ access_token, refresh_token, user }) {
    if (access_token)  localStorage.setItem(ACCESS_KEY,  access_token)
    if (refresh_token) localStorage.setItem(REFRESH_KEY, refresh_token)
    if (user)          localStorage.setItem(USER_KEY,    JSON.stringify(user))
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
    localStorage.removeItem(USER_KEY)
  },
}

let _refreshPromise = null

async function _doRefresh() {
  const rt = tokenStore.refresh
  if (!rt) throw Object.assign(new Error('No refresh token'), { status: 401 })
  const r = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: rt }),
  })
  if (!r.ok) {
    tokenStore.clear()
    throw Object.assign(new Error('Refresh failed'), { status: r.status })
  }
  const data = await r.json()
  tokenStore.save({
    access_token:  data.access_token,
    refresh_token: data.refresh_token,
    user:          data.user,
  })
  return data.access_token
}

async function refreshAccessToken() {
  // Singleton — many parallel requests share one refresh attempt
  if (!_refreshPromise) {
    _refreshPromise = _doRefresh().finally(() => { _refreshPromise = null })
  }
  return _refreshPromise
}

export async function apiFetch(path, opts = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`
  const headers = new Headers(opts.headers || {})
  if (opts.body && !headers.has('Content-Type') && !(opts.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }
  if (!opts.skipAuth && tokenStore.access) {
    headers.set('Authorization', `Bearer ${tokenStore.access}`)
  }
  const body = (typeof opts.body === 'object' && opts.body !== null && !(opts.body instanceof FormData))
    ? JSON.stringify(opts.body)
    : opts.body

  let res = await fetch(url, { ...opts, headers, body })
  if (res.status === 401 && !opts.skipAuth && tokenStore.refresh && !opts._retried) {
    try {
      await refreshAccessToken()
      headers.set('Authorization', `Bearer ${tokenStore.access}`)
      res = await fetch(url, { ...opts, headers, body, _retried: true })
    } catch (e) {
      // fall through with original 401
    }
  }
  if (!res.ok) {
    let errBody = null
    try { errBody = await res.json() } catch { errBody = await res.text() }
    throw Object.assign(new Error(`HTTP ${res.status}`), { status: res.status, body: errBody })
  }
  const ct = res.headers.get('content-type') || ''
  if (ct.includes('application/json')) return res.json()
  return res.text()
}
