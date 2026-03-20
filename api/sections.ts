import type { VercelRequest, VercelResponse } from '@vercel/node';
import { SECTION_CONFIG } from './lib/section-config';
import { hasDb, getDb } from './lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const gameId = (req.query.gameId as string) || '1';

  let soldCountBySection: Record<string, number> = {};
  let sectionPrices: Record<string, number> = {};

  if (hasDb()) {
    try {
      const db = getDb();
      const { data: soldData } = await db.from('sold_seats').select('section_id').eq('game_id', gameId);
      if (soldData) {
        soldData.forEach((r: { section_id: string }) => {
          soldCountBySection[r.section_id] = (soldCountBySection[r.section_id] || 0) + 1;
        });
      }
      const { data: priceData } = await db.from('section_prices').select('section_id, price');
      if (priceData) {
        priceData.forEach((r: { section_id: string; price: number }) => {
          sectionPrices[r.section_id] = r.price;
        });
      }
    } catch (err) {
      console.error('Error fetching sections data:', err);
    }
  }

  const SECTIONS = Object.entries(SECTION_CONFIG).map(([id, config]) => {
    const totalSeats = config.rows * config.seatsPerRow;
    const sold = soldCountBySection[id] || 0;
    const available = Math.max(0, totalSeats - sold);
    const price = sectionPrices[id] ?? 3500;

    return {
      id,
      name: id,
      level: config.level,
      price,
      total_seats: totalSeats,
      available_seats: available
    };
  });

  return res.json(SECTIONS);
}
