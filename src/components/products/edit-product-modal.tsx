"use client";

import { useState, useEffect } from "react";
import { updateProduct } from "@/actions/products";
import { X, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  uom: string;
  cost_price: number;
  quantity_on_hand: number;
}

interface EditProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditProductModal({ product, isOpen, onClose, onSuccess }: EditProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !product) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.append("id", String(product!.id));

    const res = await updateProduct(formData);

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
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Edit className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Edit Product</h3>
              <p className="text-xs text-slate-500">Update master inventory details</p>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">SKU / Code *</label>
              <Input
                name="sku"
                defaultValue={product.sku}
                required
                className="h-10 text-xs uppercase font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Product Name *</label>
              <Input
                name="name"
                defaultValue={product.name}
                required
                className="h-10 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Category *</label>
              <Input
                name="category"
                defaultValue={product.category}
                required
                className="h-10 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Unit of Measure (UoM) *</label>
              <select
                name="uom"
                defaultValue={product.uom}
                required
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

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Cost Price (₹)</label>
            <Input
              name="costPrice"
              type="number"
              step="0.01"
              min="0"
              defaultValue={product.cost_price}
              className="h-10 text-xs font-mono"
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
              disabled={loading}
              className="h-9 px-4 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
            >
              {loading ? "Updating..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
