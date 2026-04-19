-- PERFORMANCE OPTIMIZATION SCRIPT for Happiness Makers Store

-- 1. Accelerate Grouping and Search by Name
CREATE INDEX IF NOT EXISTS idx_products_name ON products (name);

-- 2. Accelerate Category Filtering
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products (category_id);

-- 3. Accelerate Availability Checks (Stock & Price)
CREATE INDEX IF NOT EXISTS idx_products_stock ON products (stock);
CREATE INDEX IF NOT EXISTS idx_products_price ON products (price);

-- 4. Accelerate Featured Products
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products (is_featured);

-- 5. Accelerate Branch-specific stock lookups
CREATE INDEX IF NOT EXISTS idx_product_branch_stock_lookup ON product_branch_stock (product_id, branch_id);
