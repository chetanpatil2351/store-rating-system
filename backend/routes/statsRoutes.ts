import { Router, Response } from 'express';
import { dbGetSystemStats } from '../db';
import {
  authenticateToken,
  requireRole,
  AuthRequest,
} from '../middleware/auth';

export const statsRouter = Router();

statsRouter.get(
  '/stats',
  authenticateToken,
  requireRole('admin'),
  async (_req: AuthRequest, res: Response) => {
    try {
      const stats = await dbGetSystemStats();

      return res.json({
        success: true,
        stats,
      });
    } catch {
      return res.status(500).json({
        error: 'Internal server error fetching system statistics',
      });
    }
  }
);