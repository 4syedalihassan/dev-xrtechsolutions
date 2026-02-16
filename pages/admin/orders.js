// =====================================================
// ADMIN ORDERS MANAGEMENT PAGE
// Sprint 7: E-Commerce Order Lifecycle
// Version: 7.0.0
// =====================================================

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/Admin/AdminLayout';
import { useAuth } from '../../contexts/AuthContext';

function AdminOrdersClient() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [settings, setSettings] = useState(null);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Client-side auth check
  useEffect(() => {
    if (!authLoading && (!user || !['admin', 'super_admin'].includes(user.role))) {
      router.push('/admin/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && ['admin', 'super_admin'].includes(user.role)) {
      loadOrders();
      loadSettings();
    }
  }, [filterStatus, user]);

  // Show loading state until auth check completes
  if (authLoading || !user || !['admin', 'super_admin'].includes(user.role)) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#f5f7fa'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f0f0f0',
            borderTop: '4px solid #00BCD4',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

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
      const url = filterStatus === 'all'
        ? '/api/orders'
        : `/api/orders?status=${filterStatus}`;

      const response = await fetch(url);

      if (!response.ok) {
        // Try to parse error details from response
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || errorData.error || `API returned ${response.status}`);
        } catch (parseError) {
          throw new Error(`API returned ${response.status}: ${response.statusText}`);
        }
      }

      const data = await response.json();

      console.log('Orders API response:', data); // DEBUG

      if (data.success) {
        const orders = data.orders || [];
        console.log('Orders:', orders); // DEBUG
        console.log('First order:', orders[0]); // DEBUG
        setOrders(orders);
      } else {
        setError(data.error || 'Unknown error occurred');
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
      setError(err.message || 'Failed to fetch orders. The orders table may not exist yet.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (data.success) {
        alert(`Order status updated to ${newStatus}`);
        loadOrders();
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(data.order);
        }
      } else {
        alert(`Failed to update order: ${data.error}`);
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order status');
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

  const getStatusColor = (status) => {
    const colors = {
      pending: '#FF9800',
      confirmed: '#2196F3',
      processing: '#9C27B0',
      shipped: '#667eea',
      delivered: '#4CAF50',
      cancelled: '#F44336'
    };
    return colors[status] || '#999';
  };

  const formatCurrency = (amount) => {
    const currency = settings?.currency || 'PKR';
    return `${currency} ${parseFloat(amount).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredOrders = orders.filter(order => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        order.order_number.toLowerCase().includes(search) ||
        order.customers?.name?.toLowerCase().includes(search) ||
        order.customers?.email?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  return (
    <AdminLayout currentPage="Orders Management">
      <div className="orders-container">
        {/* Header Actions */}
        <div className="orders-header">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search orders by number, customer name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-buttons">
            <button
              onClick={() => setFilterStatus('all')}
              className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            >
              All Orders ({orders.length})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilterStatus('confirmed')}
              className={`filter-btn ${filterStatus === 'confirmed' ? 'active' : ''}`}
            >
              Confirmed
            </button>
            <button
              onClick={() => setFilterStatus('processing')}
              className={`filter-btn ${filterStatus === 'processing' ? 'active' : ''}`}
            >
              Processing
            </button>
            <button
              onClick={() => setFilterStatus('shipped')}
              className={`filter-btn ${filterStatus === 'shipped' ? 'active' : ''}`}
            >
              Shipped
            </button>
            <button
              onClick={() => setFilterStatus('delivered')}
              className={`filter-btn ${filterStatus === 'delivered' ? 'active' : ''}`}
            >
              Delivered
            </button>
          </div>
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading orders...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <h3>⚠️ Orders System Not Initialized</h3>
            <p className="error-message">{error}</p>
            <div className="setup-instructions">
              <h4>Database Setup Required:</h4>
              <p>The orders and order_items tables need to be created in your Supabase database.</p>
              <p><strong>Run this SQL migration:</strong></p>
              <code className="sql-path">database/migration-7.1-orders-schema.sql</code>
              <p>Copy the SQL from this file and run it in your Supabase SQL Editor.</p>
            </div>
            <button onClick={loadOrders} className="retry-btn">Retry After Setup</button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-state">
            <p>📦 No orders found</p>
            {searchTerm && <p>Try adjusting your search criteria</p>}
          </div>
        ) : (
          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="order-number">
                      <strong>{order.order_number}</strong>
                    </td>
                    <td>
                      <div className="customer-info">
                        <div className="customer-name">{order.customers?.name || 'N/A'}</div>
                        <div className="customer-email">{order.customers?.email || ''}</div>
                      </div>
                    </td>
                    <td>{formatDate(order.created_at)}</td>
                    <td className="text-center">{order.items?.length || 0}</td>
                    <td className="amount">{formatCurrency(order.total_amount)}</td>
                    <td>
                      <span
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(order.status) }}
                      >
                        {order.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`payment-badge ${order.payment_status === 'paid' ? 'paid' : 'pending'}`}
                      >
                        {order.payment_status}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => viewOrderDetails(order.id)}
                        className="action-btn view-btn"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Order Details Modal */}
        {showDetails && selectedOrder && (
          <div className="modal-overlay" onClick={() => setShowDetails(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Order Details - {selectedOrder.order_number}</h2>
                <button onClick={() => setShowDetails(false)} className="close-btn">×</button>
              </div>

              <div className="modal-body">
                {/* Customer Information */}
                <div className="detail-section">
                  <h3>Customer Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Name:</label>
                      <span>{selectedOrder.customers?.name || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Email:</label>
                      <span>{selectedOrder.customers?.email || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Phone:</label>
                      <span>{selectedOrder.customers?.phone || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="detail-section">
                  <h3>Order Items</h3>
                  <table className="items-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Brand</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item, index) => (
                        <tr key={index}>
                          <td>{item.product_name}</td>
                          <td>{item.product_brand || '-'}</td>
                          <td>{item.quantity}</td>
                          <td>{formatCurrency(item.unit_price)}</td>
                          <td>{formatCurrency(item.line_total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Order Summary */}
                <div className="detail-section">
                  <h3>Order Summary</h3>
                  <div className="summary-grid">
                    <div className="summary-row">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(selectedOrder.subtotal)}</span>
                    </div>
                    <div className="summary-row">
                      <span>Tax:</span>
                      <span>{formatCurrency(selectedOrder.tax_amount)}</span>
                    </div>
                    <div className="summary-row total">
                      <span>Total:</span>
                      <span>{formatCurrency(selectedOrder.total_amount)}</span>
                    </div>
                  </div>
                </div>

                {/* Status Update */}
                <div className="detail-section">
                  <h3>Update Order Status</h3>
                  <div className="status-buttons">
                    {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusUpdate(selectedOrder.id, status)}
                        className="status-update-btn"
                        style={{
                          backgroundColor: selectedOrder.status === status ? getStatusColor(status) : '#f0f0f0',
                          color: selectedOrder.status === status ? 'white' : '#333'
                        }}
                        disabled={selectedOrder.status === status}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Timeline */}
                {selectedOrder.confirmed_at || selectedOrder.shipped_at || selectedOrder.delivered_at || selectedOrder.cancelled_at ? (
                  <div className="detail-section">
                    <h3>Order Timeline</h3>
                    <div className="timeline">
                      <div className="timeline-item">
                        <span className="timeline-label">Created:</span>
                        <span>{formatDate(selectedOrder.created_at)}</span>
                      </div>
                      {selectedOrder.confirmed_at && (
                        <div className="timeline-item">
                          <span className="timeline-label">Confirmed:</span>
                          <span>{formatDate(selectedOrder.confirmed_at)}</span>
                        </div>
                      )}
                      {selectedOrder.shipped_at && (
                        <div className="timeline-item">
                          <span className="timeline-label">Shipped:</span>
                          <span>{formatDate(selectedOrder.shipped_at)}</span>
                        </div>
                      )}
                      {selectedOrder.delivered_at && (
                        <div className="timeline-item">
                          <span className="timeline-label">Delivered:</span>
                          <span>{formatDate(selectedOrder.delivered_at)}</span>
                        </div>
                      )}
                      {selectedOrder.cancelled_at && (
                        <div className="timeline-item cancelled">
                          <span className="timeline-label">Cancelled:</span>
                          <span>{formatDate(selectedOrder.cancelled_at)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}

                {/* Customer Notes */}
                {selectedOrder.customer_notes && (
                  <div className="detail-section">
                    <h3>Customer Notes</h3>
                    <p className="customer-notes">{selectedOrder.customer_notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .orders-container {
          padding: 0;
        }

        .orders-header {
          margin-bottom: 2rem;
        }

        .search-box {
          margin-bottom: 1.5rem;
        }

        .search-input {
          width: 100%;
          max-width: 600px;
          padding: 0.75rem 1rem;
          border: 2px solid var(--border-color);
          border-radius: 8px;
          font-size: 15px;
          transition: all 0.2s;
          background: var(--input-bg);
          color: var(--text-primary);
        }

        .search-input:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .filter-buttons {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .filter-btn {
          padding: 0.5rem 1rem;
          border: 2px solid var(--border-color);
          background: var(--card-bg);
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          color: var(--text-secondary);
        }

        .filter-btn:hover {
          border-color: var(--primary-color);
          background: var(--bg-secondary);
        }

        .filter-btn.active {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }

        .loading-state, .error-state, .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: var(--card-bg);
          border-radius: 8px;
          color: var(--text-primary);
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid var(--border-subtle);
          border-top: 4px solid var(--primary-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .orders-table-container {
          background: var(--card-bg);
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          border: 1px solid var(--border-subtle);
        }

        .orders-table {
          width: 100%;
          border-collapse: collapse;
        }

        .orders-table th {
          background: var(--bg-secondary);
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          font-size: 13px;
          text-transform: uppercase;
          color: var(--text-secondary);
          border-bottom: 2px solid var(--border-color);
        }

        .orders-table td {
          padding: 1rem;
          border-bottom: 1px solid var(--border-subtle);
          font-size: 14px;
          color: var(--text-primary);
        }

        .orders-table tbody tr:hover {
          background: var(--bg-hover);
        }

        .order-number {
          font-family: 'Courier New', monospace;
          color: var(--primary-color);
        }

        .customer-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .customer-name {
          font-weight: 500;
          color: var(--text-primary);
        }

        .customer-email {
          font-size: 12px;
          color: var(--text-tertiary);
        }

        .text-center {
          text-align: center;
        }

        .amount {
          font-weight: 600;
          color: var(--primary-color);
        }

        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 700;
          color: white;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .payment-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: capitalize;
        }

        .payment-badge.paid {
          background: rgba(76, 175, 80, 0.1);
          color: #4CAF50;
        }

        .payment-badge.pending {
          background: rgba(255, 152, 0, 0.1);
          color: #FF9800;
        }

        .action-btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .view-btn {
          background: var(--primary-color);
          color: white;
        }

        .view-btn:hover {
          background: var(--primary-dark);
          transform: translateY(-1px);
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 2rem;
        }

        .modal-content {
          background: var(--card-bg);
          border-radius: 12px;
          max-width: 900px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          color: var(--text-primary);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          border-bottom: 2px solid var(--border-color);
        }

        .modal-header h2 {
          margin: 0;
          color: var(--text-primary);
          font-size: 20px;
        }

        .close-btn {
          width: 36px;
          height: 36px;
          border: none;
          background: var(--bg-secondary);
          border-radius: 50%;
          font-size: 24px;
          cursor: pointer;
          transition: all 0.2s;
          color: var(--text-secondary);
        }

        .close-btn:hover {
          background: var(--bg-hover);
          transform: rotate(90deg);
        }

        .modal-body {
          padding: 2rem;
        }

        .detail-section {
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid var(--border-subtle);
        }

        .detail-section:last-child {
          border-bottom: none;
          margin-bottom: 0;
        }

        .detail-section h3 {
          margin: 0 0 1rem 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .detail-item label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
        }

        .detail-item span {
          font-size: 15px;
          color: var(--text-primary);
        }

        .items-table {
          width: 100%;
          border-collapse: collapse;
        }

        .items-table th {
          background: var(--bg-secondary);
          padding: 0.75rem;
          text-align: left;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          border-bottom: 2px solid var(--border-color);
        }

        .items-table td {
          padding: 0.75rem;
          border-bottom: 1px solid var(--border-subtle);
          font-size: 14px;
          color: var(--text-primary);
        }

        .summary-grid {
          background: var(--bg-secondary);
          padding: 1.5rem;
          border-radius: 8px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          font-size: 15px;
        }

        .summary-row.total {
          border-top: 2px solid #e0e0e0;
          margin-top: 0.5rem;
          padding-top: 1rem;
          font-weight: 700;
          font-size: 18px;
          color: #667eea;
        }

        .status-buttons {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .status-update-btn {
          padding: 0.75rem 1.5rem;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .status-update-btn:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .status-update-btn:disabled {
          cursor: not-allowed;
          opacity: 1;
        }

        .timeline {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .timeline-item {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem;
          background: #fafafa;
          border-radius: 6px;
          border-left: 4px solid #667eea;
        }

        .timeline-item.cancelled {
          border-left-color: #F44336;
        }

        .timeline-label {
          font-weight: 600;
          color: #666;
        }

        .customer-notes {
          background: #fafafa;
          padding: 1rem;
          border-radius: 6px;
          font-size: 14px;
          line-height: 1.6;
          color: #666;
          border-left: 4px solid #667eea;
        }

        .error-message {
          color: #666;
          margin: 1rem 0;
        }

        .setup-instructions {
          background: #FFF3E0;
          border-left: 4px solid #FF9800;
          padding: 1.5rem;
          border-radius: 6px;
          margin: 1.5rem 0;
          text-align: left;
        }

        .setup-instructions h4 {
          margin: 0 0 1rem 0;
          color: #F57C00;
        }

        .setup-instructions p {
          margin: 0.5rem 0;
          color: #666;
          line-height: 1.6;
        }

        .sql-path {
          display: inline-block;
          background: #2d2d2d;
          color: #f8f8f2;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          margin: 0.5rem 0;
          font-size: 13px;
        }

        .retry-btn {
          margin-top: 1rem;
          padding: 0.75rem 1.5rem;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
        }

        .retry-btn:hover {
          background: #5a67d8;
        }
      `}</style>
    </AdminLayout>
  );
}

export default AdminOrdersClient;


// Protect admin route - require authentication and admin role
