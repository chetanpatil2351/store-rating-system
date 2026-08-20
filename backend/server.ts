import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { authRouter } from './routes/authRoutes';
import { userRouter } from './routes/userRoutes';
import { storeRouter } from './routes/storeRoutes';
import { ratingRouter } from './routes/ratingRoutes';
import { statsRouter } from './routes/statsRoutes';
import { pgInitSchema, getPostgresPool } from './postgres';
import { getJwtSecret } from './middleware/auth';

async function startServer() {
  // 1. Enforce JWT_SECRET configuration - fail startup immediately if missing
  try {
    getJwtSecret();
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'JWT configuration failed';
    console.error(message);
    process.exit(1);
  }

  // 2. PostgreSQL initialization MUST complete successfully before starting the server
  try {
    await pgInitSchema();
    console.log('PostgreSQL database and schema initialized successfully.');
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Unknown database error';
    console.error(
      'FATAL: PostgreSQL initialization failed. Express server will not start:',
      message
    );
    process.exit(1);
  }

  const app = express();
  const PORT = 3000;

  // JSON Body Parser
  app.use(express.json());

  // API Health Check & DB Status: reflects actual PostgreSQL availability
  app.get('/api/health', async (_req, res) => {
    try {
      const pool = getPostgresPool();
      await pool.query('SELECT 1');

      return res.json({
        status: 'ok',
        database: 'connected',
        timestamp: new Date().toISOString(),
      });
    } catch (err: unknown) {
      return res.status(503).json({
        status: 'error',
        database: 'unavailable',
        error: 'Database connection check failed',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Mount Express.js API Routers
  app.use('/api/auth', authRouter);
  app.use('/api/users', userRouter);
  app.use('/api/stores', storeRouter);
  app.use('/api/ratings', ratingRouter);
  app.use('/api', statsRouter);

  // Vite middleware for development vs Static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');

    app.use(express.static(distPath));

    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(
      `Express API backend server running on http://0.0.0.0:${PORT}`
    );
  });
}

startServer();