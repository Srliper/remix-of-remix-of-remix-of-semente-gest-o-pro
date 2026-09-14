import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  Boxes,
  LayoutDashboard,
  LogOut,
  Moon,
  Search,
  Settings,
  ShoppingCart,
  Sprout,
  Sun,
  Users,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/lib/store";
import { STORE_LABEL } from "@/lib/types";
import { GlobalSearch } from "@/components/global-search";

const NAV = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, adminOnly: false },
  { title: "Estoque & Produtos", url: "/produtos", icon: Boxes, adminOnly: false },
  { title: "PDV — Vendas", url: "/pdv", icon: ShoppingCart, adminOnly: false },
  { title: "Relatórios", url: "/relatorios", icon: BarChart3, adminOnly: false },
  { title: "Equipe", url: "/equipe", icon: Users, adminOnly: true },
  { title: "Configurações", url: "/configuracoes", icon: Settings, adminOnly: true },
] as const;

function AppSidebar() {
  const { isAdmin, currentUser, logout } = useApp();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  const items = NAV.filter((item) => !item.adminOnly || isAdmin);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-1 py-2">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
            <Sprout className="size-5" />
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <p className="font-display text-sm font-semibold">Brechó A Semente</p>
              <p className="text-xs text-sidebar-foreground/70">Gestão & Delivery</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title}>
                    <Link to={item.url} className="flex items-center gap-2">
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center gap-2 px-1 py-1">
          <Avatar className="size-8">
            <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-xs">
              {currentUser?.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{currentUser?.name}</p>
              <p className="truncate text-xs text-sidebar-foreground/70">
                {isAdmin ? "Administradora" : currentUser?.position}
              </p>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Sair"
            className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={() => {
              logout();
              navigate({ to: "/" });
            }}
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

function useDarkMode() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  return { dark, toggle: () => setDark((d) => !d) };
}

export function AppShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { currentUser, isAdmin } = useApp();
  const navigate = useNavigate();
  const { dark, toggle } = useDarkMode();
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) navigate({ to: "/" });
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-card/90 px-3 backdrop-blur md:px-6">
            <SidebarTrigger />
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden flex-1 md:block"
            >
              <div className="relative max-w-md">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  readOnly
                  placeholder="Buscar produtos, vendas, pessoas..."
                  className="pointer-events-none pl-9"
                />
              </div>
            </button>
            <div className="flex flex-1 items-center justify-end gap-2 md:flex-none">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Buscar"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="size-4" />
              </Button>
              <Badge variant="outline" className="hidden sm:inline-flex">
                {STORE_LABEL[currentUser.store_location]}
              </Badge>
              <Badge className={isAdmin ? "bg-gold text-gold-foreground" : ""}>
                {isAdmin ? "Admin" : "Colaborador"}
              </Badge>
              <Button variant="ghost" size="icon" aria-label="Alternar tema" onClick={toggle}>
                {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </Button>
            </div>
          </header>

          <main className="flex-1 px-3 py-5 md:px-6 md:py-7">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="font-display text-2xl font-semibold md:text-3xl">{title}</h1>
                {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
              </div>
              {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
            </div>
            {children}
          </main>
        </div>
      </div>
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </SidebarProvider>
  );
}
