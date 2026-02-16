// Shopping cart API endpoints
// GET /api/cart?session_id=xxx - Get cart contents
// POST /api/cart - Add item to cart
// DELETE /api/cart - Clear cart

export default async function handler(req, res) {
  const { method, query } = req;

  // Initialize global cart storage
  if (!global.shoppingCarts) {
    global.shoppingCarts = {};
  }

  switch (method) {
    case 'GET':
      try {
        const { session_id } = query;

        if (!session_id) {
          return res.status(400).json({
            success: false,
            error: 'session_id is required'
          });
        }

        const cart = global.shoppingCarts[session_id] || { items: [], total: 0 };

        res.status(200).json({
          success: true,
          cart
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Failed to fetch cart'
        });
      }
      break;

    case 'POST':
      try {
        const { session_id, product_id, quantity } = req.body;

        if (!session_id || !product_id) {
          return res.status(400).json({
            success: false,
            error: 'session_id and product_id are required'
          });
        }

        // Get product details
        const product = global.perfumeProducts?.find(p => p.id === parseInt(product_id));

        if (!product) {
          return res.status(404).json({
            success: false,
            error: 'Product not found'
          });
        }

        // Initialize cart if doesn't exist
        if (!global.shoppingCarts[session_id]) {
          global.shoppingCarts[session_id] = { items: [], total: 0 };
        }

        const cart = global.shoppingCarts[session_id];

        // Check if product already in cart
        const existingItemIndex = cart.items.findIndex(item => item.product_id === parseInt(product_id));

        if (existingItemIndex > -1) {
          // Update quantity
          cart.items[existingItemIndex].quantity += parseInt(quantity) || 1;
        } else {
          // Add new item
          cart.items.push({
            product_id: parseInt(product_id),
            product_name: product.name,
            product_brand: product.brand,
            price: product.price,
            quantity: parseInt(quantity) || 1,
            image_url: product.image_url
          });
        }

        // Calculate total
        cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        res.status(200).json({
          success: true,
          cart
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Failed to add to cart'
        });
      }
      break;

    case 'DELETE':
      try {
        const { session_id } = req.body;

        if (!session_id) {
          return res.status(400).json({
            success: false,
            error: 'session_id is required'
          });
        }

        delete global.shoppingCarts[session_id];

        res.status(200).json({
          success: true,
          message: 'Cart cleared'
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Failed to clear cart'
        });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
