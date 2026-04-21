import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SERVICE_ROLE_KEY) {
        return res.status(500).json({ error: 'Service role key not configured on server' });
    }

    // Create admin client with service role key (full permissions)
    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false }
    });

    // Verify the caller is an authenticated owner
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        // Verify caller's token
        const token = authHeader.replace('Bearer ', '');
        const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(token);
        
        if (authError || !caller) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        // Check caller is owner
        const { data: callerRole } = await supabaseAdmin
            .from('user_roles')
            .select('role')
            .eq('user_id', caller.id)
            .single();

        if (!callerRole || callerRole.role !== 'owner') {
            return res.status(403).json({ error: 'Only owners can create users' });
        }

        // Extract new user data from request body
        const { email, password, display_name, phone, role, branch_id, custom_permissions } = req.body;

        if (!email || !password || !display_name) {
            return res.status(400).json({ error: 'Missing required fields: email, password, display_name' });
        }

        // Create user via Admin API (bypasses email confirmation)
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true, // Auto-confirm, no verification email needed
            user_metadata: { username: display_name }
        });

        if (createError) {
            return res.status(400).json({ error: createError.message });
        }

        // Insert role into user_roles table
        const { error: roleError } = await supabaseAdmin.from('user_roles').upsert({
            user_id: newUser.user.id,
            role: role || 'employee',
            branch_id: branch_id ? Number(branch_id) : null,
            display_name: display_name,
            phone: phone || null,
            custom_permissions: custom_permissions || []
        }, { onConflict: 'user_id' });

        if (roleError) {
            // Cleanup: delete the auth user if role insertion fails
            await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
            return res.status(500).json({ error: 'Failed to assign role: ' + roleError.message });
        }

        return res.status(200).json({ 
            success: true, 
            user_id: newUser.user.id,
            message: `User ${display_name} created successfully`
        });

    } catch (error) {
        console.error('Create user error:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}
