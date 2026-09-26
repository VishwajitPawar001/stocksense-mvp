import "server-only";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function initializeDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      login_id TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS warehouses (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      name TEXT NOT NULL,
      short_code TEXT NOT NULL,
      address TEXT
    );

    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      warehouse_id INTEGER,
      name TEXT NOT NULL,
      FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      name TEXT NOT NULL,
      sku TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL,
      uom TEXT NOT NULL,
      cost_price REAL DEFAULT 0,
      quantity_on_hand INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS operations (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      reference TEXT UNIQUE NOT NULL,
      operation_type TEXT NOT NULL,
      status TEXT NOT NULL,
      contact TEXT,
      schedule_date TEXT,
      responsible TEXT
    );

    CREATE TABLE IF NOT EXISTS operation_lines (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      operation_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      demand_qty INTEGER NOT NULL,
      FOREIGN KEY (operation_id) REFERENCES operations(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS move_history (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      reference TEXT NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      movement_type TEXT NOT NULL,
      date TEXT NOT NULL,
      responsible TEXT NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
  `);

  console.log("PostgreSQL database initialized successfully.");
}

export default pool;