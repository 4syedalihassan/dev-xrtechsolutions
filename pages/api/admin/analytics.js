// =====================================================
// ADMIN ANALYTICS API
// Get analytics data for dashboard
// =====================================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export default async function handler(req, res) {
  const { method } = req;

  if (method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({
      success: false,
      error: `Method ${method} Not Allowed`
    });
  }

  if (!supabase) {
    return res.status(500).json({
      success: false,
      error: 'Database not configured. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.'
    });
  }

  try {
    const { range = '7d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    switch (range) {
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default: // 7d
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get orders data with customer information
    const { data: orders } = await supabase
      .from('orders')
      .select(`
        id, 
        total_amount, 
        status, 
        created_at, 
        customer_id,
        customers:customer_id (name, email)
      `)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    // Get customers count
    const { count: totalCustomers } = await supabase
      .from('customers')
      .select('id', { count: 'exact', head: true });

    // Get new customers in range
    const { count: newCustomers } = await supabase
      .from('customers')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString());

    // Get reviews data
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating, status');

    // Calculate analytics
    const ordersList = orders || [];
    const totalRevenue = ordersList.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0);
    const totalOrders = ordersList.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Order status counts
    const orderStatus = {
      pending: ordersList.filter(o => o.status === 'pending').length,
      confirmed: ordersList.filter(o => o.status === 'confirmed').length,
      processing: ordersList.filter(o => o.status === 'processing').length,
      shipped: ordersList.filter(o => o.status === 'shipped').length,
      delivered: ordersList.filter(o => o.status === 'delivered').length
    };

    // Sales by day
    const salesByDayMap = {};
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    ordersList.forEach(order => {
      const day = days[new Date(order.created_at).getDay()];
      if (!salesByDayMap[day]) {
        salesByDayMap[day] = { date: day, revenue: 0, orders: 0 };
      }
      salesByDayMap[day].revenue += parseFloat(order.total_amount) || 0;
      salesByDayMap[day].orders += 1;
    });
    const salesByDay = days.map(day => salesByDayMap[day] || { date: day, revenue: 0, orders: 0 });

    // Get top products by order items
    const { data: orderItems } = await supabase
      .from('order_items')
      .select(`
        product_id,
        quantity,
        line_total,
        products:product_id (name)
      `)
      .order('line_total', { ascending: false })
      .limit(50);

    const productSalesMap = {};
    (orderItems || []).forEach(item => {
      const name = item.products?.name || 'Unknown Product';
      if (!productSalesMap[name]) {
        productSalesMap[name] = { name, sales: 0, revenue: 0 };
      }
      productSalesMap[name].sales += item.quantity || 0;
      productSalesMap[name].revenue += parseFloat(item.line_total) || 0;
    });
    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Recent orders with customer names from joined data
    const recentOrders = ordersList.slice(0, 5).map(order => ({
      id: order.id,
      customer: order.customers?.name || order.customers?.email || 'Unknown Customer',
      amount: parseFloat(order.total_amount) || 0,
      status: order.status
    }));

    // Reviews stats
    const reviewsList = reviews || [];
    const approvedReviews = reviewsList.filter(r => r.status === 'approved');
    const avgRating = approvedReviews.length > 0
      ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length
      : 0;

    const analytics = {
      overview: {
        totalRevenue,
        totalOrders,
        totalCustomers: totalCustomers || 0,
        avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
        revenueGrowth: 0,
        ordersGrowth: 0,
        customersGrowth: 0
      },
      salesByDay,
      topProducts,
      orderStatus,
      recentOrders,
      customerStats: {
        newCustomers: newCustomers || 0,
        returningCustomers: (totalCustomers || 0) - (newCustomers || 0),
        averageLifetimeValue: totalCustomers > 0 ? totalRevenue / totalCustomers : 0
      },
      reviews: {
        total: reviewsList.length,
        averageRating: parseFloat(avgRating.toFixed(1)),
        pending: reviewsList.filter(r => r.status === 'pending').length
      }
    };

    return res.status(200).json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Admin Analytics API Error:', error);
    
    // Return empty analytics if tables don't exist
    if (error.code === '42P01') {
      return res.status(200).json({
        success: true,
        analytics: {
          overview: { totalRevenue: 0, totalOrders: 0, totalCustomers: 0, avgOrderValue: 0, revenueGrowth: 0, ordersGrowth: 0, customersGrowth: 0 },
          salesByDay: [],
          topProducts: [],
          orderStatus: { pending: 0, confirmed: 0, processing: 0, shipped: 0, delivered: 0 },
          recentOrders: [],
          customerStats: { newCustomers: 0, returningCustomers: 0, averageLifetimeValue: 0 },
          reviews: { total: 0, averageRating: 0, pending: 0 }
        },
        message: 'Some tables not found. Please run the database migrations.'
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch analytics'
    });
  }
}
