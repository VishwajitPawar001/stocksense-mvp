'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getProducts() {
  try {
    const stmt = db.prepare(`SELECT * FROM products ORDER BY name ASC`);
    const products = stmt.all();
    return { success: true, products };
  } catch (error) {
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
    const stmt =
      db.prepare(`INSERT INTO products (name, sku, category, uom, cost_price, quantity_on_hand) 
      VALUES (?, ?, ?, ?, ?, ?)`);

    stmt.run(name, sku, category, uom, costPrice, quantityOnHand);

    revalidatePath('/products');
    return { success: true };
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return { error: 'A product with this SKU already exists.' };
    }
    return { error: 'Failed to create product.' };
  }
}
