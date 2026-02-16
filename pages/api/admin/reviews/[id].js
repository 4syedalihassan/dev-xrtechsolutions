// =====================================================
// ADMIN REVIEWS API - Individual Review
// Update/Delete specific review (admin only)
// =====================================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: 'Review ID is required'
    });
  }

  if (!supabase) {
    return res.status(500).json({
      success: false,
      error: 'Database not configured. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.'
    });
  }

  try {
    switch (method) {
      case 'GET':
        return await getReview(id, res);
      case 'PUT':
        return await updateReview(id, req.body, res);
      case 'DELETE':
        return await deleteReview(id, res);
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({
          success: false,
          error: `Method ${method} Not Allowed`
        });
    }
  } catch (error) {
    console.error('Admin Review API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

// GET: Get single review
async function getReview(id, res) {
  try {
    const { data: review, error } = await supabase
      .from('reviews')
      .select(`
        *,
        products:product_id (id, name, brand, image_url)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Review not found'
        });
      }
      throw error;
    }

    return res.status(200).json({
      success: true,
      review: {
        ...review,
        product_name: review.products?.name
      }
    });
  } catch (error) {
    console.error('Get review error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch review'
    });
  }
}

// PUT: Update review status or add admin response
async function updateReview(id, body, res) {
  const { status, admin_response } = body;

  try {
    const updateData = {};
    
    if (status) {
      updateData.status = status;
    }
    
    if (admin_response !== undefined) {
      updateData.admin_response = admin_response;
      updateData.admin_responded_at = new Date().toISOString();
    }

    const { data: review, error } = await supabase
      .from('reviews')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      review
    });
  } catch (error) {
    console.error('Update review error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to update review'
    });
  }
}

// DELETE: Delete review
async function deleteReview(id, res) {
  try {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete review'
    });
  }
}
