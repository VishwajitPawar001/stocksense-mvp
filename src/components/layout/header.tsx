"use client";

import { usePathname } from "next/navigation";
import { Search, Sparkles, Menu } from "lucide-react";
import Link from "next/link";

const titles: Record<string, string> = {
  "/": "Dashboard Overview",
  "/products": "Master Data: Products",
  "/operations": "Operations & Logistics",
  "/history": "Stock Ledger & Movement History",
  "/settings": "Warehouse & System Settings",
};

interface HeaderProps {
  onToggleMobile?: () => void;
}

export function Header({ onToggleMobile }: HeaderProps) {
  const pathname = usePathname();
  const currentTitle = titles[pathname] || "StockSense IMS";

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        {onToggleMobile && (
          <button
            onClick={onToggleMobile}
            className="md:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
          {currentTitle}
        </h1>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live IMS
        </span>
      </div>

      {/* Right Tools & Shortcuts */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Quick Search */}
        <div className="relative hidden md:block w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search SKU, reference..."
            className="w-full h-9 pl-9 pr-4 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Quick Links */}
        <Link
          href="/operations"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Quick Actions</span>
          <span className="sm:hidden">Actions</span>
        </Link>
      </div>
    </header>
  );
}
