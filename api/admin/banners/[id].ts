import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../../../lib/db';

function cors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  cors(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const id = req.query.id as string;
  if (!id) {
    return res.status(400).json({ error: 'Missing banner id' });
  }

  try {
    const db = getDb();
  } catch {
    return res.status(503).json({ error: 'Database not configured' });
  }

  const db = getDb();

  if (req.method === 'PATCH') {
    const { active } = req.body || {};
    const { error } = await db.from('banners').update({ active: !!active }).eq('id', id);
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.json({ success: true });
  }

  if (req.method === 'DELETE') {
    const { error } = await db.from('banners').delete().eq('id', id);
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
