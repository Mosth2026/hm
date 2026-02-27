
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://yacjvrfwcahjqqbuiyxy.supabase.co';
const supabaseAnonKey = 'sb_publishable_4OzSamMwsyetZNRWd4uNkA_D0135lxS';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
    console.log('--- Start Smart Import ---');
    if (!fs.existsSync('products_utf8.csv')) {
        console.error('File products_utf8.csv not found!');
        return;
    }
    const csvContent = fs.readFileSync('products_utf8.csv', 'utf8');
    const lines = csvContent.split('\n');
    const header = lines[0].trim().split(';');

    const nameIndex = header.indexOf('name_ar');
    const priceIndex = header.indexOf('sale_price');
    const barcodeIndex = header.indexOf('barcode');

    const productsToInsert = [];

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const cols = lines[i].split(';');

        const name = cols[nameIndex] || '';
        const price = parseFloat(cols[priceIndex]) || 0;
        const barcode = cols[barcodeIndex] || '';

        if (!name || name === 'name_ar') continue;

        let categoryId = 'snacks';
        const n = name.toLowerCase();

        // Better Keyword Mapping
        if (n.includes('شوكولاتة') || n.includes('شوكولاته') || n.includes('chocolate') || n.includes('نوتيلا') || n.includes('كاكاو')) {
            categoryId = 'chocolate';
        } else if (n.includes('قهوة') || n.includes('قهوه') || n.includes('coffee') || n.includes('بن ') || n.includes('نسكافيه')) {
            categoryId = 'coffee';
        } else if (n.includes('كوكيز') || n.includes('بسكويت') || n.includes('بسكوت') || n.includes('cookies') || n.includes('اوريو')) {
            categoryId = 'cookies';
        } else if (n.includes('كاندي') || n.includes('candy') || n.includes('جيلي') || n.includes('لبان') || n.includes('مصاص')) {
            categoryId = 'candy';
        } else if (n.includes('شيبس') || n.includes('كراتيه') || n.includes('سناكس') || n.includes('مقرمشات') || n.includes('شيبسي')) {
            categoryId = 'snacks';
        }

        productsToInsert.push({
            name: name.trim(),
            price: price,
            image: `https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80`,
            description: `باركود: ${barcode}`,
            category_id: categoryId,
            category_name: categoryId === 'chocolate' ? 'الشوكولاتة' :
                categoryId === 'coffee' ? 'القهوة' :
                    categoryId === 'cookies' ? 'الكوكيز' :
                        categoryId === 'candy' ? 'الكاندي' : 'الاسناكس',
            is_featured: false,
            is_new: false,
            is_on_sale: false,
            discount: 0
        });
    }

    // Sort to make sure we get a variety of featured products
    const featuredPool = [];
    ['chocolate', 'coffee', 'cookies', 'candy', 'snacks'].forEach(cat => {
        const items = productsToInsert.filter(p => p.category_id === cat && p.price > 0).slice(0, 5);
        items.forEach(item => item.is_featured = true);
        featuredPool.push(...items);
    });

    console.log(`Parsed ${productsToInsert.length} products.`);
    console.log('Cleaning up existing products...');
    await supabase.from('products').delete().neq('id', 0);

    const activeProducts = productsToInsert.filter(p => p.price > 0).slice(0, 600);
    console.log(`Importing ${activeProducts.length} categorized products...`);

    const CHUNK_SIZE = 50;
    for (let i = 0; i < activeProducts.length; i += CHUNK_SIZE) {
        const chunk = activeProducts.slice(i, i + CHUNK_SIZE);
        const { error: insError } = await supabase.from('products').insert(chunk);
        if (insError) {
            console.error(`\nError at ${i}:`, insError.message);
        } else {
            process.stdout.write(`\rProgress: ${i + chunk.length} / ${activeProducts.length}`);
        }
    }
    console.log('\nImport completed successfully.');
}

run();
