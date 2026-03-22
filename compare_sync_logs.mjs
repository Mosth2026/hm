import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://yacjvrfwcahjqqbuiyxy.supabase.co";
const supabaseKey = "sb_publishable_4OzSamMwsyetZNRWd4uNkA_D0135lxS";

const supabase = createClient(supabaseUrl, supabaseKey);

async function compareLogs() {
    console.log("Fetching last two Excel sync summaries...");
    const { data: logs, error } = await supabase
        .from('admin_logs')
        .select('*')
        .eq('action', 'excel_sync_summary')
        .order('created_at', { ascending: false })
        .limit(2);

    if (error) {
        console.error("Error fetching logs:", error);
        return;
    }

    if (!logs || logs.length < 2) {
        console.log(`Found ${logs ? logs.length : 0} sync summaries. Cannot compare.`);
        if (logs && logs.length === 1) {
            console.log("Latest Log Details:", JSON.stringify(logs[0].details, null, 2));
        }
        return;
    }

    const latest = logs[0];
    const previous = logs[1];

    console.log(`\nLatest Log (ID: ${latest.id}, Created At: ${latest.created_at})`);
    console.log(`Previous Log (ID: ${previous.id}, Created At: ${previous.created_at})`);

    const lDetails = latest.details;
    const pDetails = previous.details;

    console.log("\nComparison Statistics:");
    console.log("-----------------------");
    
    const salesValueDiff = (lDetails.sales_value || 0) - (pDetails.sales_value || 0);
    const salesCountDiff = (lDetails.sales_count || 0) - (pDetails.sales_count || 0);
    
    console.log(`Sales Value: Latest=${lDetails.sales_value.toLocaleString()}, Previous=${pDetails.sales_value.toLocaleString()}, Diff=${salesValueDiff.toFixed(2)}`);
    console.log(`Sales Items: Latest=${lDetails.sales_count}, Previous=${pDetails.sales_count}, Diff=${salesCountDiff}`);

    if (lDetails.sales_quantities && pDetails.sales_quantities) {
        console.log("\nItems with Quantity Differences (Sales Changes):");
        const allIds = new Set([...Object.keys(lDetails.sales_quantities), ...Object.keys(pDetails.sales_quantities)]);
        
        let changed = 0;
        allIds.forEach(id => {
            const lQty = lDetails.sales_quantities[id] || 0;
            const pQty = pDetails.sales_quantities[id] || 0;
            if (lQty !== pQty) {
                console.log(`Product ID ${id}: Qty Now=${lQty}, Qty Previously=${pQty}, Change=${lQty - pQty}`);
                changed++;
            }
        });
        if (changed === 0) console.log("No specific item differences found in sales quantities.");
    }
}

compareLogs();
