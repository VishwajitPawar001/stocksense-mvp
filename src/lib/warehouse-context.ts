import { cookies } from "next/headers";

export async function getActiveWarehouseId(): Promise<number | null> {
  try {
    const cookieStore = await cookies();
    const val = cookieStore.get("stocksense_active_warehouse_id")?.value;
    if (val) {
      const parsed = parseInt(val, 10);
      if (!isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
  } catch (error) {
    // cookies() might not be available in non-request contexts
  }
  return null;
}
