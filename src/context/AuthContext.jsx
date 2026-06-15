import { useEffect, useState } from 'react'
import { apiRequest } from '../lib/api'
import { getSupabaseClient } from '../lib/supabaseClient'
import { AuthContext } from './auth-context'

const PROFILE_CACHE_KEY = 'healthid-auth-profile'

function reportTiming(label, startTime) {
  if (import.meta.env.DEV) {
    console.info(`[timing] ${label}: ${Math.round(performance.now() - startTime)}ms`)
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = getSupabaseClient()

    function readCachedProfile(userId) {
      try {
        const raw = window.sessionStorage.getItem(PROFILE_CACHE_KEY)

        if (!raw) {
          return null
        }

        const parsed = JSON.parse(raw)
        return parsed?.id === userId ? parsed : null
      } catch {
        return null
      }
    }

    function writeCachedProfile(nextProfile) {
      try {
        window.sessionStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(nextProfile))
      } catch {
        // Ignore cache write issues and continue with in-memory state.
      }
    }

    function clearCachedProfile() {
      try {
        window.sessionStorage.removeItem(PROFILE_CACHE_KEY)
      } catch {
        // Ignore cache cleanup issues.
      }
    }

    async function syncSession(nextSession, authEvent = null) {
      const startedAt = performance.now()
      setSession(nextSession)

      if (!nextSession?.access_token) {
        setProfile(null)
        clearCachedProfile()
        setLoading(false)
        reportTiming('auth.clear-session', startedAt)
        return
      }

      const cachedProfile = readCachedProfile(nextSession.user?.id)
      const optimisticRole = nextSession.user?.user_metadata?.role || nextSession.user?.app_metadata?.role
      const optimisticProfile = optimisticRole
        ? {
            id: nextSession.user.id,
            dni: nextSession.user.user_metadata?.dni || null,
            full_name: nextSession.user.user_metadata?.full_name || null,
            role: optimisticRole,
          }
        : null
      const shouldForceRefreshProfile = authEvent === 'USER_UPDATED'

      if (!shouldForceRefreshProfile && cachedProfile) {
        setProfile(cachedProfile)
        setLoading(false)
        reportTiming('auth.cache-hit', startedAt)
        return
      }

      if (optimisticProfile) {
        setProfile(optimisticProfile)
        writeCachedProfile(optimisticProfile)
        setLoading(false)

        if (authEvent === 'SIGNED_IN') {
          reportTiming('auth.sync-session', startedAt)
          return
        }
      }

      if (!optimisticProfile) {
        setLoading(true)
      }

      try {
        const data = await apiRequest('/api/auth/me', {
          token: nextSession.access_token,
        })

        setProfile(data.profile || null)

        if (data.profile) {
          writeCachedProfile(data.profile)
        } else {
          clearCachedProfile()
        }
      } catch {
        if (!optimisticProfile) {
          setProfile(null)
          clearCachedProfile()
        }
      } finally {
        setLoading(false)
        reportTiming('auth.sync-session', startedAt)
      }
    }

    supabase.auth.getSession().then(({ data }) => {
      syncSession(data.session || null)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      syncSession(nextSession || null, event)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  async function signOut() {
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
    setSession(null)
    setProfile(null)
    try {
      window.sessionStorage.removeItem(PROFILE_CACHE_KEY)
    } catch {
      // Ignore storage cleanup errors.
    }
  }

  function setOptimisticProfile(nextProfile) {
    setProfile(nextProfile)

    try {
      window.sessionStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(nextProfile))
    } catch {
      // Ignore storage write errors.
    }
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        role: profile?.role || null,
        loading,
        isAuthenticated: Boolean(session),
        signOut,
        setOptimisticProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
