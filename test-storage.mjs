import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Read .env.local manually
let supabaseUrl = '';
let supabaseKey = '';

try {
    const envContent = readFileSync('.env.local', 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            if (key.trim() === 'VITE_SUPABASE_URL') supabaseUrl = value.trim();
            if (key.trim() === 'VITE_SUPABASE_ANON_KEY') supabaseKey = value.trim();
        }
    });
} catch (e) {
    console.error('Error reading .env.local:', e.message);
}

if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase credentials not found in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testStorage() {
    console.log('Testing Supabase Connection...');
    console.log('URL:', supabaseUrl);

    try {
        const { data: buckets, error } = await supabase.storage.listBuckets();

        if (error) {
            console.error('Storage Error:', error.message);
            return;
        }

        console.log('Available Buckets:', buckets.map(b => b.name));

        const productsBucket = buckets.find(b => b.name === 'products');
        if (!productsBucket) {
            console.log('WARNING: "products" bucket NOT found!');
        } else {
            console.log('SUCCESS: "products" bucket exists.');

            // Try to list files in the bucket
            const { data: files, error: filesError } = await supabase.storage.from('products').list('product-images');
            if (filesError) {
                console.error('Error listing files in "products" bucket:', filesError.message);
            } else {
                console.log(`Found ${files.length} files in "product-images" folder.`);
            }
        }
    } catch (err) {
        console.error('Unexpected Error:', err.message);
    }
}

testStorage();
