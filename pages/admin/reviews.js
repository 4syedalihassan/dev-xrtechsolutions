// =====================================================
// ADMIN REVIEWS MANAGEMENT PAGE
// Manages product reviews and ratings
// =====================================================

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/Admin/AdminLayout';
import { useAuth } from '../../contexts/AuthContext';

function AdminReviewsClient() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
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
      loadReviews();
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

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all reviews from database (admin endpoint)
      const response = await fetch('/api/admin/reviews');
      const data = await response.json();

      if (data.success) {
        setReviews(data.reviews || []);
        if (data.message) {
          console.info(data.message);
        }
      } else {
        setError(data.error || 'Failed to load reviews');
        setReviews([]);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
      setError('Failed to connect to the server. Please try again.');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (reviewId, newStatus) => {
    try {
      await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      // Update locally even if API fails
      setReviews(prev => prev.map(r =>
        r.id === reviewId ? { ...r, status: newStatus } : r
      ));

      if (selectedReview?.id === reviewId) {
        setSelectedReview(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error('Error updating review:', err);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE'
      });

      setReviews(prev => prev.filter(r => r.id !== reviewId));
      if (selectedReview?.id === reviewId) {
        setShowDetails(false);
        setSelectedReview(null);
      }
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#FF9800',
      approved: '#4CAF50',
      rejected: '#F44336'
    };
    return colors[status] || '#999';
  };

  const getRatingStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredReviews = reviews.filter(review => {
    const matchesStatus = filterStatus === 'all' || review.status === filterStatus;
    const matchesSearch = !searchTerm ||
      review.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.title?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: reviews.length,
    pending: reviews.filter(r => r.status === 'pending').length,
    approved: reviews.filter(r => r.status === 'approved').length,
    avgRating: reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0
  };

  return (
    <AdminLayout currentPage="Reviews Management">
      <div className="reviews-container">
        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon total">📝</div>
            <div className="stat-content">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Reviews</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon pending">⏳</div>
            <div className="stat-content">
              <div className="stat-value">{stats.pending}</div>
              <div className="stat-label">Pending Approval</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon approved">✓</div>
            <div className="stat-content">
              <div className="stat-value">{stats.approved}</div>
              <div className="stat-label">Approved</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon rating">⭐</div>
            <div className="stat-content">
              <div className="stat-value">{stats.avgRating}</div>
              <div className="stat-label">Average Rating</div>
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="reviews-header">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search reviews by product, customer, or title..."
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
              All
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
            >
              Pending ({stats.pending})
            </button>
            <button
              onClick={() => setFilterStatus('approved')}
              className={`filter-btn ${filterStatus === 'approved' ? 'active' : ''}`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilterStatus('rejected')}
              className={`filter-btn ${filterStatus === 'rejected' ? 'active' : ''}`}
            >
              Rejected
            </button>
          </div>
        </div>

        {/* Reviews Table */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading reviews...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>❌ {error}</p>
            <button onClick={loadReviews} className="retry-btn">Retry</button>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="empty-state">
            <p>📝 No reviews found</p>
            {searchTerm && <p>Try adjusting your search criteria</p>}
          </div>
        ) : (
          <div className="reviews-table-container">
            <table className="reviews-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Customer</th>
                  <th>Rating</th>
                  <th>Review</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.map((review) => (
                  <tr key={review.id}>
                    <td className="product-name">{review.product_name}</td>
                    <td>
                      <div className="customer-info">
                        <div className="customer-name">{review.customer_name}</div>
                        <div className="customer-email">{review.customer_email}</div>
                      </div>
                    </td>
                    <td>
                      <span className="rating-stars">{getRatingStars(review.rating)}</span>
                    </td>
                    <td>
                      <div className="review-preview">
                        <strong>{review.title}</strong>
                        <p>{review.comment?.substring(0, 60)}...</p>
                      </div>
                    </td>
                    <td>{formatDate(review.created_at)}</td>
                    <td>
                      <span
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(review.status) }}
                      >
                        {review.status?.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => { setSelectedReview(review); setShowDetails(true); }}
                          className="action-btn view-btn"
                          title="View Details"
                        >
                          👁️
                        </button>
                        {review.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(review.id, 'approved')}
                              className="action-btn approve-btn"
                              title="Approve"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(review.id, 'rejected')}
                              className="action-btn reject-btn"
                              title="Reject"
                            >
                              ✕
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(review.id)}
                          className="action-btn delete-btn"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Review Details Modal */}
        {showDetails && selectedReview && (
          <div className="modal-overlay" onClick={() => setShowDetails(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Review Details</h2>
                <button onClick={() => setShowDetails(false)} className="close-btn">×</button>
              </div>

              <div className="modal-body">
                <div className="detail-section">
                  <h3>Product</h3>
                  <p className="product-title">{selectedReview.product_name}</p>
                </div>

                <div className="detail-section">
                  <h3>Customer</h3>
                  <p>{selectedReview.customer_name} ({selectedReview.customer_email})</p>
                </div>

                <div className="detail-section">
                  <h3>Rating</h3>
                  <div className="rating-display">
                    <span className="rating-stars large">{getRatingStars(selectedReview.rating)}</span>
                    <span className="rating-number">{selectedReview.rating}/5</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Review</h3>
                  <div className="review-content">
                    <h4>{selectedReview.title}</h4>
                    <p>{selectedReview.comment}</p>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Status</h3>
                  <div className="status-actions">
                    {['pending', 'approved', 'rejected'].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusUpdate(selectedReview.id, status)}
                        className="status-update-btn"
                        style={{
                          backgroundColor: selectedReview.status === status ? getStatusColor(status) : '#f0f0f0',
                          color: selectedReview.status === status ? 'white' : '#333'
                        }}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Info</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Submitted:</label>
                      <span>{formatDate(selectedReview.created_at)}</span>
                    </div>
                    <div className="info-item">
                      <label>Helpful Votes:</label>
                      <span>{selectedReview.helpful_count || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .reviews-container {
          padding: 0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .stat-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .stat-icon.total { background: #E3F2FD; }
        .stat-icon.pending { background: #FFF3E0; }
        .stat-icon.approved { background: #E8F5E9; }
        .stat-icon.rating { background: #FFFDE7; }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: var(--color-text-primary, #333);
        }

        .stat-label {
          font-size: 14px;
          color: var(--color-text-secondary, #666);
        }

        .reviews-header {
          margin-bottom: 2rem;
        }

        .search-box {
          margin-bottom: 1.5rem;
        }

        .search-input {
          width: 100%;
          max-width: 600px;
          padding: 0.75rem 1rem;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 15px;
          transition: all 0.2s;
        }

        .search-input:focus {
          outline: none;
          border-color: #667eea;
        }

        .filter-buttons {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .filter-btn {
          padding: 0.5rem 1rem;
          border: 2px solid #e0e0e0;
          background: white;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-btn:hover {
          border-color: #667eea;
          background: #EEF2FF;
        }

        .filter-btn.active {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }

        .loading-state, .empty-state, .error-state {
          text-align: center;
          padding: 4rem 2rem;
          background: white;
          border-radius: 8px;
        }

        .error-state {
          color: #f44336;
        }

        .retry-btn {
          margin-top: 1rem;
          padding: 0.5rem 1rem;
          background: var(--color-primary, #667eea);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .retry-btn:hover {
          opacity: 0.9;
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

        .reviews-table-container {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .reviews-table {
          width: 100%;
          border-collapse: collapse;
        }

        .reviews-table th {
          background: var(--color-bg-secondary, #fafafa);
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          font-size: 13px;
          text-transform: uppercase;
          color: var(--color-text-secondary, #666);
          border-bottom: 2px solid var(--color-border-light, #e0e0e0);
        }

        .reviews-table td {
          padding: 1rem;
          border-bottom: 1px solid var(--color-border-light, #f0f0f0);
          font-size: 14px;
          color: var(--color-text-secondary, #666);
        }

        .reviews-table tbody tr:hover {
          background: #fafafa;
        }

        .product-name {
          font-weight: 600;
          color: #667eea;
        }

        .customer-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .customer-name {
          font-weight: 500;
          color: var(--color-text-primary, #333);
        }

        .customer-email {
          font-size: 12px;
          color: var(--color-text-tertiary, #999);
        }

        .rating-stars {
          color: #FFC107;
          font-size: 16px;
        }

        .rating-stars.large {
          font-size: 24px;
        }

        .review-preview {
          max-width: 250px;
        }

        .review-preview strong {
          display: block;
          margin-bottom: 0.25rem;
          color: var(--color-text-primary, #333);
        }

        .review-preview p {
          margin: 0;
          color: var(--color-text-secondary, #666);
          font-size: 13px;
        }

        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 700;
          color: white;
          text-transform: uppercase;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .view-btn { background: #E3F2FD; }
        .view-btn:hover { background: #BBDEFB; }

        .approve-btn { background: #E8F5E9; }
        .approve-btn:hover { background: #C8E6C9; }

        .reject-btn { background: #FFEBEE; }
        .reject-btn:hover { background: #FFCDD2; }

        .delete-btn { background: #FFEBEE; }
        .delete-btn:hover { background: #FFCDD2; }

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
          background: white;
          border-radius: 12px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          border-bottom: 2px solid var(--color-border-light, #f0f0f0);
        }

        .modal-header h2 {
          margin: 0;
          color: var(--color-text-primary, #333);
        }

        .close-btn {
          width: 36px;
          height: 36px;
          border: none;
          background: var(--color-bg-secondary, #f0f0f0);
          border-radius: 50%;
          font-size: 24px;
          cursor: pointer;
          color: var(--color-text-secondary, #666);
        }

        .modal-body {
          padding: 2rem;
        }

        .detail-section {
          margin-bottom: 1.5rem;
        }

        .detail-section h3 {
          margin: 0 0 0.5rem 0;
          font-size: 14px;
          font-weight: 600;
          color: var(--color-text-tertiary, #999);
          text-transform: uppercase;
        }

        .product-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--color-primary, #667eea);
          margin: 0;
        }

        .rating-display {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .rating-number {
          font-size: 18px;
          font-weight: 600;
          color: var(--color-text-primary, #333);
        }

        .review-content {
          background: var(--color-bg-secondary, #fafafa);
          padding: 1rem;
          border-radius: 8px;
          border-left: 4px solid var(--color-primary, #667eea);
        }

        .review-content h4 {
          margin: 0 0 0.5rem 0;
          color: var(--color-text-primary, #333);
        }

        .review-content p {
          margin: 0;
          color: var(--color-text-secondary, #666);
          line-height: 1.6;
        }

        .status-actions {
          display: flex;
          gap: 0.5rem;
        }

        .status-update-btn {
          padding: 0.5rem 1.5rem;
          border: 2px solid var(--color-border-light, #e0e0e0);
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .info-item label {
          font-size: 12px;
          color: var(--color-text-tertiary, #999);
        }

        .info-item span {
          font-weight: 500;
          color: var(--color-text-primary, #333);
        }
      `}</style>
    </AdminLayout>
  );
}

export default AdminReviewsClient;
