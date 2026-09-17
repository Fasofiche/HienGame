CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(180) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'customer',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(180) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT,
    platform VARCHAR(30) NOT NULL,
    price_xof INTEGER NOT NULL CHECK (price_xof >= 0),
    image_url TEXT,
    product_type VARCHAR(20) NOT NULL DEFAULT 'game',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE packs (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(180) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT,
    price_xof INTEGER NOT NULL CHECK (price_xof >= 0),
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE pack_items (
    pack_id BIGINT NOT NULL REFERENCES packs(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    PRIMARY KEY (pack_id, product_id)
);

CREATE TABLE digital_inventory (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    license_code TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'available',
    order_id BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(product_id, license_code)
);

CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    total_xof INTEGER NOT NULL CHECK (total_xof >= 0),
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES products(id),
    pack_id BIGINT REFERENCES packs(id),
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price_xof INTEGER NOT NULL CHECK (unit_price_xof >= 0),
    CHECK (
        (product_id IS NOT NULL AND pack_id IS NULL)
        OR
        (product_id IS NULL AND pack_id IS NOT NULL)
    )
);

ALTER TABLE digital_inventory
ADD CONSTRAINT fk_inventory_order
FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL;

CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    provider VARCHAR(30) NOT NULL,
    provider_reference VARCHAR(180),
    amount_xof INTEGER NOT NULL CHECK (amount_xof >= 0),
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    webhook_event_id VARCHAR(200),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(provider, provider_reference)
);

CREATE TABLE user_entitlements (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    order_id BIGINT NOT NULL REFERENCES orders(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

CREATE TABLE consoles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(180) NOT NULL,
    platform VARCHAR(30) NOT NULL,
    model VARCHAR(120),
    color VARCHAR(80),
    price_xof INTEGER NOT NULL CHECK (price_xof >= 0),
    image_url TEXT,
    description TEXT,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE site_settings (
    id BIGSERIAL PRIMARY KEY,
    site_name VARCHAR(120) NOT NULL DEFAULT 'HienGame',
    logo_url TEXT,
    primary_color VARCHAR(30) NOT NULL DEFAULT '#7C3AED',
    secondary_color VARCHAR(30) NOT NULL DEFAULT '#22C55E',
    background_color VARCHAR(30) NOT NULL DEFAULT '#09090B',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_platform ON products(platform);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_inventory_product_status ON digital_inventory(product_id, status);
CREATE INDEX idx_payments_order ON payments(order_id);
