"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
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
import {
  Search,
  Plus,
  Calendar as CalendarIcon,
  Check,
  ChevronsUpDown,
  X,
  Edit,
  Trash2,
  ShoppingCart,
  DollarSign,
  Calendar as CalendarDaysIcon,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { DateRange } from "react-day-picker";

// Schema de validação
const formSchema = z.object({
  nome: z.string().min(1, "Nome da simulação é obrigatório"),
  compartilharCom: z.array(z.string()).optional(),
  pesquisasPreco: z
    .array(z.string())
    .min(1, "Pelo menos uma pesquisa de preço é obrigatória"),
  loja: z.string().min(1, "Loja é obrigatória"),
  periodo: z.object(
    {
      from: z.date({ message: "Data inicial é obrigatória" }),
      to: z.date({ message: "Data final é obrigatória" }),
    },
    { message: "Período é obrigatório" }
  ),
  departamentos: z.array(z.string()).optional(),
  grupos: z.array(z.string()).optional(),
  fornecedores: z.array(z.string()).optional(),
  marcas: z.array(z.string()).optional(),
  produtos: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof formSchema>;

// Dados mockados para os selects
const mockData = {
  usuarios: ["João Silva", "Maria Santos", "Pedro Costa", "Ana Oliveira"],
  pesquisasPreco: [
    "Pesquisa Mensal",
    "Pesquisa Semanal",
    "Pesquisa Concorrentes",
  ],
  lojas: ["Loja Centro", "Loja Norte", "Loja Sul", "Loja Oeste"],
  departamentos: ["Eletrodomésticos", "Móveis", "Decoração", "Cama & Banho"],
  grupos: ["Grupo A", "Grupo B", "Grupo C", "Grupo D"],
  fornecedores: ["Fornecedor Alpha", "Fornecedor Beta", "Fornecedor Gamma"],
  marcas: ["Marca X", "Marca Y", "Marca Z"],
  produtos: ["Produto 1", "Produto 2", "Produto 3", "Produto 4"],
};

// Dados fictícios para as simulações
const simulacoes = [
  {
    id: 1,
    titulo: "Simulação Itumbiara",
    status: "Em andamento",
    statusType: "andamento" as const,
    loja: "001",
    pesquisaPreco: "Dia a Dia Iub - 11/09/2025",
    periodo: {
      inicio: "01/08/2025",
      fim: "31/08/2025",
    },
  },
  {
    id: 2,
    titulo: "Simulação Centro",
    status: "Concluído",
    statusType: "concluido" as const,
    loja: "002",
    pesquisaPreco: "Pesquisa Mensal - 15/09/2025",
    periodo: {
      inicio: "15/07/2025",
      fim: "15/08/2025",
    },
  },
  {
    id: 3,
    titulo: "Simulação Região Norte",
    status: "Cancelado",
    statusType: "cancelado" as const,
    loja: "003",
    pesquisaPreco: "Pesquisa Concorrentes - 20/09/2025",
    periodo: {
      inicio: "01/09/2025",
      fim: "30/09/2025",
    },
  },
];

// Função para obter variante do badge baseado no status
const getStatusBadgeVariant = (statusType: string) => {
  switch (statusType) {
    case "concluido":
      return "default"; // Verde
    case "andamento":
      return "secondary"; // Será estilizado como amarelo
    case "cancelado":
      return "destructive"; // Vermelho
    default:
      return "secondary";
  }
};

// Componente Multi-select reutilizável
function MultiSelect({
  options,
  value = [],
  onChange,
  placeholder,
  searchPlaceholder = "Pesquisar...",
  emptyMessage = "Nenhum item encontrado.",
}: {
  options: string[];
  value?: string[];
  onChange: (value: string[]) => void;
  placeholder: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
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
              "w-full justify-between",
              value.length === 0 && "text-muted-foreground"
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

// Componente Date Range Picker
function DateRangePicker({
  value,
  onChange,
}: {
  value?: DateRange;
  onChange: (value: DateRange | undefined) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value?.from && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value?.from ? (
            value.to ? (
              <>
                {format(value.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                {format(value.to, "dd/MM/yyyy", { locale: ptBR })}
              </>
            ) : (
              format(value.from, "dd/MM/yyyy", { locale: ptBR })
            )
          ) : (
            "Selecione o período"
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={value?.from}
          selected={value}
          onSelect={onChange}
          numberOfMonths={1}
          locale={ptBR}
        />
      </PopoverContent>
    </Popover>
  );
}

export default function Page() {
  const [sheetOpen, setSheetOpen] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      compartilharCom: [],
      pesquisasPreco: [],
      loja: "",
      departamentos: [],
      grupos: [],
      fornecedores: [],
      marcas: [],
      produtos: [],
    },
  });

  const onSubmit = (data: FormData) => {
    console.log("Dados do formulário:", data);
    // Aqui você implementaria a lógica para salvar a simulação
    setSheetOpen(false);
    form.reset();
  };

  const handleEdit = (id: number) => {
    console.log("Editar simulação:", id);
    // Implementar lógica de edição
  };

  const handleDelete = (id: number) => {
    console.log("Excluir simulação:", id);
    // Implementar lógica de exclusão
  };

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <main className="flex-1 p-6">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <h1 className="text-xl font-bold">Simulador de Vendas</h1>
              <p className="text-base text-muted-foreground">
                Aqui está todas suas simulações!
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Input
                  placeholder="Pesquise por uma simulação..."
                  className="w-64 pr-10"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>

              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button>
                    Adicionar simulação
                    <Plus className="ml-2 h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-[600px] sm:max-w-[600px] flex flex-col p-0 overflow-hidden">
                  <SheetHeader className="flex-shrink-0 bg-background border-b px-6 py-4 gap-y-0">
                    <SheetTitle>Adicionar simulação</SheetTitle>
                    <SheetDescription>
                      Preencha os campos abaixo para criar uma nova simulação de
                      vendas.
                    </SheetDescription>
                  </SheetHeader>

                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="flex flex-col flex-1 min-h-0"
                    >
                      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                        {/* Nome da simulação */}
                        <FormField
                          control={form.control}
                          name="nome"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Nome da simulação{" "}
                                <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Digite o nome da simulação"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Compartilhar com */}
                        <FormField
                          control={form.control}
                          name="compartilharCom"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Compartilhar com</FormLabel>
                              <FormControl>
                                <MultiSelect
                                  options={mockData.usuarios}
                                  value={field.value}
                                  onChange={field.onChange}
                                  placeholder="Selecione usuários para compartilhar"
                                  searchPlaceholder="Pesquisar usuários..."
                                  emptyMessage="Nenhum usuário encontrado."
                                />
                              </FormControl>
                              <FormDescription>
                                Usuários que terão acesso a esta simulação
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Pesquisas de preço */}
                        <FormField
                          control={form.control}
                          name="pesquisasPreco"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Pesquisas de preço{" "}
                                <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <MultiSelect
                                  options={mockData.pesquisasPreco}
                                  value={field.value}
                                  onChange={field.onChange}
                                  placeholder="Selecione as pesquisas de preço"
                                  searchPlaceholder="Pesquisar pesquisas..."
                                  emptyMessage="Nenhuma pesquisa encontrada."
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Loja */}
                        <FormField
                          control={form.control}
                          name="loja"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Loja <span className="text-red-500">*</span>
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecione uma loja" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {mockData.lojas.map((loja) => (
                                    <SelectItem key={loja} value={loja}>
                                      {loja}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Período */}
                        <FormField
                          control={form.control}
                          name="periodo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Período <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <DateRangePicker
                                  value={field.value}
                                  onChange={field.onChange}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Separator />

                        {/* Filtros opcionais */}
                        <div className="space-y-6">
                          <h3 className="text-sm font-medium text-muted-foreground">
                            Filtros opcionais
                          </h3>

                          {/* Departamentos */}
                          <FormField
                            control={form.control}
                            name="departamentos"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Departamentos</FormLabel>
                                <FormControl>
                                  <MultiSelect
                                    options={mockData.departamentos}
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="Selecione departamentos"
                                    searchPlaceholder="Pesquisar departamentos..."
                                    emptyMessage="Nenhum departamento encontrado."
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Grupos */}
                          <FormField
                            control={form.control}
                            name="grupos"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Grupos</FormLabel>
                                <FormControl>
                                  <MultiSelect
                                    options={mockData.grupos}
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="Selecione grupos"
                                    searchPlaceholder="Pesquisar grupos..."
                                    emptyMessage="Nenhum grupo encontrado."
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Fornecedores */}
                          <FormField
                            control={form.control}
                            name="fornecedores"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Fornecedores</FormLabel>
                                <FormControl>
                                  <MultiSelect
                                    options={mockData.fornecedores}
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="Selecione fornecedores"
                                    searchPlaceholder="Pesquisar fornecedores..."
                                    emptyMessage="Nenhum fornecedor encontrado."
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Marcas */}
                          <FormField
                            control={form.control}
                            name="marcas"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Marcas</FormLabel>
                                <FormControl>
                                  <MultiSelect
                                    options={mockData.marcas}
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="Selecione marcas"
                                    searchPlaceholder="Pesquisar marcas..."
                                    emptyMessage="Nenhuma marca encontrada."
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Produtos */}
                          <FormField
                            control={form.control}
                            name="produtos"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Produtos</FormLabel>
                                <FormControl>
                                  <MultiSelect
                                    options={mockData.produtos}
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="Selecione produtos"
                                    searchPlaceholder="Pesquisar produtos..."
                                    emptyMessage="Nenhum produto encontrado."
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {/* Botões sticky */}
                      <div className="flex-shrink-0 border-t bg-background px-6 py-4">
                        <div className="flex justify-end gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setSheetOpen(false)}
                          >
                            Cancelar
                          </Button>
                          <Button type="submit">Criar simulação</Button>
                        </div>
                      </div>
                    </form>
                  </Form>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Seção de Cards das Simulações */}
          <div className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {simulacoes.map((simulacao) => (
                <Card
                  key={simulacao.id}
                  className="gap-0 hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-ring hover:-translate-y-1 hover:ring-ring/50 hover:ring-[3px]"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <CardTitle className="text-lg font-semibold truncate">
                          {simulacao.titulo}
                        </CardTitle>
                        <Badge
                          variant={getStatusBadgeVariant(simulacao.statusType)}
                          className={cn(
                            "text-xs flex-shrink-0",
                            simulacao.statusType === "andamento" &&
                              "bg-yellow-200 text-yellow-900 hover:bg-yellow-200",
                            simulacao.statusType === "concluido" &&
                              "bg-green-200 text-green-900 hover:bg-green-200",
                            simulacao.statusType === "cancelado" &&
                              "bg-red-200 text-red-900 hover:bg-red-200"
                          )}
                        >
                          {simulacao.status}
                        </Badge>
                      </div>
                      <div className="flex gap-1 ml-2 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(simulacao.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(simulacao.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                        <ShoppingCart className="h-4 w-4 text-blue-700" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          Loja:
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {simulacao.loja}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg">
                        <DollarSign className="h-4 w-4 text-green-700" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          Pesquisa de preço:
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {simulacao.pesquisaPreco}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-lg">
                        <CalendarDaysIcon className="h-4 w-4 text-purple-700" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          Período:
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {simulacao.periodo.inicio} - {simulacao.periodo.fim}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
