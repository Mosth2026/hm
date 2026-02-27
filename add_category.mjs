
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
const supabaseKey = env.VITE_SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function addCategory() {
    console.log('Adding no-tax category...');
    const { data, error } = await supabase.from('categories').insert([
        { id: 'no-tax', label: 'بدون ضريبة' }
    ]);
    
    if (error) {
        console.error('Error adding category:', error);
    } else {
        console.log('Category added successfully:', data);
    }
}

addCategory();
