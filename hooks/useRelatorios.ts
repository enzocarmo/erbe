// src/hooks/useRelatorios.ts
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { Relatorio } from "@/types/supabase"

interface UseRelatoriosReturn {
  relatorios: Relatorio[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useRelatorios(): UseRelatoriosReturn {
  const [relatorios, setRelatorios] = useState<Relatorio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRelatorios = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from("relatorios")
        .select("id, nome, descricao, caminho")
        .order("nome")

      if (error) throw error
      setRelatorios(data || [])
    } catch (err: any) {
      console.error("Erro ao buscar relatórios:", err)
      setError("Erro ao carregar relatórios. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRelatorios()
  }, [])

  return { relatorios, loading, error, refetch: fetchRelatorios }
}
