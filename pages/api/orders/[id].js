// =====================================================
// ORDER API - GET, UPDATE, DELETE
// Sprint 7: E-Commerce Order Lifecycle
// Version: 7.0.0
// =====================================================

import { createClient } from '@supabase/supabase-js';
import { requireAdminAPI, optionalAdminAPI } from '../../../lib/apiAuth';
import { logAdminAPIAction } from '../../../lib/auditLog';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { method, query } = req;
  const { id } = query;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: 'Order ID is required'
    });
  }

  try {
    switch (method) {
      case 'GET':
        return await getOrder(req, res, id);
      case 'PUT':
        return await updateOrder(req, res, id);
      case 'DELETE':
        return await deleteOrder(req, res, id);
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({
          success: false,
          error: `Method ${method} Not Allowed`
        });
    }
  } catch (error) {
    console.error('Order API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

// =====================================================
// GET: Retrieve Order Details
// =====================================================
// =====================================================
// GET: Retrieve Order Details
// =====================================================
async function getOrder(req, res, orderId) {
  // Authenticate user
  const user = await optionalAdminAPI(req);
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      customers (
        id,
        name,
        email,
        phone,
        address,
        city,
        country
      )
    `)
    .eq('id', orderId)
    .single();

  if (error || !order) {
    return res.status(404).json({
      success: false,
      error: 'Order not found'
    });
  }

  // Check permissions: Admin or Order Owner
  const isOwner = user.email === order.customers?.email;
  if (!user.isAdmin && !isOwner) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  // Fetch order items
  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select(`
      *,
      products (
        id,
        name,
        brand,
        image_url
      )
    `)
    .eq('order_id', orderId);

  if (itemsError) {
    console.error('Error fetching order items:', itemsError);
  }

  return res.status(200).json({
    success: true,
    order: {
      ...order,
      items: items || []
    }
  });
}

// =====================================================
// PUT: Update Order
// =====================================================
// =====================================================
// PUT: Update Order
// =====================================================
async function updateOrder(req, res, orderId) {
  const {
    status,
    payment_status,
    customer_notes
  } = req.body;

  // Authenticate user
  const user = await optionalAdminAPI(req);
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  // Check if order exists
  const { data: existingOrder, error: fetchError } = await supabase
    .from('orders')
    .select(`
      id, 
      status, 
      payment_status,
      customers (email)
    `)
    .eq('id', orderId)
    .single();

  if (fetchError || !existingOrder) {
    return res.status(404).json({
      success: false,
      error: 'Order not found'
    });
  }

  // Check permissions
  const isOwner = user.email === existingOrder.customers?.email;

  if (!user.isAdmin && !isOwner) {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  // Build update object
  const updates = {};

  // Admin-only updates
  if (user.isAdmin) {
    if (status) {
      const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
      }
      updates.status = status;
    }

    if (payment_status) {
      const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
      if (!validPaymentStatuses.includes(payment_status)) {
        return res.status(400).json({
          success: false,
          error: `Invalid payment_status. Must be one of: ${validPaymentStatuses.join(', ')}`
        });
      }
      updates.payment_status = payment_status;
    }
  } else {
    // Non-admin attempts to update restricted fields
    if (status || payment_status) {
      return res.status(403).json({
        success: false,
        error: 'Only admins can update order status'
      });
    }
  }

  // Owner or Admin can update notes
  if (customer_notes !== undefined) {
    updates.customer_notes = customer_notes;
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No valid fields to update'
    });
  }

  // Update order
  const { data: order, error: updateError } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', orderId)
    .select(`
      *,
      customers (
        id,
        name,
        email,
        phone
      )
    `)
    .single();

  if (updateError) {
    console.error('Error updating order:', updateError);
    return res.status(400).json({
      success: false,
      error: 'Failed to update order',
      message: updateError.message
    });
  }

  // Audit Log for Admin Actions
  if (user.isAdmin && (updates.status || updates.payment_status)) {
    const changes = {};
    if (updates.status) changes.status = { from: existingOrder.status, to: updates.status };
    if (updates.payment_status) changes.payment_status = { from: existingOrder.payment_status, to: updates.payment_status };

    await logAdminAPIAction(
      req,
      'update',
      'order',
      orderId,
      changes
    );
  }

  // Fetch order items
  const { data: items } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId);

  return res.status(200).json({
    success: true,
    message: 'Order updated successfully',
    order: {
      ...order,
      items: items || []
    }
  });
}

// =====================================================
// DELETE: Delete Order (Admin only)
// =====================================================
async function deleteOrder(req, res, orderId) {
  // Require admin permissions for deletion
  const user = await requireAdminAPI(req, res);
  if (!user) return; // Response sent by middleware
  // Check if order exists
  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('id, status')
    .eq('id', orderId)
    .single();

  if (fetchError || !order) {
    return res.status(404).json({
      success: false,
      error: 'Order not found'
    });
  }

  // Only allow deletion of pending or cancelled orders
  if (!['pending', 'cancelled'].includes(order.status)) {
    return res.status(400).json({
      success: false,
      error: 'Can only delete pending or cancelled orders'
    });
  }

  // Delete order (cascade will delete order_items automatically)
  const { error: deleteError } = await supabase
    .from('orders')
    .delete()
    .eq('id', orderId);

  if (deleteError) {
    console.error('Error deleting order:', deleteError);
    return res.status(400).json({
      success: false,
      error: 'Failed to delete order',
      message: deleteError.message
    });
  }

  // Log admin action
  await logAdminAPIAction(
    req,
    'delete',
    'order',
    orderId,
    { status: order.status }
  );

  return res.status(200).json({
    success: true,
    message: 'Order deleted successfully'
  });
}
