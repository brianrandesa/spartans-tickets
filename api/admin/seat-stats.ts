import type { VercelRequest, VercelResponse } from '@vercel/node';
import { TOTAL_SEATS } from '../lib/section-config';
import { hasDb, getDb } from '../lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  let sold = 0;

  if (hasDb()) {
    try {
      const db = getDb();
      const { count, error } = await db.from('sold_seats').select('*', { count: 'exact', head: true });
      if (!error && count != null) {
        sold = count;
      }
    } catch (err) {
      console.error('Error fetching seat stats:', err);
    }
  }

  const available = Math.max(0, TOTAL_SEATS - sold);

  return res.json({
    total: TOTAL_SEATS,
    available,
    sold,
    held: 0
  });
}
