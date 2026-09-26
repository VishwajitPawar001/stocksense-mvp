import { getProducts } from "@/actions/products";
import { ProductTableClient } from "@/components/products/product-table-client";

export default async function ProductsPage() {
  const { success, products = [], error } = await getProducts();

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <ProductTableClient products={products} />
    </div>
  );
}