"use client";

import { useEffect, useState } from "react";
import { processReceipt } from "@/actions/operations";
import { getProducts } from "@/actions/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, ArrowDownLeft, CheckCircle2 } from "lucide-react";

type Product = {
  id: number;
  name: string;
  sku: string;
  quantity_on_hand: number;
};

type NewReceiptModalProps = {
  products?: Product[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export function NewReceiptModal({ products: initialProducts, isOpen, onClose, onSuccess }: NewReceiptModalProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [contact, setContact] = useState("");
  const [responsible, setResponsible] = useState("");
  const [scheduleDate, setScheduleDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (initialProducts && initialProducts.length > 0) {
      setProducts(initialProducts);
      return;
    }

    async function loadProducts() {
      const result = await getProducts();
      if (result.success && result.products) {
        setProducts(result.products);
      }
    }

    loadProducts();
  }, [isOpen, initialProducts]);

  if (!isOpen) return null;


  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("productId", productId);
    formData.append("quantity", quantity);
    formData.append("contact", contact);
    formData.append("responsible", responsible);
    formData.append("scheduleDate", scheduleDate);

    const result = await processReceipt(formData);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSuccessMsg(`Receipt ${result.reference} validated & stock added!`);
    setTimeout(() => {
      onSuccess?.();
      onClose();
      setSuccessMsg(null);
    }, 1200);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">New Inbound Receipt</h3>
              <p className="text-xs text-slate-500">Record incoming goods from vendor (+Qty)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Supplier / Vendor *</label>
              <Input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="e.g. Acme Steel Corp"
                required
                className="h-10 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Scheduled Date *</label>
              <Input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                required
                className="h-10 text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Responsible Person</label>
            <Input
              value={responsible}
              onChange={(e) => setResponsible(e.target.value)}
              placeholder="e.g. Warehouse Staff"
              className="h-10 text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Select Product *</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              required
              className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 outline-none focus:border-emerald-500 transition"
            >
              <option value="">Choose item to receive...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku}) — Current: {p.quantity_on_hand}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Received Quantity *</label>
            <Input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity to add"
              required
              className="h-10 text-xs font-mono font-semibold text-emerald-700"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-9 px-4 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !!successMsg}
              className="h-9 px-4 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-xs"
            >
              {loading ? "Processing Receipt..." : "Validate & Receive Stock"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
