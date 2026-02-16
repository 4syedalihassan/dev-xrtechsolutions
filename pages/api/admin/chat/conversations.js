// =====================================================
// ADMIN CHAT CONVERSATIONS API
// List all chat conversations (admin only)
// =====================================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

import { requireAdminAPI } from '../../../../lib/apiAuth';

/* ... imports ... */

export default async function handler(req, res) {
  const { method } = req;

  // Check Admin Auth
  const user = await requireAdminAPI(req, res);
  if (!user) return; // Response sent by middleware

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({
      success: false,
      error: `Method ${method} Not Allowed`
    });
  }

  try {
    const { status, limit = 50, offset = 0 } = req.query;

    if (!supabase) {
      return res.status(500).json({
        success: false,
        error: 'Database not configured. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.',
        conversations: [],
        total: 0
      });
    }

    let query = supabase
      .from('chat_conversations')
      .select('*', { count: 'exact' })
      .order('updated_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: conversations, error, count } = await query;

    if (error) {
      if (error.code === '42P01') {
        return res.status(200).json({
          success: true,
          conversations: [],
          total: 0,
          message: 'Chat conversations table not found. Please run the database migration.'
        });
      }
      throw error;
    }

    return res.status(200).json({
      success: true,
      conversations: conversations || [],
      total: count || 0
    });
  } catch (error) {
    console.error('Admin Chat API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch conversations',
      conversations: [],
      total: 0
    });
  }
}
