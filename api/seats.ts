import type { VercelRequest, VercelResponse } from '@vercel/node';
import { SECTION_CONFIG, SOLD_OUT_SECTIONS } from './lib/section-config';
import { hasDb, getDb } from './lib/db';

function generateSeats(sectionId: string, gameId: string, soldSeats: Set<string>) {
  const config = SECTION_CONFIG[sectionId];
  if (!config) return [];

  const isSoldOut = SOLD_OUT_SECTIONS.includes(sectionId);
  const seats: { id: string; section_id: string; row: string; number: number; status: string }[] = [];
  for (let row = 1; row <= config.rows; row++) {
    for (let num = 1; num <= config.seatsPerRow; num++) {
      const seatId = `${sectionId}-${row}-${num}`;
      const soldKey = `${gameId}-${seatId}`;
      const isManualSold = soldSeats.has(soldKey);

      seats.push({
        id: seatId,
        section_id: sectionId,
        row: row.toString(),
        number: num,
        status: isSoldOut || isManualSold ? 'sold' : 'available'
      });
    }
  }
  return seats;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const gameId = (req.query.gameId as string) || '1';
  let soldSeats = new Set<string>();

  if (hasDb()) {
    try {
      const db = getDb();
      const { data } = await db.from('sold_seats').select('id').eq('game_id', gameId);
      if (data) {
        data.forEach((r: { id: string }) => soldSeats.add(r.id));
      }
    } catch (err) {
      console.error('Error fetching sold seats:', err);
    }
  }

  const SEATS: Record<string, { id: string; section_id: string; row: string; number: number; status: string }[]> = {};
  Object.keys(SECTION_CONFIG).forEach(sectionId => {
    SEATS[sectionId] = generateSeats(sectionId, gameId, soldSeats);
  });

  return res.json(SEATS);
}
