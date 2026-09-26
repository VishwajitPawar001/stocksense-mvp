"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  History,
  Settings,
  LogOut,
  Boxes,
  Building2,
  ShieldCheck,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, exact: true },
  { name: "Products", href: "/products", icon: Package },
  { name: "Operations", href: "/operations", icon: ArrowLeftRight },
  { name: "Move History", href: "/history", icon: History },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActive = (item: NavItem) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  const displayName = session?.user?.name || (session?.user?.email ? session.user.email.split("@")[0] : "Admin");
  const displayEmail = session?.user?.email || "admin@stocksense.internal";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col h-screen border-r border-slate-800 select-none flex-shrink-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800/80 gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
          <Boxes className="w-5 h-5" />
        </div>
        <div>
          <span className="font-bold text-base text-white tracking-tight">StockSense</span>
          <span className="ml-2 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            IMS
          </span>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Navigation
        </div>
        {navItems.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? "text-white" : "text-slate-400"}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Active Warehouse & Dynamic User Section */}
      <div className="p-3 border-t border-slate-800/80 space-y-3">
        {/* Active Warehouse Indicator */}
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs text-slate-300">
          <Building2 className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          <div className="truncate">
            <p className="font-medium text-white truncate">Main Warehouse</p>
            <p className="text-[10px] text-slate-400 font-mono">WH01 • Active</p>
          </div>
        </div>

        {/* Dynamic User Profile Card */}
        <div className="flex items-center justify-between px-2 pt-1 bg-slate-800/30 p-2 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-700 to-indigo-500 flex items-center justify-center font-bold text-xs text-white shadow-xs">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <p className="text-xs font-semibold text-white truncate">{displayName}</p>
                <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
              </div>
              <p className="text-[10px] text-slate-400 truncate">{displayEmail}</p>
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            title="Sign Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
