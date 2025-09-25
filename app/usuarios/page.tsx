"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { permissions } from "@/lib/supabase";
import { PermissionGuard } from "@/components/guards/PermissionGuard";
import AdicionarUsuarioSheet from "./AdicionarUsuarioSheet";
import type { UserFormData } from "@/types/user";

export default function Usuarios() {
  const [sheetOpen, setSheetOpen] = useState(false);

  // Callback para lidar com a criação do usuário
  const handleCreateUser = (data: UserFormData) => {
    console.log("Dados do formulário:", data);
    // Aqui você implementaria a lógica para salvar o usuário
    // O sheet já se encarrega de fechar e resetar o form
  };

  return (
    <PermissionGuard permission={permissions.visualizarUsuario}>
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <main className="flex-1 p-6">
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <h1 className="text-xl font-bold">Usuários</h1>
                <p className="text-base text-muted-foreground">
                  Aqui está todos seus usuários!
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Input
                    placeholder="Pesquise por um usuário..."
                    className="bg-white w-64 pr-10"
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>

                <AdicionarUsuarioSheet
                  open={sheetOpen}
                  onOpenChange={setSheetOpen}
                  onSubmit={handleCreateUser}
                />
              </div>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </PermissionGuard>
  );
}
