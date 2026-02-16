// =====================================================
// ADMIN CHAT CONVERSATION API - Individual
// Update conversation status (admin only)
// =====================================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: 'Conversation ID is required'
    });
  }

  if (!supabase) {
    return res.status(500).json({
      success: false,
      error: 'Database not configured. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.'
    });
  }

  try {
    switch (method) {
      case 'GET':
        return await getConversation(id, res);
      case 'PUT':
        return await updateConversation(id, req.body, res);
      case 'DELETE':
        return await deleteConversation(id, res);
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({
          success: false,
          error: `Method ${method} Not Allowed`
        });
    }
  } catch (error) {
    console.error('Admin Chat Conversation API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

// GET: Get single conversation with messages
async function getConversation(id, res) {
  try {
    const { data: conversation, error } = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Conversation not found'
        });
      }
      throw error;
    }

    // Get messages for this conversation
    const { data: messages } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true });

    return res.status(200).json({
      success: true,
      conversation: {
        ...conversation,
        messages: messages || []
      }
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch conversation'
    });
  }
}

// PUT: Update conversation status
async function updateConversation(id, body, res) {
  const { status, assigned_admin_id } = body;

  try {
    const updateData = {};
    
    if (status) {
      updateData.status = status;
    }
    
    if (assigned_admin_id !== undefined) {
      updateData.assigned_admin_id = assigned_admin_id;
    }

    const { data: conversation, error } = await supabase
      .from('chat_conversations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: 'Conversation updated successfully',
      conversation
    });
  } catch (error) {
    console.error('Update conversation error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to update conversation'
    });
  }
}

// DELETE: Delete conversation and its messages
async function deleteConversation(id, res) {
  try {
    // Delete messages first (cascade should handle this, but just in case)
    await supabase
      .from('chat_messages')
      .delete()
      .eq('conversation_id', id);

    // Delete conversation
    const { error } = await supabase
      .from('chat_conversations')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    console.error('Delete conversation error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete conversation'
    });
  }
}
