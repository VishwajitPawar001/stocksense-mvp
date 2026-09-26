"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowRightLeft, 
  Scale, 
  Search, 
  CheckCircle2, 
  Clock, 
  Layers 
} from "lucide-react";
import { NewReceiptModal } from "./new-receipt-modal";
import { NewDeliveryModal } from "./new-delivery-modal";
import { InternalTransferModal } from "./internal-transfer-modal";
import { StockAdjustmentModal } from "./stock-adjustment-modal";

interface OperationItem {
  id: number;
  reference: string;
  operation_type: string;
  status: string;
  contact: string;
  schedule_date: string;
  responsible: string;
  product_name?: string;
  sku?: string;
  uom?: string;
  demand_qty?: number;
}

interface Product {
  id: number;
  name: string;
  sku: string;
  quantity_on_hand: number;
  uom?: string;
}

interface LocationItem {
  id: number;
  location_name: string;
  warehouse_name: string;
}

interface OperationsClientProps {
  initialOperations: OperationItem[];
  products: Product[];
  locations: LocationItem[];
}

export function OperationsClient({
  initialOperations,
  products,
  locations,
}: OperationsClientProps) {
  const router = useRouter();
  const [filterType, setFilterType] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  // Modals state
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);

  const filteredOperations = useMemo(() => {
    return initialOperations.filter((op) => {
      const matchesType = filterType === "ALL" || op.operation_type === filterType;
      const matchesSearch =
        op.reference.toLowerCase().includes(search.toLowerCase()) ||
        (op.contact && op.contact.toLowerCase().includes(search.toLowerCase())) ||
        (op.product_name && op.product_name.toLowerCase().includes(search.toLowerCase()));

      return matchesType && matchesSearch;
    });
  }, [initialOperations, filterType, search]);

  const stats = useMemo(() => {
    const receipts = initialOperations.filter((o) => o.operation_type === "RECEIPT").length;
    const deliveries = initialOperations.filter((o) => o.operation_type === "DELIVERY").length;
    const transfers = initialOperations.filter((o) => o.operation_type === "INTERNAL").length;
    const adjustments = initialOperations.filter((o) => o.operation_type === "ADJUSTMENT").length;
    return { receipts, deliveries, transfers, adjustments };
  }, [initialOperations]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Buttons */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Operations & Logistics</h1>
          <p className="text-sm text-slate-500 mt-1">
            Process inbound receipts, delivery dispatches, internal rack transfers, and physical count adjustments
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsReceiptOpen(true)}
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            + New Receipt
          </button>

          <button
            onClick={() => setIsDeliveryOpen(true)}
            className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            + Delivery Order
          </button>

          <button
            onClick={() => setIsTransferOpen(true)}
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            + Internal Transfer
          </button>

          <button
            onClick={() => setIsAdjustmentOpen(true)}
            className="inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            <Scale className="w-3.5 h-3.5" />
            + Stock Adjustment
          </button>
        </div>
      </div>

      {/* Quick Summary Pill Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => setFilterType(filterType === "RECEIPT" ? "ALL" : "RECEIPT")}
          className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
            filterType === "RECEIPT"
              ? "bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400/20 shadow-sm"
              : "bg-white border-slate-200/80 hover:border-slate-300 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Receipts (IN)</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-1">{stats.receipts}</p>
        </button>

        <button
          onClick={() => setFilterType(filterType === "DELIVERY" ? "ALL" : "DELIVERY")}
          className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
            filterType === "DELIVERY"
              ? "bg-amber-50 border-amber-300 ring-2 ring-amber-400/20 shadow-sm"
              : "bg-white border-slate-200/80 hover:border-slate-300 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Deliveries (OUT)</span>
            <ArrowUpRight className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-1">{stats.deliveries}</p>
        </button>

        <button
          onClick={() => setFilterType(filterType === "INTERNAL" ? "ALL" : "INTERNAL")}
          className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
            filterType === "INTERNAL"
              ? "bg-blue-50 border-blue-300 ring-2 ring-blue-400/20 shadow-sm"
              : "bg-white border-slate-200/80 hover:border-slate-300 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Transfers</span>
            <ArrowRightLeft className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-1">{stats.transfers}</p>
        </button>

        <button
          onClick={() => setFilterType(filterType === "ADJUSTMENT" ? "ALL" : "ADJUSTMENT")}
          className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
            filterType === "ADJUSTMENT"
              ? "bg-purple-50 border-purple-300 ring-2 ring-purple-400/20 shadow-sm"
              : "bg-white border-slate-200/80 hover:border-slate-300 shadow-xs"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-500">Adjustments</span>
            <Scale className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-1">{stats.adjustments}</p>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search reference, contact, or item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
          />
        </div>

        <div className="flex items-center gap-2">
          {filterType !== "ALL" && (
            <button
              onClick={() => setFilterType("ALL")}
              className="text-xs font-medium text-indigo-600 hover:underline px-2 cursor-pointer"
            >
              Clear Filter ({filterType})
            </button>
          )}
          <span className="text-xs text-slate-500">Showing {filteredOperations.length} operations</span>
        </div>
      </div>

      {/* Operations Table */}
      <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-xs">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase font-semibold text-xs tracking-wider">
            <tr>
              <th className="px-6 py-4">Reference</th>
              <th className="px-6 py-4 text-center">Type</th>
              <th className="px-6 py-4">Product & Demand</th>
              <th className="px-6 py-4">Contact / Route / Reason</th>
              <th className="px-6 py-4">Responsible</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredOperations.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center">
                    <Layers className="w-10 h-10 text-slate-300 mb-2" />
                    <p className="font-medium text-slate-700">No operations found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Start by initiating a Receipt, Delivery, Internal Transfer, or Stock Adjustment above.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredOperations.map((op) => (
                <tr key={op.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-indigo-600">
                    {op.reference}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        op.operation_type === "RECEIPT"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : op.operation_type === "DELIVERY"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : op.operation_type === "INTERNAL"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-purple-50 text-purple-700 border border-purple-200"
                      }`}
                    >
                      {op.operation_type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {op.product_name ? (
                      <div>
                        <p className="font-medium text-slate-900">{op.product_name}</p>
                        <p className="text-xs text-slate-500 font-mono">
                          {op.demand_qty} {op.uom || "units"} • {op.sku}
                        </p>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs">Standard Line</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-700 text-xs font-medium">
                    {op.contact || "—"}
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-xs">
                    {op.responsible || "Admin"}
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs font-mono">
                    {op.schedule_date || "Today"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {op.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Operation Modals */}
      <NewReceiptModal
        products={products}
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        onSuccess={() => router.refresh()}
      />

      <NewDeliveryModal
        products={products}
        isOpen={isDeliveryOpen}
        onClose={() => setIsDeliveryOpen(false)}
        onSuccess={() => router.refresh()}
      />

      <InternalTransferModal
        products={products}
        locations={locations}
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        onSuccess={() => router.refresh()}
      />

      <StockAdjustmentModal
        products={products}
        isOpen={isAdjustmentOpen}
        onClose={() => setIsAdjustmentOpen(false)}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
