import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../lib/db';

function cors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function toMessage(r: { id: string; message: string; sender: string; status: string; created_at: string; resolved_at?: string; resolved_notes?: string }) {
  return {
    id: r.id,
    message: r.message,
    sender: r.sender,
    status: r.status,
    createdAt: r.created_at,
    resolvedAt: r.resolved_at,
    resolvedNotes: r.resolved_notes
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
    const { data, error } = await db.from('messages').select('*').order('created_at', { ascending: false });
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.json((data || []).map(toMessage));
  }

  if (req.method === 'POST') {
    const { message, sender = 'client' } = req.body || {};
    const id = Date.now().toString();
    const { data, error } = await db.from('messages').insert({
      id,
      message,
      sender,
      status: 'pending'
    }).select().single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.json(toMessage(data));
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
