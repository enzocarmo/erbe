import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

export function usePermissions() {
  const { user } = useAuth()
  const [permissions, setPermissions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!user) {
        setPermissions([])
        setLoading(false)
        return
      }

      try {
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
      } catch (error) {
        console.error('Erro ao buscar permissões:', error)
        setPermissions([])
      } finally {
        setLoading(false)
      }
    }

    fetchPermissions()
  }, [user])

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
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions
  }
}