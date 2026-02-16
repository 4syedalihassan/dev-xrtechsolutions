// =====================================================
// SHOPPING CART CONTEXT
// Sprint 7: E-Commerce Order Lifecycle
// Version: 7.0.0
// =====================================================

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Validate cart item has required fields
  const isValidCartItem = (item) => {
    return (
      item &&
      typeof item === 'object' &&
      typeof item.product_id === 'string' &&
      typeof item.name === 'string' &&
      typeof item.price === 'number' &&
      !isNaN(item.price) &&
      item.price >= 0 &&
      typeof item.quantity === 'number' &&
      Number.isInteger(item.quantity) &&
      item.quantity > 0
    );
  };

  // Helper to check if stock tracking is enabled for a product
  const isStockTracked = (stockQuantity) => {
    return stockQuantity !== undefined;
  };

  // Load cart from session storage on mount
  useEffect(() => {
    const savedCart = sessionStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);

        // Validate parsed data is an array
        if (!Array.isArray(parsed)) {
          throw new Error('Cart data is not an array');
        }

        // Filter and validate each cart item
        const validItems = parsed.filter(isValidCartItem);

        if (validItems.length !== parsed.length) {
          // Some items were invalid, save cleaned version
          sessionStorage.setItem('cart', JSON.stringify(validItems));
        }

        setCart(validItems);
      } catch (error) {
        console.error('Failed to load cart from session storage:', error);
        sessionStorage.removeItem('cart');
      }
    }
  }, []);

  // Save cart to session storage whenever it changes
  useEffect(() => {
    if (cart.length > 0) {
      sessionStorage.setItem('cart', JSON.stringify(cart));
    } else {
      sessionStorage.removeItem('cart');
    }
  }, [cart]);

  // Add product to cart with real-time stock validation
  const addToCart = async (product, quantity = 1) => {
    // Validate quantity is a positive integer
    if (!Number.isInteger(quantity)) {
      console.error('Invalid quantity (not an integer):', quantity);
      return { success: false, error: 'Invalid quantity' };
    }

    if (quantity <= 0) {
      console.error('Invalid quantity (not positive):', quantity);
      return { success: false, error: 'Invalid quantity' };
    }

    try {
      // Check if product already in cart
      const existingItem = cart.find(item => item.product_id === product.id);
      const totalQuantity = existingItem ? existingItem.quantity + quantity : quantity;

      // Fetch real-time stock from database
      const response = await fetch('/api/products/check-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ product_id: product.id, quantity: totalQuantity }]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to check stock');
      }

      const { items } = await response.json();
      const stockCheck = items[0];

      // Validate stock availability
      if (!stockCheck.available) {
        return {
          success: false,
          error: stockCheck.error || 'Insufficient stock'
        };
      }

      // Stock validation passed - update cart
      setCart(prevCart => {
        const existingItem = prevCart.find(item => item.product_id === product.id);

        if (existingItem) {
          // Update quantity if product already in cart
          return prevCart.map(item =>
            item.product_id === product.id
              ? { ...item, quantity: item.quantity + quantity, stock_quantity: stockCheck.available_stock }
              : item
          );
        } else {
          // Add new product to cart
          return [
            ...prevCart,
            {
              product_id: product.id,
              name: product.name,
              brand: product.brand || '',
              price: parseFloat(product.price),
              image_url: product.image_url || '',
              quantity: quantity,
              stock_quantity: stockCheck.available_stock
            }
          ];
        }
      });

      // Auto-open cart when adding item successfully
      setIsCartOpen(true);
      return { success: true };

    } catch (error) {
      console.error('Error adding to cart:', error);
      return {
        success: false,
        error: 'Failed to add to cart. Please try again.'
      };
    }
  };

  // Remove product from cart
  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.product_id !== productId));
  };

  // Update quantity of product in cart
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return { success: true };
    }

    // Validate quantity is a positive integer
    if (!Number.isInteger(newQuantity)) {
      return { success: false, error: 'Invalid quantity' };
    }

    let stockExceeded = false;
    setCart(prevCart =>
      prevCart.map(item => {
        if (item.product_id === productId) {
          // Check stock limit if tracking is enabled
          if (isStockTracked(item.stock_quantity) && newQuantity > item.stock_quantity) {
            stockExceeded = true;
            return item; // Don't update
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );

    if (stockExceeded) {
      return { success: false, error: 'Quantity exceeds available stock' };
    }
    return { success: true };
  };

  // Increase quantity by 1
  const incrementQuantity = (productId) => {
    let stockExceeded = false;
    let maxStock = 0;

    setCart(prevCart =>
      prevCart.map(item => {
        if (item.product_id === productId) {
          const newQuantity = item.quantity + 1;
          // Check stock limit if tracking is enabled
          if (isStockTracked(item.stock_quantity) && newQuantity > item.stock_quantity) {
            stockExceeded = true;
            maxStock = item.stock_quantity;
            return item; // Don't increment
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );

    if (stockExceeded) {
      return { success: false, error: `Maximum available quantity is ${maxStock}` };
    }
    return { success: true };
  };

  // Decrease quantity by 1
  const decrementQuantity = (productId) => {
    setCart(prevCart =>
      prevCart.map(item => {
        if (item.product_id === productId) {
          const newQuantity = item.quantity - 1;
          if (newQuantity <= 0) {
            return null; // Will be filtered out
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(Boolean)
    );
  };

  // Validate cart stock levels against database
  const validateCartStock = async () => {
    if (cart.length === 0) return { valid: true, issues: [] };

    try {
      const response = await fetch('/api/products/check-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Failed to validate stock');
      }

      const { items: stockResults } = await response.json();
      const issues = [];

      // Update cart with latest stock levels and handle issues
      setCart(prevCart => {
        return prevCart.map(item => {
          const stockCheck = stockResults.find(s => s.product_id === item.product_id);

          if (!stockCheck) return item;

          // Update stock quantity
          const updatedItem = { ...item, stock_quantity: stockCheck.available_stock };

          // Check if quantity needs adjustment
          if (!stockCheck.available) {
            issues.push({
              product_id: item.product_id,
              name: item.name,
              error: stockCheck.error,
              old_quantity: item.quantity,
              new_quantity: stockCheck.available_stock
            });

            // Adjust quantity to available stock (or remove if 0)
            if (stockCheck.available_stock > 0) {
              updatedItem.quantity = Math.min(item.quantity, stockCheck.available_stock);
            } else {
              return null; // Will be filtered out
            }
          }

          return updatedItem;
        }).filter(Boolean);
      });

      return { valid: issues.length === 0, issues };

    } catch (error) {
      console.error('Error validating cart stock:', error);
      return { valid: false, issues: [], error: 'Failed to validate stock' };
    }
  };

  // Clear entire cart
  const clearCart = () => {
    setCart([]);
    sessionStorage.removeItem('cart');
  };

  // Calculate cart totals
  const getCartTotals = () => {
    const subtotal = cart.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    // Get tax rate from settings (default 0%)
    // This could be fetched from API, but for now we'll default to 0
    const taxRate = 0; // Can be updated to fetch from settings

    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      taxAmount: parseFloat(taxAmount.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      itemCount: cart.reduce((count, item) => count + item.quantity, 0)
    };
  };

  // Toggle cart open/close
  const toggleCart = () => {
    setIsCartOpen(prev => !prev);
  };

  const value = {
    cart,
    isCartOpen,
    setIsCartOpen,
    toggleCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    getCartTotals,
    validateCartStock,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}
