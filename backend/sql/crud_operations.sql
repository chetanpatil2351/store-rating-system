-- =============================================================================
-- PostgreSQL CRUD Operations Reference Scripts
-- =============================================================================

-- =============================================================================
-- SECTION 1: USERS CRUD OPERATIONS
-- =============================================================================

-- 1.1 CREATE: Register a new user
INSERT INTO users (id, name, email, password, address, role, created_at)
VALUES (
    'user-custom-101', 
    'Benjamin Michael Henderson Senior', 
    'benjamin.henderson@example.com', 
    '$2a$10$...hashed_password...', 
    'Apartment 5A, Highland Park, 12th Avenue, North District', 
    'user', 
    NOW()
)
RETURNING id, name, email, address, role, created_at;

-- 1.2 READ: Authenticate / Login user by email
SELECT id, name, email, password, address, role, created_at
FROM users
WHERE LOWER(email) = LOWER('benjamin.henderson@example.com');

-- 1.3 READ: List users with search filters and sorting
SELECT id, name, email, address, role, created_at
FROM users
WHERE ($1::text IS NULL OR role = $1::text)
  AND (
    $2::text IS NULL OR 
    LOWER(name) LIKE LOWER('%' || $2::text || '%') OR 
    LOWER(email) LIKE LOWER('%' || $2::text || '%') OR 
    LOWER(address) LIKE LOWER('%' || $2::text || '%')
  )
ORDER BY name ASC;

-- 1.4 READ: Fetch user detail by ID with linked store info (via stores.owner_id)
SELECT 
    u.id, 
    u.name, 
    u.email, 
    u.address, 
    u.role, 
    u.created_at,
    s.id AS linked_store_id,
    s.name AS linked_store_name,
    s.email AS linked_store_email,
    s.address AS linked_store_address
FROM users u
LEFT JOIN stores s ON s.owner_id = u.id
WHERE u.id = 'user-owner-1';

-- 1.5 UPDATE: Update user account password
UPDATE users
SET password = '$2a$10$...new_hashed_password...',
    updated_at = NOW()
WHERE id = 'user-normal-1'
RETURNING id, name, email, updated_at;

-- 1.6 DELETE: Remove a user by ID
DELETE FROM users
WHERE id = 'user-custom-101'
RETURNING id, email;


-- =============================================================================
-- SECTION 2: STORES CRUD OPERATIONS
-- =============================================================================

-- 2.1 CREATE: Insert a new store
INSERT INTO stores (id, name, email, address, owner_id, created_at)
VALUES (
    'store-custom-201',
    'Green Horizon Organic Supermarket Store',
    'info@greenhorizonsupermarket.com',
    '78 Forest Avenue, Green Tech Eco Corridor, Sector 12',
    NULL,
    NOW()
)
RETURNING id, name, email, address, owner_id, created_at;

-- 2.2 READ: List stores with live average rating, rating count, and owner info
SELECT 
    s.id,
    s.name,
    s.email,
    s.address,
    s.owner_id,
    s.created_at,
    u.name AS owner_name,
    u.email AS owner_email,
    COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0.0) AS average_rating,
    COUNT(r.id)::int AS rating_count
FROM stores s
LEFT JOIN users u ON s.owner_id = u.id
LEFT JOIN ratings r ON s.id = r.store_id
WHERE (
    $1::text IS NULL OR 
    LOWER(s.name) LIKE LOWER('%' || $1::text || '%') OR 
    LOWER(s.address) LIKE LOWER('%' || $1::text || '%')
)
GROUP BY s.id, u.id
ORDER BY average_rating DESC, s.name ASC;

-- 2.3 READ: Fetch single store by ID
SELECT 
    s.id,
    s.name,
    s.email,
    s.address,
    s.owner_id,
    s.created_at,
    u.name AS owner_name,
    u.email AS owner_email,
    COALESCE(ROUND(AVG(r.rating)::numeric, 1), 0.0) AS average_rating,
    COUNT(r.id)::int AS rating_count
FROM stores s
LEFT JOIN users u ON s.owner_id = u.id
LEFT JOIN ratings r ON s.id = r.store_id
WHERE s.id = 'store-1'
GROUP BY s.id, u.id;

-- 2.4 UPDATE: Update store information or assign new owner
UPDATE stores
SET name = 'Downtown Coffee Roasters Flagship Cafe',
    address = '45th Main Road, Corner Block 4, Near Clock Tower Square',
    owner_id = 'user-owner-1',
    updated_at = NOW()
WHERE id = 'store-1'
RETURNING id, name, email, address, owner_id, updated_at;

-- 2.5 DELETE: Delete a store by ID
DELETE FROM stores
WHERE id = 'store-custom-201'
RETURNING id, name;


-- =============================================================================
-- SECTION 3: RATINGS CRUD OPERATIONS
-- =============================================================================

-- 3.1 CREATE or UPDATE (Upsert): Submit or modify a store rating
INSERT INTO ratings (id, store_id, user_id, rating, created_at, updated_at)
VALUES (
    'rating-custom-301',
    'store-1',
    'user-normal-3',
    5,
    NOW(),
    NOW()
)
ON CONFLICT (store_id, user_id) 
DO UPDATE SET
    rating = EXCLUDED.rating,
    updated_at = NOW()
RETURNING id, store_id, user_id, rating, updated_at;

-- 3.2 READ: Fetch all ratings for a specific store with User Info JOIN (Store Owner View)
SELECT 
    r.id,
    r.store_id,
    r.user_id,
    u.name AS user_name,
    u.email AS user_email,
    r.rating,
    r.created_at,
    r.updated_at
FROM ratings r
JOIN users u ON r.user_id = u.id
WHERE r.store_id = 'store-1'
ORDER BY r.updated_at DESC;

-- 3.3 READ: Fetch all ratings submitted by a specific user (User History View)
SELECT 
    r.id,
    r.store_id,
    s.name AS store_name,
    s.address AS store_address,
    r.rating,
    r.created_at,
    r.updated_at
FROM ratings r
JOIN stores s ON r.store_id = s.id
WHERE r.user_id = 'user-normal-1'
ORDER BY r.updated_at DESC;

-- 3.4 DELETE: Remove a user rating
DELETE FROM ratings
WHERE store_id = 'store-1' AND user_id = 'user-normal-3'
RETURNING id, store_id, user_id;


-- =============================================================================
-- SECTION 4: SYSTEM METRICS & AGGREGATE STATS
-- =============================================================================

-- 4.1 System summary counts for Admin Dashboard
SELECT
    (SELECT COUNT(*) FROM users) AS total_users,
    (SELECT COUNT(*) FROM stores) AS total_stores,
    (SELECT COUNT(*) FROM ratings) AS total_ratings,
    (SELECT COUNT(*) FROM users WHERE role = 'admin') AS total_admins,
    (SELECT COUNT(*) FROM users WHERE role = 'store_owner') AS total_owners,
    (SELECT COUNT(*) FROM users WHERE role = 'user') AS total_normal_users;
