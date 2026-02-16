// =====================================================
// ADMIN ANALYTICS DASHBOARD
// Visual analytics dashboard for admin portal
// =====================================================

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/Admin/AdminLayout';
import { useAuth } from '../../contexts/AuthContext';

function AdminAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');
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
      loadAnalytics();
    }
  }, [dateRange, user]);

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
          <p style={{ color: '#666' }}>Loading...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch analytics from database
      const response = await fetch(`/api/admin/analytics?range=${dateRange}`);
      const data = await response.json();
      
      if (data.success && data.analytics) {
        setAnalytics(data.analytics);
      } else {
        console.error('Failed to load analytics:', data.error);
        // Set empty analytics structure
        setAnalytics({
          overview: { totalRevenue: 0, totalOrders: 0, totalCustomers: 0, avgOrderValue: 0, revenueGrowth: 0, ordersGrowth: 0, customersGrowth: 0 },
          salesByDay: [],
          topProducts: [],
          orderStatus: { pending: 0, confirmed: 0, processing: 0, shipped: 0, delivered: 0 },
          recentOrders: [],
          customerStats: { newCustomers: 0, returningCustomers: 0, averageLifetimeValue: 0 },
          reviews: { total: 0, averageRating: 0, pending: 0 }
        });
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `PKR ${parseFloat(amount).toLocaleString()}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#FF9800',
      confirmed: '#2196F3',
      processing: '#9C27B0',
      shipped: '#667eea',
      delivered: '#4CAF50'
    };
    return colors[status] || '#999';
  };

  const maxRevenue = analytics?.salesByDay?.length > 0
    ? Math.max(...analytics.salesByDay.map(d => d.revenue)) 
    : 1; // Default to 1 to avoid division by zero

  return (
    <AdminLayout currentPage="Analytics Dashboard">
      <div className="analytics-container">
        {/* Date Range Selector */}
        <div className="header-actions">
          <h2>Analytics Overview</h2>
          <div className="date-range-selector">
            <button 
              className={dateRange === '7d' ? 'active' : ''}
              onClick={() => setDateRange('7d')}
            >
              Last 7 Days
            </button>
            <button 
              className={dateRange === '30d' ? 'active' : ''}
              onClick={() => setDateRange('30d')}
            >
              Last 30 Days
            </button>
            <button 
              className={dateRange === '90d' ? 'active' : ''}
              onClick={() => setDateRange('90d')}
            >
              Last 90 Days
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading analytics...</p>
          </div>
        ) : analytics ? (
          <>
            {/* Overview Stats */}
            <div className="stats-grid">
              <div className="stat-card revenue">
                <div className="stat-icon">💰</div>
                <div className="stat-content">
                  <div className="stat-value">{formatCurrency(analytics.overview.totalRevenue)}</div>
                  <div className="stat-label">Total Revenue</div>
                  <div className="stat-growth positive">
                    +{analytics.overview.revenueGrowth}%
                  </div>
                </div>
              </div>
              <div className="stat-card orders">
                <div className="stat-icon">📦</div>
                <div className="stat-content">
                  <div className="stat-value">{analytics.overview.totalOrders}</div>
                  <div className="stat-label">Total Orders</div>
                  <div className="stat-growth positive">
                    +{analytics.overview.ordersGrowth}%
                  </div>
                </div>
              </div>
              <div className="stat-card customers">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <div className="stat-value">{analytics.overview.totalCustomers}</div>
                  <div className="stat-label">Customers</div>
                  <div className="stat-growth positive">
                    +{analytics.overview.customersGrowth}%
                  </div>
                </div>
              </div>
              <div className="stat-card avg-order">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <div className="stat-value">{formatCurrency(analytics.overview.avgOrderValue)}</div>
                  <div className="stat-label">Avg Order Value</div>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="charts-row">
              {/* Sales Chart */}
              <div className="chart-card sales-chart">
                <h3>📈 Sales Overview</h3>
                <div className="bar-chart">
                  {analytics.salesByDay.map((day, index) => (
                    <div key={index} className="bar-column">
                      <div 
                        className="bar" 
                        style={{ height: `${(day.revenue / maxRevenue) * 100}%` }}
                        title={`${formatCurrency(day.revenue)}`}
                      >
                        <span className="bar-value">{formatCurrency(day.revenue)}</span>
                      </div>
                      <span className="bar-label">{day.date}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Status Distribution */}
              <div className="chart-card order-status">
                <h3>📋 Order Status</h3>
                <div className="status-distribution">
                  {Object.entries(analytics.orderStatus).map(([status, count]) => (
                    <div key={status} className="status-item">
                      <div className="status-header">
                        <span 
                          className="status-dot" 
                          style={{ backgroundColor: getStatusColor(status) }}
                        ></span>
                        <span className="status-name">{status}</span>
                        <span className="status-count">{count}</span>
                      </div>
                      <div className="status-bar-bg">
                        <div 
                          className="status-bar-fill"
                          style={{ 
                            width: `${(count / Object.values(analytics.orderStatus).reduce((a, b) => a + b, 0)) * 100}%`,
                            backgroundColor: getStatusColor(status)
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Products and Orders Row */}
            <div className="data-row">
              {/* Top Products */}
              <div className="data-card">
                <h3>🏆 Top Products</h3>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Sales</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.topProducts.map((product, index) => (
                      <tr key={index}>
                        <td>
                          <span className="rank">#{index + 1}</span>
                          {product.name}
                        </td>
                        <td>{product.sales}</td>
                        <td className="revenue">{formatCurrency(product.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Recent Orders */}
              <div className="data-card">
                <h3>🕒 Recent Orders</h3>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.recentOrders.map((order, index) => (
                      <tr key={index}>
                        <td className="order-id">{order.id}</td>
                        <td>{order.customer}</td>
                        <td className="revenue">{formatCurrency(order.amount)}</td>
                        <td>
                          <span 
                            className="status-badge"
                            style={{ backgroundColor: getStatusColor(order.status) }}
                          >
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Stats Row */}
            <div className="bottom-stats">
              <div className="mini-stat-card">
                <h4>👤 New Customers</h4>
                <div className="mini-stat-value">{analytics.customerStats.newCustomers}</div>
                <p>This period</p>
              </div>
              <div className="mini-stat-card">
                <h4>🔄 Returning</h4>
                <div className="mini-stat-value">{analytics.customerStats.returningCustomers}</div>
                <p>Repeat customers</p>
              </div>
              <div className="mini-stat-card">
                <h4>⭐ Reviews</h4>
                <div className="mini-stat-value">{analytics.reviews.averageRating}</div>
                <p>Average rating ({analytics.reviews.total} total)</p>
              </div>
              <div className="mini-stat-card">
                <h4>⏳ Pending Reviews</h4>
                <div className="mini-stat-value">{analytics.reviews.pending}</div>
                <p>Awaiting approval</p>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <p>📊 No analytics data available</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .analytics-container {
          padding: 0;
        }

        .header-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .header-actions h2 {
          margin: 0;
          color: var(--color-text-primary, #333);
          font-size: 24px;
        }

        .date-range-selector {
          display: flex;
          gap: 0.5rem;
          background: white;
          padding: 0.25rem;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .date-range-selector button {
          padding: 0.5rem 1rem;
          border: none;
          background: transparent;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          color: var(--color-text-secondary, #666);
        }

        .date-range-selector button.active {
          background: #667eea;
          color: white;
        }

        .loading-state, .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: white;
          border-radius: 8px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f0f0f0;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          transition: transform 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-2px);
        }

        .stat-card.revenue { border-left: 4px solid #4CAF50; }
        .stat-card.orders { border-left: 4px solid #2196F3; }
        .stat-card.customers { border-left: 4px solid #9C27B0; }
        .stat-card.avg-order { border-left: 4px solid #FF9800; }

        .stat-icon {
          font-size: 32px;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f5f7fa;
          border-radius: 12px;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: var(--color-text-primary, #333);
        }

        .stat-label {
          font-size: 14px;
          color: var(--color-text-secondary, #666);
        }

        .stat-growth {
          font-size: 13px;
          font-weight: 600;
          margin-top: 0.25rem;
        }

        .stat-growth.positive {
          color: #4CAF50;
        }

        .charts-row {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        @media (max-width: 1024px) {
          .charts-row {
            grid-template-columns: 1fr;
          }
        }

        .chart-card {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }

        .chart-card h3 {
          margin: 0 0 1.5rem 0;
          font-size: 18px;
          color: var(--color-text-primary, #333);
        }

        .bar-chart {
          display: flex;
          align-items: flex-end;
          gap: 1rem;
          height: 200px;
          padding-top: 30px;
        }

        .bar-column {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
        }

        .bar {
          width: 100%;
          max-width: 60px;
          background: linear-gradient(180deg, #667eea 0%, #5a67d8 100%);
          border-radius: 8px 8px 0 0;
          position: relative;
          transition: all 0.3s;
          min-height: 10px;
        }

        .bar:hover {
          opacity: 0.8;
        }

        .bar-value {
          position: absolute;
          top: -25px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 10px;
          font-weight: 600;
          color: #667eea;
          white-space: nowrap;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .bar:hover .bar-value {
          opacity: 1;
        }

        .bar-label {
          margin-top: 0.5rem;
          font-size: 12px;
          color: var(--color-text-secondary, #666);
        }

        .status-distribution {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .status-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .status-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .status-name {
          flex: 1;
          font-size: 14px;
          color: var(--color-text-primary, #333);
          text-transform: capitalize;
        }

        .status-count {
          font-weight: 600;
          color: #667eea;
        }

        .status-bar-bg {
          height: 8px;
          background: #f0f0f0;
          border-radius: 4px;
          overflow: hidden;
        }

        .status-bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s;
        }

        .data-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .data-card {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }

        .data-card h3 {
          margin: 0 0 1rem 0;
          font-size: 18px;
          color: var(--color-text-primary, #333);
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table th {
          text-align: left;
          padding: 0.75rem;
          font-size: 12px;
          font-weight: 600;
          color: var(--color-text-tertiary, #999);
          text-transform: uppercase;
          border-bottom: 2px solid var(--color-border-light, #f0f0f0);
        }

        .data-table td {
          padding: 0.75rem;
          font-size: 14px;
          color: var(--color-text-secondary, #666);
          border-bottom: 1px solid var(--color-border-light, #f0f0f0);
        }

        .data-table .rank {
          display: inline-block;
          width: 24px;
          height: 24px;
          background: #667eea;
          color: white;
          border-radius: 50%;
          text-align: center;
          line-height: 24px;
          font-size: 12px;
          font-weight: 600;
          margin-right: 0.5rem;
        }

        .data-table .order-id {
          font-family: 'Courier New', monospace;
          color: #667eea;
          font-weight: 600;
        }

        .data-table .revenue {
          font-weight: 600;
          color: #4CAF50;
        }

        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          color: white;
          text-transform: capitalize;
        }

        .bottom-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
        }

        .mini-stat-card {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          text-align: center;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }

        .mini-stat-card h4 {
          margin: 0 0 0.5rem 0;
          font-size: 14px;
          color: var(--color-text-secondary, #666);
        }

        .mini-stat-value {
          font-size: 36px;
          font-weight: 700;
          color: #667eea;
        }

        .mini-stat-card p {
          margin: 0.5rem 0 0 0;
          font-size: 13px;
          color: var(--color-text-tertiary, #999);
        }
      `}</style>
    </AdminLayout>
  );
}

export default AdminAnalyticsDashboard;
