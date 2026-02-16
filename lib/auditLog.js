import { supabase } from './supabase';

/**
 * Audit Logging Utility
 *
 * Tracks admin actions for security and compliance
 *
 * Usage:
 *
 * import { logAdminAction } from '../lib/auditLog';
 *
 * await logAdminAction({
 *   userId: user.id,
 *   action: 'update',
 *   resourceType: 'product',
 *   resourceId: productId,
 *   changes: {
 *     old: { name: 'Old Name', price: 99.99 },
 *     new: { name: 'New Name', price: 129.99 }
 *   }
 * });
 */

/**
 * Log an admin action to the audit_logs table
 *
 * @param {Object} params - Log parameters
 * @param {string} params.userId - User ID performing the action
 * @param {string} params.action - Action type (create, update, delete, login, etc.)
 * @param {string} params.resourceType - Type of resource (product, order, user, etc.)
 * @param {string} [params.resourceId] - ID of the affected resource
 * @param {Object} [params.changes] - Object containing old and new values
 * @param {string} [params.ipAddress] - IP address of the request
 * @param {string} [params.userAgent] - User agent string
 */

export async function logAdminAction({
  userId,
  action,
  resourceType,
  resourceId = null,
  changes = null,
  ipAddress = null,
  userAgent = null,
}) {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .insert([
        {
          user_id: userId,
          action,
          resource_type: resourceType,
          resource_id: resourceId,
          changes,
          ip_address: ipAddress,
          user_agent: userAgent,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error logging admin action:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Audit log error:', error);
    return { success: false, error };
  }
}

/**
 * Log admin action using database function (if you created the function in Phase 1)
 * This version uses the Supabase RPC to call the database function
 */

export async function logAdminActionRPC({
  action,
  resourceType,
  resourceId = null,
  changes = null,
}) {
  try {
    const { data, error } = await supabase.rpc('log_admin_action', {
      p_action: action,
      p_resource_type: resourceType,
      p_resource_id: resourceId,
      p_changes: changes,
    });

    if (error) {
      console.error('Error logging admin action via RPC:', error);
      return { success: false, error };
    }

    return { success: true, logId: data };
  } catch (error) {
    console.error('Audit log RPC error:', error);
    return { success: false, error };
  }
}

/**
 * Get audit logs with filters
 *
 * @param {Object} filters - Filter options
 * @param {string} [filters.userId] - Filter by user ID
 * @param {string} [filters.action] - Filter by action type
 * @param {string} [filters.resourceType] - Filter by resource type
 * @param {string} [filters.resourceId] - Filter by resource ID
 * @param {number} [filters.limit] - Limit number of results
 * @param {number} [filters.offset] - Offset for pagination
 */

export async function getAuditLogs({
  userId = null,
  action = null,
  resourceType = null,
  resourceId = null,
  limit = 50,
  offset = 0,
} = {}) {
  try {
    let query = supabase
      .from('audit_logs')
      .select('*, user:users(email, name, role)')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (action) {
      query = query.eq('action', action);
    }

    if (resourceType) {
      query = query.eq('resource_type', resourceType);
    }

    if (resourceId) {
      query = query.eq('resource_id', resourceId);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching audit logs:', error);
      return { success: false, error };
    }

    return { success: true, logs: data, total: count };
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return { success: false, error };
  }
}

/**
 * Get recent admin actions (last 24 hours)
 */

export async function getRecentAdminActions(limit = 20) {
  try {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const { data, error } = await supabase
      .from('audit_logs')
      .select('*, user:users(email, name, role)')
      .gte('created_at', twentyFourHoursAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent actions:', error);
      return { success: false, error };
    }

    return { success: true, actions: data };
  } catch (error) {
    console.error('Error fetching recent actions:', error);
    return { success: false, error };
  }
}

/**
 * Helper function to extract IP address from request
 */

export function getClientIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    null
  );
}

/**
 * Helper function to log admin API action from request
 * Automatically extracts IP and user agent
 */

export async function logAdminAPIAction(req, action, resourceType, resourceId = null, changes = null) {
  if (!req.user) {
    console.error('Cannot log action: No user in request');
    return { success: false, error: 'No user in request' };
  }

  return logAdminAction({
    userId: req.user.id,
    action,
    resourceType,
    resourceId,
    changes,
    ipAddress: getClientIP(req),
    userAgent: req.headers['user-agent'] || null,
  });
}

/**
 * Log successful login
 */

export async function logLogin(userId, ipAddress = null, userAgent = null) {
  return logAdminAction({
    userId,
    action: 'login',
    resourceType: 'session',
    resourceId: null,
    changes: null,
    ipAddress,
    userAgent,
  });
}

/**
 * Log successful logout
 */

export async function logLogout(userId, ipAddress = null, userAgent = null) {
  return logAdminAction({
    userId,
    action: 'logout',
    resourceType: 'session',
    resourceId: null,
    changes: null,
    ipAddress,
    userAgent,
  });
}

/**
 * Log failed login attempt
 * Note: This won't have a userId if user doesn't exist
 */

export async function logFailedLogin(email, reason, ipAddress = null, userAgent = null) {
  try {
    const { error } = await supabase
      .from('audit_logs')
      .insert([
        {
          user_id: null, // No user ID for failed attempts
          action: 'failed_login',
          resource_type: 'session',
          changes: { email, reason },
          ip_address: ipAddress,
          user_agent: userAgent,
        },
      ]);

    if (error) {
      console.error('Error logging failed login:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Error logging failed login:', error);
    return { success: false, error };
  }
}
