import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { sceneAPI } from '../lib/supabase';
import FrontLayout from '../components/Layout/FrontLayout';
import XRCanvas from '../components/XR/XRCanvas';
import ErrorBoundary from '../components/UI/ErrorBoundary';
import ProductPopup from '../components/ProductPopup';
import ShoppingCart from '../components/UI/ShoppingCart';
import Crosshair from '../components/UI/Crosshair';
import SoundManagerComponent, { useSoundManager } from '../components/Audio/SoundManager';
import { useCart } from '../contexts/CartContext';

// Inner component that uses sound manager
function ImmersiveContent({ config, session, isFullscreen, selectedProduct, setSelectedProduct, hoveredProduct, setHoveredProduct }) {
  const soundManager = useSoundManager();
  const { addToCart } = useCart();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                     window.innerWidth <= 768;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleProductClick = (product) => {
    console.log('handleProductClick called with:', product);

    // Play click sound
    if (soundManager && soundManager.clickSound) {
      soundManager.clickSound();
    }

    // Exit pointer lock if active so popup can be interacted with
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }

    setSelectedProduct(product);
    console.log('selectedProduct state updated');
  };

  const handleProductHover = (product) => {
    setHoveredProduct(product);
  };

  const handleAddToCart = (product, quantity) => {
    console.log('🛒 [XR Store] Adding to cart:', product.name, 'x', quantity);
    console.log('🛒 [XR Store] Product data:', {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity
    });

    // Play success sound
    if (soundManager && soundManager.successSound) {
      soundManager.successSound();
    }

    // Use CartContext's addToCart method with correct signature
    // CartContext expects: addToCart(product, quantity)
    addToCart(product, quantity);

    console.log('✅ [XR Store] Product added to cart successfully');

    // Close popup
    setSelectedProduct(null);
  };

  return (
    <>
      <main className={`app-main ${isFullscreen ? 'fullscreen' : ''}`} style={isFullscreen ? { flex: 1 } : {}}>
        <ErrorBoundary>
          <XRCanvas
            config={config}
            session={session}
            onProductClick={handleProductClick}
            onProductHover={handleProductHover}
          />
        </ErrorBoundary>

        {/* Crosshair for aiming */}
        <Crosshair />

        {/* Product interaction prompt - optimized for mobile */}
        {hoveredProduct && (
          <div style={{
            position: 'fixed',
            bottom: isMobile ? '100px' : '120px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.85)',
            color: 'white',
            padding: isMobile ? '8px 12px' : '12px 24px',
            borderRadius: isMobile ? '6px' : '8px',
            fontSize: isMobile ? '12px' : '16px',
            fontWeight: '600',
            zIndex: 1000,
            pointerEvents: 'none',
            border: '2px solid #FFD700',
            boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)',
            animation: 'pulsePrompt 1.5s ease-in-out infinite',
            maxWidth: isMobile ? '180px' : 'none'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: isMobile ? '2px' : '4px', color: '#FFD700', fontSize: isMobile ? '11px' : '16px' }}>{hoveredProduct.name}</div>
              <div style={{ fontSize: isMobile ? '10px' : '14px', opacity: 0.9 }}>
                {isMobile ? (
                  <span>Tap to view</span>
                ) : (
                  <>
                    Press <kbd style={{
                      background: '#333',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontFamily: 'monospace'
                    }}>E</kbd> or <kbd style={{
                      background: '#333',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontFamily: 'monospace'
                    }}>Click</kbd> to view
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Controls hint - shown when not in fullscreen, hidden on mobile */}
        {!isFullscreen && !isMobile && (
          <div style={{
            position: 'absolute',
            bottom: '1rem',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            display: 'flex',
            gap: '1.5rem',
            fontSize: '0.9rem',
            zIndex: 100
          }}>
            <span>🖱️ Click canvas and use WASD to move</span>
            <span>🚪 Press C to open nearest door</span>
            <span>🍾 Aim at bottles and press E or Click to view</span>
          </div>
        )}
      </main>

      {/* Product detail popup */}
      {selectedProduct && (
        <>
          {console.log('Rendering ProductPopup with:', selectedProduct)}
          <ProductPopup
            product={selectedProduct}
            onClose={() => {
              console.log('Closing popup');
              setSelectedProduct(null);
            }}
            onAddToCart={handleAddToCart}
          />
        </>
      )}

      {/* Shopping cart sidebar */}
      <ShoppingCart />
    </>
  );
}

// Main component
export default function ImmersiveExperience({ session }) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const router = useRouter();

  const projectSlug = 'tb-awareness'; // Default project

  useEffect(() => {
    loadProject();

    // Listen for fullscreen changes
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  async function loadProject() {
    try {
      setLoading(true);
      setError(null);

      // Load products from e-commerce API
      const productsResponse = await fetch('/api/products');
      const productsData = await productsResponse.json();

      // Load buildings from e-commerce API
      const buildingsResponse = await fetch('/api/buildings');
      const buildingsData = await buildingsResponse.json();

      if (!productsData.success || !buildingsData.success) {
        throw new Error('Failed to load store data');
      }

      // Create config with e-commerce data
      setConfig({
        products: productsData.products || [],
        buildings: buildingsData.buildings || [],
        project: {
          name: 'XR Tech Solutions',
          slug: 'xr-tech-store',
          description: 'Immersive 3D Shopping Experience'
        }
      });
    } catch (err) {
      console.error('Failed to load project:', err);
      setError(err.message || 'Failed to load 3D experience');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <FrontLayout>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h2>Loading XR Tech Solutions Experience...</h2>
          <p>Preparing your immersive 3D shopping environment</p>
        </div>
      </FrontLayout>
    );
  }

  if (error) {
    return (
      <FrontLayout>
        <div className="error-container">
          <h2>Unable to Load Experience</h2>
          <p>{error}</p>
          <button onClick={loadProject} className="retry-button">
            Try Again
          </button>
        </div>
      </FrontLayout>
    );
  }

  if (!config) {
    return (
      <FrontLayout>
        <div className="error-container">
          <h2>No Content Available</h2>
          <p>The XR Tech Solutions experience is not currently available.</p>
        </div>
      </FrontLayout>
    );
  }

  // Render content without layout in fullscreen mode
  const content = (
    <SoundManagerComponent>
      <ImmersiveContent
        config={config}
        session={session}
        isFullscreen={isFullscreen}
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
        hoveredProduct={hoveredProduct}
        setHoveredProduct={setHoveredProduct}
      />
    </SoundManagerComponent>
  );

  // In fullscreen mode, render without layout
  if (isFullscreen) {
    return <div className="app-container fullscreen">{content}</div>;
  }

  // Normal mode with FrontLayout
  return (
    <FrontLayout>
      {content}
    </FrontLayout>
  );
}

// Prevent static generation - render on server only
export async function getServerSideProps() {
  return { props: {} };
}
