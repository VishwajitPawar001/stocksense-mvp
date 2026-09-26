import { getProducts } from "@/actions/products";
import Link from "next/link";

export default async function ProductsPage() {
  // 1. Fetch data directly on the server
  const { success, products, error } = await getProducts();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Master Data: Products</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors">
          + New Product
        </button>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-md">{error}</div>
      ) : (
        <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b text-gray-700 uppercase font-semibold">
              <tr>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-right">Quantity on Hand</th>
                <th className="px-6 py-4 text-right">Cost Price</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {!products || products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No products found. Click "+ New Product" to add one.
                  </td>
                </tr>
              ) : (
                products.map((product: any) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium">{product.sku}</td>
                    <td className="px-6 py-4">{product.name}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium">
                      {product.quantity_on_hand} {product.uom}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-600">
                      ₹{product.cost_price.toFixed(2)}
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