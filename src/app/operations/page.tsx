import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Boxes, Plus } from "lucide-react";
import Link from "next/link";

export default function OperationsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Operations & Logistics Hub
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Execute inbound receipts, outbound customer deliveries, and inventory transfers.
          </p>
        </div>
      </div>

      {/* Operations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Receipts Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Receipts (Incoming)</h2>
            <p className="text-xs text-slate-500 mt-1">
              Receive goods from suppliers and auto-increment warehouse stock.
            </p>
          </div>
          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              Track 2 In Progress →
            </span>
          </div>
        </div>

        {/* Deliveries Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Delivery Orders</h2>
            <p className="text-xs text-slate-500 mt-1">
              Pick, pack, and validate customer shipments with stock decrement.
            </p>
          </div>
          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600">
              Track 2 In Progress →
            </span>
          </div>
        </div>

        {/* Internal Transfers Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <ArrowLeftRight className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Internal Transfers</h2>
            <p className="text-xs text-slate-500 mt-1">
              Move items between racks and warehouse locations safely.
            </p>
          </div>
          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600">
              Track 3 In Progress →
            </span>
          </div>
        </div>

        {/* Adjustments Card */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Stock Adjustments</h2>
            <p className="text-xs text-slate-500 mt-1">
              Reconcile physical inventory counts with system records.
            </p>
          </div>
          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600">
              Track 3 In Progress →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
