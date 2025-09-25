"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import {
  Plus,
  Check,
  ChevronsUpDown,
  X,
  Upload,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Schema de validação
const formSchema = z.object({
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
  permissoes: z.object({
    usuarios: z.object({
      excluir: z.boolean().optional(),
      criar: z.boolean().optional(),
      visualizar: z.boolean().optional(),
      editar: z.boolean().optional(),
    }),
    simulador: z.object({
      excluir: z.boolean().optional(),
      criar: z.boolean().optional(),
      visualizar: z.boolean().optional(),
      editar: z.boolean().optional(),
    }),
  }),
});

// Tipo derivado do schema
type FormData = z.infer<typeof formSchema>;

// Interface para as props do componente
interface AdicionarUsuarioSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FormData) => void;
}

// Dados mockados
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

// Componente para validação da senha
function PasswordValidation({ password }: { password: string }) {
  const validations = [
    { 
      label: "Mínimo de 6 caracteres", 
      isValid: password.length >= 6 
    },
    { 
      label: "Ao menos uma letra minúscula", 
      isValid: /[a-z]/.test(password) 
    },
    { 
      label: "Ao menos uma letra maiúscula", 
      isValid: /[A-Z]/.test(password) 
    },
    { 
      label: "Ao menos um número", 
      isValid: /[0-9]/.test(password) 
    },
    { 
      label: "Ao menos um símbolo", 
      isValid: /[^a-zA-Z0-9]/.test(password) 
    },
  ];

  return (
    <div className="space-y-2 mt-2">
      {validations.map((validation, index) => (
        <div key={index} className="flex items-center gap-2">
          {validation.isValid ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4 text-red-600" />
          )}
          <span
            className={cn(
              "text-sm",
              validation.isValid ? "text-green-600" : "text-red-600"
            )}
          >
            {validation.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// Componente Multi-select
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
  // Form é gerenciado internamente no componente
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      email: "",
      senha: "",
      foto_perfil: undefined,
      departamentos: [],
      lojas: [],
      relatorios: [],
      permissoes: {
        usuarios: {
          excluir: false,
          criar: false,
          visualizar: false,
          editar: false,
        },
        simulador: {
          excluir: false,
          criar: false,
          visualizar: false,
          editar: false,
        },
      },
    },
  });

  const handleFormSubmit = (data: FormData) => {
    onSubmit(data);
    onOpenChange(false);
    form.reset();
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
                    {field.value && (
                      <PasswordValidation password={field.value} />
                    )}
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

              {/* Permissões */}
              <div className="space-y-6">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Permissões do usuário
                </h3>

                {/* Módulo de Usuários */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Módulo de Usuários</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="permissoes.usuarios.visualizar"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">
                            Visualizar usuários
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="permissoes.usuarios.criar"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">
                            Criar usuários
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="permissoes.usuarios.editar"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">
                            Editar usuários
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="permissoes.usuarios.excluir"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">
                            Excluir usuários
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Módulo do Simulador */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Módulo de Simulador</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="permissoes.simulador.visualizar"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">
                            Visualizar simulações
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="permissoes.simulador.criar"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">
                            Criar simulações
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="permissoes.simulador.editar"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">
                            Editar simulações
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="permissoes.simulador.excluir"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal">
                            Excluir simulações
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
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
                <Button type="submit">Adicionar usuário</Button>
              </div>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

// Exportar o tipo para caso seja necessário em outros lugares
export type { FormData };