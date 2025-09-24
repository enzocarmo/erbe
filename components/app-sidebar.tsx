"use client";

import * as React from "react";
import {
  Calculator,
  Users,
  Folder,
  LayoutDashboard,
  ChartNoAxesCombined,
  Settings,
  HelpCircle,
  Search,
  type LucideIcon,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/ui/logo";
import { usePermissions } from "@/hooks/usePermissions";
import { permissions } from "@/lib/supabase";

// Todos os itens de navegação disponíveis
const allNavItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Relatórios",
    url: "/relatorios",
    icon: ChartNoAxesCombined,
  },
  {
    title: "Simulador",
    url: "/simulador",
    icon: Calculator,
  },
  {
    title: "Usuários",
    url: "/usuarios",
    icon: Users,
    permission: permissions.visualizarUsuario, // Requer permissão específica
  },
] as Array<{
  title: string;
  url: string;
  icon: LucideIcon;
  permission?: string; // Permissão opcional
}>;

const navSecondary = [
  {
    title: "Obter ajuda",
    url: "/ajuda",
    icon: HelpCircle,
  },
] as Array<{
  title: string;
  url: string;
  icon: LucideIcon;
}>;

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar();
  const { hasPermission, loading } = usePermissions();
  const isCollapsed = state === "collapsed";

  // Filtrar itens de navegação baseado nas permissões
  const filteredNavItems = React.useMemo(() => {
    if (loading) return allNavItems; // Mostrar todos enquanto carrega

    return allNavItems.filter(item => {
      // Se o item não tem permissão definida, sempre mostrar
      if (!item.permission) return true;
      
      // Se tem permissão definida, só mostrar se o usuário tem a permissão
      return hasPermission(item.permission);
    });
  }, [hasPermission, loading]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center justify-center py-4">
              <a
                href="/dashboard"
                className="flex items-center justify-center"
              >
                <Logo
                  type={isCollapsed ? "icon" : "logo"}
                  width={isCollapsed ? 32 : 165}
                />
              </a>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavItems} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}