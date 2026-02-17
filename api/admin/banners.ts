import type { VercelRequest, VercelResponse } from '@vercel/node';

// In production, this would be stored in a database
let BANNERS = [
  {
    id: '1',
    text: '🎉 Welcome to the team Tony Thompson! 🎉',
    active: true,
    backgroundColor: 'from-cyan-500 via-emerald-500 to-cyan-500',
    textColor: 'black'
  }
];

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.json(BANNERS);
  }

  if (req.method === 'POST') {
    const { text, active, backgroundColor, textColor } = req.body;
    const newBanner = {
      id: Date.now().toString(),
      text,
      active: active ?? true,
      backgroundColor: backgroundColor || 'from-cyan-500 via-emerald-500 to-cyan-500',
      textColor: textColor || 'black'
    };
    BANNERS.push(newBanner);
    return res.json(newBanner);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
