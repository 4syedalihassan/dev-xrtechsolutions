// API endpoint to update pharmacy/healthcare building layout
// POST /api/admin/update-pharmacy-layout

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Healthcare Building ID
const HEALTHCARE_BUILDING_ID = '00000000-0000-0000-0000-000000000001';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🏥 Updating Pharmacy/Healthcare Layout...');

    // First, get all furniture for the healthcare building
    const { data: furniture, error: fetchError } = await supabase
      .from('building_furniture')
      .select('*')
      .eq('building_id', HEALTHCARE_BUILDING_ID);

    if (fetchError) {
      console.error('Error fetching furniture:', fetchError);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch furniture',
        details: fetchError.message
      });
    }

    const results = [];

    // Define new positions
    const layoutUpdates = {
      // Move shelf to back wall
      'pharmacy_shelf': {
        position_x: 0,
        position_y: 0,
        position_z: -4.5,  // Against back wall
        rotation_y: 0
      },
      // Place character in middle (behind counter)
      'character': {
        position_x: 0,
        position_y: 0,
        position_z: -1.5,  // Middle area
        rotation_y: 0
      },
      'npc': {
        position_x: 0,
        position_y: 0,
        position_z: -1.5,
        rotation_y: 0
      },
      'pharmacist': {
        position_x: 0,
        position_y: 0,
        position_z: -1.5,
        rotation_y: 0
      },
      // Counter in front
      'pharmacy_counter': {
        position_x: 0,
        position_y: 0,
        position_z: 1,
        rotation_y: 0
      }
    };

    // Update each furniture item
    for (const item of furniture) {
      const furnitureType = item.furniture_type?.toLowerCase();
      const updates = layoutUpdates[furnitureType];

      if (updates) {
        const { error: updateError } = await supabase
          .from('building_furniture')
          .update({
            position_x: updates.position_x,
            position_y: updates.position_y,
            position_z: updates.position_z,
            rotation_y: updates.rotation_y,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.id);

        results.push({
          name: item.name || item.furniture_type,
          id: item.id,
          oldPosition: [item.position_x, item.position_y, item.position_z],
          newPosition: [updates.position_x, updates.position_y, updates.position_z],
          success: !updateError,
          error: updateError?.message
        });
      } else {
        results.push({
          name: item.name || item.furniture_type,
          id: item.id,
          position: [item.position_x, item.position_y, item.position_z],
          skipped: true,
          reason: 'No layout update defined for this type'
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Layout updated',
      furniture: results
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
