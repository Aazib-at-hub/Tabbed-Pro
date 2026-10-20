import { useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  BookMarked,
  ChevronLeft,
  Command,
  CreditCard,
  LayoutDashboard,
  Library,
  LogOut,
  Menu,
  Puzzle,
  Search,
  ShieldCheck,
  Sparkles,
  User,
  UserCog,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import logoSrc from "@/assets/logo.png";

type NavItem = { to: string; label: string; icon: typeof Zap };

const GROUPS: { label?: string; items: NavItem[] }[] = [
  {
    items: [
      { to: "/home", label: "Home", icon: LayoutDashboard },
      { to: "/optimize", label: "Optimize", icon: Sparkles },
      { to: "/vault", label: "Vault", icon: BookMarked },
      { to: "/templates", label: "Templates", icon: Library },
      { to: "/teams", label: "Team Workspace", icon: Users },
      { to: "/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Settings",
    items: [
      { to: "/settings/profile", label: "My AI Profile", icon: UserCog },
      { to: "/settings/extension", label: "Extension", icon: Puzzle },
      { to: "/settings/billing", label: "Billing & Plans", icon: CreditCard },
    ],
  },
];

function Brand({ collapsed }: { collapsed: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5 px-1 py-0.5">
      <img
        src={logoSrc}
        alt="Tabbed logo"
        className="size-8 shrink-0 rounded-lg shadow-[0_0_18px_-4px_var(--primary)]"
      />
      {!collapsed && (
        <span className="font-display text-[0.95rem] font-semibold tracking-tight">
          Tabb<span className="text-primary">ed</span>
        </span>
      )}
    </Link>
  );
}

function NavLinks({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const location = useLocation();

  return (
    <nav className="flex flex-1 flex-col gap-5 overflow-y-auto py-2">
      {GROUPS.map((group, gi) => (
        <div key={gi} className="space-y-1">
          {group.label && !collapsed && (
            <p className="px-3 pb-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {group.label}
            </p>
          )}
          {group.items.map((item) => {
            const active =
              location.pathname === item.to || location.pathname.startsWith(item.to + "/");
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onNavigate}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  collapsed && "justify-center px-0",
                  active
                    ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                )}
              >
                <item.icon className={cn("size-4 shrink-0", active && "text-primary")} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function UpgradeCard({ tier }: { tier?: string }) {
  const isPro = tier === "pro" || tier === "teams";

  if (isPro) {
    return (
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
        <div className="flex items-center gap-1.5 text-primary">
          <ShieldCheck className="size-4" />
          <p className="font-display text-xs font-semibold uppercase tracking-wider">
            {tier === "teams" ? "Teams Active" : "Pro Active"}
          </p>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Unlimited prompts & all intelligence modes active.
        </p>
        <Button
          asChild
          size="sm"
          variant="ghost"
          className="mt-2 w-full text-xs text-primary hover:bg-primary/10"
        >
          <Link to="/settings/billing">Manage plan</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/70 bg-gradient-to-br from-primary/12 to-transparent p-3">
      <p className="font-display text-sm font-semibold">Upgrade to Pro</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Unlimited vault, all optimization modes, deep analytics.
      </p>
      <Button asChild size="sm" className="mt-3 w-full">
        <Link to="/pricing">See plans</Link>
      </Button>
    </div>
  );
}

export function AppShell({
  children,
  title,
  description,
  actions,
}: {
  children: ReactNode;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "AK";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col gap-4 border-r border-sidebar-border bg-sidebar p-3 transition-[width] duration-300 lg:flex",
          collapsed ? "w-[4.5rem]" : "w-64",
        )}
      >
        <div className="flex items-center justify-between">
          <Brand collapsed={collapsed} />
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(true)}
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="size-4" />
            </Button>
          )}
        </div>
        {collapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="mx-auto"
            onClick={() => setCollapsed(false)}
            aria-label="Expand sidebar"
          >
            <Menu className="size-4" />
          </Button>
        )}
        <NavLinks collapsed={collapsed} />
        {!collapsed && <UpgradeCard tier={user?.subscriptionTier} />}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-border glass-panel">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  aria-label="Open navigation"
                >
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 bg-sidebar p-3">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <Brand collapsed={false} />
                <NavLinks collapsed={false} onNavigate={() => setMobileOpen(false)} />
                <UpgradeCard tier={user?.subscriptionTier} />
              </SheetContent>
            </Sheet>

            <div className="min-w-0 flex-1">
              <h1 className="truncate font-display text-base font-semibold sm:text-lg">{title}</h1>
              {description && (
                <p className="truncate text-xs text-muted-foreground">{description}</p>
              )}
            </div>

            <div className="hidden items-center gap-2 rounded-lg border border-border bg-muted/60 px-2.5 py-1.5 text-xs text-muted-foreground md:flex">
              <Search className="size-3.5" />
              <span>Search prompts</span>
              <kbd className="ml-4 inline-flex items-center gap-0.5 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[0.65rem]">
                <Command className="size-2.5" />K
              </kbd>
            </div>

            {actions}
            <ThemeToggle />

            {/* User Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative size-8 rounded-full p-0">
                  <Avatar className="size-8 cursor-pointer ring-offset-background transition-all hover:ring-2 hover:ring-primary/50">
                    <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name || "Pro User"}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email || "user@example.com"}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5">
                      {user?.profile?.profession && (
                        <span className="text-[0.65rem] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                          {user.profile.profession}
                        </span>
                      )}
                      <span className="text-[0.65rem] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        {user?.subscriptionTier || "free"}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => navigate("/settings/profile")}
                  className="cursor-pointer gap-2"
                >
                  <UserCog className="size-4" />
                  <span>My AI Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate("/settings/extension")}
                  className="cursor-pointer gap-2"
                >
                  <Puzzle className="size-4" />
                  <span>Extension Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate("/settings/billing")}
                  className="cursor-pointer gap-2"
                >
                  <CreditCard className="size-4" />
                  <span>Billing & Plans</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                >
                  <LogOut className="size-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
