-- Spartans Tickets - Supabase (PostgreSQL) schema
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- Sold seats (manual admin + stripe webhook)
CREATE TABLE IF NOT EXISTS sold_seats (
  id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL,
  section_id TEXT NOT NULL,
  row TEXT NOT NULL,
  seat TEXT NOT NULL,
  customer_name TEXT,
  customer_email TEXT,
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'stripe')),
  order_id TEXT,
  stripe_session_id TEXT,
  sold_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sold_seats_game ON sold_seats(game_id);

-- Banners
CREATE TABLE IF NOT EXISTS banners (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  background_color TEXT NOT NULL DEFAULT 'from-cyan-500 via-emerald-500 to-cyan-500',
  text_color TEXT NOT NULL DEFAULT 'black',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Support messages
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  message TEXT NOT NULL,
  sender TEXT NOT NULL DEFAULT 'client',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolved_notes TEXT
);

-- Section price overrides (optional)
CREATE TABLE IF NOT EXISTS section_prices (
  section_id TEXT PRIMARY KEY,
  price INTEGER NOT NULL
);

-- Orders (for stripe payments)
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer_email TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  total INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled', 'refunded')),
  stripe_session_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_stripe ON orders(stripe_session_id);

-- Seed default banner
INSERT INTO banners (id, text, active, background_color, text_color)
VALUES ('1', '🎉 Welcome to the team Tony Thompson! 🎉', true, 'from-cyan-500 via-emerald-500 to-cyan-500', 'black')
ON CONFLICT (id) DO NOTHING;
