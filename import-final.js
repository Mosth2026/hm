
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'https://yacjvrfwcahjqqbuiyxy.supabase.co';
const supabaseAnonKey = 'sb_publishable_4OzSamMwsyetZNRWd4uNkA_D0135lxS';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
    console.log('--- Start Final Import (With Stock & Full Price) ---');
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

    console.log('Indices:', { nameIndex, priceIndex, barcodeIndex, quantityIndex });

    const productsToInsert = [];
    const TAX_MULTIPLIER = 1.14;

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const cols = lines[i].split(';');

        const name = cols[nameIndex] || '';
        const originalPrice = parseFloat(cols[priceIndex]) || 0;
        const barcode = cols[barcodeIndex] || '';
        const quantity = parseInt(cols[quantityIndex]) || 0; // READ QUANTITY

        if (!name || name === 'name_ar') continue;

        const newPrice = Number((originalPrice * TAX_MULTIPLIER).toFixed(2));

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
        }

        productsToInsert.push({
            name: name.trim(),
            price: newPrice,
            stock: quantity, // ADD STOCK TO INSERT
            image: `https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80`,
            description: `باركود: ${barcode}`,
            category_id: categoryId,
            category_name: categoryId === 'chocolate' ? 'الشوكولاتة' :
                categoryId === 'coffee' ? 'القهوة' :
                    categoryId === 'cookies' ? 'الكوكيز' :
                        categoryId === 'candy' ? 'الكاندي' : 'الاسناكس',
            is_featured: (quantity > 0 && productsToInsert.length < 500),
            is_new: false,
            is_on_sale: false,
            discount: 0
        });
    }

    console.log(`Parsed ${productsToInsert.length} total products. Updating database...`);

    // Check if column exists, if not we can't do much from here but log it
    // Wipe and re-import
    await supabase.from('products').delete().neq('id', 0);

    const CHUNK_SIZE = 50;
    for (let i = 0; i < productsToInsert.length; i += CHUNK_SIZE) {
        const chunk = productsToInsert.slice(i, i + CHUNK_SIZE);
        const { error: insError } = await supabase.from('products').insert(chunk);
        if (insError) {
            // If stock column is missing, it will error here
            if (insError.message.includes('column "stock" of relation "products" does not exist')) {
                console.error("\nCRITICAL: The 'stock' column is missing in Supabase! Please add it first.");
                return;
            }
            console.error(`\nError at ${i}:`, insError.message);
        } else {
            process.stdout.write(`\rProgress: ${i + chunk.length} / ${productsToInsert.length}`);
        }
    }
    console.log('\nImporting with stock completed!');
}

run();
