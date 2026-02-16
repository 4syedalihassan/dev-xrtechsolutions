// Products API - Supabase Integration
// GET /api/products - List all products
// POST /api/products - Create new product (Admin only)
// Sprint 2 - User Story 2.5

import { createClient } from '@supabase/supabase-js';
import { requireAdminAPI } from '../../../lib/apiAuth';
import { findNextAvailablePosition, isSlotAvailable } from '../../../lib/slotAssignment';
import { logAdminAPIAction } from '../../../lib/auditLog';

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
    console.error('Products API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

// GET - List all products
async function handleGet(req, res) {
  // Return empty array if Supabase is not configured
  if (!supabase) {
    return res.status(200).json({
      success: true,
      products: [],
      count: 0
    });
  }

  const { building_id, category_id, furniture_id, page = 1, limit = 20 } = req.query;

  // Calculate pagination range
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const from = (pageNum - 1) * limitNum;
  const to = from + limitNum - 1;

  let query = supabase
    .from('products')
    .select(`
      *,
      building:buildings(id, name),
      category:product_categories(id, name),
      furniture:building_furniture(id, custom_name)
    `, { count: 'exact' }) // Request exact count
    .order('created_at', { ascending: false })
    .range(from, to);

  // Filter by building
  if (building_id) {
    query = query.eq('building_id', building_id);
  }

  // Filter by category
  if (category_id) {
    query = query.eq('category_id', category_id);
  }

  // Filter by furniture
  if (furniture_id) {
    query = query.eq('furniture_id', furniture_id);
  }

  const { data, error, count } = await query;

  if (error) {
    console.warn('Error fetching products (returning empty):', error.message);
    return res.status(200).json({
      success: true,
      products: [],
      count: 0,
      page: 1,
      totalPages: 1
    });
  }

  return res.status(200).json({
    success: true,
    products: data || [],
    count: count || 0,
    page: pageNum,
    totalPages: Math.ceil((count || 0) / limitNum)
  });
}

// POST - Create new product (Admin only)
async function handlePost(req, res) {
  // Require admin authentication
  const user = await requireAdminAPI(req, res);
  if (!user) return; // Response already sent by middleware

  const {
    building_id,
    furniture_id,
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

  console.log('[Products API] CREATE request:', {
    name,
    brand,
    image_url,
    model_3d_url
  });

  // Validate required fields
  const fieldValidation = validateRequiredFields({ building_id, name, brand, category_id, price });
  if (!fieldValidation.valid) {
    return res.status(400).json({
      success: false,
      error: fieldValidation.error
    });
  }

  // Verify building exists
  const buildingValidation = await validateBuilding(supabase, building_id);
  if (!buildingValidation.valid) {
    return res.status(404).json({
      success: false,
      error: buildingValidation.error
    });
  }

  // Verify category exists
  const categoryValidation = await validateCategory(supabase, category_id);
  if (!categoryValidation.valid) {
    return res.status(404).json({
      success: false,
      error: categoryValidation.error
    });
  }

  // Handle slot assignment if furniture_id provided
  const slotAssignment = await handleSlotAssignment(
    supabase,
    furniture_id,
    shelf_index,
    slot_index
  );
  if (!slotAssignment.valid) {
    return res.status(slotAssignment.status || 400).json({
      success: false,
      error: slotAssignment.error
    });
  }

  // Check SKU uniqueness if provided
  if (sku) {
    const skuValidation = await validateUniqueSKU(supabase, sku);
    if (!skuValidation.valid) {
      return res.status(400).json({
        success: false,
        error: skuValidation.error
      });
    }
  }

  // Create product with retry logic
  const productData = {
    building_id,
    furniture_id: furniture_id || null,
    name,
    brand,
    category_id,
    description: description || null,
    price: parseFloat(price),
    sku: sku || null,
    size_ml: size_ml ? parseInt(size_ml) : null,
    fragrance_notes: fragrance_notes || null,
    gender: gender || 'Unisex',
    stock_quantity: stock_quantity ? parseInt(stock_quantity) : 0,
    shelf_index: slotAssignment.shelfIndex,
    slot_index: slotAssignment.slotIndex,
    image_url: image_url || null,
    model_3d_url: model_3d_url || null
  };

  const result = await createProductWithRetry(supabase, productData, furniture_id);

  if (!result.success) {
    return res.status(result.status || 500).json({
      success: false,
      error: result.error,
      details: result.details
    });
  }

  console.log('[Products API] Product created successfully:', {
    id: result.product.id,
    name: result.product.name,
    image_url: result.product.image_url,
    model_3d_url: result.product.model_3d_url
  });

  // Log admin action
  await logAdminAPIAction(
    req,
    'create',
    'product',
    result.product.id,
    {
      name: result.product.name,
      price: result.product.price,
      stock: result.product.stock_quantity
    }
  );

  return res.status(201).json({
    success: true,
    message: 'Product created successfully',
    product: result.product
  });
}

// Validation helper functions

function validateRequiredFields({ building_id, name, brand, category_id, price }) {
  if (!building_id || !name || !brand || !category_id || !price) {
    return {
      valid: false,
      error: 'building_id, name, brand, category_id, and price are required'
    };
  }
  return { valid: true };
}

async function validateBuilding(supabase, building_id) {
  const { data: building } = await supabase
    .from('buildings')
    .select('id, name')
    .eq('id', building_id)
    .single();

  if (!building) {
    return { valid: false, error: 'Building not found' };
  }
  return { valid: true };
}

async function validateCategory(supabase, category_id) {
  const { data: category } = await supabase
    .from('product_categories')
    .select('id, name')
    .eq('id', category_id)
    .single();

  if (!category) {
    return { valid: false, error: 'Category not found' };
  }
  return { valid: true };
}

async function validateUniqueSKU(supabase, sku) {
  const { data: existingSKU } = await supabase
    .from('products')
    .select('id')
    .eq('sku', sku)
    .single();

  if (existingSKU) {
    return { valid: false, error: 'SKU already exists' };
  }
  return { valid: true };
}

async function handleSlotAssignment(supabase, furniture_id, shelf_index, slot_index) {
  // No furniture - no slot assignment needed
  if (!furniture_id) {
    return {
      valid: true,
      shelfIndex: shelf_index !== undefined ? parseInt(shelf_index) : null,
      slotIndex: slot_index !== undefined ? parseInt(slot_index) : null
    };
  }

  // Verify furniture exists
  const { data: furniture } = await supabase
    .from('building_furniture')
    .select('id')
    .eq('id', furniture_id)
    .single();

  if (!furniture) {
    return { valid: false, error: 'Furniture not found', status: 404 };
  }

  // Auto-assign slot if not provided
  if (shelf_index === undefined || slot_index === undefined) {
    return await autoAssignSlot(supabase, furniture_id);
  }

  // Manual slot provided - validate availability
  return await validateManualSlot(supabase, furniture_id, shelf_index, slot_index);
}

async function autoAssignSlot(supabase, furniture_id) {
  console.log('[Products API] Auto-assigning slot position...');
  const autoPosition = await findNextAvailablePosition(supabase, furniture_id);

  if (!autoPosition) {
    return {
      valid: false,
      error: 'No available slots in this furniture. All positions are occupied.'
    };
  }

  console.log('[Products API] Auto-assigned position:', autoPosition);
  return {
    valid: true,
    shelfIndex: parseInt(autoPosition.shelfIndex),
    slotIndex: parseInt(autoPosition.slotIndex)
  };
}

async function validateManualSlot(supabase, furniture_id, shelf_index, slot_index) {
  const available = await isSlotAvailable(supabase, {
    furnitureId: furniture_id,
    shelfIndex: shelf_index,
    slotIndex: slot_index
  });

  if (!available) {
    const { data: existingProduct } = await supabase
      .from('products')
      .select('id, name')
      .eq('furniture_id', furniture_id)
      .eq('shelf_index', shelf_index)
      .eq('slot_index', slot_index)
      .single();

    return {
      valid: false,
      error: `Shelf ${shelf_index}, Slot ${slot_index} is already occupied${existingProduct ? ` by ${existingProduct.name}` : ''}. Try leaving the slot empty for auto-assignment.`
    };
  }

  return {
    valid: true,
    shelfIndex: parseInt(shelf_index),
    slotIndex: parseInt(slot_index)
  };
}

async function createProductWithRetry(supabase, productData, furniture_id) {
  let retryCount = 0;
  const maxRetries = 1;
  let finalShelfIndex = productData.shelf_index;
  let finalSlotIndex = productData.slot_index;

  while (retryCount <= maxRetries) {
    const insertResult = await attemptProductInsert(
      supabase,
      productData,
      finalShelfIndex,
      finalSlotIndex
    );

    // Success case - return immediately
    if (insertResult.success) {
      return { success: true, product: insertResult.product };
    }

    // Handle unique constraint violation (slot conflict)
    if (isUniqueConstraintError(insertResult.error)) {
      const retryResult = await handleSlotConflict(
        supabase,
        furniture_id,
        retryCount,
        maxRetries
      );

      if (retryResult.shouldRetry) {
        finalShelfIndex = retryResult.shelfIndex;
        finalSlotIndex = retryResult.slotIndex;
        retryCount++;
        continue;
      }

      return retryResult.error;
    }

    // Handle other errors
    return handleInsertError(insertResult.error);
  }
}

// Helper function to attempt product insertion
async function attemptProductInsert(supabase, productData, shelfIndex, slotIndex) {
  const result = await supabase
    .from('products')
    .insert({
      ...productData,
      shelf_index: shelfIndex,
      slot_index: slotIndex
    })
    .select(`
      *,
      building:buildings(id, name),
      category:product_categories(id, name),
      furniture:building_furniture(id, custom_name)
    `)
    .single();

  const { data: product, error } = result;

  if (error) {
    return { success: false, error };
  }

  return { success: true, product };
}

// Helper function to check if error is unique constraint violation
function isUniqueConstraintError(error) {
  return error &&
    error.code === '23505' &&
    error.message.includes('unique_furniture_slot');
}

// Helper function to handle slot conflict
async function handleSlotConflict(supabase, furniture_id, retryCount, maxRetries) {
  console.log('[Products API] Slot conflict detected, retrying with new position...');

  // Check if we can retry
  if (retryCount >= maxRetries || !furniture_id) {
    return {
      shouldRetry: false,
      error: {
        success: false,
        status: 409,
        error: 'The selected slot was just occupied by another request. Please try again.'
      }
    };
  }

  // Attempt to find new slot
  const retryResult = await retrySlotAssignment(supabase, furniture_id);
  if (!retryResult.success) {
    return {
      shouldRetry: false,
      error: retryResult
    };
  }

  return {
    shouldRetry: true,
    shelfIndex: retryResult.shelfIndex,
    slotIndex: retryResult.slotIndex
  };
}

// Helper function to handle general insert errors
function handleInsertError(error) {
  console.error('[Products API] Error creating product:', error);
  return {
    success: false,
    status: 500,
    error: 'Failed to create product',
    details: error.message
  };
}

async function retrySlotAssignment(supabase, furniture_id) {
  const newPosition = await findNextAvailablePosition(supabase, furniture_id);

  if (!newPosition) {
    return {
      success: false,
      status: 409,
      error: 'Unable to assign slot due to concurrent updates. All slots are occupied. Please try again.'
    };
  }

  console.log('[Products API] Retrying with new position:', newPosition);
  return {
    success: true,
    shelfIndex: parseInt(newPosition.shelfIndex),
    slotIndex: parseInt(newPosition.slotIndex)
  };
}
