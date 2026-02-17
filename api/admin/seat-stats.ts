import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Total seats based on actual section config
  const total = 2847;

  return res.json({
    total,
    available: total,
    sold: 0,
    held: 0
  });
}
