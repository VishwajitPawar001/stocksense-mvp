"use server";

import pool from "@/lib/db";

// Fetch the full immutable stock ledger
export async function getMoveHistory() {
  try {
    const result = await pool.query(`
      SELECT 
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
      ORDER BY mh.date DESC
    `);
    
    return { success: true, history: result.rows };
  } catch (error) {
    console.error("Failed to fetch move history:", error);
    return { error: "Failed to fetch move history" };
  }
}

// Fetch recent activity for the Dashboard overview (limit to top 5)
export async function getRecentActivity() {
  try {
    const result = await pool.query(`
      SELECT 
        mh.reference,
        p.name as "productName",
        mh.movement_type,
        mh.quantity,
        mh.date
      FROM move_history mh
      JOIN products p ON mh.product_id = p.id
      ORDER BY mh.date DESC
      LIMIT 5
    `);
    
    return { success: true, recentActivity: result.rows };
  } catch (error) {
    console.error("Failed to fetch recent activity:", error);
    return { error: "Failed to fetch recent activity" };
  }
}