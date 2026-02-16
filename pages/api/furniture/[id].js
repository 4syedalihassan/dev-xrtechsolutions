// Furniture API - Get, Update, Delete Individual Item
// GET /api/furniture/[id] - Get furniture details
// PUT /api/furniture/[id] - Update furniture item
// DELETE /api/furniture/[id] - Delete furniture item
// Sprint 3 - User Story 3.1

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { method, query } = req;
  const { id } = query;

  // Validate furniture ID
  if (!id) {
    return res.status(400).json({
      success: false,
      error: 'Furniture ID is required'
    });
  }

  try {
    switch (method) {
      case 'GET':
        return handleGet(req, res, id);

      case 'PUT':
        return handlePut(req, res, id);

      case 'DELETE':
        return handleDelete(req, res, id);

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
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

// GET - Get furniture details
async function handleGet(req, res, id) {
  const { data: furniture, error } = await supabase
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
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching furniture:', error);
    return res.status(404).json({
      success: false,
      error: 'Furniture not found',
      details: error.message
    });
  }

  return res.status(200).json({
    success: true,
    furniture
  });
}

// PUT - Update furniture
async function handlePut(req, res, id) {
  const {
    furniture_type,
    furniture_model,
    name,
    position_x,
    position_y,
    position_z,
    rotation_x,
    rotation_y,
    rotation_z,
    scale_x,
    scale_y,
    scale_z,
    color,
    texture,
    material,
    has_collision,
    collision_type,
    collision_radius,
    is_interactive,
    interaction_type,
    interaction_data,
    properties,
    display_order,
    active
  } = req.body;

  // Check if furniture exists
  const { data: existingFurniture, error: existError } = await supabase
    .from('building_furniture')
    .select('id, building_id')
    .eq('id', id)
    .single();

  if (existError || !existingFurniture) {
    return res.status(404).json({
      success: false,
      error: 'Furniture not found'
    });
  }

  // Build update object with only provided fields
  const updates = {};

  if (furniture_type !== undefined) updates.furniture_type = furniture_type;
  if (furniture_model !== undefined) updates.furniture_model = furniture_model;
  if (name !== undefined) updates.name = name;
  if (position_x !== undefined) updates.position_x = parseFloat(position_x);
  if (position_y !== undefined) updates.position_y = parseFloat(position_y);
  if (position_z !== undefined) updates.position_z = parseFloat(position_z);
  if (rotation_x !== undefined) updates.rotation_x = parseFloat(rotation_x);
  if (rotation_y !== undefined) updates.rotation_y = parseFloat(rotation_y);
  if (rotation_z !== undefined) updates.rotation_z = parseFloat(rotation_z);
  if (scale_x !== undefined) updates.scale_x = parseFloat(scale_x);
  if (scale_y !== undefined) updates.scale_y = parseFloat(scale_y);
  if (scale_z !== undefined) updates.scale_z = parseFloat(scale_z);
  if (color !== undefined) updates.color = color;
  if (texture !== undefined) updates.texture = texture;
  if (material !== undefined) updates.material = material;
  if (has_collision !== undefined) updates.has_collision = has_collision;
  if (collision_type !== undefined) updates.collision_type = collision_type;
  if (collision_radius !== undefined) updates.collision_radius = collision_radius ? parseFloat(collision_radius) : null;
  if (is_interactive !== undefined) updates.is_interactive = is_interactive;
  if (interaction_type !== undefined) updates.interaction_type = interaction_type;
  if (interaction_data !== undefined) updates.interaction_data = interaction_data;
  if (properties !== undefined) updates.properties = properties;
  if (display_order !== undefined) updates.display_order = parseInt(display_order);
  if (active !== undefined) updates.active = active;

  // Validate collision type if provided
  if (collision_type) {
    const validCollisionTypes = ['box', 'sphere', 'cylinder', 'custom', 'none'];
    if (!validCollisionTypes.includes(collision_type)) {
      return res.status(400).json({
        success: false,
        error: `Invalid collision type. Must be one of: ${validCollisionTypes.join(', ')}`
      });
    }
  }

  // Validate scale values if provided
  if (scale_x !== undefined && scale_x <= 0) {
    return res.status(400).json({
      success: false,
      error: 'scale_x must be greater than 0'
    });
  }
  if (scale_y !== undefined && scale_y <= 0) {
    return res.status(400).json({
      success: false,
      error: 'scale_y must be greater than 0'
    });
  }
  if (scale_z !== undefined && scale_z <= 0) {
    return res.status(400).json({
      success: false,
      error: 'scale_z must be greater than 0'
    });
  }

  // Update furniture
  const { data: updatedFurniture, error: updateError } = await supabase
    .from('building_furniture')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      building:buildings(id, name, slug)
    `)
    .single();

  if (updateError) {
    console.error('Error updating furniture:', updateError);
    return res.status(500).json({
      success: false,
      error: 'Failed to update furniture',
      details: updateError.message
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Furniture updated successfully',
    furniture: updatedFurniture
  });
}

// DELETE - Delete furniture
async function handleDelete(req, res, id) {
  // Check if furniture exists
  const { data: existingFurniture, error: existError } = await supabase
    .from('building_furniture')
    .select('id, name, building_id')
    .eq('id', id)
    .single();

  if (existError || !existingFurniture) {
    return res.status(404).json({
      success: false,
      error: 'Furniture not found'
    });
  }

  // Soft delete by setting active = false
  const { error: deleteError } = await supabase
    .from('building_furniture')
    .update({ active: false })
    .eq('id', id);

  if (deleteError) {
    console.error('Error deleting furniture:', deleteError);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete furniture',
      details: deleteError.message
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Furniture deleted successfully',
    furniture_id: id
  });
}
