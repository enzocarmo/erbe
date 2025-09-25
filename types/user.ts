import type { DepartamentoFormData, LojaFormData } from './flex';

export interface Modulo {
  id: string;
  nome: string;
}

export interface Permissao {
  id: string;
  nome: string;
  descricao: string | null;
  permissao: string;
  modulo: string;
}

export interface ModuloComPermissoes extends Modulo {
  permissoes: Permissao[];
}

export interface UserFormData {
  nome: string;
  email: string;
  senha: string;
  foto_perfil: File;
  departamentos: DepartamentoFormData[];
  lojas: LojaFormData[];
  relatorios: string[]; // Array de IDs
  permissoes: string[]; // Array de IDs das permissões selecionadas
}