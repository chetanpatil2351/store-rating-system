-- =============================================================================
-- PostgreSQL Database Schema: Store Rating Portal
-- =============================================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. Table: users
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(60) NOT NULL CHECK (char_length(name) >= 20 AND char_length(name) <= 60),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    address VARCHAR(400) NOT NULL CHECK (char_length(address) <= 400),
    role VARCHAR(32) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user', 'store_owner')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- -----------------------------------------------------------------------------
-- 2. Table: stores
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stores (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(60) NOT NULL CHECK (char_length(name) >= 20 AND char_length(name) <= 60),
    email VARCHAR(255) NOT NULL UNIQUE,
    address VARCHAR(400) NOT NULL CHECK (char_length(address) <= 400),
    owner_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_stores_email ON stores(email);
CREATE INDEX IF NOT EXISTS idx_stores_owner_id ON stores(owner_id);

-- -----------------------------------------------------------------------------
-- 3. Table: ratings
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ratings (
    id VARCHAR(64) PRIMARY KEY,
    store_id VARCHAR(64) NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_store_user_rating UNIQUE (store_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_ratings_store_id ON ratings(store_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON ratings(user_id);

-- -----------------------------------------------------------------------------
-- 4. Sample Seed Data
-- -----------------------------------------------------------------------------
INSERT INTO users (id, name, email, password, address, role, created_at)
VALUES 
    ('user-admin-1', 'Administrator Master Johnathan Doe', 'admin@storerating.com', '$2a$10$7Z7Wk213jH8N3QZ9v2b59ecX81L48q0x4Z2Y8jH7K9N3QZ9v2b59e', 'System HQ Suite 400, Silicon Avenue, Metro Tech City, Sector 9', 'admin', NOW()),
    ('user-owner-1', 'Michael Arthur Pendelton Store Owner', 'owner.coffee@store.com', '$2a$10$7Z7Wk213jH8N3QZ9v2b59ecX81L48q0x4Z2Y8jH7K9N3QZ9v2b59e', 'Shop 12B, Old Heritage Building, Downtown Commercial Boulevard', 'store_owner', NOW()),
    ('user-owner-2', 'Samantha Clarissa Kensington Owner', 'owner.tech@store.com', '$2a$10$7Z7Wk213jH8N3QZ9v2b59ecX81L48q0x4Z2Y8jH7K9N3QZ9v2b59e', 'Unit 405, Silicon Tower Two, Electronics Business Corridor', 'store_owner', NOW()),
    ('user-normal-1', 'Robert Christopher Johnson Senior', 'user.robert@gmail.com', '$2a$10$7Z7Wk213jH8N3QZ9v2b59ecX81L48q0x4Z2Y8jH7K9N3QZ9v2b59e', 'Flat 302, Green Meadows Apartment, Maple Street, City West', 'user', NOW()),
    ('user-normal-2', 'Elena Samantha Williams Davis', 'user.elena@gmail.com', '$2a$10$7Z7Wk213jH8N3QZ9v2b59ecX81L48q0x4Z2Y8jH7K9N3QZ9v2b59e', 'House No 45, Golden Palm Residency, North Park Extension', 'user', NOW()),
    ('user-normal-3', 'Alexander Benjamin Harrison III', 'user.alex@gmail.com', '$2a$10$7Z7Wk213jH8N3QZ9v2b59ecX81L48q0x4Z2Y8jH7K9N3QZ9v2b59e', 'Apartment 7B, Ocean View Towers, Coastal Bay Area, Block 3', 'user', NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO stores (id, name, email, address, owner_id, created_at)
VALUES 
    ('store-1', 'Downtown Coffee Roasters Limited Company', 'contact@downtowncoffee.com', '45th Main Road, Sector 4, Near City Central Clock Tower', 'user-owner-1', NOW()),
    ('store-2', 'Tech Solutions Gadget Paradise Mega Store', 'info@techparadise.com', 'Unit 405, Electronics Park Phase 1, Near Metro Pillar 142', 'user-owner-2', NOW()),
    ('store-3', 'The Organic Fruit Collective Hub Market', 'admin@organichub.org', 'Green Valley Square, Block B, Organic Farmer Market Lane 4', NULL, NOW()),
    ('store-4', 'Urban Apparel And Fashion Lifestyle Store', 'sales@urbanfashion.in', 'City Center Mall, 2nd Floor, Unit 20-22, Main Expressway', NULL, NOW()),
    ('store-5', 'Grand Books And Stationery Super Emporium', 'books@grandemporium.com', 'University Road, Opposite Campus Gate 2, Academic Plaza', NULL, NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO ratings (id, store_id, user_id, rating, created_at, updated_at)
VALUES 
    ('rating-1', 'store-1', 'user-normal-1', 5, NOW(), NOW()),
    ('rating-2', 'store-1', 'user-normal-2', 4, NOW(), NOW()),
    ('rating-3', 'store-2', 'user-normal-1', 5, NOW(), NOW()),
    ('rating-4', 'store-2', 'user-normal-3', 4, NOW(), NOW()),
    ('rating-5', 'store-3', 'user-normal-2', 4, NOW(), NOW()),
    ('rating-6', 'store-4', 'user-normal-3', 3, NOW(), NOW())
ON CONFLICT (store_id, user_id) DO NOTHING;
