// Individual Building API - Supabase Integration
// GET /api/buildings/[id] - Get building details
// PUT /api/buildings/[id] - Update building
// DELETE /api/buildings/[id] - Delete building
// Sprint 2 - User Story 2.2

import { createClient } from '@supabase/supabase-js';

// Check if Supabase is configured
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export default async function handler(req, res) {
  const { id } = req.query;
  const { method } = req;

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
    console.error('Building API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

// GET - Get building by ID or slug
async function handleGet(req, res, id) {
  // Return 404 if Supabase is not configured
  if (!supabase) {
    return res.status(404).json({
      success: false,
      error: 'Building not found'
    });
  }

  // Check if id is a UUID or slug
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  let query = supabase
    .from('buildings')
    .select(`
      *,
      customer:customers(id, name, email, company_name, subscription_tier, status),
      template:building_templates(id, name, type, width, depth, wall_height)
    `);

  // Use appropriate field for lookup
  if (isUUID) {
    query = query.eq('id', id);
  } else {
    query = query.eq('slug', id);
  }

  const { data, error } = await query.single();

  if (error) {
    if (error.code === 'PGRST116') {
      return res.status(404).json({
        success: false,
        error: 'Building not found'
      });
    }
    console.error('Error fetching building:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch building',
      details: error.message
    });
  }

  return res.status(200).json({
    success: true,
    building: data
  });
}

// PUT - Update building
async function handlePut(req, res, id) {
  const {
    name,
    status,
    is_operational,
    signage_text,
    background_music_url,
    description,
    logo_url
  } = req.body;

  // Check if building exists
  const { data: existing } = await supabase
    .from('buildings')
    .select('id, slug')
    .eq('id', id)
    .single();

  if (!existing) {
    return res.status(404).json({
      success: false,
      error: 'Building not found'
    });
  }

  // Build update object
  const updates = {};
  // Validate inputs
  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Building name must be at least 3 characters long'
      });
    }
    updates.name = name.trim();

    // Update slug if name changes
    const newSlug = updates.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Only update slug if it's different and unique
    if (newSlug !== existing.slug) {
      const { data: duplicateSlug } = await supabase
        .from('buildings')
        .select('id')
        .eq('slug', newSlug)
        .neq('id', id)
        .single();

      if (duplicateSlug) {
        return res.status(409).json({
          success: false,
          error: 'Building name already exists (slug conflict)'
        });
      }
      updates.slug = newSlug;
    }
  }

  if (status !== undefined) {
    const validStatuses = ['active', 'inactive', 'maintenance', 'construction'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }
    updates.status = status;
  }

  if (is_operational !== undefined) updates.is_operational = !!is_operational;

  if (signage_text !== undefined) {
    if (signage_text && signage_text.length > 50) {
      return res.status(400).json({
        success: false,
        error: 'Signage text must be 50 characters or less'
      });
    }
    updates.signage_text = signage_text;
  }

  if (background_music_url !== undefined) updates.background_music_url = background_music_url;
  if (description !== undefined) updates.description = description;
  if (logo_url !== undefined) updates.logo_url = logo_url;

  // Update building
  const { data, error } = await supabase
    .from('buildings')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      customer:customers(id, name, email, company_name),
      template:building_templates(id, name, type, width, depth, wall_height)
    `)
    .single();

  if (error) {
    console.error('Error updating building:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update building',
      details: error.message
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Building updated successfully',
    building: data
  });
}

// DELETE - Delete building
async function handleDelete(req, res, id) {
  // Check if building has furniture
  const { data: furniture } = await supabase
    .from('building_furniture')
    .select('id')
    .eq('building_id', id);

  if (furniture && furniture.length > 0) {
    return res.status(400).json({
      success: false,
      error: `Cannot delete building with ${furniture.length} furniture item(s). Remove furniture first.`
    });
  }

  // Check if building has products
  const { data: products } = await supabase
    .from('products')
    .select('id')
    .eq('building_id', id);

  if (products && products.length > 0) {
    return res.status(400).json({
      success: false,
      error: `Cannot delete building with ${products.length} product(s). Remove products first.`
    });
  }

  // Delete building
  const { error } = await supabase
    .from('buildings')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting building:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete building',
      details: error.message
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Building deleted successfully'
  });
}
