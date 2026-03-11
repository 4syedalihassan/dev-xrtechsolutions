import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import FrontLayout from '../../components/Layout/FrontLayout';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { FaBox, FaGamepad, FaHeart, FaRegHeart, FaShoppingCart, FaCheck, FaTimes } from 'react-icons/fa';
import ReviewsSection from '../../components/Reviews/ReviewsSection';
import ProductRecommendations from '../../components/Products/ProductRecommendations';

export default function ProductDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      // Validate and sanitize the product id before using it in the request URL
      const idStr = typeof id === 'string' ? id : String(id || '');
      const safeId = idStr.match(/^[a-zA-Z0-9_-]+$/) ? idStr : null;
      if (!safeId) {
        console.error('Invalid product id:', id);
        setError('Invalid product identifier.');
        return;
      }
      const response = await fetch(`/api/products/${safeId}`);
      const data = await response.json();

      if (data.success) {
        setProduct(data.product);
      } else {
        console.error('Product not found');
      }
    } catch (error) {
      console.error('Failed to load product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      setError('');
      const result = addToCart(product, quantity);
      if (result && !result.success) {
        setError(result.error || 'Failed to add to cart');
        return;
      }
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    setTimeout(() => {
      router.push('/cart');
    }, 300);
  };

  const incrementQuantity = () => {
    // Only allow increment if we have valid stock information from backend
    if (product?.stock_quantity === undefined) {
      setError('Stock information unavailable. Please refresh the page.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    // Check if out of stock
    if (product.stock_quantity === 0) {
      setError('This item is out of stock');
      setTimeout(() => setError(''), 3000);
      return;
    }

    const maxStock = product.stock_quantity;
    if (quantity < maxStock) {
      setQuantity(prev => prev + 1);
      setError('');
    } else {
      setError(`Maximum available quantity is ${maxStock}`);
      setTimeout(() => setError(''), 3000);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
      setError('');
    }
  };

  if (loading) {
    return (
      <FrontLayout>
        <div className="loading-page">
          <div className="spinner"></div>
          <p>Loading product...</p>
        </div>

        <style jsx>{`
          .loading-page {
            min-height: 60vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }

          .spinner {
            width: 50px;
            height: 50px;
            border: 4px solid var(--bg-tertiary);
            border-top: 4px solid var(--color-primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          p {
            color: var(--text-secondary);
            font-size: 16px;
          }
        `}</style>
      </FrontLayout>
    );
  }

  if (!product) {
    return (
      <FrontLayout>
        <div className="not-found">
          <h1>Product Not Found</h1>
          <p>The product you're looking for doesn't exist.</p>
          <Link href="/products" className="back-link">
            ← Back to Products
          </Link>
        </div>

        <style jsx>{`
          .not-found {
            min-height: 60vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
            text-align: center;
          }

          h1 {
            font-size: 32px;
            color: var(--text-primary);
            margin-bottom: 16px;
          }

          p {
            color: var(--text-secondary);
            font-size: 18px;
            margin-bottom: 32px;
          }

          .back-link {
            color: var(--color-primary);
            font-weight: 600;
            text-decoration: none;
            transition: color 0.2s;
          }

          .back-link:hover {
            color: var(--color-secondary);
          }
        `}</style>
      </FrontLayout>
    );
  }

  return (
    <>
      {product && (
        <Head>
          {/* Page-specific SEO */}
          <title>{product.name} | XR Tech Solutions - 3D Virtual Shopping</title>
          <meta name="description" content={`${product.description || `Buy ${product.name} from XR Tech Solutions`}. Experience 3D shopping with WebXR technology. ${product.brand ? `Brand: ${product.brand}` : ''}`} />
          <meta name="keywords" content={`${product.name}, ${product.brand || ''}, buy online, 3D shopping, WebXR, virtual store, ${product.category_name || 'products'}`} />

          {/* Open Graph */}
          <meta property="og:title" content={`${product.name} | XR Tech Solutions`} />
          <meta property="og:description" content={product.description || `Buy ${product.name} from XR Tech Solutions`} />
          <meta property="og:type" content="product" />
          <meta property="og:url" content={`https://xrtechsolutions.com/products/${product.id}`} />
          <meta property="og:image" content={product.image_url || 'https://xrtechsolutions.com/logos/logo-primary.svg'} />
          <meta property="product:price:amount" content={product.price} />
          <meta property="product:price:currency" content="PKR" />
          {product.brand && <meta property="product:brand" content={product.brand} />}

          {/* Twitter Card */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={`${product.name} | XR Tech Solutions`} />
          <meta name="twitter:description" content={product.description || `Buy ${product.name}`} />
          <meta name="twitter:image" content={product.image_url || 'https://xrtechsolutions.com/logos/logo-primary.svg'} />

          {/* Canonical URL */}
          <link rel="canonical" href={`https://xrtechsolutions.com/products/${product.id}`} />

          {/* JSON-LD Product Schema */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'Product',
                name: product.name,
                description: product.description || `Buy ${product.name} from XR Tech Solutions`,
                image: product.image_url || 'https://xrtechsolutions.com/logos/logo-primary.svg',
                ...(product.brand && {
                  brand: {
                    '@type': 'Brand',
                    name: product.brand
                  }
                }),
                offers: {
                  '@type': 'Offer',
                  url: `https://xrtechsolutions.com/products/${product.id}`,
                  priceCurrency: 'PKR',
                  price: product.price || 0,
                  availability: product.stock_quantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                  seller: {
                    '@type': 'Organization',
                    name: 'XR Tech Solutions'
                  }
                },
                sku: product.sku || product.id,
                category: product.category_name
              })
            }}
          />

          {/* Breadcrumb Schema */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: [
                  {
                    '@type': 'ListItem',
                    position: 1,
                    name: 'Home',
                    item: 'https://xrtechsolutions.com/'
                  },
                  {
                    '@type': 'ListItem',
                    position: 2,
                    name: 'Products',
                    item: 'https://xrtechsolutions.com/products'
                  },
                  {
                    '@type': 'ListItem',
                    position: 3,
                    name: product.name,
                    item: `https://xrtechsolutions.com/products/${product.id}`
                  }
                ]
              })
            }}
          />
        </Head>
      )}
      <FrontLayout>
        <div className="product-detail-page" itemScope itemType="https://schema.org/Product">
          {/* Breadcrumb */}
          <div className="container">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <ol>
                <li>
                  <Link href="/">Home</Link>
                </li>
                <li>
                  <Link href="/products">Products</Link>
                </li>
                <li aria-current="page">
                  {product?.name}
                </li>
              </ol>
            </nav>
          </div>

          {/* Product Detail Section */}
          <div className="container">
            <div className="product-detail">
              {/* Product Image */}
              <div className="product-gallery">
                {product.image_url ? (
                  <div className="main-image">
                    <img src={product.image_url} alt={product.name} itemProp="image" />
                  </div>
                ) : (
                  <div className="main-image placeholder">
                    <FaBox size={120} color="var(--text-disabled)" />
                    <p>No Image Available</p>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="product-info-section">
                {product.brand && (
                  <div className="brand" itemProp="brand">{product.brand}</div>
                )}

                <h1 className="product-title" itemProp="name">{product.name}</h1>

                <div className="price-section" itemProp="offers" itemScope itemType="https://schema.org/Offer">
                  {(() => {
                    const displayPrice = typeof product.price === 'number' && !isNaN(product.price) ? product.price : 0;
                    return (
                      <>
                        <meta itemProp="priceCurrency" content="PKR" />
                        <meta itemProp="price" content={displayPrice} />
                        <link itemProp="availability" href={product.stock_quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"} />
                        <span className="price">Rs {displayPrice.toLocaleString()}</span>
                        {product.stock_quantity !== undefined && (
                          <span className="stock">
                            {product.stock_quantity > 0 ? (
                              <span className="in-stock"><FaCheck /> In Stock ({product.stock_quantity})</span>
                            ) : (
                              <span className="out-of-stock"><FaTimes /> Out of Stock</span>
                            )}
                          </span>
                        )}
                      </>
                    );
                  })()}
                </div>

                {product.description && (
                  <div className="description" itemProp="description">
                    <h2>Description</h2>
                    <p>{product.description}</p>
                  </div>
                )}

                {/* Product Details */}
                <div className="product-details">
                  <h2>Product Details</h2>
                  <ul>
                    {product.sku && <li><strong>SKU:</strong> {product.sku}</li>}
                    {product.size_ml && <li><strong>Size:</strong> {product.size_ml} ml</li>}
                    {product.fragrance_notes && (
                      <li><strong>Fragrance Notes:</strong> {product.fragrance_notes}</li>
                    )}
                    {product.gender && <li><strong>Gender:</strong> {product.gender}</li>}
                    {product.category && (
                      <li><strong>Category:</strong> {product.category.name}</li>
                    )}
                  </ul>
                </div>

                {/* Quantity & Add to Cart */}
                <div className="purchase-section">
                  {error && (
                    <div className="error-message-box">
                      {error}
                    </div>
                  )}
                  <div className="quantity-selector">
                    <label>Quantity:</label>
                    <div className="quantity-controls">
                      <button
                        onClick={decrementQuantity}
                        className="qty-btn"
                        disabled={quantity <= 1}
                      >−</button>
                      <span className="quantity">{quantity}</span>
                      <button
                        onClick={incrementQuantity}
                        className="qty-btn"
                        disabled={product.stock_quantity === undefined || product.stock_quantity === 0 || quantity >= product.stock_quantity}
                      >+</button>
                    </div>
                  </div>

                  <div className="action-buttons">
                    <button
                      onClick={handleAddToCart}
                      className="btn btn-add-to-cart"
                      disabled={product.stock_quantity === 0}
                    >
                      {addedToCart ? <><FaCheck /> Added to Cart!</> : <><FaShoppingCart /> Add to Cart</>}
                    </button>
                    <button
                      onClick={handleBuyNow}
                      className="btn btn-buy-now"
                      disabled={product.stock_quantity === 0}
                    >
                      Buy Now
                    </button>
                  </div>

                  {/* Wishlist Button */}
                  <button
                    onClick={() => toggleWishlist(product)}
                    className={`wishlist-action-btn ${isInWishlist(product.id) ? 'active' : ''}`}
                  >
                    {isInWishlist(product.id) ? <><FaHeart /> In Wishlist</> : <><FaRegHeart /> Add to Wishlist</>}
                  </button>
                </div>

                {/* Virtual Experience CTA */}
                <div className="vr-cta">
                  <div className="vr-cta-content">
                    <span className="vr-icon"><FaGamepad /></span>
                    <div>
                      <h3>View in Virtual Store</h3>
                      <p>Experience this product in our immersive 3D environment</p>
                    </div>
                  </div>
                  <Link href="/immersiveexp" className="vr-btn">
                    Launch VR
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="container reviews-container">
            <ReviewsSection productId={id} />
          </div>

          {/* Product Recommendations */}
          <div className="container recommendations-container">
            <ProductRecommendations
              productId={id}
              categoryId={product.category_id}
              type="similar"
              title="You May Also Like"
            />

            <ProductRecommendations
              productId={id}
              type="frequently_bought"
              title="Frequently Bought Together"
            />
          </div>

          {/* Related Products or Continue Shopping */}
          <div className="container">
            <div className="bottom-cta">
              <Link href="/products" className="continue-shopping">
                ← Continue Shopping
              </Link>
              <Link href="/cart" className="view-cart">
                View Cart →
              </Link>
            </div>
          </div>
        </div>

        <style jsx>{`
        .product-detail-page {
          min-height: calc(100vh - 200px);
          padding: 40px 20px 80px;
          background: var(--bg-secondary);
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
        }

        /* Breadcrumb */
        .breadcrumb {
          padding: 16px 0;
          font-size: 14px;
          color: var(--text-secondary);
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 24px;
        }

        .breadcrumb a {
          color: var(--color-primary);
          text-decoration: none;
          transition: color 0.2s;
        }

        .breadcrumb a:hover {
          color: var(--color-secondary);
        }

        .breadcrumb ol {
          display: flex;
          flex-wrap: wrap;
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .breadcrumb li {
          display: flex;
          align-items: center;
        }

        .breadcrumb li:not(:last-child)::after {
          content: '/';
          margin: 0 0.5em;
          color: var(--text-tertiary);
        }

        /* Product Detail Layout */
        .product-detail {
          background: var(--bg-primary);
          border-radius: 16px;
          padding: 40px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          margin-bottom: 40px;
        }

        /* Product Gallery */
        .product-gallery {
          position: sticky;
          top: 40px;
          height: fit-content;
        }

        .main-image {
          width: 100%;
          aspect-ratio: 1;
          border-radius: 12px;
          overflow: hidden;
          background: var(--bg-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border-primary);
        }

        .main-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .main-image.placeholder {
          flex-direction: column;
          gap: 16px;
        }

        .main-image.placeholder p {
          color: var(--text-secondary);
          font-size: 18px;
        }

        /* Product Info Section */
        .product-info-section {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .brand {
          color: var(--color-primary);
          font-weight: 600;
          font-size: 16px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .product-title {
          font-size: 36px;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.2;
          margin: 0;
        }

        .price-section {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 20px 0;
          border-bottom: 2px solid var(--border-primary);
        }

        .price {
          font-size: 42px;
          font-weight: 700;
          color: var(--color-primary);
        }

        .stock {
          font-size: 16px;
          font-weight: 600;
        }

        .in-stock {
          color: var(--color-success);
        }

        .out-of-stock {
          color: var(--color-error);
        }

        .description h2,
        .product-details h2 {
          font-size: 20px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 12px;
        }

        .description p {
          font-size: 16px;
          line-height: 1.6;
          color: var(--text-secondary);
        }

        .product-details ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .product-details li {
          padding: 10px 0;
          border-bottom: 1px solid var(--border-primary);
          font-size: 15px;
          color: var(--text-secondary);
        }

        .product-details li:last-child {
          border-bottom: none;
        }

        .product-details strong {
          color: var(--text-primary);
          margin-right: 8px;
        }

        /* Purchase Section */
        .purchase-section {
          background: var(--bg-secondary);
          padding: 24px;
          border-radius: 12px;
          border: 2px solid var(--border-primary);
        }

        .error-message-box {
          background: rgba(220, 53, 69, 0.1);
          border: 1px solid rgba(220, 53, 69, 0.3);
          color: var(--color-error);
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 14px;
          font-weight: 500;
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .quantity-selector {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }

        .quantity-selector label {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 16px;
        }

        .quantity-controls {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--bg-primary);
          padding: 8px 16px;
          border-radius: 8px;
          border: 2px solid var(--border-primary);
        }

        .qty-btn {
          width: 32px;
          height: 32px;
          border: none;
          background: var(--color-primary);
          color: white;
          border-radius: 6px;
          font-size: 20px;
          cursor: pointer;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .qty-btn:hover:not(:disabled) {
          background: var(--color-secondary);
        }

        .qty-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .quantity {
          font-size: 20px;
          font-weight: 600;
          color: var(--text-primary);
          min-width: 40px;
          text-align: center;
        }

        .action-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .btn {
          padding: 16px 24px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          text-align: center;
        }

        .btn-add-to-cart {
          background: var(--bg-primary);
          color: var(--color-primary);
          border: 2px solid var(--color-primary);
        }

        .btn-add-to-cart:hover:not(:disabled) {
          background: var(--color-primary);
          color: white;
        }

        .btn-buy-now {
          background: var(--color-primary);
          color: white;
        }

        .btn-buy-now:hover:not(:disabled) {
          background: var(--color-secondary);
          transform: translateY(-2px);
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* VR CTA */
        .vr-cta {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-primary);
          color: var(--text-primary);
          padding: 24px;
          border-radius: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .vr-cta-content {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .vr-icon {
          font-size: 48px;
        }

        .vr-cta h3 {
          font-size: 18px;
          margin: 0 0 4px 0;
        }

        .vr-cta p {
          margin: 0;
          font-size: 14px;
          opacity: 0.95;
        }

        .vr-btn {
          background: white;
          color: var(--color-primary);
          padding: 12px 32px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .vr-btn:hover {
          background: var(--bg-secondary);
          transform: translateY(-2px);
        }

        /* Bottom CTA */
        .bottom-cta {
          display: flex;
          justify-content: space-between;
          padding: 24px 0;
          gap: 20px;
        }

        .continue-shopping,
        .view-cart {
          color: var(--color-primary);
          text-decoration: none;
          font-weight: 600;
          font-size: 16px;
          transition: color 0.2s;
        }

        .continue-shopping:hover,
        .view-cart:hover {
          color: var(--color-secondary);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .product-detail {
            grid-template-columns: 1fr;
            padding: 24px;
            gap: 32px;
          }

          .product-gallery {
            position: relative;
            top: auto;
          }

          .product-title {
            font-size: 28px;
          }

          .price {
            font-size: 32px;
          }

          .action-buttons {
            grid-template-columns: 1fr;
          }

          .vr-cta {
            flex-direction: column;
            text-align: center;
          }

          .vr-cta-content {
            flex-direction: column;
          }

          .bottom-cta {
            flex-direction: column;
            text-align: center;
          }
        }

        .wishlist-action-btn {
          width: 100%;
          padding: 12px;
          background: transparent;
          border: 2px solid var(--color-error);
          color: var(--color-error);
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 12px;
        }

        .wishlist-action-btn:hover,
        .wishlist-action-btn.active {
          background: var(--color-error);
          color: white;
        }

        .reviews-container,
        .recommendations-container {
          background: var(--bg-primary);
          border-radius: 16px;
          padding: 40px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
          margin-bottom: 40px;
        }

        .recommendations-container :global(.recommendations-section) {
          padding: 0;
          border: none;
        }

        .recommendations-container :global(.recommendations-section + .recommendations-section) {
          padding-top: 40px;
          margin-top: 40px;
          border-top: 1px solid var(--border-primary);
        }

        .recommendations-container :global(h2) {
          color: var(--text-primary);
        }

        .recommendations-container :global(.product-card) {
          background: var(--bg-secondary);
          border-color: var(--border-primary);
        }

        .recommendations-container :global(.product-name) {
          color: var(--text-primary);
        }

        .recommendations-container :global(.product-brand) {
          color: var(--text-secondary);
        }

        .reviews-container :global(.reviews-section) {
          padding: 0;
          border: none;
        }

        .reviews-container :global(h2) {
          color: var(--text-primary);
        }

        .reviews-container :global(.reviews-summary),
        .reviews-container :global(.review-form),
        .reviews-container :global(.review-card) {
          background: var(--bg-secondary);
          border-color: var(--border-primary);
        }

        .reviews-container :global(.reviews-summary *),
        .reviews-container :global(.review-form *),
        .reviews-container :global(.review-card *) {
          color: var(--text-primary);
        }

        .reviews-container :global(input),
        .reviews-container :global(textarea) {
          background: var(--bg-primary);
          color: var(--text-primary);
          border-color: var(--border-primary);
        }
      `}</style>
      </FrontLayout>
    </>
  );
}

// Server-side rendering
export async function getServerSideProps() {
  return { props: {} };
}
