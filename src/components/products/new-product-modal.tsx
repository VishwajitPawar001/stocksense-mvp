"use client";

import { useState } from "react";
import { createProduct } from "@/actions/products";
import { X, PackagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function NewProductModal({ isOpen, onClose, onSuccess }: NewProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const res = await createProduct(formData);

    setLoading(false);
    if (res.error) {
      setError(res.error);
    } else {
      onSuccess();
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <PackagePlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Add New Product</h3>
              <p className="text-xs text-slate-500">Create a master catalog inventory item</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">SKU / Code *</label>
              <Input
                name="sku"
                required
                placeholder="e.g. STEEL-ROD-01"
                className="h-10 text-xs uppercase font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Product Name *</label>
              <Input
                name="name"
                required
                placeholder="e.g. Industrial Steel Rod"
                className="h-10 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Category *</label>
              <Input
                name="category"
                required
                placeholder="e.g. Raw Materials"
                className="h-10 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Unit of Measure (UoM) *</label>
              <select
                name="uom"
                required
                defaultValue="units"
                className="w-full h-10 px-3 border border-slate-200 rounded-xl text-xs bg-white text-slate-800 outline-none focus:border-indigo-500 transition"
              >
                <option value="units">Units (pcs)</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="meters">Meters (m)</option>
                <option value="liters">Liters (L)</option>
                <option value="boxes">Boxes (box)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Cost Price (₹)</label>
              <Input
                name="costPrice"
                type="number"
                step="0.01"
                min="0"
                defaultValue="0"
                placeholder="0.00"
                className="h-10 text-xs font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Initial Stock</label>
              <Input
                name="quantityOnHand"
                type="number"
                min="0"
                defaultValue="0"
                placeholder="0"
                className="h-10 text-xs font-mono"
              />
            </div>
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
              disabled={loading}
              className="h-9 px-4 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
            >
              {loading ? "Creating..." : "Save Product"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
