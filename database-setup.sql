-- Database Setup Script for BOlt Admin Panel
-- Run this in your Supabase SQL Editor

-- Option 1: Add an 'items' JSONB field to existing orders table
-- This is the simplest approach if you want to store order items as JSON
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb;

-- Option 2: Create a proper order_items table (recommended for larger applications)
-- Uncomment the following lines if you prefer a normalized structure

/*
-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Add some sample order items (replace with your actual data)
-- INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
-- (1, 1, 2, 29.99),
-- (1, 3, 1, 15.99),
-- (2, 2, 1, 49.99);
*/

-- Option 3: Update existing orders with sample items data
-- Uncomment and modify the following if you want to add sample data to existing orders

/*
-- Example: Add sample items to existing orders (modify as needed)
UPDATE orders 
SET items = '[{"product_id": 1, "name": "Sample Product", "quantity": 2, "price": 29.99}]'::jsonb
WHERE id = 1;

UPDATE orders 
SET items = '[{"product_id": 2, "name": "Another Product", "quantity": 1, "price": 49.99}]'::jsonb
WHERE id = 2;
*/

-- Verify the changes
SELECT 
    id,
    order_number,
    customer_name,
    total_amount,
    status,
    items
FROM orders 
LIMIT 5;
