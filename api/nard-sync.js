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

        const graphqlPayload = {
            query: `query Items($checkpoint: CheckpointInput!) {
              items(checkpoint: $checkpoint) {
                documents {
                  id
                  name
                  barcodes { barcode branch_id }
                  stocks { sale_price cost_price quantity branch_id }
                  main_item { category { name name_ar } }
                  _deleted
                }
              }
            }`,
            operationName: "Items",
            variables: {
                checkpoint: {
                    id: 0,
                    updated_at: "0",
                    batch_size: 2000,
                    branch_id: targetBranch
                }
            }
        };

        const stockResponse = await fetch('https://production.nardpos.com/sync', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'account-code': accountCode,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(graphqlPayload)
        });

        if (!stockResponse.ok) {
             return res.status(stockResponse.status).json({ 
                error: 'Failed to fetch stock items from Nard POS'
            });
        }

        const stockData = await stockResponse.json();
        
        if (stockData.errors) {
            return res.status(400).json({ error: 'GraphQL Error', details: stockData.errors });
        }

        const docs = stockData?.data?.items?.documents || [];
        const mappedItems = docs.filter(d => !d._deleted).map(item => {
            const stockInfo = item.stocks?.find(s => s.branch_id === targetBranch) || item.stocks?.[0] || {};
            const barcodeInfo = item.barcodes?.find(b => b.branch_id === targetBranch) || item.barcodes?.[0] || {};
            return {
                name: item.name,
                barcode: barcodeInfo.barcode || '',
                price: stockInfo.sale_price || 0,
                cost_price: stockInfo.cost_price || 0,
                quantity: stockInfo.quantity || 0,
                category_name: item.main_item?.category?.name || item.main_item?.category?.name_ar || ''
            };
        });

        // 3. Return the mapped data to the frontend
        res.status(200).json({ 
            success: true, 
            data: mappedItems,
            branchId: targetBranch
        });

    } catch (error) {
        console.error('Nard POS Sync Error:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
}
