import { useState, useRef, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Three.js components to avoid SSR issues
const Canvas = dynamic(
  () => import('@react-three/fiber').then((mod) => mod.Canvas),
  { ssr: false }
);
const OrbitControls = dynamic(
  () => import('@react-three/drei').then((mod) => mod.OrbitControls),
  { ssr: false }
);

// Dynamically import PerfumeBottle
const PerfumeBottle = dynamic(() => import('./XR/PerfumeBottle'), { ssr: false });

// Dynamically import ModelViewer (Google's model-viewer web component)
const ModelViewer = dynamic(() => import('./UI/ModelViewer'), { ssr: false });

export default function ProductPopup({ product, onClose, onAddToCart }) {
  const [view, setView] = useState('3d'); // '3d' or 'image'
  const [quantity, setQuantity] = useState(1);
  const audioContextRef = useRef(null);
  
  // Cleanup AudioContext on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, []);
  
  // Play glass touch sound effect using Web Audio API
  const playGlassTouchSound = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    // Create AudioContext lazily on first interaction
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    const audioContext = audioContextRef.current;
    
    // Resume audio context if suspended (due to autoplay policy)
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
    // Glass-like frequencies (high-pitched harmonics)
    const frequencies = [2400, 3200, 4000, 4800];
    
    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = freq;
      oscillator.type = 'sine';
      
      // Set initial volume and decay (glass tap sound)
      const startTime = audioContext.currentTime;
      const volume = 0.08 / (index + 1); // Decrease volume for higher harmonics
      
      gainNode.gain.setValueAtTime(volume, startTime);
      gainNode.gain.linearRampToValueAtTime(0, startTime + 0.3);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.3);
    });
  }, []);

  if (!product) return null;

  // Check if product has a custom 3D model URL
  const hasCustomModel = typeof product?.model_3d_url === 'string' && product.model_3d_url.trim() !== '';

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product, quantity);
    }
  };

  return (
    <div className="product-popup-overlay" onClick={onClose}>
      <div className="product-popup-content" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="popup-close-btn" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="popup-grid">
          {/* Left: Product Visual */}
          <div className="popup-visual">
            {/* View Toggle */}
            <div className="view-toggle">
              <button
                className={view === '3d' ? 'active' : ''}
                onClick={() => setView('3d')}
              >
                3D View
              </button>
              <button
                className={view === 'image' ? 'active' : ''}
                onClick={() => setView('image')}
              >
                Image
              </button>
            </div>

            {/* 3D View - Uses Google's model-viewer for custom models, Three.js for procedural */}
            {view === '3d' && (
              <div 
                className="product-3d-view"
                onPointerDown={playGlassTouchSound}
              >
                {hasCustomModel ? (
                  /* Use Google's model-viewer for custom 3D models (GLB/GLTF) */
                  <ModelViewer
                    src={product.model_3d_url}
                    alt={`3D model of ${product.name}`}
                    poster={product.image_url}
                    autoRotate={true}
                    cameraControls={true}
                    shadowIntensity={1}
                    exposure={1}
                    style={{
                      width: '100%',
                      height: '100%',
                    }}
                  />
                ) : (
                  /* Use Three.js Canvas for procedural 3D bottles */
                  <Canvas camera={{ position: [0, 0.15, 0.3], fov: 50 }}>
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[5, 5, 5]} intensity={1} />
                    <pointLight position={[-5, 5, 5]} intensity={0.5} />
                    <PerfumeBottle
                      position={[0, 0, 0]}
                      product={product}
                      animated={false}
                    />
                    <OrbitControls
                      enableZoom={true}
                      enablePan={false}
                      minDistance={0.2}
                      maxDistance={0.6}
                      autoRotate={false}
                    />
                  </Canvas>
                )}
              </div>
            )}

            {/* Image View */}
            {view === 'image' && (
              <div className="product-image-view">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} />
                ) : (
                  <div className="no-image">No image available</div>
                )}
              </div>
            )}
          </div>

          {/* Right: Product Information */}
          <div className="popup-info">
            <div className="product-header">
              <div className="product-brand">{product.brand}</div>
              <h2 className="product-name">{product.name}</h2>
            </div>

            <div className="product-price">
              PKR {parseFloat(product.price).toLocaleString('en-PK', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </div>

            <div className="product-description">
              {product.description || 'No description available'}
            </div>

            {/* Product Details */}
            <div className="product-details">
              {product.size_ml && (
                <div className="detail-item">
                  <span className="detail-label">Size:</span>
                  <span className="detail-value">{product.size_ml} ml</span>
                </div>
              )}
              {product.fragrance_notes && (
                <div className="detail-item">
                  <span className="detail-label">Notes:</span>
                  <span className="detail-value">{product.fragrance_notes}</span>
                </div>
              )}
              {product.gender && (
                <div className="detail-item">
                  <span className="detail-label">For:</span>
                  <span className="detail-value">{product.gender}</span>
                </div>
              )}
              {product.stock_quantity !== undefined && (
                <div className="detail-item">
                  <span className="detail-label">Stock:</span>
                  <span className="detail-value">
                    {product.stock_quantity > 0 ? (
                      <span className="in-stock">{product.stock_quantity} available</span>
                    ) : (
                      <span className="out-of-stock">Out of stock</span>
                    )}
                  </span>
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="quantity-selector">
              <label>Quantity:</label>
              <div className="quantity-controls">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  max={product.stock_quantity || 999}
                />
                <button
                  onClick={() => setQuantity(Math.min(product.stock_quantity || 999, quantity + 1))}
                  disabled={quantity >= (product.stock_quantity || 999)}
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              className="add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={!product.stock_quantity || product.stock_quantity < 1}
            >
              {product.stock_quantity > 0 ? '🛒 Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .product-popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .product-popup-content {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 16px;
          max-width: 1000px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .popup-close-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(0, 0, 0, 0.6);
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: white;
          transition: all 0.2s;
          z-index: 10;
          /* Mobile touch optimization */
          touch-action: manipulation;
          -webkit-tap-highlight-color: rgba(255, 255, 255, 0.3);
          user-select: none;
          -webkit-user-select: none;
        }

        .popup-close-btn svg {
          /* Prevent SVG from capturing pointer events */
          pointer-events: none;
        }

        .popup-close-btn:hover {
          background: rgba(0, 0, 0, 0.9);
          transform: rotate(90deg);
        }

        .popup-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          padding: 40px;
        }

        @media (max-width: 768px) {
          .popup-grid {
            grid-template-columns: 1fr;
            gap: 20px;
            padding: 20px;
            padding-top: 60px; /* Add space for close button */
          }

          .popup-close-btn {
            /* CRITICAL FIX: Use fixed positioning on mobile to stay in viewport */
            position: fixed;
            /* Position relative to viewport with safe area support for notches */
            top: max(20px, env(safe-area-inset-top, 20px));
            right: max(20px, env(safe-area-inset-right, 20px));
            /* Make button larger and more visible on mobile */
            width: 48px;
            height: 48px;
            background: rgba(0, 0, 0, 0.9);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
            /* CRITICAL: Must be HIGHER than overlay (9999) to be visible */
            z-index: 100;
            /* Enhanced mobile touch handling */
            touch-action: manipulation;
            -webkit-tap-highlight-color: rgba(255, 255, 255, 0.4);
            /* Add a white border for better visibility */
            border: 2px solid rgba(255, 255, 255, 0.3);
          }

          .popup-close-btn svg {
            width: 22px;
            height: 22px;
          }

          .popup-close-btn:active {
            transform: scale(0.95);
            background: rgba(0, 0, 0, 1);
          }
        }

        .popup-visual {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .view-toggle {
          display: flex;
          gap: 8px;
          background: #f0f0f0;
          padding: 4px;
          border-radius: 8px;
        }

        .view-toggle button {
          flex: 1;
          padding: 10px 20px;
          border: none;
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .view-toggle button.active {
          background: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .product-3d-view {
          width: 100%;
          height: 400px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          overflow: hidden;
        }

        .product-image-view {
          width: 100%;
          height: 400px;
          background: #f5f5f5;
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .product-image-view img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .no-image {
          color: #999;
          font-size: 14px;
        }

        .popup-info {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .product-header {
          border-bottom: 2px solid #f0f0f0;
          padding-bottom: 16px;
        }

        .product-brand {
          font-size: 14px;
          font-weight: 600;
          color: #667eea;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
        }

        .product-name {
          font-size: 28px;
          font-weight: 700;
          color: #222;
          margin: 0;
        }

        .product-price {
          font-size: 32px;
          font-weight: 700;
          color: #27ae60;
        }

        .product-description {
          font-size: 15px;
          line-height: 1.6;
          color: #555;
        }

        .product-details {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 16px;
          background: #f9f9f9;
          border-radius: 8px;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .detail-label {
          font-weight: 600;
          color: #666;
          font-size: 14px;
        }

        .detail-value {
          color: #333;
          font-size: 14px;
        }

        .in-stock {
          color: #27ae60;
          font-weight: 600;
        }

        .out-of-stock {
          color: #e74c3c;
          font-weight: 600;
        }

        .quantity-selector {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .quantity-selector label {
          font-weight: 600;
          color: #333;
        }

        .quantity-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .quantity-controls button {
          width: 36px;
          height: 36px;
          border: 2px solid #ddd;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          font-size: 18px;
          font-weight: 600;
          transition: all 0.2s;
        }

        .quantity-controls button:hover:not(:disabled) {
          border-color: #667eea;
          color: #667eea;
        }

        .quantity-controls button:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .quantity-controls input {
          width: 60px;
          height: 36px;
          text-align: center;
          border: 2px solid #ddd;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 600;
        }

        .add-to-cart-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .add-to-cart-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }

        .add-to-cart-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
