import type { VercelRequest, VercelResponse } from '@vercel/node';
import { hasDb, getDb } from '../lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  let totalRevenue = 0;
  let ticketsSold = 0;
  let todayRevenue = 0;
  let todayTickets = 0;

  if (hasDb()) {
    try {
      const db = getDb();
      const { data: orders } = await db.from('orders').select('total, paid_at').eq('status', 'paid');
      const { count: soldCount } = await db.from('sold_seats').select('*', { count: 'exact', head: true });
      ticketsSold = soldCount ?? 0;

      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      const { count: todaySoldCount } = await db.from('sold_seats').select('*', { count: 'exact', head: true }).gte('sold_at', todayStr).lt('sold_at', tomorrowStr);
      todayTickets = todaySoldCount ?? 0;

      if (orders) {
        for (const o of orders) {
          totalRevenue += o.total;
          const paidAt = o.paid_at ? new Date(o.paid_at) : null;
          if (paidAt && paidAt.toISOString().startsWith(todayStr)) {
            todayRevenue += o.total;
          }
        }
      }
    } catch (err) {
      console.error('Error fetching sales:', err);
    }
  }

  return res.json({
    totalRevenue,
    ticketsSold,
    todayRevenue,
    todayTickets
  });
}
