// =====================================================
// SHOPPING CART PAGE
// Shows cart items with quantity controls and checkout button
// =====================================================

import { useCart } from '../contexts/CartContext';
import FrontLayout from '../components/Layout/FrontLayout';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

// Stock warning threshold
const LOW_STOCK_THRESHOLD = 5;

export default function CartPage() {
  const router = useRouter();
  const { cart, removeFromCart, incrementQuantity, decrementQuantity, getCartTotals } = useCart();
  const totals = getCartTotals();
  const [errorMessage, setErrorMessage] = useState('');

  const handleIncrement = (productId) => {
    const result = incrementQuantity(productId);
    if (!result.success) {
      setErrorMessage(result.error);
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handleDecrement = (productId) => {
    decrementQuantity(productId);
    setErrorMessage('');
  };

  if (cart.length === 0) {
    return (
      <FrontLayout>
        <div className="cart-page">
          <div className="cart-container">
            <h1>Shopping Cart</h1>
            <div className="empty-cart">
              <p>Your cart is empty</p>
              <Link href="/immersiveexp" className="continue-shopping-btn">
                Continue Shopping
              </Link>
            </div>
          </div>

          <style jsx>{`
            .cart-page {
              min-height: 80vh;
              padding: 40px 20px;
              position: relative;
              z-index: 1;
              background: var(--bg-secondary);
            }

            .cart-container {
              max-width: 1200px;
              margin: 0 auto;
            }

            h1 {
              font-size: 36px;
              font-weight: 700;
              color: var(--text-primary);
              margin-bottom: 32px;
              text-align: center;
            }

            .empty-cart {
              background: var(--bg-tertiary);
              backdrop-filter: blur(10px);
              border: 1px solid var(--border-subtle);
              border-radius: 16px;
              padding: 60px 40px;
              text-align: center;
            }

            .empty-cart p {
              font-size: 20px;
              color: var(--text-secondary);
              margin-bottom: 24px;
            }

            .continue-shopping-btn {
              display: inline-block;
              background: var(--color-primary);
              color: white;
              padding: 14px 32px;
              border-radius: 8px;
              font-weight: 600;
              text-decoration: none;
              transition: transform 0.2s, box-shadow 0.2s;
            }

            .continue-shopping-btn:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
            }
          `}</style>
        </div>
      </FrontLayout>
    );
  }

  return (
    <FrontLayout>
      <div className="cart-page">
        <div className="cart-container">
          <h1>Shopping Cart</h1>

          {errorMessage && (
            <div className="error-banner">
              {errorMessage}
            </div>
          )}

          <div className="cart-content">
            <div className="cart-items">
              {cart.map((item) => (
                <div key={item.product_id} className="cart-item">
                  <div className="item-image">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} />
                    ) : (
                      <div className="image-placeholder">No Image</div>
                    )}
                  </div>

                  <div className="item-details">
                    <h3 className="item-name">{item.name}</h3>
                    {item.brand && <p className="item-brand">{item.brand}</p>}
                    <p className="item-price">PKR {item.price.toFixed(2)}</p>
                    {item.stock_quantity !== undefined && (
                      <p className="item-stock">
                        {item.stock_quantity <= LOW_STOCK_THRESHOLD
                          ? `Only ${item.stock_quantity} left in stock!`
                          : `In stock (${item.stock_quantity} available)`}
                      </p>
                    )}
                  </div>

                  <div className="item-quantity">
                    <button
                      className="quantity-btn"
                      onClick={() => handleDecrement(item.product_id)}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="quantity-value">{item.quantity}</span>
                    <button
                      className="quantity-btn"
                      onClick={() => handleIncrement(item.product_id)}
                      aria-label="Increase quantity"
                      disabled={item.stock_quantity !== undefined && item.quantity >= item.stock_quantity}
                    >
                      +
                    </button>
                  </div>

                  <div className="item-total">
                    <p className="total-label">Total</p>
                    <p className="total-amount">PKR {(item.price * item.quantity).toFixed(2)}</p>
                  </div>

                  <button
                    className="remove-btn"
                    onClick={() => removeFromCart(item.product_id)}
                    aria-label="Remove item"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h2>Order Summary</h2>

              <div className="summary-row">
                <span>Subtotal ({totals.itemCount} items)</span>
                <span>PKR {totals.subtotal.toFixed(2)}</span>
              </div>

              {totals.taxAmount > 0 && (
                <div className="summary-row">
                  <span>Tax</span>
                  <span>PKR {totals.taxAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="summary-divider"></div>

              <div className="summary-row summary-total">
                <span>Total</span>
                <span>PKR {totals.total.toFixed(2)}</span>
              </div>

              <button
                className="checkout-btn"
                onClick={() => router.push('/checkout')}
              >
                Proceed to Checkout
              </button>

              <Link href="/immersiveexp" className="continue-link">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>

        <style jsx>{`
          .cart-page {
            min-height: 80vh;
            padding: 40px 20px;
            position: relative;
            z-index: 1;
            background: var(--bg-tertiary);
          }

          .error-banner {
            background: rgba(220, 53, 69, 0.1);
            border: 1px solid var(--color-danger);
            color: var(--color-danger);
            padding: 12px 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
            font-weight: 500;
            animation: slideDown 0.3s ease-out;
          }

          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .cart-container {
            max-width: 1200px;
            margin: 0 auto;
          }

          h1 {
            font-size: 36px;
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: 32px;
            text-align: center;
          }

          .cart-content {
            display: grid;
            grid-template-columns: 1fr 400px;
            gap: 32px;
          }

          @media (max-width: 968px) {
            .cart-content {
              grid-template-columns: 1fr;
            }
          }

          .cart-items {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .cart-item {
            background: var(--bg-primary);
            border: 1px solid var(--border-primary);
            border-radius: 12px;
            padding: 20px;
            display: grid;
            grid-template-columns: 100px 1fr auto auto auto;
            gap: 20px;
            align-items: center;
            position: relative;
            box-shadow: var(--shadow-sm);
          }

          @media (max-width: 768px) {
            .cart-item {
              grid-template-columns: 80px 1fr;
              gap: 12px;
            }

            .item-quantity,
            .item-total {
              grid-column: 2 / 3;
            }
          }

          .item-image {
            width: 100px;
            height: 100px;
            border-radius: 8px;
            overflow: hidden;
            background: var(--bg-secondary);
          }

          .item-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .image-placeholder {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-secondary);
            font-size: 12px;
          }

          .item-details {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .item-name {
            font-size: 18px;
            font-weight: 600;
            color: var(--text-primary);
            margin: 0;
          }

          .item-brand {
            font-size: 14px;
            color: var(--text-secondary);
            margin: 0;
          }

          .item-stock {
            font-size: 12px;
            color: var(--color-warning);
            margin: 4px 0 0 0;
            font-weight: 500;
          }

          .item-price {
            font-size: 16px;
            color: var(--color-primary);
            font-weight: 600;
            margin: 4px 0 0 0;
          }

          .item-quantity {
            display: flex;
            align-items: center;
            gap: 12px;
            background: var(--bg-secondary);
            border: 1px solid var(--border-primary);
            border-radius: 8px;
            padding: 8px 12px;
          }

          .quantity-btn {
            background: none;
            border: none;
            color: var(--text-primary);
            font-size: 20px;
            cursor: pointer;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            transition: background 0.2s;
          }

          .quantity-btn:hover:not(:disabled) {
            background: var(--bg-tertiary);
          }

          .quantity-btn:disabled {
            opacity: 0.4;
            cursor: not-allowed;
          }

          .quantity-value {
            font-size: 16px;
            font-weight: 600;
            color: var(--text-primary);
            min-width: 30px;
            text-align: center;
          }

          .item-total {
            text-align: right;
          }

          .total-label {
            font-size: 12px;
            color: var(--text-secondary);
            margin: 0 0 4px 0;
          }

          .total-amount {
            font-size: 18px;
            font-weight: 700;
            color: var(--text-primary);
            margin: 0;
          }

          .remove-btn {
            position: absolute;
            top: 12px;
            right: 12px;
            background: rgba(220, 53, 69, 0.1);
            border: 1px solid rgba(220, 53, 69, 0.2);
            color: var(--color-danger);
            width: 32px;
            height: 32px;
            border-radius: 50%;
            font-size: 24px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
          }

          .remove-btn:hover {
            background: rgba(220, 53, 69, 0.2);
            transform: scale(1.1);
          }

          .cart-summary {
            background: var(--bg-primary);
            border: 1px solid var(--border-primary);
            border-radius: 12px;
            padding: 24px;
            height: fit-content;
            position: sticky;
            top: 100px;
            box-shadow: var(--shadow-sm);
          }

          .cart-summary h2 {
            font-size: 24px;
            font-weight: 700;
            color: var(--text-primary);
            margin: 0 0 20px 0;
          }

          .summary-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            color: var(--text-secondary);
            font-size: 16px;
          }

          .summary-divider {
            height: 1px;
            background: var(--border-primary);
            margin: 12px 0;
          }

          .summary-total {
            font-size: 20px;
            font-weight: 700;
            color: var(--text-primary);
            padding: 16px 0;
          }

          .checkout-btn {
            width: 100%;
            background: var(--color-primary);
            color: white;
            border: none;
            padding: 16px;
            border-radius: 8px;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
            margin-top: 20px;
          }

          .checkout-btn:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-md);
            background: var(--color-primary-dark);
          }

          .continue-link {
            display: block;
            text-align: center;
            color: var(--color-primary);
            text-decoration: none;
            margin-top: 16px;
            font-size: 14px;
            transition: color 0.2s;
          }

          .continue-link:hover {
            color: var(--color-primary-dark);
            text-decoration: underline;
          }

        `}</style>
      </div>
    </FrontLayout>
  );
}

// Prevent static generation - render on server only
export async function getServerSideProps() {
  return { props: {} };
}
