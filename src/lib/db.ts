import Database from 'better-sqlite3';
import path from 'path';

// Creates a local SQLite file named 'stocksense.db' in the root folder
const dbPath = path.resolve(process.cwd(), 'stocksense.db');
const db = new Database(dbPath);

export function initializeDB() {
  db.exec(`
    -- 1. Users Table (Enforces unique login_id and email)
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      login_id TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    );

    -- 2. Warehouses Table (Settings context)
    CREATE TABLE IF NOT EXISTS warehouses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      short_code TEXT NOT NULL,
      address TEXT
    );

    -- 3. Locations Table (Supports moving stock between racks/warehouses)
    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      warehouse_id INTEGER,
      name TEXT NOT NULL,
      FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
    );

    -- 4. Products Table (Master Data)
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      sku TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL,
      uom TEXT NOT NULL,
      cost_price REAL DEFAULT 0,
      quantity_on_hand INTEGER DEFAULT 0
    );

    -- 5. Operations Table (Receipts, Deliveries, Internal, Adjustments)
    CREATE TABLE IF NOT EXISTS operations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reference TEXT UNIQUE NOT NULL,
      operation_type TEXT NOT NULL,
      status TEXT NOT NULL,
      contact TEXT,
      schedule_date TEXT,
      responsible TEXT
    );

    -- 6. Operation Lines (Products inside an Operation)
    CREATE TABLE IF NOT EXISTS operation_lines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      operation_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      demand_qty INTEGER NOT NULL,
      FOREIGN KEY (operation_id) REFERENCES operations(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    -- 7. Move History (Immutable Stock Ledger tracking IN and OUT events)
    CREATE TABLE IF NOT EXISTS move_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reference TEXT NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      movement_type TEXT NOT NULL,
      date TEXT NOT NULL,
      responsible TEXT NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
  `);

  console.log("SQLite Database initialized successfully.");
}

export default db;