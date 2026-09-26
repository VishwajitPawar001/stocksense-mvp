'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

function generateReference(type: 'IN' | 'OUT') {
  const opType = type === 'IN' ? 'RECEIPT' : 'DELIVERY';
  const stmt = db.prepare(
    `SELECT COUNT(*) AS count FROM operations WHERE operation_type = ?`
  );
  const result = stmt.get(opType) as { count: number };
  const nextId = String(result.count + 1).padStart(4, '0');
  return `WH/${type}/${nextId}`;
}
export async function processReceipt(formData: FormData) {
  const productId = Number(formData.get('productId'));
  const quantity = Number(formData.get('quantity'));
  const contact = formData.get('contact') as string;
  const responsible = formData.get('responsible') as string;
  const scheduleDate = formData.get('scheduleDate') as string;

  const reference = generateReference('IN');

  const processTx = db.transaction(() => {
    const opStmt = db.prepare(
      `INSERT INTO operations (reference, operation_type, status, contact, scheduleDate, responsible) VALUES (?, 'RECEIPT', 'Done', ?, ?, ?)`
    );
    const opResult = opStmt.run(reference, contact, scheduleDate, responsible);

    const lineStmt = db.prepare(
      `INSERT INTO operation_lines (operation_id, product_id, demand_qty) VALUES (?, ?, ?)`
    );
    lineStmt.run(opResult.lastInsertRowid, productId, quantity);

    const updateStock = db.prepare(
      `UPDATE products SET quantity_on_hand = quantity_on_hand + ? WHERE id = ?`
    );
    updateStock.run(quantity, productId);

    const historyStmt = db.prepare(
      `INSERT INTO move_history (reference, product_id, quantity, movement_type, date, responsible) VALUES (?, ?, ?, 'IN', datetime('now'), ?)`
    );
    historyStmt.run(reference, productId, quantity, responsible);
  });

  try {
    processTx();
    revalidatePath('/operations');
    return { success: true, reference };
  } catch (error) {
    return { error: 'Failed to process receipt transaction.' };
  }
}

export async function processDelivery(formData: FormData){
    const productId = Number(formData.get("productId"))
    const quantity = Number(formData.get("quantity"))
    const contact = formData.get("contact") as string;
    const responsible = formData.get("responsible") as string;
    const scheduleDate = formData.get("scheduleDate") as string;

    const checkStock = db.prepare(`SELECT quantity_on_hand FROM products WHERE id = ?`)
    const product = checkStock.get(productId) as { quantity_on_hand: number}

    if(!product || product.quantity_on_hand < quantity){
        return { error: "Insufficient stock available for delivery."}
    }

    const reference = generateReference('OUT');

    const processTx = db.transaction(() => {
        const opStmt = db.prepare(`INSERT INTO operations (reference, operation_type, status, contact, schedule_date, responsible) VALUES (?, 'DELIVERY', 'Done', ?, ?, ?)`)
        const opResult = opStmt.run(reference, contact, scheduleDate, responsible)

        const lineStmt = db.prepare(`INSERT INTO operation_lines (operation_id, product_id, demand_qty)
      VALUES (?, ?, ?)`)

      lineStmt.run(opResult.lastInsertRowid, productId, quantity)

      const upf
    })
}