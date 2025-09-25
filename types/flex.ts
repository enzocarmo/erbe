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
  departamentos: FlexDepartamento[];
}

export interface FlexUnidade {
  Codigo: string;
  Nome: string;
  Municipio: string;
  [key: string]: any;
}

export interface FlexUnidadesResponse extends Array<FlexUnidade> {}

// Tipos para formulário
export interface DepartamentoFormData {
  departamento_nome: string;
  departamento_codigo: string;
}

export interface LojaFormData {
  loja_codigo: string;
  loja_nome: string;
  loja_municipio: string;
}