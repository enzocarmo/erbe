"use client";

import { useState, useMemo, useRef } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Pencil, Trash2, KeyRound, Plus } from "lucide-react";
import { PermissionGuard } from "@/components/guards/PermissionGuard";
import { permissions } from "@/lib/supabase";
import AdicionarUsuarioSheet from "./AdicionarUsuarioSheet";
import EditarUsuarioSheet from "./EditarUsuarioSheet";
import ExcluirUsuarioSheet from "./ExcluirUsuarioSheet";
import MudarSenhaSheet from "./MudarSenhaSheet";
import { useUsuarios } from "@/hooks/useUsuarios";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);
import "ag-grid-community/styles/ag-theme-quartz.css";
import "@/styles/ag-grid-shadcn.css";

export default function UsuariosPage() {
  const [sheetAdicionarAberto, setSheetAdicionarAberto] = useState(false);

  const [editarAberto, setEditarAberto] = useState(false);
  const [excluirAberto, setExcluirAberto] = useState(false);
  const [senhaAberto, setSenhaAberto] = useState(false);

  const [linhaSelecionada, setLinhaSelecionada] = useState<any | null>(null);
  const gridRef = useRef<AgGridReact>(null);
  const { linhas, carregando, erro, recarregar } = useUsuarios();

  const colunas = useMemo(
    () => [
      {
        field: "foto_perfil",
        headerName: "Foto",
        width: 80,
        cellRenderer: (p: any) =>
          p.value ? (
            <img
              src={p.value}
              className="h-8 w-8 rounded-full object-cover border"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-muted" />
          ),
        sortable: false,
        filter: false,
        resizable: false,
      },
      { field: "nome", headerName: "Nome", flex: 1, minWidth: 160 },
      { field: "email", headerName: "Email", flex: 1, minWidth: 200 },
      { field: "criado_em", headerName: "Criado em", width: 160 },
      {
        headerName: "Ações",
        width: 220,
        cellRenderer: (p: any) => {
          const row = p.data;
          return (
            <div className="flex gap-2">
              <PermissionGuard permission={permissions.editarUsuario}>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setLinhaSelecionada(row);
                    setEditarAberto(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </PermissionGuard>
              <PermissionGuard permission={permissions.mudarSenhaUsuario}>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setLinhaSelecionada(row);
                    setSenhaAberto(true);
                  }}
                >
                  <KeyRound className="h-4 w-4" />
                </Button>
              </PermissionGuard>
              <PermissionGuard permission={permissions.excluirUsuario}>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    setLinhaSelecionada(row);
                    setExcluirAberto(true);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </PermissionGuard>
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <PermissionGuard permission={permissions.visualizarUsuario}>
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <main className="flex-1 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex flex-col">
                <h1 className="text-xl font-bold">Usuários</h1>
                <p className="text-base text-muted-foreground">
                  Gerencie os usuários do sistema
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Input
                    placeholder="Pesquise por um usuário..."
                    className="bg-white w-64 pr-10"
                    onChange={(e) => {
                      gridRef.current?.api.setGridOption(
                        "quickFilterText",
                        e.target.value
                      ); // ✅ correto
                    }}
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>

                <PermissionGuard permission={permissions.criarUsuario}>
                  <Button onClick={() => setSheetAdicionarAberto(true)}>
                    Adicionar usuário
                    <Plus className="h-4 w-4 mr-2" />
                  </Button>
                </PermissionGuard>
              </div>
            </div>

            <div
              className="ag-theme-shadcn ag-theme-quartz"
              style={{ height: "calc(100vh - 220px)" }}
            >
              <AgGridReact
                ref={gridRef}
                rowData={linhas}
                columnDefs={colunas}
                rowSelection="single"
                animateRows
                overlayNoRowsTemplate={
                  erro ? `Erro: ${erro}` : "Nenhum usuário"
                }
                loadingOverlayComponentParams={{
                  loadingMessage: "Carregando...",
                }}
              />
            </div>

            {/* Sheets */}
            <AdicionarUsuarioSheet
              open={sheetAdicionarAberto}
              onOpenChange={(v) => setSheetAdicionarAberto(v)}
              onSubmit={() => recarregar()}
            />

            {linhaSelecionada && (
              <>
                <EditarUsuarioSheet
                  aberto={editarAberto}
                  aoMudarAberto={setEditarAberto}
                  dadosIniciais={{
                    usuario_auth_id: linhaSelecionada.usuario_auth_id,
                    nome: linhaSelecionada.nome ?? "",
                    email: linhaSelecionada.email ?? "",
                    departamentos: [],
                    lojas: [],
                    relatorios: [],
                    permissoes: [],
                    foto_perfil: linhaSelecionada.foto_perfil ?? undefined,
                  }}
                  onSucesso={recarregar}
                />

                <ExcluirUsuarioSheet
                  aberto={excluirAberto}
                  aoMudarAberto={setExcluirAberto}
                  usuario_auth_id={linhaSelecionada.usuario_auth_id}
                  onSucesso={recarregar}
                />

                <MudarSenhaSheet
                  aberto={senhaAberto}
                  aoMudarAberto={setSenhaAberto}
                  usuario_auth_id={linhaSelecionada.usuario_auth_id}
                  onSucesso={recarregar}
                />
              </>
            )}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </PermissionGuard>
  );
}
