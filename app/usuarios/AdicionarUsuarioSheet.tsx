"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase"; // Assume que você tem o client configurado
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  Check,
  ChevronsUpDown,
  X,
  Upload,
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Tipos para dados do Supabase
interface Modulo {
  id: string;
  nome: string;
}

interface Permissao {
  id: string;
  nome: string;
  descricao: string | null;
  permissao: string;
  modulo: string;
}

interface ModuloComPermissoes extends Modulo {
  permissoes: Permissao[];
}

// Schema de validação dinâmico
function createFormSchema(modulosComPermissoes: ModuloComPermissoes[]) {
  const permissoesSchema: Record<string, z.ZodObject<any>> = {};
  
  modulosComPermissoes.forEach((modulo) => {
    const permissoesCampos: Record<string, z.ZodBoolean> = {};
    modulo.permissoes.forEach((permissao) => {
      permissoesCampos[permissao.permissao] = z.boolean();
    });
    permissoesSchema[modulo.id] = z.object(permissoesCampos);
  });

  return z.object({
    nome: z.string().min(1, "Nome é obrigatório"),
    email: z.string().email("Email inválido").min(1, "Email é obrigatório"),
    senha: z.string()
      .min(6, "Senha deve ter pelo menos 6 caracteres")
      .regex(/[a-z]/, "Deve conter ao menos uma letra minúscula")
      .regex(/[A-Z]/, "Deve conter ao menos uma letra maiúscula")
      .regex(/[0-9]/, "Deve conter ao menos um número")
      .regex(/[^a-zA-Z0-9]/, "Deve conter ao menos um símbolo"),
    foto_perfil: z.instanceof(File, { message: "Foto de perfil é obrigatória" }),
    departamentos: z
      .array(z.string())
      .min(1, "Pelo menos um departamento deve ser selecionado"),
    lojas: z
      .array(z.string())
      .min(1, "Pelo menos uma loja deve ser selecionada"),
    relatorios: z
      .array(z.string())
      .min(1, "Pelo menos um relatório deve ser selecionado"),
    permissoes: z.object(permissoesSchema),
  });
}

// Hook para buscar dados do Supabase
function useSupabaseData() {
  const [modulosComPermissoes, setModulosComPermissoes] = useState<ModuloComPermissoes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Buscar módulos e permissões
        const { data: modulosData, error: modulosError } = await supabase
          .from('modulos')
          .select('*')
          .order('nome');

        if (modulosError) throw modulosError;

        const { data: permissoesData, error: permissoesError } = await supabase
          .from('permissoes')
          .select('*')
          .order('nome');

        if (permissoesError) throw permissoesError;

        // Agrupar permissões por módulo e filtrar apenas módulos com permissões
        const modulosComPermissoesData: ModuloComPermissoes[] = modulosData
          .map((modulo) => ({
            ...modulo,
            permissoes: permissoesData.filter((permissao) => permissao.modulo === modulo.id),
          }))
          .filter((modulo) => modulo.permissoes.length > 0); // Só módulos com permissões

        setModulosComPermissoes(modulosComPermissoesData);
      } catch (err) {
        console.error('Erro ao buscar dados:', err);
        setError('Erro ao carregar dados. Tente novamente.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { modulosComPermissoes, loading, error, refetch: () => {
    setLoading(true);
    setError(null);
  }};
}

// Interface para as props do componente
interface AdicionarUsuarioSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
}

// Dados mockados (mantidos para departamentos, lojas e relatórios)
const mockData = {
  departamentos: ["Eletrodomésticos", "Móveis", "Decoração", "Cama & Banho", "Informática", "Casa & Jardim"],
  lojas: ["Loja Centro", "Loja Norte", "Loja Sul", "Loja Oeste", "Loja Leste", "Loja Shopping"],
  relatorios: [
    "Relatório de Vendas",
    "Relatório de Estoque",
    "Relatório de Margem",
    "Relatório de Performance",
    "Relatório de Concorrência",
    "Relatório de Sazonalidade"
  ],
};

// Componente Multi-select (mantido igual)
function MultiSelect({
  options,
  value = [],
  onChange,
  placeholder,
  searchPlaceholder = "Pesquisar...",
  emptyMessage = "Nenhum item encontrado.",
  hasError = false,
}: {
  options: string[];
  value?: string[];
  onChange: (value: string[]) => void;
  placeholder: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  hasError?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const handleSelect = (selectedValue: string) => {
    const newValue = value.includes(selectedValue)
      ? value.filter((item) => item !== selectedValue)
      : [...value, selectedValue];
    onChange(newValue);
  };

  const removeItem = (item: string) => {
    onChange(value.filter((v) => v !== item));
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between bg-white hover:bg-accent hover:text-accent-foreground",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              value.length === 0 && "text-muted-foreground",
              hasError && "border-destructive focus-visible:ring-destructive"
            )}
          >
            {value.length === 0
              ? placeholder
              : `${value.length} item(s) selecionado(s)`}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] max-h-[300px] p-0">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandList>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option}
                    value={option}
                    onSelect={() => handleSelect(option)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value.includes(option) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {value.map((item) => (
            <Badge key={item} variant="secondary" className="text-xs">
              {item}
              <button
                type="button"
                className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    removeItem(item);
                  }
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={() => removeItem(item)}
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdicionarUsuarioSheet({
  open,
  onOpenChange,
  onSubmit,
}: AdicionarUsuarioSheetProps) {
  const { modulosComPermissoes, loading, error } = useSupabaseData();
  
  // Criar valores padrão para permissões dinamicamente
  const createDefaultPermissoes = () => {
    if (modulosComPermissoes.length === 0) {
      return {};
    }
    
    const defaultPermissoes: Record<string, Record<string, boolean>> = {};
    modulosComPermissoes.forEach((modulo) => {
      if (modulo && modulo.id && modulo.permissoes) {
        defaultPermissoes[modulo.id] = {};
        modulo.permissoes.forEach((permissao) => {
          if (permissao && permissao.permissao) {
            defaultPermissoes[modulo.id][permissao.permissao] = false;
          }
        });
      }
    });
    return defaultPermissoes;
  };

  // Schema dinâmico baseado nos dados carregados
  const formSchema = modulosComPermissoes.length > 0 
    ? createFormSchema(modulosComPermissoes)
    : z.object({
        nome: z.string(),
        email: z.string(),
        senha: z.string(),
        foto_perfil: z.any(),
        departamentos: z.array(z.string()),
        lojas: z.array(z.string()),
        relatorios: z.array(z.string()),
        permissoes: z.object({}),
      });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      email: "",
      senha: "",
      foto_perfil: undefined,
      departamentos: [],
      lojas: [],
      relatorios: [],
      permissoes: {},
    },
  });

  // Reset form quando os dados são carregados
  useEffect(() => {
    if (modulosComPermissoes.length > 0) {
      const defaultPermissoes = createDefaultPermissoes();
      form.reset({
        nome: "",
        email: "",
        senha: "",
        foto_perfil: undefined,
        departamentos: [],
        lojas: [],
        relatorios: [],
        permissoes: defaultPermissoes,
      });
    }
  }, [modulosComPermissoes, form]);

  const handleFormSubmit = (data: any) => {
    // Garantir que todas as permissões tenham valores boolean
    const processedData = {
      ...data,
      permissoes: Object.fromEntries(
        Object.entries(data.permissoes || {}).map(([moduloId, perms]) => [
          moduloId,
          Object.fromEntries(
            Object.entries(perms as Record<string, any>).map(([permKey, value]) => [
              permKey,
              Boolean(value)
            ])
          )
        ])
      )
    };
    
    onSubmit(processedData);
    onOpenChange(false);
    
    // Reset com valores padrão seguros
    if (modulosComPermissoes.length > 0) {
      const defaultPermissoes = createDefaultPermissoes();
      form.reset({
        nome: "",
        email: "",
        senha: "",
        foto_perfil: undefined,
        departamentos: [],
        lojas: [],
        relatorios: [],
        permissoes: defaultPermissoes,
      });
    } else {
      form.reset();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button>
          Adicionar usuário
          <Plus className="ml-2 h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-sidebar w-[600px] sm:max-w-[600px] flex flex-col p-0 overflow-hidden gap-y-0">
        <SheetHeader className="flex-shrink-0 bg-sidebar border-b px-6 py-4 gap-y-0">
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
              {/* Loading state */}
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Carregando dados...</span>
                  </div>
                </div>
              )}

              {/* Error state */}
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Form fields - só renderiza se não estiver carregando */}
              {!loading && !error && (
                <>
                  {/* Nome */}
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Nome completo{" "}
                          <span className="text-red-500">*</span>
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
                            {/* Preview da imagem */}
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
                            
                            {/* Área de upload */}
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
                              <div className={cn(
                                "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200",
                                value 
                                  ? "border-green-300 bg-green-50 hover:border-green-400" 
                                  : "border-gray-300 bg-gray-50 hover:border-primary hover:bg-primary/5"
                              )}>
                                <div className="flex flex-col items-center gap-3">
                                  {value ? (
                                    <>
                                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                        <CheckCircle className="h-6 w-6 text-green-600" />
                                      </div>
                                      <div className="space-y-1">
                                        <p className="text-sm font-medium text-green-700">
                                          Arquivo selecionado com sucesso!
                                        </p>
                                        <p className="text-xs text-green-600">
                                          {value.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          Clique para alterar a imagem
                                        </p>
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                        <Upload className="h-6 w-6 text-primary" />
                                      </div>
                                      <div className="space-y-1">
                                        <p className="text-sm font-medium text-gray-700">
                                          Clique para selecionar uma imagem
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          PNG, JPG, GIF até 10MB
                                        </p>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Selecione uma foto para o perfil do usuário
                        </FormDescription>
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
                            options={mockData.departamentos}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Selecione os departamentos"
                            searchPlaceholder="Pesquisar departamentos..."
                            emptyMessage="Nenhum departamento encontrado."
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
                            options={mockData.lojas}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Selecione as lojas"
                            searchPlaceholder="Pesquisar lojas..."
                            emptyMessage="Nenhuma loja encontrada."
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
                            options={mockData.relatorios}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Selecione os relatórios"
                            searchPlaceholder="Pesquisar relatórios..."
                            emptyMessage="Nenhum relatório encontrado."
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

                  {/* Permissões Dinâmicas */}
                  <div className="space-y-6">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Permissões do usuário
                    </h3>

                    {modulosComPermissoes.length > 0 && modulosComPermissoes.map((modulo) => (
                      <div key={modulo.id} className="space-y-3">
                        <h4 className="text-sm font-medium">{modulo.nome}</h4>
                        <div className="space-y-5">
                          {modulo.permissoes && modulo.permissoes.length > 0 && modulo.permissoes.map((permissao) => (
                            <FormField
                              key={permissao.id}
                              control={form.control}
                              name={`permissoes.${modulo.id}.${permissao.permissao}`}
                              render={({ field }) => {
                                const fieldValue = field.value;
                                const isChecked = typeof fieldValue === 'boolean' ? fieldValue : false;
                                
                                return (
                                  <FormItem className="flex flex-col space-y-0">
                                    <div className="flex items-center space-x-2">
                                      <FormControl>
                                        <Checkbox
                                          checked={isChecked}
                                          onCheckedChange={(checked) => {
                                            field.onChange(checked === true);
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="text-sm font-medium cursor-pointer">
                                        {permissao.nome}
                                      </FormLabel>
                                    </div>
                                    {permissao.descricao && (
                                      <FormDescription className="text-xs text-muted-foreground ml-6">
                                        {permissao.descricao}
                                      </FormDescription>
                                    )}
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    ))}

                    {modulosComPermissoes.length === 0 && !loading && !error && (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>Nenhum módulo com permissões encontrado.</p>
                        <p className="text-xs mt-1">Verifique se há módulos e permissões cadastrados no sistema.</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Botões sticky */}
            <div className="flex-shrink-0 border-t bg-sidebar px-6 py-4">
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading || !!error}
                >
                  {loading ? (
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