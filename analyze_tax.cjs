
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://yacjvrfwcahjqqbuiyxy.supabase.co',
    'sb_publishable_4OzSamMwsyetZNRWd4uNkA_D0135lxS'
);

async function analyzeProducts() {
    const { data, error } = await supabase.from('products').select('*');
    if (error) {
        console.error(error);
        return;
    }

    console.log(`Total products: ${data.length}`);

    const potentialTaxed = data.filter(p => {
        // Check if price / 1.14 is an integer or very close to it
        const original = p.price / 1.14;
        const diff = Math.abs(original - Math.round(original));
        return diff < 0.01;
    });

    console.log(`Potential taxed products (ending in .14): ${potentialTaxed.length}`);

    potentialTaxed.forEach(p => {
        console.log(`- ${p.name} (ID: ${p.id}): Price: ${p.price}, Original?: ${Math.round(p.price / 1.14)}, Category: ${p.category_name}`);
    });

    // Also check by category
    const categories = [...new Set(data.map(p => p.category_name))];
    categories.forEach(cat => {
        const catProducts = data.filter(p => p.category_name === cat);
        const taxedInCat = catProducts.filter(p => {
            const original = p.price / 1.14;
            const diff = Math.abs(original - Math.round(original));
            return diff < 0.01;
        });
        console.log(`Category: ${cat} - ${taxedInCat.length}/${catProducts.length} appear taxed.`);
    });
}

analyzeProducts();
