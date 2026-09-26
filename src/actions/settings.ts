'use server';

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getWarehouses() {
  try {
    const result = await pool.query(`SELECT * FROM warehouses ORDER BY name ASC`);
    return { success: true, warehouses: result.rows };
  } catch (error) {
    console.error('Failed to fetch warehouses:', error);
    return { error: 'Failed to fetch warehouses' };
  }
}

export async function createWarehouse(formData: FormData) {
  const name = formData.get('name') as string;
  const shortCode = formData.get('shortCode') as string;
  const address = (formData.get('address') as string) || '';

  if (!name || !shortCode) {
    return { error: 'Warehouse name and short code are required.' };
  }

  try {
    const result = await pool.query(
      `INSERT INTO warehouses (name, short_code, address) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [name, shortCode.toUpperCase(), address]
    );

    const warehouseId = result.rows[0].id;
    await pool.query(
      `INSERT INTO locations (warehouse_id, name) VALUES ($1, 'General Stock')`,
      [warehouseId]
    );

    revalidatePath('/settings');
    return { success: true, warehouse: result.rows[0] };
  } catch (error: any) {
    console.error('Failed to create warehouse:', error);
    return { error: 'Failed to create warehouse.' };
  }
}

export async function deleteWarehouse(id: number) {
  try {
    await pool.query(`DELETE FROM locations WHERE warehouse_id = $1`, [id]);
    await pool.query(`DELETE FROM warehouses WHERE id = $1`, [id]);
    revalidatePath('/settings');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete warehouse:', error);
    return { error: 'Failed to delete warehouse.' };
  }
}

export async function getLocations() {
  try {
    const result = await pool.query(`
      SELECT 
        l.id, 
        l.name as location_name, 
        l.warehouse_id, 
        w.name as warehouse_name, 
        w.short_code as warehouse_code
      FROM locations l
      LEFT JOIN warehouses w ON l.warehouse_id = w.id
      ORDER BY w.name ASC, l.name ASC
    `);
    return { success: true, locations: result.rows };
  } catch (error) {
    console.error('Failed to fetch locations:', error);
    return { error: 'Failed to fetch locations' };
  }
}

export async function createLocation(formData: FormData) {
  const name = formData.get('name') as string;
  const warehouseId = Number(formData.get('warehouseId'));

  if (!name || !warehouseId) {
    return { error: 'Location name and linked warehouse are required.' };
  }

  try {
    await pool.query(
      `INSERT INTO locations (warehouse_id, name) VALUES ($1, $2)`,
      [warehouseId, name]
    );

    revalidatePath('/settings');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to create location:', error);
    return { error: 'Failed to create location.' };
  }
}

export async function deleteLocation(id: number) {
  try {
    await pool.query(`DELETE FROM locations WHERE id = $1`, [id]);
    revalidatePath('/settings');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete location:', error);
    return { error: 'Failed to delete location.' };
  }
}
