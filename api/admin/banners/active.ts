import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Return the active banner
  return res.json({
    id: '1',
    text: '🎉 Welcome to the team Tony Thompson! 🎉',
    backgroundColor: 'from-cyan-500 via-emerald-500 to-cyan-500',
    textColor: 'black'
  });
}
