// =====================================================
// ORDER CANCEL API
// Sprint 7: E-Commerce Order Lifecycle
// Version: 7.0.0
// =====================================================

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed'
    });
  }

  const { id: orderId } = req.query;
  const { cancellation_reason } = req.body;

  if (!orderId) {
    return res.status(400).json({
      success: false,
      error: 'Order ID is required'
    });
  }

  try {
    // Check if order exists
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('id, status, customer_id')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Only pending or confirmed orders can be cancelled
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        error: `Cannot cancel order with status: ${order.status}`,
        message: 'Only pending or confirmed orders can be cancelled'
      });
    }

    // Build update object
    const updates = {
      status: 'cancelled',
      cancelled_at: new Date().toISOString()
    };

    // Add cancellation reason to customer notes if provided
    if (cancellation_reason) {
      updates.customer_notes = cancellation_reason;
    }

    // Update order status to cancelled
    const { data: updatedOrder, error: updateError } = await supabase
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
      console.error('Error cancelling order:', updateError);
      return res.status(400).json({
        success: false,
        error: 'Failed to cancel order',
        message: updateError.message
      });
    }

    // Fetch order items
    const { data: items } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    return res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order: {
        ...updatedOrder,
        items: items || []
      }
    });

  } catch (error) {
    console.error('Cancel Order Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}
