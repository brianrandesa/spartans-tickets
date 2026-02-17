import type { VercelRequest, VercelResponse } from '@vercel/node';

let MESSAGES: any[] = [];

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.json(MESSAGES);
  }

  if (req.method === 'POST') {
    const { message, sender = 'client' } = req.body;
    const newMessage = {
      id: Date.now().toString(),
      message,
      sender,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    MESSAGES.unshift(newMessage);
    return res.json(newMessage);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
