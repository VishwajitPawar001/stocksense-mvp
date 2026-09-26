'use server';

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getActiveWarehouseId } from '@/lib/warehouse-context';

export async function getProducts(specificWarehouseId?: number) {
  try {
    const whId = specificWarehouseId ?? (await getActiveWarehouseId());
    const query = whId
      ? `SELECT * FROM products WHERE warehouse_id = $1 ORDER BY name ASC`
      : `SELECT * FROM products ORDER BY name ASC`;
    const params = whId ? [whId] : [];

    const result = await pool.query(query, params);
    return { success: true, products: result.rows };
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return { error: 'Failed to fetch products' };
  }
}

export async function createProduct(formData: FormData) {
  const name = formData.get('name') as string;
  const sku = (formData.get('sku') as string)?.toUpperCase();
  const category = formData.get('category') as string;
  const uom = formData.get('uom') as string;
  const costPrice = Number(formData.get('costPrice')) || 0;
  const quantityOnHand = Number(formData.get('quantityOnHand')) || 0;
  const activeWhId = await getActiveWarehouseId();

  if (!name || !sku || !category || !uom) {
    return { error: 'All product fields are required.' };
  }

  try {
    await pool.query(
      `INSERT INTO products (name, sku, category, uom, cost_price, quantity_on_hand, warehouse_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [name, sku, category, uom, costPrice, quantityOnHand, activeWhId || 1]
    );

    revalidatePath('/products');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to create product:', error);
    if (error.code === '23505') {
      return { error: 'A product with this SKU already exists.' };
    }
    return { error: 'Failed to create product.' };
  }
}

export async function updateProduct(formData: FormData) {
  const id = Number(formData.get('id'));
  const name = formData.get('name') as string;
  const sku = (formData.get('sku') as string)?.toUpperCase();
  const category = formData.get('category') as string;
  const uom = formData.get('uom') as string;
  const costPrice = Number(formData.get('costPrice')) || 0;

  try {
    await pool.query(
      `UPDATE products 
       SET name = $1, sku = $2, category = $3, uom = $4, cost_price = $5 
       WHERE id = $6`,
      [name, sku, category, uom, costPrice, id]
    );

    revalidatePath('/products');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to update product:', error);
    if (error.code === '23505') {
      return { error: 'A product with this SKU already exists.' };
    }
    return { error: 'Failed to update product.' };
  }
}

export async function deleteProduct(id: number) {
  try {
    await pool.query(`DELETE FROM products WHERE id = $1`, [id]);
    revalidatePath('/products');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete product:', error);
    return { error: 'Failed to delete product. It may be referenced in historical operations.' };
  }
}
