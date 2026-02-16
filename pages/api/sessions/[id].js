// Individual Session Management API
// GET: Get session details
// PUT: Update session (admin only)
// DELETE: Cancel session (admin only)

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    if (req.method === 'GET') {
      // Get session details with all related data
      const { data: session, error } = await supabase
        .from('healthcare_sessions')
        .select(`
          *,
          session_types (*),
          session_materials (*),
          session_state (*),
          session_participants (
            id,
            participant_name,
            joined_at,
            interaction_score
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        return res.status(404).json({ error: 'Session not found' });
      }

      return res.status(200).json({ session });
    }

    if (req.method === 'PUT') {
      // Update session
      const updates = req.body;
      
      const { data: session, error } = await supabase
        .from('healthcare_sessions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ session });
    }

    if (req.method === 'DELETE') {
      // Cancel session
      const { data: session, error } = await supabase
        .from('healthcare_sessions')
        .update({ status: 'cancelled' })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ session });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Session API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}