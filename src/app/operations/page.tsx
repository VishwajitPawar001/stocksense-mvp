import { getOperations } from "@/actions/operations";
import { getProducts } from "@/actions/products";
import { getLocations } from "@/actions/settings";
import { OperationsClient } from "@/components/operations/operations-client";

export default async function OperationsPage() {
  const [opsRes, prodsRes, locsRes] = await Promise.all([
    getOperations(),
    getProducts(),
    getLocations(),
  ]);

  const operations = opsRes.success && opsRes.operations ? opsRes.operations : [];
  const products = prodsRes.success && prodsRes.products ? prodsRes.products : [];
  const locations = locsRes.success && locsRes.locations ? locsRes.locations : [];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <OperationsClient
        initialOperations={operations}
        products={products}
        locations={locations}
      />
    </div>
  );
}
