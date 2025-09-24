"use client";

import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Calendar as CalendarIcon,
  Check,
  ChevronsUpDown,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

// Tipos
interface FormData {
  nome: string;
  compartilharCom?: string[];
  pesquisasPreco: string[];
  loja: string;
  periodo: {
    from: Date;
    to: Date;
  };
  departamentos?: string[];
  grupos?: string[];
  fornecedores?: string[];
  marcas?: string[];
  produtos?: string[];
}

interface AdicionarSimulacaoSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<FormData>;
  onSubmit: (data: FormData) => void;
}

// Dados mockados
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

// Componente Multi-select
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
              "w-full justify-between bg-white hover:bg-accent hover:text-accent-foreground",
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
            "w-full justify-start text-left font-normal bg-white hover:bg-accent hover:text-accent-foreground",
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

export default function AdicionarSimulacaoSheet({
  open,
  onOpenChange,
  form,
  onSubmit,
}: AdicionarSimulacaoSheetProps) {
  const handleFormSubmit = (data: FormData) => {
    onSubmit(data);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button>
          Adicionar simulação
          <Plus className="ml-2 h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-white w-[600px] sm:max-w-[600px] flex flex-col p-0 overflow-hidden gap-y-0">
        <SheetHeader className="flex-shrink-0 bg-white border-b px-6 py-4 gap-y-0">
          <SheetTitle>Adicionar simulação</SheetTitle>
          <SheetDescription>
            Preencha os campos abaixo para criar uma nova simulação de vendas.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="flex flex-col flex-1 min-h-0"
          >
            <div className="flex-1 overflow-y-auto px-6 pt-6 pb-6 space-y-6">
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
                        <SelectTrigger className="w-full bg-white hover:bg-accent hover:text-accent-foreground hover:[&>span]:text-accent-foreground">
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
            <div className="flex-shrink-0 border-t bg-white px-6 py-4">
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
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
  );
}