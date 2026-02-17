import { Router, raw } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db/index.js';
import type { Seat, Section } from '../db/index.js';
import { createCheckoutSession, constructWebhookEvent } from '../services/stripe.js';

const router = Router();

// Create checkout session
router.post('/checkout', async (req, res) => {
  const { seatIds } = req.body as { seatIds: string[] };

  if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
    res.status(400).json({ error: 'seatIds array required' });
    return;
  }

  try {
    // Get seat and section details
    const placeholders = seatIds.map(() => '?').join(',');
    const seatsWithSections = db.prepare(`
      SELECT
        seats.id,
        seats.section_id,
        seats.row,
        seats.number,
        seats.status,
        sections.name as section_name,
        sections.price
      FROM seats
      JOIN sections ON sections.id = seats.section_id
      WHERE seats.id IN (${placeholders})
    `).all(...seatIds) as {
      id: string;
      section_id: string;
      row: string;
      number: number;
      status: string;
      section_name: string;
      price: number;
    }[];

    if (seatsWithSections.length !== seatIds.length) {
      res.status(400).json({ error: 'Some seats not found' });
      return;
    }

    // Check all seats are available
    const unavailable = seatsWithSections.filter(s => s.status !== 'available' && s.status !== 'reserved');
    if (unavailable.length > 0) {
      res.status(400).json({
        error: 'Some seats are not available',
        unavailableSeats: unavailable.map(s => s.id)
      });
      return;
    }

    // Calculate total
    const total = seatsWithSections.reduce((sum, s) => sum + s.price, 0);

    // Create order in database
    const orderId = uuidv4();
    db.prepare(`
      INSERT INTO orders (id, total, status) VALUES (?, ?, 'pending')
    `).run(orderId, total);

    // Add order items
    const insertItem = db.prepare(`
      INSERT INTO order_items (order_id, seat_id, price) VALUES (?, ?, ?)
    `);
    for (const seat of seatsWithSections) {
      insertItem.run(orderId, seat.id, seat.price);
    }

    // Reserve the seats
    const reservedUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    const updateSeat = db.prepare(`
      UPDATE seats SET status = 'reserved', reserved_until = ? WHERE id = ?
    `);
    for (const seat of seatsWithSections) {
      updateSeat.run(reservedUntil, seat.id);
    }

    // Create Stripe checkout session
    const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
    const session = await createCheckoutSession({
      seatIds,
      seatDetails: seatsWithSections.map(s => ({
        id: s.id,
        section: s.section_name,
        row: s.row,
        number: s.number,
        price: s.price,
      })),
      successUrl: `${baseUrl}/success?order=${orderId}`,
      cancelUrl: `${baseUrl}/?cancelled=true`,
    });

    // Update order with Stripe session ID
    db.prepare(`
      UPDATE orders SET stripe_session_id = ? WHERE id = ?
    `).run(session.id, orderId);

    res.json({
      url: session.url,
      orderId,
      sessionId: session.id,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Stripe webhook handler
router.post('/webhook', raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not configured');
    res.status(500).json({ error: 'Webhook not configured' });
    return;
  }

  try {
    const event = await constructWebhookEvent(req.body, signature, webhookSecret);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const seatIds = JSON.parse(session.metadata?.seatIds || '[]') as string[];

        // Update order status
        db.prepare(`
          UPDATE orders SET status = 'paid', paid_at = CURRENT_TIMESTAMP
          WHERE stripe_session_id = ?
        `).run(session.id);

        // Mark seats as sold
        const updateSeat = db.prepare(`
          UPDATE seats SET status = 'sold', reserved_until = NULL WHERE id = ?
        `);
        for (const seatId of seatIds) {
          updateSeat.run(seatId);
        }

        console.log(`Order completed for session ${session.id}, ${seatIds.length} seats sold`);
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object;
        const seatIds = JSON.parse(session.metadata?.seatIds || '[]') as string[];

        // Update order status
        db.prepare(`
          UPDATE orders SET status = 'cancelled' WHERE stripe_session_id = ?
        `).run(session.id);

        // Release reserved seats
        const updateSeat = db.prepare(`
          UPDATE seats SET status = 'available', reserved_until = NULL
          WHERE id = ? AND status = 'reserved'
        `);
        for (const seatId of seatIds) {
          updateSeat.run(seatId);
        }

        console.log(`Checkout expired for session ${session.id}, seats released`);
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: 'Webhook error' });
  }
});

// Get order details
router.get('/orders/:orderId', (req, res) => {
  const { orderId } = req.params;

  const order = db.prepare(`
    SELECT * FROM orders WHERE id = ?
  `).get(orderId);

  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  const items = db.prepare(`
    SELECT
      oi.*,
      seats.row,
      seats.number,
      sections.name as section_name
    FROM order_items oi
    JOIN seats ON seats.id = oi.seat_id
    JOIN sections ON sections.id = seats.section_id
    WHERE oi.order_id = ?
  `).all(orderId);

  res.json({ order, items });
});

export default router;
