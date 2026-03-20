import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../lib/db';

function cors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function toBanner(r: { id: string; text: string; active: boolean; background_color: string; text_color: string }) {
  return {
    id: r.id,
    text: r.text,
    active: r.active,
    backgroundColor: r.background_color,
    textColor: r.text_color
  };
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
    const { data, error } = await db.from('banners').select('*').order('created_at', { ascending: false });
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.json((data || []).map(toBanner));
  }

  if (req.method === 'POST') {
    const { text, active = true, backgroundColor = 'from-cyan-500 via-emerald-500 to-cyan-500', textColor = 'black' } = req.body || {};
    const id = Date.now().toString();
    const { data, error } = await db.from('banners').insert({
      id,
      text,
      active: !!active,
      background_color: backgroundColor,
      text_color: textColor
    }).select().single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.json(toBanner(data));
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
