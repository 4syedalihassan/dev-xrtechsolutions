// =====================================================
// PRODUCT RECOMMENDATIONS API
// Remaining Feature: Product Recommendation Engine
// =====================================================

import { createClient } from '@supabase/supabase-js';

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
        return await getRecommendations(req, res);
      default:
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({
          success: false,
          error: `Method ${method} Not Allowed`
        });
    }
  } catch (error) {
    console.error('Recommendations API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

// GET: Get Product Recommendations
async function getRecommendations(req, res) {
  const { 
    product_id,      // Get similar products
    category_id,     // Get products from category
    customer_id,     // Personalized recommendations
    type = 'similar', // 'similar', 'trending', 'new', 'frequently_bought', 'personalized'
    limit = 8
  } = req.query;

  // Return empty if Supabase not configured
  if (!supabase) {
    return res.status(200).json({
      success: true,
      recommendations: [],
      type
    });
  }

  try {
    let recommendations = [];

    switch (type) {
      case 'similar':
        recommendations = await getSimilarProducts(product_id, parseInt(limit));
        break;
      case 'trending':
        recommendations = await getTrendingProducts(parseInt(limit));
        break;
      case 'new':
        recommendations = await getNewArrivals(parseInt(limit));
        break;
      case 'frequently_bought':
        recommendations = await getFrequentlyBoughtTogether(product_id, parseInt(limit));
        break;
      case 'personalized':
        recommendations = await getPersonalizedRecommendations(customer_id, parseInt(limit));
        break;
      case 'category':
        recommendations = await getCategoryProducts(category_id, product_id, parseInt(limit));
        break;
      default:
        recommendations = await getTrendingProducts(parseInt(limit));
    }

    return res.status(200).json({
      success: true,
      recommendations,
      type,
      count: recommendations.length
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return res.status(200).json({
      success: true,
      recommendations: [],
      type
    });
  }
}

// Get similar products based on category and brand
async function getSimilarProducts(product_id, limit) {
  if (!product_id) return [];

  // Get the source product
  const { data: sourceProduct, error: sourceError } = await supabase
    .from('products')
    .select('id, category_id, brand, price')
    .eq('id', product_id)
    .single();

  if (sourceError || !sourceProduct) return [];

  // Get similar products (same category or brand)
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, brand, price, image_url, category_id')
    .neq('id', product_id)
    .or(`category_id.eq.${sourceProduct.category_id},brand.eq.${sourceProduct.brand}`)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching similar products:', error);
    return [];
  }

  // Score and sort by relevance
  const scored = products.map(p => ({
    ...p,
    score: calculateSimilarityScore(sourceProduct, p)
  }));

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// Get trending products (most viewed/ordered)
async function getTrendingProducts(limit) {
  // Try to get products with high order count
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, brand, price, image_url')
    .gt('stock_quantity', 0)
    .order('created_at', { ascending: false })
    .limit(limit * 2);

  if (error) {
    console.error('Error fetching trending products:', error);
    return [];
  }

  // Shuffle and return
  return shuffleArray(products || []).slice(0, limit);
}

// Get new arrivals
async function getNewArrivals(limit) {
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, brand, price, image_url')
    .gt('stock_quantity', 0)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching new arrivals:', error);
    return [];
  }

  return products || [];
}

// Get frequently bought together
async function getFrequentlyBoughtTogether(product_id, limit) {
  if (!product_id) return [];

  // Get orders containing this product
  const { data: orderItems, error: orderError } = await supabase
    .from('order_items')
    .select('order_id')
    .eq('product_id', product_id);

  if (orderError || !orderItems?.length) {
    // Fallback to similar products
    return getSimilarProducts(product_id, limit);
  }

  const orderIds = orderItems.map(item => item.order_id);

  // Get other products from those orders
  const { data: relatedItems, error: relatedError } = await supabase
    .from('order_items')
    .select(`
      product_id,
      products (
        id, name, brand, price, image_url
      )
    `)
    .in('order_id', orderIds)
    .neq('product_id', product_id);

  if (relatedError || !relatedItems) {
    return getSimilarProducts(product_id, limit);
  }

  // Count occurrences and get unique products
  const productCounts = {};
  relatedItems.forEach(item => {
    if (item.products) {
      const pid = item.product_id;
      if (!productCounts[pid]) {
        productCounts[pid] = { ...item.products, count: 0 };
      }
      productCounts[pid].count++;
    }
  });

  // Sort by frequency
  return Object.values(productCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

// Get personalized recommendations
async function getPersonalizedRecommendations(customer_id, limit) {
  if (!customer_id) {
    return getTrendingProducts(limit);
  }

  // Get customer's order history
  const { data: orders, error: orderError } = await supabase
    .from('orders')
    .select(`
      id,
      order_items (
        product_id,
        products (
          category_id,
          brand
        )
      )
    `)
    .eq('customer_id', customer_id)
    .order('created_at', { ascending: false })
    .limit(10);

  if (orderError || !orders?.length) {
    return getTrendingProducts(limit);
  }

  // Get preferred categories and brands
  const categories = [];
  const brands = [];
  const purchasedProducts = new Set();

  orders.forEach(order => {
    order.order_items?.forEach(item => {
      purchasedProducts.add(item.product_id);
      if (item.products?.category_id) categories.push(item.products.category_id);
      if (item.products?.brand) brands.push(item.products.brand);
    });
  });

  // Use parameterized queries to prevent SQL injection
  let products = [];
  
  // First try to get products from preferred categories
  if (categories.length > 0) {
    const { data: categoryProducts } = await supabase
      .from('products')
      .select('id, name, brand, price, image_url')
      .in('category_id', categories)
      .gt('stock_quantity', 0)
      .limit(limit * 2);
    
    if (categoryProducts) {
      products = [...products, ...categoryProducts];
    }
  }

  // Then get products from preferred brands
  if (brands.length > 0) {
    const { data: brandProducts } = await supabase
      .from('products')
      .select('id, name, brand, price, image_url')
      .in('brand', brands)
      .gt('stock_quantity', 0)
      .limit(limit * 2);
    
    if (brandProducts) {
      products = [...products, ...brandProducts];
    }
  }

  if (products.length === 0) {
    return getTrendingProducts(limit);
  }

  // Filter out purchased products and deduplicate
  const seen = new Set();
  const filtered = products
    .filter(p => {
      if (purchasedProducts.has(p.id) || seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    })
    .slice(0, limit);

  return filtered.length > 0 ? filtered : getTrendingProducts(limit);
}

// Get products from same category
async function getCategoryProducts(category_id, exclude_product_id, limit) {
  if (!category_id) return [];

  let query = supabase
    .from('products')
    .select('id, name, brand, price, image_url')
    .eq('category_id', category_id)
    .gt('stock_quantity', 0)
    .limit(limit);

  if (exclude_product_id) {
    query = query.neq('id', exclude_product_id);
  }

  const { data: products, error } = await query;

  if (error) {
    console.error('Error fetching category products:', error);
    return [];
  }

  return products || [];
}

// Calculate similarity score
function calculateSimilarityScore(source, target) {
  let score = 0;

  // Same category: +3 points
  if (source.category_id === target.category_id) score += 3;

  // Same brand: +2 points
  if (source.brand === target.brand) score += 2;

  // Similar price range (within 30%): +1 point
  const priceRatio = target.price / source.price;
  if (priceRatio >= 0.7 && priceRatio <= 1.3) score += 1;

  return score;
}

// Shuffle array (Fisher-Yates)
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
