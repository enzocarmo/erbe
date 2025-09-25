import { createBrowserClient } from '@supabase/ssr'
import { criarUsuario, mudarSenhaUsuario } from './servicos/servicoUsuarios'

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
  criarUsuario: '51b43be8-50dd-453f-8679-c354853020c8',
  visualizarUsuario: '7384b8fe-4e55-4a26-b7a7-731d85876d09',
  excluirUsuario: '00333859-7cc4-4c49-a3cf-4927b6a6515d',
  editarUsuario: 'bf05c57a-3dee-47a4-889a-b063f238fa00',
  mudarSenhaUsuario: '9c76a077-02b3-424e-a5fe-ad60b61f3f1a'
  
} as const