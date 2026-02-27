
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://yacjvrfwcahjqqbuiyxy.supabase.co',
    'sb_publishable_4OzSamMwsyetZNRWd4uNkA_D0135lxS'
);

async function checkColumns() {
    const { data, error } = await supabase.from('products').select('*').limit(1);
    if (data && data[0]) {
        console.log(Object.keys(data[0]));
    }
}

checkColumns();
