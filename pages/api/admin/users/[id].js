import { requireSuperAdminAPI } from '../../../../lib/apiAuth';
import { supabase } from '../../../../lib/supabase'; // Keep for non-admin ops if any, or remove if unused. Actually audit logs might be fine with public if permissive, but better safe.
import { createClient } from '@supabase/supabase-js';

// Create Supabase admin client for user management and RLS bypass
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    return handleGet(req, res, id);
  }

  if (req.method === 'PUT') {
    return handlePut(req, res, id);
  }

  if (req.method === 'DELETE') {
    return handleDelete(req, res, id);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

/**
 * GET /api/admin/users/:id
 * Get a specific admin user (super_admin only)
 */
async function handleGet(req, res, id) {
  try {
    const user = await requireSuperAdminAPI(req, res);
    if (!user) return;

    // Use supabaseAdmin to bypass RLS
    const { data: targetUser, error } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        email,
        name,
        role,
        active,
        created_at,
        updated_at,
        admin_profiles (
          department,
          permissions
        )
      `)
      .eq('id', id)
      //.in('role', ['admin', 'super_admin']) // Optional constraint, but admin should see any user? UI says "admin user".
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ user: targetUser });
  } catch (error) {
    console.error('Error in GET /api/admin/users/:id:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * PUT /api/admin/users/:id
 * Update an admin user (super_admin only)
 */
async function handlePut(req, res, id) {
  try {
    const user = await requireSuperAdminAPI(req, res);
    if (!user) return;

    const { name, role, active, department, password } = req.body;

    // Get the target user first
    const { data: targetUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('id, email, role, auth_id')
      .eq('id', id)
      .single();

    if (fetchError || !targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent super admin from removing their own super admin role
    if (targetUser.id === user.id && role && role !== 'super_admin') {
      return res.status(400).json({
        error: 'You cannot remove your own super admin role',
      });
    }

    // Prevent super admin from deactivating themselves
    if (targetUser.id === user.id && active === false) {
      return res.status(400).json({
        error: 'You cannot deactivate your own account',
      });
    }

    // Validate role if provided
    if (role && !['admin', 'super_admin'].includes(role)) {
      return res.status(400).json({
        error: 'Invalid role. Must be "admin" or "super_admin"',
      });
    }

    // Build update object for users table
    const userUpdates = {};
    if (name !== undefined) userUpdates.name = name;
    if (role !== undefined) userUpdates.role = role;
    if (active !== undefined) userUpdates.active = active;
    userUpdates.updated_at = new Date().toISOString();

    // Update user record
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update(userUpdates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating user:', updateError);
      return res.status(500).json({ error: 'Failed to update user' });
    }

    // Update admin profile if department provided
    if (department !== undefined) {
      const { error: profileError } = await supabaseAdmin
        .from('admin_profiles')
        .update({ department, updated_at: new Date().toISOString() })
        .eq('user_id', id);

      if (profileError) {
        // Try insert if update failed (might not exist)
        const { error: insertError } = await supabaseAdmin
          .from('admin_profiles')
          .insert({ user_id: id, department });

        if (insertError) {
          console.error('Error updating/creating admin profile:', profileError);
        }
      }
    }

    // Update password if provided
    if (password) {
      if (password.length < 8) {
        return res.status(400).json({
          error: 'Password must be at least 8 characters long',
        });
      }

      const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(
        targetUser.auth_id,
        { password }
      );

      if (passwordError) {
        console.error('Error updating password:', passwordError);
        return res.status(500).json({ error: 'Failed to update password' });
      }
    }

    // Log the action in audit_logs
    await supabaseAdmin.from('audit_logs').insert({
      user_id: user.id,
      action: 'update_admin_user',
      resource_type: 'user',
      resource_id: id,
      changes: { // Changed from 'details' to 'changes' to match schema
        updated_fields: Object.keys(userUpdates),
        target_user_email: targetUser.email,
        password_changed: !!password,
      },
    });

    return res.status(200).json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error in PUT /api/admin/users/:id:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * DELETE /api/admin/users/:id
 * Deactivate or permanently delete an admin user (super_admin only)
 * - Without ?permanent=true: Soft delete (sets active to false)
 * - With ?permanent=true: Hard delete (removes from database and auth)
 */
async function handleDelete(req, res, id) {
  try {
    const user = await requireSuperAdminAPI(req, res);
    if (!user) return;

    const { permanent } = req.query;
    const isPermanentDelete = permanent === 'true';

    // Get the target user first
    const { data: targetUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('id, email, role, auth_id, active')
      .eq('id', id)
      .single();

    if (fetchError || !targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent super admin from deleting themselves
    if (targetUser.id === user.id) {
      return res.status(400).json({
        error: isPermanentDelete
          ? 'You cannot delete your own account'
          : 'You cannot deactivate your own account',
      });
    }

    // For permanent delete, only allow if user is already inactive
    if (isPermanentDelete && targetUser.active) {
      return res.status(400).json({
        error: 'User must be deactivated before permanent deletion. Please deactivate first.',
      });
    }

    if (isPermanentDelete) {
      // PERMANENT DELETE - Remove from database and auth

      // Delete from admin_profiles first (foreign key constraint)
      const { error: profileDeleteError } = await supabaseAdmin
        .from('admin_profiles')
        .delete()
        .eq('user_id', id);

      if (profileDeleteError) {
        console.error('Error deleting admin profile:', profileDeleteError);
        // Continue anyway - profile might not exist
      }

      // Delete from users table
      const { error: userDeleteError } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', id);

      if (userDeleteError) {
        console.error('Error deleting user from database:', userDeleteError);
        return res.status(500).json({ error: 'Failed to delete user from database' });
      }

      // Delete from Supabase Auth
      if (targetUser.auth_id) {
        const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(
          targetUser.auth_id
        );

        if (authDeleteError) {
          console.error('Error deleting user from auth:', authDeleteError);
          // Continue anyway - user might have been deleted already
        }
      }

      // Log the action in audit_logs
      await supabaseAdmin.from('audit_logs').insert({
        user_id: user.id,
        action: 'permanently_delete_admin_user',
        resource_type: 'user',
        resource_id: id,
        changes: { // matching schema
          deleted_user_email: targetUser.email,
          deleted_user_role: targetUser.role,
          deleted_from_auth: !!targetUser.auth_id,
        },
      });

      return res.status(200).json({
        message: 'User permanently deleted successfully',
      });
    } else {
      // SOFT DELETE - Deactivate the user
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ active: false, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (updateError) {
        console.error('Error deactivating user:', updateError);
        return res.status(500).json({ error: 'Failed to deactivate user' });
      }

      // Log the action in audit_logs
      await supabaseAdmin.from('audit_logs').insert({
        user_id: user.id,
        action: 'deactivate_admin_user',
        resource_type: 'user',
        resource_id: id,
        changes: { // matching schema
          deactivated_user_email: targetUser.email,
          deactivated_user_role: targetUser.role,
        },
      });

      return res.status(200).json({
        message: 'User deactivated successfully',
      });
    }
  } catch (error) {
    console.error('Error in DELETE /api/admin/users/:id:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
