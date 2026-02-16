// =====================================================
// ORDER TRACKING PAGE
// Remaining Feature: Delivery & Order Tracking System
// =====================================================

import { useState } from 'react';
import { useRouter } from 'next/router';
import FrontLayout from '../components/Layout/FrontLayout';

export default function TrackOrderPage() {
  const router = useRouter();
  const { order } = router.query;

  const [orderNumber, setOrderNumber] = useState(order || '');
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTrack = async (e) => {
    e?.preventDefault();

    // Input validation
    const trimmedOrderNumber = orderNumber.trim();
    if (!trimmedOrderNumber) {
      setError('Please enter an order number');
      return;
    }

    // Validate order number format and length
    if (trimmedOrderNumber.length < 3 || trimmedOrderNumber.length > 50) {
      setError('Invalid order number format');
      return;
    }

    // Allow only alphanumeric characters, dashes, and underscores
    if (!/^[a-zA-Z0-9\-_]+$/.test(trimmedOrderNumber)) {
      setError('Order number contains invalid characters');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/orders/track?order_number=${encodeURIComponent(trimmedOrderNumber)}`);
      const data = await response.json();

      if (data.success) {
        setTracking(data.tracking);
      } else {
        setError(data.error || 'Order not found');
        setTracking(null);
      }
    } catch (err) {
      setError('Failed to fetch tracking information');
      setTracking(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#FF9800',
      confirmed: '#2196F3',
      processing: '#9C27B0',
      shipped: '#00BCD4',
      'out_for_delivery': '#4CAF50',
      delivered: '#4CAF50',
      cancelled: '#F44336'
    };
    return colors[status] || '#999';
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

  return (
    <FrontLayout>
      <div className="track-page">
        <div className="track-container">
          <div className="page-header">
            <h1>Track Your Order</h1>
            <p>Enter your order number to see the delivery status</p>
          </div>

          <form onSubmit={handleTrack} className="track-form">
            <div className="input-group">
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="Enter order number (e.g., ORD-12345)"
                className="order-input"
              />
              <button type="submit" disabled={loading} className="track-btn">
                {loading ? 'Tracking...' : 'Track Order'}
              </button>
            </div>
            {error && <p className="error-message">{error}</p>}
          </form>

          {tracking && (
            <div className="tracking-result">
              <div className="tracking-header">
                <div className="order-info">
                  <h2>{tracking.order_number}</h2>
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(tracking.status) }}
                  >
                    {tracking.status}
                  </span>
                </div>

                {tracking.tracking_number && (
                  <div className="tracking-number">
                    <span className="label">Tracking Number:</span>
                    <span className="value">{tracking.tracking_number}</span>
                  </div>
                )}

                {tracking.carrier && (
                  <div className="carrier">
                    <span className="label">Carrier:</span>
                    <span className="value">{tracking.carrier}</span>
                  </div>
                )}

                {tracking.estimated_delivery && (
                  <div className="estimated-delivery">
                    <span className="label">Estimated Delivery:</span>
                    <span className="value">{formatDate(tracking.estimated_delivery)}</span>
                  </div>
                )}

                {tracking.current_location && (
                  <div className="current-location">
                    <span className="label">📍 Current Location:</span>
                    <span className="value">{tracking.current_location}</span>
                  </div>
                )}
              </div>

              <div className="timeline-section">
                <h3>Delivery Progress</h3>
                <div className="timeline">
                  {tracking.timeline?.map((step, index) => (
                    <div
                      key={index}
                      className={`timeline-step ${step.completed ? 'completed' : ''}`}
                    >
                      <div className="step-indicator">
                        <div className="step-dot">
                          {step.completed ? '✓' : (index + 1)}
                        </div>
                        {index < tracking.timeline.length - 1 && (
                          <div className="step-line"></div>
                        )}
                      </div>
                      <div className="step-content">
                        <h4>{step.status}</h4>
                        <p>{step.description}</p>
                        {step.timestamp && (
                          <span className="step-time">{formatDate(step.timestamp)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <style jsx>{`
          .track-page {
            min-height: 80vh;
            padding: 40px 20px;
            position: relative;
            z-index: 1;
          }

          .track-container {
            max-width: 800px;
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
            color: var(--text-secondary);
            font-size: 16px;
          }

          .track-form {
            background: var(--bg-secondary);
            border-radius: 16px;
            padding: 32px;
            border: 1px solid var(--border-primary);
            margin-bottom: 32px;
          }

          .input-group {
            display: flex;
            gap: 16px;
          }

          @media (max-width: 640px) {
            .input-group {
              flex-direction: column;
            }
          }

          .order-input {
            flex: 1;
            padding: 16px 20px;
            background: var(--bg-primary);
            border: 1px solid var(--border-primary);
            border-radius: 8px;
            font-size: 16px;
            color: var(--text-primary);
          }

          .order-input:focus {
            outline: none;
            border-color: var(--color-primary);
          }

          .order-input::placeholder {
            color: var(--text-tertiary);
          }

          .track-btn {
            padding: 16px 32px;
            background: var(--color-primary);
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            white-space: nowrap;
          }

          .track-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: var(--shadow-md);
            background: var(--color-primary-dark);
          }

          .step-dot {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: var(--bg-tertiary);
            border: 2px solid var(--border-primary);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-tertiary);
            font-weight: 600;
            font-size: 14px;
          }

          .timeline-step.completed .step-dot {
            background: var(--color-primary);
            border-color: var(--color-primary);
            color: white;
          }

          .step-line {
            width: 2px;
            flex: 1;
            background: var(--border-primary);
            margin: 8px 0;
            min-height: 40px;
          }

          .timeline-step.completed .step-line {
            background: var(--color-primary);
          }

          .step-content {
            flex: 1;
            padding-top: 4px;
          }

          .step-content h4 {
            color: var(--text-tertiary);
            font-size: 16px;
            margin: 0 0 4px 0;
          }

          .timeline-step.completed .step-content h4 {
            color: var(--text-primary);
          }

          .step-content p {
            color: var(--text-secondary);
            font-size: 14px;
            margin: 0 0 8px 0;
          }

          .step-time {
            color: var(--text-tertiary);
            font-size: 13px;
          }
        `}</style>
      </div>
    </FrontLayout>
  );
}

export async function getServerSideProps() {
  return { props: {} };
}
