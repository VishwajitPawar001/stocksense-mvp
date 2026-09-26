'use server';

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getActiveWarehouseId } from '@/lib/warehouse-context';

async function generateReference(client: any, type: 'IN' | 'OUT' | 'INT' | 'ADJ') {
  const result = await client.query(
    `SELECT reference FROM operations WHERE reference LIKE $1 ORDER BY id DESC LIMIT 1`,
    [`WH/${type}/%`]
  );
  let nextNum = 1;
  if (result.rows.length > 0) {
    const lastRef = result.rows[0].reference;
    const parts = lastRef.split('/');
    const lastNum = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastNum)) {
      nextNum = lastNum + 1;
    }
  }
  return `WH/${type}/${String(nextNum).padStart(4, '0')}`;
}

export async function processReceipt(formData: FormData) {
  const productId = Number(formData.get('productId'));
  const quantity = Number(formData.get('quantity'));
  const contact = formData.get('contact') as string;
  const responsible = formData.get('responsible') as string;
  const scheduleDate = formData.get('scheduleDate') as string;
  const activeWhId = (await getActiveWarehouseId()) || 1;

  if (!productId || isNaN(quantity) || quantity <= 0) {
    return { error: 'Please specify a valid product and positive quantity.' };
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const reference = await generateReference(client, 'IN');

    const opResult = await client.query(
      `INSERT INTO operations (reference, operation_type, status, contact, schedule_date, responsible, warehouse_id)
       VALUES ($1, 'RECEIPT', 'Done', $2, $3, $4, $5)
       RETURNING id`,
      [reference, contact, scheduleDate, responsible, activeWhId]
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
      `INSERT INTO move_history (reference, product_id, quantity, movement_type, date, responsible, warehouse_id)
       VALUES ($1, $2, $3, 'IN', NOW()::text, $4, $5)`,
      [reference, productId, quantity, responsible, activeWhId]
    );

    await client.query('COMMIT');
    revalidatePath('/operations');
    revalidatePath('/products');
    revalidatePath('/history');
    revalidatePath('/');
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
  const activeWhId = (await getActiveWarehouseId()) || 1;

  if (!productId || isNaN(quantity) || quantity <= 0) {
    return { error: 'Please specify a valid product and positive quantity.' };
  }

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
      `INSERT INTO operations (reference, operation_type, status, contact, schedule_date, responsible, warehouse_id)
       VALUES ($1, 'DELIVERY', 'Done', $2, $3, $4, $5)
       RETURNING id`,
      [reference, contact, scheduleDate, responsible, activeWhId]
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
      `INSERT INTO move_history (reference, product_id, quantity, movement_type, date, responsible, warehouse_id)
       VALUES ($1, $2, $3, 'OUT', NOW()::text, $4, $5)`,
      [reference, productId, quantity, responsible, activeWhId]
    );

    await client.query('COMMIT');
    revalidatePath('/operations');
    revalidatePath('/products');
    revalidatePath('/history');
    revalidatePath('/');
    return { success: true, reference };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Delivery transaction error:', error);
    return { error: 'Failed to process delivery transaction.' };
  } finally {
    client.release();
  }
}

export async function processInternalTransfer(formData: FormData) {
  const productId = Number(formData.get('productId'));
  const quantity = Number(formData.get('quantity'));
  const sourceLocation = (formData.get('sourceLocation') as string) || 'Main Warehouse';
  const destLocation = (formData.get('destLocation') as string) || 'Production Floor';
  const responsible = (formData.get('responsible') as string) || 'Warehouse Staff';
  const scheduleDate = (formData.get('scheduleDate') as string) || new Date().toISOString().split('T')[0];
  const activeWhId = (await getActiveWarehouseId()) || 1;

  if (!productId || isNaN(quantity) || quantity <= 0) {
    return { error: 'Please specify a valid product and positive transfer quantity.' };
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const checkStock = await client.query(
      `SELECT quantity_on_hand FROM products WHERE id = $1 FOR UPDATE`,
      [productId]
    );

    if (checkStock.rows.length === 0 || checkStock.rows[0].quantity_on_hand < quantity) {
      await client.query('ROLLBACK');
      return { error: 'Insufficient stock available for internal transfer.' };
    }

    const reference = await generateReference(client, 'INT');
    const transferRoute = `${sourceLocation} ➔ ${destLocation}`;

    const opResult = await client.query(
      `INSERT INTO operations (reference, operation_type, status, contact, schedule_date, responsible, warehouse_id)
       VALUES ($1, 'INTERNAL', 'Done', $2, $3, $4, $5)
       RETURNING id`,
      [reference, transferRoute, scheduleDate, responsible, activeWhId]
    );
    const operationId = opResult.rows[0].id;

    await client.query(
      `INSERT INTO operation_lines (operation_id, product_id, demand_qty)
       VALUES ($1, $2, $3)`,
      [operationId, productId, quantity]
    );

    await client.query(
      `INSERT INTO move_history (reference, product_id, quantity, movement_type, date, responsible, warehouse_id)
       VALUES ($1, $2, $3, 'INTERNAL', NOW()::text, $4, $5)`,
      [reference, productId, quantity, responsible, activeWhId]
    );

    await client.query('COMMIT');
    revalidatePath('/operations');
    revalidatePath('/history');
    revalidatePath('/');
    return { success: true, reference };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Internal transfer error:', error);
    return { error: 'Failed to process internal transfer transaction.' };
  } finally {
    client.release();
  }
}

export async function processStockAdjustment(formData: FormData) {
  const productId = Number(formData.get('productId'));
  const countedQuantity = Number(formData.get('countedQuantity'));
  const responsible = (formData.get('responsible') as string) || 'Inventory Manager';
  const reason = (formData.get('reason') as string) || 'Physical inventory count reconciliation';
  const activeWhId = (await getActiveWarehouseId()) || 1;

  if (!productId || isNaN(countedQuantity) || countedQuantity < 0) {
    return { error: 'Please enter a valid physical count quantity.' };
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const checkStock = await client.query(
      `SELECT quantity_on_hand FROM products WHERE id = $1 FOR UPDATE`,
      [productId]
    );

    if (checkStock.rows.length === 0) {
      await client.query('ROLLBACK');
      return { error: 'Selected product was not found.' };
    }

    const currentStock = Number(checkStock.rows[0].quantity_on_hand);
    const delta = countedQuantity - currentStock;

    const reference = await generateReference(client, 'ADJ');

    const opResult = await client.query(
      `INSERT INTO operations (reference, operation_type, status, contact, schedule_date, responsible, warehouse_id)
       VALUES ($1, 'ADJUSTMENT', 'Done', $2, NOW()::text, $3, $4)
       RETURNING id`,
      [reference, reason, responsible, activeWhId]
    );
    const operationId = opResult.rows[0].id;

    await client.query(
      `INSERT INTO operation_lines (operation_id, product_id, demand_qty)
       VALUES ($1, $2, $3)`,
      [operationId, productId, countedQuantity]
    );

    await client.query(
      `UPDATE products SET quantity_on_hand = $1 WHERE id = $2`,
      [countedQuantity, productId]
    );

    await client.query(
      `INSERT INTO move_history (reference, product_id, quantity, movement_type, date, responsible, warehouse_id)
       VALUES ($1, $2, $3, 'ADJUSTMENT', NOW()::text, $4, $5)`,
      [reference, productId, delta, responsible, activeWhId]
    );

    await client.query('COMMIT');
    revalidatePath('/operations');
    revalidatePath('/products');
    revalidatePath('/history');
    revalidatePath('/');
    return { success: true, reference, delta };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Stock adjustment error:', error);
    return { error: 'Failed to process stock adjustment.' };
  } finally {
    client.release();
  }
}

export async function getOperations(specificWarehouseId?: number) {
  try {
    const whId = specificWarehouseId ?? (await getActiveWarehouseId());
    const query = whId
      ? `SELECT 
          o.id,
          o.reference,
          o.operation_type,
          o.status,
          o.contact,
          o.schedule_date,
          o.responsible,
          p.name as product_name,
          p.sku,
          p.uom,
          ol.demand_qty
        FROM operations o
        LEFT JOIN operation_lines ol ON ol.operation_id = o.id
        LEFT JOIN products p ON p.id = ol.product_id
        WHERE o.warehouse_id = $1
        ORDER BY o.id DESC`
      : `SELECT 
          o.id,
          o.reference,
          o.operation_type,
          o.status,
          o.contact,
          o.schedule_date,
          o.responsible,
          p.name as product_name,
          p.sku,
          p.uom,
          ol.demand_qty
        FROM operations o
        LEFT JOIN operation_lines ol ON ol.operation_id = o.id
        LEFT JOIN products p ON p.id = ol.product_id
        ORDER BY o.id DESC`;

    const params = whId ? [whId] : [];
    const result = await pool.query(query, params);
    return { success: true, operations: result.rows };
  } catch (error) {
    console.error("Failed to fetch operations:", error);
    return { error: "Failed to fetch operations." };
  }
}
