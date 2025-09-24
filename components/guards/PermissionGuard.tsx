"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePermissions } from "@/hooks/usePermissions";
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
  const router = useRouter();

  useEffect(() => {
    // Se terminou de carregar e não tem permissão, redireciona
    if (!loading && !hasPermission(permission)) {
      router.push(redirectTo);
    }
  }, [loading, hasPermission, permission, redirectTo, router]);

  // Se ainda está carregando as permissões
  if (loading) {
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

  // Se não tem permissão, não renderiza nada (o useEffect já redirecionou)
  if (!hasPermission(permission)) {
    return null;
  }

  // Se tem permissão, renderiza os children
  return <>{children}</>;
}