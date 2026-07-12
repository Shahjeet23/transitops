"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Car,
  ClipboardList,
  DollarSign,
  Fuel,
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
  Sparkles,
  Truck,
  Users,
  Wrench,
  Bell,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useLogout } from "@/hooks/use-auth";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ['admin', 'fleet_manager', 'dispatcher', 'safety_officer', 'financial_analyst'] },
  { href: "/dashboard/vehicles", label: "Vehicles", icon: Truck, roles: ['admin', 'fleet_manager', 'dispatcher', 'safety_officer'] },
  { href: "/dashboard/drivers", label: "Drivers", icon: Users, roles: ['admin', 'fleet_manager', 'dispatcher', 'safety_officer'] },
  { href: "/dashboard/trips", label: "Trips", icon: ClipboardList, roles: ['admin', 'fleet_manager', 'dispatcher'] },
  { href: "/dashboard/maintenance", label: "Maintenance", icon: Wrench, roles: ['admin', 'fleet_manager', 'safety_officer'] },
  { href: "/dashboard/fuel", label: "Fuel", icon: Fuel, roles: ['admin', 'fleet_manager', 'dispatcher', 'financial_analyst'] },
  { href: "/dashboard/expenses", label: "Expenses", icon: DollarSign, roles: ['admin', 'financial_analyst'] },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart3, roles: ['admin', 'fleet_manager', 'financial_analyst'] },
  { href: "/dashboard/assistant", label: "Assistant", icon: Sparkles, roles: ['admin', 'fleet_manager', 'dispatcher', 'safety_officer', 'financial_analyst'] },
  { href: "/dashboard/alerts", label: "Alerts", icon: Bell, roles: ['admin', 'fleet_manager', 'dispatcher', 'safety_officer', 'financial_analyst'] },
];

function NavItem({
  href,
  label,
  Icon,
  active,
}: {
  href: string;
  label: string;
  Icon: React.ElementType;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${active
        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        }`}
    >
      <Icon
        className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${active ? "text-sidebar-primary-foreground" : ""
          }`}
      />
      <span>{label}</span>
    </Link>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const { mutate: logout, isPending: loggingOut } = useLogout();

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* ── Sidebar ── */}
      <aside className="w-64 shrink-0 flex flex-col bg-sidebar border-r border-sidebar-border">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-3 px-5 h-16 border-b border-sidebar-border shrink-0 hover:opacity-80 transition-opacity">
          <div className="p-1.5 rounded-lg bg-sidebar-primary">
            <Truck className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <span className="font-bold text-sidebar-foreground tracking-tight text-lg">
            TransitOps
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {NAV_ITEMS.filter(item => user?.role ? item.roles.includes(user.role) : true).map(({ href, label, icon: Icon }) => (
            <NavItem
              key={href}
              href={href}
              label={label}
              Icon={Icon}
              active={pathname === href}
            />
          ))}
        </nav>

        {/* User footer */}
        <div className="border-t border-sidebar-border p-3 shrink-0">
          {/* Role badge */}
          <div className="flex items-center gap-2 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center text-xs font-bold text-sidebar-primary-foreground shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.name ?? "User"}
              </p>
              <p className="text-xs text-sidebar-foreground/50 capitalize">
                {user?.role?.replace("_", " ") ?? ""}
              </p>
            </div>
          </div>

          {/* Settings + Logout */}
          <div className="space-y-0.5">
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
            <button
              onClick={() => logout()}
              disabled={loggingOut}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              {loggingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        {/* Top header */}
        <header className="h-16 shrink-0 border-b border-border bg-card flex items-center justify-between px-6">
          <div>
            <h1 className="text-base font-semibold text-foreground capitalize">
              {NAV_ITEMS.find((n) => n.href === pathname)?.label ?? "TransitOps"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
              <Shield className="w-3 h-3 text-primary" />
              <span className="text-xs font-medium text-primary capitalize">
                {user?.role?.replace(/_/g, " ") ?? ""}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
              {initials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 p-6">{children}</div>
      </main>
    </div>
  );
}
