import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

export const supabase = createClient()

// Tipos para as tabelas
export interface Usuario {
  usuario: string
  nome: string
  email: string
  foto_perfil: string | null
}

export interface UsuarioPermissao {
  usuario: string
  permissao: string
}

export const permissions = {

  // Módulo de usuários
  visualizarUsuario: '7384b8fe-4e55-4a26-b7a7-731d85876d09'
  
} as const