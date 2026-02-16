// Building Templates API - Supabase Integration
// GET /api/building-templates - List all building templates
// Sprint 2 - User Story 2.1

import { createClient } from '@supabase/supabase-js';

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

      default:
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({
          success: false,
          error: `Method ${method} not allowed`
        });
    }
  } catch (error) {
    console.error('Building Templates API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

// GET - List all building templates
async function handleGet(req, res) {
  const { type } = req.query;

  let query = supabase
    .from('building_templates')
    .select('*')
    .order('type');

  // Filter by type if specified
  if (type && ['complex', 'shop'].includes(type)) {
    query = query.eq('type', type);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching building templates:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch building templates',
      details: error.message
    });
  }

  // Enrich templates with calculated properties
  const enrichedTemplates = data.map(template => ({
    ...template,
    area: template.width * template.depth,
    volume: template.width * template.depth * template.wall_height,
    perimeter: 2 * (template.width + template.depth),
    display_name: template.name,
    type_label: template.type === 'complex' ? 'Complex Building' : 'Shop Building'
  }));

  return res.status(200).json({
    success: true,
    templates: enrichedTemplates,
    count: enrichedTemplates.length
  });
}
