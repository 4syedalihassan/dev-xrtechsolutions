import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import FrontLayout from '../components/Layout/FrontLayout';
import { useCart } from '../contexts/CartContext';

export default function Home() {
  const router = useRouter();
  const { addToCart } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load products
      const productsRes = await fetch('/api/products');
      const productsData = await productsRes.json();

      // Load categories
      const categoriesRes = await fetch('/api/categories');
      const categoriesData = await categoriesRes.json();

      if (productsData.success) {
        // Get first 8 products as featured
        setFeaturedProducts(productsData.products.slice(0, 8));
      }

      if (categoriesData.success) {
        setCategories(categoriesData.categories);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  return (
    <>
      <Head>
        {/* Page-specific SEO */}
        <title>XR Tech Solutions - 3D Virtual Shopping Store | Immersive WebXR E-Commerce</title>
        <meta name="description" content="Experience revolutionary 3D shopping at XR Tech Solutions. Browse healthcare products, perfumes, and more in our immersive virtual store with WebXR technology. Shop in VR/AR or traditional web." />
        <meta name="keywords" content="3D virtual store, WebXR shopping, immersive e-commerce, VR shopping experience, AR retail, healthcare products online, perfume shop, interactive 3D shopping, virtual reality store" />

        {/* Open Graph */}
        <meta property="og:title" content="XR Tech Solutions - 3D Virtual Shopping Store" />
        <meta property="og:description" content="Experience revolutionary 3D shopping at XR Tech Solutions. Browse our immersive virtual store with WebXR technology." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://xrtechsolutions.com/" />

        {/* Twitter Card */}
        <meta name="twitter:title" content="XR Tech Solutions - 3D Virtual Shopping Store" />
        <meta name="twitter:description" content="Experience revolutionary 3D shopping at XR Tech Solutions. Browse our immersive virtual store with WebXR technology." />

        {/* Canonical URL */}
        <link rel="canonical" href="https://xrtechsolutions.com/" />

        {/* JSON-LD for Homepage */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Store',
              name: 'XR Tech Solutions',
              description: 'Revolutionary 3D immersive shopping experience with WebXR technology',
              url: 'https://xrtechsolutions.com',
              logo: 'https://xrtechsolutions.com/logos/logo-primary.svg',
              image: 'https://xrtechsolutions.com/logos/logo-primary.svg',
              priceRange: '$$',
              paymentAccepted: 'Credit Card, Debit Card, Cash on Delivery',
              currenciesAccepted: 'PKR, USD',
              address: {
                '@type': 'PostalAddress',
                addressCountry: 'PK'
              }
            })
          }}
        />
      </Head>
      <FrontLayout>
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-content">
            <h1 className="hero-title">Welcome to XR Tech Solutions</h1>
            <p className="hero-subtitle">
              Experience the future of shopping with our immersive 3D virtual store
            </p>
            <div className="hero-buttons">
              <Link href="/products" className="btn btn-primary">
                Shop Now
              </Link>
              <Link href="/immersiveexp" className="btn btn-secondary">
                🌟 Try Virtual Experience
              </Link>
            </div>
          </div>
          <div className="hero-features">
            <div className="feature-item">
              <span className="feature-icon">🏢</span>
              <h3>Dual Building Complex</h3>
              <p>Healthcare & Perfume Shop</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🛍️</span>
              <h3>Premium Products</h3>
              <p>Curated Selection</p>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🎮</span>
              <h3>3D Shopping</h3>
              <p>Interactive Experience</p>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        {categories.length > 0 && (
          <section className="categories-section">
            <div className="section-container">
              <h2 className="section-title">Shop by Category</h2>
              <div className="categories-grid">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/products?category=${category.id}`}
                    className="category-card"
                  >
                    <div className="category-icon">📦</div>
                    <h3>{category.name}</h3>
                    {category.description && (
                      <p>{category.description}</p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Featured Products Section */}
        <section className="products-section" itemScope itemType="https://schema.org/ItemList">
          <div className="section-container">
            <div className="section-header">
              <h2 className="section-title">Featured Products</h2>
              <Link href="/products" className="view-all-link">
                View All Products →
              </Link>
            </div>

            {loading ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading products...</p>
              </div>
            ) : (
              <div className="products-grid">
                {featuredProducts.map((product, index) => (
                  <div key={product.id} className="product-card" itemScope itemType="https://schema.org/Product" itemProp="itemListElement">
                    <meta itemProp="position" content={index + 1} />
                    {product.image_url && (
                      <div className="product-image">
                        <img src={product.image_url} alt={product.name} itemProp="image" />
                      </div>
                    )}
                    <div className="product-info">
                      <h3 className="product-name" itemProp="name">{product.name}</h3>
                      {product.brand && (
                        <p className="product-brand" itemProp="brand">{product.brand}</p>
                      )}
                      {product.description && (
                        <p className="product-description" itemProp="description">
                          {product.description.substring(0, 100)}
                          {product.description.length > 100 && '...'}
                        </p>
                      )}
                      <div className="product-footer">
                        <span className="product-price" itemProp="offers" itemScope itemType="https://schema.org/Offer">
                          <meta itemProp="price" content={product.price} />
                          <meta itemProp="priceCurrency" content="PKR" />
                          Rs {product.price?.toLocaleString()}
                        </span>
                        <div className="product-actions">
                          <Link
                            href={`/products/${product.id}`}
                            className="btn-small btn-outline"
                            itemProp="url"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="btn-small btn-primary"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && featuredProducts.length === 0 && (
              <div className="empty-state">
                <p>No products available yet.</p>
              </div>
            )}
          </div>
        </section>

        {/* Virtual Experience Callout */}
        <section className="vr-callout">
          <div className="vr-callout-content">
            <h2>Ready for an Immersive Shopping Experience?</h2>
            <p>
              Step into our virtual 3D store and explore products in a whole new way.
              Navigate through our dual-building complex with day/night cycle and interactive elements.
            </p>
            <Link href="/immersiveexp" className="btn btn-large btn-gradient">
              🎮 Launch Virtual Experience
            </Link>
          </div>
        </section>

        <style jsx>{`
        /* Hero Section */
        .hero {
          background: var(--bg-tertiary);
          color: var(--text-primary);
          padding: 80px 20px;
          text-align: center;
          border-bottom: 1px solid var(--border-subtle);
        }

        .hero-content {
          max-width: 800px;
          margin: 0 auto 60px;
        }

        .hero-title {
          font-size: 48px;
          font-weight: 700;
          margin-bottom: 20px;
          color: var(--text-primary);
        }

        .hero-subtitle {
          font-size: 20px;
          margin-bottom: 40px;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .hero-buttons {
          display: flex;
          gap: 20px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .hero-features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 30px;
          max-width: 1000px;
          margin: 0 auto;
        }

        .feature-item {
          background: var(--bg-primary);
          padding: 30px;
          border-radius: 12px;
          border: 1px solid var(--border-primary);
          box-shadow: var(--shadow-sm);
        }

        .feature-icon {
          font-size: 48px;
          display: block;
          margin-bottom: 15px;
        }

        .feature-item h3 {
          font-size: 20px;
          margin-bottom: 10px;
          color: var(--text-primary);
        }

        .feature-item p {
          color: var(--text-secondary);
          font-size: 14px;
        }

        /* Categories Section */
        .categories-section {
          padding: 80px 20px;
          background: var(--bg-secondary);
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 20px;
          margin-top: 40px;
        }

        .category-card {
          background: var(--bg-primary);
          padding: 30px;
          border-radius: 12px;
          text-align: center;
          text-decoration: none;
          color: var(--text-primary);
          transition: all 0.3s;
          border: 1px solid var(--border-primary);
          box-shadow: var(--shadow-sm);
        }

        .category-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-md);
          border-color: var(--color-primary);
        }

        .category-icon {
          font-size: 48px;
          margin-bottom: 15px;
        }

        .category-card h3 {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 10px;
        }

        .category-card p {
          font-size: 14px;
          color: var(--text-secondary);
        }

        /* Products Section */
        .products-section {
          padding: 80px 20px;
          background: var(--bg-primary);
        }

        .section-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          flex-wrap: wrap;
          gap: 20px;
        }

        .section-title {
          font-size: 36px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .view-all-link {
          color: var(--color-primary);
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s;
        }

        .view-all-link:hover {
          color: var(--color-secondary);
          transform: translateX(5px);
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 30px;
        }

        .product-card {
          background: var(--bg-primary);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: var(--shadow-sm);
          transition: all 0.3s;
          border: 1px solid var(--border-primary);
        }

        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-md);
        }

        .product-image {
          width: 100%;
          height: 250px;
          overflow: hidden;
          background: var(--bg-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
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
          padding: 20px;
        }

        .product-name {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 8px;
          color: var(--text-primary);
        }

        .product-brand {
          font-size: 14px;
          color: var(--color-primary);
          margin-bottom: 12px;
          font-weight: 500;
        }

        .product-description {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 15px;
        }

        .product-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid var(--border-primary);
        }

        .product-price {
          font-size: 24px;
          font-weight: 700;
          color: var(--color-primary);
        }

        .product-actions {
          display: flex;
          gap: 8px;
        }

        /* VR Callout */
        .vr-callout {
          background: var(--bg-tertiary);
          color: var(--text-primary);
          padding: 80px 20px;
          text-align: center;
          border-top: 1px solid var(--border-subtle);
        }

        .vr-callout-content {
          max-width: 700px;
          margin: 0 auto;
        }

        .vr-callout h2 {
          font-size: 36px;
          font-weight: 700;
          margin-bottom: 20px;
          color: var(--text-primary);
        }

        .vr-callout p {
          font-size: 18px;
          line-height: 1.6;
          margin-bottom: 40px;
          color: var(--text-secondary);
        }

        /* Buttons */
        .btn {
          display: inline-block;
          padding: 14px 32px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          text-decoration: none;
          transition: all 0.3s;
          border: 2px solid transparent;
        }

        .btn-primary {
          background: var(--color-primary);
          color: white;
        }

        .btn-primary:hover {
          background: var(--color-primary-dark);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .btn-secondary {
          background: var(--bg-primary);
          color: var(--text-primary);
          border-color: var(--border-primary);
        }

        .btn-secondary:hover {
          background: var(--bg-tertiary);
          transform: translateY(-2px);
        }

        .btn-large {
          padding: 18px 48px;
          font-size: 18px;
        }

        .btn-gradient {
          background: var(--color-black);
          color: white;
        }

        .btn-gradient:hover {
          background: var(--gray-800);
          transform: translateY(-3px);
          box-shadow: var(--shadow-md);
        }

        .btn-small {
          padding: 8px 16px;
          font-size: 14px;
          border-radius: 6px;
          cursor: pointer;
          border: none;
          font-weight: 600;
          transition: all 0.2s;
        }

        .btn-small.btn-outline {
          background: transparent;
          color: var(--color-primary);
          border: 1px solid var(--color-primary);
          text-decoration: none;
          display: inline-block;
        }

        .btn-small.btn-outline:hover {
          background: var(--color-primary);
          color: white;
        }

        .btn-small.btn-primary {
          background: var(--color-primary);
          color: white;
        }

        .btn-small.btn-primary:hover {
          background: var(--color-primary-dark);
        }

        /* Loading & Empty States */
        .loading-container {
          text-align: center;
          padding: 60px 20px;
          color: var(--text-secondary);
        }

        .loading-container p {
          color: inherit;
        }

        .spinner {
          width: 50px;
          height: 50px;
          margin: 0 auto 20px;
          border: 4px solid var(--bg-tertiary);
          border-top: 4px solid var(--color-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: var(--text-secondary);
          font-size: 18px;
          background: var(--bg-tertiary);
          border-radius: 12px;
          border: 1px solid var(--border-primary);
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .hero-title {
            font-size: 32px;
          }

          .hero-subtitle {
            font-size: 16px;
          }

          .hero-features {
            grid-template-columns: 1fr;
          }

          .section-title {
            font-size: 28px;
          }

          .vr-callout h2 {
            font-size: 28px;
          }

          .products-grid {
            grid-template-columns: 1fr;
          }
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
