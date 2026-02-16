// =====================================================
// CHECKOUT PAGE
// Customer information form and order placement
// =====================================================

import { useState } from 'react';
import { useRouter } from 'next/router';
import { useCart } from '../contexts/CartContext';
import FrontLayout from '../components/Layout/FrontLayout';
import Link from 'next/link';
import { SORTED_PAKISTAN_CITIES } from '../lib/pakistanCities';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, getCartTotals, clearCart, validateCartStock } = useCart();
  const totals = getCartTotals();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Pakistan',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect to cart if empty
  if (cart.length === 0) {
    if (typeof window !== 'undefined') {
      router.push('/cart');
    }
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Format postal code to only allow 5 digits
    if (name === 'postalCode') {
      processedValue = value.replace(/\D/g, '').slice(0, 5);
    }

    // Format phone to only allow digits, +, -, (), and spaces
    if (name === 'phone') {
      processedValue = value.replace(/[^0-9+\-\s()]/g, '');
    }

    setFormData(prev => ({ ...prev, [name]: processedValue }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validations
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format (e.g., name@example.com)';
    }

    // Phone validation - Pakistan format
    // Pakistan mobile: 10 digits with country code (e.g., +92 300 1234567)
    // Pakistan landline: can be up to 13 digits with area codes
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      const phoneDigits = formData.phone.replace(/[\s\-+()]/g, '');
      if (!/^[0-9]{10,13}$/.test(phoneDigits)) {
        newErrors.phone = 'Phone number must be 10-13 digits (Pakistan format)';
      }
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    } else if (formData.address.trim().length < 10) {
      newErrors.address = 'Please provide a complete address';
    }

    // City validation
    if (!formData.city.trim()) {
      newErrors.city = 'Please select a city';
    }

    // Postal code validation - Pakistan format (5 digits)
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
    } else if (!/^[0-9]{5}$/.test(formData.postalCode.trim())) {
      newErrors.postalCode = 'Postal code must be 5 digits (e.g., 54000)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Validate cart items before submitting
      console.log('🛒 [Checkout] Cart items:', cart);

      const invalidItems = cart.filter(item => !item.product_id || !item.quantity || item.quantity <= 0);
      if (invalidItems.length > 0) {
        console.error('❌ [Checkout] Invalid cart items found:', invalidItems);
        alert('Your cart contains invalid items. Please refresh the page and try again.');
        setIsSubmitting(false);
        return;
      }

      // Validate stock availability before submitting order
      console.log('🔍 [Checkout] Validating stock availability...');
      const stockCheckResponse = await fetch('/api/products/check-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity
          }))
        })
      });

      if (!stockCheckResponse.ok) {
        throw new Error('Failed to validate stock availability');
      }

      const { available, items: stockResults } = await stockCheckResponse.json();

      if (!available) {
        const outOfStockItems = stockResults.filter(item => !item.available);
        const errorMessage = outOfStockItems.map(item =>
          `${item.product_name}: ${item.error}`
        ).join('\n');

        alert(`Stock levels have changed:\n\n${errorMessage}\n\nPlease review your cart and try again.`);
        setIsSubmitting(false);
        return;
      }

      console.log('✅ [Checkout] Stock validation passed');

      const items = cart.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
      }));

      console.log('📦 [Checkout] Mapped items for API:', items);

      const orderData = {
        customer: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
        },
        shipping: {
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
        },
        items: items,
        customer_notes: formData.notes,
      };

      console.log('🚀 [Checkout] Submitting order:', {
        customer: orderData.customer.email,
        itemCount: items.length,
        items: items
      });

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      console.log('📥 [Checkout] API response:', {
        success: result.success,
        order_number: result.order_number,
        error: result.error
      });

      if (!response.ok) {
        console.error('❌ [Checkout] Order failed:', result);
        throw new Error(result.error || 'Failed to create order');
      }

      // Clear cart and redirect to success page
      console.log('✅ [Checkout] Order successful, clearing cart and redirecting');
      clearCart();
      router.push(`/order-success?order=${result.order_number}`);
    } catch (error) {
      console.error('💥 [Checkout] Exception:', error);
      alert(`Failed to place order: ${error.message}\n\nPlease check your cart and try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FrontLayout>
      <div className="checkout-page">
        <div className="checkout-container">
          <h1>Checkout</h1>

          <div className="checkout-content">
            <form className="checkout-form" onSubmit={handleSubmit}>
              <div className="form-section">
                <h2>Contact Information</h2>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name *</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={errors.firstName ? 'error' : ''}
                    />
                    {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="lastName">Last Name *</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={errors.lastName ? 'error' : ''}
                    />
                    {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={errors.email ? 'error' : ''}
                    />
                    {errors.email && <span className="error-message">{errors.email}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Phone Number *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={errors.phone ? 'error' : ''}
                      placeholder="+92 300 1234567"
                    />
                    {errors.phone && <span className="error-message">{errors.phone}</span>}
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h2>Shipping Address</h2>

                <div className="form-group full-width">
                  <label htmlFor="address">Street Address *</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={errors.address ? 'error' : ''}
                    placeholder="House/Flat #, Street Name"
                  />
                  {errors.address && <span className="error-message">{errors.address}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">City *</label>
                    <select
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={errors.city ? 'error' : ''}
                    >
                      <option value="">Select a city</option>
                      {SORTED_PAKISTAN_CITIES.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                    {errors.city && <span className="error-message">{errors.city}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="postalCode">Postal Code *</label>
                    <input
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      className={errors.postalCode ? 'error' : ''}
                    />
                    {errors.postalCode && <span className="error-message">{errors.postalCode}</span>}
                  </div>
                </div>

                <div className="form-group full-width">
                  <label htmlFor="country">Country</label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                  >
                    <option value="Pakistan">Pakistan</option>
                    <option value="UAE">United Arab Emirates</option>
                    <option value="Saudi Arabia">Saudi Arabia</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-section">
                <h2>Additional Notes (Optional)</h2>
                <div className="form-group full-width">
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Any special instructions or notes for your order..."
                  />
                </div>
              </div>

              <div className="form-actions">
                <Link href="/cart" className="back-btn">
                  Back to Cart
                </Link>
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
            </form>

            <div className="order-summary">
              <h2>Order Summary</h2>

              <div className="summary-items">
                {cart.map((item) => (
                  <div key={item.product_id} className="summary-item">
                    <div className="item-info">
                      <span className="item-name">{item.name}</span>
                      <span className="item-qty">× {item.quantity}</span>
                    </div>
                    <span className="item-price">PKR {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="summary-divider"></div>

              <div className="summary-row">
                <span>Subtotal</span>
                <span>PKR {totals.subtotal.toFixed(2)}</span>
              </div>

              {totals.taxAmount > 0 && (
                <div className="summary-row">
                  <span>Tax</span>
                  <span>PKR {totals.taxAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="summary-row">
                <span>Shipping</span>
                <span>FREE</span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-total">
                <span>Total</span>
                <span>PKR {totals.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .checkout-page {
            min-height: 80vh;
            padding: 40px 20px;
            position: relative;
            z-index: 1;
            background: var(--bg-tertiary);
          }

          .checkout-container {
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

          .checkout-content {
            display: grid;
            grid-template-columns: 1fr 400px;
            gap: 32px;
          }

          @media (max-width: 968px) {
            .checkout-content {
              grid-template-columns: 1fr;
            }
          }

          .checkout-form {
            display: flex;
            flex-direction: column;
            gap: 32px;
          }

          .form-section {
            background: var(--bg-primary);
            border: 1px solid var(--border-primary);
            border-radius: 12px;
            padding: 24px;
            box-shadow: var(--shadow-sm);
          }

          .form-section h2 {
            font-size: 20px;
            font-weight: 600;
            color: var(--text-primary);
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
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .form-group.full-width {
            grid-column: 1 / -1;
          }

          label {
            font-size: 14px;
            font-weight: 500;
            color: var(--text-secondary);
          }

          input,
          select,
          textarea {
            background: var(--bg-secondary);
            border: 1px solid var(--border-primary);
            border-radius: 8px;
            padding: 12px 16px;
            font-size: 16px;
            color: var(--text-primary);
            transition: border-color 0.2s, background 0.2s;
          }

          input:focus,
          select:focus,
          textarea:focus {
            outline: none;
            border-color: var(--color-primary);
            background: var(--bg-primary);
            box-shadow: 0 0 0 3px var(--focus-ring);
          }

          input.error,
          select.error,
          textarea.error {
            border-color: var(--color-danger);
            background: var(--error-50);
          }

          .error-message {
            font-size: 13px;
            color: var(--color-danger);
            margin-top: -4px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 4px;
          }
          
          .error-message::before {
            content: '⚠️';
            font-size: 10px;
          }

          textarea {
            resize: vertical;
            min-height: 100px;
          }

          .form-actions {
            display: flex;
            gap: 16px;
            justify-content: flex-end;
            padding: 0 24px 24px 24px;
          }

          .back-btn {
            padding: 14px 32px;
            border-radius: 8px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.2s;
            background: var(--bg-secondary);
            border: 1px solid var(--border-primary);
            color: var(--text-primary);
          }

          .back-btn:hover {
            background: var(--bg-tertiary);
            border-color: var(--text-secondary);
          }

          .submit-btn {
            background: var(--color-primary);
            color: white;
            border: none;
            padding: 14px 40px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
          }

          .submit-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: var(--shadow-md);
            background: var(--color-primary-dark);
          }

          .submit-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .order-summary {
            background: var(--bg-primary);
            border: 1px solid var(--border-primary);
            border-radius: 12px;
            padding: 24px;
            height: fit-content;
            position: sticky;
            top: 100px;
            box-shadow: var(--shadow-sm);
          }

          .order-summary h2 {
            font-size: 20px;
            font-weight: 600;
            color: var(--text-primary);
            margin: 0 0 20px 0;
          }

          .summary-items {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-bottom: 16px;
          }

          .summary-item {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 12px;
          }

          .item-info {
            display: flex;
            flex-direction: column;
            gap: 4px;
            flex: 1;
          }

          .item-name {
            font-size: 14px;
            color: var(--text-primary);
            font-weight: 500;
          }

          .item-qty {
            font-size: 13px;
            color: var(--text-secondary);
          }

          .item-price {
            font-size: 14px;
            font-weight: 600;
            color: var(--text-primary);
          }

          .summary-divider {
            height: 1px;
            background: var(--border-primary);
            margin: 16px 0;
          }

          .summary-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            color: var(--text-secondary);
            font-size: 14px;
          }

          .summary-total {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 0 0 0;
            font-size: 20px;
            font-weight: 700;
            color: var(--text-primary);
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
