import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../../lib/db';

function cors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const id = req.query.id as string;
  if (!id) {
    return res.status(400).json({ error: 'Missing section id' });
  }

  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { price } = req.body || {};
  if (typeof price !== 'number' || price < 0) {
    return res.status(400).json({ error: 'Invalid price' });
  }

  try {
    const db = getDb();
  } catch {
    return res.status(503).json({ error: 'Database not configured' });
  }

  const db = getDb();
  const { error } = await db.from('section_prices').upsert({ section_id: id, price }, { onConflict: 'section_id' });

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  return res.json({ success: true });
}
