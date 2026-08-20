import { Router, Response } from 'express';
import {
  dbGetRatings,
  dbSaveRating,
  dbGetStoreById,
  dbGetStoreByOwnerId,
} from '../db';
import {
  authenticateToken,
  requireRole,
  AuthRequest,
} from '../middleware/auth';

export const ratingRouter = Router();

ratingRouter.use(authenticateToken);

ratingRouter.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { storeId, userId } = req.query;
    const currentUser = req.user;

    if (!currentUser) {
      return res.status(401).json({
        error: 'Unauthorized: Authentication required',
      });
    }

    let effectiveStoreId =
      typeof storeId === 'string' ? storeId : undefined;

    let effectiveUserId: string | undefined;

    if (currentUser.role === 'admin') {
      effectiveUserId =
        typeof userId === 'string' ? userId : undefined;
    } else if (currentUser.role === 'store_owner') {
      const ownedStore = await dbGetStoreByOwnerId(currentUser.id);
      const storeIdForOwner = ownedStore?.id;

      if (!storeIdForOwner) {
        return res.json({
          success: true,
          count: 0,
          ratings: [],
        });
      }

      if (
        effectiveStoreId &&
        effectiveStoreId !== storeIdForOwner
      ) {
        return res.status(403).json({
          error:
            'Forbidden: You are only authorized to view ratings for your own store entity',
        });
      }

      effectiveStoreId = storeIdForOwner;
      effectiveUserId =
        typeof userId === 'string' ? userId : undefined;
    } else if (currentUser.role === 'user') {
      effectiveUserId = currentUser.id;
    } else {
      return res.status(403).json({
        error: 'Forbidden: Unauthorized role',
      });
    }

    const ratings = await dbGetRatings(
      effectiveStoreId,
      effectiveUserId
    );

    return res.json({
      success: true,
      count: ratings.length,
      ratings,
    });
  } catch {
    return res.status(500).json({
      error: 'Internal server error fetching ratings',
    });
  }
});

ratingRouter.post(
  '/',
  requireRole('user'),
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          error: 'Unauthorized: Authentication required',
        });
      }

      const { storeId, rating } = req.body;

      if (!storeId) {
        return res.status(400).json({
          error: 'Store ID is required',
        });
      }

      const numericRating = Number(rating);

      if (
        isNaN(numericRating) ||
        !Number.isInteger(numericRating) ||
        numericRating < 1 ||
        numericRating > 5
      ) {
        return res.status(400).json({
          error: 'Rating must be an integer between 1 and 5',
        });
      }

      const targetStore = await dbGetStoreById(storeId);

      if (!targetStore) {
        return res.status(404).json({
          error: 'Target store does not exist',
        });
      }

      const saved = await dbSaveRating({
        storeId,
        userId,
        rating: numericRating,
      });

      return res.status(201).json({
        success: true,
        rating: saved,
      });
    } catch {
      return res.status(500).json({
        error: 'Internal server error submitting rating',
      });
    }
  }
);