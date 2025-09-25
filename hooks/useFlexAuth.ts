import { useState, useCallback, useRef } from 'react';
import axios from 'axios';
import type { FlexAuthRequest, FlexAuthResponse } from '@/types/flex';

const FLEX_AUTH_URL = '/api/flex/v1.1/auth';
const FLEX_CREDENTIALS: FlexAuthRequest = {
  usuario: 'enzocarmo64@gmail.com',
  senha: '102030'
};

interface UseFlexAuthReturn {
  getValidToken: () => Promise<string>;
  isAuthenticating: boolean;
  error: string | null;
}

// Cache global do token para evitar múltiplas requisições
let tokenCache: {
  token: string;
  expiresAt: number;
} | null = null;

let authPromise: Promise<string> | null = null;

export function useFlexAuth(): UseFlexAuthReturn {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authenticate = useCallback(async (): Promise<string> => {
    try {
      setIsAuthenticating(true);
      setError(null);

      const response = await axios.post<FlexAuthResponse>(
        FLEX_AUTH_URL,
        FLEX_CREDENTIALS,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );
      
      let responseData: any = response.data;
      
      // Se response.data contém uma propriedade 'response', usar ela
      if (responseData.response && typeof responseData.response === 'object') {
        responseData = responseData.response;
      }
      
      const token = responseData?.token;
      const expiresIn = responseData?.expiresIn;
      
      if (!token || !expiresIn) {
        throw new Error('Token ou expiresIn não foi retornado pela API');
      }
      
      // Cache do token com margem de segurança de 5 minutos
      tokenCache = {
        token,
        expiresAt: Date.now() + (expiresIn - 300) * 1000,
      };

      return token;
    } catch (err) {
      let errorMessage = 'Erro de autenticação';
      
      if (axios.isAxiosError(err)) {
        if (err.code === 'ECONNREFUSED') {
          errorMessage = 'Não foi possível conectar com a API Flex';
        } else if (err.response?.status === 404) {
          errorMessage = 'Endpoint de autenticação não encontrado';
        } else if (err.response && err.response.status >= 500) {
          errorMessage = 'Erro interno da API Flex';
        } else {
          errorMessage = err.response?.data?.message || err.response?.data?.error || (err.response?.status ? `Erro HTTP ${err.response.status}` : 'Erro de rede');
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsAuthenticating(false);
      authPromise = null;
    }
  }, []);

  const getValidToken = useCallback(async (): Promise<string> => {
    // Se já tem um token válido, retorna
    if (tokenCache && tokenCache.expiresAt > Date.now()) {
      return tokenCache.token;
    }

    // Se já está autenticando, aguarda a promise existente
    if (authPromise) {
      return authPromise;
    }

    // Inicia nova autenticação
    authPromise = authenticate();
    return authPromise;
  }, [authenticate]);

  return {
    getValidToken,
    isAuthenticating,
    error,
  };
}