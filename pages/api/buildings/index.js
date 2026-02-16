// Buildings API - Supabase Integration
// GET /api/buildings - List all buildings
// POST /api/buildings - Create new building (Admin only)
// Sprint 2 - User Story 2.2, 2.3

import { createClient } from '@supabase/supabase-js';
import { calculateBuildingPosition, validatePosition } from '../../../lib/autoPlacement';
import { requireAdminAPI, optionalAdminAPI } from '../../../lib/apiAuth';

// Check if Supabase is configured
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

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
    console.error('Buildings API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

// GET - List all buildings
async function handleGet(req, res) {
  // Return empty array if Supabase is not configured
  if (!supabase) {
    return res.status(200).json({
      success: true,
      buildings: [],
      count: 0
    });
  }

  // Check if admin to allow seeing non-operational buildings
  const adminUser = await optionalAdminAPI(req, res);
  const isAdmin = !!adminUser;

  const { customer_id, status, template_id, page = 1, limit = 20 } = req.query;

  // Calculate pagination range
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const from = (pageNum - 1) * limitNum;
  const to = from + limitNum - 1;

  let query = supabase
    .from('buildings')
    .select(`
      *,
      customer:customers(id, name, email, company_name, subscription_tier, status),
      template:building_templates(id, name, type, width, depth, wall_height),
      furniture:building_furniture(
        id,
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
      )
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  // Filter by customer
  if (customer_id) {
    query = query.eq('customer_id', customer_id);
  }

  // Filter by status
  if (status && ['OPEN', 'CLOSED', 'MAINTENANCE'].includes(status)) {
    query = query.eq('status', status);
  }

  // Filter by template
  if (template_id) {
    query = query.eq('template_id', template_id);
  }

  // Enforce operational only for non-admins (public)
  if (!isAdmin) {
    // If specific status was requested by public, we only allow if it is OPEN (which implies operational usually, but depends on schema)
    // Schema: status enum ('OPEN', 'CLOSED', 'MAINTENANCE', 'CONSTRUCTION')
    // Schema: is_operational BOOLEAN
    query = query.eq('is_operational', true);
  }

  // Filter by template
  if (template_id) {
    query = query.eq('template_id', template_id);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching buildings:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch buildings',
      details: error.message
    });
  }

  return res.status(200).json({
    success: true,
    buildings: data,
    count: count || 0,
    page: pageNum,
    totalPages: Math.ceil((count || 0) / limitNum)
  });
}

// POST - Create new building (Admin only)
async function handlePost(req, res) {
  // Require admin authentication
  const user = await requireAdminAPI(req, res);
  if (!user) return; // Response already sent by middleware

  const {
    customer_id,
    template_id,
    name,
    placement,
    signage_text,
    background_music_url
  } = req.body;

  // Validation
  if (!customer_id || !template_id || !name) {
    return res.status(400).json({
      success: false,
      error: 'customer_id, template_id, and name are required'
    });
  }

  // Verify customer exists
  const { data: customer } = await supabase
    .from('customers')
    .select('id, name')
    .eq('id', customer_id)
    .single();

  if (!customer) {
    return res.status(404).json({
      success: false,
      error: 'Customer not found'
    });
  }

  // Verify template exists
  const { data: template } = await supabase
    .from('building_templates')
    .select('*')
    .eq('id', template_id)
    .single();

  if (!template) {
    return res.status(404).json({
      success: false,
      error: 'Building template not found'
    });
  }

  // Generate unique slug
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  let slug = baseSlug;
  let counter = 1;

  // Check for duplicate slugs
  while (true) {
    const { data: existing } = await supabase
      .from('buildings')
      .select('id')
      .eq('slug', slug)
      .single();

    if (!existing) break;

    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  // Get existing buildings for this customer for auto-placement
  const { data: existingBuildings } = await supabase
    .from('buildings')
    .select('id, name, position_x, position_y, position_z, template:building_templates(width, depth)')
    .eq('customer_id', customer_id);

  // Use enhanced auto-placement algorithm (US 2.3)
  const calculatedPosition = calculateBuildingPosition(
    existingBuildings || [],
    template,
    placement || 'center'
  );

  // Validate position doesn't overlap
  const validation = validatePosition(existingBuildings || [], template, calculatedPosition);
  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      error: 'Invalid building position',
      details: validation.message
    });
  }

  const { position_x, position_y, position_z } = calculatedPosition;

  // Create building
  const { data: building, error: createError } = await supabase
    .from('buildings')
    .insert({
      customer_id,
      template_id,
      name,
      slug,
      status: 'OPEN',
      is_operational: true,
      position_x,
      position_y: 0,
      position_z,
      placement: placement || 'center',
      signage_text: signage_text || template.default_signage_text,
      signage_width: template.default_signage_width,
      signage_height: template.default_signage_height,
      background_music_url: background_music_url || null
    })
    .select(`
      *,
      customer:customers(id, name, email, company_name),
      template:building_templates(id, name, type, width, depth, wall_height)
    `)
    .single();

  if (createError) {
    console.error('Error creating building:', createError);
    return res.status(500).json({
      success: false,
      error: 'Failed to create building',
      details: createError.message
    });
  }

  return res.status(201).json({
    success: true,
    message: 'Building created successfully',
    building
  });
}
