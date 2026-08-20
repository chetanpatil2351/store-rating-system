import { Router, Response } from 'express';
import {
  dbGetAllUsers,
  dbGetUserById,
  dbGetUserByEmail,
  dbInsertUser,
  dbGetStoreByOwnerId,
  validateUserFields,
} from '../db';
import { User, UserRole } from '../types';
import {
  authenticateToken,
  requireRole,
  AuthRequest,
} from '../middleware/auth';

export const userRouter = Router();

userRouter.use(authenticateToken);
userRouter.use(requireRole('admin'));

userRouter.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const {
      role,
      search,
      name,
      email,
      address,
      sortBy,
      sortOrder,
    } = req.query;

    const validSortFields = [
      'name',
      'email',
      'address',
      'role',
      'createdat',
    ];

    const sanitizedSortBy =
      typeof sortBy === 'string' &&
      validSortFields.includes(sortBy.toLowerCase())
        ? sortBy.toLowerCase()
        : 'name';

    const sanitizedSortOrder =
      typeof sortOrder === 'string' &&
      sortOrder.toLowerCase() === 'desc'
        ? 'desc'
        : 'asc';

    const users = await dbGetAllUsers({
      role: typeof role === 'string' ? role : undefined,
      search: typeof search === 'string' ? search : undefined,
      name: typeof name === 'string' ? name : undefined,
      email: typeof email === 'string' ? email : undefined,
      address: typeof address === 'string' ? address : undefined,
      sortBy: sanitizedSortBy,
      sortOrder: sanitizedSortOrder,
    });

    const sanitized = users.map((user) => {
      const { password: _, ...safeUser } = user;
      return safeUser;
    });

    return res.json({
      success: true,
      count: sanitized.length,
      users: sanitized,
    });
  } catch {
    return res.status(500).json({
      error: 'Internal server error fetching users',
    });
  }
});

userRouter.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const user = await dbGetUserById(req.params.id);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    let linkedStore = null;

    if (user.role === 'store_owner') {
      linkedStore = await dbGetStoreByOwnerId(user.id);
    }

    const { password: _, ...safeUser } = user;

    return res.json({
      success: true,
      user: {
        ...safeUser,
        linkedStore,
      },
    });
  } catch {
    return res.status(500).json({
      error: 'Internal server error fetching user details',
    });
  }
});

userRouter.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      email,
      password,
      address,
      role,
    } = req.body;

    const errors = validateUserFields(
      name,
      email,
      address,
      password
    );

    const validRoles: UserRole[] = [
      'admin',
      'user',
      'store_owner',
    ];

    if (!role || !validRoles.includes(role)) {
      errors.role =
        'Role must be one of: admin, user, store_owner';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        errors,
        details: errors,
      });
    }

    const existing = await dbGetUserByEmail(
      String(email).trim()
    );

    if (existing) {
      return res.status(409).json({
        error: 'User email already exists in system',
      });
    }

    const newUser: User = {
      id: `user-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 4)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      address: address.trim(),
      role: role as UserRole,
      createdAt: new Date().toISOString(),
    };

    await dbInsertUser(newUser);

    const { password: _, ...safeUser } = newUser;

    return res.status(201).json({
      success: true,
      user: safeUser,
    });
  } catch {
    return res.status(500).json({
      error: 'Internal server error creating user',
    });
  }
});