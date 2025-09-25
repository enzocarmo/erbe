import { useState, useEffect } from "react";
import axios from "axios";
import { useFlexAuth } from "./useFlexAuth";
import type { FlexUnidadesResponse, FlexUnidade } from "@/types/flex";

const UNIDADES_URL = "/api/flex/v1.5/unidades";

interface UseLojasReturn {
  lojas: FlexUnidade[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useLojas(): UseLojasReturn {
  const [lojas, setLojas] = useState<FlexUnidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { getValidToken } = useFlexAuth();

  const fetchLojas = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await getValidToken();

      const response = await axios.get<FlexUnidadesResponse>(UNIDADES_URL, {
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
      });

      setLojas(
        (response.data.response?.unidades || []).filter(
          (unidade) => unidade.Empresa === "01"
        )
      );
    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.message || "Erro ao carregar lojas"
        : "Erro desconhecido";

      setError(errorMessage);
      console.error("Erro ao buscar lojas:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLojas();
  }, []);

  return {
    lojas,
    loading,
    error,
    refetch: fetchLojas,
  };
}
