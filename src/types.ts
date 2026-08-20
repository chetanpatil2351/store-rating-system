export type UserRole = 'admin' | 'user' | 'store_owner';

export interface User {
  id: string;
  name: string;
  email: string;
  address: string;
  role: UserRole;
  createdAt: string;
}

export interface Store {
  id: string;
  name: string;
  email: string;
  address: string;
  ownerId?: string;
  createdAt: string;
}

export interface StoreRating {
  id: string;
  storeId: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  address?: string;
  general?: string;
}