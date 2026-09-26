"use server";

import pool from "@/lib/db";
import { getActiveWarehouseId } from "@/lib/warehouse-context";

// Fetch the immutable stock ledger scoped to the active facility
export async function getMoveHistory(specificWarehouseId?: number) {
  try {
    const whId = specificWarehouseId ?? (await getActiveWarehouseId());
    const query = whId
      ? `SELECT 
          mh.id,
          mh.reference,
          p.name as "productName",
          p.sku,
          mh.quantity,
          mh.movement_type,
          mh.date,
          mh.responsible
        FROM move_history mh
        JOIN products p ON mh.product_id = p.id
        WHERE mh.warehouse_id = $1
        ORDER BY mh.id DESC`
      : `SELECT 
          mh.id,
          mh.reference,
          p.name as "productName",
          p.sku,
          mh.quantity,
          mh.movement_type,
          mh.date,
          mh.responsible
        FROM move_history mh
        JOIN products p ON mh.product_id = p.id
        ORDER BY mh.id DESC`;

    const params = whId ? [whId] : [];
    const result = await pool.query(query, params);
    
    return { success: true, history: result.rows };
  } catch (error) {
    console.error("Failed to fetch move history:", error);
    return { error: "Failed to fetch move history" };
  }
}

// Fetch recent activity for the Dashboard overview (limit to top 5)
export async function getRecentActivity(specificWarehouseId?: number) {
  try {
    const whId = specificWarehouseId ?? (await getActiveWarehouseId());
    const query = whId
      ? `SELECT 
          mh.reference,
          p.name as "productName",
          mh.movement_type,
          mh.quantity,
          mh.date
        FROM move_history mh
        JOIN products p ON mh.product_id = p.id
        WHERE mh.warehouse_id = $1
        ORDER BY mh.id DESC
        LIMIT 5`
      : `SELECT 
          mh.reference,
          p.name as "productName",
          mh.movement_type,
          mh.quantity,
          mh.date
        FROM move_history mh
        JOIN products p ON mh.product_id = p.id
        ORDER BY mh.id DESC
        LIMIT 5`;

    const params = whId ? [whId] : [];
    const result = await pool.query(query, params);
    
    return { success: true, recentActivity: result.rows };
  } catch (error) {
    console.error("Failed to fetch recent activity:", error);
    return { error: "Failed to fetch recent activity" };
  }
}