import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * API: GET /api/buildings/[id]/products
 * Purpose: Fetch all products assigned to a specific building with shelf positions
 * Used by: 3D world to display products on perfume shop shelves
 */
export default async function handler(req, res) {
  const { id } = req.query; // building ID

  // Only GET method supported
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // First, check if id is a UUID or a slug
    let buildingId = id;

    // If id is not a valid UUID format, look it up by slug
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      console.log(`[Building Products API] Looking up building by slug: ${id}`);
      const { data: building, error: buildingError } = await supabase
        .from('buildings')
        .select('id')
        .eq('slug', id)
        .single();

      if (buildingError || !building) {
        console.error('[Building Products API] Building not found:', buildingError);
        return res.status(404).json({
          success: false,
          error: 'Building not found',
          details: `No building found with slug: ${id}`
        });
      }

      buildingId = building.id;
      console.log(`[Building Products API] Found building UUID: ${buildingId}`);
    }

    // Fetch products directly from the products table
    // (Schema change: building_products table does not exist, products have building_id)
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        brand,
        description,
        price,
        image_url,
        model_3d_url,
        shelf_index,
        slot_index,
        stock_quantity,
        sku,
        category_id,
        product_categories (
          id,
          name
        )
      `)
      .eq('building_id', buildingId)
      .not('shelf_index', 'is', null) // Only fetch products assigned to a shelf
      .order('shelf_index', { ascending: true })
      .order('slot_index', { ascending: true });

    if (error) {
      console.error('[Building Products API] Supabase error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch building products',
        details: error.message
      });
    }

    const activeProducts = products || [];

    // Group products by shelf for easier 3D rendering
    const productsByShelf = {};
    try {
      if (activeProducts.length > 0) {
        activeProducts.forEach(product => {
          // Simulate the building_product wrapper structure expected by frontend
          const shelfIdx = product.shelf_index !== null ? product.shelf_index : 'unassigned';

          if (!productsByShelf[shelfIdx]) {
            productsByShelf[shelfIdx] = [];
          }

          // Construct the item compatible with existing frontend logic
          productsByShelf[shelfIdx].push({
            id: product.id, // Use product ID as the ID
            buildingProductId: product.id,
            productId: product.id,
            shelfIndex: product.shelf_index,
            slotIndex: product.slot_index,
            // Default positions as they are not in products table
            position: {
              x: 0,
              y: 0,
              z: 0
            },
            displayOrder: (product.shelf_index * 100) + product.slot_index,
            isFeatured: false, // Default to false as column missing
            product: product // Nest the product object itself
          });
        });
      }
    } catch (err) {
      console.error('[Building Products API] Error processing products:', err);
      throw err;
    }

    // Calculate statistics
    const stats = {
      total_products: activeProducts.length,
      total_shelves: Object.keys(productsByShelf).filter(k => k !== 'unassigned').length,
      featured_products: 0,
      products_by_shelf: Object.keys(productsByShelf).reduce((acc, shelf) => {
        acc[shelf] = productsByShelf[shelf].length;
        return acc;
      }, {})
    };

    console.log(`[Building Products API] Fetched ${activeProducts.length} products for building ${buildingId}`);

    return res.status(200).json({
      success: true,
      building_id: buildingId,
      products: Object.values(productsByShelf).flat(),
      stats: stats
    });
  } catch (error) {
    console.error('[Building Products API] Critical error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
