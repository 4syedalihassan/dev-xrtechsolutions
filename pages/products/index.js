import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { FaSearch, FaBox, FaGamepad, FaFilter, FaSort, FaLayerGroup } from 'react-icons/fa';
import FrontLayout from '../../components/Layout/FrontLayout';
import { useCart } from '../../contexts/CartContext';
import { formatCurrency } from '../../lib/format';

export default function ProductsPage() {
  const router = useRouter();
  const { category } = router.query;
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (category) {
      setSelectedCategory(category);
    }
  }, [category]);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, sortBy]);

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      let url = '/api/products';
      const params = new URLSearchParams();

      if (selectedCategory !== 'all') {
        params.append('category_id', selectedCategory);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        let sortedProducts = [...data.products];

        // Sort products
        switch (sortBy) {
          case 'price-low':
            sortedProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
            break;
          case 'price-high':
            sortedProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
            break;
          case 'name':
          default:
            sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        }

        setProducts(sortedProducts);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    // Optional: Show a toast notification here
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryName = () => {
    if (selectedCategory === 'all') return 'All Products';
    const cat = categories.find(c => c.id === selectedCategory);
    return cat ? cat.name : 'Products';
  };

  const categoryName = getCategoryName();
  const selectedCat = categories.find(c => c.id === selectedCategory);

  return (
    <>
      <Head>
        {/* Page-specific SEO */}
        <title>{categoryName} | XR Tech Solutions - Shop 3D Virtual Store</title>
        <meta name="description" content={`Browse ${categoryName.toLowerCase()} at XR Tech Solutions. Experience revolutionary 3D shopping with WebXR technology. ${selectedCat?.description || 'Premium quality products with immersive shopping experience.'}`} />
        <meta name="keywords" content={`${categoryName}, online shopping, 3D virtual store, WebXR shopping, buy online, e-commerce, ${selectedCat?.name || 'products'}`} />

        {/* Open Graph */}
        <meta property="og:title" content={`${categoryName} | XR Tech Solutions`} />
        <meta property="og:description" content={`Browse ${categoryName.toLowerCase()} with our immersive 3D shopping experience`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://xrtechsolutions.com/products${selectedCategory !== 'all' ? `?category=${selectedCategory}` : ''}`} />

        {/* Twitter Card */}
        <meta name="twitter:title" content={`${categoryName} | XR Tech Solutions`} />
        <meta name="twitter:description" content={`Browse ${categoryName.toLowerCase()} with our immersive 3D shopping experience`} />

        {/* Canonical URL */}
        <link rel="canonical" href={`https://xrtechsolutions.com/products${selectedCategory !== 'all' ? `?category=${selectedCategory}` : ''}`} />

        {/* JSON-LD for Product Collection */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'CollectionPage',
              name: categoryName,
              description: `Browse ${categoryName.toLowerCase()} at XR Tech Solutions`,
              url: `https://xrtechsolutions.com/products${selectedCategory !== 'all' ? `?category=${selectedCategory}` : ''}`,
              mainEntity: {
                '@type': 'ItemList',
                numberOfItems: products.length,
                itemListElement: products.slice(0, 10).map((product, index) => ({
                  '@type': 'ListItem',
                  position: index + 1,
                  item: {
                    '@type': 'Product',
                    name: product.name,
                    url: `https://xrtechsolutions.com/products/${product.id}`,
                    image: product.image_url,
                    offers: {
                      '@type': 'Offer',
                      price: product.price,
                      priceCurrency: 'PKR'
                    }
                  }
                }))
              }
            })
          }}
        />
      </Head>
      <FrontLayout>
        <div className="products-page">
          {/* Page Header */}
          <div className="page-header">
            <div className="container">
              <h1>{categoryName}</h1>
              <p>Browse our complete collection of premium products</p>
            </div>
          </div>

          <div className="container">
            <div className="products-layout">
              {/* Sidebar - Categories & Filters */}
              <aside className="sidebar">
                <div className="filter-section">
                  <h3><FaFilter className="icon" /> Categories</h3>
                  <div className="category-list">
                    <button
                      className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                      onClick={() => setSelectedCategory('all')}
                    >
                      All Products
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(cat.id)}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="filter-section">
                  <h3><FaSort className="icon" /> Sort By</h3>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="sort-select"
                  >
                    <option value="name">Name (A-Z)</option>
                    <option value="price-low">Price (Low to High)</option>
                    <option value="price-high">Price (High to Low)</option>
                  </select>
                </div>

                {/* Virtual Experience Card */}
                <div className="vr-card">
                  <h3><FaGamepad className="icon" /> Try Virtual Experience</h3>
                  <p>Shop in our immersive 3D environment</p>
                  <Link href="/immersiveexp" className="vr-btn">
                    Launch Now
                  </Link>
                </div>
              </aside>

              {/* Main Content - Products Grid */}
              <main className="main-content">
                {/* Search & Filter Bar */}
                <div className="toolbar">
                  <div className="search-wrapper">
                    <FaSearch className="search-icon" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                    />
                  </div>
                  <div className="results-count">
                    {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                  </div>
                </div>

                {/* Products Grid */}
                {loading ? (
                  <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading products...</p>
                  </div>
                ) : filteredProducts.length > 0 ? (
                  <div className="products-grid">
                    {filteredProducts.map((product) => (
                      <div key={product.id} className="product-card">
                        <Link href={`/products/${product.id}`} className="product-link">
                          {product.image_url ? (
                            <div className="product-image">
                              <img src={product.image_url} alt={product.name} />
                            </div>
                          ) : (
                            <div className="product-image placeholder">
                              <FaBox className="placeholder-icon" />
                            </div>
                          )}
                        </Link>

                        <div className="product-info">
                          <Link href={`/products/${product.id}`} className="product-link">
                            <h3 className="product-name">{product.name}</h3>
                          </Link>

                          {product.brand && (
                            <p className="product-brand">{product.brand}</p>
                          )}

                          {product.description && (
                            <p className="product-description">
                              {product.description.substring(0, 80)}
                              {product.description.length > 80 && '...'}
                            </p>
                          )}

                          <div className="product-footer">
                            <span className="product-price">
                              {formatCurrency(product.price)}
                            </span>
                            <button
                              onClick={() => handleAddToCart(product)}
                              className="add-to-cart-btn"
                            >
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <FaSearch className="empty-icon" />
                    <h2>No products found</h2>
                    <p>Try adjusting your search or filter to find what you're looking for.</p>
                    {selectedCategory !== 'all' && (
                      <button
                        onClick={() => setSelectedCategory('all')}
                        className="reset-btn"
                      >
                        View All Products
                      </button>
                    )}
                  </div>
                )}
              </main>
            </div>
          </div>
        </div>

        <style jsx>{`
        .products-page {
          min-height: calc(100vh - 200px);
          background: var(--bg-secondary);
        }

        .page-header {
          background: var(--bg-tertiary);
          color: var(--text-primary);
          padding: 60px 20px;
          text-align: center;
          margin-bottom: 40px;
          border-bottom: 1px solid var(--border-subtle);
        }

        .page-header h1 {
          font-size: 42px;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .page-header p {
          font-size: 18px;
          opacity: 0.95;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .products-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 40px;
          padding-bottom: 60px;
        }

        /* Sidebar */
        .sidebar {
          position: sticky;
          top: 20px;
          height: fit-content;
        }

        .filter-section {
          background: var(--bg-primary);
          padding: 24px;
          border-radius: 12px;
          margin-bottom: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .filter-section h3 {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 16px;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .filter-section :global(.icon) {
          color: var(--color-primary);
        }

        .category-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .category-btn {
          background: transparent;
          border: none;
          padding: 12px 16px;
          text-align: left;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 15px;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .category-btn:hover {
          background: var(--bg-secondary);
          color: var(--color-primary);
        }

        .category-btn.active {
          background: var(--color-primary);
          color: white;
        }

        .sort-select {
          width: 100%;
          padding: 10px 12px;
          border: 2px solid var(--border-primary);
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          transition: border-color 0.2s;
        }

        .sort-select:focus {
          outline: none;
          border-color: var(--color-primary);
        }

        .vr-card {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-primary);
          color: var(--text-primary);
          padding: 24px;
          border-radius: 12px;
          text-align: center;
        }

        .vr-card h3 {
          font-size: 18px;
          margin-bottom: 8px;
        }

        .vr-card p {
          font-size: 14px;
          margin-bottom: 16px;
          color: var(--text-secondary);
        }

        .vr-btn {
          display: inline-block;
          background: var(--color-primary);
          color: white;
          padding: 10px 24px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.2s;
        }

        .vr-btn:hover {
          background: var(--bg-secondary);
          transform: translateY(-2px);
        }

        /* Main Content */
        .main-content {
          min-height: 400px;
        }

        .toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          gap: 20px;
          flex-wrap: wrap;
        }

        .search-input {
          flex: 1;
          max-width: 400px;
          padding: 12px 20px 12px 45px;
          border: 2px solid var(--border-primary);
          border-radius: 8px;
          font-size: 15px;
          transition: border-color 0.2s;
        }

        .search-wrapper {
          flex: 1;
          max-width: 400px;
          position: relative;
        }
        
        .search-wrapper :global(.search-icon) {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-tertiary);
          pointer-events: none;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--color-primary);
        }

        .results-count {
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 500;
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
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          transition: all 0.3s;
          border: 1px solid var(--border-primary);
        }

        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        }

        .product-link {
          text-decoration: none;
          color: inherit;
        }

        .product-image {
          width: 100%;
          height: 280px;
          overflow: hidden;
          background: var(--bg-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
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

        .product-image.placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .product-image.placeholder :global(.placeholder-icon) {
          font-size: 48px;
          color: var(--text-disabled);
        }

        .product-info {
          padding: 20px;
        }

        .product-name {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 8px;
          color: var(--text-primary);
          transition: color 0.2s;
        }

        .product-link:hover .product-name {
          color: var(--color-primary);
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
          margin-bottom: 16px;
        }

        .product-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid var(--border-primary);
        }

        .product-price {
          font-size: 24px;
          font-weight: 700;
          color: var(--color-primary);
        }

        .add-to-cart-btn {
          background: var(--color-primary);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .add-to-cart-btn:hover {
          background: var(--color-secondary);
          transform: translateY(-2px);
        }

        /* Loading & Empty States */
        .loading-container {
          text-align: center;
          padding: 80px 20px;
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

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .empty-state {
          text-align: center;
          padding: 80px 20px;
          background: var(--bg-tertiary);
          border-radius: 12px;
          border: 1px solid var(--border-subtle);
          margin-top: 20px;
        }

        .empty-state :global(.empty-icon) {
          font-size: 72px;
          display: block;
          margin: 0 auto 20px;
          color: var(--text-secondary);
        }

        .empty-state h2 {
          font-size: 28px;
          color: var(--text-primary);
          margin-bottom: 12px;
        }

        .empty-state p {
          color: var(--text-secondary);
          font-size: 16px;
          margin-bottom: 24px;
        }

        .reset-btn {
          background: var(--color-primary);
          color: white;
          border: none;
          padding: 12px 32px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .reset-btn:hover {
          background: var(--color-secondary);
          transform: translateY(-2px);
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .products-layout {
            grid-template-columns: 1fr;
          }

          .sidebar {
            position: relative;
            top: auto;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
          }
        }

        @media (max-width: 768px) {
          .page-header h1 {
            font-size: 32px;
          }

          .sidebar {
            grid-template-columns: 1fr;
          }

          .products-grid {
            grid-template-columns: 1fr;
          }

          .toolbar {
            flex-direction: column;
            align-items: stretch;
          }

          .search-input {
            max-width: 100%;
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
