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

const data = {
  user: {
    name: "Enzo Carmo",
    email: "enzocarmo64@gmail.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
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
    },
  ] as Array<{
    title: string;
    url: string;
    icon: LucideIcon;
  }>,
  navSecondary: [
    {
      title: "Obter ajuda",
      url: "/ajuda",
      icon: HelpCircle,
    },
  ] as Array<{
    title: string;
    url: string;
    icon: LucideIcon;
  }>,
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center justify-center py-4">
              <a
                href="/"
                className="flex items-center justify-center"
              >
                <Logo 
                  type={isCollapsed ? "icon" : "logo"} 
                  width={isCollapsed ? 35 : 165} 
                />
              </a>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}