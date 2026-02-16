// =====================================================
// ORDERS API - LIST AND CREATE
// Sprint 7: E-Commerce Order Lifecycle
// Version: 7.0.0
// =====================================================

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Generates a unique slug for a customer from their email
 * @param {string} email - Customer email address
 * @returns {Promise<string>} Unique slug
 */
async function generateCustomerSlug(email) {
  // Generate base slug from email (use the part before @)
  const emailPrefix = email.split('@')[0];
  let baseSlug = emailPrefix
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  // Fallback to 'customer' if slug is empty after sanitization
  if (!baseSlug) {
    baseSlug = 'customer';
  }

  let slug = baseSlug;
  let counter = 1;
  const MAX_ATTEMPTS = 100; // Prevent infinite loops

  // Check for duplicate slugs and increment if needed
  while (counter <= MAX_ATTEMPTS) {
    const { data: existing, error } = await supabase
      .from('customers')
      .select('id')
      .eq('slug', slug)
      .maybeSingle(); // Use maybeSingle() to avoid error when no match

    // Handle database errors
    if (error) {
      console.error('Error checking slug uniqueness:', error);
      throw new Error('Failed to generate unique customer slug');
    }

    // If no existing record, slug is available
    if (!existing) {
      break;
    }

    // Slug exists, try next one
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  // If we exhausted all attempts, throw error
  if (counter > MAX_ATTEMPTS) {
    throw new Error(`Unable to generate unique slug after ${MAX_ATTEMPTS} attempts`);
  }

  return slug;
}

/**
 * Builds customer name from first and last name
 * @param {Object} customer - Customer info with firstName, lastName
 * @returns {string} Full name or 'Guest Customer'
 */
function buildCustomerName(customer) {
  return [customer.firstName, customer.lastName].filter(Boolean).join(' ') || 'Guest Customer';
}

/**
 * Builds customer data object for database operations
 * @param {Object} customer - Customer info
 * @param {Object} shipping - Shipping address
 * @returns {Object} Customer data for insert/update
 */
function buildCustomerData(customer, shipping) {
  const fullName = buildCustomerName(customer);
  return {
    name: fullName,
    email: customer.email,
    phone: customer.phone || null,
    address: shipping?.address,
    city: shipping?.city,
    postal_code: shipping?.postalCode,
    country: shipping?.country
  };
}

/**
 * Validates that a customer_id exists in database
 * @param {string} customer_id - Customer UUID
 * @returns {Object} { success: boolean, customerId?: string, error?: object }
 */
async function validateExistingCustomer(customer_id) {
  const { data: existingCustomer, error: customerError } = await supabase
    .from('customers')
    .select('id')
    .eq('id', customer_id)
    .single();

  if (customerError || !existingCustomer) {
    return {
      success: false,
      error: { status: 404, message: 'Customer not found' }
    };
  }

  return { success: true, customerId: customer_id };
}

/**
 * Updates existing customer with new shipping information
 * @param {string} customerId - Customer UUID
 * @param {Object} customer - Customer info
 * @param {Object} shipping - Shipping address
 * @returns {Promise<void>}
 */
async function updateCustomerInfo(customerId, customer, shipping) {
  const updateData = buildCustomerData(customer, shipping);
  await supabase
    .from('customers')
    .update(updateData)
    .eq('id', customerId);
}

/**
 * Creates a new customer in the database
 * @param {Object} customer - Customer info
 * @param {Object} shipping - Shipping address
 * @returns {Object} { success: boolean, customerId?: string, error?: object }
 */
async function createNewCustomer(customer, shipping) {
  try {
    // Generate unique slug for customer
    const slug = await generateCustomerSlug(customer.email);

    const customerData = {
      ...buildCustomerData(customer, shipping),
      slug,
      status: 'active'
    };

    const { data: newCustomer, error: createError } = await supabase
      .from('customers')
      .insert(customerData)
      .select('id')
      .single();

    if (createError || !newCustomer) {
      console.error('Error creating customer:', createError);
      return {
        success: false,
        error: { status: 400, message: 'Failed to create customer', details: createError?.message }
      };
    }

    return { success: true, customerId: newCustomer.id };
  } catch (error) {
    console.error('Error in createNewCustomer:', error);
    return {
      success: false,
      error: { status: 500, message: 'Failed to create customer', details: error.message }
    };
  }
}

/**
 * Finds existing customer by email or creates new one
 * @param {Object} customer - Customer info with email
 * @param {Object} shipping - Shipping address
 * @returns {Object} { success: boolean, customerId?: string, error?: object }
 */
async function findOrCreateGuestCustomer(customer, shipping) {
  // Validate email is provided
  if (!customer || !customer.email) {
    return {
      success: false,
      error: { status: 400, message: 'Customer email is required' }
    };
  }

  // Check if customer exists by email
  const { data: existingCustomer } = await supabase
    .from('customers')
    .select('id')
    .eq('email', customer.email)
    .single();

  if (existingCustomer) {
    // Update existing customer with new shipping info
    if (shipping) {
      await updateCustomerInfo(existingCustomer.id, customer, shipping);
    }
    return { success: true, customerId: existingCustomer.id };
  }

  // Create new customer
  return await createNewCustomer(customer, shipping);
}

/**
 * Resolves customer ID from customer_id or guest checkout data
 * @param {string} customer_id - Optional existing customer UUID
 * @param {Object} customer - Customer info: { firstName, lastName, email, phone }
 * @param {Object} shipping - Shipping address: { address, city, postalCode, country }
 * @returns {Object} { success: boolean, customerId?: string, error?: object }
 */
async function resolveCustomerId(customer_id, customer, shipping) {
  // If customer_id provided, validate it exists
  if (customer_id) {
    return await validateExistingCustomer(customer_id);
  }

  // Guest checkout - find or create customer
  return await findOrCreateGuestCustomer(customer, shipping);
}

/**
 * Validates a single order item
 * @param {Object} item - Item with product_id and quantity
 * @returns {Object} { valid: boolean, error?: object }
 */
function validateItemFields(item) {
  const { product_id, quantity } = item;

  if (!product_id || !quantity || quantity <= 0) {
    return {
      valid: false,
      error: { status: 400, message: 'Invalid item: product_id and quantity > 0 required' }
    };
  }

  return { valid: true };
}

/**
 * Fetches product from database with stock information
 * @param {string} product_id - Product UUID
 * @returns {Object} { success: boolean, product?: object, error?: object }
 */
async function fetchProduct(product_id) {
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('id, name, brand, price, image_url, stock_quantity')
    .eq('id', product_id)
    .single();

  if (productError || !product) {
    return {
      success: false,
      error: { status: 404, message: `Product ${product_id} not found` }
    };
  }

  return { success: true, product };
}

/**
 * Builds validated item object with pricing
 * @param {Object} product - Product from database
 * @param {number} quantity - Item quantity
 * @returns {Object} Validated item with pricing
 */
function buildValidatedItem(product, quantity) {
  const itemUnitPrice = parseFloat(product.price);
  const line_total = parseFloat((itemUnitPrice * quantity).toFixed(2));

  return {
    product_id: product.id,
    product_name: product.name,
    product_brand: product.brand || '',
    product_image_url: product.image_url || '',
    quantity: parseInt(quantity),
    unit_price: itemUnitPrice,
    line_total
  };
}

/**
 * Validates items and fetches product details from database
 * @param {Array} items - Array of items: [{ product_id, quantity }]
 * @returns {Object} { success: boolean, validatedItems?: array, subtotal?: number, error?: object }
 */
async function validateAndPriceItems(items) {
  if (!items || items.length === 0) {
    console.warn('Order validation failed: Missing items');
    return {
      success: false,
      error: { status: 400, message: 'At least one item is required' }
    };
  }

  let calculatedSubtotal = 0;
  const validatedItems = [];

  for (const item of items) {
    // Validate item fields
    const validation = validateItemFields(item);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Fetch product from database (security: always use DB prices)
    const productResult = await fetchProduct(item.product_id);
    if (!productResult.success) {
      return { success: false, error: productResult.error };
    }

    const product = productResult.product;

    // Validate stock availability
    if (product.stock_quantity !== null && product.stock_quantity !== undefined) {
      if (product.stock_quantity < item.quantity) {
        console.warn(`Order validation failed: Insufficient stock for ${product.name}`);
        return {
          success: false,
          error: {
            status: 400,
            message: `Insufficient stock for ${product.name}. Available: ${product.stock_quantity}, Requested: ${item.quantity}`
          }
        };
      }
    }

    // Build validated item with pricing
    const validatedItem = buildValidatedItem(product, item.quantity);
    calculatedSubtotal += validatedItem.line_total;
    validatedItems.push(validatedItem);
  }

  return {
    success: true,
    validatedItems,
    subtotal: calculatedSubtotal
  };
}

/**
 * Fetches tax rate from settings and calculates order totals
 * @param {number} subtotal - Order subtotal before tax
 * @returns {Object} { subtotal, taxAmount, totalAmount }
 */
async function calculateOrderTotalsWithTaxRate(subtotal) {
  const { data: settings } = await supabase
    .from('projects')
    .select('settings')
    .limit(1)
    .single();

  const tax_rate = settings?.settings?.tax_rate || 0;
  const taxAmount = parseFloat((subtotal * (tax_rate / 100)).toFixed(2));
  const totalAmount = parseFloat((subtotal + taxAmount).toFixed(2));

  return { subtotal, taxAmount, totalAmount };
}

/**
 * Generates order number with fallback
 * @returns {Promise<string>} Order number
 */
async function generateOrderNumber() {
  const { data: orderNumberData } = await supabase
    .rpc('generate_order_number');

  // Fallback with crypto-secure random UUID if RPC fails
  if (!orderNumberData) {
    // Use crypto.randomUUID() for secure random generation
    const uuid = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return `ORD-${uuid.replace(/-/g, '').substring(0, 16).toUpperCase()}`;
  }

  return orderNumberData;
}

/**
 * Creates order record in database
 * @param {string} customerId - Customer UUID
 * @param {string} order_number - Order number
 * @param {Object} orderData - Order data
 * @returns {Object} { success: boolean, order?: object, error?: object }
 */
async function insertOrder(customerId, order_number, orderData) {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_id: customerId,
      order_number,
      status: 'pending',
      payment_status: 'pending',
      ...orderData
    })
    .select()
    .single();

  if (orderError) {
    console.error('Error creating order:', orderError);
    return {
      success: false,
      error: { status: 400, message: 'Failed to create order', details: orderError.message }
    };
  }

  return { success: true, order };
}

/**
 * Creates order items in database
 * @param {string} orderId - Order UUID
 * @param {Array} validatedItems - Validated items
 * @returns {Object} { success: boolean, orderItems?: array, error?: object }
 */
async function insertOrderItems(orderId, validatedItems) {
  const itemsWithOrderId = validatedItems.map(item => ({
    ...item,
    order_id: orderId
  }));

  const { data: orderItems, error: itemsError } = await supabase
    .from('order_items')
    .insert(itemsWithOrderId)
    .select();

  if (itemsError) {
    console.error('Error creating order items:', itemsError);
    return {
      success: false,
      error: { status: 400, message: 'Failed to create order items', details: itemsError.message }
    };
  }

  return { success: true, orderItems };
}

/**
 * Fetches complete order with customer details
 * @param {string} orderId - Order UUID
 * @returns {Promise<Object>} Complete order object
 */
async function fetchCompleteOrder(orderId) {
  const { data: completeOrder } = await supabase
    .from('orders')
    .select(`
      *,
      customers (
        id,
        name,
        email,
        phone
      )
    `)
    .eq('id', orderId)
    .single();

  return completeOrder;
}

/**
 * Updates product stock quantities after order placement
 * Uses atomic decrement to prevent race conditions
 * @param {Array} validatedItems - Validated items with quantities
 * @returns {Object} { success: boolean, error?: object }
 */
async function decrementProductStock(validatedItems) {
  const errors = [];

  for (const item of validatedItems) {
    // Use atomic decrement operation to prevent overselling
    const { data, error } = await supabase.rpc('decrement_product_stock', {
      p_product_id: item.product_id,
      p_quantity: item.quantity
    });

    // If RPC doesn't exist, fall back to manual update
    if (error && error.message?.includes('function') && error.message?.includes('does not exist')) {
      // Fallback: Read current stock, validate, and update
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', item.product_id)
        .single();

      if (fetchError || !product) {
        errors.push(`Failed to fetch stock for product ${item.product_id}`);
        continue;
      }

      // Skip if stock tracking is disabled (null/undefined)
      if (product.stock_quantity === null || product.stock_quantity === undefined) {
        continue;
      }

      // Calculate new stock
      const newStock = product.stock_quantity - item.quantity;

      if (newStock < 0) {
        errors.push(`Insufficient stock for product ${item.product_id}`);
        continue;
      }

      // Update stock
      const { error: updateError } = await supabase
        .from('products')
        .update({ stock_quantity: newStock })
        .eq('id', item.product_id);

      if (updateError) {
        errors.push(`Failed to update stock for product ${item.product_id}: ${updateError.message}`);
      }
    } else if (error) {
      errors.push(`Failed to decrement stock for product ${item.product_id}: ${error.message}`);
    }
  }

  if (errors.length > 0) {
    return {
      success: false,
      error: {
        status: 500,
        message: 'Failed to update product stock',
        details: errors.join('; ')
      }
    };
  }

  return { success: true };
}

/**
 * Creates order and order items in database
 * @param {string} customerId - Customer UUID
 * @param {Object} orderData - Order data: { subtotal, tax_amount, total_amount, currency, customer_notes, shipping_address }
 * @param {Array} validatedItems - Validated items with pricing
 * @returns {Object} { success: boolean, order?: object, error?: object }
 */
async function createOrderRecord(customerId, orderData, validatedItems) {
  // Generate order number
  const order_number = await generateOrderNumber();

  // Create order
  const orderResult = await insertOrder(customerId, order_number, orderData);
  if (!orderResult.success) {
    return orderResult;
  }

  // Create order items
  const itemsResult = await insertOrderItems(orderResult.order.id, validatedItems);
  if (!itemsResult.success) {
    // Rollback order creation
    const { error: rollbackError } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderResult.order.id);

    if (rollbackError) {
      console.error('Failed to rollback order after items error:', rollbackError);
    }

    return itemsResult;
  }

  // Decrement product stock quantities
  const stockResult = await decrementProductStock(validatedItems);
  if (!stockResult.success) {
    // Log error but don't fail the order - stock can be manually adjusted
    console.error('⚠️ Stock decrement failed:', stockResult.error);
    // Continue with order creation - admin can manually adjust stock
  }

  // Fetch complete order with customer details
  const completeOrder = await fetchCompleteOrder(orderResult.order.id);

  return {
    success: true,
    order: {
      ...completeOrder,
      items: itemsResult.orderItems
    }
  };
}

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return await listOrders(req, res);
      case 'POST':
        return await createOrder(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({
          success: false,
          error: `Method ${method} Not Allowed`
        });
    }
  } catch (error) {
    console.error('Orders API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

// =====================================================
// GET: List Orders
// =====================================================

/**
 * Builds orders query with filters
 * @param {Object} filters - Query filters
 * @returns {Object} Supabase query
 */
function buildOrdersQuery(filters) {
  const { customer_id, status, limit = 50, offset = 0 } = filters;

  let query = supabase
    .from('orders')
    .select(`
      id,
      customer_id,
      order_number,
      status,
      payment_status,
      subtotal,
      tax_amount,
      total_amount,
      currency,
      customer_notes,
      created_at,
      updated_at,
      confirmed_at,
      shipped_at,
      delivered_at,
      cancelled_at,
      customers (
        id,
        name,
        email,
        phone
      )
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  // Apply filters
  if (customer_id) {
    query = query.eq('customer_id', customer_id);
  }

  if (status) {
    query = query.eq('status', status);
  }

  return query;
}

/**
 * Fetches order items for orders
 * @param {Array} orders - Orders array
 * @returns {Promise<Array>} Orders with items
 */
async function enrichOrdersWithItems(orders) {
  return await Promise.all(
    orders.map(async (order) => {
      const { data: items } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', order.id);

      return { ...order, items: items || [] };
    })
  );
}

async function listOrders(req, res) {
  const { customer_email, limit = 50, offset = 0 } = req.query;

  let filters = { ...req.query };

  // If filtering by email, first find the customer
  if (customer_email) {
    // Use maybeSingle() to handle case where customer doesn't exist yet (returns null)
    // Email has UNIQUE constraint, so multiple results indicate data integrity issue
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('email', customer_email)
      .maybeSingle();

    // Handle errors (e.g., multiple customers with same email - data integrity issue)
    if (customerError) {
      console.error('Error looking up customer:', customerError);
      return res.status(400).json({
        success: false,
        error: 'Failed to lookup customer',
        message: customerError.message
      });
    }

    // If customer found, use their ID to filter orders
    if (customer) {
      filters.customer_id = customer.id;
    } else {
      // No customer with this email yet.
      // Auto-create customer record to ensure smoother future experience
      console.log(`Auto-creating customer record for ${customer_email}`);
      const nameParts = customer_email.split('@')[0];

      const newCustomerResult = await createNewCustomer(
        { email: customer_email, firstName: nameParts, lastName: '' },
        {} // No shipping info yet
      );

      if (newCustomerResult.success) {
        filters.customer_id = newCustomerResult.customerId;
        // Return empty orders since it's a new customer
        return res.status(200).json({
          success: true,
          orders: [],
          count: 0,
          total: 0,
          pagination: {
            limit: parseInt(limit),
            offset: parseInt(offset)
          }
        });
      } else {
        // Failed to create, just return empty
        console.error('Failed to auto-create customer:', newCustomerResult.error);
        return res.status(200).json({
          success: true,
          orders: [],
          count: 0,
          total: 0,
          pagination: {
            limit: parseInt(limit),
            offset: parseInt(offset)
          }
        });
      }
    }

    // Remove email from filters since we converted it to customer_id
    delete filters.customer_email;
  }

  // Build and execute query
  const query = buildOrdersQuery(filters);
  const { data: orders, error, count } = await query;

  if (error) {
    console.error('Error fetching orders:', error);
    return res.status(400).json({
      success: false,
      error: 'Failed to fetch orders',
      message: error.message
    });
  }

  // Enrich orders with items
  const ordersWithItems = await enrichOrdersWithItems(orders);

  return res.status(200).json({
    success: true,
    orders: ordersWithItems,
    count: ordersWithItems.length,
    total: count,
    pagination: {
      limit: parseInt(limit),
      offset: parseInt(offset)
    }
  });
}

// =====================================================
// POST: Create Order
// =====================================================
async function createOrder(req, res) {
  const {
    customer_id,
    customer,
    shipping,
    items = [],
    customer_notes = '',
    currency = 'PKR'
  } = req.body;

  // Resolve customer ID (create/find customer)
  const customerResult = await resolveCustomerId(customer_id, customer, shipping);
  if (!customerResult.success) {
    return res.status(customerResult.error.status).json({
      success: false,
      error: customerResult.error.message,
      message: customerResult.error.details
    });
  }

  // Validate items and get pricing from database
  const itemsResult = await validateAndPriceItems(items);
  if (!itemsResult.success) {
    return res.status(itemsResult.error.status).json({
      success: false,
      error: itemsResult.error.message
    });
  }

  // Calculate order totals with tax
  const totals = await calculateOrderTotalsWithTaxRate(itemsResult.subtotal);

  // Prepare shipping address data
  const shippingAddressData = shipping ? {
    address: shipping.address,
    city: shipping.city,
    postalCode: shipping.postalCode,
    country: shipping.country
  } : null;

  // Create order and order items
  const orderResult = await createOrderRecord(
    customerResult.customerId,
    {
      subtotal: totals.subtotal,
      tax_amount: totals.taxAmount,
      total_amount: totals.totalAmount,
      currency,
      customer_notes,
      shipping_address: shippingAddressData
    },
    itemsResult.validatedItems
  );

  if (!orderResult.success) {
    return res.status(orderResult.error.status).json({
      success: false,
      error: orderResult.error.message,
      message: orderResult.error.details
    });
  }

  // Decrement product stock quantities
  console.log('📦 [Order API] Decrementing product stock...');
  const stockResult = await decrementProductStock(itemsResult.validatedItems);

  if (!stockResult.success) {
    console.error('⚠️ [Order API] Stock decrement failed:', stockResult.error);
    // Order was created but stock update failed - log warning but don't fail the order
    // In production, this should trigger an alert for manual inventory reconciliation
  } else {
    console.log('✅ [Order API] Stock decremented successfully');
  }

  return res.status(201).json({
    success: true,
    message: 'Order created successfully',
    order_number: orderResult.order.order_number,
    order: orderResult.order
  });
}
