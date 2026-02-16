// =====================================================
// WISHLIST PAGE
// Remaining Feature: Wishlist / Favorites
// =====================================================

import { useState, useEffect } from 'react';
import Link from 'next/link';
import FrontLayout from '../components/Layout/FrontLayout';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAddToCart = (item) => {
    addToCart({
      id: item.id,
      name: item.name,
      brand: item.brand,
      price: item.price,
      image_url: item.image_url
    });
  };

  const handleMoveAllToCart = () => {
    wishlist.forEach(item => handleAddToCart(item));
    clearWishlist();
  };

  if (!mounted) {
    return (
      <FrontLayout>
        <div className="wishlist-page">
          <div className="loading">Loading...</div>
        </div>
      </FrontLayout>
    );
  }

  return (
    <FrontLayout>
      <div className="wishlist-page">
        <div className="wishlist-container">
          <div className="wishlist-header">
            <h1>My Wishlist</h1>
            <p>{wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}</p>
          </div>

          {wishlist.length === 0 ? (
            <div className="empty-wishlist">
              <div className="empty-icon">💝</div>
              <h2>Your wishlist is empty</h2>
              <p>Save items you love to your wishlist and revisit them anytime!</p>
              <Link href="/products" className="shop-btn">
                Start Shopping
              </Link>
            </div>
          ) : (
            <>
              <div className="wishlist-actions">
                <button onClick={handleMoveAllToCart} className="move-all-btn">
                  🛒 Move All to Cart
                </button>
                <button onClick={clearWishlist} className="clear-btn">
                  🗑️ Clear Wishlist
                </button>
              </div>

              <div className="wishlist-grid">
                {wishlist.map((item) => (
                  <div key={item.id} className="wishlist-card">
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="remove-btn"
                      aria-label="Remove from wishlist"
                    >
                      ×
                    </button>

                    {item.image_url && (
                      <div className="card-image">
                        <img src={item.image_url} alt={item.name} />
                      </div>
                    )}

                    <div className="card-content">
                      <h3>{item.name}</h3>
                      {item.brand && <p className="brand">{item.brand}</p>}
                      <p className="price">PKR {item.price.toLocaleString()}</p>

                      <div className="card-actions">
                        <Link href={`/products/${item.id}`} className="view-btn">
                          View Details
                        </Link>
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="cart-btn"
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <style jsx>{`
          .wishlist-page {
            min-height: 80vh;
            padding: 40px 20px;
            position: relative;
            z-index: 1;
            background: var(--bg-secondary);
          }

          .wishlist-container {
            max-width: 1200px;
            margin: 0 auto;
          }

          .wishlist-header {
            text-align: center;
            margin-bottom: 40px;
          }

          .wishlist-header h1 {
            font-size: 36px;
            font-weight: 700;
            color: var(--text-primary);
            margin: 0 0 10px 0;
          }

          .wishlist-header p {
            color: var(--text-secondary);
            font-size: 16px;
          }

          .loading {
            text-align: center;
            color: var(--text-primary);
            padding: 60px 20px;
          }

          .empty-wishlist {
            text-align: center;
            padding: 60px 20px;
            background: var(--bg-tertiary);
            border-radius: 16px;
            border: 1px solid var(--border-subtle);
          }

          .empty-icon {
            font-size: 64px;
            margin-bottom: 20px;
          }

          .empty-wishlist h2 {
            color: var(--text-primary);
            font-size: 24px;
            margin: 0 0 10px 0;
          }

          .empty-wishlist p {
            color: var(--text-secondary);
            margin: 0 0 30px 0;
          }

          .shop-btn {
            display: inline-block;
            padding: 14px 32px;
            background: var(--color-primary);
            color: white;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s;
          }

          .shop-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
          }

          .wishlist-actions {
            display: flex;
            gap: 16px;
            justify-content: flex-end;
            margin-bottom: 24px;
          }

          .move-all-btn,
          .clear-btn {
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
            border: none;
          }

          .move-all-btn {
            background: var(--color-primary);
            color: white;
          }

          .move-all-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          }

          .clear-btn {
            background: var(--bg-tertiary);
            color: var(--color-error);
            border: 1px solid var(--error-200);
          }

          .clear-btn:hover {
            background: var(--error-50);
          }

          .wishlist-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 24px;
          }

          .wishlist-card {
            background: var(--bg-elevated);
            border: 1px solid var(--border-subtle);
            border-radius: 12px;
            overflow: hidden;
            position: relative;
            transition: all 0.3s;
          }

          .wishlist-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 24px var(--shadow-md);
            border-color: var(--color-primary);
          }

          .remove-btn {
            position: absolute;
            top: 12px;
            right: 12px;
            width: 32px;
            height: 32px;
            background: rgba(0, 0, 0, 0.6);
            color: white;
            border: none;
            border-radius: 50%;
            font-size: 20px;
            cursor: pointer;
            z-index: 10;
            transition: all 0.2s;
          }

          .remove-btn:hover {
            background: var(--color-error);
          }

          .card-image {
            height: 200px;
            overflow: hidden;
            background: var(--bg-tertiary);
          }

          .card-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .card-content {
            padding: 20px;
          }

          .card-content h3 {
            color: var(--text-primary);
            font-size: 18px;
            font-weight: 600;
            margin: 0 0 8px 0;
          }

          .brand {
            color: var(--text-secondary);
            font-size: 14px;
            margin: 0 0 12px 0;
          }

          .price {
            color: var(--color-primary);
            font-size: 20px;
            font-weight: 700;
            margin: 0 0 16px 0;
          }

          .card-actions {
            display: flex;
            gap: 12px;
          }

          .view-btn,
          .cart-btn {
            flex: 1;
            padding: 10px 16px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 14px;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s;
            text-decoration: none;
          }

          .view-btn {
            background: var(--bg-tertiary);
            color: var(--text-primary);
            border: 1px solid var(--border-subtle);
          }

          .view-btn:hover {
            background: var(--bg-primary);
          }

          .cart-btn {
            background: var(--color-primary);
            color: white;
            border: none;
          }

          .cart-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          }

          @media (max-width: 640px) {
            .wishlist-actions {
              flex-direction: column;
            }

            .wishlist-header h1 {
              font-size: 28px;
            }
          }
        `}</style>
      </div>
    </FrontLayout>
  );
}

export async function getServerSideProps() {
  return { props: {} };
}
