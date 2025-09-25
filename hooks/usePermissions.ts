import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

export function usePermissions() {
  const { user, loading: authLoading } = useAuth()
  const [permissions, setPermissions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const lastUserId = useRef<string | null>(null)
  const isInitialized = useRef(false)

  useEffect(() => {
    const fetchPermissions = async () => {
      // Se ainda está carregando a autenticação, aguardar
      if (authLoading) {
        return
      }

      // Se não há usuário, limpar permissões
      if (!user) {
        setPermissions([])
        setLoading(false)
        lastUserId.current = null
        isInitialized.current = true
        return
      }

      // Se é o mesmo usuário e já foi inicializado, não recarregar
      if (user.id === lastUserId.current && isInitialized.current) {
        return
      }

      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('usuarios_permissoes')
          .select('permissao')
          .eq('usuario', user.id)

        if (error) {
          console.error('Erro ao buscar permissões:', error)
          setPermissions([])
        } else {
          setPermissions(data.map(p => p.permissao))
        }

        lastUserId.current = user.id
        isInitialized.current = true
      } catch (error) {
        console.error('Erro ao buscar permissões:', error)
        setPermissions([])
      } finally {
        setLoading(false)
      }
    }

    fetchPermissions()
  }, [user?.id, authLoading]) // Depender apenas do ID do usuário

  const hasPermission = (permissionId: string): boolean => {
    return permissions.includes(permissionId)
  }

  const hasAnyPermission = (permissionIds: string[]): boolean => {
    return permissionIds.some(id => permissions.includes(id))
  }

  const hasAllPermissions = (permissionIds: string[]): boolean => {
    return permissionIds.every(id => permissions.includes(id))
  }

  return {
    permissions,
    loading: loading || authLoading, // Considerar ambos os loadings
    hasPermission,
    hasAnyPermission,
    hasAllPermissions
  }
}