import type { VercelRequest, VercelResponse } from '@vercel/node';
import { hasDb, getDb } from './lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const checks: { db: string } = { db: 'not configured' };

  if (hasDb()) {
    try {
      const db = getDb();
      await db.from('banners').select('id').limit(1);
      checks.db = 'ok';
    } catch (err) {
      checks.db = 'error';
    }
  }

  return res.json({
    status: checks.db === 'ok' ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    checks
  });
}
