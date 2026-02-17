-- Sections table
CREATE TABLE IF NOT EXISTS sections (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('field', 'lower', 'upper')),
  price INTEGER NOT NULL DEFAULT 3500, -- price in cents
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seats table
CREATE TABLE IF NOT EXISTS seats (
  id TEXT PRIMARY KEY,
  section_id TEXT NOT NULL REFERENCES sections(id),
  row TEXT NOT NULL,
  number INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold')),
  reserved_until DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(section_id, row, number)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer_email TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  total INTEGER NOT NULL, -- in cents
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled', 'refunded')),
  stripe_session_id TEXT,
  stripe_payment_intent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  paid_at DATETIME
);

-- Order items (seats in an order)
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL REFERENCES orders(id),
  seat_id TEXT NOT NULL REFERENCES seats(id),
  price INTEGER NOT NULL, -- price at time of purchase
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_seats_section ON seats(section_id);
CREATE INDEX IF NOT EXISTS idx_seats_status ON seats(status);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session ON orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
