import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { apiFetch, tokenStore } from '@/lib/api'

const AuthCtx = createContext({
  user: null,
  loading: false,
  login: async () => {},
  logout: async () => {},
  isAuthed: false,
  role: null,
})

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(() => tokenStore.user)
  const [loading, setLoading] = useState(false)

  // Re-verify session on mount — if access token is stale, /auth/me triggers refresh
  useEffect(() => {
    if (!tokenStore.access) return
    let cancelled = false
    apiFetch('/auth/me')
      .then(me => { if (!cancelled) setUser(me) })
      .catch(() => { if (!cancelled) { tokenStore.clear(); setUser(null) } })
    return () => { cancelled = true }
  }, [])

  const login = useCallback(async (email, password) => {
    setLoading(true)
    try {
      const data = await apiFetch('/auth/login', { method: 'POST', body: { email, password }, skipAuth: true })
      tokenStore.save({
        access_token:  data.access_token,
        refresh_token: data.refresh_token,
        user:          data.user,
      })
      setUser(data.user)
      return data.user
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      if (tokenStore.refresh) {
        await apiFetch('/auth/logout', { method: 'POST', body: { refresh_token: tokenStore.refresh }, skipAuth: true })
      }
    } catch { /* server may be down; clear local state regardless */ }
    tokenStore.clear()
    setUser(null)
  }, [])

  return (
    <AuthCtx.Provider value={{
      user, loading, login, logout,
      isAuthed: !!user,
      role: user?.role || null,
    }}>
      {children}
    </AuthCtx.Provider>
  )
}

export function useAuth() { return useContext(AuthCtx) }
