-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Table: customers
CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table: orders
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_code TEXT NOT NULL UNIQUE,
    customer_id INTEGER NOT NULL,
    box_count INTEGER NOT NULL CHECK (box_count >= 1),
    price_per_box REAL NOT NULL DEFAULT 150.00,
    total_price REAL GENERATED ALWAYS AS (box_count * price_per_box) STORED,
    delivery_latitude REAL NOT NULL,
    delivery_longitude REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending',
    notes TEXT,
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Indexes for fast searches and spatial calculations
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_customers_coords ON customers(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_coords ON orders(delivery_latitude, delivery_longitude);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date);
