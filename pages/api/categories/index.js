// Category Management API - Supabase Integration
// GET /api/categories - List all categories
// POST /api/categories - Create new category (Admin only)
// Sprint 1 - User Story 1.5

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
    console.error('Categories API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

// GET - List all categories
async function handleGet(req, res) {
  const { data, error } = await supabase
    .from('product_categories')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch categories',
      details: error.message
    });
  }

  return res.status(200).json({
    success: true,
    categories: data
  });
}

// POST - Create new category (Admin only)
async function handlePost(req, res) {
  // Require admin authentication
  const user = await requireAdminAPI(req, res);
  if (!user) return; // Response already sent by middleware

  const { name, description, icon_url } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      error: 'Category name is required'
    });
  }

  // Check for duplicate name
  const { data: existing } = await supabase
    .from('product_categories')
    .select('id')
    .ilike('name', name)
    .single();

  if (existing) {
    return res.status(400).json({
      success: false,
      error: 'Category with this name already exists'
    });
  }

  // Create category
  const { data, error } = await supabase
    .from('product_categories')
    .insert({
      name,
      description: description || null,
      icon_url: icon_url || null
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating category:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create category',
      details: error.message
    });
  }

  return res.status(201).json({
    success: true,
    category: data
  });
}
