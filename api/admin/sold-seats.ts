import type { VercelRequest, VercelResponse } from '@vercel/node';

// In-memory storage (in production, use a database)
// Format: { "gameId-sectionId-row-seat": { soldAt, customerName, customerEmail } }
let soldSeats: Record<string, { soldAt: string; customerName?: string; customerEmail?: string }> = {};

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET - retrieve all sold seats
  if (req.method === 'GET') {
    return res.json({
      soldSeats: Object.entries(soldSeats).map(([id, data]) => ({
        id,
        ...data
      })),
      count: Object.keys(soldSeats).length
    });
  }

  // POST - add sold seats (single or bulk via CSV data)
  if (req.method === 'POST') {
    const { seats } = req.body as { seats: Array<{ gameId: string; section: string; row: string; seat: string; customerName?: string; customerEmail?: string }> };

    if (!seats || !Array.isArray(seats)) {
      return res.status(400).json({ error: 'Invalid seats data' });
    }

    let added = 0;
    seats.forEach(s => {
      const id = `${s.gameId}-${s.section}-${s.row}-${s.seat}`;
      if (!soldSeats[id]) {
        soldSeats[id] = {
          soldAt: new Date().toISOString(),
          customerName: s.customerName,
          customerEmail: s.customerEmail
        };
        added++;
      }
    });

    return res.json({ success: true, added, total: Object.keys(soldSeats).length });
  }

  // DELETE - remove sold seat(s)
  if (req.method === 'DELETE') {
    const { seatIds } = req.body as { seatIds: string[] };

    if (!seatIds || !Array.isArray(seatIds)) {
      return res.status(400).json({ error: 'Invalid seatIds' });
    }

    let removed = 0;
    seatIds.forEach(id => {
      if (soldSeats[id]) {
        delete soldSeats[id];
        removed++;
      }
    });

    return res.json({ success: true, removed, total: Object.keys(soldSeats).length });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
