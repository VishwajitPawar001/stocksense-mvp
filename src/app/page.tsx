import { getDashboardMetrics } from "@/actions/dashboard";
import Link from "next/link";
import {
  Package,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  Plus,
  TrendingUp,
  History,
  Boxes,
  CheckCircle2,
  Clock,
  Layers,
} from "lucide-react";

export default async function DashboardPage() {
  const { success, metrics, error } = await getDashboardMetrics();

  const totalProducts = metrics?.totalProducts ?? 0;
  const totalStockVolume = metrics?.totalStockVolume ?? 0;
  const lowStockCount = metrics?.lowStockCount ?? 0;
  const outOfStockCount = metrics?.outOfStockCount ?? 0;
  const pendingReceipts = metrics?.pendingReceipts ?? 0;
  const pendingDeliveries = metrics?.pendingDeliveries ?? 0;
  const scheduledTransfers = metrics?.scheduledTransfers ?? 0;
  const recentMovements = metrics?.recentMovements ?? [];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* 1. Page Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Inventory Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time snapshot of stock levels, pending movements, and warehouse throughput.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/operations"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Operation</span>
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200/80 shadow-sm transition-all"
          >
            <Package className="w-4 h-4 text-slate-500" />
            <span>Manage Products</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* 2. Executive 5 KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Total Products */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Products
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-slate-900">{totalProducts}</div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
              <Boxes className="w-3.5 h-3.5 text-indigo-500" />
              <span>{totalStockVolume.toLocaleString()} units in stock</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Low / Out of Stock */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Stock Alerts
            </span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              lowStockCount + outOfStockCount > 0
                ? "bg-rose-50 text-rose-600"
                : "bg-emerald-50 text-emerald-600"
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-slate-900">
              {lowStockCount + outOfStockCount}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="text-amber-600 font-semibold">{lowStockCount} Low</span>
              <span>•</span>
              <span className="text-rose-600 font-semibold">{outOfStockCount} Out</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Pending Receipts */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Pending Receipts
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-slate-900">{pendingReceipts}</div>
            <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>Incoming vendor stock</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Pending Deliveries */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Pending Deliveries
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-slate-900">{pendingDeliveries}</div>
            <div className="text-xs text-sky-600 mt-1 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Outgoing shipments</span>
            </div>
          </div>
        </div>

        {/* KPI 5: Internal Transfers */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Internal Transfers
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-slate-900">{scheduledTransfers}</div>
            <div className="text-xs text-purple-600 mt-1 flex items-center gap-1 font-medium">
              <Layers className="w-3.5 h-3.5" />
              <span>Inter-rack / Store moves</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Dashboard Body: Operations Filter + Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Operations Hub Shortcuts & Status Filter Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Operations Quick Filters & Hub */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Operations Control Center</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Filter and execute stock movements across warehouse operations
                </p>
              </div>
              <Link
                href="/operations"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                View all operations →
              </Link>
            </div>

            {/* Document Type Filter Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Link
                href="/operations"
                className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 transition-all text-left group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600">Receipts</span>
                  <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Vendor Inbound</p>
              </Link>

              <Link
                href="/operations"
                className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 transition-all text-left group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600">Deliveries</span>
                  <ArrowUpRight className="w-4 h-4 text-sky-500" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Customer Outbound</p>
              </Link>

              <Link
                href="/operations"
                className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 transition-all text-left group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600">Transfers</span>
                  <ArrowLeftRight className="w-4 h-4 text-purple-500" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Inter-warehouse</p>
              </Link>

              <Link
                href="/operations"
                className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 transition-all text-left group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600">Adjustments</span>
                  <Boxes className="w-4 h-4 text-amber-500" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Physical Count Fix</p>
              </Link>
            </div>

            {/* Live Operational Status Overview */}
            <div className="pt-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-3">
                Lifecycle Status Filter
              </span>
              <div className="flex flex-wrap gap-2">
                {["Draft", "Waiting", "Ready", "Done", "Canceled"].map((status) => (
                  <Link
                    key={status}
                    href="/operations"
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700 transition-colors"
                  >
                    {status}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Live Stock Ledger & Recent Activity Feed */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Recent Movements</h3>
              </div>
              <Link
                href="/history"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                Ledger →
              </Link>
            </div>

            {recentMovements.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No movements recorded yet. Execute a receipt or delivery to log activity.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentMovements.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-slate-900 truncate">
                          {item.reference}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            item.movement_type === "IN"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : item.movement_type === "OUT"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-purple-50 text-purple-700 border border-purple-200"
                          }`}
                        >
                          {item.movement_type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{item.productName}</p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="font-mono text-xs font-bold text-slate-900">
                        {item.movement_type === "IN" ? "+" : "-"}
                        {item.quantity}
                      </p>
                      <p className="text-[10px] text-slate-400">{item.responsible || "Admin"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
