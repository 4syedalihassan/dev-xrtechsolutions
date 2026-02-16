import { useState, useEffect } from 'react';
import { useCart } from '../../contexts/CartContext';
import { useRouter } from 'next/router';
import { formatCurrency } from '../../lib/format';

export default function ShoppingCart() {
  const router = useRouter();
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, incrementQuantity, decrementQuantity, clearCart, getCartTotals, validateCartStock } = useCart();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(null);
  const [stockIssues, setStockIssues] = useState([]);

  useEffect(() => {
    loadSettings();
  }, []);

  // Auto-refresh stock levels every 30 seconds
  useEffect(() => {
    if (!isCartOpen || cart.length === 0) return;

    const refreshStock = async () => {
      const result = await validateCartStock();
      if (result && result.issues && result.issues.length > 0) {
        setStockIssues(result.issues);
        // Auto-clear issues after 5 seconds
        setTimeout(() => setStockIssues([]), 5000);
      }
    };

    // Validate immediately when cart opens
    refreshStock();

    // Then validate every 30 seconds
    const interval = setInterval(refreshStock, 30000);
    return () => clearInterval(interval);
  }, [isCartOpen, cart.length, validateCartStock]);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleClearCart = async () => {
    if (!confirm('Are you sure you want to clear your cart?')) return;
    setLoading(true);
    clearCart();
    setLoading(false);
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    router.push('/checkout');
  };

  if (!isCartOpen) return null;

  const totals = getCartTotals();

  return (
    <div style={styles.overlay} onClick={() => setIsCartOpen(false)}>
      <div style={styles.sidebar} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Shopping Cart ({totals.itemCount})</h2>
          <button onClick={() => setIsCartOpen(false)} style={styles.closeButton}>×</button>
        </div>

        <div style={styles.content}>
          {stockIssues.length > 0 && (
            <div style={styles.stockAlert}>
              <strong>⚠️ Stock Updated:</strong>
              {stockIssues.map((issue, idx) => (
                <div key={idx} style={styles.stockIssueItem}>
                  {issue.name}: {issue.error}
                  {issue.new_quantity > 0 && ` (adjusted to ${issue.new_quantity})`}
                </div>
              ))}
            </div>
          )}

          {cart.length === 0 ? (
            <div style={styles.emptyCart}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <p style={styles.emptyText}>Your cart is empty</p>
              <p style={styles.emptySubtext}>Click on products in the perfume shop to add them</p>
            </div>
          ) : (
            <>
              <div style={styles.itemsList}>
                {cart.map((item) => (
                  <div key={item.product_id} style={styles.cartItem}>
                    <div style={styles.itemImage}>
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name} style={styles.thumbnail} />
                      ) : (
                        <div style={styles.placeholderImage}>🧴</div>
                      )}
                    </div>

                    <div style={styles.itemDetails}>
                      <h3 style={styles.itemName}>{item.name}</h3>
                      <p style={styles.itemBrand}>{item.brand}</p>
                      <p style={styles.itemPrice}>{formatCurrency(item.price)}</p>
                      {item.stock_quantity !== undefined && (
                        <p style={{
                          ...styles.stockBadge,
                          ...(item.stock_quantity === 0 ? styles.stockOut :
                            item.stock_quantity <= 5 ? styles.stockLow :
                              styles.stockOk)
                        }}>
                          {item.stock_quantity === 0 ? '⛔ Out of stock' :
                            item.stock_quantity <= 5 ? `⚠️ Only ${item.stock_quantity} left` :
                              '✓ In stock'}
                        </p>
                      )}
                    </div>

                    <div style={styles.itemActions}>
                      <div style={styles.quantityControl}>
                        <button
                          onClick={() => decrementQuantity(item.product_id)}
                          style={styles.qtyButton}
                          disabled={item.quantity <= 1}
                        >
                          −
                        </button>
                        <span style={styles.qtyDisplay}>{item.quantity}</span>
                        <button
                          onClick={() => incrementQuantity(item.product_id)}
                          style={styles.qtyButton}
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product_id)}
                        style={styles.removeButton}
                      >
                        Remove
                      </button>

                      <div style={styles.itemTotal}>
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={styles.footer}>
                <button
                  onClick={handleClearCart}
                  disabled={loading}
                  style={styles.clearButton}
                >
                  Clear Cart
                </button>

                <div style={styles.totalSection}>
                  <div style={styles.totalRow}>
                    <span>Subtotal:</span>
                    <span>{formatCurrency(totals.subtotal)}</span>
                  </div>
                  <div style={styles.totalRow}>
                    <span>Tax:</span>
                    <span>{formatCurrency(totals.taxAmount)}</span>
                  </div>
                  <div style={{ ...styles.totalRow, ...styles.grandTotal }}>
                    <span>Total:</span>
                    <span>{formatCurrency(totals.total)}</span>
                  </div>
                </div>

                <button style={styles.checkoutButton} onClick={handleCheckout}>
                  Proceed to Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 9999,
    display: 'flex',
    justifyContent: 'flex-end'
  },
  sidebar: {
    width: '100%',
    maxWidth: '450px',
    backgroundColor: 'white',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '-2px 0 10px rgba(0,0,0,0.1)'
  },
  header: {
    padding: '20px',
    borderBottom: '2px solid #f0f0f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fafafa'
  },
  title: {
    margin: 0,
    fontSize: '22px',
    color: '#333'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '32px',
    cursor: 'pointer',
    color: '#666',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    transition: 'background 0.2s'
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  emptyCart: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    color: '#999'
  },
  emptyText: {
    fontSize: '18px',
    marginTop: '20px',
    marginBottom: '10px',
    fontWeight: 'bold',
    color: '#666'
  },
  emptySubtext: {
    fontSize: '14px',
    textAlign: 'center',
    color: '#999'
  },
  itemsList: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px'
  },
  cartItem: {
    display: 'flex',
    gap: '15px',
    padding: '15px',
    marginBottom: '15px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    backgroundColor: '#fafafa'
  },
  itemImage: {
    width: '80px',
    height: '80px',
    flexShrink: 0,
    backgroundColor: '#f0f0f0',
    borderRadius: '6px',
    overflow: 'hidden'
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px'
  },
  itemDetails: {
    flex: 1,
    minWidth: 0
  },
  itemName: {
    margin: '0 0 5px 0',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333'
  },
  itemBrand: {
    margin: '0 0 5px 0',
    fontSize: '13px',
    color: '#666',
    fontStyle: 'italic'
  },
  itemPrice: {
    margin: 0,
    fontSize: '14px',
    color: '#4CAF50',
    fontWeight: 'bold'
  },
  itemActions: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '8px'
  },
  quantityControl: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #ddd',
    borderRadius: '6px',
    overflow: 'hidden'
  },
  qtyButton: {
    width: '32px',
    height: '32px',
    border: 'none',
    backgroundColor: 'white',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold'
  },
  qtyDisplay: {
    minWidth: '40px',
    textAlign: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
    padding: '0 8px'
  },
  removeButton: {
    backgroundColor: 'transparent',
    color: '#f44336',
    border: 'none',
    padding: '4px 8px',
    fontSize: '12px',
    cursor: 'pointer',
    textDecoration: 'underline'
  },
  itemTotal: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333'
  },
  footer: {
    borderTop: '2px solid #f0f0f0',
    padding: '20px',
    backgroundColor: '#fafafa'
  },
  clearButton: {
    width: '100%',
    padding: '10px',
    backgroundColor: 'transparent',
    border: '1px solid #ddd',
    borderRadius: '6px',
    cursor: 'pointer',
    marginBottom: '15px',
    color: '#666',
    fontSize: '14px'
  },
  totalSection: {
    marginBottom: '15px'
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    fontSize: '15px',
    color: '#666'
  },
  grandTotal: {
    borderTop: '2px solid #ddd',
    marginTop: '8px',
    paddingTop: '12px',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333'
  },
  checkoutButton: {
    width: '100%',
    padding: '15px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  stockAlert: {
    backgroundColor: '#fff3cd',
    border: '1px solid #ffc107',
    borderRadius: '6px',
    padding: '12px',
    margin: '15px 20px',
    fontSize: '13px',
    color: '#856404'
  },
  stockIssueItem: {
    marginTop: '5px',
    paddingLeft: '10px'
  },
  stockBadge: {
    fontSize: '11px',
    fontWeight: 'bold',
    marginTop: '4px',
    padding: '2px 6px',
    borderRadius: '3px',
    display: 'inline-block'
  },
  stockOk: {
    backgroundColor: '#d4edda',
    color: '#155724'
  },
  stockLow: {
    backgroundColor: '#fff3cd',
    color: '#856404'
  },
  stockOut: {
    backgroundColor: '#f8d7da',
    color: '#721c24'
  }
};
