-- =====================================================
-- 🏷️ Auto-Categorize Products by Name Keywords
-- يضيف تصنيفات ثانوية للمنتجات بناءً على الاسم
-- لا يحذف أو ينقل — فقط يضيف إلى الأقسام المناسبة
-- Run in Supabase SQL Editor
-- =====================================================

-- Helper: safely append category_id and category_name without duplicates
-- نضيف التصنيف الثانوي فقط لو مش موجود أصلاً

-- ──────────────────────────────────────────────────
-- 🍫 CHOCOLATE — شوكولاتة
-- ──────────────────────────────────────────────────
UPDATE products SET
  category_id   = CASE WHEN category_id   NOT ILIKE '%chocolate%' THEN category_id   || ',chocolate' ELSE category_id   END,
  category_name = CASE WHEN category_name NOT ILIKE '%شوكولاتة%'  THEN category_name || ',شوكولاتة'  ELSE category_name END
WHERE (name ILIKE '%شوكولاتة%' OR name ILIKE '%شوكولا%' OR name ILIKE '%chocolate%')
  AND category_id NOT ILIKE '%chocolate%';

-- Milk Chocolate
UPDATE products SET
  category_id   = CASE WHEN category_id   NOT ILIKE '%milk-chocolate%' THEN category_id   || ',milk-chocolate' ELSE category_id   END,
  category_name = CASE WHEN category_name NOT ILIKE '%ميلك%'           THEN category_name || ',ميلك'           ELSE category_name END
WHERE (name ILIKE '%ميلك%' OR name ILIKE '%milk%' OR name ILIKE '%بالحليب%')
  AND category_id NOT ILIKE '%milk-chocolate%';

-- Dark Chocolate
UPDATE products SET
  category_id   = CASE WHEN category_id   NOT ILIKE '%dark-chocolate%' THEN category_id   || ',dark-chocolate' ELSE category_id   END,
  category_name = CASE WHEN category_name NOT ILIKE '%دارك%'           THEN category_name || ',دارك'           ELSE category_name END
WHERE (name ILIKE '%دارك%' OR name ILIKE '%dark%')
  AND category_id NOT ILIKE '%dark-chocolate%';

-- White Chocolate
UPDATE products SET
  category_id   = CASE WHEN category_id   NOT ILIKE '%white-chocolate%' THEN category_id   || ',white-chocolate' ELSE category_id   END,
  category_name = CASE WHEN category_name NOT ILIKE '%وايت%'            THEN category_name || ',وايت'            ELSE category_name END
WHERE (name ILIKE '%وايت%' OR name ILIKE '%white%' OR name ILIKE '%أبيض%')
  AND category_id NOT ILIKE '%white-chocolate%';

-- Stevia Chocolate
UPDATE products SET
  category_id   = CASE WHEN category_id   NOT ILIKE '%stevia-chocolate%' THEN category_id   || ',stevia-chocolate' ELSE category_id   END,
  category_name = CASE WHEN category_name NOT ILIKE '%ستيفيا%'           THEN category_name || ',ستيفيا'           ELSE category_name END
WHERE (name ILIKE '%ستيفيا%' OR name ILIKE '%ستيفا%')
  AND category_id NOT ILIKE '%stevia-chocolate%';

-- Kunafa Chocolate
UPDATE products SET
  category_id   = CASE WHEN category_id   NOT ILIKE '%kunafa-chocolate%' THEN category_id   || ',kunafa-chocolate' ELSE category_id   END,
  category_name = CASE WHEN category_name NOT ILIKE '%كنافة%'            THEN category_name || ',كنافة'            ELSE category_name END
WHERE (name ILIKE '%كنافة%' OR name ILIKE '%كنافه%')
  AND category_id NOT ILIKE '%kunafa-chocolate%';

-- Nuts Chocolate
UPDATE products SET
  category_id   = CASE WHEN category_id   NOT ILIKE '%nuts-chocolate%' THEN category_id   || ',nuts-chocolate' ELSE category_id   END,
  category_name = CASE WHEN category_name NOT ILIKE '%مكسرات%'         THEN category_name || ',مكسرات'         ELSE category_name END
WHERE (name ILIKE '%مكسرات%' OR name ILIKE '%نوتيلا%' OR name ILIKE '%هيزل%'
    OR name ILIKE '%فستق%'   OR name ILIKE '%لوز%'    OR name ILIKE '%nuts%')
  AND category_id NOT ILIKE '%nuts-chocolate%';

-- ──────────────────────────────────────────────────
-- ☕ COFFEE — قهوة
-- ──────────────────────────────────────────────────
UPDATE products SET
  category_id   = CASE WHEN category_id   NOT ILIKE '%coffee%'  THEN category_id   || ',coffee'  ELSE category_id   END,
  category_name = CASE WHEN category_name NOT ILIKE '%قهوة%'    THEN category_name || ',قهوة'    ELSE category_name END
WHERE (name ILIKE '%قهوة%' OR name ILIKE '%قهوه%' OR name ILIKE '%كوفي%' OR name ILIKE '%coffee%')
  AND category_id NOT ILIKE '%coffee%';

UPDATE products SET
  category_id   = CASE WHEN category_id   NOT ILIKE '%turkish-coffee%' THEN category_id   || ',turkish-coffee' ELSE category_id   END,
  category_name = CASE WHEN category_name NOT ILIKE '%تركي%'           THEN category_name || ',تركية'          ELSE category_name END
WHERE (name ILIKE '%تركي%' OR name ILIKE '%تركية%')
  AND category_id NOT ILIKE '%turkish-coffee%';

UPDATE products SET
  category_id   = CASE WHEN category_id   NOT ILIKE '%espresso%' THEN category_id   || ',espresso' ELSE category_id   END,
  category_name = CASE WHEN category_name NOT ILIKE '%اسبريسو%'  THEN category_name || ',اسبريسو'  ELSE category_name END
WHERE (name ILIKE '%اسبريسو%' OR name ILIKE '%اسبرسو%' OR name ILIKE '%espresso%')
  AND category_id NOT ILIKE '%espresso%';

UPDATE products SET
  category_id   = CASE WHEN category_id   NOT ILIKE '%decaf%'  THEN category_id   || ',decaf'  ELSE category_id   END,
  category_name = CASE WHEN category_name NOT ILIKE '%ديكاف%'  THEN category_name || ',ديكاف'  ELSE category_name END
WHERE (name ILIKE '%ديكاف%' OR name ILIKE '%decaf%')
  AND category_id NOT ILIKE '%decaf%';

UPDATE products SET
  category_id   = CASE WHEN category_id   NOT ILIKE '%instant-coffee%' THEN category_id   || ',instant-coffee' ELSE category_id   END,
  category_name = CASE WHEN category_name NOT ILIKE '%سريع%'           THEN category_name || ',سريعة'          ELSE category_name END
WHERE (name ILIKE '%نسكافيه%' OR name ILIKE '%نسكافيهيه%' OR name ILIKE '%instant%' OR name ILIKE '%سريع التحضير%')
  AND category_id NOT ILIKE '%instant-coffee%';

-- ──────────────────────────────────────────────────
-- 🚫🍬 DIETARY — غذائي
-- ──────────────────────────────────────────────────
UPDATE products SET
  category_id   = CASE WHEN category_id   NOT ILIKE '%free-sugar%' THEN category_id   || ',free-sugar' ELSE category_id   END,
  category_name = CASE WHEN category_name NOT ILIKE '%فري شوجر%'   THEN category_name || ',فري شوجر'   ELSE category_name END
WHERE (name ILIKE '%سكر فري%' OR name ILIKE '%فري شوجر%' OR name ILIKE '%بدون سكر%'
    OR name ILIKE '%ستيفيا%'  OR name ILIKE '%ستيفا%'   OR name ILIKE '%sugar free%')
  AND category_id NOT ILIKE '%free-sugar%';

UPDATE products SET
  category_id   = CASE WHEN category_id   NOT ILIKE '%free-gluten%' THEN category_id   || ',free-gluten' ELSE category_id   END,
  category_name = CASE WHEN category_name NOT ILIKE '%فري جلوتين%'  THEN category_name || ',فري جلوتين'  ELSE category_name END
WHERE (name ILIKE '%جلوتين%' OR name ILIKE '%فري جلوتين%' OR name ILIKE '%بدون جلوتين%' OR name ILIKE '%gluten%')
  AND category_id NOT ILIKE '%free-gluten%';

-- ──────────────────────────────────────────────────
-- 🍪 COOKIES / BISCUITS — بسكوت وكيك
-- ──────────────────────────────────────────────────
UPDATE products SET
  category_id   = CASE WHEN category_id   NOT ILIKE '%cookies%'  THEN category_id   || ',cookies'  ELSE category_id   END,
  category_name = CASE WHEN category_name NOT ILIKE '%بسكوت%'    THEN category_name || ',بسكوت'    ELSE category_name END
WHERE (name ILIKE '%بسكوت%' OR name ILIKE '%بسكويت%' OR name ILIKE '%بسكون%'
    OR name ILIKE '%كيك%'   OR name ILIKE '%كيكة%'   OR name ILIKE '%كعك%'
    OR name ILIKE '%كوكيز%' OR name ILIKE '%cookie%'  OR name ILIKE '%wafer%'
    OR name ILIKE '%ويفر%'  OR name ILIKE '%مقرمش%')
  AND category_id NOT ILIKE '%cookies%';

-- ──────────────────────────────────────────────────
-- 🍬 CANDY — حلوى
-- ──────────────────────────────────────────────────
UPDATE products SET
  category_id   = CASE WHEN category_id   NOT ILIKE '%candy%'   THEN category_id   || ',candy'   ELSE category_id   END,
  category_name = CASE WHEN category_name NOT ILIKE '%حلوى%'    THEN category_name || ',حلوى'    ELSE category_name END
WHERE (name ILIKE '%حلوى%'    OR name ILIKE '%كراميل%'   OR name ILIKE '%مارشملو%'
    OR name ILIKE '%توفي%'    OR name ILIKE '%بونبون%'   OR name ILIKE '%candy%'
    OR name ILIKE '%تافي%'    OR name ILIKE '%جيلي%'     OR name ILIKE '%جيلاتين%')
  AND category_id NOT ILIKE '%candy%';

-- ──────────────────────────────────────────────────
-- 🥨 SNACKS — سناكس
-- ──────────────────────────────────────────────────
UPDATE products SET
  category_id   = CASE WHEN category_id   NOT ILIKE '%snacks%'  THEN category_id   || ',snacks'  ELSE category_id   END,
  category_name = CASE WHEN category_name NOT ILIKE '%سناكس%'   THEN category_name || ',سناكس'   ELSE category_name END
WHERE (name ILIKE '%شيبس%'  OR name ILIKE '%chips%'  OR name ILIKE '%بذور%'
    OR name ILIKE '%بالغة%' OR name ILIKE '%سناك%'   OR name ILIKE '%snack%'
    OR name ILIKE '%مقرمشات%')
  AND category_id NOT ILIKE '%snacks%';

-- ──────────────────────────────────────────────────
-- 🧴 COSMETICS — مستحضرات
-- ──────────────────────────────────────────────────
UPDATE products SET
  category_id   = CASE WHEN category_id   NOT ILIKE '%skincare%' THEN category_id   || ',skincare' ELSE category_id   END,
  category_name = CASE WHEN category_name NOT ILIKE '%بشرة%'     THEN category_name || ',بشرة'     ELSE category_name END
WHERE (name ILIKE '%كريم%'  OR name ILIKE '%سيروم%'  OR name ILIKE '%لوشن%'
    OR name ILIKE '%مرطب%'  OR name ILIKE '%واقي%'   OR name ILIKE '%serum%'
    OR name ILIKE '%toner%' OR name ILIKE '%تونر%'   OR name ILIKE '%بشرة%')
  AND category_id NOT ILIKE '%skincare%';

UPDATE products SET
  category_id   = CASE WHEN category_id   NOT ILIKE '%haircare%' THEN category_id   || ',haircare' ELSE category_id   END,
  category_name = CASE WHEN category_name NOT ILIKE '%شعر%'      THEN category_name || ',شعر'      ELSE category_name END
WHERE (name ILIKE '%شامبو%' OR name ILIKE '%شعر%' OR name ILIKE '%بلسم%'
    OR name ILIKE '%shampoo%' OR name ILIKE '%hair%')
  AND category_id NOT ILIKE '%haircare%';

-- ──────────────────────────────────────────────────
-- 🎁 GIFTS — هدايا
-- ──────────────────────────────────────────────────
UPDATE products SET
  category_id   = CASE WHEN category_id   NOT ILIKE '%gifts%'   THEN category_id   || ',gifts'   ELSE category_id   END,
  category_name = CASE WHEN category_name NOT ILIKE '%هدايا%'   THEN category_name || ',هدايا'   ELSE category_name END
WHERE (name ILIKE '%هدية%' OR name ILIKE '%هدايا%' OR name ILIKE '%gift%'
    OR name ILIKE '%باكيج%' OR name ILIKE '%بوكس%'  OR name ILIKE '%تشكيلة%'
    OR name ILIKE '%مجموعة%' OR name ILIKE '%بوكيه%')
  AND category_id NOT ILIKE '%gifts%';

-- ──────────────────────────────────────────────────
-- ✅ VERIFY: Show updated products with multi-categories
-- ──────────────────────────────────────────────────
SELECT id, name, category_id, category_name
FROM products
WHERE category_id LIKE '%,%'
ORDER BY name
LIMIT 50;
