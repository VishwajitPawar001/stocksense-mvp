import { getMoveHistory } from "@/actions/history";
import { History, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Boxes } from "lucide-react";

export default async function HistoryPage() {
  const { success, history, error } = await getMoveHistory();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Stock Ledger & Movement History
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Immutable log of all IN, OUT, Transfer, and Adjustment events.
          </p>
        </div>
      </div>

      {error ? (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">
          {error}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">Reference</th>
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4 text-center">Type</th>
                <th className="px-6 py-4 text-right">Quantity</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Responsible</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!history || history.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <History className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium">No stock movements recorded yet.</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Execute a receipt or delivery from the Operations tab to generate ledger entries.
                    </p>
                  </td>
                </tr>
              ) : (
                history.map((row: any) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-semibold text-slate-900">
                      {row.reference}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {row.productName}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">
                      {row.sku}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                          row.movement_type === "IN"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : row.movement_type === "OUT"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-purple-50 text-purple-700 border-purple-200"
                        }`}
                      >
                        {row.movement_type === "IN" && <ArrowDownLeft className="w-3 h-3" />}
                        {row.movement_type === "OUT" && <ArrowUpRight className="w-3 h-3" />}
                        {row.movement_type === "INTERNAL" && <ArrowLeftRight className="w-3 h-3" />}
                        {row.movement_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-slate-900">
                      {row.movement_type === "IN" ? "+" : "-"}
                      {row.quantity}
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
      )}
    </div>
  );
}
