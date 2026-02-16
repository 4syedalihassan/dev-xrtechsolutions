import { useState, useEffect, Suspense, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useCart } from '../../contexts/CartContext';
import { formatCurrency } from '../../lib/format';

// Dynamically import Three.js components to avoid SSR issues
const Canvas = dynamic(
  () => import('@react-three/fiber').then((mod) => mod.Canvas),
  { ssr: false }
);
const OrbitControls = dynamic(
  () => import('@react-three/drei').then((mod) => mod.OrbitControls),
  { ssr: false }
);
const Center = dynamic(
  () => import('@react-three/drei').then((mod) => mod.Center),
  { ssr: false }
);

// Dynamically import PerfumeBottle and Model3DLoader
const PerfumeBottle = dynamic(() => import('../XR/PerfumeBottle'), { ssr: false });
const Model3DLoader = dynamic(() => import('../XR/Model3DLoader'), { ssr: false });

// Dynamically import ModelViewer (Google's model-viewer web component)
const ModelViewer = dynamic(() => import('./ModelViewer'), { ssr: false });

// 3D Scene component for rendering the product model with auto-fit and side view
function ThreeDScene({ product, hasCustomModel }) {
  const controlsRef = useRef();

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <pointLight position={[-5, 5, 5]} intensity={0.5} />

      {/* Center component auto-centers the model within the scene */}
      <Center>
        {hasCustomModel ? (
          <Suspense fallback={
            <mesh>
              <boxGeometry args={[0.04, 0.12, 0.025]} />
              <meshStandardMaterial color="#CCCCCC" />
            </mesh>
          }>
            <Model3DLoader
              url={product.model_3d_url}
              position={[0, 0, 0]}
              scale={[1, 1, 1]}
              castShadow={true}
              receiveShadow={true}
              autoFit={true}
              maxSize={0.25}
            />
          </Suspense>
        ) : (
          <PerfumeBottle
            position={[0, 0, 0]}
            product={product}
            animated={false}
          />
        )}
      </Center>

      {/* OrbitControls for mouse and touch rotation */}
      <OrbitControls
        ref={controlsRef}
        enableZoom={true}
        enablePan={false}
        enableRotate={true}
        enableDamping={true}
        dampingFactor={0.05}
        minDistance={0.15}
        maxDistance={0.8}
        autoRotate={false}
        rotateSpeed={0.8}
        // Touch gestures: ONE finger = rotate, TWO fingers = zoom
        touches={{ ONE: 0, TWO: 2 }}
        // Constrain vertical rotation angle
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI - Math.PI / 6}
      />
    </>
  );
}

export default function ProductPopup({ product, onClose }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [viewMode, setViewMode] = useState('3d'); // '3d' or 'image'
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState('');

  // Set isClient to true after component mounts (for SSR compatibility)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!product) return null;

  const handleAddToCart = async () => {
    setAdding(true);
    setError('');
    const result = await addToCart(product, quantity);
    if (result && !result.success) {
      setError(result.error || 'Failed to add to cart');
      setAdding(false);
      setTimeout(() => setError(''), 3000);
      return;
    }
    setTimeout(() => {
      setAdding(false);
      onClose();
    }, 500);
  };

  const inStock = product.stock_quantity > 0;
  const hasCustomModel = product?.model_3d_url && product.model_3d_url.trim() !== '';

  const getCategoryColor = (category) => {
    const colors = {
      'Floral': '#FFB6C1',
      'Woody': '#8B4513',
      'Fresh': '#87CEEB',
      'Oriental': '#DAA520',
      'Fruity': '#FF69B4',
      'Spicy': '#DC143C'
    };
    return colors[category] || '#ADD8E6';
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.popup} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeButton} onClick={onClose}>×</button>

        <div style={styles.content}>
          <div style={styles.imageSection}>
            <div style={styles.viewToggle}>
              <button
                onClick={() => setViewMode('3d')}
                style={{
                  ...styles.toggleButton,
                  background: viewMode === '3d' ? '#4a90e2' : '#e1e8ed',
                  color: viewMode === '3d' ? 'white' : '#6c757d'
                }}
              >
                🎨 3D Model
              </button>
              <button
                onClick={() => setViewMode('image')}
                style={{
                  ...styles.toggleButton,
                  background: viewMode === 'image' ? '#4a90e2' : '#e1e8ed',
                  color: viewMode === 'image' ? 'white' : '#6c757d'
                }}
              >
                🖼️ Image
              </button>
            </div>

            {viewMode === '3d' && (
              <div style={styles.model3DContainer}>
                {isClient ? (
                  hasCustomModel ? (
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
                        borderRadius: '8px',
                      }}
                    />
                  ) : (
                    <Canvas
                      camera={{
                        position: [0.35, 0.1, 0.25],
                        fov: 45,
                        near: 0.01,
                        far: 100
                      }}
                      style={{
                        width: '100%',
                        height: '100%',
                        touchAction: 'none'
                      }}
                    >
                      <ThreeDScene product={product} hasCustomModel={hasCustomModel} />
                    </Canvas>
                  )
                ) : (
                  <div style={styles.bottleContainer}>
                    <div style={{
                      ...styles.bottleBody,
                      background: `linear-gradient(135deg, ${getCategoryColor(product.category)}CC, ${getCategoryColor(product.category)}66)`,
                      boxShadow: `0 10px 30px ${getCategoryColor(product.category)}40`
                    }}></div>
                    <div style={styles.bottleCap}></div>
                    <div style={styles.bottleLabel}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>{product.brand}</span>
                    </div>
                  </div>
                )}
                <p style={styles.model3DText}>
                  {hasCustomModel ? 'Custom 3D Model' : 'Interactive 3D Model'} - Drag or swipe to spin
                </p>
              </div>
            )}

            {viewMode === 'image' && (
              <>
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    style={styles.productImage}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div style={{
                  ...styles.imagePlaceholder,
                  display: product.image_url ? 'none' : 'flex'
                }}>
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                  <p style={styles.placeholderText}>No Image Available</p>
                </div>
              </>
            )}

            <div style={styles.categoryBadge}>{product.category}</div>
          </div>

          <div style={styles.detailsSection}>
            <div style={styles.header}>
              <div>
                <h2 style={styles.productName}>{product.name}</h2>
                <p style={styles.brandName}>{product.brand}</p>
              </div>
              <div style={styles.priceTag}>
                <span style={styles.price}>{formatCurrency(product.price)}</span>
              </div>
            </div>

            <div style={styles.infoGrid}>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Size</span>
                <span style={styles.infoValue}>{product.size_ml} ml</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Gender</span>
                <span style={styles.infoValue}>{product.gender}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Stock</span>
                <span style={{
                  ...styles.infoValue,
                  color: inStock ? '#4CAF50' : '#f44336',
                  fontWeight: 'bold'
                }}>
                  {inStock ? `${product.stock_quantity} available` : 'Out of Stock'}
                </span>
              </div>
            </div>

            {product.description && (
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Description</h3>
                <p style={styles.description}>{product.description}</p>
              </div>
            )}

            {product.fragrance_notes && (
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Fragrance Notes</h3>
                <div style={styles.notesContainer}>
                  {product.fragrance_notes.split(',').map((note, index) => (
                    <span key={index} style={styles.noteTag}>
                      {note.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={styles.locationInfo}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span style={styles.locationText}>
                Located at Shelf {product.shelf_index}, Slot {product.slot_index}
              </span>
            </div>

            {inStock && (
              <div style={styles.cartSection}>
                {error && (
                  <div style={styles.errorMessage}>
                    {error}
                  </div>
                )}
                <div style={styles.quantitySelector}>
                  <button
                    onClick={() => {
                      setQuantity(Math.max(1, quantity - 1));
                      setError('');
                    }}
                    style={styles.quantityButton}
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <span style={styles.quantityDisplay}>{quantity}</span>
                  <button
                    onClick={() => {
                      setQuantity(Math.min(product.stock_quantity, quantity + 1));
                      setError('');
                    }}
                    style={styles.quantityButton}
                    disabled={quantity >= product.stock_quantity}
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={adding}
                  style={styles.addToCartButton}
                >
                  {adding ? 'Adding...' : `Add to Cart - ${formatCurrency(product.price * quantity)}`}
                </button>
              </div>
            )}

            {!inStock && (
              <div style={styles.outOfStockBanner}>
                Currently Out of Stock
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: '20px',
    animation: 'fadeIn 0.3s ease'
  },
  popup: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: '16px',
    maxWidth: '900px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    position: 'relative',
    boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    animation: 'slideUp 0.3s ease'
  },
  closeButton: {
    position: 'absolute',
    top: '15px',
    right: '15px',
    background: 'rgba(0,0,0,0.1)',
    border: 'none',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    fontSize: '28px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#333',
    zIndex: 1,
    transition: 'background 0.2s'
  },
  content: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.2fr',
    gap: '30px',
    padding: '30px'
  },
  imageSection: {
    position: 'relative',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    overflow: 'hidden',
    minHeight: '400px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  productImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  imagePlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#999',
    padding: '40px'
  },
  placeholderText: {
    marginTop: '10px',
    fontSize: '14px'
  },
  categoryBadge: {
    position: 'absolute',
    top: '15px',
    left: '15px',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#333',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  detailsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: '15px',
    borderBottom: '2px solid #f0f0f0'
  },
  productName: {
    margin: '0 0 5px 0',
    fontSize: '28px',
    color: '#333',
    fontWeight: 'bold'
  },
  brandName: {
    margin: 0,
    fontSize: '16px',
    color: '#666',
    fontStyle: 'italic'
  },
  priceTag: {
    display: 'flex',
    alignItems: 'flex-start',
    backgroundColor: '#4CAF50',
    color: 'white',
    padding: '10px 15px',
    borderRadius: '8px'
  },
  currency: {
    fontSize: '18px',
    marginRight: '2px'
  },
  price: {
    fontSize: '32px',
    fontWeight: 'bold'
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '15px'
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    padding: '12px',
    backgroundColor: '#f9f9f9',
    borderRadius: '6px'
  },
  infoLabel: {
    fontSize: '12px',
    color: '#888',
    marginBottom: '5px',
    textTransform: 'uppercase',
    fontWeight: 'bold'
  },
  infoValue: {
    fontSize: '15px',
    color: '#333',
    fontWeight: '600'
  },
  section: {
    paddingTop: '10px'
  },
  sectionTitle: {
    margin: '0 0 10px 0',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333'
  },
  description: {
    margin: 0,
    fontSize: '15px',
    lineHeight: '1.6',
    color: '#555'
  },
  notesContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px'
  },
  noteTag: {
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    padding: '6px 12px',
    borderRadius: '16px',
    fontSize: '13px',
    fontWeight: '500'
  },
  locationInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px',
    backgroundColor: '#fff3e0',
    borderRadius: '6px',
    borderLeft: '3px solid #ff9800'
  },
  locationText: {
    fontSize: '14px',
    color: '#666'
  },
  cartSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginTop: '10px',
    paddingTop: '20px',
    borderTop: '2px solid #f0f0f0'
  },
  errorMessage: {
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
    border: '1px solid rgba(220, 53, 69, 0.3)',
    color: '#dc3545',
    padding: '10px 15px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500'
  },
  quantitySelector: {
    display: 'flex',
    alignItems: 'center',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    overflow: 'hidden',
    width: 'fit-content'
  },
  quantityButton: {
    width: '45px',
    height: '45px',
    border: 'none',
    backgroundColor: 'white',
    cursor: 'pointer',
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
    transition: 'background 0.2s'
  },
  quantityDisplay: {
    minWidth: '50px',
    textAlign: 'center',
    fontSize: '18px',
    fontWeight: 'bold',
    padding: '0 10px'
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  outOfStockBanner: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '15px',
    borderRadius: '8px',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '16px',
    marginTop: '10px'
  },
  viewToggle: {
    position: 'absolute',
    top: '15px',
    left: '15px',
    zIndex: 2,
    display: 'flex',
    gap: '8px',
    background: 'rgba(255, 255, 255, 0.95)',
    padding: '6px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  toggleButton: {
    border: 'none',
    padding: '8px 14px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap'
  },
  model3DContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    padding: '40px'
  },
  bottleContainer: {
    position: 'relative',
    width: '120px',
    height: '300px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    animation: 'float 3s ease-in-out infinite'
  },
  bottleBody: {
    width: '80px',
    height: '200px',
    borderRadius: '8px 8px 12px 12px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '3px solid rgba(255, 255, 255, 0.5)',
    backdropFilter: 'blur(5px)'
  },
  bottleCap: {
    width: '50px',
    height: '30px',
    background: 'linear-gradient(135deg, #C0C0C0, #A8A8A8)',
    borderRadius: '4px 4px 0 0',
    marginTop: '-10px',
    boxShadow: '0 -2px 5px rgba(0,0,0,0.2)',
    border: '2px solid rgba(255, 255, 255, 0.5)'
  },
  bottleLabel: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'rgba(255, 255, 255, 0.9)',
    padding: '8px 12px',
    borderRadius: '4px',
    color: '#333',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
  },
  model3DText: {
    marginTop: '30px',
    color: '#6c757d',
    fontSize: '14px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  }
};
