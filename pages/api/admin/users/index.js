// ==========================================
// ADMIN USERS API
// ==========================================
import { createClient } from '@supabase/supabase-js';
import { requireAdminAPI } from '../../../../lib/apiAuth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return handleGet(req, res);
      case 'POST':
        return handlePost(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({
          success: false,
          error: `Method ${method} not allowed`
        });
    }
  } catch (error) {
    console.error('Admin Users API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

// GET - List all users (Super Admin only for full list, or Admin for limited?)
// The UI says "Manage admin and super admin accounts" and requires Super Admin to access the page.
async function handleGet(req, res) {
  const authUser = await requireAdminAPI(req, res);
  if (!authUser) return;

  // Additional check: helper function checks for 'admin' or 'super_admin'.
  // But the UI page pages/admin/users.js enforces 'super_admin'.
  // We should enforce strict security here too.
  if (authUser.role !== 'super_admin') {
    return res.status(403).json({
      error: 'Super Admin access required',
      code: 'FORBIDDEN'
    });
  }

  const { role, active, search } = req.query;

  let query = supabase
    .from('users')
    .select(`
      id,
      email,
      name,
      role,
      active,
      last_login,
      created_at,
      admin_profiles(department)
    `)
    .order('created_at', { ascending: false });

  if (role && role !== 'all') {
    query = query.eq('role', role);
  }

  if (active && active !== 'all') {
    query = query.eq('active', active === 'true');
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ success: false, error: error.message });
  }

  return res.status(200).json({ success: true, users: data });
}

// POST - Create new admin user
async function handlePost(req, res) {
  const authUser = await requireAdminAPI(req, res);
  if (!authUser) return;

  if (authUser.role !== 'super_admin') {
    return res.status(403).json({
      error: 'Super Admin access required',
      code: 'FORBIDDEN'
    });
  }

  const { name, email, role, department } = req.body;

  if (!email || !name || !role) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  // 1. Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.inviteUserByEmail(email);

  if (authError) {
    return res.status(400).json({ success: false, error: authError.message });
  }

  // 2. Update public.users table (trigger might handle insert, but we need to update role)
  // schema.sql usually has a trigger on auth.users -> public.users.
  // We need to update the role and name.

  const authUserId = authData.user.id;

  // 2. Wait for trigger to create public.users record
  // The database trigger 'on_auth_user_created' runs asynchronously. 
  // We need to wait for it to complete before we can update the role.
  const waitForUser = async (retries = 5, delay = 500) => {
    for (let i = 0; i < retries; i++) {
      const { data } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('auth_id', authUserId)
        .single();

      if (data) return data;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    return null;
  };

  const userRecord = await waitForUser();

  if (!userRecord) {
    // Fallback: If trigger failed, manually insert the user
    // This covers the race condition where the trigger completely fails
    const { error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        auth_id: authUserId,
        email,
        name,
        role,
        active: true
      });

    if (insertError) {
      return res.status(500).json({ success: false, error: 'Failed to create user profile: ' + insertError.message });
    }
  } else {
    // User exists, update role and details
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        name,
        role, // 'admin' or 'super_admin'
        active: true
      })
      .eq('auth_id', authUserId);

    if (updateError) {
      return res.status(500).json({ success: false, error: 'Failed to update user profile: ' + updateError.message });
    }
  }

  // Get the public user ID for profile creation
  // We need to fetch it again to be sure (or use the one from waitForUser/insert)
  const { data: finalUser } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('auth_id', authUserId)
    .single();

  const publicUserId = finalUser?.id;

  // 3. Create admin profile if department is provided
  if (department && publicUserId) {
    const { error: profileError } = await supabaseAdmin
      .from('admin_profiles')
      .upsert({
        user_id: publicUserId,
        department
      }, {
        onConflict: 'user_id'
      });

    if (profileError) {
      console.warn('Failed to create admin profile:', profileError);
    }
  }



  return res.status(201).json({ success: true, message: 'User invited successfully' });
}
