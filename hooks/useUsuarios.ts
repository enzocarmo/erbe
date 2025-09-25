import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type LinhaUsuario = {
  usuario_auth_id: string;
  nome: string | null;
  email: string | null;
  foto_perfil: string | null;
  criado_em: string | null;
};

export function useUsuarios() {
  const [linhas, setLinhas] = useState<LinhaUsuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = async () => {
    setCarregando(true);
    setErro(null);
    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select("usuario, nome, email, foto_perfil, criado_em")
        .order("criado_em", { ascending: false });

      if (error) throw error;

      setLinhas(
        (data ?? []).map((u: any) => ({
          usuario_auth_id: u.usuario,
          nome: u.nome,
          email: u.email,
          foto_perfil: u.foto_perfil,
          criado_em: u.criado_em,
        }))
      );
    } catch (e: any) {
      setErro(e.message ?? "Erro ao carregar usuários");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  return { linhas, carregando, erro, recarregar: carregar };
}
