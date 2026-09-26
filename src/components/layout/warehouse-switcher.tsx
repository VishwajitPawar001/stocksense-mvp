"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Building2, ChevronDown, Check, Settings, Globe } from "lucide-react";
import Link from "next/link";
import { getWarehouses } from "@/actions/settings";

interface Warehouse {
  id: number;
  name: string;
  short_code: string;
  address?: string;
}

export function WarehouseSwitcher() {
  const router = useRouter();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>({
    id: 1,
    name: "Central Warehouse",
    short_code: "WH01",
  });
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const res = await getWarehouses();
      if (res.success && res.warehouses && res.warehouses.length > 0) {
        setWarehouses(res.warehouses);

        // Read cookie first
        const match = document.cookie.match(/stocksense_active_warehouse_id=([^;]+)/);
        const cookieVal = match ? match[1] : null;

        if (cookieVal === "all") {
          setSelectedWarehouse(null);
          return;
        }

        if (cookieVal) {
          const found = res.warehouses.find((w: Warehouse) => String(w.id) === cookieVal);
          if (found) {
            setSelectedWarehouse(found);
            return;
          }
        }

        // Default to first warehouse
        setSelectedWarehouse(res.warehouses[0]);
        document.cookie = `stocksense_active_warehouse_id=${res.warehouses[0].id}; path=/; max-age=31536000`;
      }
    }
    load();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(wh: Warehouse | null) {
    setSelectedWarehouse(wh);
    if (wh) {
      document.cookie = `stocksense_active_warehouse_id=${wh.id}; path=/; max-age=31536000`;
      localStorage.setItem("stocksense_active_warehouse_id", String(wh.id));
      localStorage.setItem("stocksense_active_warehouse_code", wh.short_code);
      localStorage.setItem("stocksense_active_warehouse_name", wh.name);
    } else {
      document.cookie = `stocksense_active_warehouse_id=all; path=/; max-age=31536000`;
      localStorage.setItem("stocksense_active_warehouse_id", "all");
    }
    setIsOpen(false);
    router.refresh();
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Active Warehouse Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-xs text-slate-300 transition-all cursor-pointer group"
      >
        <div className="flex items-center gap-2.5 min-w-0 text-left">
          <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">
            {selectedWarehouse ? (
              <Building2 className="w-3.5 h-3.5" />
            ) : (
              <Globe className="w-3.5 h-3.5" />
            )}
          </div>
          <div className="truncate">
            <p className="font-semibold text-white truncate text-[12px] group-hover:text-indigo-300 transition-colors">
              {selectedWarehouse ? selectedWarehouse.name : "All Warehouses"}
            </p>
            <p className="text-[10px] text-slate-400 font-mono">
              {selectedWarehouse ? `${selectedWarehouse.short_code} • Active Depot` : "Consolidated View"}
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180 text-indigo-400" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="px-2.5 py-1.5 border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Switch Facility
          </div>

          <div className="max-h-56 overflow-y-auto py-1 space-y-0.5">
            {/* Option: All Warehouses */}
            <button
              onClick={() => handleSelect(null)}
              type="button"
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left text-xs transition cursor-pointer ${
                selectedWarehouse === null
                  ? "bg-indigo-600 text-white font-medium shadow-xs"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <div>
                  <p className="font-medium truncate">All Facilities (Global)</p>
                  <p className="text-[10px] text-slate-400">Combined organization view</p>
                </div>
              </div>
              {selectedWarehouse === null && <Check className="w-4 h-4 text-white shrink-0 ml-2" />}
            </button>

            {/* Individual Warehouses */}
            {warehouses.map((wh) => {
              const isSelected = selectedWarehouse?.id === wh.id;
              return (
                <button
                  key={wh.id}
                  onClick={() => handleSelect(wh)}
                  type="button"
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left text-xs transition cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600 text-white font-medium shadow-xs"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <div className="truncate">
                    <p className="truncate font-medium">{wh.name}</p>
                    <p
                      className={`text-[10px] font-mono ${
                        isSelected ? "text-indigo-200" : "text-slate-400"
                      }`}
                    >
                      {wh.short_code} {wh.address ? `• ${wh.address}` : ""}
                    </p>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-white shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>

          <div className="pt-1 mt-1 border-t border-slate-800">
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] text-indigo-400 hover:text-indigo-300 hover:bg-slate-800/60 transition"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Configure Warehouses & Racks</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
