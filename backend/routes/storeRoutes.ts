import { Router, Response } from 'express';
import {
  dbGetAllStores,
  dbGetStoreById,
  dbInsertStore,
  validateStoreFields,
  dbGetUserById,
} from '../db';
import { Store } from '../types';
import {
  authenticateToken,
  requireRole,
  AuthRequest,
} from '../middleware/auth';

export const storeRouter = Router();

storeRouter.use(authenticateToken);

storeRouter.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const {
      search,
      name,
      address,
      sortBy,
      sortOrder,
    } = req.query;

    const validSortFields = [
      'name',
      'email',
      'address',
      'rating',
      'overallrating',
      'averagerating',
      'createdat',
    ];

    const sortFieldKey =
      typeof sortBy === 'string'
        ? sortBy.toLowerCase()
        : 'name';

    const sanitizedSortBy = validSortFields.includes(sortFieldKey)
      ? sortFieldKey
      : 'name';

    const sanitizedSortOrder =
      typeof sortOrder === 'string' &&
      sortOrder.toLowerCase() === 'desc'
        ? 'desc'
        : 'asc';

    const stores = await dbGetAllStores({
      search: typeof search === 'string' ? search : undefined,
      name: typeof name === 'string' ? name : undefined,
      address: typeof address === 'string' ? address : undefined,
      sortBy: sanitizedSortBy,
      sortOrder: sanitizedSortOrder,
    });

    return res.json({
      success: true,
      count: stores.length,
      stores,
    });
  } catch {
    return res.status(500).json({
      error: 'Internal server error fetching stores',
    });
  }
});

storeRouter.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const store = await dbGetStoreById(req.params.id);

    if (!store) {
      return res.status(404).json({
        error: 'Store not found',
      });
    }

    return res.json({
      success: true,
      store,
    });
  } catch {
    return res.status(500).json({
      error: 'Internal server error fetching store',
    });
  }
});

storeRouter.post(
  '/',
  requireRole('admin'),
  async (req: AuthRequest, res: Response) => {
    try {
      const {
        name,
        email,
        address,
        ownerId,
      } = req.body;

      const errors = validateStoreFields(
        name,
        email,
        address
      );

      if (Object.keys(errors).length > 0) {
        return res.status(400).json({
          error: 'Validation failed',
          errors,
          details: errors,
        });
      }

      if (ownerId) {
        const owner = await dbGetUserById(ownerId);

        if (!owner) {
          return res.status(400).json({
            error: 'Specified owner user ID does not exist',
          });
        }

        if (owner.role !== 'store_owner') {
          return res.status(400).json({
            error:
              'Assigned owner must have the store_owner role. Normal users or admins cannot be assigned as store owners.',
          });
        }
      }

      const newStore: Store = {
        id: `store-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 4)}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        address: address.trim(),
        ownerId: ownerId || undefined,
        createdAt: new Date().toISOString(),
      };

      await dbInsertStore(newStore);

      return res.status(201).json({
        success: true,
        store: newStore,
      });
    } catch {
      return res.status(500).json({
        error: 'Internal server error creating store',
      });
    }
  }
);