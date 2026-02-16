// Single Product API - Supabase Integration
// GET /api/products/[id] - Get single product
// PUT /api/products/[id] - Update product (Admin only)
// DELETE /api/products/[id] - Delete product (Admin only)
// Sprint 2 - User Story 2.5

import { createClient } from '@supabase/supabase-js';
import { requireAdminAPI } from '../../../lib/apiAuth';
import { isSlotAvailable } from '../../../lib/slotAssignment';

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
    console.error('Product API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

// GET - Get product by ID
async function handleGet(req, res, id) {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      building:buildings(id, name),
      category:product_categories(id, name),
      furniture:building_furniture(id, custom_name)
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    console.error('Error fetching product:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch product',
      details: error.message
    });
  }

  return res.status(200).json({
    success: true,
    product: data
  });
}

// PUT - Update product (Admin only)
async function handlePut(req, res, id) {
  // Require admin authentication
  const user = await requireAdminAPI(req, res);
  if (!user) return; // Response already sent by middleware

  const {
    name,
    brand,
    category_id,
    description,
    price,
    sku,
    size_ml,
    fragrance_notes,
    gender,
    stock_quantity,
    shelf_index,
    slot_index,
    image_url,
    model_3d_url
  } = req.body;

  console.log('[Products API] UPDATE request for ID:', id, {
    name,
    image_url,
    model_3d_url
  });

  // Check if product exists
  const { data: existing } = await supabase
    .from('products')
    .select('id, furniture_id')
    .eq('id', id)
    .single();

  if (!existing) {
    return res.status(404).json({
      success: false,
      error: 'Product not found'
    });
  }

  // If shelf/slot is changing, check if new position is available
  if (existing.furniture_id && (shelf_index !== undefined || slot_index !== undefined)) {
    const { data: currentProduct } = await supabase
      .from('products')
      .select('shelf_index, slot_index')
      .eq('id', id)
      .single();

    const newShelfIndex = shelf_index !== undefined ? shelf_index : currentProduct.shelf_index;
    const newSlotIndex = slot_index !== undefined ? slot_index : currentProduct.slot_index;

    // Use the slotAssignment utility to check availability (excluding current product)
    const available = await isSlotAvailable(supabase, {
      furnitureId: existing.furniture_id,
      shelfIndex: newShelfIndex,
      slotIndex: newSlotIndex,
      excludeProductId: id
    });

    if (!available) {
      // Fetch conflicting product details for better error message
      const { data: conflictingProduct } = await supabase
        .from('products')
        .select('id, name')
        .eq('furniture_id', existing.furniture_id)
        .eq('shelf_index', newShelfIndex)
        .eq('slot_index', newSlotIndex)
        .neq('id', id)
        .single();

      return res.status(400).json({
        success: false,
        error: `Shelf ${newShelfIndex}, Slot ${newSlotIndex} is already occupied${conflictingProduct ? ` by ${conflictingProduct.name}` : ''}`
      });
    }
  }

  // Check SKU uniqueness if changing
  if (sku) {
    const { data: existingSKU } = await supabase
      .from('products')
      .select('id')
      .eq('sku', sku)
      .neq('id', id)
      .single();

    if (existingSKU) {
      return res.status(400).json({
        success: false,
        error: 'SKU already exists'
      });
    }
  }

  // Build update object
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (brand !== undefined) updates.brand = brand;
  if (category_id !== undefined) updates.category_id = category_id;
  if (description !== undefined) updates.description = description;
  if (price !== undefined) updates.price = parseFloat(price);
  if (sku !== undefined) updates.sku = sku;
  if (size_ml !== undefined) updates.size_ml = parseInt(size_ml);
  if (fragrance_notes !== undefined) updates.fragrance_notes = fragrance_notes;
  if (gender !== undefined) updates.gender = gender;
  if (stock_quantity !== undefined) updates.stock_quantity = parseInt(stock_quantity);
  if (shelf_index !== undefined) updates.shelf_index = parseInt(shelf_index);
  if (slot_index !== undefined) updates.slot_index = parseInt(slot_index);
  if (image_url !== undefined) updates.image_url = image_url;
  if (model_3d_url !== undefined) updates.model_3d_url = model_3d_url;

  // Update product
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      building:buildings(id, name),
      category:product_categories(id, name),
      furniture:building_furniture(id, custom_name)
    `)
    .single();

  if (error) {
    console.error('[Products API] Error updating product:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update product',
      details: error.message
    });
  }

  console.log('[Products API] Product updated successfully:', {
    id: data.id,
    name: data.name,
    image_url: data.image_url,
    model_3d_url: data.model_3d_url
  });

  return res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    product: data
  });
}

// DELETE - Delete product (Admin only)
async function handleDelete(req, res, id) {
  // Require admin authentication
  const user = await requireAdminAPI(req, res);
  if (!user) return; // Response already sent by middleware

  // Delete product
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete product',
      details: error.message
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Product deleted successfully'
  });
}
