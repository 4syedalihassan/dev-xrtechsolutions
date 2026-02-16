// =====================================================
// ORDER CONFIRM API
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

  if (!orderId) {
    return res.status(400).json({
      success: false,
      error: 'Order ID is required'
    });
  }

  try {
    // Check if order exists and is in pending status
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

    // Only pending orders can be confirmed
    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: `Cannot confirm order with status: ${order.status}`,
        message: 'Only pending orders can be confirmed'
      });
    }

    // Update order status to confirmed
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString()
      })
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
      console.error('Error confirming order:', updateError);
      return res.status(400).json({
        success: false,
        error: 'Failed to confirm order',
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
      message: 'Order confirmed successfully',
      order: {
        ...updatedOrder,
        items: items || []
      }
    });

  } catch (error) {
    console.error('Confirm Order Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}
