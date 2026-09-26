"use server"

import db from "@/lib/db";

// Fetch the full immutable stock ledger
export async function getMoveHistory() {
  try {
    // We join with the products table to get the actual product name, not just the ID
    const stmt = db.prepare(`
      SELECT 
        mh.id,
        mh.reference,
        p.name as productName,
        p.sku,
        mh.quantity,
        mh.movement_type,
        mh.date,
        mh.responsible
      FROM move_history mh
      JOIN products p ON mh.product_id = p.id
      ORDER BY mh.date DESC
    `);
    
    const history = stmt.all();
    return { success: true, history };
  } catch (error) {
    return { error: "Failed to fetch move history" };
  }
}

// Fetch recent activity for the Dashboard overview (limit to top 5)
export async function getRecentActivity() {
  try {
    const stmt = db.prepare(`
      SELECT 
        mh.reference,
        p.name as productName,
        mh.movement_type,
        mh.quantity,
        mh.date
      FROM move_history mh
      JOIN products p ON mh.product_id = p.id
      ORDER BY mh.date DESC
      LIMIT 5
    `);
    
    const recentActivity = stmt.all();
    return { success: true, recentActivity };
  } catch (error) {
    return { error: "Failed to fetch recent activity" };
  }
}