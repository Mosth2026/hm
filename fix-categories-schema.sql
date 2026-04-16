
-- 1. Add columns if they don't exist
DO $$ 
BEGIN 
    -- Add parent_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'parent_id') THEN
        ALTER TABLE categories ADD COLUMN parent_id TEXT REFERENCES categories(id) ON DELETE SET NULL;
    END IF;

    -- Add order_index (sometimes named index)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'order_index') THEN
        ALTER TABLE categories ADD COLUMN order_index INTEGER DEFAULT 0;
    END IF;
END $$;

-- 2. Map existing subcategories to their parents (Hierarchical Setup)
-- ... Updates ...
UPDATE categories SET parent_id = 'chocolate', order_index = 1 WHERE id IN ('milk-chocolate', 'dark-chocolate', 'white-chocolate', 'stevia-chocolate', 'kunafa-chocolate', 'nuts-chocolate') AND id != 'chocolate';
UPDATE categories SET parent_id = 'milk-chocolate', order_index = 1 WHERE id IN ('milk-fruits', 'milk-nuts', 'milk-fruits-nuts') AND id != 'milk-chocolate';
UPDATE categories SET parent_id = 'coffee', order_index = 2 WHERE id IN ('instant-coffee', 'turkish-coffee', 'espresso', 'decaf') AND id != 'coffee';
UPDATE categories SET parent_id = 'dietary', order_index = 3 WHERE id IN ('free-sugar', 'free-gluten') AND id != 'dietary';
UPDATE categories SET parent_id = 'cosmetics', order_index = 4 WHERE id IN ('skincare', 'haircare', 'car') AND id != 'cosmetics';

-- 3. Verify changes
SELECT id, label, parent_id, order_index FROM categories ORDER BY order_index ASC;
