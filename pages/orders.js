// =====================================================
// CUSTOMER ORDERS HISTORY PAGE
// Sprint 7: E-Commerce Order Lifecycle
// Version: 7.0.0
// =====================================================

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import FrontLayout from '../components/Layout/FrontLayout';

export default function CustomerOrders() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    // Wait for auth to load
    if (authLoading) return;

    // Redirect to login if not authenticated
    if (!user) {
      router.push('/auth/login?redirect=/orders');
      return;
    }

    loadOrders();
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate user email exists
      if (!user?.email) {
        setError('User email not available');
        setLoading(false);
        return;
      }

      // Fetch orders by user's email
      const response = await fetch(`/api/orders?customer_email=${encodeURIComponent(user.email)}`);
      const data = await response.json();

      if (data.success) {
        setOrders(data.orders);
      } else {
        setError(data.error);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const viewOrderDetails = async (orderId) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      const data = await response.json();

      if (data.success) {
        setSelectedOrder(data.order);
        setShowDetails(true);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      alert('Failed to load order details');
    }
  };

  const cancelOrder = async (orderId) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    try {
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cancellation_reason: 'Customer requested cancellation'
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Order cancelled successfully');
        loadOrders();
        setShowDetails(false);
      } else {
        alert(`Failed to cancel order: ${data.error}`);
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Failed to cancel order');
    }
  };

  const getStatusClass = (status) => {
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    return validStatuses.includes(status) ? `status-${status}` : 'status-default';
  };

  const formatCurrency = (amount) => {
    const currency = settings?.currency || 'PKR';
    return `${currency} ${parseFloat(amount).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canCancelOrder = (order) => {
    return ['pending', 'confirmed'].includes(order.status);
  };

  return (
    <FrontLayout>
      <div className="orders-page">
        <div className="page-container">
          <div className="page-header">
            <h1>My Orders</h1>
            <p>View and manage your order history</p>
          </div>

          {(loading || authLoading) ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading your orders...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>⚠️ Error: {error}</p>
              <button onClick={loadOrders} className="retry-btn">Retry</button>
            </div>
          ) : orders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h2>No Orders Yet</h2>
              <p>Start shopping to see your orders here</p>
              <button onClick={() => router.push('/immersiveexp')} className="shop-btn">
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="orders-grid">
              {orders.map((order) => (
                <div key={order.id} className="order-card">
                  <div className="order-card-header">
                    <div>
                      <div className="order-number">{order.order_number}</div>
                      <div className="order-date">{formatDate(order.created_at)}</div>
                    </div>
                    <span
                      className={`status-badge ${getStatusClass(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="order-card-body">
                    <div className="order-summary">
                      <div className="summary-item">
                        <span className="label">Items:</span>
                        <span className="value">{order.items?.length || 0}</span>
                      </div>
                      <div className="summary-item">
                        <span className="label">Total:</span>
                        <span className="value amount">{formatCurrency(order.total_amount)}</span>
                      </div>
                    </div>

                    <div className="order-items-preview">
                      {order.items?.slice(0, 3).map((item, index) => (
                        <div key={index} className="item-preview">
                          • {item.product_name} (x{item.quantity})
                        </div>
                      ))}
                      {order.items?.length > 3 && (
                        <div className="item-preview more">
                          +{order.items.length - 3} more items
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="order-card-footer">
                    <button
                      onClick={() => viewOrderDetails(order.id)}
                      className="card-btn primary"
                    >
                      View Details
                    </button>
                    {canCancelOrder(order) && (
                      <button
                        onClick={() => cancelOrder(order.id)}
                        className="card-btn secondary"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Order Details Modal */}
          {showDetails && selectedOrder && (
            <div className="modal-overlay" onClick={() => setShowDetails(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <div>
                    <h2>{selectedOrder.order_number}</h2>
                    <p className="modal-subtitle">Ordered on {formatDate(selectedOrder.created_at)}</p>
                  </div>
                  <button onClick={() => setShowDetails(false)} className="close-btn">×</button>
                </div>

                <div className="modal-body">
                  {/* Status Section */}
                  <div className="detail-section">
                    <h3>Order Status</h3>
                    <div className="status-display">
                      <span
                        className={`status-badge large ${getStatusClass(selectedOrder.status)}`}
                      >
                        {selectedOrder.status.toUpperCase()}
                      </span>
                      {selectedOrder.status === 'shipped' && (
                        <p className="status-message">📦 Your order is on its way!</p>
                      )}
                      {selectedOrder.status === 'delivered' && (
                        <p className="status-message">✅ Your order has been delivered</p>
                      )}
                    </div>
                  </div>

                  {/* Order Timeline */}
                  <div className="detail-section">
                    <h3>Order Timeline</h3>
                    <div className="timeline">
                      <div className="timeline-step completed">
                        <div className="timeline-icon">✓</div>
                        <div className="timeline-content">
                          <div className="timeline-title">Order Placed</div>
                          <div className="timeline-date">{formatDate(selectedOrder.created_at)}</div>
                        </div>
                      </div>
                      {selectedOrder.confirmed_at && (
                        <div className="timeline-step completed">
                          <div className="timeline-icon">✓</div>
                          <div className="timeline-content">
                            <div className="timeline-title">Order Confirmed</div>
                            <div className="timeline-date">{formatDate(selectedOrder.confirmed_at)}</div>
                          </div>
                        </div>
                      )}
                      {selectedOrder.shipped_at && (
                        <div className="timeline-step completed">
                          <div className="timeline-icon">✓</div>
                          <div className="timeline-content">
                            <div className="timeline-title">Order Shipped</div>
                            <div className="timeline-date">{formatDate(selectedOrder.shipped_at)}</div>
                          </div>
                        </div>
                      )}
                      {selectedOrder.delivered_at && (
                        <div className="timeline-step completed">
                          <div className="timeline-icon">✓</div>
                          <div className="timeline-content">
                            <div className="timeline-title">Order Delivered</div>
                            <div className="timeline-date">{formatDate(selectedOrder.delivered_at)}</div>
                          </div>
                        </div>
                      )}
                      {selectedOrder.cancelled_at && (
                        <div className="timeline-step cancelled">
                          <div className="timeline-icon">✕</div>
                          <div className="timeline-content">
                            <div className="timeline-title">Order Cancelled</div>
                            <div className="timeline-date">{formatDate(selectedOrder.cancelled_at)}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="detail-section">
                    <h3>Order Items</h3>
                    <div className="items-list">
                      {selectedOrder.items?.map((item, index) => (
                        <div key={index} className="item-row">
                          <div className="item-details">
                            <div className="item-name">{item.product_name}</div>
                            {item.product_brand && (
                              <div className="item-brand">{item.product_brand}</div>
                            )}
                            <div className="item-quantity">Quantity: {item.quantity}</div>
                          </div>
                          <div className="item-price">
                            <div className="unit-price">{formatCurrency(item.unit_price)} each</div>
                            <div className="line-total">{formatCurrency(item.line_total)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Total */}
                  <div className="detail-section">
                    <h3>Order Total</h3>
                    <div className="total-breakdown">
                      <div className="total-row">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(selectedOrder.subtotal)}</span>
                      </div>
                      <div className="total-row">
                        <span>Tax:</span>
                        <span>{formatCurrency(selectedOrder.tax_amount)}</span>
                      </div>
                      <div className="total-row grand-total">
                        <span>Total:</span>
                        <span>{formatCurrency(selectedOrder.total_amount)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {canCancelOrder(selectedOrder) && (
                    <div className="modal-actions">
                      <button
                        onClick={() => cancelOrder(selectedOrder.id)}
                        className="cancel-order-btn"
                      >
                        Cancel This Order
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .orders-page {
          min-height: 100vh;
          background: var(--bg-tertiary);
          color: var(--text-primary);
          padding: 40px 20px;
        }

        .page-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .page-header h1 {
          font-size: 36px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 10px 0;
        }

        .page-header p {
          font-size: 16px;
          color: var(--text-secondary);
          margin: 0;
        }

        .loading-state, .error-state, .empty-state {
          text-align: center;
          padding: 60px 40px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-subtle);
          border-radius: 16px;
          color: var(--text-primary);
          backdrop-filter: blur(10px);
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 5px solid var(--border-subtle);
          border-top: 5px solid var(--color-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 24px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .empty-icon {
          font-size: 64px;
          margin-bottom: 24px;
        }

        .empty-state h2 {
          font-size: 24px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 16px 0;
        }

        .empty-state p {
          font-size: 16px;
          color: var(--text-secondary);
          margin: 0 0 32px 0;
        }

        .shop-btn, .retry-btn {
          padding: 0.75rem 2rem;
          background: var(--color-primary);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .shop-btn:hover, .retry-btn:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
          background: var(--color-primary-dark);
        }

        .orders-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 2rem;
        }

        .order-card {
          background: var(--bg-primary);
          border-radius: 12px;
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--border-primary);
          overflow: hidden;
          transition: all 0.3s;
        }

        .order-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
        }

        .order-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 1.5rem;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-primary);
        }

        .card-btn.primary {
          background: var(--color-primary);
          color: white;
        }

        .card-btn.primary:hover {
          background: var(--color-primary-dark);
          box-shadow: var(--shadow-sm);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 2rem;
          border-bottom: 1px solid var(--border-primary);
          background: var(--bg-secondary);
        }

        .modal-header h2 {
          margin: 0 0 0.5rem 0;
          color: var(--text-primary);
          font-size: 1.5rem;
        }

        .modal-subtitle {
          margin: 0;
          color: var(--text-secondary);
          font-size: 0.95rem;
        }

        .close-btn {
          width: 40px;
          height: 40px;
          border: 1px solid var(--border-primary);
          background: var(--bg-primary);
          color: var(--text-primary);
          border-radius: 50%;
          font-size: 24px;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-btn:hover {
          background: var(--bg-tertiary);
          transform: rotate(90deg);
        }

        .modal-body {
          padding: 2rem;
        }

        .detail-section {
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 2px solid var(--border-primary);
        }

        .detail-section:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        .detail-section h3 {
          margin: 0 0 1.5rem 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .status-display {
          text-align: center;
        }

        .status-message {
          margin: 1rem 0 0 0;
          font-size: 1rem;
          color: var(--text-secondary);
        }

        .timeline {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .timeline-step {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }

        .timeline-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--color-success);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          flex-shrink: 0;
        }

        .timeline-step.cancelled .timeline-icon {
          background: var(--color-error);
        }

        .timeline-content {
          flex: 1;
        }

        .timeline-title {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .timeline-date {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .items-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .item-row {
          display: flex;
          justify-content: space-between;
          padding: 1rem;
          background: var(--bg-tertiary);
          border-radius: 8px;
          border-left: 4px solid var(--color-primary);
        }

        .item-details {
          flex: 1;
        }

        .item-name {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .item-brand {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: 0.25rem;
        }

        .item-quantity {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .item-price {
          text-align: right;
        }

        .unit-price {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: 0.25rem;
        }

        .line-total {
          font-weight: 700;
          color: var(--text-primary);
          font-size: 1.1rem;
        }

        .total-breakdown {
          background: var(--bg-tertiary);
          padding: 1.5rem;
          border-radius: 8px;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem 0;
          font-size: 1rem;
        }

        .total-row.grand-total {
          border-top: 2px solid var(--border-primary);
          margin-top: 0.5rem;
          padding-top: 1rem;
          font-weight: 700;
          font-size: 1.3rem;
          color: var(--text-primary);
        }

        .modal-actions {
          margin-top: 2rem;
          display: flex;
          justify-content: center;
        }

        .cancel-order-btn {
          padding: 0.75rem 2rem;
          background: var(--bg-primary);
          color: var(--color-error);
          border: 2px solid var(--color-error);
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .cancel-order-btn:hover {
          background: var(--color-error);
          color: white;
        }

        @media (max-width: 768px) {
          .page-header h1 {
            font-size: 2rem;
          }

          .orders-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .modal-overlay {
            padding: 1rem;
          }

          .order-card-footer {
            flex-direction: column;
          }
        }
      `}</style>
    </FrontLayout>
  );
}

// Prevent static generation - render on server only
export async function getServerSideProps() {
  return { props: {} };
}
