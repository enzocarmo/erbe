export interface FlexAuthRequest {
  usuario: string;
  senha: string;
}

export interface FlexAuthResponse {
  token: string;
  tokenExpiration: string;
  expiresIn: number;
}

export interface FlexDepartamento {
  codigo: string;
  descricao: string;
}

export interface FlexDepartamentosResponse {
  response: {
    status: string;
    appVersion?: string;
    message?: string;
    messages?: { message: string }[];
    departamentos: FlexDepartamento[];
  };
}

export interface FlexUnidade {
  Codigo: string;
  Nome: string;
  Municipio: string;
  [key: string]: any;
}

export interface FlexUnidadesResponse {
  response: {
    status: string;
    appVersion?: string;
    messages?: { message: string }[];
    unidades: FlexUnidade[];
  };
}

// Tipos para formulário
export interface DepartamentoFormData {
  departamento_nome: string;
  departamento_codigo: string;
}

export interface LojaFormData {
  loja_codigo: string;
  loja_municipio: string;
}