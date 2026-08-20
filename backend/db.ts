import bcrypt from 'bcryptjs';
import { User, Store, StoreRating } from './types';
import * as pg from './postgres';

export async function hashPassword(
  plainTextPassword: string
): Promise<string> {
  return bcrypt.hash(plainTextPassword, 10);
}

export async function comparePassword(
  plainTextPassword: string,
  storedHash: string
): Promise<boolean> {
  if (!storedHash || !plainTextPassword) {
    return false;
  }

  try {
    return await bcrypt.compare(plainTextPassword, storedHash);
  } catch {
    return false;
  }
}

export function validatePasswordStrength(password: string): string | null {
  if (!password || password.length < 8 || password.length > 16) {
    return 'Password must be 8-16 characters long';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[!@#$%^&*(),.?":{}|<>\-_=+]/.test(password)) {
    return 'Password must contain at least one special character';
  }
  return null;
}

export function validateUserFields(
  name: string,
  email: string,
  address: string,
  password?: string
) {
  const errors: Record<string, string> = {};

  if (!name || name.trim().length < 20 || name.trim().length > 60) {
    errors.name = 'Name must be between 20 and 60 characters long';
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!email || !emailRegex.test(email.trim())) {
    errors.email = 'Please enter a valid email address';
  }

  if (!address || address.trim().length > 400) {
    errors.address =
      'Address is required and must not exceed 400 characters';
  }

  if (password !== undefined) {
    const passwordError = validatePasswordStrength(password);
    if (passwordError) {
      errors.password = passwordError;
    }
  }

  return errors;
}

export function validateStoreFields(
  name: string,
  email: string,
  address: string
) {
  const errors: Record<string, string> = {};

  if (!name || name.trim().length < 20 || name.trim().length > 60) {
    errors.name = 'Store name must be between 20 and 60 characters long';
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!email || !emailRegex.test(email.trim())) {
    errors.email = 'Please enter a valid store email address';
  }

  if (!address || address.trim().length > 400) {
    errors.address =
      'Store address is required and must not exceed 400 characters';
  }

  return errors;
}

export async function dbGetUserByEmail(
  email: string
): Promise<User | null> {
  return pg.pgFindUserByEmail(email);
}

export async function dbGetUserById(
  id: string
): Promise<User | null> {
  return pg.pgFindUserById(id);
}

export async function dbGetAllUsers(filters: {
  role?: string;
  search?: string;
  name?: string;
  email?: string;
  address?: string;
  sortBy?: string;
  sortOrder?: string;
}): Promise<User[]> {
  return pg.pgListUsers(filters);
}

export async function dbInsertUser(user: User): Promise<User> {
  if (user.password && !user.password.startsWith('$2')) {
    user.password = await hashPassword(user.password);
  }

  return pg.pgCreateUser(user);
}

export async function dbSetUserPassword(
  userId: string,
  newPlainTextPassword: string
): Promise<boolean> {
  const hashedPassword = await hashPassword(newPlainTextPassword);
  return pg.pgUpdateUserPassword(userId, hashedPassword);
}

export async function dbGetAllStores(filters: {
  search?: string;
  name?: string;
  address?: string;
  sortBy?: string;
  sortOrder?: string;
}): Promise<pg.StoreWithRating[]> {
  return pg.pgListStores(filters);
}

export async function dbGetStoreById(
  id: string
): Promise<pg.StoreWithRating | null> {
  return pg.pgFindStoreById(id);
}

export async function dbGetStoreByOwnerId(
  ownerId: string
): Promise<pg.StoreWithRating | null> {
  return pg.pgFindStoreByOwnerId(ownerId);
}

export async function dbInsertStore(store: Store): Promise<Store> {
  return pg.pgCreateStore(store);
}

export async function dbGetRatings(
  storeId?: string,
  userId?: string
): Promise<StoreRating[]> {
  return pg.pgListRatings(storeId, userId);
}

export async function dbSaveRating(rating: {
  storeId: string;
  userId: string;
  rating: number;
}): Promise<StoreRating> {
  return pg.pgUpsertRating(rating);
}

export async function dbGetSystemStats(): Promise<{
  totalUsers: number;
  totalStores: number;
  totalRatings: number;
  totalAdmins: number;
  totalOwners: number;
  totalNormalUsers: number;
}> {
  return pg.pgGetStats();
}