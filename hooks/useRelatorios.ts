import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Relatorio {
  id: string;
  nome: string;
}

interface UseRelatoriosReturn {
  relatorios: Relatorio[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useRelatorios(): UseRelatoriosReturn {
  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRelatorios = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('relatorios')
        .select('id, nome')
        .order('nome');

      if (supabaseError) throw supabaseError;

      setRelatorios(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Erro ao carregar relatórios';
      
      setError(errorMessage);
      console.error('Erro ao buscar relatórios:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRelatorios();
  }, []);

  return {
    relatorios,
    loading,
    error,
    refetch: fetchRelatorios,
  };
}