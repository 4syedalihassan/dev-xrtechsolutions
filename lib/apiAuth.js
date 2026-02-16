import { createClient } from '@supabase/supabase-js';
import { supabase } from './supabase';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * Admin API Authentication Middleware
 *
 * Protects admin API routes by checking:
 * 1. Request has valid Authorization header with Bearer token
 * 2. Token belongs to active admin/super_admin user
 *
 * Usage in API routes:
 *
 * import { requireAdminAPI } from '../../lib/apiAuth';
 *
 * export default async function handler(req, res) {
 *   const user = await requireAdminAPI(req, res);
 *   if (!user) return; // Response already sent
 *
 *   // Your admin API logic here
 * }
 */

export async function requireAdminAPI(req, res) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'No authorization token provided',
        code: 'UNAUTHORIZED',
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify token with Supabase (can use public client)
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !authUser) {
      return res.status(401).json({
        error: 'Invalid or expired token',
        code: 'UNAUTHORIZED',
      });
    }

    // Get user from users table to check role - USE ADMIN CLIENT TO BYPASS RLS
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, name, role, active')
      .eq('auth_id', authUser.id)
      .single();

    if (userError || !user) {
      return res.status(401).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    // Check if user is admin or super_admin
    if (!['admin', 'super_admin'].includes(user.role)) {
      return res.status(403).json({
        error: 'Admin access required',
        code: 'FORBIDDEN',
      });
    }

    // Check if account is active
    if (!user.active) {
      return res.status(403).json({
        error: 'Account is inactive',
        code: 'ACCOUNT_INACTIVE',
      });
    }

    // Attach user data to request object for use in handler
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isAdmin: true,
      isSuperAdmin: user.role === 'super_admin',
    };

    req.authUser = authUser;

    // Return user data (indicates success)
    return req.user;
  } catch (error) {
    console.error('API auth error:', error);
    return res.status(500).json({
      error: 'Authentication error',
      code: 'INTERNAL_ERROR',
    });
  }
}

/**
 * Super Admin API Authentication Middleware
 *
 * Stricter version that only allows super_admin role
 */

export async function requireSuperAdminAPI(req, res) {
  const user = await requireAdminAPI(req, res);

  // If no user returned, error response already sent
  if (!user) return null;

  // Check if user is super admin
  if (user.role !== 'super_admin') {
    return res.status(403).json({
      error: 'Super admin access required',
      code: 'SUPER_ADMIN_REQUIRED',
    });
  }

  return user;
}

/**
 * Optional Admin API Authentication
 *
 * Checks for admin authentication but doesn't reject request if not admin
 * Useful for API routes that have different behavior for admins vs customers
 *
 * Usage:
 *
 * const user = await optionalAdminAPI(req);
 * if (user?.isAdmin) {
 *   // Show admin data
 * } else {
 *   // Show customer data
 * }
 */

export async function optionalAdminAPI(req) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user: authUser }, error } = await supabase.auth.getUser(token);

    if (error || !authUser) {
      return null;
    }

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, email, name, role, active')
      .eq('auth_id', authUser.id)
      .single();

    if (!user || !user.active) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isAdmin: ['admin', 'super_admin'].includes(user.role),
      isSuperAdmin: user.role === 'super_admin',
    };
  } catch (error) {
    console.error('Optional admin API auth error:', error);
    return null;
  }
}

/**
 * Get auth token from request headers
 * Helper function to extract and validate token format
 */

export function getAuthToken(req) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.replace('Bearer ', '');
}

/**
 * Verify if a user ID has admin permissions
 * Useful for checking permissions on specific resources
 */

export async function verifyAdminPermission(userId) {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('role, active')
      .eq('id', userId)
      .single();

    return user && user.active && ['admin', 'super_admin'].includes(user.role);
  } catch (error) {
    console.error('Error verifying admin permission:', error);
    return false;
  }
}
