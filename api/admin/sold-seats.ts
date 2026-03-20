import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../lib/db';

function cors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const db = getDb();
  } catch {
    return res.status(503).json({ error: 'Database not configured' });
  }

  const db = getDb();

  if (req.method === 'GET') {
    const { data, error } = await db.from('sold_seats').select('*').order('sold_at', { ascending: false });
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    const soldSeats = (data || []).map((r: { id: string; sold_at: string; customer_name?: string; customer_email?: string }) => ({
      id: r.id,
      soldAt: r.sold_at,
      customerName: r.customer_name,
      customerEmail: r.customer_email
    }));
    return res.json({ soldSeats, count: soldSeats.length });
  }

  if (req.method === 'POST') {
    const { seats } = req.body as { seats: Array<{ gameId: string; section: string; row: string; seat: string; customerName?: string; customerEmail?: string }> };

    if (!seats || !Array.isArray(seats)) {
      return res.status(400).json({ error: 'Invalid seats data' });
    }

    const toInsert: { id: string; game_id: string; section_id: string; row: string; seat: string; customer_name?: string; customer_email?: string; source: string }[] = [];
    const seen = new Set<string>();

    for (const s of seats) {
      const id = `${s.gameId}-${s.section}-${s.row}-${s.seat}`;
      if (seen.has(id)) continue;
      seen.add(id);
      toInsert.push({
        id,
        game_id: s.gameId,
        section_id: s.section,
        row: s.row,
        seat: s.seat,
        customer_name: s.customerName,
        customer_email: s.customerEmail,
        source: 'manual'
      });
    }

    let added = 0;
    for (const row of toInsert) {
      const { error } = await db.from('sold_seats').upsert(row, { onConflict: 'id', ignoreDuplicates: true });
      if (!error) added++;
    }

    const { count } = await db.from('sold_seats').select('*', { count: 'exact', head: true });
    return res.json({ success: true, added, total: count ?? 0 });
  }

  if (req.method === 'DELETE') {
    const { seatIds } = req.body as { seatIds: string[] };

    if (!seatIds || !Array.isArray(seatIds)) {
      return res.status(400).json({ error: 'Invalid seatIds' });
    }

    const { error } = await db.from('sold_seats').delete().in('id', seatIds);
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    const { count } = await db.from('sold_seats').select('*', { count: 'exact', head: true });
    return res.json({ success: true, removed: seatIds.length, total: count ?? 0 });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
