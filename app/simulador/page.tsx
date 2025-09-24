"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Edit,
  Trash2,
  ShoppingCart,
  DollarSign,
  Calendar as CalendarDaysIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import AdicionarSimulacaoSheet from "./AdicionarSimulacaoSheet";

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
                  className="bg-white w-64 pr-10"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>

              <AdicionarSimulacaoSheet
                open={sheetOpen}
                onOpenChange={setSheetOpen}
                form={form}
                onSubmit={onSubmit}
              />
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
                              "bg-amber-200 text-amber-900 hover:bg-amber-200",
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