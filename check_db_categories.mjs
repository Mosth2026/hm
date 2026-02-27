
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Try to find .env file
const envContent = fs.readFileSync('c:/Users/El3atty/Desktop/62025/saade-makers-store-final-fixed/.env.local', 'utf8');
const env = Object.fromEntries(
    envContent.split('\n')
        .filter(l => l.includes('='))
        .map(l => {
            const parts = l.split('=');
            return [parts[0].trim(), parts[1].trim().replace(/^["'](.+)["']$/, '$1')];
        })
);

const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseKey = env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCategories() {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) {
        console.error('Error fetching categories:', error);
    } else {
        console.log('Categories in DB:');
        console.table(data);
    }
}

checkCategories();
