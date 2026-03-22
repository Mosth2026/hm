import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://yacjvrfwcahjqqbuiyxy.supabase.co";
const supabaseKey = "sb_publishable_4OzSamMwsyetZNRWd4uNkA_D0135lxS";

const supabase = createClient(supabaseUrl, supabaseKey);

async function listActions() {
    console.log("Fetching unique actions from admin_logs...");
    const { data: logs, error } = await supabase
        .from('admin_logs')
        .select('action')
        .limit(100);

    if (error) {
        console.error("Error fetching logs:", error);
        return;
    }

    const actions = [...new Set(logs.map(l => l.action))];
    console.log("Available Actions:", actions);
    
    // Also check total count
    const { count } = await supabase
        .from('admin_logs')
        .select('*', { count: 'exact', head: true });
    console.log("Total Logs in Table:", count);
}

listActions();
