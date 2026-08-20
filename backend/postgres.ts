import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { User, Store, StoreRating } from './types';

export interface StoreWithRating extends Store {  ownerName: string | null;
  ownerEmail: string | null;
  averageRating: number;
  overallRating: number;
  ratingCount: number;
}
interface DashboardStats {
  totalUsers: number;
  totalStores: number;
  totalRatings: number;
  totalAdmins: number;
  totalOwners: number;
  totalNormalUsers: number;
}
// PostgreSQL Connection Pool using Object / Env configuration
let pool: Pool | null = null;

export function getPostgresPool(): Pool {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL;
  if (connectionString) {
    pool = new Pool({ connectionString, connectionTimeoutMillis: 5000 });
  } else {
    const host = process.env.PGHOST || 'localhost';
    const user = process.env.PGUSER || 'postgres';
    const password = process.env.PGPASSWORD;
    const database = process.env.PGDATABASE || 'storerating_db';
    const port = process.env.PGPORT
      ? parseInt(process.env.PGPORT, 10)
      : 5432;

    pool = new Pool({
      host,
      user,
      password,
      database,
      port,
      connectionTimeoutMillis: 5000,
    });
  }

  pool.on('error', (err: Error) => {
    console.error('PostgreSQL Pool idle client error:', err?.message || err);
  });

  return pool;
}

// -----------------------------------------------------------------------------
// Postgre schema initialization
// -----------------------------------------------------------------------------

export async function pgInitSchema(): Promise<void> {
  const p = getPostgresPool();

  const schemaSql = `
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(60) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      address VARCHAR(400) NOT NULL,
      role VARCHAR(32) NOT NULL DEFAULT 'user',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS stores (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(60) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      address VARCHAR(400) NOT NULL,
      owner_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ratings (
      id VARCHAR(64) PRIMARY KEY,
      store_id VARCHAR(64) NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT uq_store_user_rating UNIQUE (store_id, user_id)
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    CREATE INDEX IF NOT EXISTS idx_stores_email ON stores(email);
    CREATE INDEX IF NOT EXISTS idx_stores_owner_id ON stores(owner_id);
    CREATE INDEX IF NOT EXISTS idx_ratings_store ON ratings(store_id);
    CREATE INDEX IF NOT EXISTS idx_ratings_user ON ratings(user_id);
  `;

  await p.query(schemaSql);

  // Seed default admin and sample data if database is fresh and seed passwords are provided
  const userCountRes = await p.query('SELECT COUNT(*)::int as count FROM users');
  if (userCountRes.rows[0]?.count === 0) {
    const seedAdminRaw = process.env.SEED_ADMIN_PASSWORD;
    const seedOwnerRaw = process.env.SEED_OWNER_PASSWORD;
    const seedUserRaw = process.env.SEED_USER_PASSWORD;

    if (!seedAdminRaw || !seedOwnerRaw || !seedUserRaw) {
      console.log('Seed password environment variables (SEED_ADMIN_PASSWORD, SEED_OWNER_PASSWORD, SEED_USER_PASSWORD) not provided. Skipping initial seed user generation.');
      return;
    }

    const adminPass = bcrypt.hashSync(seedAdminRaw, 10);
    const ownerPass = bcrypt.hashSync(seedOwnerRaw, 10);
    const userPass = bcrypt.hashSync(seedUserRaw, 10);

    await p.query(
      `INSERT INTO users (id, name, email, password, address, role, created_at)
       VALUES 
        ('user-admin-1', 'Rahul Mahesh Patil Deshmukh', 'rahul.admin@storerater.in', $1, 'Shivajinagar, Pune, Maharashtra 411005', 'admin', NOW()),

        ('user-owner-1', 'Amit Rajendra Kulkarni Deshmukh', 'amit.kulkarni@storerater.in', $2, 'Baner, Pune, Maharashtra 411045', 'store_owner', NOW()),

        ('user-owner-2', 'Priya Suresh Deshmukh Patil', 'priya.deshmukh@storerater.in', $2, 'Kharadi, Pune, Maharashtra 411014', 'store_owner', NOW()),

        ('user-normal-1', 'Chetan Prakash Jadhav', 'chetan.jadhav@storerater.in', $3, 'Wakad, Pune, Maharashtra 411057', 'user', NOW()),

        ('user-normal-2', 'Sneha Anil Pawar Kulkarni', 'sneha.pawar@storerater.in', $3, 'Hadapsar, Pune, Maharashtra 411028', 'user', NOW()),

        ('user-normal-3', 'Rohan Vijay Shinde Patil', 'rohan.shinde@storerater.in', $3, 'Kothrud, Pune, Maharashtra 411038', 'user', NOW())
       ON CONFLICT (id) DO NOTHING;`,
      [adminPass, ownerPass, userPass]
    );

    await p.query(`
      INSERT INTO stores (id, name, email, address, owner_id, created_at)
      VALUES 
        ('store-1', 'Deccan Brew Coffee House and Cafe', 'contact@deccanbrew.in', 'FC Road, Shivajinagar, Pune, Maharashtra 411005', 'user-owner-1', NOW()),

        ('store-2', 'Pune Tech Gadgets and Solutions Store', 'info@punetechgadgets.in', 'Wakad Main Road, Wakad, Pune, Maharashtra 411057', 'user-owner-2', NOW()),

        ('store-3', 'Green Basket Organic Food Market', 'contact@greenbasket.in', 'Baner Road, Baner, Pune, Maharashtra 411045', NULL, NOW()),

        ('store-4', 'Urban Trends Fashion and Lifestyle Store', 'contact@urbantrends.in', 'Kharadi Main Road, Kharadi, Pune, Maharashtra 411014', NULL, NOW()),

        ('store-5', 'Pune Books and Stationery Superstore', 'contact@punebooks.in', 'JM Road, Shivajinagar, Pune, Maharashtra 411005', NULL, NOW())
      ON CONFLICT (id) DO NOTHING;

      INSERT INTO ratings (id, store_id, user_id, rating, created_at, updated_at)
      VALUES 
        ('rating-1', 'store-1', 'user-normal-1', 5, NOW(), NOW()),
        ('rating-2', 'store-1', 'user-normal-2', 4, NOW(), NOW()),
        ('rating-3', 'store-2', 'user-normal-1', 5, NOW(), NOW()),
        ('rating-4', 'store-2', 'user-normal-3', 4, NOW(), NOW()),
        ('rating-5', 'store-3', 'user-normal-2', 4, NOW(), NOW()),
        ('rating-6', 'store-4', 'user-normal-3', 3, NOW(), NOW()),
        ('rating-7', 'store-5', 'user-normal-2', 4, NOW(), NOW())     
         ON CONFLICT (store_id, user_id) DO NOTHING;
    `);
  }
}

// -----------------------------------------------------------------------------
// POSTGRESQL USERS CRUD WITH SAFE WHITELIST SORTING
// -----------------------------------------------------------------------------

const USER_SORT_WHITELIST: Record<string, string> = {
  name: 'LOWER(name)',
  email: 'LOWER(email)',
  address: 'LOWER(address)',
  role: 'role',
  createdat: 'created_at',
  created_at: 'created_at',
};

export async function pgFindUserByEmail(email: string): Promise<User | null> {
  const p = getPostgresPool();
  const res = await p.query(
    'SELECT id, name, email, password, address, role, created_at as "createdAt" FROM users WHERE LOWER(email) = LOWER($1)',
    [email.trim()]
  );
  return res.rows[0] || null;
}

export async function pgFindUserById(id: string): Promise<User | null> {
  const p = getPostgresPool();
  const res = await p.query(
    'SELECT id, name, email, password, address, role, created_at as "createdAt" FROM users WHERE id = $1',
    [id]
  );
  return res.rows[0] || null;
}

export async function pgListUsers(filters: {
  role?: string;
  search?: string;
  name?: string;
  email?: string;
  address?: string;
  sortBy?: string;
  sortOrder?: string;
}): Promise<User[]> {
  const p = getPostgresPool();

  let query = 'SELECT id, name, email, address, role, created_at as "createdAt" FROM users WHERE 1=1';
  const values: string[] = [];

  if (filters.role && filters.role !== 'all') {
    values.push(filters.role);
    query += ` AND role = $${values.length}`;
  }

  if (filters.name) {
    values.push(`%${filters.name.toLowerCase()}%`);
    query += ` AND LOWER(name) LIKE $${values.length}`;
  }

  if (filters.email) {
    values.push(`%${filters.email.toLowerCase()}%`);
    query += ` AND LOWER(email) LIKE $${values.length}`;
  }

  if (filters.address) {
    values.push(`%${filters.address.toLowerCase()}%`);
    query += ` AND LOWER(address) LIKE $${values.length}`;
  }

  if (filters.search) {
    values.push(`%${filters.search.toLowerCase()}%`);
    query += ` AND (LOWER(name) LIKE $${values.length} OR LOWER(email) LIKE $${values.length} OR LOWER(address) LIKE $${values.length})`;
  }

// Whitelist sort fields to prevent SQL injection. 
  const sortKey = String(filters.sortBy || 'name').toLowerCase().replace(/[^a-z_]/g, '');
  const sortColumn = USER_SORT_WHITELIST[sortKey] || 'LOWER(name)';
  const sortDirection = String(filters.sortOrder || '').toLowerCase() === 'desc' ? 'DESC' : 'ASC';

  query += ` ORDER BY ${sortColumn} ${sortDirection}`;

  const res = await p.query(query, values);
  return res.rows;
}

export async function pgCreateUser(user: User): Promise<User> {
  const p = getPostgresPool();
  await p.query(
    'INSERT INTO users (id, name, email, password, address, role, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)',
    [user.id, user.name, user.email, user.password, user.address, user.role, user.createdAt]
  );
  return user;
}

export async function pgUpdateUserPassword(userId: string, hashedNewPassword: string): Promise<boolean> {
  const p = getPostgresPool();
  const res = await p.query('UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2', [hashedNewPassword, userId]);
  return (res.rowCount ?? 0) > 0;
}

// -----------------------------------------------------------------------------
// POSTGRESQL STORES CRUD WITH SAFE WHITELIST SORTING
// -----------------------------------------------------------------------------

const STORE_SORT_WHITELIST: Record<string, string> = {
  name: 'LOWER(s.name)',
  email: 'LOWER(s.email)',
  address: 'LOWER(s.address)',
  rating: '"averageRating"',
  overallrating: '"averageRating"',
  averagerating: '"averageRating"',
  createdat: 's.created_at',
  created_at: 's.created_at',
};

export async function pgListStores(filters: {
  search?: string;
  name?: string;
  address?: string;
  sortBy?: string;
  sortOrder?: string;
}): Promise<StoreWithRating[]> {
  const p = getPostgresPool();

  let query = `
    SELECT 
      s.id,
      s.name,
      s.email,
      s.address,
      s.owner_id as "ownerId",
      s.created_at as "createdAt",
      u.name as "ownerName",
      u.email as "ownerEmail",
      COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0.0)::float as "averageRating",
      COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0.0)::float as "overallRating",
      COUNT(r.id)::int as "ratingCount"
    FROM stores s
    LEFT JOIN users u ON s.owner_id = u.id
    LEFT JOIN ratings r ON s.id = r.store_id
    WHERE 1=1
  `;
  const values: string[] = [];

  if (filters.name) {
    values.push(`%${filters.name.toLowerCase()}%`);
    query += ` AND LOWER(s.name) LIKE $${values.length}`;
  }

  if (filters.address) {
    values.push(`%${filters.address.toLowerCase()}%`);
    query += ` AND LOWER(s.address) LIKE $${values.length}`;
  }

  if (filters.search) {
    values.push(`%${filters.search.toLowerCase()}%`);
    query += ` AND (LOWER(s.name) LIKE $${values.length} OR LOWER(s.address) LIKE $${values.length} OR LOWER(s.email) LIKE $${values.length})`;
  }

  query += ' GROUP BY s.id, u.id';

// Whitelist sort fields to prevent SQL injection.  
  const sortKey = String(filters.sortBy || 'name').toLowerCase().replace(/[^a-z_]/g, '');
  const sortColumn = STORE_SORT_WHITELIST[sortKey] || 'LOWER(s.name)';
  const sortDirection = String(filters.sortOrder || '').toLowerCase() === 'desc' ? 'DESC' : 'ASC';

  query += ` ORDER BY ${sortColumn} ${sortDirection}`;

  const res = await p.query(query, values);
  return res.rows;
}

export async function pgFindStoreById(id: string): Promise<StoreWithRating | null> {
  const p = getPostgresPool();

  const query = `
    SELECT 
      s.id,
      s.name,
      s.email,
      s.address,
      s.owner_id as "ownerId",
      s.created_at as "createdAt",
      u.name as "ownerName",
      u.email as "ownerEmail",
      COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0.0)::float as "averageRating",
      COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0.0)::float as "overallRating",
      COUNT(r.id)::int as "ratingCount"
    FROM stores s
    LEFT JOIN users u ON s.owner_id = u.id
    LEFT JOIN ratings r ON s.id = r.store_id
    WHERE s.id = $1
    GROUP BY s.id, u.id
  `;
  const res = await p.query(query, [id]);
  return res.rows[0] || null;
}

export async function pgFindStoreByOwnerId(ownerId: string): Promise<StoreWithRating | null> {
  const p = getPostgresPool();

  const query = `
    SELECT 
      s.id,
      s.name,
      s.email,
      s.address,
      s.owner_id as "ownerId",
      s.created_at as "createdAt",
      u.name as "ownerName",
      u.email as "ownerEmail",
      COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0.0)::float as "averageRating",
      COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0.0)::float as "overallRating",
      COUNT(r.id)::int as "ratingCount"
    FROM stores s
    LEFT JOIN users u ON s.owner_id = u.id
    LEFT JOIN ratings r ON s.id = r.store_id
    WHERE s.owner_id = $1
    GROUP BY s.id, u.id
  `;
  const res = await p.query(query, [ownerId]);
  return res.rows[0] || null;
}

export async function pgCreateStore(store: Store): Promise<Store> {
  const p = getPostgresPool();
  await p.query(
    'INSERT INTO stores (id, name, email, address, owner_id, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
    [store.id, store.name, store.email, store.address, store.ownerId || null, store.createdAt]
  );
  return store;
}

// -----------------------------------------------------------------------------
// POSTGRESQL RATINGS CRUD (JOIN users for userName & userEmail)
// -----------------------------------------------------------------------------

export async function pgListRatings(storeId?: string, userId?: string): Promise<StoreRating[]> {
  const p = getPostgresPool();

  let query = `
    SELECT 
      r.id, 
      r.store_id as "storeId", 
      r.user_id as "userId", 
      u.name as "userName", 
      u.email as "userEmail", 
      r.rating, 
      r.created_at as "createdAt", 
      r.updated_at as "updatedAt"
    FROM ratings r
    JOIN users u ON r.user_id = u.id
    WHERE 1=1
  `;
  const values: string[] = [];

  if (storeId) {
    values.push(storeId);
    query += ` AND r.store_id = $${values.length}`;
  }

  if (userId) {
    values.push(userId);
    query += ` AND r.user_id = $${values.length}`;
  }

  query += ' ORDER BY r.updated_at DESC';
  const res = await p.query(query, values);
  return res.rows;
}

export async function pgUpsertRating(rating: {
  storeId: string;
  userId: string;
  rating: number;
}): Promise<StoreRating> {
  const p = getPostgresPool();

  const now = new Date().toISOString();
  const id = `rating-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

  const query = `
    INSERT INTO ratings (id, store_id, user_id, rating, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, $5)
    ON CONFLICT (store_id, user_id) 
    DO UPDATE SET
      rating = EXCLUDED.rating,
      updated_at = $5
    RETURNING id, store_id as "storeId", user_id as "userId", rating, created_at as "createdAt", updated_at as "updatedAt";
  `;

  await p.query(query, [
    id,
    rating.storeId,
    rating.userId,
    rating.rating,
    now,
  ]);

  // Fetch with joined user info
  const listRes = await p.query(`
    SELECT 
      r.id, 
      r.store_id as "storeId", 
      r.user_id as "userId", 
      u.name as "userName", 
      u.email as "userEmail", 
      r.rating, 
      r.created_at as "createdAt", 
      r.updated_at as "updatedAt"
    FROM ratings r
    JOIN users u ON r.user_id = u.id
    WHERE r.store_id = $1 AND r.user_id = $2
  `, [rating.storeId, rating.userId]);

  return listRes.rows[0];
}

// -----------------------------------------------------------------------------
// POSTGRESQL STATS
// -----------------------------------------------------------------------------

export async function pgGetStats(): Promise<DashboardStats> {
  const p = getPostgresPool();

  const query = `
    SELECT
      (SELECT COUNT(*)::int FROM users) AS "totalUsers",
      (SELECT COUNT(*)::int FROM stores) AS "totalStores",
      (SELECT COUNT(*)::int FROM ratings) AS "totalRatings",
      (SELECT COUNT(*)::int FROM users WHERE role = 'admin') AS "totalAdmins",
      (SELECT COUNT(*)::int FROM users WHERE role = 'store_owner') AS "totalOwners",
      (SELECT COUNT(*)::int FROM users WHERE role = 'user') AS "totalNormalUsers";
  `;
  const res = await p.query(query);
  return res.rows[0] || null;
}

