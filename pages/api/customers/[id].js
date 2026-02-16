// Individual Customer API
// GET /api/customers/[id] - Get customer details (Admin only)
// PUT /api/customers/[id] - Update customer (Admin only)
// DELETE /api/customers/[id] - Delete customer (Admin only)
// Sprint 1 - User Story 1.4

import { createClient } from '@supabase/supabase-js';
import { requireAdminAPI } from '../../../lib/apiAuth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { id } = req.query;
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return handleGet(req, res, id);

      case 'PUT':
        return handlePut(req, res, id);

      case 'DELETE':
        return handleDelete(req, res, id);

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({
          success: false,
          error: `Method ${method} not allowed`
        });
    }
  } catch (error) {
    console.error('Customer API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

// GET - Get customer by ID (Admin only)
async function handleGet(req, res, id) {
  // Require admin authentication
  const user = await requireAdminAPI(req, res);
  if (!user) return; // Response already sent by middleware

  const { data, error } = await supabase
    .from('customers')
    .select(`
      *,
      buildings:buildings(count)
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return res.status(404).json({
        success: false,
        error: 'Customer not found'
      });
    }
    console.error('Error fetching customer:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch customer',
      details: error.message
    });
  }

  return res.status(200).json({
    success: true,
    customer: data
  });
}

// PUT - Update customer (Admin only)
async function handlePut(req, res, id) {
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
    status,
    notes
  } = req.body;

  // Check if customer exists
  const { data: existing } = await supabase
    .from('customers')
    .select('id')
    .eq('id', id)
    .single();

  if (!existing) {
    return res.status(404).json({
      success: false,
      error: 'Customer not found'
    });
  }

  // If email is being changed, check for duplicates
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    const { data: duplicate } = await supabase
      .from('customers')
      .select('id')
      .eq('email', email)
      .neq('id', id)
      .single();

    if (duplicate) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }
  }

  // Build update object
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (email !== undefined) updates.email = email;
  if (phone !== undefined) updates.phone = phone;
  if (address !== undefined) updates.address = address;
  if (company_name !== undefined) updates.company_name = company_name;
  if (logo_url !== undefined) updates.logo_url = logo_url;
  if (subscription_tier !== undefined) updates.subscription_tier = subscription_tier;
  if (status !== undefined) updates.status = status;
  if (notes !== undefined) updates.notes = notes;

  // Update customer
  const { data, error } = await supabase
    .from('customers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating customer:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update customer',
      details: error.message
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Customer updated successfully',
    customer: data
  });
}

// DELETE - Delete customer (Admin only)
async function handleDelete(req, res, id) {
  // Require admin authentication
  const user = await requireAdminAPI(req, res);
  if (!user) return; // Response already sent by middleware

  // Check if customer has buildings
  const { data: buildings } = await supabase
    .from('buildings')
    .select('id')
    .eq('customer_id', id);

  if (buildings && buildings.length > 0) {
    return res.status(400).json({
      success: false,
      error: `Cannot delete customer with ${buildings.length} building(s). Delete buildings first.`
    });
  }

  // Delete customer
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting customer:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete customer',
      details: error.message
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Customer deleted successfully'
  });
}
