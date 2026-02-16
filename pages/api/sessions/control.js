// Session Control API
// POST: Control session (start, pause, next material, etc.)

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
    const { session_id, action, data } = req.body;

    if (!session_id || !action) {
      return res.status(400).json({ error: 'Session ID and action required' });
    }

    // Get current session state
    const { data: session, error: sessionError } = await supabase
      .from('healthcare_sessions')
      .select(`
        *,
        session_state (*),
        session_materials (*)
      `)
      .eq('id', session_id)
      .single();

    if (sessionError || !session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    let updateData = {};
    let sessionUpdate = {};

    switch (action) {
      case 'start':
        sessionUpdate = { status: 'active' };
        updateData = {
          is_presentation_mode: true,
          environment_settings: {
            ...session.session_state?.environment_settings,
            mode: 'presentation',
            lighting: 'focused'
          }
        };
        break;

      case 'pause':
        updateData = {
          is_presentation_mode: false,
          environment_settings: {
            ...session.session_state?.environment_settings,
            mode: 'break',
            lighting: 'ambient'
          }
        };
        break;

      case 'resume':
        updateData = {
          is_presentation_mode: true,
          environment_settings: {
            ...session.session_state?.environment_settings,
            mode: 'presentation',
            lighting: 'focused'
          }
        };
        break;

      case 'next_material':
        const materials = session.session_materials || [];
        const currentIndex = materials.findIndex(m => 
          m.id === session.session_state?.current_material_id
        );
        const nextMaterial = materials[currentIndex + 1];
        
        if (nextMaterial) {
          updateData = {
            current_material_id: nextMaterial.id,
            presentation_slide: 1
          };
        }
        break;

      case 'previous_material':
        const materialsP = session.session_materials || [];
        const currentIndexP = materialsP.findIndex(m => 
          m.id === session.session_state?.current_material_id
        );
        const prevMaterial = materialsP[currentIndexP - 1];
        
        if (prevMaterial) {
          updateData = {
            current_material_id: prevMaterial.id,
            presentation_slide: 1
          };
        }
        break;

      case 'goto_material':
        if (data.material_id) {
          updateData = {
            current_material_id: data.material_id,
            presentation_slide: data.slide || 1
          };
        }
        break;

      case 'change_slide':
        updateData = {
          presentation_slide: data.slide || 1
        };
        break;

      case 'end':
        sessionUpdate = { status: 'completed' };
        updateData = {
          is_presentation_mode: false,
          environment_settings: {
            ...session.session_state?.environment_settings,
            mode: 'completed',
            lighting: 'ambient'
          }
        };
        break;

      case 'update_environment':
        updateData = {
          environment_settings: {
            ...session.session_state?.environment_settings,
            ...data.settings
          }
        };
        break;

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    // Update session status if needed
    if (Object.keys(sessionUpdate).length > 0) {
      await supabase
        .from('healthcare_sessions')
        .update(sessionUpdate)
        .eq('id', session_id);
    }

    // Update session state
    const { data: updatedState, error: stateError } = await supabase
      .from('session_state')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('session_id', session_id)
      .select()
      .single();

    if (stateError) {
      return res.status(500).json({ error: stateError.message });
    }

    return res.status(200).json({ 
      state: updatedState,
      message: `Action '${action}' completed successfully`
    });
  } catch (error) {
    console.error('Session control error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}