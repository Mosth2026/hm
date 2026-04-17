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

-- STEP 2: See which categories have a bad image set
SELECT id, label, image
FROM categories
WHERE image ILIKE '%unsplash%'
   OR image ILIKE '%1581091226825%'
   OR image ILIKE '%placeholder%';

-- STEP 3 (optional): Clear bad category images so the system fetches real product images instead
UPDATE categories
SET image = NULL
WHERE image ILIKE '%unsplash%'
   OR image ILIKE '%1581091226825%'
   OR image ILIKE '%placeholder%';

-- STEP 4 (optional): Clear bad product images (sets to NULL so they're hidden from customers)
-- WARNING: only run this if you're OK clearing these images
-- UPDATE products
-- SET image = NULL
-- WHERE image ILIKE '%unsplash%'
--    OR image ILIKE '%1581091226825%'
--    OR image ILIKE '%placeholder%';
