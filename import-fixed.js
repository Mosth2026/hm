
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://yacjvrfwcahjqqbuiyxy.supabase.co';
const supabaseAnonKey = 'sb_publishable_4OzSamMwsyetZNRWd4uNkA_D0135lxS';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
    console.log('--- Start Smart Import (Fixed Arabic) ---');
    const fileName = 'products_utf8.csv';
    if (!fs.existsSync(fileName)) {
        console.error(`File ${fileName} not found!`);
        return;
    }

    let csvContent = fs.readFileSync(fileName, 'utf8');
    // Remove BOM if exists
    if (csvContent.charCodeAt(0) === 0xFEFF) {
        csvContent = csvContent.slice(1);
    }

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
        const n = name; // Arabic names are now correct

        // Smart Keywords categorization
        if (n.includes('شوكولاتة') || n.includes('شوكولاته') || n.includes('نوتيلا') || n.includes('كاكاو') || n.includes('فيريرو') || n.includes('جالكسي')) {
            categoryId = 'chocolate';
        } else if (n.includes('قهوة') || n.includes('قهوه') || n.includes('بن ') || n.includes('نسكافيه') || n.includes('اسبريسو')) {
            categoryId = 'coffee';
        } else if (n.includes('كوكيز') || n.includes('بسكويت') || n.includes('بسكوت') || n.includes('اوريو') || n.includes('لوتس')) {
            categoryId = 'cookies';
        } else if (n.includes('كاندي') || n.includes('جيلي') || n.includes('لبان') || n.includes('مصاص') || n.includes('مارشميلو')) {
            categoryId = 'candy';
        } else if (n.includes('شيبس') || n.includes('سناكس') || n.includes('مقرمشات') || n.includes('فشار') || n.includes('لب ')) {
            categoryId = 'snacks';
        } else if (n.includes('فستق') || n.includes('بندق') || n.includes('لوز') || n.includes('كاجو') || n.includes('مكسرات')) {
            categoryId = 'snacks'; // Nuts often go with snacks unless you want a "Nuts" category
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

    // Distribute featured products
    ['chocolate', 'coffee', 'cookies', 'candy', 'snacks'].forEach(cat => {
        const items = productsToInsert.filter(p => p.category_id === cat && p.price > 0).slice(0, 10);
        items.forEach(item => item.is_featured = true);
    });

    console.log(`Parsed ${productsToInsert.length} products with correct Arabic encoding.`);
    console.log('Cleaning up existing products...');
    await supabase.from('products').delete().neq('id', 0);

    const activeProducts = productsToInsert.filter(p => p.price > 0);
    console.log(`Importing all ${activeProducts.length} active products...`);

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
    console.log('\nImport completed successfully!');

    // Final check for distribution
    const counts = {};
    activeProducts.forEach(p => counts[p.category_id] = (counts[p.category_id] || 0) + 1);
    console.log('Distribution:', counts);
}

run();
