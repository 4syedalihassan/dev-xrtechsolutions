// Customers API - List and Create
// GET /api/customers - List all customers (Admin only)
// POST /api/customers - Create new customer (Admin only)
// Sprint 1 - User Story 1.4

import { createClient } from '@supabase/supabase-js';
import { requireAdminAPI } from '../../../lib/apiAuth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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
    console.error('Customers API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

// GET - List all customers (Admin only)
async function handleGet(req, res) {
  // Require admin authentication
  const user = await requireAdminAPI(req, res);
  if (!user) return; // Response already sent by middleware

  const { status, search, page = 1, limit = 20 } = req.query;

  // Calculate pagination range
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const from = (pageNum - 1) * limitNum;
  const to = from + limitNum - 1;

  let query = supabase
    .from('customers')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  // Filter by status
  if (status && ['active', 'inactive', 'suspended'].includes(status)) {
    query = query.eq('status', status);
  }

  // Search by name or email
  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,company_name.ilike.%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching customers:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch customers',
      details: error.message
    });
  }

  return res.status(200).json({
    success: true,
    customers: data,
    count: count || 0,
    page: pageNum,
    totalPages: Math.ceil((count || 0) / limitNum)
  });
}

// POST - Create new customer (Admin only)
async function handlePost(req, res) {
  // Require admin authentication
  const user = await requireAdminAPI(req, res);
  if (!user) return; // Response already sent by middleware

  const {
    name,
    email,
    phone,
    address,
    company_name,
    logo_url,
    subscription_tier,
    notes
  } = req.body;

  // Validation
  if (!name || !email) {
    return res.status(400).json({
      success: false,
      error: 'Name and email are required'
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid email format'
    });
  }

  // Check if email already exists
  const { data: existing } = await supabase
    .from('customers')
    .select('id')
    .eq('email', email)
    .single();

  if (existing) {
    return res.status(400).json({
      success: false,
      error: 'Email already exists'
    });
  }

  try {
    // Generate unique slug for customer
    const slug = await generateCustomerSlug(email);

    // Create customer
    const { data, error } = await supabase
      .from('customers')
      .insert({
        name,
        email,
        slug,
        phone: phone || null,
        company_name: company_name || null,
        logo_url: logo_url || null,
        subscription_tier: subscription_tier || 'basic',
        notes: notes || null,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating customer:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create customer',
        details: error.message
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      customer: data
    });
  } catch (error) {
    console.error('Error in customer creation:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create customer',
      details: error.message
    });
  }
}
