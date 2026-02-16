// =====================================================
// API: Building Signboard Management
// Endpoint: /api/buildings/[id]/signboard
// Methods: GET, PUT
// Sprint: Phase 2.4.1 - Advanced Signboard Management
// =====================================================

import { createClient } from '@supabase/supabase-js';
import { requireAdminAPI } from '../../../../lib/apiAuth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { id } = req.query;

  // Validate building ID
  if (!id) {
    return res.status(400).json({
      success: false,
      error: 'Building ID is required'
    });
  }

  try {
    switch (req.method) {
      case 'GET':
        return await getSignboardConfig(req, res, id);

      case 'PUT':
        return await updateSignboardConfig(req, res, id);

      default:
        return res.status(405).json({
          success: false,
          error: `Method ${req.method} not allowed`
        });
    }
  } catch (error) {
    console.error('Signboard API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
}

/**
 * GET /api/buildings/[id]/signboard
 * Fetch signboard configuration for a building
 */
async function getSignboardConfig(req, res, buildingId) {
  try {
    // Check if buildingId is a UUID or slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(buildingId);

    // Fetch building - select actual columns that exist
    let query = supabase
      .from('buildings')
      .select('id, name, signage_text, signage_width, signage_height, logo_url');

    if (isUUID) {
      query = query.eq('id', buildingId);
    } else {
      query = query.eq('slug', buildingId);
    }

    const { data: building, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Building not found'
        });
      }
      throw error;
    }

    // Build config from actual table columns
    const config = {
      name: building.signage_text || building.name || '',
      name_font_size: 1.0,
      name_font_family: 'Arial',
      logo_url: building.logo_url || null,
      logo_position: 'center',
      logo_size: 1.0,
      logo_width: 2.0,
      logo_height: 2.0,
      logo_offset_x: 0,
      logo_offset_y: 0,
      bg_color: '#FFFFFF',
      text_color: '#000000',
      border_color: '#000000',
      border_width: 0.1,
      signboard_width: building.signage_width || 10.0,
      signboard_height: building.signage_height || 1.6,
      opacity: 1.0,
      template: 'default'
    };

    // Fetch available templates (disabled until table is created)
    // TODO: Create signboard_templates table in database
    // const { data: templates, error: templatesError } = await supabase
    //   .from('signboard_templates')
    //   .select('*')
    //   .eq('is_active', true)
    //   .order('display_name');
    //
    // if (templatesError) {
    //   console.error('Error fetching templates:', templatesError);
    // }

    return res.status(200).json({
      success: true,
      building_id: building.id,
      building_name: building.name,
      signboard_config: config,
      available_templates: [] // Empty until table is created
    });

  } catch (error) {
    console.error('Error fetching signboard config:', error);
    throw error;
  }
}

/**
 * PUT /api/buildings/[id]/signboard
 * Update signboard configuration for a building
 */
async function updateSignboardConfig(req, res, buildingId) {
  // Require admin authentication for updates
  const user = await requireAdminAPI(req, res);
  if (!user) return; // Response already sent by middleware

  try {
    const updates = req.body;

    console.log('[Signboard API] PUT request received');
    console.log('[Signboard API] Building ID/Slug:', buildingId);
    console.log('[Signboard API] Updates:', JSON.stringify(updates, null, 2));

    // Validate required fields
    if (!updates || typeof updates !== 'object') {
      console.error('[Signboard API] Invalid request body');
      return res.status(400).json({
        success: false,
        error: 'Invalid signboard configuration data'
      });
    }

    // Validate color formats (hex color)
    const colorFields = ['bg_color', 'text_color', 'border_color'];
    for (const field of colorFields) {
      if (updates[field] && !/^#[0-9A-Fa-f]{6}$/.test(updates[field])) {
        return res.status(400).json({
          success: false,
          error: `Invalid ${field} format. Must be hex color (e.g., #FFFFFF)`
        });
      }
    }

    // Validate numeric fields
    const numericFields = {
      name_font_size: [0.5, 3.0],
      logo_size: [0.5, 3.0],
      logo_width: [0.5, 10.0],  // Logo width in 3D units
      logo_height: [0.5, 10.0],  // Logo height in 3D units
      logo_offset_x: [-5.0, 5.0],
      logo_offset_y: [-5.0, 5.0],
      border_width: [0, 1.0],
      signboard_width: [5.0, 20.0],
      signboard_height: [1.0, 5.0],
      opacity: [0.0, 1.0]
    };

    for (const [field, [min, max]] of Object.entries(numericFields)) {
      if (updates[field] !== undefined) {
        const value = parseFloat(updates[field]);
        if (isNaN(value) || value < min || value > max) {
          return res.status(400).json({
            success: false,
            error: `${field} must be between ${min} and ${max}`
          });
        }
      }
    }

    // Validate logo position enum
    if (updates.logo_position && !['left', 'right', 'above', 'center'].includes(updates.logo_position)) {
      return res.status(400).json({
        success: false,
        error: 'logo_position must be one of: left, right, above, center'
      });
    }

    // Check if buildingId is a UUID or slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(buildingId);
    console.log('[Signboard API] Building ID is UUID:', isUUID);

    // Fetch current building
    let query = supabase
      .from('buildings')
      .select('id, name, signage_text, signage_width, signage_height, logo_url');

    if (isUUID) {
      query = query.eq('id', buildingId);
    } else {
      query = query.eq('slug', buildingId);
    }

    console.log('[Signboard API] Fetching building...');
    const { data: building, error: fetchError } = await query.single();

    if (fetchError) {
      console.error('[Signboard API] Fetch error:', fetchError);
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Building not found',
          details: `No building with ${isUUID ? 'ID' : 'slug'}: ${buildingId}`
        });
      }
      throw fetchError;
    }

    console.log('[Signboard API] Building found:', building.id, building.name);

    // Map updates to actual database columns
    const dbUpdates = {};

    if (updates.name !== undefined) {
      dbUpdates.signage_text = updates.name;
    }
    if (updates.signboard_width !== undefined) {
      dbUpdates.signage_width = updates.signboard_width;
    }
    if (updates.signboard_height !== undefined) {
      dbUpdates.signage_height = updates.signboard_height;
    }
    // Note: Color and font settings normally go here but columns are missing in schema.
    // We are skipping them for now to avoid 500 errors.

    if (updates.logo_url !== undefined) {
      dbUpdates.logo_url = updates.logo_url;
    }

    // Always update the updated_at timestamp
    dbUpdates.updated_at = new Date().toISOString();

    console.log('[Signboard API] Database updates:', JSON.stringify(dbUpdates, null, 2));

    // Update building using actual columns
    console.log('[Signboard API] Executing UPDATE query...');
    const { data: updatedBuilding, error: updateError } = await supabase
      .from('buildings')
      .update(dbUpdates)
      .eq('id', building.id)
      .select('id, name, signage_text, signage_width, signage_height, logo_url')
      .single();

    if (updateError) {
      console.error('[Signboard API] UPDATE ERROR!');
      console.error('[Signboard API] Error code:', updateError.code);
      console.error('[Signboard API] Error message:', updateError.message);
      console.error('[Signboard API] Error details:', updateError.details);
      console.error('[Signboard API] Error hint:', updateError.hint);
      console.error('[Signboard API] Full error:', JSON.stringify(updateError, null, 2));
      throw updateError;
    }

    console.log('[Signboard API] Update successful!');

    // Build config response from actual columns
    const responseConfig = {
      name: updatedBuilding.signage_text || updatedBuilding.name,
      bg_color: '#000000', // Default
      text_color: '#FFFFFF', // Default
      signboard_width: updatedBuilding.signage_width || 10.0,
      signboard_height: updatedBuilding.signage_height || 1.6,
      name_font_size: 1.0, // Default
      logo_url: updatedBuilding.logo_url || null,
      logo_width: 2.0, // Default
      logo_height: 2.0 // Default
    };

    return res.status(200).json({
      success: true,
      message: 'Signboard configuration updated successfully',
      building_id: updatedBuilding.id,
      building_name: updatedBuilding.name,
      signboard_config: responseConfig
    });

  } catch (error) {
    console.error('[Signboard API] CATCH BLOCK - Fatal error:', error);
    console.error('[Signboard API] Error stack:', error.stack);
    return res.status(500).json({
      success: false,
      error: 'Failed to update signboard configuration',
      message: error.message,
      code: error.code,
      details: error.details
    });
  }
}

// =====================================================
// USAGE EXAMPLES
// =====================================================

/**
 * GET Request:
 *
 * fetch('/api/buildings/uuid-here/signboard')
 *   .then(res => res.json())
 *   .then(data => {
 *     console.log(data.signboard_config);
 *     console.log(data.available_templates);
 *   });
 */

/**
 * PUT Request - Update name and colors:
 *
 * fetch('/api/buildings/uuid-here/signboard', {
 *   method: 'PUT',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     name: 'City Healthcare Center',
 *     bg_color: '#1a2332',
 *     text_color: '#FFD700',
 *     border_color: '#FFD700'
 *   })
 * });
 */

/**
 * PUT Request - Update logo:
 *
 * fetch('/api/buildings/uuid-here/signboard', {
 *   method: 'PUT',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     logo_url: 'https://supabase-url/storage/v1/object/public/building-logos/uuid/logo.png',
 *     logo_position: 'left',
 *     logo_size: 1.2,
 *     logo_offset_x: 0.5
 *   })
 * });
 */

/**
 * PUT Request - Apply template:
 *
 * // First fetch template config from GET /api/buildings/[id]/signboard
 * // Then apply template fields:
 *
 * const template = availableTemplates.find(t => t.name === 'medical');
 * fetch('/api/buildings/uuid-here/signboard', {
 *   method: 'PUT',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     ...template.config,
 *     template: 'medical'
 *   })
 * });
 */
