"use server";

import pool from "@/lib/db";
import { getActiveWarehouseId } from "@/lib/warehouse-context";

export interface DashboardMetrics {
  totalProducts: number;
  totalStockVolume: number;
  lowStockCount: number;
  outOfStockCount: number;
  pendingReceipts: number;
  pendingDeliveries: number;
  scheduledTransfers: number;
  recentMovements: Array<{
    id: number;
    reference: string;
    productName: string;
    sku: string;
    movement_type: string;
    quantity: number;
    date: string;
    responsible: string;
  }>;
}

export async function getDashboardMetrics(specificWarehouseId?: number): Promise<{
  success: boolean;
  metrics?: DashboardMetrics;
  error?: string;
}> {
  try {
    const whId = specificWarehouseId ?? (await getActiveWarehouseId());

    // 1. Total Distinct Products & Total Stock Volume
    const prodQuery = whId
      ? `SELECT 
          COUNT(*)::int AS "totalProducts",
          COALESCE(SUM(quantity_on_hand), 0)::int AS "totalStockVolume",
          COUNT(CASE WHEN quantity_on_hand <= 10 AND quantity_on_hand > 0 THEN 1 END)::int AS "lowStockCount",
          COUNT(CASE WHEN quantity_on_hand <= 0 THEN 1 END)::int AS "outOfStockCount"
        FROM products WHERE warehouse_id = $1`
      : `SELECT 
          COUNT(*)::int AS "totalProducts",
          COALESCE(SUM(quantity_on_hand), 0)::int AS "totalStockVolume",
          COUNT(CASE WHEN quantity_on_hand <= 10 AND quantity_on_hand > 0 THEN 1 END)::int AS "lowStockCount",
          COUNT(CASE WHEN quantity_on_hand <= 0 THEN 1 END)::int AS "outOfStockCount"
        FROM products`;

    const prodParams = whId ? [whId] : [];
    const productsAgg = await pool.query(prodQuery, prodParams);

    // 2. Operations Pending Counters
    const opsQuery = whId
      ? `SELECT 
          COUNT(CASE WHEN operation_type = 'RECEIPT' AND status != 'Done' THEN 1 END)::int AS "pendingReceipts",
          COUNT(CASE WHEN operation_type = 'DELIVERY' AND status != 'Done' THEN 1 END)::int AS "pendingDeliveries",
          COUNT(CASE WHEN operation_type = 'INTERNAL' AND status != 'Done' THEN 1 END)::int AS "scheduledTransfers"
        FROM operations WHERE warehouse_id = $1`
      : `SELECT 
          COUNT(CASE WHEN operation_type = 'RECEIPT' AND status != 'Done' THEN 1 END)::int AS "pendingReceipts",
          COUNT(CASE WHEN operation_type = 'DELIVERY' AND status != 'Done' THEN 1 END)::int AS "pendingDeliveries",
          COUNT(CASE WHEN operation_type = 'INTERNAL' AND status != 'Done' THEN 1 END)::int AS "scheduledTransfers"
        FROM operations`;

    const opsParams = whId ? [whId] : [];
    const opsAgg = await pool.query(opsQuery, opsParams);

    // 3. Top 5 Recent Stock Movements
    const recentQuery = whId
      ? `SELECT 
          mh.id,
          mh.reference,
          p.name as "productName",
          p.sku,
          mh.movement_type,
          mh.quantity,
          mh.date,
          mh.responsible
        FROM move_history mh
        JOIN products p ON mh.product_id = p.id
        WHERE mh.warehouse_id = $1
        ORDER BY mh.id DESC
        LIMIT 6`
      : `SELECT 
          mh.id,
          mh.reference,
          p.name as "productName",
          p.sku,
          mh.movement_type,
          mh.quantity,
          mh.date,
          mh.responsible
        FROM move_history mh
        JOIN products p ON mh.product_id = p.id
        ORDER BY mh.id DESC
        LIMIT 6`;

    const recentParams = whId ? [whId] : [];
    const recent = await pool.query(recentQuery, recentParams);

    const pRow = productsAgg.rows[0] || {};
    const oRow = opsAgg.rows[0] || {};

    return {
      success: true,
      metrics: {
        totalProducts: pRow.totalProducts || 0,
        totalStockVolume: pRow.totalStockVolume || 0,
        lowStockCount: pRow.lowStockCount || 0,
        outOfStockCount: pRow.outOfStockCount || 0,
        pendingReceipts: oRow.pendingReceipts || 0,
        pendingDeliveries: oRow.pendingDeliveries || 0,
        scheduledTransfers: oRow.scheduledTransfers || 0,
        recentMovements: recent.rows || [],
      },
    };
  } catch (error) {
    console.error("Failed to fetch dashboard metrics:", error);
    return { success: false, error: "Failed to load dashboard metrics" };
  }
}
