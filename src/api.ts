import { User, Store, StoreRating } from './types';

const TOKEN_KEY = 'storerater_jwt_token_v1';

type ApiResponse<T> = T;

type StoreWithRating = Store & {
  averageRating: number;
  overallRating?: number;
  ratingCount: number;
  ownerName?: string;
  ownerEmail?: string;
};

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage =
      data.error ||
      data.message ||
      `API request failed with status ${response.status}`;

    throw new Error(errorMessage);
  }

  return data as T;
}

function buildUrl(path: string, params?: Record<string, string | undefined>): string {
  if (!params) return path;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value && value !== 'all') {
      query.append(key, value);
    }
  }
  const queryString = query.toString();
  return queryString ? `${path}?${queryString}` : path;
}

export async function loginUser(
  email: string,
  password: string
): Promise<{
  success: boolean;
  token: string;
  user: User;
}> {
  const result = await request<{
    success: boolean;
    token: string;
    user: User;
  }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (result.token) {
    setAuthToken(result.token);
  }

  return result;
}

export async function registerUser(userData: {
  name: string;
  email: string;
  password: string;
  address: string;
}): Promise<{
  success: boolean;
  token: string;
  user: User;
}> {
  const result = await request<{
    success: boolean;
    token: string;
    user: User;
  }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });

  if (result.token) {
    setAuthToken(result.token);
  }

  return result;
}

export async function logoutUser(): Promise<void> {
  setAuthToken(null);
}

export async function changePassword(
  newPassword: string,
  oldPassword?: string
): Promise<{
  success: boolean;
  message: string;
}> {
  return request('/api/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({
      newPassword,
      oldPassword,
    }),
  });
}

export async function fetchUsers(params?: {
  role?: string;
  name?: string;
  email?: string;
  address?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc' | string;
}): Promise<{ users: User[] }> {
  const url = buildUrl('/api/users', {
    role: params?.role,
    name: params?.name,
    email: params?.email,
    address: params?.address,
    search: params?.search,
    sortBy: params?.sortBy,
    sortOrder: params?.sortOrder,
  });

  return request<{ users: User[] }>(url);
}

export async function fetchUserDetails(
  userId: string
): Promise<{
  user: User & { linkedStore?: Store };
}> {
  return request(`/api/users/${userId}`);
}

export async function createUser(userData: {
  name: string;
  email: string;
  password: string;
  address: string;
  role: string;
}): Promise<{
  success: boolean;
  user: User;
}> {
  return request('/api/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

export async function fetchStores(params?: {
  name?: string;
  address?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc' | string;
}): Promise<{
  stores: StoreWithRating[];
}> {
  const url = buildUrl('/api/stores', {
    name: params?.name,
    address: params?.address,
    search: params?.search,
    sortBy: params?.sortBy,
    sortOrder: params?.sortOrder,
  });

  return request<{ stores: StoreWithRating[] }>(url);
}

export async function createStore(storeData: {
  name: string;
  email: string;
  address: string;
  ownerId?: string;
}): Promise<{
  success: boolean;
  store: Store;
}> {
  return request('/api/stores', {
    method: 'POST',
    body: JSON.stringify(storeData),
  });
}

export async function fetchRatings(params?: {
  storeId?: string;
  userId?: string;
}): Promise<{
  ratings: StoreRating[];
}> {
  const url = buildUrl('/api/ratings', {
    storeId: params?.storeId,
    userId: params?.userId,
  });

  return request<{ ratings: StoreRating[] }>(url);
}

export async function submitRating(data: {
  storeId: string;
  rating: number;
}): Promise<{
  success: boolean;
  rating: StoreRating;
}> {
  return request('/api/ratings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function fetchAdminStats(): Promise<{
  success: boolean;
  stats: {
    totalUsers: number;
    totalStores: number;
    totalRatings: number;
    totalAdmins: number;
    totalOwners: number;
    totalNormalUsers: number;
  };
}> {
  return request('/api/stats');
}