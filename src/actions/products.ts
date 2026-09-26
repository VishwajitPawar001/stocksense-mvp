'use server';

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getProducts() {
  try {
    const result = await pool.query(`SELECT * FROM products ORDER BY name ASC`);
    return { success: true, products: result.rows };
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return { error: 'Failed to fetch products' };
  }
}

export async function createProduct(formData: FormData) {
  const name = formData.get('name') as string;
  const sku = formData.get('sku') as string;
  const category = formData.get('category') as string;
  const uom = formData.get('uom') as string;

  const costPrice = Number(formData.get('costPrice')) || 0;
  const quantityOnHand = Number(formData.get('quantityOnHand')) || 0;

  try {
    await pool.query(
      `INSERT INTO products (name, sku, category, uom, cost_price, quantity_on_hand) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [name, sku, category, uom, costPrice, quantityOnHand]
    );

    revalidatePath('/products');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to create product:', error);
    if (error.code === '23505') {
      return { error: 'A product with this SKU already exists.' };
    }
    return { error: 'Failed to create product.' };
  }
}
