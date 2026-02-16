// =====================================================
// ORDER SUCCESS PAGE - DIGITAL RECEIPT
// Shows detailed order receipt after successful checkout
// =====================================================

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import FrontLayout from '../components/Layout/FrontLayout';
import Link from 'next/link';
import { FaPrint, FaShoppingBag, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

export default function OrderSuccessPage() {
  const router = useRouter();
  const { order } = router.query;
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (order) {
      fetchOrderDetails(order);
    } else if (router.isReady) {
      setLoading(false);
    }
  }, [order, router.isReady]);

  const fetchOrderDetails = async (orderNumber) => {
    try {
      const response = await fetch(`/api/orders?order_number=${orderNumber}`);
      const result = await response.json();

      if (result.success && result.orders && result.orders.length > 0) {
        setOrderData(result.orders[0]);
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!order && !loading) {
    return (
      <FrontLayout>
        <div className="success-page">
          <div className="success-container">
            <div className="error-content">
              <FaExclamationTriangle className="state-icon error" />
              <h1>Order Not Found</h1>
              <p>No order number provided.</p>
              <Link href="/immersiveexp" className="action-btn primary">
                Return to Shop
              </Link>
            </div>
          </div>
          <style jsx>{`
            .success-page {
              min-height: 80vh;
              padding: 60px 20px;
              background: var(--bg-tertiary);
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .error-content {
              text-align: center;
              background: var(--bg-primary);
              padding: 40px;
              border-radius: 16px;
              box-shadow: var(--shadow-md);
              border: 1px solid var(--border-primary);
            }
            .state-icon {
              font-size: 48px;
              margin-bottom: 20px;
            }
            .state-icon.error { color: var(--color-danger); }
            h1 { color: var(--text-primary); margin-bottom: 10px; }
            p { color: var(--text-secondary); margin-bottom: 20px; }
            .action-btn {
              display: inline-block;
              padding: 12px 24px;
              border-radius: 8px;
              font-weight: 600;
              text-decoration: none;
              cursor: pointer;
              transition: all 0.2s;
            }
            .action-btn.primary {
              background: var(--color-primary);
              color: white;
            }
            .action-btn.primary:hover {
              background: var(--color-primary-dark);
            }
          `}</style>
        </div>
      </FrontLayout>
    );
  }

  if (loading) {
    return (
      <FrontLayout>
        <div className="success-page">
          <div className="loading-content">
            <div className="spinner"></div>
            <p>Loading receipt...</p>
          </div>
          <style jsx>{`
            .success-page {
              min-height: 80vh;
              display: flex;
              align-items: center;
              justify-content: center;
              background: var(--bg-tertiary);
            }
            .loading-content {
              text-align: center;
              color: var(--text-secondary);
            }
            .spinner {
              width: 40px;
              height: 40px;
              border: 4px solid var(--border-primary);
              border-top: 4px solid var(--color-primary);
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin: 0 auto 16px;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </FrontLayout>
    );
  }

  return (
    <FrontLayout>
      <div className="success-page">
        <div className="receipt-container">
          <div className="success-banner no-print">
            <FaCheckCircle className="success-icon" />
            <h1>Order Confirmed!</h1>
            <p>Thank you for your purchase. A confirmation email has been sent.</p>
          </div>

          <div className="receipt-card">
            <div className="receipt-header">
              <h2>RECEIPT</h2>
              <div className="receipt-meta">
                <div className="meta-item">
                  <span className="label">Date:</span>
                  <span className="value">{new Date(orderData?.created_at).toLocaleDateString()}</span>
                </div>
                <div className="meta-item">
                  <span className="label">Order #:</span>
                  <span className="value">{orderData?.order_number}</span>
                </div>
              </div>
            </div>

            <div className="receipt-body">
              <div className="customer-section">
                <h3>Bill To:</h3>
                <p className="customer-name">{orderData?.customers?.name || 'Guest Customer'}</p>
                <p>{orderData?.customers?.email}</p>
                {orderData?.customers?.phone && <p>{orderData?.customers?.phone}</p>}
              </div>

              <div className="items-table">
                <div className="table-header">
                  <span className="col-item">Item</span>
                  <span className="col-qty">Qty</span>
                  <span className="col-price">Price</span>
                  <span className="col-total">Total</span>
                </div>
                {orderData?.items?.map((item, index) => (
                  <div key={index} className="table-row">
                    <span className="col-item">
                      <span className="item-name">{item.product_name}</span>
                      {item.product_brand && <span className="item-brand">{item.product_brand}</span>}
                    </span>
                    <span className="col-qty">{item.quantity}</span>
                    <span className="col-price">{orderData.currency} {item.unit_price}</span>
                    <span className="col-total">{orderData.currency} {item.line_total}</span>
                  </div>
                ))}
              </div>

              <div className="receipt-totals">
                <div className="total-row">
                  <span>Subtotal</span>
                  <span>{orderData?.currency} {orderData?.subtotal}</span>
                </div>
                {orderData?.tax_amount > 0 && (
                  <div className="total-row">
                    <span>Tax</span>
                    <span>{orderData?.currency} {orderData?.tax_amount}</span>
                  </div>
                )}
                <div className="total-row grand-total">
                  <span>Total</span>
                  <span>{orderData?.currency} {orderData?.total_amount}</span>
                </div>
              </div>

              <div className="payment-status">
                <span className="label">Payment Status:</span>
                <span className={`badge ${orderData?.payment_status}`}>
                  {orderData?.payment_status}
                </span>
              </div>
            </div>

            <div className="receipt-footer">
              <p>Thank you for shopping with us!</p>
              <p className="website">www.xrtechsolutions.com</p>
            </div>
          </div>

          <div className="actions no-print">
            <button onClick={handlePrint} className="action-btn secondary">
              <FaPrint /> Print Receipt
            </button>
            <Link href="/immersiveexp" className="action-btn primary">
              <FaShoppingBag /> Continue Shopping
            </Link>
          </div>
        </div>

        <style jsx>{`
          .success-page {
            min-height: 80vh;
            padding: 40px 20px;
            background: var(--bg-tertiary);
            position: relative;
            z-index: 1;
          }

          .receipt-container {
            max-width: 600px;
            margin: 0 auto;
          }

          .success-banner {
            text-align: center;
            margin-bottom: 30px;
          }

          .success-icon {
            font-size: 48px;
            color: var(--color-success);
            margin-bottom: 16px;
          }

          .success-banner h1 {
            font-size: 28px;
            color: var(--text-primary);
            margin-bottom: 8px;
          }

          .success-banner p {
            color: var(--text-secondary);
          }

          .receipt-card {
            background: #fff; /* Always white for receipt look */
            color: #1a1a1a;  /* Always dark text for receipt look */
            padding: 40px;
            border-radius: 2px;
            box-shadow: var(--shadow-lg);
            position: relative;
            margin-bottom: 30px;
            border-top: 5px solid var(--color-primary);
          }
          
          /* Dark mode specifics for receipt container if needed, 
             but receipts usually look best white. 
             If we want dark mode receipt:
          */
          :global([data-theme='dark']) .receipt-card {
            background: var(--bg-primary);
            color: var(--text-primary);
            border: 1px solid var(--border-primary);
            border-top: 5px solid var(--color-primary);
          }

          .receipt-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px dashed var(--border-primary);
            padding-bottom: 20px;
            margin-bottom: 20px;
          }

          .receipt-header h2 {
            font-size: 24px;
            font-weight: 800;
            letter-spacing: 2px;
            margin: 0;
            color: var(--text-primary);
          }

          .meta-item {
            display: flex;
            gap: 8px;
            font-size: 14px;
            flex-direction: column;
            text-align: right;
            margin-bottom: 4px;
          }
          
          .meta-item .label { color: var(--text-secondary); }
          .meta-item .value { font-weight: 600; color: var(--text-primary); }

          .customer-section {
            margin-bottom: 30px;
          }

          .customer-section h3 {
            font-size: 14px;
            text-transform: uppercase;
            color: var(--text-secondary);
            margin-bottom: 8px;
          }

          .customer-name {
            font-weight: 700;
            font-size: 16px;
            margin-bottom: 4px;
            color: var(--text-primary);
          }

          .items-table {
            margin-bottom: 30px;
          }

          .table-header {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr;
            padding-bottom: 8px;
            border-bottom: 1px solid var(--border-primary);
            font-weight: 600;
            font-size: 14px;
            color: var(--text-primary);
          }

          .table-row {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr;
            padding: 12px 0;
            border-bottom: 1px solid var(--border-primary);
            font-size: 14px;
            color: var(--text-primary);
          }

          .col-qty, .col-price, .col-total { text-align: right; }
          
          .item-name { display: block; font-weight: 500; }
          .item-brand { font-size: 12px; color: var(--text-secondary); }

          .receipt-totals {
            margin-left: auto;
            width: 50%;
            margin-bottom: 30px;
          }

          @media (max-width: 480px) {
            .receipt-totals { width: 100%; }
          }

          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            font-size: 14px;
            color: var(--text-primary);
          }

          .total-row.grand-total {
            font-size: 18px;
            font-weight: 700;
            border-top: 2px solid var(--border-primary);
            margin-top: 8px;
            padding-top: 12px;
          }

          .payment-status {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 2px dashed var(--border-primary);
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .badge {
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
          }
          
          .badge.pending { background: var(--warning-bg); color: var(--warning-text); }
          .badge.paid { background: var(--success-bg); color: var(--success-text); }

          .receipt-footer {
            text-align: center;
            margin-top: 40px;
            font-size: 14px;
            color: var(--text-secondary);
          }

          .actions {
            display: flex;
            justify-content: center;
            gap: 16px;
          }

          .action-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.2s;
            border: none;
            font-size: 16px;
          }

          .action-btn.primary {
            background: var(--color-primary);
            color: white;
          }
          
          .action-btn.primary:hover {
            background: var(--color-primary-dark);
            transform: translateY(-2px);
            box-shadow: var(--shadow-md);
          }

          .action-btn.secondary {
            background: var(--bg-secondary);
            color: var(--text-primary);
            border: 1px solid var(--border-primary);
          }

          .action-btn.secondary:hover {
            background: var(--bg-tertiary);
            transform: translateY(-2px);
          }

          @media print {
            .no-print, header, footer { display: none !important; }
            .success-page { padding: 0; background: white; }
            .receipt-card { box-shadow: none; margin: 0; border: none; border-top: 5px solid #000; }
            .receipt-container { max-width: 100%; width: 100%; }
          }
        `}</style>
      </div>
    </FrontLayout>
  );
}
