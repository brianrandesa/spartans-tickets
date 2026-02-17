import { Router } from 'express';
import db from '../db/index.js';
import type { Section, Seat } from '../db/index.js';

const router = Router();

// Get all sections with availability counts
router.get('/sections', (req, res) => {
  const sections = db.prepare(`
    SELECT
      s.id,
      s.name,
      s.level,
      s.price,
      COUNT(seats.id) as total_seats,
      SUM(CASE WHEN seats.status = 'available' THEN 1 ELSE 0 END) as available_seats
    FROM sections s
    LEFT JOIN seats ON seats.section_id = s.id
    GROUP BY s.id
    ORDER BY s.level, s.id
  `).all();

  res.json(sections);
});

// Get seats for a specific section
router.get('/sections/:sectionId/seats', (req, res) => {
  const { sectionId } = req.params;

  const section = db.prepare('SELECT * FROM sections WHERE id = ?').get(sectionId) as Section | undefined;
  if (!section) {
    res.status(404).json({ error: 'Section not found' });
    return;
  }

  const seats = db.prepare(`
    SELECT id, section_id, row, number, status
    FROM seats
    WHERE section_id = ?
    ORDER BY row, number
  `).all(sectionId) as Seat[];

  res.json({
    section,
    seats
  });
});

// Get all seats (for initial load)
router.get('/seats', (req, res) => {
  const seats = db.prepare(`
    SELECT id, section_id, row, number, status
    FROM seats
    ORDER BY section_id, row, number
  `).all() as Seat[];

  // Group by section
  const seatsBySection: Record<string, Seat[]> = {};
  for (const seat of seats) {
    if (!seatsBySection[seat.section_id]) {
      seatsBySection[seat.section_id] = [];
    }
    seatsBySection[seat.section_id].push(seat);
  }

  res.json(seatsBySection);
});

// Reserve seats temporarily (before checkout)
router.post('/seats/reserve', (req, res) => {
  const { seatIds } = req.body as { seatIds: string[] };

  if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
    res.status(400).json({ error: 'seatIds array required' });
    return;
  }

  // Check all seats are available
  const placeholders = seatIds.map(() => '?').join(',');
  const seats = db.prepare(`
    SELECT id, status FROM seats WHERE id IN (${placeholders})
  `).all(...seatIds) as { id: string; status: string }[];

  if (seats.length !== seatIds.length) {
    res.status(400).json({ error: 'Some seats not found' });
    return;
  }

  const unavailable = seats.filter(s => s.status !== 'available');
  if (unavailable.length > 0) {
    res.status(400).json({
      error: 'Some seats are not available',
      unavailableSeats: unavailable.map(s => s.id)
    });
    return;
  }

  // Reserve seats for 10 minutes
  const reservedUntil = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const updateStmt = db.prepare(`
    UPDATE seats SET status = 'reserved', reserved_until = ? WHERE id = ?
  `);

  const transaction = db.transaction(() => {
    for (const seatId of seatIds) {
      updateStmt.run(reservedUntil, seatId);
    }
  });

  transaction();

  res.json({
    success: true,
    reservedUntil,
    seatIds
  });
});

// Release reserved seats
router.post('/seats/release', (req, res) => {
  const { seatIds } = req.body as { seatIds: string[] };

  if (!seatIds || !Array.isArray(seatIds)) {
    res.status(400).json({ error: 'seatIds array required' });
    return;
  }

  const updateStmt = db.prepare(`
    UPDATE seats SET status = 'available', reserved_until = NULL
    WHERE id = ? AND status = 'reserved'
  `);

  const transaction = db.transaction(() => {
    for (const seatId of seatIds) {
      updateStmt.run(seatId);
    }
  });

  transaction();

  res.json({ success: true });
});

// Get sold tickets report
router.get('/reports/sold-tickets', (req, res) => {
  const tickets = db.prepare(`
    SELECT
      s.id,
      s.section_id,
      s.row,
      s.number,
      s.status,
      oi.order_id,
      o.customer_email,
      o.created_at as sold_at,
      sec.price
    FROM seats s
    LEFT JOIN order_items oi ON oi.seat_id = s.id
    LEFT JOIN orders o ON o.id = oi.order_id AND o.status = 'paid'
    LEFT JOIN sections sec ON sec.id = s.section_id
    WHERE s.status = 'sold'
    ORDER BY o.created_at DESC, s.section_id, s.row, s.number
  `).all();

  // Calculate totals
  const totalTickets = tickets.length;
  const totalRevenue = tickets.reduce((sum: number, t: any) => sum + (t.price || 3500), 0);

  // Group by section
  const bySection: Record<string, number> = {};
  for (const ticket of tickets as any[]) {
    bySection[ticket.section_id] = (bySection[ticket.section_id] || 0) + 1;
  }

  res.json({
    tickets,
    totalTickets,
    totalRevenue,
    bySection
  });
});

export default router;
