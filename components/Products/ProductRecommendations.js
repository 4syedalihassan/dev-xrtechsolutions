// =====================================================
// PRODUCT RECOMMENDATIONS COMPONENT
// Remaining Feature: Product Recommendation Engine
// =====================================================

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';

export default function ProductRecommendations({
  productId,
  categoryId,
  type = 'similar',
  title = 'You May Also Like',
  limit = 4
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    loadRecommendations();
  }, [productId, categoryId, type]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      let url = `/api/recommendations?type=${type}&limit=${limit}`;
      if (productId) url += `&product_id=${productId}`;
      if (categoryId) url += `&category_id=${categoryId}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setProducts(data.recommendations);
      }
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="recommendations-section loading">
        <div className="spinner"></div>
        <style jsx>{`
          .loading {
            padding: 40px;
            text-align: center;
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

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="recommendations-section">
      <h2>{title}</h2>
      <div className="products-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <button
              onClick={() => toggleWishlist(product)}
              className={`wishlist-btn ${isInWishlist(product.id) ? 'active' : ''}`}
              aria-label={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              ♥
            </button>

            {product.image_url && (
              <Link href={`/products/${product.id}`} className="product-image">
                <img src={product.image_url} alt={product.name} />
              </Link>
            )}

            <div className="product-info">
              <Link href={`/products/${product.id}`} className="product-name">
                {product.name}
              </Link>
              {product.brand && <p className="product-brand">{product.brand}</p>}
              <p className="product-price">PKR {product.price?.toLocaleString()}</p>

              <button
                onClick={() => addToCart(product)}
                className="add-to-cart-btn"
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .recommendations-section {
          padding: 40px 0;
          border-top: 1px solid var(--border-subtle);
        }

        h2 {
          color: var(--text-primary);
          font-size: 24px;
          margin: 0 0 24px 0;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 20px;
        }

        .product-card {
          background: var(--card-bg);
          border: 1px solid var(--border-primary);
          border-radius: 12px;
          overflow: hidden;
          position: relative;
          transition: all 0.3s;
          box-shadow: var(--shadow-sm);
        }

        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
          border-color: var(--color-primary);
        }

        .wishlist-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 32px;
          height: 32px;
          background: rgba(0, 0, 0, 0.5);
          border: none;
          border-radius: 50%;
          color: white;
          font-size: 16px;
          cursor: pointer;
          z-index: 5;
          transition: all 0.2s;
        }

        .wishlist-btn:hover,
        .wishlist-btn.active {
          background: var(--color-error);
          color: white;
        }

        .product-image {
          display: block;
          height: 180px;
          overflow: hidden;
          background: var(--bg-tertiary);
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }

        .product-card:hover .product-image img {
          transform: scale(1.05);
        }

        .product-info {
          padding: 16px;
        }

        .product-name {
          color: var(--text-primary);
          font-size: 16px;
          font-weight: 600;
          text-decoration: none;
          display: block;
          margin-bottom: 4px;
        }

        .product-name:hover {
          color: var(--color-primary);
        }

        .product-brand {
          color: var(--text-secondary);
          font-size: 13px;
          margin: 0 0 8px 0;
        }

        .product-price {
          color: var(--color-primary);
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 12px 0;
        }

        .add-to-cart-btn {
          width: 100%;
          padding: 10px;
          background: var(--color-primary);
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .add-to-cart-btn:hover {
          transform: translateY(-2px);
          background: var(--color-secondary);
          box-shadow: var(--shadow-md);
        }
      `}</style>
    </div>
  );
}
