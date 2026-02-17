import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import seatsRouter from './routes/seats.js';
import ordersRouter from './routes/orders.js';
import adminRouter from './routes/admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    // Allow localhost on any port for development
    if (origin.includes('localhost')) return callback(null, true);
    // Allow configured origin in production
    if (process.env.CORS_ORIGIN && origin === process.env.CORS_ORIGIN) return callback(null, true);
    callback(null, true);
  },
  credentials: true,
}));

// Parse JSON for all routes except webhook (which needs raw body)
app.use((req, res, next) => {
  if (req.originalUrl === '/api/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// API Routes
app.use('/api', seatsRouter);
app.use('/api', ordersRouter);
app.use('/api', adminRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const clientDist = join(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(join(clientDist, 'index.html'));
  });
}

// Background job: Release expired reservations every minute
setInterval(() => {
  const db = (async () => {
    const { default: db } = await import('./db/index.js');
    const result = db.prepare(`
      UPDATE seats
      SET status = 'available', reserved_until = NULL
      WHERE status = 'reserved' AND reserved_until < datetime('now')
    `).run();

    if (result.changes > 0) {
      console.log(`Released ${result.changes} expired seat reservations`);
    }
  })();
}, 60 * 1000);

app.listen(PORT, () => {
  console.log(`🏈 Arena Tickets Server running on http://localhost:${PORT}`);
  console.log(`   API: http://localhost:${PORT}/api`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
});
