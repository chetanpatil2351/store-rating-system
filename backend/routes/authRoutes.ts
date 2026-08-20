import { Router, Response } from 'express';
import {
  dbGetUserByEmail,
  dbGetUserById,
  dbInsertUser,
  dbSetUserPassword,
  validateUserFields,
  comparePassword,
} from '../db';
import { User } from '../types';
import {
  authenticateToken,
  generateToken,
  AuthRequest,
} from '../middleware/auth';

export const authRouter = Router();

authRouter.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
      });
    }

    const user = await dbGetUserByEmail(String(email).trim());

    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password',
      });
    }

    const isMatch = await comparePassword(
      String(password),
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        error: 'Invalid email or password',
      });
    }

    const token = generateToken(user);

    const { password: _, ...userSafe } = user;

    return res.json({
      success: true,
      token,
      user: userSafe,
    });
  } catch {
    return res.status(500).json({
      error: 'Internal server error during authentication',
    });
  }
});

authRouter.post('/register', async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, address } = req.body;

    const errors = validateUserFields(
      name,
      email,
      address,
      password
    );

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        errors,
        details: errors,
      });
    }

    const existing = await dbGetUserByEmail(String(email).trim());

    if (existing) {
      return res.status(409).json({
        error: 'An account with this email address already exists',
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
      role: 'user',
      createdAt: new Date().toISOString(),
    };

    await dbInsertUser(newUser);

    const token = generateToken(newUser);

    const { password: _, ...userSafe } = newUser;

    return res.status(201).json({
      success: true,
      token,
      user: userSafe,
    });
  } catch {
    return res.status(500).json({
      error: 'Internal server error during registration',
    });
  }
});

authRouter.post(
  '/change-password',
  authenticateToken,
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          error: 'Unauthorized: Authentication required',
        });
      }

      const { oldPassword, newPassword } = req.body;

      if (!newPassword) {
        return res.status(400).json({
          error: 'New password is required',
        });
      }

      const user = await dbGetUserById(userId);

      if (!user) {
        return res.status(404).json({
          error: 'User account not found',
        });
      }

      if (oldPassword) {
        const isMatch = await comparePassword(
          String(oldPassword),
          user.password
        );

        if (!isMatch) {
          return res.status(400).json({
            error: 'Current password does not match records',
          });
        }
      }

      if (newPassword.length < 8 || newPassword.length > 16) {
        return res.status(400).json({
          error: 'New password must be 8-16 characters long',
        });
      }

      if (!/[A-Z]/.test(newPassword)) {
        return res.status(400).json({
          error: 'New password must contain at least one uppercase letter',
        });
      }

      if (!/[!@#$%^&*(),.?":{}|<>\-_=+]/.test(newPassword)) {
        return res.status(400).json({
          error: 'New password must contain at least one special character',
        });
      }

      await dbSetUserPassword(userId, newPassword);

      return res.json({
        success: true,
        message: 'Password updated successfully',
      });
    } catch {
      return res.status(500).json({
        error: 'Internal server error changing password',
      });
    }
  }
);