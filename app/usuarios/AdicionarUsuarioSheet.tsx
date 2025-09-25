"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Upload,
  CheckCircle,
  X,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Hooks customizados
import { useDepartamentos } from "@/hooks/useDepartamentos";
import { useLojas } from "@/hooks/useLojas";
import { useRelatorios } from "@/hooks/useRelatorios";

// Tipos
import type { ModuloComPermissoes, UserFormData } from "@/types/user";
import type {
  DepartamentoFormData,
  LojaFormData,
  FlexDepartamento,
  FlexUnidade,
} from "@/types/flex";

// Componentes
import { MultiSelect, MultiSelectOption } from "@/components/ui/multiselect";

// Schema de validação
const formSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido").min(1, "Email é obrigatório"),
  senha: z
    .string()
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .regex(/[a-z]/, "Deve conter ao menos uma letra minúscula")
    .regex(/[A-Z]/, "Deve conter ao menos uma letra maiúscula")
    .regex(/[0-9]/, "Deve conter ao menos um número")
    .regex(/[^a-zA-Z0-9]/, "Deve conter ao menos um símbolo"),
  foto_perfil: z.instanceof(File, { message: "Foto de perfil é obrigatória" }),
  departamentos: z
    .array(z.string())
    .min(1, "Pelo menos um departamento deve ser selecionado"),
  lojas: z.array(z.string()).min(1, "Pelo menos uma loja deve ser selecionada"),
  relatorios: z
    .array(z.string())
    .min(1, "Pelo menos um relatório deve ser selecionado"),
  permissoes: z.array(z.string()).optional(),
});

// Hook para buscar módulos e permissões
function useModulosPermissoes() {
  const [modulosComPermissoes, setModulosComPermissoes] = useState<
    ModuloComPermissoes[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const [modulosResult, permissoesResult] = await Promise.all([
          supabase.from("modulos").select("*").order("nome"),
          supabase.from("permissoes").select("*").order("nome"),
        ]);

        if (modulosResult.error) throw modulosResult.error;
        if (permissoesResult.error) throw permissoesResult.error;

        const modulosData: ModuloComPermissoes[] = modulosResult.data
          .map((modulo) => ({
            ...modulo,
            permissoes: permissoesResult.data.filter(
              (permissao) => permissao.modulo === modulo.id
            ),
          }))
          .filter((modulo) => modulo.permissoes.length > 0);

        setModulosComPermissoes(modulosData);
      } catch (err) {
        console.error("Erro ao buscar módulos e permissões:", err);
        setError("Erro ao carregar permissões. Tente novamente.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { modulosComPermissoes, loading, error };
}

interface AdicionarUsuarioSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UserFormData) => void;
}

export default function AdicionarUsuarioSheet({
  open,
  onOpenChange,
  onSubmit,
}: AdicionarUsuarioSheetProps) {
  const [selectedPermissoes, setSelectedPermissoes] = useState<Set<string>>(
    new Set()
  );

  // Hooks para buscar dados
  const {
    departamentos,
    loading: loadingDepartamentos,
    error: errorDepartamentos,
  } = useDepartamentos();
  const { lojas, loading: loadingLojas, error: errorLojas } = useLojas();
  const {
    relatorios,
    loading: loadingRelatorios,
    error: errorRelatorios,
  } = useRelatorios();
  const {
    modulosComPermissoes,
    loading: loadingPermissoes,
    error: errorPermissoes,
  } = useModulosPermissoes();

  // Verificar se há algum erro
  const hasError =
    errorDepartamentos || errorLojas || errorRelatorios || errorPermissoes;
  const isLoading =
    loadingDepartamentos ||
    loadingLojas ||
    loadingRelatorios ||
    loadingPermissoes;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      email: "",
      senha: "",
      foto_perfil: undefined,
      departamentos: [],
      lojas: [],
      relatorios: [],
      permissoes: [],
    },
  });

  // Preparar opções para os multiselects
  const departamentosOptions: MultiSelectOption[] = departamentos.map(
    (dep) => ({
      value: dep.codigo,
      label: `${dep.descricao} - ${dep.codigo}`,
    })
  );

  const lojasOptions: MultiSelectOption[] = lojas.map((loja) => ({
    value: loja.Codigo,
    label: loja.Codigo,
  }));

  const relatoriosOptions: MultiSelectOption[] = relatorios.map((rel) => ({
    value: rel.id,
    label: rel.nome,
  }));

  // Funções para obter os dados processados para submissão
  const getProcessedDepartamentos = (
    selectedCodigos: string[]
  ): DepartamentoFormData[] => {
    return selectedCodigos.map((codigo) => {
      const departamento = departamentos.find((d) => d.codigo === codigo);
      return {
        departamento_nome: departamento?.descricao || "",
        departamento_codigo: codigo,
      };
    });
  };

  const getProcessedLojas = (selectedCodigos: string[]): LojaFormData[] => {
    return selectedCodigos.map((codigo) => {
      const loja = lojas.find((l) => l.Codigo === codigo);
      return {
        loja_codigo: codigo,
        loja_municipio: loja?.Municipio || "",
      };
    });
  };

  const handleFormSubmit = (data: z.infer<typeof formSchema>) => {
    const processedData: UserFormData = {
      ...data,
      departamentos: getProcessedDepartamentos(data.departamentos),
      lojas: getProcessedLojas(data.lojas),
      permissoes: Array.from(selectedPermissoes),
    };

    onSubmit(processedData);
    onOpenChange(false);
    form.reset();
    setSelectedPermissoes(new Set());
  };

  const handlePermissaoChange = (permissaoId: string, checked: boolean) => {
    setSelectedPermissoes((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(permissaoId);
      } else {
        newSet.delete(permissaoId);
      }

      // Atualizar o form com o novo array
      form.setValue("permissoes", Array.from(newSet));
      return newSet;
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar usuário
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-sidebar w-[600px] sm:max-w-[600px] flex flex-col p-0 gap-y-0 overflow-hidden">
        <SheetHeader className="flex-shrink-0 bg-sidebar border-b px-6 py-4">
          <SheetTitle>Adicionar usuário</SheetTitle>
          <SheetDescription>
            Preencha os campos abaixo para adicionar um novo usuário ao sistema.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="flex flex-col flex-1 min-h-0"
          >
            <div className="flex-1 overflow-y-auto px-6 pt-6 pb-6 space-y-6">
              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Carregando dados...</span>
                  </div>
                </div>
              )}

              {hasError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {errorDepartamentos ||
                      errorLojas ||
                      errorRelatorios ||
                      errorPermissoes}
                  </AlertDescription>
                </Alert>
              )}

              {!isLoading && !hasError && (
                <>
                  {/* Nome */}
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Nome completo <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Digite o nome completo"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Email <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Digite o email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Senha */}
                  <FormField
                    control={form.control}
                    name="senha"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Senha <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Digite a senha"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Foto de Perfil */}
                  <FormField
                    control={form.control}
                    name="foto_perfil"
                    render={({ field: { value, onChange, ...field } }) => (
                      <FormItem>
                        <FormLabel>
                          Foto de perfil <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="space-y-4">
                            {value && (
                              <div className="flex items-center justify-center">
                                <div className="relative">
                                  <img
                                    src={URL.createObjectURL(value)}
                                    alt="Preview"
                                    className="w-24 h-24 rounded-full object-cover border-4 border-primary/20 shadow-lg"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => onChange(undefined)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            )}

                            <div className="relative">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  onChange(file);
                                }}
                                {...field}
                                value=""
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              />
                              <div
                                className={cn(
                                  "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200",
                                  value
                                    ? "border-green-300 bg-green-50 hover:border-green-400"
                                    : "border-gray-300 bg-gray-50 hover:border-primary hover:bg-primary/5"
                                )}
                              >
                                <div className="flex flex-col items-center gap-3">
                                  {value ? (
                                    <>
                                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                        <CheckCircle className="h-6 w-6 text-green-600" />
                                      </div>
                                      <div className="space-y-1">
                                        <p className="text-sm font-medium text-green-700">
                                          Arquivo selecionado!
                                        </p>
                                        <p className="text-xs text-green-600">
                                          {value.name}
                                        </p>
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                        <Upload className="h-6 w-6 text-primary" />
                                      </div>
                                      <p className="text-sm font-medium text-gray-700">
                                        Clique para selecionar uma imagem
                                      </p>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Departamentos */}
                  <FormField
                    control={form.control}
                    name="departamentos"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>
                          Departamentos <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <MultiSelect
                            options={departamentosOptions}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Selecione os departamentos"
                            hasError={!!fieldState.error}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Lojas */}
                  <FormField
                    control={form.control}
                    name="lojas"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>
                          Lojas <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <MultiSelect
                            options={lojasOptions}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Selecione as lojas"
                            hasError={!!fieldState.error}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Relatórios */}
                  <FormField
                    control={form.control}
                    name="relatorios"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>
                          Relatórios <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <MultiSelect
                            options={relatoriosOptions}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Selecione os relatórios"
                            hasError={!!fieldState.error}
                          />
                        </FormControl>
                        <FormDescription>
                          Relatórios aos quais o usuário terá acesso
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  {/* Permissões */}
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="permissoes"
                      render={({ fieldState }) => (
                        <FormItem>
                          <FormLabel>
                            Permissões do usuário
                          </FormLabel>
                          {fieldState.error && (
                            <FormMessage>
                              {fieldState.error.message}
                            </FormMessage>
                          )}
                        </FormItem>
                      )}
                    />

                    {modulosComPermissoes.map((modulo) => (
                      <div key={modulo.id} className="space-y-3">
                        <h4 className="text-sm font-medium">{modulo.nome}</h4>
                        <div className="space-y-5">
                          {modulo.permissoes.map((permissao) => (
                            <div
                              key={permissao.id}
                              className="flex flex-col space-y-0"
                            >
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  checked={selectedPermissoes.has(permissao.id)}
                                  onCheckedChange={(checked) =>
                                    handlePermissaoChange(
                                      permissao.id,
                                      checked === true
                                    )
                                  }
                                />
                                <label className="text-sm font-medium cursor-pointer">
                                  {permissao.nome}
                                </label>
                              </div>
                              {permissao.descricao && (
                                <p className="text-xs text-muted-foreground ml-6">
                                  {permissao.descricao}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    {modulosComPermissoes.length === 0 &&
                      !loadingPermissoes && (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>Nenhum módulo com permissões encontrado.</p>
                        </div>
                      )}
                  </div>
                </>
              )}
            </div>

            <div className="flex-shrink-0 border-t bg-sidebar px-6 py-4">
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={!!isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Carregando...
                    </>
                  ) : (
                    "Adicionar usuário"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
