import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { items } = req.body;

        // Validate input
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Invalid request: items must be a non-empty array' });
        }

        // Validate each item has required fields
        for (const item of items) {
            if (!item.product_id || typeof item.quantity !== 'number' || item.quantity <= 0) {
                return res.status(400).json({
                    error: 'Invalid item: each item must have product_id and positive quantity'
                });
            }
        }

        // Extract product IDs
        const productIds = items.map(item => item.product_id);

        // Fetch current stock levels from database
        const { data: products, error } = await supabase
            .from('products')
            .select('id, name, stock_quantity')
            .in('id', productIds);

        if (error) {
            console.error('Database error:', error);
            return res.status(500).json({ error: 'Failed to fetch stock levels' });
        }

        // Build response with stock availability
        const stockResults = items.map(item => {
            const product = products.find(p => p.id === item.product_id);

            if (!product) {
                return {
                    product_id: item.product_id,
                    available: false,
                    available_stock: 0,
                    requested: item.quantity,
                    error: 'Product not found'
                };
            }

            const availableStock = product.stock_quantity || 0;
            const isAvailable = item.quantity <= availableStock;

            return {
                product_id: item.product_id,
                product_name: product.name,
                available: isAvailable,
                available_stock: availableStock,
                requested: item.quantity,
                error: !isAvailable
                    ? (availableStock > 0
                        ? `Only ${availableStock} available`
                        : 'Out of stock')
                    : null
            };
        });

        // Overall availability
        const allAvailable = stockResults.every(result => result.available);

        return res.status(200).json({
            available: allAvailable,
            items: stockResults
        });

    } catch (error) {
        console.error('Stock check error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
