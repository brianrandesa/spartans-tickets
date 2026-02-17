import type { VercelRequest, VercelResponse } from '@vercel/node';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'spartans2024';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body;

  if (password === ADMIN_PASSWORD) {
    return res.json({ success: true });
  }

  return res.status(401).json({ error: 'Invalid password' });
}
