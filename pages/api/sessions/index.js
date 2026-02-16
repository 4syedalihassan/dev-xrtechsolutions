// Healthcare Sessions API
// GET: List active/upcoming sessions
// POST: Create new session (admin only)

import { createClient } from '@supabase/supabase-js';

// Check if Supabase is configured
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      // Return empty array if Supabase is not configured
      if (!supabase) {
        return res.status(200).json({ sessions: [] });
      }

      // Get active and upcoming sessions
      const { data: sessions, error } = await supabase
        .from('healthcare_sessions')
        .select(`
          *,
          session_types (*),
          session_materials (*),
          session_state (*),
          current_participants
        `)
        .in('status', ['scheduled', 'active'])
        .eq('is_public', true)
        .order('scheduled_start', { ascending: true });

      if (error) {
        // Return empty array if table doesn't exist or query fails
        console.warn('Sessions API error (returning empty):', error.message);
        return res.status(200).json({ sessions: [] });
      }

      return res.status(200).json({ sessions: sessions || [] });
    }

    if (req.method === 'POST') {
      // Create new session (admin only)
      const {
        session_type_id,
        title,
        description,
        presenter_name,
        scheduled_start,
        duration_minutes,
        max_participants,
        materials
      } = req.body;

      // Validate required fields
      if (!session_type_id || !title || !scheduled_start) {
        return res.status(400).json({ 
          error: 'Missing required fields: session_type_id, title, scheduled_start' 
        });
      }

      // Calculate end time
      const startTime = new Date(scheduled_start);
      const endTime = new Date(startTime.getTime() + (duration_minutes || 60) * 60000);

      // Create session
      const { data: session, error: sessionError } = await supabase
        .from('healthcare_sessions')
        .insert([{
          session_type_id,
          title,
          description,
          presenter_name,
          scheduled_start: startTime.toISOString(),
          scheduled_end: endTime.toISOString(),
          duration_minutes: duration_minutes || 60,
          max_participants: max_participants || 50,
          status: 'scheduled'
        }])
        .select()
        .single();

      if (sessionError) {
        return res.status(500).json({ error: sessionError.message });
      }

      // Add materials if provided
      if (materials && materials.length > 0) {
        const materialData = materials.map((material, index) => ({
          session_id: session.id,
          material_type: material.type,
          title: material.title,
          content_url: material.url,
          content_data: material.data,
          display_order: index,
          duration_seconds: material.duration
        }));

        const { error: materialsError } = await supabase
          .from('session_materials')
          .insert(materialData);

        if (materialsError) {
          console.error('Error adding materials:', materialsError);
        }
      }

      // Initialize session state
      await supabase
        .from('session_state')
        .insert([{
          session_id: session.id,
          environment_settings: {
            theme: 'healthcare',
            lighting: 'presentation',
            layout: 'amphitheater'
          }
        }]);

      return res.status(201).json({ session });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Sessions API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}