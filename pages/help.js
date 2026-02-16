// =====================================================
// HELP CENTER PAGE
// Remaining Feature: Chat Support / Help Center
// =====================================================

import { useState } from 'react';
import FrontLayout from '../components/Layout/FrontLayout';

export default function HelpCenterPage() {
  const [activeCategory, setActiveCategory] = useState('orders');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'orders', name: 'Orders & Tracking', icon: '📦' },
    { id: 'shipping', name: 'Shipping & Delivery', icon: '🚚' },
    { id: 'returns', name: 'Returns & Refunds', icon: '↩️' },
    { id: 'payment', name: 'Payment & Billing', icon: '💳' },
    { id: 'account', name: 'Account & Profile', icon: '👤' },
    { id: 'vr', name: 'Virtual Experience', icon: '🎮' }
  ];

  const faqs = {
    orders: [
      {
        question: 'How do I track my order?',
        answer: 'You can track your order by visiting the "Track Order" page and entering your order number. You can find your order number in the confirmation email or in your order history if you have an account.'
      },
      {
        question: 'How long does order processing take?',
        answer: 'Orders are typically processed within 1-2 business days. During peak seasons, processing may take up to 3 business days.'
      },
      {
        question: 'Can I modify my order after placing it?',
        answer: 'Orders can be modified within 1 hour of placement. After that, please contact our support team for assistance.'
      },
      {
        question: 'How do I cancel my order?',
        answer: 'You can cancel your order from the "My Orders" page if it has not been shipped yet. Click on the order and select "Cancel Order".'
      },
      {
        question: 'I received the wrong item. What should I do?',
        answer: 'Please contact our support team immediately with your order number and photos of the incorrect item. We will arrange for the correct item to be sent and the wrong item to be returned at no cost to you.'
      }
    ],
    shipping: [
      {
        question: 'What are your shipping options?',
        answer: 'We offer Standard Shipping (3-5 business days) and Express Shipping (1-2 business days). Free shipping is available on orders over PKR 5,000.'
      },
      {
        question: 'Do you ship internationally?',
        answer: 'Yes, we ship to select countries including UAE, Saudi Arabia, and other Gulf countries. International shipping rates vary by location.'
      },
      {
        question: 'How much does shipping cost?',
        answer: 'Standard shipping is PKR 250 for orders under PKR 5,000. Express shipping is PKR 500. Orders over PKR 5,000 qualify for free standard shipping.'
      },
      {
        question: 'What happens if my package is delayed?',
        answer: 'If your package is delayed beyond the estimated delivery date, please contact our support team with your order number. We will investigate and provide an update.'
      }
    ],
    returns: [
      {
        question: 'What is your return policy?',
        answer: 'We accept returns within 14 days of delivery. Items must be unused, in original packaging, and with all tags attached. Some items like perfumes may have additional restrictions.'
      },
      {
        question: 'How do I return an item?',
        answer: 'To initiate a return, go to "My Orders", select the order, and click "Request Return". Follow the instructions to print your return label and ship the item back.'
      },
      {
        question: 'How long does a refund take?',
        answer: 'Once we receive and inspect your return, refunds are processed within 5-7 business days. The refund will be credited to your original payment method.'
      },
      {
        question: 'Can I exchange an item instead of returning it?',
        answer: 'Yes, you can request an exchange for a different size or color. If the new item costs more, you will need to pay the difference.'
      }
    ],
    payment: [
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept Cash on Delivery (COD), Credit/Debit Cards (Visa, MasterCard), and PayPal. All online payments are secure and encrypted.'
      },
      {
        question: 'Is my payment information secure?',
        answer: 'Yes, all payment transactions are encrypted using SSL technology. We never store your full credit card information on our servers.'
      },
      {
        question: 'My payment was declined. What should I do?',
        answer: 'Please check that your card details are correct and that you have sufficient funds. If the issue persists, try a different payment method or contact your bank.'
      },
      {
        question: 'When will I be charged for my order?',
        answer: 'For card payments, you are charged when the order is placed. For COD, you pay when the order is delivered.'
      }
    ],
    account: [
      {
        question: 'How do I create an account?',
        answer: 'Click "Register" in the navigation and fill in your details. You can also create an account during checkout.'
      },
      {
        question: 'I forgot my password. How do I reset it?',
        answer: 'Click "Login", then "Forgot Password". Enter your email address and we will send you a password reset link.'
      },
      {
        question: 'How do I update my profile information?',
        answer: 'Log in to your account and go to "Profile". From there, you can update your name, email, phone number, and address.'
      },
      {
        question: 'Can I have multiple shipping addresses?',
        answer: 'Yes, you can save multiple addresses in your account. During checkout, you can select from your saved addresses or add a new one.'
      }
    ],
    vr: [
      {
        question: 'What is the Virtual Experience?',
        answer: 'Our Virtual Experience is a 3D interactive store where you can explore products in an immersive environment. Navigate through our virtual buildings and interact with products just like in a real store.'
      },
      {
        question: 'What do I need to use the Virtual Experience?',
        answer: 'You need a modern web browser (Chrome, Firefox, Safari, or Edge) and a stable internet connection. No additional software or plugins required.'
      },
      {
        question: 'The Virtual Experience is slow or not loading. What should I do?',
        answer: 'Try refreshing the page, clearing your browser cache, or using a different browser. A faster internet connection and a device with good graphics capabilities will improve performance.'
      },
      {
        question: 'How do I navigate in the Virtual Experience?',
        answer: 'Use WASD or arrow keys to move, and your mouse to look around. Click on products to view details and add them to your cart.'
      }
    ]
  };

  const filteredFaqs = searchQuery
    ? Object.values(faqs).flat().filter(
        faq =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs[activeCategory] || [];

  return (
    <FrontLayout>
      <div className="help-page">
        <div className="help-container">
          <div className="help-header">
            <h1>Help Center</h1>
            <p>Find answers to common questions or contact our support team</p>

            <div className="search-box">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for help..."
              />
              <span className="search-icon">🔍</span>
            </div>
          </div>

          <div className="help-content">
            {!searchQuery && (
              <div className="categories">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
                  >
                    <span className="category-icon">{category.icon}</span>
                    <span className="category-name">{category.name}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="faqs">
              {searchQuery && (
                <h2>Search Results for "{searchQuery}"</h2>
              )}

              {filteredFaqs.length === 0 ? (
                <div className="no-results">
                  <p>No results found. Please try a different search term or contact our support team.</p>
                </div>
              ) : (
                <div className="faq-list">
                  {filteredFaqs.map((faq, index) => (
                    <FAQItem key={index} question={faq.question} answer={faq.answer} />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="contact-section">
            <h2>Still need help?</h2>
            <p>Our support team is here to assist you</p>

            <div className="contact-options">
              <div className="contact-card">
                <span className="contact-icon">📧</span>
                <h3>Email Support</h3>
                <p>support@xrtech.com</p>
                <span className="response-time">Response within 24 hours</span>
              </div>

              <div className="contact-card">
                <span className="contact-icon">📞</span>
                <h3>Phone Support</h3>
                <p>+92-XXX-XXXXXXX</p>
                <span className="response-time">Mon-Sat, 9 AM - 6 PM PKT</span>
              </div>

              <div className="contact-card">
                <span className="contact-icon">💬</span>
                <h3>Live Chat</h3>
                <p>Click the chat icon</p>
                <span className="response-time">Available 24/7</span>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .help-page {
            min-height: 80vh;
            padding: 40px 20px;
            position: relative;
            z-index: 1;
          }

          .help-container {
            max-width: 1000px;
            margin: 0 auto;
          }

          .help-header {
            text-align: center;
            margin-bottom: 48px;
          }

          .help-header h1 {
            font-size: 40px;
            font-weight: 700;
            color: var(--text-primary);
            margin: 0 0 10px 0;
          }

          .help-header p {
            color: var(--text-secondary);
            font-size: 18px;
            margin: 0 0 32px 0;
          }

          .search-box {
            position: relative;
            max-width: 500px;
            margin: 0 auto;
          }

          .search-box input {
            width: 100%;
            padding: 16px 20px 16px 50px;
            background: var(--bg-secondary);
            border: 1px solid var(--border-primary);
            border-radius: 50px;
            font-size: 16px;
            color: var(--text-primary);
          }

          .search-box input:focus {
            outline: none;
            border-color: var(--color-primary);
          }

          .search-box input::placeholder {
            color: var(--text-tertiary);
          }

          .search-icon {
            position: absolute;
            left: 20px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 20px;
          }

          .categories {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 16px;
            margin-bottom: 40px;
          }

          .category-btn {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            padding: 24px 16px;
            background: var(--bg-secondary);
            border: 1px solid var(--border-primary);
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.3s;
          }

          .category-btn:hover,
          .category-btn.active {
            background: var(--primary-hover-bg);
            border-color: var(--color-primary);
          }

          .category-icon {
            font-size: 32px;
          }

          .category-name {
            color: var(--text-primary);
            font-size: 14px;
            font-weight: 500;
            text-align: center;
          }

          .faqs h2 {
            color: var(--text-primary);
            font-size: 20px;
            margin: 0 0 24px 0;
          }

          .faq-list {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .no-results {
            text-align: center;
            padding: 40px;
            color: var(--text-secondary);
          }

          .contact-section {
            margin-top: 60px;
            text-align: center;
            padding-top: 40px;
            border-top: 1px solid var(--border-primary);
          }

          .contact-section h2 {
            color: var(--text-primary);
            font-size: 24px;
            margin: 0 0 8px 0;
          }

          .contact-section > p {
            color: var(--text-secondary);
            margin: 0 0 32px 0;
          }

          .contact-options {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 24px;
          }

          .contact-card {
            background: var(--bg-secondary);
            border: 1px solid var(--border-primary);
            border-radius: 16px;
            padding: 32px 24px;
            transition: all 0.3s;
          }

          .contact-card:hover {
            border-color: var(--color-primary);
            transform: translateY(-4px);
          }

          .contact-icon {
            font-size: 40px;
            display: block;
            margin-bottom: 16px;
          }

          .contact-card h3 {
            color: var(--text-primary);
            font-size: 18px;
            margin: 0 0 8px 0;
          }

          .contact-card p {
            color: var(--color-primary);
            font-weight: 600;
            margin: 0 0 8px 0;
          }

          .response-time {
            color: var(--text-tertiary);
            font-size: 13px;
          }

          @media (max-width: 640px) {
            .help-header h1 {
              font-size: 28px;
            }

            .categories {
              grid-template-columns: repeat(2, 1fr);
            }
          }
        `}</style>
      </div>
    </FrontLayout>
  );
}

// FAQ Item Component
function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`faq-item ${isOpen ? 'open' : ''}`}>
      <button className="faq-question" onClick={() => setIsOpen(!isOpen)}>
        <span>{question}</span>
        <span className="toggle-icon">{isOpen ? '−' : '+'}</span>
      </button>
      {isOpen && (
        <div className="faq-answer">
          <p>{answer}</p>
        </div>
      )}

      <style jsx>{`
        .faq-item {
          background: var(--bg-secondary);
          border: 1px solid var(--border-primary);
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s;
        }

        .faq-item.open {
          border-color: var(--primary-gradient-fade);
        }

        .faq-question {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          background: none;
          border: none;
          color: var(--text-primary);
          font-size: 16px;
          font-weight: 500;
          text-align: left;
          cursor: pointer;
        }

        .toggle-icon {
          font-size: 24px;
          color: var(--color-primary);
          flex-shrink: 0;
          margin-left: 16px;
        }

        .faq-answer {
          padding: 0 24px 20px;
        }

        .faq-answer p {
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0;
        }
      `}</style>
    </div>
  );
}

export async function getServerSideProps() {
  return { props: {} };
}
