-- =====================================================
-- 🔍 Identify & Clean Products/Categories with Default/Factory Image
-- Run this in Supabase SQL Editor
-- =====================================================

-- STEP 1: See which products have the factory/placeholder image
SELECT id, name, image, stock, price
FROM products
WHERE image ILIKE '%unsplash%'
   OR image ILIKE '%1581091226825%'
   OR image ILIKE '%placeholder%'
   OR image IS NULL
   OR TRIM(image) = ''
ORDER BY name;

-- STEP 2: See all columns in categories table (to check available fields)
SELECT column_name FROM information_schema.columns WHERE table_name = 'categories' ORDER BY ordinal_position;

-- STEP 4 (optional): Clear bad product images (sets to NULL so they're hidden from customers)
-- WARNING: only run this if you're OK clearing these images
-- UPDATE products
-- SET image = NULL
-- WHERE image ILIKE '%unsplash%'
--    OR image ILIKE '%1581091226825%'
--    OR image ILIKE '%placeholder%';
