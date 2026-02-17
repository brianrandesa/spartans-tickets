import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  return res.json({
    totalRevenue: 0,
    ticketsSold: 0,
    todayRevenue: 0,
    todayTickets: 0
  });
}
