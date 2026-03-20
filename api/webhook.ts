import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buffer } from 'micro';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-11-20.acacia' });
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

function hasDb(): boolean {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const sig = req.headers['stripe-signature'] as string;
  if (!sig || !webhookSecret) {
    return res.status(400).json({ error: 'Missing stripe-signature or STRIPE_WEBHOOK_SECRET' });
  }

  let event: Stripe.Event;
  try {
    const rawBody = await buffer(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    return res.status(400).json({ error: `Webhook Error: ${(err as Error).message}` });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata || {};
    const seatItemsJson = metadata.seat_items;
    const customerEmail = session.customer_details?.email || session.customer_email;
    const customerName = metadata.customer_name || '';
    const total = parseInt(metadata.total_amount || '0', 10);

    if (hasDb() && seatItemsJson) {
      try {
        const { getDb } = await import('./lib/db');
        const db = getDb();
        const sessId = (session.id || '').replace(/^cs_/, '');
        const orderId = `ord_${sessId.slice(0, 20)}_${Date.now()}`;

        const seatItems = JSON.parse(seatItemsJson) as Array<{ gameId: string; section: string; row: string; seat: number }>;

        await db.from('orders').insert({
          id: orderId,
          customer_email: customerEmail || '',
          customer_name: customerName,
          total,
          status: 'paid',
          stripe_session_id: session.id,
          paid_at: new Date().toISOString()
        });

        for (const item of seatItems) {
          const id = `${item.gameId}-${item.section}-${item.row}-${item.seat}`;
          await db.from('sold_seats').upsert({
            id,
            game_id: item.gameId,
            section_id: item.section,
            row: String(item.row),
            seat: String(item.seat),
            customer_email: customerEmail,
            customer_name: customerName,
            source: 'stripe',
            order_id: orderId,
            stripe_session_id: session.id
          }, { onConflict: 'id' });
        }
      } catch (err) {
        console.error('Webhook DB error:', err);
        return res.status(500).json({ error: 'Failed to record order' });
      }
    }
  }

  return res.json({ received: true });
}
