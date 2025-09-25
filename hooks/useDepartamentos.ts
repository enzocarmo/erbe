import { useState, useEffect } from 'react';
import axios from 'axios';
import { useFlexAuth } from './useFlexAuth';
import type { FlexDepartamentosResponse, FlexDepartamento } from '@/types/flex';

const DEPARTAMENTOS_URL = '/api/flex/v1.0/departamentos';

interface UseDepartamentosReturn {
  departamentos: FlexDepartamento[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDepartamentos(): UseDepartamentosReturn {
  const [departamentos, setDepartamentos] = useState<FlexDepartamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { getValidToken } = useFlexAuth();

  const fetchDepartamentos = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await getValidToken();
      
      const response = await axios.get<FlexDepartamentosResponse>(
        DEPARTAMENTOS_URL,
        {
          headers: {
            'Content-Type': 'application/json',
            'token': token,
          },
        }
      );

      setDepartamentos(response.data.response?.departamentos || []);
    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.message || 'Erro ao carregar departamentos'
        : 'Erro desconhecido';
      
      setError(errorMessage);
      console.error('Erro ao buscar departamentos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartamentos();
  }, []);

  return {
    departamentos,
    loading,
    error,
    refetch: fetchDepartamentos,
  };
}