// =====================================================
// ADMIN REVIEWS API
// List all reviews (admin only)
// =====================================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export default async function handler(req, res) {
  const { method } = req;

  // Only allow GET for listing reviews
  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({
      success: false,
      error: `Method ${method} Not Allowed`
    });
  }

  try {
    const { status, limit = 50, offset = 0, search } = req.query;

    // Return error if Supabase not configured
    if (!supabase) {
      return res.status(500).json({
        success: false,
        error: 'Database not configured. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.',
        reviews: [],
        total: 0
      });
    }

    let query = supabase
      .from('reviews')
      .select(`
        *,
        products:product_id (
          id,
          name,
          brand,
          image_url
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    // Filter by status if provided
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Search filter - sanitize input by escaping special characters
    if (search) {
      // Escape special SQL characters to prevent injection
      const sanitizedSearch = search.replace(/[%_\\]/g, '\\$&');
      query = query.or(`customer_name.ilike.%${sanitizedSearch}%,title.ilike.%${sanitizedSearch}%,comment.ilike.%${sanitizedSearch}%`);
    }

    const { data: reviews, error, count } = await query;

    if (error) {
      // Return empty if table doesn't exist yet
      if (error.code === '42P01') {
        return res.status(200).json({
          success: true,
          reviews: [],
          total: 0,
          message: 'Reviews table not found. Please run the database migration.'
        });
      }
      throw error;
    }

    // Transform data to include product_name
    const transformedReviews = (reviews || []).map(review => ({
      ...review,
      product_name: review.products?.name || 'Unknown Product',
      product_brand: review.products?.brand,
      product_image: review.products?.image_url
    }));

    return res.status(200).json({
      success: true,
      reviews: transformedReviews,
      total: count || transformedReviews.length
    });
  } catch (error) {
    console.error('Admin Reviews API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch reviews',
      reviews: [],
      total: 0
    });
  }
}
