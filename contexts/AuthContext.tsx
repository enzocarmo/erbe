"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, Usuario } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  userProfile: Usuario | null
  loading: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('usuario', userId)
        .single()

      if (error) {
        console.error('Erro ao buscar perfil do usuário:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error)
      return null
    }
  }

  const refreshUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const profile = await fetchUserProfile(user.id)
        setUserProfile(profile)
      } else {
        setUserProfile(null)
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error)
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setUserProfile(null)
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  useEffect(() => {
    // Buscar usuário atual
    const getInitialUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        if (user) {
          const profile = await fetchUserProfile(user.id)
          setUserProfile(profile)
        }
      } catch (error) {
        console.error('Erro ao buscar usuário inicial:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialUser()

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (currentUser) {
          const profile = await fetchUserProfile(currentUser.id)
          setUserProfile(profile)
        } else {
          setUserProfile(null)
        }

        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const value = {
    user,
    userProfile,
    loading,
    signOut,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}