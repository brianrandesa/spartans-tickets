import type { VercelRequest, VercelResponse } from '@vercel/node';
import { hasDb, getDb } from '../../lib/db';

const DEFAULT_BANNER = {
  id: '1',
  text: '🎉 Welcome to the team Tony Thompson! 🎉',
  backgroundColor: 'from-cyan-500 via-emerald-500 to-cyan-500',
  textColor: 'black'
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (!hasDb()) {
    return res.json(DEFAULT_BANNER);
  }

  try {
    const db = getDb();
    const { data } = await db.from('banners').select('*').eq('active', true).order('created_at', { ascending: false }).limit(1).single();
    if (data) {
      return res.json({
        id: data.id,
        text: data.text,
        backgroundColor: data.background_color,
        textColor: data.text_color
      });
    }
  } catch (err) {
    console.error('Error fetching active banner:', err);
  }

  return res.json(DEFAULT_BANNER);
}
