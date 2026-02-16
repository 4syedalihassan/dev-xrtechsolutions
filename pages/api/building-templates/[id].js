// Single Building Template API - Supabase Integration
// GET /api/building-templates/[id] - Get template details
// Sprint 2 - User Story 2.1

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { method, query } = req;
  const { id } = query;

  try {
    switch (method) {
      case 'GET':
        return handleGet(req, res, id);

      default:
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({
          success: false,
          error: `Method ${method} not allowed`
        });
    }
  } catch (error) {
    console.error('Building Template API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

// GET - Get single template by ID
async function handleGet(req, res, id) {
  const { data, error } = await supabase
    .from('building_templates')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return res.status(404).json({
        success: false,
        error: 'Building template not found'
      });
    }
    console.error('Error fetching template:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch template',
      details: error.message
    });
  }

  // Enrich template with calculated properties and specifications
  const enrichedTemplate = {
    ...data,
    area: data.width * data.depth,
    volume: data.width * data.depth * data.wall_height,
    perimeter: 2 * (data.width + data.depth),
    display_name: data.name,
    type_label: data.type === 'complex' ? 'Complex Building' : 'Shop Building',

    // Building specifications
    specifications: {
      dimensions: {
        width: data.width,
        depth: data.depth,
        height: data.wall_height,
        unit: 'meters'
      },
      calculated: {
        floor_area: `${data.width * data.depth} m²`,
        total_volume: `${data.width * data.depth * data.wall_height} m³`,
        wall_perimeter: `${2 * (data.width + data.depth)} m`
      },
      structure: {
        walls: {
          material: data.wall_material || 'concrete',
          color: data.wall_color || '#888888',
          height: `${data.wall_height} m`
        },
        ceiling: {
          material: data.ceiling_material || 'glass',
          color: data.ceiling_color || data.type === 'complex' ? '#F5F5DC' : '#C8C8E6'
        },
        floor: {
          material: data.floor_material || 'concrete',
          color: data.floor_color || '#666666'
        }
      },
      doors: {
        north_wall: {
          type: data.type === 'complex' ? 'hinged' : 'sliding',
          material: 'glass',
          width: data.type === 'complex' ? '1.5m' : '2.4m',
          height: '2.5m'
        }
      },
      features: data.type === 'complex'
        ? ['Large open space', 'High ceiling', 'Corner pillars', 'Glass ceiling']
        : ['Compact layout', 'Gold trim', 'Sliding doors', 'Lavender ceiling']
    },

    // Default furniture positions (from existing 3D implementation)
    default_furniture: data.type === 'complex'
      ? [
          {
            type: 'reception_desk',
            position: { x: 0, y: 0, z: -7 },
            rotation: { y: 0 },
            facing: 'east'
          },
          {
            type: 'office_chair',
            position: { x: -1.5, y: 0, z: -7 },
            rotation: { y: Math.PI },
            facing: 'desk'
          },
          {
            type: 'led_tv',
            position: { x: 9, y: 2.5, z: 0 },
            wall: 'east',
            content: 'Health Information'
          },
          {
            type: 'whiteboard',
            position: { x: 0, y: 2, z: -9 },
            wall: 'south',
            content: 'Guidelines'
          },
          {
            type: 'plant_pot',
            position: { x: -8, y: 0, z: -8 },
            corner: 'southwest'
          }
        ]
      : [
          {
            type: 'checkout_counter',
            position: { x: 4.5, y: 0, z: 2 },
            rotation: { y: -Math.PI / 2 },
            facing: 'east'
          },
          {
            type: 'perfume_shelf',
            positions: [
              { x: -5, y: 0, z: 2, width: 3 },
              { x: -5, y: 0, z: -1, width: 2.5 },
              { x: 0, y: 0, z: -3.5, width: 3.5 },
              { x: 3.5, y: 0, z: -3.5, width: 3 },
              { x: 5, y: 0, z: 1, width: 2 },
              { x: 0, y: 0, z: 0, width: 1.5 }
            ]
          }
        ],

    // Usage statistics (will be populated when buildings exist)
    usage_stats: {
      total_buildings: 0,
      active_buildings: 0,
      most_popular: data.type === 'complex'
    }
  };

  return res.status(200).json({
    success: true,
    template: enrichedTemplate
  });
}
