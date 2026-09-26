"use client";

import { useState } from "react";
import { processInternalTransfer } from "@/actions/operations";
import { X, ArrowRightLeft, Loader2 } from "lucide-react";

interface InternalTransferModalProps {
  products: { id: number; name: string; sku: string; quantity_on_hand: number; uom?: string }[];
  locations: { id: number; location_name: string; warehouse_name: string }[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function InternalTransferModal({
  products,
  locations,
  isOpen,
  onClose,
  onSuccess,
}: InternalTransferModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<number>(products[0]?.id || 0);

  if (!isOpen) return null;

  const currentProduct = products.find((p) => p.id === Number(selectedProductId)) || products[0];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const result = await processInternalTransfer(formData);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      form.reset();
      onSuccess?.();
      onClose();
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
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-xs">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Internal Stock Transfer</h2>
              <p className="text-xs text-slate-500">Move inventory between warehouses, racks, or shelves</p>
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
              Select Product <span className="text-rose-500">*</span>
            </label>
            <select
              name="productId"
              required
              value={selectedProductId || (products[0]?.id || "")}
              onChange={(e) => setSelectedProductId(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku}) — Available: {p.quantity_on_hand} {p.uom || "units"}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Source Location <span className="text-rose-500">*</span>
              </label>
              <input
                name="sourceLocation"
                type="text"
                list="source-locations-list"
                required
                defaultValue="Main Store / Rack A"
                placeholder="e.g. Main Store"
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              />
              <datalist id="source-locations-list">
                {locations.map((l) => (
                  <option key={`src-${l.id}`} value={`${l.warehouse_name} - ${l.location_name}`} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Destination Location <span className="text-rose-500">*</span>
              </label>
              <input
                name="destLocation"
                type="text"
                list="dest-locations-list"
                required
                defaultValue="Production Floor / Rack B"
                placeholder="e.g. Production Floor"
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              />
              <datalist id="dest-locations-list">
                {locations.map((l) => (
                  <option key={`dest-${l.id}`} value={`${l.warehouse_name} - ${l.location_name}`} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Quantity to Move <span className="text-rose-500">*</span>
              </label>
              <input
                name="quantity"
                type="number"
                min="1"
                max={currentProduct?.quantity_on_hand || 999999}
                required
                defaultValue="1"
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition font-mono"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Max available: {currentProduct ? `${currentProduct.quantity_on_hand} ${currentProduct.uom || "units"}` : ""}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Responsible Person
              </label>
              <input
                name="responsible"
                type="text"
                defaultValue="Warehouse Staff"
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              />
            </div>
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
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 transition disabled:opacity-50 cursor-pointer"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Processing..." : "Validate Transfer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
