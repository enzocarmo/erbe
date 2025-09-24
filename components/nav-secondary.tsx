"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  type LucideIcon,
  Moon,
  Sun,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useTheme } from "next-themes";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
  }[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const pathname = usePathname();

  // Evita hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const { toggleSidebar, state } = useSidebar();

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={state === "expanded" ? "Recolher menu" : "Expandir menu"}
              onClick={toggleSidebar}
            >
              {state === "expanded" ? (
                <PanelLeftClose className="h-4 w-4" />
              ) : (
                <PanelLeftOpen className="h-4 w-4" />
              )}
              <span>Recolher menu</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={
                mounted
                  ? resolvedTheme === "dark"
                    ? "Mudar para o modo claro"
                    : "Mudar para o modo escuro"
                  : "Mudar o tema"
              }
              onClick={toggleTheme}
            >
              {mounted && resolvedTheme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              <span>
                {mounted
                  ? resolvedTheme === "dark"
                    ? "Modo claro"
                    : "Modo escuro"
                  : "Tema"}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {items.map((item) => {
            const isActive =
              pathname === item.url || pathname.startsWith(item.url + "/");

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isActive}
                >
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
