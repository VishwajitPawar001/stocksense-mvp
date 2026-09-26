'use server';

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';

async function generateReference(client: any, type: 'IN' | 'OUT') {
  const opType = type === 'IN' ? 'RECEIPT' : 'DELIVERY';
  const result = await client.query(
    `SELECT COUNT(*) AS count FROM operations WHERE operation_type = $1`,
    [opType]
  );
  const count = parseInt(result.rows[0].count, 10);
  const nextId = String(count + 1).padStart(4, '0');
  return `WH/${type}/${nextId}`;
}

export async function processReceipt(formData: FormData) {
  const productId = Number(formData.get('productId'));
  const quantity = Number(formData.get('quantity'));
  const contact = formData.get('contact') as string;
  const responsible = formData.get('responsible') as string;
  const scheduleDate = formData.get('scheduleDate') as string;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const reference = await generateReference(client, 'IN');

    const opResult = await client.query(
      `INSERT INTO operations (reference, operation_type, status, contact, schedule_date, responsible)
       VALUES ($1, 'RECEIPT', 'Done', $2, $3, $4)
       RETURNING id`,
      [reference, contact, scheduleDate, responsible]
    );
    const operationId = opResult.rows[0].id;

    await client.query(
      `INSERT INTO operation_lines (operation_id, product_id, demand_qty)
       VALUES ($1, $2, $3)`,
      [operationId, productId, quantity]
    );

    await client.query(
      `UPDATE products SET quantity_on_hand = quantity_on_hand + $1 WHERE id = $2`,
      [quantity, productId]
    );

    await client.query(
      `INSERT INTO move_history (reference, product_id, quantity, movement_type, date, responsible)
       VALUES ($1, $2, $3, 'IN', NOW()::text, $4)`,
      [reference, productId, quantity, responsible]
    );

    await client.query('COMMIT');
    revalidatePath('/operations');
    return { success: true, reference };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Receipt transaction error:', error);
    return { error: 'Failed to process receipt transaction.' };
  } finally {
    client.release();
  }
}

export async function processDelivery(formData: FormData) {
  const productId = Number(formData.get('productId'));
  const quantity = Number(formData.get('quantity'));
  const contact = formData.get('contact') as string;
  const responsible = formData.get('responsible') as string;
  const scheduleDate = formData.get('scheduleDate') as string;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const checkStock = await client.query(
      `SELECT quantity_on_hand FROM products WHERE id = $1 FOR UPDATE`,
      [productId]
    );

    if (checkStock.rows.length === 0 || checkStock.rows[0].quantity_on_hand < quantity) {
      await client.query('ROLLBACK');
      return { error: 'Insufficient stock available for delivery.' };
    }

    const reference = await generateReference(client, 'OUT');

    const opResult = await client.query(
      `INSERT INTO operations (reference, operation_type, status, contact, schedule_date, responsible)
       VALUES ($1, 'DELIVERY', 'Done', $2, $3, $4)
       RETURNING id`,
      [reference, contact, scheduleDate, responsible]
    );
    const operationId = opResult.rows[0].id;

    await client.query(
      `INSERT INTO operation_lines (operation_id, product_id, demand_qty)
       VALUES ($1, $2, $3)`,
      [operationId, productId, quantity]
    );

    await client.query(
      `UPDATE products SET quantity_on_hand = quantity_on_hand - $1 WHERE id = $2`,
      [quantity, productId]
    );

    await client.query(
      `INSERT INTO move_history (reference, product_id, quantity, movement_type, date, responsible)
       VALUES ($1, $2, $3, 'OUT', NOW()::text, $4)`,
      [reference, productId, quantity, responsible]
    );

    await client.query('COMMIT');
    revalidatePath('/operations');
    return { success: true, reference };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Delivery transaction error:', error);
    return { error: 'Failed to process delivery transaction.' };
  } finally {
    client.release();
  }
}
