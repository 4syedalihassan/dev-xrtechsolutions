// =====================================================
// REVIEWS SECTION COMPONENT
// Remaining Feature: Reviews & Ratings System
// =====================================================

import { useState, useEffect } from 'react';

export default function ReviewsSection({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ average: 0, total: 0, distribution: {} });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    rating: 5,
    title: '',
    comment: ''
  });

  useEffect(() => {
    if (productId) {
      loadReviews();
    }
  }, [productId]);

  const loadReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?product_id=${productId}`);
      const data = await response.json();
      if (data.success) {
        setReviews(data.reviews);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          ...formData
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Thank you! Your review has been submitted for approval.');
        setShowForm(false);
        setFormData({
          customer_name: '',
          customer_email: '',
          rating: 5,
          title: '',
          comment: ''
        });
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating, interactive = false) => {
    return (
      <div className="stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? 'button' : undefined}
            onClick={interactive ? () => setFormData(prev => ({ ...prev, rating: star })) : undefined}
            className={`star ${star <= rating ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
            disabled={!interactive}
          >
            ★
          </button>
        ))}
        <style jsx>{`
          .stars {
            display: flex;
            gap: 4px;
          }
          .star {
            background: none;
            border: none;
            font-size: 24px;
            color: #ddd;
            padding: 0;
            cursor: ${interactive ? 'pointer' : 'default'};
          }
          .star.filled {
            color: #ffc107;
          }
          .star.interactive:hover {
            color: #ffc107;
          }
        `}</style>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="reviews-section loading">
        <div className="spinner"></div>
        <style jsx>{`
          .loading {
            text-align: center;
            padding: 40px;
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(255,255,255,0.1);
            border-top-color: #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="reviews-section">
      <h2>Customer Reviews</h2>

      {/* Stats Summary */}
      <div className="reviews-summary">
        <div className="average-rating">
          <span className="rating-number">{stats.average || 0}</span>
          {renderStars(Math.round(stats.average))}
          <span className="total-reviews">({stats.total} {stats.total === 1 ? 'review' : 'reviews'})</span>
        </div>

        {stats.total > 0 && (
          <div className="rating-distribution">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.distribution[rating] || 0;
              const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
              return (
                <div key={rating} className="distribution-row">
                  <span className="rating-label">{rating} ★</span>
                  <div className="bar-container">
                    <div className="bar" style={{ width: `${percentage}%` }}></div>
                  </div>
                  <span className="count">{count}</span>
                </div>
              );
            })}
          </div>
        )}

        <button
          onClick={() => setShowForm(!showForm)}
          className="write-review-btn"
        >
          {showForm ? 'Cancel' : '✏️ Write a Review'}
        </button>
      </div>

      {/* Review Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="review-form">
          <h3>Write Your Review</h3>

          <div className="form-group">
            <label>Your Rating *</label>
            {renderStars(formData.rating, true)}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="customer_name">Your Name *</label>
              <input
                type="text"
                id="customer_name"
                value={formData.customer_name}
                onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="customer_email">Email (optional)</label>
              <input
                type="email"
                id="customer_email"
                value={formData.customer_email}
                onChange={(e) => setFormData(prev => ({ ...prev, customer_email: e.target.value }))}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="title">Review Title</label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Summarize your experience"
            />
          </div>

          <div className="form-group">
            <label htmlFor="comment">Your Review</label>
            <textarea
              id="comment"
              value={formData.comment}
              onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
              rows="4"
              placeholder="Share your thoughts about this product..."
            />
          </div>

          <button type="submit" disabled={submitting} className="submit-btn">
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}

      {/* Reviews List */}
      <div className="reviews-list">
        {reviews.length === 0 ? (
          <div className="no-reviews">
            <p>No reviews yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          reviews.map((review, index) => (
            <div key={review.id || index} className="review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  <span className="reviewer-name">{review.customer_name}</span>
                  <span className="review-date">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                {renderStars(review.rating)}
              </div>
              {review.title && <h4 className="review-title">{review.title}</h4>}
              {review.comment && <p className="review-comment">{review.comment}</p>}
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .reviews-section {
          padding: 40px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        h2 {
          color: #ffffff;
          font-size: 24px;
          margin: 0 0 24px 0;
        }

        .reviews-summary {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 32px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .average-rating {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }

        .rating-number {
          font-size: 48px;
          font-weight: 700;
          color: #ffffff;
        }

        .total-reviews {
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
        }

        .rating-distribution {
          margin-bottom: 20px;
        }

        .distribution-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .rating-label {
          width: 40px;
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
        }

        .bar-container {
          flex: 1;
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
        }

        .bar {
          height: 100%;
          background: #ffc107;
          border-radius: 4px;
          transition: width 0.3s;
        }

        .count {
          width: 30px;
          text-align: right;
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
        }

        .write-review-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .write-review-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .review-form {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 32px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .review-form h3 {
          color: #ffffff;
          margin: 0 0 20px 0;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        @media (max-width: 640px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }

        .form-group {
          margin-bottom: 16px;
        }

        label {
          display: block;
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
          margin-bottom: 8px;
        }

        input,
        textarea {
          width: 100%;
          padding: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: #ffffff;
          font-size: 16px;
        }

        input:focus,
        textarea:focus {
          outline: none;
          border-color: #667eea;
        }

        .submit-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 14px 32px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .reviews-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .no-reviews {
          text-align: center;
          padding: 40px;
          color: rgba(255, 255, 255, 0.6);
        }

        .review-card {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .reviewer-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .reviewer-name {
          color: #ffffff;
          font-weight: 600;
        }

        .review-date {
          color: rgba(255, 255, 255, 0.5);
          font-size: 13px;
        }

        .review-title {
          color: #ffffff;
          font-size: 16px;
          margin: 0 0 8px 0;
        }

        .review-comment {
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.6;
          margin: 0;
        }
      `}</style>
    </div>
  );
}
