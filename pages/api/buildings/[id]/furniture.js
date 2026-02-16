// Building Furniture API - Get all furniture for a specific building
// GET /api/buildings/[id]/furniture - List all furniture in a building
// Sprint 3 - User Story 3.1

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { method, query } = req;
  const { id: building_id } = query;

  // Validate building ID
  if (!building_id) {
    return res.status(400).json({
      success: false,
      error: 'Building ID is required'
    });
  }

  try {
    switch (method) {
      case 'GET':
        return handleGet(req, res, building_id);

      default:
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({
          success: false,
          error: `Method ${method} not allowed`
        });
    }
  } catch (error) {
    console.error('Building Furniture API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

// GET - List all furniture in a building
async function handleGet(req, res, building_id) {
  const { furniture_type, active = 'true' } = req.query;

  // First, verify building exists
  const { data: building, error: buildingError } = await supabase
    .from('buildings')
    .select('id, name, slug, customer_id, customer:customers(id, name, max_furniture_per_building)')
    .eq('id', building_id)
    .single();

  if (buildingError || !building) {
    return res.status(404).json({
      success: false,
      error: 'Building not found'
    });
  }

  // Build query for furniture
  let query = supabase
    .from('building_furniture')
    .select('*')
    .eq('building_id', building_id)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  // Apply filters
  if (furniture_type) {
    query = query.eq('furniture_type', furniture_type);
  }

  if (active !== undefined) {
    query = query.eq('active', active === 'true');
  }

  const { data: furniture, error } = await query;

  if (error) {
    console.error('Error fetching building furniture:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch furniture',
      details: error.message
    });
  }

  // Calculate usage statistics
  const activeFurniture = furniture.filter(f => f.active);
  const maxFurniture = building.customer?.max_furniture_per_building || 50;
  const usagePercentage = (activeFurniture.length / maxFurniture) * 100;

  // Group by furniture type
  const furnitureByType = furniture.reduce((acc, item) => {
    const type = item.furniture_type || 'unknown';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(item);
    return acc;
  }, {});

  return res.status(200).json({
    success: true,
    building: {
      id: building.id,
      name: building.name,
      slug: building.slug
    },
    furniture,
    count: furniture.length,
    active_count: activeFurniture.length,
    statistics: {
      max_furniture: maxFurniture,
      used_slots: activeFurniture.length,
      available_slots: maxFurniture - activeFurniture.length,
      usage_percentage: Math.round(usagePercentage),
      by_type: Object.keys(furnitureByType).map(type => ({
        type,
        count: furnitureByType[type].length,
        active_count: furnitureByType[type].filter(f => f.active).length
      }))
    }
  });
}
