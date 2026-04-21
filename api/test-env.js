// api/test-env.js
// 🏛️ CONSTITUTION: This endpoint MUST NOT leak environment variable names or values
// It is restricted to simple health-check status only.

export default function handler(req, res) {
    // Only allow GET for health check
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Return only boolean status, never actual keys or values
    res.status(200).json({
        status: 'ok',
        supabase_configured: !!(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL),
        timestamp: new Date().toISOString()
    });
}
