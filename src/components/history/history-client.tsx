"use client";

import { useState, useMemo } from "react";
import { 
  History, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowLeftRight, 
  Scale, 
  Search, 
  Download, 
  Filter 
} from "lucide-react";

interface MoveHistoryRow {
  id: number;
  reference: string;
  productName: string;
  sku: string;
  quantity: number;
  movement_type: string;
  date: string;
  responsible: string;
}

interface HistoryClientProps {
  initialHistory: MoveHistoryRow[];
}

export function HistoryClient({ initialHistory }: HistoryClientProps) {
  const [search, setSearch] = useState("");
  const [movementType, setMovementType] = useState("ALL");

  const filteredHistory = useMemo(() => {
    return initialHistory.filter((item) => {
      const matchesType = movementType === "ALL" || item.movement_type === movementType;
      const q = search.toLowerCase();
      const matchesSearch =
        item.reference?.toLowerCase().includes(q) ||
        item.productName?.toLowerCase().includes(q) ||
        item.sku?.toLowerCase().includes(q) ||
        item.responsible?.toLowerCase().includes(q);

      return matchesType && matchesSearch;
    });
  }, [initialHistory, movementType, search]);

  const stats = useMemo(() => {
    const inCount = initialHistory.filter((h) => h.movement_type === "IN").length;
    const outCount = initialHistory.filter((h) => h.movement_type === "OUT").length;
    const intCount = initialHistory.filter((h) => h.movement_type === "INTERNAL").length;
    const adjCount = initialHistory.filter((h) => h.movement_type === "ADJUSTMENT").length;
    return { inCount, outCount, intCount, adjCount };
  }, [initialHistory]);

  function exportCSV() {
    const headers = ["Reference", "Product Name", "SKU", "Movement Type", "Quantity", "Timestamp", "Responsible"];
    const rows = filteredHistory.map((h) => [
      h.reference,
      `"${h.productName || ""}"`,
      h.sku,
      h.movement_type,
      h.quantity,
      `"${h.date || ""}"`,
      `"${h.responsible || ""}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `stocksense_ledger_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Stock Ledger & Movement History
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Immutable audit log of all inbound receipts, dispatches, transfers, and adjustments
          </p>
        </div>

        <button
          onClick={exportCSV}
          disabled={filteredHistory.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-xs transition disabled:opacity-50 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Export Ledger (CSV)
        </button>
      </div>

      {/* Movement Filter Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setMovementType(movementType === "IN" ? "ALL" : "IN")}
          className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
            movementType === "IN"
              ? "bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400/20"
              : "bg-white border-slate-200/80 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase text-slate-500">Inbound (IN)</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1">{stats.inCount}</p>
        </button>

        <button
          onClick={() => setMovementType(movementType === "OUT" ? "ALL" : "OUT")}
          className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
            movementType === "OUT"
              ? "bg-rose-50 border-rose-300 ring-2 ring-rose-400/20"
              : "bg-white border-slate-200/80 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase text-slate-500">Outbound (OUT)</span>
            <ArrowUpRight className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1">{stats.outCount}</p>
        </button>

        <button
          onClick={() => setMovementType(movementType === "INTERNAL" ? "ALL" : "INTERNAL")}
          className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
            movementType === "INTERNAL"
              ? "bg-blue-50 border-blue-300 ring-2 ring-blue-400/20"
              : "bg-white border-slate-200/80 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase text-slate-500">Transfers</span>
            <ArrowLeftRight className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1">{stats.intCount}</p>
        </button>

        <button
          onClick={() => setMovementType(movementType === "ADJUSTMENT" ? "ALL" : "ADJUSTMENT")}
          className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
            movementType === "ADJUSTMENT"
              ? "bg-purple-50 border-purple-300 ring-2 ring-purple-400/20"
              : "bg-white border-slate-200/80 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase text-slate-500">Adjustments</span>
            <Scale className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1">{stats.adjCount}</p>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search reference, product, SKU, or user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
          />
        </div>

        <div className="flex items-center gap-2">
          {movementType !== "ALL" && (
            <button
              onClick={() => setMovementType("ALL")}
              className="text-xs font-medium text-indigo-600 hover:underline px-2 cursor-pointer"
            >
              Clear Filter ({movementType})
            </button>
          )}
          <span className="text-xs text-slate-500">Showing {filteredHistory.length} ledger records</span>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs uppercase font-semibold tracking-wider">
            <tr>
              <th className="px-6 py-4">Reference</th>
              <th className="px-6 py-4">Product Name</th>
              <th className="px-6 py-4">SKU</th>
              <th className="px-6 py-4 text-center">Movement Type</th>
              <th className="px-6 py-4 text-right">Delta / Quantity</th>
              <th className="px-6 py-4">Date & Time</th>
              <th className="px-6 py-4">Responsible</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredHistory.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                  <History className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="font-medium text-slate-700">No movement history records match your filter</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Execute a receipt or delivery from the Operations tab to generate new ledger events.
                  </p>
                </td>
              </tr>
            ) : (
              filteredHistory.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-indigo-600">
                    {row.reference}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {row.productName}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">
                    {row.sku}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                        row.movement_type === "IN"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : row.movement_type === "OUT"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : row.movement_type === "INTERNAL"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-purple-50 text-purple-700 border-purple-200"
                      }`}
                    >
                      {row.movement_type === "IN" && <ArrowDownLeft className="w-3 h-3" />}
                      {row.movement_type === "OUT" && <ArrowUpRight className="w-3 h-3" />}
                      {row.movement_type === "INTERNAL" && <ArrowLeftRight className="w-3 h-3" />}
                      {row.movement_type === "ADJUSTMENT" && <Scale className="w-3 h-3" />}
                      {row.movement_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-slate-900">
                    {row.movement_type === "IN" ? `+${row.quantity}` : row.movement_type === "OUT" ? `-${row.quantity}` : row.quantity}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                    {row.date ? new Date(row.date).toLocaleString() : "Just now"}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600 font-medium">
                    {row.responsible || "Admin"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
