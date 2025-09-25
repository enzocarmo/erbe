"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuth } from "@/contexts/AuthContext";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

interface PermissionGuardProps {
  permission: string;
  redirectTo?: string;
  loadingMessage?: string;
  children: React.ReactNode;
}

export function PermissionGuard({
  permission,
  redirectTo = "/dashboard",
  loadingMessage = "Carregando...",
  children,
}: PermissionGuardProps) {
  const { hasPermission, loading } = usePermissions();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    // Limpar timeout anterior
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
    }

    // Se ainda está carregando, não fazer nada
    if (loading || authLoading) {
      return;
    }

    // Se não há usuário, redirecionar para login (middleware já faz isso, mas como segurança)
    if (!user) {
      router.push('/');
      return;
    }

    // Marcar que já foi verificado
    setHasChecked(true);

    // Se não tem permissão, aguardar um pouco antes de redirecionar (dar tempo para sincronização)
    if (!hasPermission(permission)) {
      redirectTimeoutRef.current = setTimeout(() => {
        // Verificar novamente se ainda não tem permissão
        if (!hasPermission(permission)) {
          console.warn(`Usuário não possui permissão: ${permission}. Redirecionando...`);
          router.push(redirectTo);
        }
      }, 500); // Aguardar 500ms antes de redirecionar
    }

    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [loading, authLoading, hasPermission, permission, redirectTo, router, user]);

  // Se ainda está carregando
  if (loading || authLoading || !hasChecked) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <main className="flex-1 p-6">
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">{loadingMessage}</p>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  // Se não tem usuário, não renderizar nada
  if (!user) {
    return null;
  }

  // Se não tem permissão, mostrar loading enquanto aguarda redirecionamento
  if (!hasPermission(permission)) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <main className="flex-1 p-6">
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">Verificando permissões...</p>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  // Se tem permissão, renderizar os children
  return <>{children}</>;
}