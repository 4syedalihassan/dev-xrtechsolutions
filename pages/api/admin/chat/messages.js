// =====================================================
// ADMIN CHAT MESSAGES API
// Get and send chat messages (admin only)
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

  if (!supabase) {
    return res.status(500).json({
      success: false,
      error: 'Database not configured. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.'
    });
  }

  try {
    switch (method) {
      case 'GET':
        return await getMessages(req, res);
      case 'POST':
        return await sendMessage(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({
          success: false,
          error: `Method ${method} Not Allowed`
        });
    }
  } catch (error) {
    console.error('Admin Chat Messages API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

// GET: Get messages for a conversation
async function getMessages(req, res) {
  const { conversation_id, limit = 100, offset = 0 } = req.query;

  if (!conversation_id) {
    return res.status(400).json({
      success: false,
      error: 'conversation_id is required'
    });
  }

  try {
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversation_id)
      .order('created_at', { ascending: true })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (error) {
      if (error.code === '42P01') {
        return res.status(200).json({
          success: true,
          messages: [],
          message: 'Chat messages table not found. Please run the database migration.'
        });
      }
      throw error;
    }

    // Mark messages as read and update conversation unread count
    // Note: These operations are performed in parallel for better performance
    // In case of partial failure, the read state may be inconsistent but will
    // self-correct on next load
    const readTimestamp = new Date().toISOString();
    await Promise.all([
      supabase
        .from('chat_messages')
        .update({ read: true, read_at: readTimestamp })
        .eq('conversation_id', conversation_id)
        .eq('sender', 'customer')
        .eq('read', false),
      supabase
        .from('chat_conversations')
        .update({ unread_count: 0 })
        .eq('id', conversation_id)
    ]);

    return res.status(200).json({
      success: true,
      messages: messages || []
    });
  } catch (error) {
    console.error('Get messages error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch messages',
      messages: []
    });
  }
}

// POST: Send a message as admin
async function sendMessage(req, res) {
  const { conversation_id, text } = req.body;

  if (!conversation_id || !text) {
    return res.status(400).json({
      success: false,
      error: 'conversation_id and text are required'
    });
  }

  try {
    // Insert the message
    const { data: message, error } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id,
        sender: 'admin',
        text,
        read: true
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Update conversation's last message
    await supabase
      .from('chat_conversations')
      .update({
        last_message: text,
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', conversation_id);

    return res.status(201).json({
      success: true,
      message
    });
  } catch (error) {
    console.error('Send message error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to send message'
    });
  }
}
