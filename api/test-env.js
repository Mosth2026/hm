export default function handler(req, res) {
    res.status(200).json({
        supa_url: !!process.env.SUPABASE_URL,
        vite_supa_url: !!process.env.VITE_SUPABASE_URL,
        supa_key: !!process.env.SUPABASE_KEY,
        supa_service_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        vite_supa_service_key: !!process.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
        all_keys: Object.keys(process.env).filter(k => k.includes('SUPA') || k.includes('VITE'))
    });
}
