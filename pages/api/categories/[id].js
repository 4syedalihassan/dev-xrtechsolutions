// Single Category Management API - Supabase Integration
// GET /api/categories/[id] - Get single category
// PUT /api/categories/[id] - Update category (Admin only)
// DELETE /api/categories/[id] - Delete category (Admin only)
// Sprint 1 - User Story 1.5

import { createClient } from '@supabase/supabase-js';
import { requireAdminAPI } from '../../../lib/apiAuth';

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
    console.error('Category API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

// GET - Get single category
async function handleGet(req, res, id) {
  const { data, error } = await supabase
    .from('product_categories')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }
    console.error('Error fetching category:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch category',
      details: error.message
    });
  }

  return res.status(200).json({
    success: true,
    category: data
  });
}

// PUT - Update category (Admin only)
async function handlePut(req, res, id) {
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

  // Check if category exists
  const { data: existing } = await supabase
    .from('product_categories')
    .select('id')
    .eq('id', id)
    .single();

  if (!existing) {
    return res.status(404).json({
      success: false,
      error: 'Category not found'
    });
  }

  // Check for duplicate name (excluding current category)
  const { data: duplicate } = await supabase
    .from('product_categories')
    .select('id')
    .ilike('name', name)
    .neq('id', id)
    .single();

  if (duplicate) {
    return res.status(400).json({
      success: false,
      error: 'Category with this name already exists'
    });
  }

  // Update category
  const { data, error } = await supabase
    .from('product_categories')
    .update({
      name,
      description: description || null,
      icon_url: icon_url || null
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating category:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update category',
      details: error.message
    });
  }

  return res.status(200).json({
    success: true,
    category: data
  });
}

// DELETE - Delete category (Admin only)
async function handleDelete(req, res, id) {
  // Require admin authentication
  const user = await requireAdminAPI(req, res);
  if (!user) return; // Response already sent by middleware

  // Check if any products use this category
  const { data: products } = await supabase
    .from('products')
    .select('id')
    .eq('category_id', id);

  if (products && products.length > 0) {
    return res.status(400).json({
      success: false,
      error: `Cannot delete category. ${products.length} product(s) are using this category.`
    });
  }

  // Delete category
  const { error } = await supabase
    .from('product_categories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting category:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete category',
      details: error.message
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Category deleted successfully'
  });
}
