export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { accountCode, username, password, branchId } = req.body;

        if (!accountCode || !username || !password) {
            return res.status(400).json({ error: 'Missing credentials' });
        }

        // 1. Authenticate with Nard POS
        const authResponse = await fetch('https://production.nardpos.com/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'account-code': accountCode,
                'code': accountCode
            },
            body: JSON.stringify({
                username_code: username,
                password: password
            })
        });

        const authData = await authResponse.json();

        if (authData.error_code !== 0 || !authData.data || !authData.data.tokens) {
            return res.status(401).json({ 
                error: 'Authentication failed', 
                details: authData.error_message || 'Invalid credentials' 
            });
        }

        const token = authData.data.tokens.access_token;
        const targetBranch = branchId || 15; // Default to San Stefano (15)

        // 2. Fetch Stock Items
        // We fetch a large limit to get all items. If pagination is needed, we'll fetch page 1 for now.
        const stockUrl = `https://production.nardpos.com/stock-item?limit=500&page=1&branch_id=${targetBranch}`;
        
        const stockResponse = await fetch(stockUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'account-code': accountCode,
                'code': accountCode
            }
        });

        if (!stockResponse.ok) {
             return res.status(stockResponse.status).json({ 
                error: 'Failed to fetch stock items from Nard POS'
            });
        }

        const stockData = await stockResponse.json();

        // 3. Return the mapped data to the frontend
        res.status(200).json({ 
            success: true, 
            data: stockData.data || stockData, // Depending on actual API structure
            branchId: targetBranch
        });

    } catch (error) {
        console.error('Nard POS Sync Error:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
}
