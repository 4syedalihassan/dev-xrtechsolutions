// Session Participation API
// POST: Join a session

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { session_id, participant_name, user_id } = req.body;

    if (!session_id) {
      return res.status(400).json({ error: 'Session ID required' });
    }

    // Check if session exists and is active
    const { data: session, error: sessionError } = await supabase
      .from('healthcare_sessions')
      .select('id, status, max_participants, current_participants')
      .eq('id', session_id)
      .single();

    if (sessionError || !session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.status !== 'active' && session.status !== 'scheduled') {
      return res.status(400).json({ error: 'Session is not available for joining' });
    }

    if (session.current_participants >= session.max_participants) {
      return res.status(400).json({ error: 'Session is full' });
    }

    // Check if user already joined
    const { data: existingParticipant } = await supabase
      .from('session_participants')
      .select('id')
      .eq('session_id', session_id)
      .eq(user_id ? 'user_id' : 'participant_name', user_id || participant_name)
      .is('left_at', null)
      .single();

    if (existingParticipant) {
      return res.status(400).json({ error: 'Already joined this session' });
    }

    // Add participant
    const { data: participant, error: participantError } = await supabase
      .from('session_participants')
      .insert([{
        session_id,
        user_id,
        participant_name: participant_name || 'Anonymous'
      }])
      .select()
      .single();

    if (participantError) {
      return res.status(500).json({ error: participantError.message });
    }

    // Update participant count
    await supabase
      .from('healthcare_sessions')
      .update({ 
        current_participants: session.current_participants + 1 
      })
      .eq('id', session_id);

    return res.status(201).json({ 
      participant,
      message: 'Successfully joined session' 
    });
  } catch (error) {
    console.error('Join session error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}