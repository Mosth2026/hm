
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://yacjvrfwcahjqqbuiyxy.supabase.co',
    'sb_publishable_4OzSamMwsyetZNRWd4uNkA_D0135lxS'
);

async function findMistakes() {
    const { data, error } = await supabase.from('products').select('*');
    if (error) return;

    const mistakes = data.filter(p => {
        const original = p.price / 1.14;
        const diff = Math.abs(original - Math.round(original));
        // If it's a very clean round number after dividing by 1.14, it was likely increased by 14%
        return diff < 0.001;
    });

    console.log(`Found ${mistakes.length} products with a 14% multiplier pattern.`);

    // Categorize them
    const byCat = {};
    mistakes.forEach(p => {
        if (!byCat[p.category_name]) byCat[p.category_name] = [];
        byCat[p.category_name].push(p.name);
    });

    for (const cat in byCat) {
        console.log(`\n### ${cat}:`);
        byCat[cat].forEach(name => console.log(`- ${name}`));
    }
}

findMistakes();
