import { Router } from 'express';
import db from '../db/index.js';

const router = Router();

// Admin password - in production, use environment variable
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'spartans2024';

// Initialize admin tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS banners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    active INTEGER DEFAULT 1,
    background_color TEXT DEFAULT 'from-cyan-500 via-emerald-500 to-cyan-500',
    text_color TEXT DEFAULT 'black',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// Insert default banner if none exists
const bannerCount = db.prepare('SELECT COUNT(*) as count FROM banners').get() as { count: number };
if (bannerCount.count === 0) {
  db.prepare(`
    INSERT INTO banners (text, active) VALUES (?, ?)
  `).run('🎉 Welcome to the team Tony Thompson! 🎉', 1);
}

// Create support chat table
db.exec(`
  CREATE TABLE IF NOT EXISTS support_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message TEXT NOT NULL,
    sender TEXT NOT NULL DEFAULT 'client',
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME,
    resolved_notes TEXT
  );
`);

// Admin login
router.post('/admin/login', (req, res) => {
  const { password } = req.body;

  if (password === ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

// Get all banners
router.get('/admin/banners', (req, res) => {
  const banners = db.prepare('SELECT * FROM banners ORDER BY created_at DESC').all();
  res.json(banners.map((b: any) => ({
    id: b.id.toString(),
    text: b.text,
    active: b.active === 1,
    backgroundColor: b.background_color,
    textColor: b.text_color
  })));
});

// Get active banner (public endpoint)
router.get('/admin/banners/active', (req, res) => {
  const banner = db.prepare('SELECT * FROM banners WHERE active = 1 ORDER BY created_at DESC LIMIT 1').get() as any;
  if (banner) {
    res.json({
      id: banner.id.toString(),
      text: banner.text,
      backgroundColor: banner.background_color,
      textColor: banner.text_color
    });
  } else {
    res.json(null);
  }
});

// Create banner
router.post('/admin/banners', (req, res) => {
  const { text, active, backgroundColor, textColor } = req.body;

  const result = db.prepare(`
    INSERT INTO banners (text, active, background_color, text_color)
    VALUES (?, ?, ?, ?)
  `).run(text, active ? 1 : 0, backgroundColor || 'from-cyan-500 via-emerald-500 to-cyan-500', textColor || 'black');

  res.json({
    id: result.lastInsertRowid.toString(),
    text,
    active,
    backgroundColor,
    textColor
  });
});

// Update banner
router.patch('/admin/banners/:id', (req, res) => {
  const { id } = req.params;
  const { text, active, backgroundColor, textColor } = req.body;

  const updates: string[] = [];
  const values: any[] = [];

  if (text !== undefined) {
    updates.push('text = ?');
    values.push(text);
  }
  if (active !== undefined) {
    updates.push('active = ?');
    values.push(active ? 1 : 0);
  }
  if (backgroundColor !== undefined) {
    updates.push('background_color = ?');
    values.push(backgroundColor);
  }
  if (textColor !== undefined) {
    updates.push('text_color = ?');
    values.push(textColor);
  }

  if (updates.length > 0) {
    values.push(id);
    db.prepare(`UPDATE banners SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  }

  res.json({ success: true });
});

// Delete banner
router.delete('/admin/banners/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM banners WHERE id = ?').run(id);
  res.json({ success: true });
});

// Update section price
router.patch('/admin/sections/:id/price', (req, res) => {
  const { id } = req.params;
  const { price } = req.body;

  db.prepare('UPDATE sections SET price = ? WHERE id = ?').run(price, id);
  res.json({ success: true });
});

// Get sales summary
router.get('/admin/sales', (req, res) => {
  // Get total sales
  const totalResult = db.prepare(`
    SELECT
      COALESCE(SUM(total_amount), 0) as total_revenue,
      COUNT(*) as total_orders
    FROM orders
    WHERE status = 'completed'
  `).get() as { total_revenue: number; total_orders: number };

  // Get today's sales
  const todayResult = db.prepare(`
    SELECT
      COALESCE(SUM(total_amount), 0) as today_revenue,
      COUNT(*) as today_orders
    FROM orders
    WHERE status = 'completed'
    AND date(created_at) = date('now')
  `).get() as { today_revenue: number; today_orders: number };

  // Get total tickets sold
  const ticketsResult = db.prepare(`
    SELECT COUNT(*) as tickets_sold
    FROM seats
    WHERE status = 'sold'
  `).get() as { tickets_sold: number };

  res.json({
    totalRevenue: totalResult.total_revenue || 0,
    ticketsSold: ticketsResult.tickets_sold || 0,
    todayRevenue: todayResult.today_revenue || 0,
    todayTickets: todayResult.today_orders || 0
  });
});

// Get seat stats
router.get('/admin/seat-stats', (req, res) => {
  const stats = db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available,
      SUM(CASE WHEN status = 'sold' THEN 1 ELSE 0 END) as sold,
      SUM(CASE WHEN status = 'reserved' OR status = 'held' THEN 1 ELSE 0 END) as held
    FROM seats
  `).get() as { total: number; available: number; sold: number; held: number };

  res.json({
    total: stats.total || 0,
    available: stats.available || 0,
    sold: stats.sold || 0,
    held: stats.held || 0
  });
});

// Support Chat endpoints
router.get('/admin/messages', (req, res) => {
  const messages = db.prepare(`
    SELECT * FROM support_messages
    ORDER BY created_at DESC
    LIMIT 100
  `).all();

  res.json(messages.map((m: any) => ({
    id: m.id.toString(),
    message: m.message,
    sender: m.sender,
    status: m.status,
    createdAt: m.created_at,
    resolvedAt: m.resolved_at,
    resolvedNotes: m.resolved_notes
  })));
});

router.post('/admin/messages', (req, res) => {
  const { message, sender = 'client' } = req.body;

  const result = db.prepare(`
    INSERT INTO support_messages (message, sender, status)
    VALUES (?, ?, 'pending')
  `).run(message, sender);

  res.json({
    id: result.lastInsertRowid.toString(),
    message,
    sender,
    status: 'pending',
    createdAt: new Date().toISOString()
  });
});

router.patch('/admin/messages/:id', (req, res) => {
  const { id } = req.params;
  const { status, resolvedNotes } = req.body;

  if (status === 'resolved') {
    db.prepare(`
      UPDATE support_messages
      SET status = ?, resolved_at = CURRENT_TIMESTAMP, resolved_notes = ?
      WHERE id = ?
    `).run(status, resolvedNotes || '', id);
  } else {
    db.prepare(`
      UPDATE support_messages SET status = ? WHERE id = ?
    `).run(status, id);
  }

  res.json({ success: true });
});

router.delete('/admin/messages/:id', (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM support_messages WHERE id = ?').run(id);
  res.json({ success: true });
});

export default router;
