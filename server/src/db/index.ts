import Database, { type Database as DatabaseType } from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = join(__dirname, '../../data/arena.db');

const db: DatabaseType = new Database(DB_PATH);
db.pragma('foreign_keys = ON');

export default db;

// Types
export interface Section {
  id: string;
  name: string;
  level: 'field' | 'lower' | 'upper';
  price: number;
}

export interface Seat {
  id: string;
  section_id: string;
  row: string;
  number: number;
  status: 'available' | 'reserved' | 'sold';
  reserved_until: string | null;
}

export interface Order {
  id: string;
  customer_email: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  total: number;
  status: 'pending' | 'paid' | 'cancelled' | 'refunded';
  stripe_session_id: string | null;
  stripe_payment_intent: string | null;
  created_at: string;
  paid_at: string | null;
}
