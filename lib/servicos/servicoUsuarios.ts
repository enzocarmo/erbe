// lib/servicos/servicoUsuarios.ts
import { supabase } from "@/lib/supabase";

export type DadosParaCriarUsuario = {
  nome: string;
  email: string;
  senha: string;
  foto_perfil_url: string; // na criação continua obrigatória
  departamentos: { departamento_nome: string; departamento_codigo: string }[];
  lojas: { loja_codigo: string; loja_municipio?: string | null }[];
  permissoes: string[];
  relatorios: string[];
};

// 🔧 Remova 'senha' **e** 'foto_perfil_url' do Omit, e reintroduza foto_perfil_url como opcional
export type DadosParaEditarUsuario = Omit<
  DadosParaCriarUsuario,
  "senha" | "foto_perfil_url"
> & {
  usuario_auth_id: string;
  foto_perfil_url?: string; // agora realmente opcional
};

export async function criarUsuario(dados: DadosParaCriarUsuario) {
  const { data, error } = await supabase.functions.invoke("criar_usuario", {
    body: dados,
  });
  if (error) throw error;
  return data;
}

export async function editarUsuario(dados: DadosParaEditarUsuario) {
  const { data, error } = await supabase.functions.invoke("editar_usuario", {
    body: dados,
  });
  if (error) throw error;
  return data;
}

export async function excluirUsuario(usuario_auth_id: string) {
  const { data, error } = await supabase.functions.invoke("excluir_usuario", {
    body: { usuario_auth_id },
  });
  if (error) throw error;
  return data;
}

export async function mudarSenhaUsuario(usuario_auth_id: string, nova_senha: string) {
  const { data, error } = await supabase.functions.invoke("mudar_senha_usuario", {
    body: { usuario_auth_id, nova_senha },
  });
  if (error) throw error;
  return data;
}
