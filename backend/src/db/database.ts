import Database, { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Ensure data directory exists
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.DB_PATH || path.join(dataDir, 'customer_orders.db');
const db: DatabaseType = new Database(dbPath);

// Enable WAL mode and Foreign Keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize schema
let schemaPath = path.join(__dirname, 'schema.sql');
if (!fs.existsSync(schemaPath)) {
  schemaPath = path.join(__dirname, '../../src/db/schema.sql');
}
const schemaSql = fs.readFileSync(schemaPath, 'utf8');
db.exec(schemaSql);

export default db;
