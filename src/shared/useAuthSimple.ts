import { useState, useEffect, useCallback } from 'react'
import { User as SupabaseUser, Session } from '@supabase/supabase-js'
import { supabase } from './supabaseClient'
import { AuthState, AuthUser, Organization, Membership } from './types'
import { hasPermission } from './authUtils'

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    currentOrg: null,
    currentRole: null,
  })

  // Загрузка пользователя и его организаций
  const loadUserData = useCallback(async (supabaseUser: SupabaseUser) => {
    try {
      // Пока что создаём демо-данные для тестирования
      const demoOrg: Organization = {
        id: 'demo-org-1',
        name: 'Demo Organization',
        description: 'Тестовая организация',
        createdBy: supabaseUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const authUser: AuthUser = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name,
        avatarUrl: supabaseUser.user_metadata?.avatar_url,
        organizations: [demoOrg],
        currentOrg: demoOrg,
        currentRole: 'Owner',
      }

      setAuthState({
        user: authUser,
        isLoading: false,
        isAuthenticated: true,
        currentOrg: demoOrg,
        currentRole: 'Owner',
      })
    } catch (error) {
      console.error('Error loading user data:', error)
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
      }))
    }
  }, [])

  // Инициализация аутентификации
  useEffect(() => {
    let mounted = true

    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          if (mounted) {
            setAuthState(prev => ({
              ...prev,
              isLoading: false,
            }))
          }
          return
        }

        if (session?.user && mounted) {
          await loadUserData(session.user)
        } else if (mounted) {
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            currentOrg: null,
            currentRole: null,
          })
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        if (mounted) {
          setAuthState(prev => ({
            ...prev,
            isLoading: false,
          }))
        }
      }
    }

    initAuth()

    // Слушаем изменения аутентификации
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        if (event === 'SIGNED_IN' && session?.user) {
          await loadUserData(session.user)
        } else if (event === 'SIGNED_OUT') {
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            currentOrg: null,
            currentRole: null,
          })
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [loadUserData])

  // Вход через Magic Link
  const signInWithEmail = useCallback(async (email: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }))
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        console.error('Error signing in:', error)
        throw error
      }

      return { success: true }
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }))
      throw error
    }
  }, [])

  // Выход
  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error signing out:', error)
        throw error
      }
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }, [])

  // Переключение организации
  const switchOrganization = useCallback(async (orgId: string) => {
    if (!authState.user) return

    const organization = authState.user.organizations.find(org => org.id === orgId)
    if (!organization) return

    setAuthState(prev => ({
      ...prev,
      currentOrg: organization,
      currentRole: 'Owner', // Демо-роль
    }))
  }, [authState.user])

  // Проверка прав доступа
  const checkPermission = useCallback((permission: string) => {
    return hasPermission(authState.currentRole, permission as any)
  }, [authState.currentRole])

  return {
    ...authState,
    signInWithEmail,
    signOut,
    switchOrganization,
    hasPermission: checkPermission,
  }
}
