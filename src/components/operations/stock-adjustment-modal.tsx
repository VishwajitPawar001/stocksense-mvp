"use client";

import { useState } from "react";
import { processStockAdjustment } from "@/actions/operations";
import { X, Scale, Loader2, TrendingUp, TrendingDown, CheckCircle2 } from "lucide-react";

interface StockAdjustmentModalProps {
  products: { id: number; name: string; sku: string; quantity_on_hand: number; uom?: string }[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function StockAdjustmentModal({
  products,
  isOpen,
  onClose,
  onSuccess,
}: StockAdjustmentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number>(products[0]?.id || 0);

  const currentProduct = products.find((p) => p.id === Number(selectedProductId)) || products[0];
  const [countedQty, setCountedQty] = useState<number>(currentProduct?.quantity_on_hand || 0);

  if (!isOpen) return null;

  const currentSystemStock = currentProduct ? currentProduct.quantity_on_hand : 0;
  const delta = countedQty - currentSystemStock;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const result = await processStockAdjustment(formData);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      form.reset();
      onSuccess?.();
      onClose();
    }
  }

  function handleProductChange(productId: number) {
    setSelectedProductId(productId);
    const prod = products.find((p) => p.id === productId);
    if (prod) {
      setCountedQty(prod.quantity_on_hand);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-xs">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Inventory Stock Adjustment</h2>
              <p className="text-xs text-slate-500">Reconcile differences between recorded stock and physical count</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Product to Audit <span className="text-rose-500">*</span>
            </label>
            <select
              name="productId"
              required
              value={selectedProductId || (products[0]?.id || "")}
              onChange={(e) => handleProductChange(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku}) — Recorded: {p.quantity_on_hand} {p.uom || "units"}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Recorded Stock</span>
              <p className="text-2xl font-bold font-mono text-slate-800 mt-1">
                {currentSystemStock} <span className="text-xs font-normal text-slate-500">{currentProduct?.uom || "units"}</span>
              </p>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Calculated Delta</span>
              <div className="flex items-center gap-1.5 mt-1 font-mono">
                {delta === 0 ? (
                  <span className="flex items-center gap-1 text-sm font-bold text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" /> Matched (0)
                  </span>
                ) : delta > 0 ? (
                  <span className="flex items-center gap-1 text-lg font-bold text-emerald-600">
                    <TrendingUp className="w-4 h-4" /> +{delta}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-lg font-bold text-rose-600">
                    <TrendingDown className="w-4 h-4" /> {delta}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Actual Physical Counted Quantity <span className="text-rose-500">*</span>
            </label>
            <input
              name="countedQuantity"
              type="number"
              min="0"
              required
              value={countedQty}
              onChange={(e) => setCountedQty(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold font-mono outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Enter the exact count from your physical inventory audit. The system will apply the difference.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Reason for Adjustment
            </label>
            <input
              name="reason"
              type="text"
              defaultValue="Physical inventory recount / audit reconciliation"
              placeholder="e.g. 3 units damaged in transit / audit correction"
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Auditor / Responsible
            </label>
            <input
              name="responsible"
              type="text"
              defaultValue="Inventory Manager"
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md shadow-purple-600/20 transition disabled:opacity-50 cursor-pointer"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Reconciling..." : "Apply Adjustment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
