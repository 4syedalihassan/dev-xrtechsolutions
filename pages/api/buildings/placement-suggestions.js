// Building Placement Suggestions API
// GET /api/buildings/placement-suggestions - Get suggested placements for a building
// Sprint 2 - User Story 2.3

import { createClient } from '@supabase/supabase-js';
import { getSuggestedPlacements } from '../../../lib/autoPlacement.js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { method } = req;

  try {
    if (method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({
        success: false,
        error: `Method ${method} not allowed`
      });
    }

    const { customer_id, template_id } = req.query;

    // Validation
    if (!customer_id || !template_id) {
      return res.status(400).json({
        success: false,
        error: 'customer_id and template_id are required'
      });
    }

    // Get existing buildings for customer
    const { data: existingBuildings, error: buildingsError } = await supabase
      .from('buildings')
      .select('id, name, position_x, position_y, position_z, template:building_templates(width, depth)')
      .eq('customer_id', customer_id);

    if (buildingsError) {
      console.error('Error fetching buildings:', buildingsError);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch existing buildings',
        details: buildingsError.message
      });
    }

    // Get template
    const { data: template, error: templateError } = await supabase
      .from('building_templates')
      .select('*')
      .eq('id', template_id)
      .single();

    if (templateError || !template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

    // Calculate suggested placements
    const suggestions = getSuggestedPlacements(existingBuildings || [], template);

    return res.status(200).json({
      success: true,
      suggestions,
      existing_count: existingBuildings?.length || 0,
      template: {
        id: template.id,
        name: template.name,
        type: template.type,
        dimensions: {
          width: template.width,
          depth: template.depth,
          height: template.wall_height
        }
      }
    });
  } catch (error) {
    console.error('Placement suggestions API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}
