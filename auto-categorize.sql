-- =====================================================
-- 🏷️ Auto-Categorize Products by Name Keywords
-- يضيف تصنيفات ثانوية في category_name فقط
-- (category_id له FK constraint — لا نعدله)
-- الكود يفلتر بـ category_name.ilike فيشتغل تمام
-- Run in Supabase SQL Editor
-- =====================================================

-- ──────────────────────────────────────────────────
-- 🍫 CHOCOLATE — شوكولاتة
-- ──────────────────────────────────────────────────
UPDATE products SET category_name = category_name || ',شوكولاتة'
WHERE (name ILIKE '%شوكولاتة%' OR name ILIKE '%شوكولا%' OR name ILIKE '%chocolate%')
  AND category_name NOT ILIKE '%شوكولاتة%';

UPDATE products SET category_name = category_name || ',ميلك'
WHERE (name ILIKE '%ميلك%' OR name ILIKE '%milk%' OR name ILIKE '%بالحليب%')
  AND category_name NOT ILIKE '%ميلك%';

UPDATE products SET category_name = category_name || ',دارك'
WHERE (name ILIKE '%دارك%' OR name ILIKE '%dark%')
  AND category_name NOT ILIKE '%دارك%';

UPDATE products SET category_name = category_name || ',وايت'
WHERE (name ILIKE '%وايت%' OR name ILIKE '%white%' OR name ILIKE '%أبيض%')
  AND category_name NOT ILIKE '%وايت%';

UPDATE products SET category_name = category_name || ',ستيفيا'
WHERE (name ILIKE '%ستيفيا%' OR name ILIKE '%ستيفا%')
  AND category_name NOT ILIKE '%ستيفيا%';

UPDATE products SET category_name = category_name || ',كنافة'
WHERE (name ILIKE '%كنافة%' OR name ILIKE '%كنافه%')
  AND category_name NOT ILIKE '%كنافة%';

UPDATE products SET category_name = category_name || ',مكسرات'
WHERE (name ILIKE '%مكسرات%' OR name ILIKE '%نوتيلا%' OR name ILIKE '%هيزل%'
    OR name ILIKE '%فستق%'   OR name ILIKE '%لوز%'    OR name ILIKE '%nuts%')
  AND category_name NOT ILIKE '%مكسرات%';

-- ──────────────────────────────────────────────────
-- ☕ COFFEE — قهوة
-- ──────────────────────────────────────────────────
UPDATE products SET category_name = category_name || ',قهوة'
WHERE (name ILIKE '%قهوة%' OR name ILIKE '%قهوه%' OR name ILIKE '%كوفي%' OR name ILIKE '%coffee%')
  AND category_name NOT ILIKE '%قهوة%';

UPDATE products SET category_name = category_name || ',تركية'
WHERE (name ILIKE '%تركي%' OR name ILIKE '%تركية%')
  AND category_name NOT ILIKE '%تركية%';

UPDATE products SET category_name = category_name || ',اسبريسو'
WHERE (name ILIKE '%اسبريسو%' OR name ILIKE '%اسبرسو%' OR name ILIKE '%espresso%')
  AND category_name NOT ILIKE '%اسبريسو%';

UPDATE products SET category_name = category_name || ',ديكاف'
WHERE (name ILIKE '%ديكاف%' OR name ILIKE '%decaf%')
  AND category_name NOT ILIKE '%ديكاف%';

UPDATE products SET category_name = category_name || ',سريعة'
WHERE (name ILIKE '%نسكافيه%' OR name ILIKE '%instant%' OR name ILIKE '%سريع التحضير%')
  AND category_name NOT ILIKE '%سريعة%';

-- ──────────────────────────────────────────────────
-- 🚫🍬 DIETARY — غذائي
-- ──────────────────────────────────────────────────
UPDATE products SET category_name = category_name || ',فري شوجر'
WHERE (name ILIKE '%سكر فري%' OR name ILIKE '%فري شوجر%' OR name ILIKE '%بدون سكر%'
    OR name ILIKE '%ستيفيا%'  OR name ILIKE '%sugar free%')
  AND category_name NOT ILIKE '%فري شوجر%';

UPDATE products SET category_name = category_name || ',فري جلوتين'
WHERE (name ILIKE '%جلوتين%' OR name ILIKE '%فري جلوتين%' OR name ILIKE '%gluten%')
  AND category_name NOT ILIKE '%فري جلوتين%';

-- ──────────────────────────────────────────────────
-- 🍪 COOKIES / BISCUITS — بسكوت وكيك
-- ──────────────────────────────────────────────────
UPDATE products SET category_name = category_name || ',بسكوت'
WHERE (name ILIKE '%بسكوت%' OR name ILIKE '%بسكويت%' OR name ILIKE '%بسكون%'
    OR name ILIKE '%كيك%'   OR name ILIKE '%كيكة%'   OR name ILIKE '%كعك%'
    OR name ILIKE '%كوكيز%' OR name ILIKE '%cookie%'  OR name ILIKE '%wafer%'
    OR name ILIKE '%ويفر%'  OR name ILIKE '%مقرمش%')
  AND category_name NOT ILIKE '%بسكوت%';

-- ──────────────────────────────────────────────────
-- 🍬 CANDY — حلوى
-- ──────────────────────────────────────────────────
UPDATE products SET category_name = category_name || ',حلوى'
WHERE (name ILIKE '%حلوى%'  OR name ILIKE '%كراميل%' OR name ILIKE '%مارشملو%'
    OR name ILIKE '%توفي%'  OR name ILIKE '%بونبون%' OR name ILIKE '%candy%'
    OR name ILIKE '%تافي%'  OR name ILIKE '%جيلي%')
  AND category_name NOT ILIKE '%حلوى%';

-- ──────────────────────────────────────────────────
-- 🥨 SNACKS — سناكس
-- ──────────────────────────────────────────────────
UPDATE products SET category_name = category_name || ',سناكس'
WHERE (name ILIKE '%شيبس%' OR name ILIKE '%chips%' OR name ILIKE '%بذور%'
    OR name ILIKE '%سناك%' OR name ILIKE '%snack%' OR name ILIKE '%مقرمشات%')
  AND category_name NOT ILIKE '%سناكس%';

-- ──────────────────────────────────────────────────
-- 🧴 COSMETICS — مستحضرات
-- ──────────────────────────────────────────────────
UPDATE products SET category_name = category_name || ',بشرة'
WHERE (name ILIKE '%كريم%' OR name ILIKE '%سيروم%' OR name ILIKE '%لوشن%'
    OR name ILIKE '%مرطب%' OR name ILIKE '%serum%' OR name ILIKE '%تونر%')
  AND category_name NOT ILIKE '%بشرة%';

UPDATE products SET category_name = category_name || ',شعر'
WHERE (name ILIKE '%شامبو%' OR name ILIKE '%بلسم%' OR name ILIKE '%shampoo%' OR name ILIKE '%hair%')
  AND category_name NOT ILIKE '%شعر%';

-- ──────────────────────────────────────────────────
-- 🎁 GIFTS — هدايا
-- ──────────────────────────────────────────────────
UPDATE products SET category_name = category_name || ',هدايا'
WHERE (name ILIKE '%هدية%' OR name ILIKE '%هدايا%' OR name ILIKE '%gift%'
    OR name ILIKE '%باكيج%' OR name ILIKE '%بوكس%'  OR name ILIKE '%تشكيلة%'
    OR name ILIKE '%مجموعة%' OR name ILIKE '%بوكيه%')
  AND category_name NOT ILIKE '%هدايا%';

-- ──────────────────────────────────────────────────
-- ✅ VERIFY
-- ──────────────────────────────────────────────────
SELECT id, name, category_name
FROM products
WHERE category_name LIKE '%,%'
ORDER BY name
LIMIT 50;
