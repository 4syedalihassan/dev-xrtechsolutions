// =====================================================
// PAYMENTS API
// Remaining Feature: Online Payment Integration
// Supports Stripe and PayPal
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
      case 'POST':
        return await createPaymentIntent(req, res);
      default:
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({
          success: false,
          error: `Method ${method} Not Allowed`
        });
    }
  } catch (error) {
    console.error('Payments API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

// POST: Create Payment Intent
async function createPaymentIntent(req, res) {
  const {
    order_id,
    amount,
    currency = 'PKR',
    payment_method = 'stripe', // 'stripe', 'paypal', 'cod'
    customer_email,
    return_url
  } = req.body;

  // Validation
  if (!order_id || !amount) {
    return res.status(400).json({
      success: false,
      error: 'order_id and amount are required'
    });
  }

  if (amount <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Amount must be greater than 0'
    });
  }

  // For COD, just update order payment status
  if (payment_method === 'cod') {
    return await handleCODPayment(order_id, res);
  }

  // For Stripe
  if (payment_method === 'stripe') {
    return await handleStripePayment(order_id, amount, currency, customer_email, return_url, res);
  }

  // For PayPal
  if (payment_method === 'paypal') {
    return await handlePayPalPayment(order_id, amount, currency, return_url, res);
  }

  return res.status(400).json({
    success: false,
    error: 'Invalid payment method. Supported: stripe, paypal, cod'
  });
}

// Handle Cash on Delivery
async function handleCODPayment(order_id, res) {
  if (supabase) {
    try {
      await supabase
        .from('orders')
        .update({
          payment_method: 'cod',
          payment_status: 'pending'
        })
        .eq('id', order_id);
    } catch (error) {
      console.error('Error updating order for COD:', error);
    }
  }

  return res.status(200).json({
    success: true,
    payment_method: 'cod',
    message: 'Cash on Delivery selected. Pay when you receive your order.',
    order_id
  });
}

// Handle Stripe Payment
async function handleStripePayment(order_id, amount, currency, customer_email, return_url, res) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  // If Stripe is not configured, return mock response
  if (!stripeSecretKey) {
    return res.status(200).json({
      success: true,
      payment_method: 'stripe',
      message: 'Stripe payment integration ready (configure STRIPE_SECRET_KEY)',
      demo_mode: true,
      client_secret: 'demo_client_secret',
      order_id
    });
  }

  try {
    // Dynamically import Stripe
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(stripeSecretKey);

    // Convert amount to smallest currency unit
    // PKR and some other currencies don't have fractional units
    const zerDecimalCurrencies = ['pkr', 'jpy', 'krw', 'vnd', 'idr', 'bif', 'clp', 'djf', 'gnf', 'kmf', 'mga', 'pyg', 'rwf', 'ugx', 'vuf', 'xaf', 'xof', 'xpf'];
    const currencyLower = currency.toLowerCase();
    const stripeAmount = zerDecimalCurrencies.includes(currencyLower) 
      ? Math.round(amount) 
      : Math.round(amount * 100);

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: stripeAmount,
      currency: currencyLower,
      metadata: { order_id },
      receipt_email: customer_email,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Update order with payment intent
    if (supabase) {
      await supabase
        .from('orders')
        .update({
          payment_method: 'stripe',
          payment_intent_id: paymentIntent.id,
          payment_status: 'processing'
        })
        .eq('id', order_id);
    }

    return res.status(200).json({
      success: true,
      payment_method: 'stripe',
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
      order_id
    });
  } catch (error) {
    console.error('Stripe error:', error);
    return res.status(400).json({
      success: false,
      error: 'Failed to create Stripe payment',
      message: error.message
    });
  }
}

// Handle PayPal Payment
async function handlePayPalPayment(order_id, amount, currency, return_url, res) {
  const paypalClientId = process.env.PAYPAL_CLIENT_ID;
  const paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const paypalMode = process.env.PAYPAL_MODE || 'sandbox';

  // If PayPal is not configured, return mock response
  if (!paypalClientId || !paypalClientSecret) {
    return res.status(200).json({
      success: true,
      payment_method: 'paypal',
      message: 'PayPal payment integration ready (configure PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET)',
      demo_mode: true,
      approval_url: '#',
      order_id
    });
  }

  try {
    const baseUrl = paypalMode === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';

    // Get access token
    const authResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${paypalClientId}:${paypalClientSecret}`).toString('base64')}`
      },
      body: 'grant_type=client_credentials'
    });

    const authData = await authResponse.json();
    const accessToken = authData.access_token;

    // Create PayPal order
    const orderResponse = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: order_id,
          amount: {
            currency_code: currency,
            value: amount.toFixed(2)
          }
        }],
        application_context: {
          return_url: return_url || `${process.env.NEXT_PUBLIC_BASE_URL}/order-success`,
          cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout`
        }
      })
    });

    const orderData = await orderResponse.json();

    // Find approval URL
    const approvalUrl = orderData.links?.find(link => link.rel === 'approve')?.href;

    // Update order with PayPal order ID
    if (supabase) {
      await supabase
        .from('orders')
        .update({
          payment_method: 'paypal',
          paypal_order_id: orderData.id,
          payment_status: 'processing'
        })
        .eq('id', order_id);
    }

    return res.status(200).json({
      success: true,
      payment_method: 'paypal',
      paypal_order_id: orderData.id,
      approval_url: approvalUrl,
      order_id
    });
  } catch (error) {
    console.error('PayPal error:', error);
    return res.status(400).json({
      success: false,
      error: 'Failed to create PayPal payment',
      message: error.message
    });
  }
}
