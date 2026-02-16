// Furniture API - List and Create
// GET /api/furniture - List all furniture with filters
// POST /api/furniture - Create new furniture item (Admin only)
// Sprint 3 - User Story 3.1

import { createClient } from '@supabase/supabase-js';
import { requireAdminAPI } from '../../../lib/apiAuth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return handleGet(req, res);

      case 'POST':
        return handlePost(req, res);

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({
          success: false,
          error: `Method ${method} not allowed`
        });
    }
  } catch (error) {
    console.error('Furniture API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

// GET - List furniture with filters
async function handleGet(req, res) {
  const { building_id, furniture_type, category, active } = req.query;

  let query = supabase
    .from('building_furniture')
    .select(`
      *,
      building:buildings(
        id,
        name,
        slug,
        customer_id,
        customer:customers(id, name, email)
      )
    `)
    .order('created_at', { ascending: false });

  // Apply filters
  if (building_id) {
    query = query.eq('building_id', building_id);
  }

  if (furniture_type) {
    query = query.eq('furniture_type', furniture_type);
  }

  if (active !== undefined) {
    query = query.eq('active', active === 'true');
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching furniture:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch furniture',
      details: error.message
    });
  }

  // Filter by category if provided (category is derived from furniture_type)
  let filteredData = data;
  if (category) {
    // This will be enhanced when we add furniture types library
    filteredData = data; // TODO: Filter by category from furniture types
  }

  return res.status(200).json({
    success: true,
    furniture: filteredData,
    count: filteredData.length
  });
}

// POST - Create furniture (Admin only)
async function handlePost(req, res) {
  // Require admin authentication
  const user = await requireAdminAPI(req, res);
  if (!user) return; // Response already sent by middleware

  const {
    building_id,
    furniture_type,
    furniture_model,
    name,
    position_x = 0,
    position_y = 0,
    position_z = 0,
    rotation_x = 0,
    rotation_y = 0,
    rotation_z = 0,
    scale_x = 1,
    scale_y = 1,
    scale_z = 1,
    color,
    texture,
    material,
    has_collision = true,
    collision_type = 'box',
    collision_radius,
    is_interactive = false,
    interaction_type,
    interaction_data,
    properties = {},
    display_order = 0
  } = req.body;

  // Validation
  if (!building_id) {
    return res.status(400).json({
      success: false,
      error: 'Building ID is required'
    });
  }

  if (!furniture_type) {
    return res.status(400).json({
      success: false,
      error: 'Furniture type is required'
    });
  }

  // Check if building exists
  const { data: building, error: buildingError } = await supabase
    .from('buildings')
    .select('id, customer_id, customer:customers(max_furniture_per_building)')
    .eq('id', building_id)
    .single();

  if (buildingError || !building) {
    return res.status(404).json({
      success: false,
      error: 'Building not found'
    });
  }

  // Check furniture limit for customer
  const { data: existingFurniture, error: countError } = await supabase
    .from('building_furniture')
    .select('id')
    .eq('building_id', building_id)
    .eq('active', true);

  if (countError) {
    console.error('Error checking furniture count:', countError);
    return res.status(500).json({
      success: false,
      error: 'Failed to check furniture limit'
    });
  }

  const maxFurniture = building.customer?.max_furniture_per_building || 50;
  if (existingFurniture && existingFurniture.length >= maxFurniture) {
    return res.status(400).json({
      success: false,
      error: `Building has reached maximum furniture limit (${maxFurniture} items)`
    });
  }

  // Validate collision type
  const validCollisionTypes = ['box', 'sphere', 'cylinder', 'custom', 'none'];
  if (collision_type && !validCollisionTypes.includes(collision_type)) {
    return res.status(400).json({
      success: false,
      error: `Invalid collision type. Must be one of: ${validCollisionTypes.join(', ')}`
    });
  }

  // Validate scale values
  if (scale_x <= 0 || scale_y <= 0 || scale_z <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Scale values must be greater than 0'
    });
  }

  // Create furniture
  const { data: newFurniture, error: createError } = await supabase
    .from('building_furniture')
    .insert({
      building_id,
      furniture_type,
      furniture_model,
      name,
      position_x: parseFloat(position_x),
      position_y: parseFloat(position_y),
      position_z: parseFloat(position_z),
      rotation_x: parseFloat(rotation_x),
      rotation_y: parseFloat(rotation_y),
      rotation_z: parseFloat(rotation_z),
      scale_x: parseFloat(scale_x),
      scale_y: parseFloat(scale_y),
      scale_z: parseFloat(scale_z),
      color,
      texture,
      material,
      has_collision,
      collision_type,
      collision_radius: collision_radius ? parseFloat(collision_radius) : null,
      is_interactive,
      interaction_type,
      interaction_data,
      properties,
      display_order: parseInt(display_order),
      active: true
    })
    .select(`
      *,
      building:buildings(id, name, slug)
    `)
    .single();

  if (createError) {
    console.error('Error creating furniture:', createError);
    return res.status(500).json({
      success: false,
      error: 'Failed to create furniture',
      details: createError.message
    });
  }

  return res.status(201).json({
    success: true,
    message: 'Furniture created successfully',
    furniture: newFurniture
  });
}
