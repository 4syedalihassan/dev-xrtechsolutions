// Dashboard Stats API
// GET /api/dashboard/stats
// Aggregates data for the Admin Dashboard

import { createClient } from '@supabase/supabase-js';
import { requireAdminAPI } from '../../../lib/apiAuth';
import { subDays, format, startOfDay, endOfDay } from 'date-fns';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null;

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({
            success: false,
            error: `Method ${req.method} not allowed`
        });
    }

    try {
        // Require admin authentication
        const user = await requireAdminAPI(req, res);
        if (!user) return;

        if (!supabase) {
            return res.status(500).json({
                success: false,
                error: 'Supabase client not configured'
            });
        }

        // 1. Fetch Counts
        const [
            { count: productsCount },
            { count: buildingsCount },
            { count: ordersCount },
            { data: ordersData }
        ] = await Promise.all([
            supabase.from('products').select('*', { count: 'exact', head: true }),
            supabase.from('buildings').select('*', { count: 'exact', head: true }),
            supabase.from('orders').select('*', { count: 'exact', head: true }),
            supabase.from('orders').select('total_amount, status, created_at, payment_status, id, order_number, customer_id, customers(name)').order('created_at', { ascending: false })
        ]);

        // 2. Calculate Revenue
        // Assuming 'orders' has 'total_amount' and 'payment_status'
        // Filter for valid orders (e.g., not cancelled) for revenue
        const validOrders = ordersData?.filter(o => o.status !== 'cancelled' && o.status !== 'pending' && o.payment_status === 'paid') || [];
        const totalRevenue = validOrders.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0);

        // 3. Recent Activity (Latest 5 orders)
        const recentOrders = ordersData?.slice(0, 5).map(order => ({
            id: order.order_number || `#${order.id.toString().slice(0, 6)}`,
            customer: order.customers?.name || 'Guest',
            amount: parseFloat(order.total_amount) || 0,
            status: order.status,
            time: format(new Date(order.created_at), 'MMM dd, HH:mm')
        })) || [];

        // 4. Calculate Trends (Mock logic for now, comparing current vs previous period could be complex without more data)
        // We'll return neutral/sample trends but based on any real logic we can add later.
        // Ideally we'd query data from > 30 days ago to compare.
        const trends = {
            products: { value: '', direction: 'neutral', text: 'total active' },
            revenue: { value: '', direction: 'neutral', text: 'total earnings' },
            buildings: { value: '', direction: 'neutral', text: 'active sites' },
            orders: { value: '', direction: 'neutral', text: 'total processed' }
        };

        // 5. Chart Data: Revenue Last 7 Days
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = subDays(new Date(), 6 - i);
            return {
                date: format(d, 'MMM dd'),
                rawDate: format(d, 'yyyy-MM-dd'),
                revenue: 0,
                orders: 0
            };
        });

        if (ordersData) {
            ordersData.forEach(order => {
                const orderDate = format(new Date(order.created_at), 'yyyy-MM-dd');
                const dayStat = last7Days.find(d => d.rawDate === orderDate);
                if (dayStat) {
                    if (order.status !== 'cancelled') {
                        dayStat.orders += 1;
                        dayStat.revenue += parseFloat(order.total_amount) || 0;
                    }
                }
            });
        }

        const revenueChart = last7Days.map(({ date, revenue, orders }) => ({ date, revenue, orders }));

        // 6. Top Products (Mock or calculate from order_items if available)
        // Since we don't have order_items joined here efficiently, we might mock this part 
        // OR fetch a simple aggregation if DB supports it.
        // For now, let's try to fetch top 5 products if we can, otherwise return empty or mock structure.
        // Actually, let's fetch products and map to "Top Products" structure, maybe just sort by something if possible,
        // or just return random ones from the actual product list to show *real* product names at least.

        const { data: topProductsData } = await supabase
            .from('products')
            .select('name, price, image_url')
            .limit(5);

        const topProducts = topProductsData?.map(p => ({
            name: p.name,
            sales: 0, // Need order_items aggregation for real sales count
            revenue: 0, // Need order_items aggregation
            trend: '-',
            image: '📦' // Placeholder icon or use image_url if we render it as img
        })) || [];


        return res.status(200).json({
            success: true,
            stats: {
                products: productsCount || 0,
                buildings: buildingsCount || 0,
                revenue: totalRevenue,
                orders: ordersCount || 0
            },
            trends,
            charts: {
                revenue: revenueChart,
                // Mocking salesDonut for now as it requires complex category aggregation
                salesByCategory: [
                    { name: 'Perfume', value: 45000, count: 125, color: '#3b82f6' },
                    { name: 'Healthcare', value: 32000, count: 89, color: '#8b5cf6' },
                ]
            },
            recentOrders,
            topProducts
        });

    } catch (error) {
        console.error('Dashboard Stats API Error:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch dashboard stats'
        });
    }
}
