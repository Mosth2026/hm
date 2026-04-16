
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n');
const envVars = {};
envLines.forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL || 'https://yacjvrfwcahjqqbuiyxy.supabase.co';
const supabaseKey = envVars.VITE_SUPABASE_SERVICE_ROLE_KEY || envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncCategories() {
  console.log("🚀 Starting Category Synchronization...");

  // 1. Add columns if they don't exist (This might fail if using Anon Key, but we try)
  // Note: Standard Supabase client doesn't support ALTER TABLE easily, so we assume the user might have run the SQL.
  // We will first try to UPSERT the categories.

  const categories = [
    // Main Categories
    { id: 'chocolate', label: 'الشوكولاتة', icon: '🍫', parent_id: null, index: 1 },
    { id: 'coffee', label: 'القهوة', icon: '☕', parent_id: null, index: 2 },
    { id: 'dietary', label: 'الدايت والصحة', icon: '🌱', parent_id: null, index: 3 },
    { id: 'cookies', label: 'الكوكيز', icon: '🍪', parent_id: null, index: 4 },
    { id: 'snacks', label: 'الاسناكس', icon: '🥨', parent_id: null, index: 5 },
    { id: 'candy', label: 'الكاندي', icon: '🍬', parent_id: null, index: 6 },
    { id: 'cosmetics', label: 'لمسات الجمال', icon: '💄', parent_id: null, index: 7 },
    { id: 'gifts', label: 'بوكسات الهدايا', icon: '🎁', parent_id: null, index: 8 },

    // Chocolate Subcategories
    { id: 'milk-chocolate', label: 'ميلك', icon: '🥛', parent_id: 'chocolate', index: 1 },
    { id: 'dark-chocolate', label: 'دارك', icon: '🌑', parent_id: 'chocolate', index: 2 },
    { id: 'white-chocolate', label: 'وايت', icon: '☁️', parent_id: 'chocolate', index: 3 },
    { id: 'stevia-chocolate', label: 'ستيفيا', icon: '🌿', parent_id: 'chocolate', index: 4 },
    { id: 'kunafa-chocolate', label: 'كنافة', icon: '🧁', parent_id: 'chocolate', index: 5 },
    { id: 'nuts-chocolate', label: 'مكسرات', icon: '🥜', parent_id: 'chocolate', index: 6 },

    // Milk Chocolate Sub-subcategories
    { id: 'milk-fruits', label: 'فواكه', icon: '🍓', parent_id: 'milk-chocolate', index: 1 },
    { id: 'milk-nuts', label: 'مكسرات', icon: '🥜', parent_id: 'milk-chocolate', index: 2 },
    { id: 'milk-fruits-nuts', label: 'فواكه ومكسرات', icon: '🍓🥜', parent_id: 'milk-chocolate', index: 3 },

    // Coffee Subcategories
    { id: 'instant-coffee', label: 'سريعة التحضير', icon: '⚡', parent_id: 'coffee', index: 1 },
    { id: 'turkish-coffee', label: 'قهوة تركية', icon: '🫖', parent_id: 'coffee', index: 2 },
    { id: 'espresso', label: 'اسبريسو', icon: '☕', parent_id: 'coffee', index: 3 },
    { id: 'decaf', label: 'ديكاف', icon: '💤', parent_id: 'coffee', index: 4 },

    // Dietary Subcategories
    { id: 'free-sugar', label: 'فري شوجر', icon: '🚫🍬', parent_id: 'dietary', index: 1 },
    { id: 'free-gluten', label: 'فري جلوتين', icon: '🌾❌', parent_id: 'dietary', index: 2 },

    // Cosmetics Subcategories
    { id: 'skincare', label: 'العناية بالبشرة', icon: '🧴', parent_id: 'cosmetics', index: 1 },
    { id: 'haircare', label: 'العناية بالشعر', icon: '💇', parent_id: 'cosmetics', index: 2 },
    { id: 'car', label: 'السيارة', icon: '🚗', parent_id: 'cosmetics', index: 3 }
  ];

  for (const cat of categories) {
    const { error } = await supabase.from('categories').upsert(cat, { onConflict: 'id' });
    if (error) {
      console.error(`❌ Error syncing category ${cat.label}:`, error.message);
      if (error.message.includes('column "parent_id" does not exist')) {
          console.error("⚠️  Please run the SQL in supabase-schema.sql FIRST to add columns!");
          process.exit(1);
      }
    } else {
      console.log(`✅ Synced: ${cat.label}`);
    }
  }

  console.log("✨ All categories synced successfully!");
}

syncCategories();
