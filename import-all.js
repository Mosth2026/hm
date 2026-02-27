
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://yacjvrfwcahjqqbuiyxy.supabase.co';
const supabaseAnonKey = 'sb_publishable_4OzSamMwsyetZNRWd4uNkA_D0135lxS';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
    console.log('--- Start All Products Import ---');
    const fileName = 'products_utf8.csv';
    if (!fs.existsSync(fileName)) {
        console.error(`File ${fileName} not found!`);
        return;
    }

    let csvContent = fs.readFileSync(fileName, 'utf8');
    if (csvContent.charCodeAt(0) === 0xFEFF) {
        csvContent = csvContent.slice(1);
    }

    const lines = csvContent.split('\n');
    const header = lines[0].trim().split(';');

    const nameIndex = header.indexOf('name_ar');
    const priceIndex = header.indexOf('sale_price');
    const barcodeIndex = header.indexOf('barcode');
    const quantityIndex = header.indexOf('total_quantity');

    const productsToInsert = [];

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const cols = lines[i].split(';');

        const name = cols[nameIndex] || '';
        const price = parseFloat(cols[priceIndex]) || 0;
        const barcode = cols[barcodeIndex] || '';

        if (!name || name === 'name_ar') continue;

        let categoryId = 'snacks';
        const n = name;

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

    // Mark items with stock > 0 as featured to make sure they show up prominently
    // But since we don't have stock column, let's just make the first 500 products featured
    // to ensure the homepage isn't empty if the first batch happened to be zero price
    for (let i = 0; i < Math.min(500, productsToInsert.length); i++) {
        productsToInsert[i].is_featured = true;
    }

    console.log(`Parsed ${productsToInsert.length} total products.`);
    console.log('Cleaning up existing products...');
    await supabase.from('products').delete().neq('id', 0);

    // This time we import EVERYTHING, even price 0, just to be sure
    console.log(`Importing ALL ${productsToInsert.length} products...`);

    const CHUNK_SIZE = 50;
    for (let i = 0; i < productsToInsert.length; i += CHUNK_SIZE) {
        const chunk = productsToInsert.slice(i, i + CHUNK_SIZE);
        const { error: insError } = await supabase.from('products').insert(chunk);
        if (insError) {
            console.error(`\nError at ${i}:`, insError.message);
        } else {
            process.stdout.write(`\rProgress: ${i + chunk.length} / ${productsToInsert.length}`);
        }
    }
    console.log('\nImporting everything completed!');
}

run();
