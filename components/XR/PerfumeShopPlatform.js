import { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import PerfumeShopDoors from './PerfumeShopDoors';
import DigitalSignage from './DigitalSignage';
import PerfumeShelf from './PerfumeShelf';

/**
 * PerfumeShopPlatform - Realistic luxury perfume boutique with PBR materials
 *
 * Features:
 * - MeshStandardMaterial for realistic lighting response
 * - Metallic gold accents with proper roughness
 * - Textured brick walls with PBR properties
 * - Realistic floor and ceiling materials
 * - Proper shadow casting and receiving
 */
export default function PerfumeShopPlatform({
  size = { width: 12, depth: 8 },
  wallHeight = 5,
  position = [0, 0, 0],
  doorOpen,
  setDoorOpen,
  onProductClick,
  buildingId // NEW: Building ID to fetch products for
}) {
  const platformRef = useRef();
  const { width, depth } = size;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Minecraft-style light brown brick texture (outside)
  const brownBrickTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    const texSize = 512;
    canvas.width = texSize;
    canvas.height = texSize;
    const ctx = canvas.getContext('2d');

    // Minecraft light brown brick color palette
    const brickColors = [
      '#D2B48C', // Tan
      '#C19A6B', // Camel
      '#B8956A', // Light brown
      '#C4A484', // Desert sand
      '#BFA388', // Khaki brown
      '#C9B18A'  // Light camel
    ];

    const brickWidth = 64;
    const brickHeight = 32;
    const bricksX = texSize / brickWidth;
    const bricksY = texSize / brickHeight;

    // Draw brick pattern
    for (let y = 0; y < bricksY; y++) {
      for (let x = 0; x < bricksX; x++) {
        // Offset every other row for staggered brick pattern
        const offsetX = (y % 2) * (brickWidth / 2);
        const xPos = (x * brickWidth + offsetX) % texSize;
        const yPos = y * brickHeight;

        // Random brick color
        const color = brickColors[Math.floor(Math.random() * brickColors.length)];
        ctx.fillStyle = color;
        ctx.fillRect(xPos, yPos, brickWidth - 2, brickHeight - 2);

        // Add subtle texture variation
        if (Math.random() > 0.6) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
          ctx.fillRect(xPos, yPos, brickWidth - 2, brickHeight - 2);
        }

        // Brick mortar lines (dark gaps between brown bricks)
        ctx.strokeStyle = 'rgba(30, 20, 20, 0.6)';
        ctx.lineWidth = 2;
        ctx.strokeRect(xPos, yPos, brickWidth - 2, brickHeight - 2);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4); // Repeat pattern on walls
    texture.magFilter = THREE.NearestFilter; // Pixelated effect
    texture.minFilter = THREE.NearestFilter;

    return texture;
  }, []);

  // Create Minecraft-style white brick texture (inside)
  const whiteBrickTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    const texSize = 512;
    canvas.width = texSize;
    canvas.height = texSize;
    const ctx = canvas.getContext('2d');

    // Minecraft white brick color palette
    const brickColors = [
      '#F5F5F5', // White smoke
      '#FFFFFF', // Pure white
      '#E8E8E8', // Light grey white
      '#F0F0F0', // Bright white
      '#ECECEC', // Off white
      '#F8F8F8'  // Snow white
    ];

    const brickWidth = 64;
    const brickHeight = 32;
    const bricksX = texSize / brickWidth;
    const bricksY = texSize / brickHeight;

    // Draw brick pattern
    for (let y = 0; y < bricksY; y++) {
      for (let x = 0; x < bricksX; x++) {
        // Offset every other row for staggered brick pattern
        const offsetX = (y % 2) * (brickWidth / 2);
        const xPos = (x * brickWidth + offsetX) % texSize;
        const yPos = y * brickHeight;

        // Random brick color
        const color = brickColors[Math.floor(Math.random() * brickColors.length)];
        ctx.fillStyle = color;
        ctx.fillRect(xPos, yPos, brickWidth - 2, brickHeight - 2);

        // Add subtle texture variation
        if (Math.random() > 0.6) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
          ctx.fillRect(xPos, yPos, brickWidth - 2, brickHeight - 2);
        }

        // Brick mortar lines (light grey gaps)
        ctx.strokeStyle = 'rgba(200, 200, 200, 0.5)';
        ctx.lineWidth = 2;
        ctx.strokeRect(xPos, yPos, brickWidth - 2, brickHeight - 2);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;

    return texture;
  }, []);

  // Fetch products for this specific building
  useEffect(() => {
    setLoading(true);

    // Helper to fetch from products table directly (fallback)
    const fetchFromProductsTable = async () => {
      // Use singleton client to avoid multiple instances warning
      const { supabase } = await import('../../lib/supabase');

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .not('shelf_index', 'is', null)
        .not('slot_index', 'is', null)
        .order('shelf_index', { ascending: true })
        .order('slot_index', { ascending: true });

      if (error) {
        console.error('[PerfumeShopPlatform] Supabase error:', error);
        return [];
      }

      console.log(`[PerfumeShopPlatform] Loaded ${data.length} products from products table`);
      return data;
    };

    // Try building_products API first, fall back to products table
    if (buildingId) {
      fetch(`/api/buildings/${buildingId}/products`)
        .then(res => res.json())
        .then(async data => {
          if (data.success && data.products && data.products.length > 0) {
            // Map building_products data to expected format
            const mappedProducts = data.products.map(bp => ({
              id: bp.product.id,
              name: bp.product.name,
              brand: bp.product.brand,
              description: bp.product.description,
              price: bp.product.price,
              image_url: bp.product.image_url,
              model_3d_url: bp.product.model_3d_url,
              model_position: bp.product.model_position,
              model_scale: bp.product.model_scale,
              model_rotation: bp.product.model_rotation,
              shelf_unit: bp.product.shelf_unit,
              shelf_index: bp.shelfIndex,
              slot_index: bp.slotIndex,
              category: bp.product.product_categories?.name,
              is_active: bp.product.is_active,
              is_featured: bp.isFeatured
            }));
            console.log(`[PerfumeShopPlatform] Loaded ${mappedProducts.length} products from building_products`);
            setProducts(mappedProducts);
          } else {
            // Fallback to products table
            console.log('[PerfumeShopPlatform] No building_products found, falling back to products table');
            const products = await fetchFromProductsTable();
            setProducts(products);
          }
          setLoading(false);
        })
        .catch(async error => {
          console.error('Error fetching building products:', error);
          // Fallback to products table
          const products = await fetchFromProductsTable();
          setProducts(products);
          setLoading(false);
        });
    } else {
      // No buildingId, fetch from products table directly
      fetchFromProductsTable().then(products => {
        setProducts(products);
        setLoading(false);
      });
    }
  }, [buildingId]);

  // Door control now handled by smart C key in Platform component

  return (
    <group ref={platformRef} position={position}>
      {/* Floor - Realistic luxury flooring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial
          color="#555555"
          roughness={0.8}  // Matte floor, reduced shine to prevent z-fighting artifacts
          metalness={0.0}
          envMapIntensity={0.2}
          polygonOffset={true}
          polygonOffsetFactor={-0.5}
          polygonOffsetUnits={-0.5}
        />
      </mesh>

      {/* Walls - Realistic white brick with PBR materials */}
      {/* North Wall with Door Space (depth side) - Split for door opening - ALL WHITE */}
      {/* Left section of north wall */}
      <mesh position={[-width / 2 + (width - 3) / 4, wallHeight / 2, -depth / 2]} castShadow receiveShadow material={[
        new THREE.MeshStandardMaterial({ map: whiteBrickTexture, color: '#F5F5F5', roughness: 0.7, metalness: 0.0 }),
        new THREE.MeshStandardMaterial({ map: whiteBrickTexture, color: '#F5F5F5', roughness: 0.7, metalness: 0.0 }),
        new THREE.MeshStandardMaterial({ map: whiteBrickTexture, color: '#F5F5F5', roughness: 0.7, metalness: 0.0 }),
        new THREE.MeshStandardMaterial({ map: whiteBrickTexture, color: '#F5F5F5', roughness: 0.7, metalness: 0.0 }),
        new THREE.MeshStandardMaterial({ map: whiteBrickTexture, color: '#F5F5F5', roughness: 0.7, metalness: 0.0 }),
        new THREE.MeshStandardMaterial({ map: whiteBrickTexture, color: '#F5F5F5', roughness: 0.7, metalness: 0.0 })
      ]}>
        <boxGeometry args={[(width - 3) / 2, wallHeight, 0.3]} />
      </mesh>

      {/* Right section of north wall */}
      <mesh position={[width / 2 - (width - 3) / 4, wallHeight / 2, -depth / 2]} castShadow receiveShadow material={[
        new THREE.MeshStandardMaterial({ map: whiteBrickTexture, color: '#F5F5F5', roughness: 0.7, metalness: 0.0 }),
        new THREE.MeshStandardMaterial({ map: whiteBrickTexture, color: '#F5F5F5', roughness: 0.7, metalness: 0.0 }),
        new THREE.MeshStandardMaterial({ map: whiteBrickTexture, color: '#F5F5F5', roughness: 0.7, metalness: 0.0 }),
        new THREE.MeshStandardMaterial({ map: whiteBrickTexture, color: '#F5F5F5', roughness: 0.7, metalness: 0.0 }),
        new THREE.MeshStandardMaterial({ map: whiteBrickTexture, color: '#F5F5F5', roughness: 0.7, metalness: 0.0 }),
        new THREE.MeshStandardMaterial({ map: whiteBrickTexture, color: '#F5F5F5', roughness: 0.7, metalness: 0.0 })
      ]}>
        <boxGeometry args={[(width - 3) / 2, wallHeight, 0.3]} />
      </mesh>

      {/* South Wall (solid) - ALL WHITE */}
      <mesh position={[0, wallHeight / 2, depth / 2]} castShadow receiveShadow material={[
        new THREE.MeshStandardMaterial({ map: whiteBrickTexture, color: '#F5F5F5', roughness: 0.7, metalness: 0.0 }),
        new THREE.MeshStandardMaterial({ map: whiteBrickTexture, color: '#F5F5F5', roughness: 0.7, metalness: 0.0 }),
        new THREE.MeshStandardMaterial({ map: whiteBrickTexture, color: '#F5F5F5', roughness: 0.7, metalness: 0.0 }),
        new THREE.MeshStandardMaterial({ map: whiteBrickTexture, color: '#F5F5F5', roughness: 0.7, metalness: 0.0 }),
        new THREE.MeshStandardMaterial({ map: whiteBrickTexture, color: '#F5F5F5', roughness: 0.7, metalness: 0.0 }),
        new THREE.MeshStandardMaterial({ map: whiteBrickTexture, color: '#F5F5F5', roughness: 0.7, metalness: 0.0 })
      ]}>
        <boxGeometry args={[width, wallHeight, 0.3]} />
      </mesh>

      {/* East Wall (width side) - RIGHT - ALL WHITE */}
      <mesh position={[width / 2, wallHeight / 2, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow material={[
        new THREE.MeshStandardMaterial({ map: whiteBrickTexture, color: '#F5F5F5', roughness: 0.7, metalness: 0.0 }),
        new THREE.MeshStandardMaterial({ map: whiteBrickTexture, color: '#F5F5F5', roughness: 0.7, metalness: 0.0 }),
        new THREE.MeshStandardMaterial({ map: whiteBrickTexture, color: '#F5F5F5', roughness: 0.7, metalness: 0.0 }),
        new THREE.MeshStandardMaterial({ map: whiteBrickTexture, color: '#F5F5F5', roughness: 0.7, metalness: 0.0 }),
        new THREE.MeshStandardMaterial({ map: whiteBrickTexture, color: '#F5F5F5', roughness: 0.7, metalness: 0.0 }),
        new THREE.MeshStandardMaterial({ map: whiteBrickTexture, color: '#F5F5F5', roughness: 0.7, metalness: 0.0 })
      ]}>
        <boxGeometry args={[depth, wallHeight, 0.3]} />
      </mesh>

      {/* West Wall (width side) - LEFT - ALL WHITE */}
      <mesh position={[-width / 2, wallHeight / 2, 0]} rotation={[0, Math.PI / 2, 0]} castShadow receiveShadow material={[
        new THREE.MeshStandardMaterial({ map: whiteBrickTexture, color: '#F5F5F5', roughness: 0.7, metalness: 0.0 }),
        new THREE.MeshStandardMaterial({ map: whiteBrickTexture, color: '#F5F5F5', roughness: 0.7, metalness: 0.0 }),
        new THREE.MeshStandardMaterial({ map: whiteBrickTexture, color: '#F5F5F5', roughness: 0.7, metalness: 0.0 }),
        new THREE.MeshStandardMaterial({ map: whiteBrickTexture, color: '#F5F5F5', roughness: 0.7, metalness: 0.0 }),
        new THREE.MeshStandardMaterial({ map: whiteBrickTexture, color: '#F5F5F5', roughness: 0.7, metalness: 0.0 }),
        new THREE.MeshStandardMaterial({ map: whiteBrickTexture, color: '#F5F5F5', roughness: 0.7, metalness: 0.0 })
      ]}>
        <boxGeometry args={[depth, wallHeight, 0.3]} />
      </mesh>

      {/* Glass Double Doors in North Wall */}
      <PerfumeShopDoors
        position={[0, 0, -depth / 2]}
        doorWidth={2.5}
        doorHeight={wallHeight * 0.8}
        isOpen={doorOpen}
        onToggle={() => setDoorOpen(!doorOpen)}
      />

      {/* Door Frame Pillars - Grey to match healthcare center */}
      {/* Left Door Pillar */}
      <mesh position={[-1.4, wallHeight / 2, -depth / 2]} castShadow>
        <boxGeometry args={[0.15, wallHeight, 0.4]} />
        <meshStandardMaterial
          color="#777777"
          metalness={0.2}
          roughness={0.6}
          envMapIntensity={0.5}
        />
      </mesh>

      {/* Right Door Pillar */}
      <mesh position={[1.4, wallHeight / 2, -depth / 2]} castShadow>
        <boxGeometry args={[0.15, wallHeight, 0.4]} />
        <meshStandardMaterial
          color="#777777"
          metalness={0.2}
          roughness={0.6}
          envMapIntensity={0.5}
        />
      </mesh>

      {/* Door Header Beam */}
      <mesh position={[0, wallHeight * 0.85, -depth / 2]} castShadow>
        <boxGeometry args={[3, 0.3, 0.4]} />
        <meshStandardMaterial
          color="#777777"
          metalness={0.2}
          roughness={0.6}
          envMapIntensity={0.5}
        />
      </mesh>

      {/* Luxury Ceiling with Recessed Lighting */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, wallHeight, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial
          color="#C8C8E6"  // Lavender ceiling
          side={THREE.DoubleSide}
          roughness={0.6}
          metalness={0.0}
        />
      </mesh>

      {/* Recessed Ceiling Lights */}
      {/* Create grid of recessed lights */}
      {Array.from({ length: 3 }, (_, i) =>
        Array.from({ length: 2 }, (_, j) => (
          <group key={`light-group-${i}-${j}`}>
            {/* Light fixture */}
            <mesh
              position={[
                -width / 3 + (i * width / 3),
                wallHeight - 0.1,
                -depth / 3 + (j * depth / 2)
              ]}
              castShadow
            >
              <cylinderGeometry args={[0.3, 0.3, 0.1, 12]} />
              <meshStandardMaterial
                color="#FFFAF0"
                emissive="#FFFAF0"
                emissiveIntensity={0.3}
                roughness={0.3}
                metalness={0.1}
              />
            </mesh>
            {/* Actual light source */}
            <pointLight
              position={[
                -width / 3 + (i * width / 3),
                wallHeight - 0.5,
                -depth / 3 + (j * depth / 2)
              ]}
              intensity={0.8}
              distance={8}
              color="#FFFAF0"
            />
          </group>
        ))
      )}

      {/* Additional ambient lighting for perfume shop */}
      <ambientLight intensity={0.4} />

      {/* Directional light for general illumination */}
      <directionalLight
        position={[0, wallHeight + 2, 0]}
        intensity={0.6}
        color="#FFFAF0"
        castShadow
      />

      {/* Corner Support Pillars - Light grey */}
      <mesh position={[width / 2 - 0.15, wallHeight / 2, depth / 2 - 0.15]} castShadow>
        <boxGeometry args={[0.15, wallHeight, 0.15]} />
        <meshStandardMaterial
          color="#E5E5E5"
          roughness={0.5}
          metalness={0.1}
        />
      </mesh>

      <mesh position={[-width / 2 + 0.15, wallHeight / 2, depth / 2 - 0.15]} castShadow>
        <boxGeometry args={[0.15, wallHeight, 0.15]} />
        <meshStandardMaterial
          color="#E5E5E5"
          roughness={0.5}
          metalness={0.1}
        />
      </mesh>

      <mesh position={[width / 2 - 0.15, wallHeight / 2, -depth / 2 + 0.15]} castShadow>
        <boxGeometry args={[0.15, wallHeight, 0.15]} />
        <meshStandardMaterial
          color="#E5E5E5"
          roughness={0.5}
          metalness={0.1}
        />
      </mesh>

      <mesh position={[-width / 2 + 0.15, wallHeight / 2, -depth / 2 + 0.15]} castShadow>
        <boxGeometry args={[0.15, wallHeight, 0.15]} />
        <meshStandardMaterial
          color="#E5E5E5"
          roughness={0.5}
          metalness={0.1}
        />
      </mesh>

      {/* Corner Pillars for Structural Support - Dark grey */}
      <mesh position={[width / 2 - 0.15, wallHeight / 2, depth / 2 - 0.15]} castShadow>
        <boxGeometry args={[0.3, wallHeight, 0.3]} />
        <meshStandardMaterial
          color="#777777"
          roughness={0.6}
          metalness={0.2}
        />
      </mesh>

      <mesh position={[-width / 2 + 0.15, wallHeight / 2, depth / 2 - 0.15]} castShadow>
        <boxGeometry args={[0.3, wallHeight, 0.3]} />
        <meshStandardMaterial
          color="#777777"
          roughness={0.6}
          metalness={0.2}
        />
      </mesh>

      <mesh position={[width / 2 - 0.15, wallHeight / 2, -depth / 2 + 0.15]} castShadow>
        <boxGeometry args={[0.3, wallHeight, 0.3]} />
        <meshStandardMaterial
          color="#777777"
          roughness={0.6}
          metalness={0.2}
        />
      </mesh>

      <mesh position={[-width / 2 + 0.15, wallHeight / 2, -depth / 2 + 0.15]} castShadow>
        <boxGeometry args={[0.3, wallHeight, 0.3]} />
        <meshStandardMaterial
          color="#777777"
          roughness={0.6}
          metalness={0.2}
        />
      </mesh>

      {/* Perfume Shop Signage */}
      <DigitalSignage
        position={[0, wallHeight + 2.8, -depth / 2 - 0.05]}
        rotation={[0, Math.PI, 0]}
        buildingId="luxury-perfume-boutique"
        defaultName="LUXURY PERFUMES"
        width={8}
        height={1.4}
      />

      {/* Floor Trim - Grey to match healthcare center */}
      {/* North wall trim */}
      <mesh position={[0, 0.1, -depth / 2 + 0.05]} castShadow>
        <boxGeometry args={[width - 0.3, 0.15, 0.1]} />
        <meshStandardMaterial
          color="#777777"
          metalness={0.2}
          roughness={0.6}
          envMapIntensity={0.5}
        />
      </mesh>

      {/* East wall trim */}
      <mesh position={[width / 2 - 0.05, 0.1, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[depth - 0.3, 0.15, 0.1]} />
        <meshStandardMaterial
          color="#777777"
          metalness={0.2}
          roughness={0.6}
          envMapIntensity={0.5}
        />
      </mesh>

      {/* West wall trim */}
      <mesh position={[-width / 2 + 0.05, 0.1, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <boxGeometry args={[depth - 0.3, 0.15, 0.1]} />
        <meshStandardMaterial
          color="#777777"
          metalness={0.2}
          roughness={0.6}
          envMapIntensity={0.5}
        />
      </mesh>

      {/* Perfume Display Shelves - UNIFORM CONFIGURATION */}
      {/* Standard shelf specifications */}
      {/* Size: 3m wide x 2m tall x 0.4m deep */}
      {/* Shelves: 4 levels */}
      {/* Slots: 6 per shelf */}
      {/* Total: 24 products per shelf unit */}

      {/* Left wall - Shelf 0 */}
      <PerfumeShelf
        position={[-width / 2 + 0.25, 0, -1.5]}
        rotation={[0, Math.PI / 2, 0]}
        size={{ width: 3, height: 2, depth: 0.4 }}
        shelves={4}
        slotsPerShelf={6}
        shelfIndex={0}
        products={products}
        onProductClick={onProductClick}
      />

      {/* Left wall - Shelf 1 */}
      <PerfumeShelf
        position={[-width / 2 + 0.25, 0, 1.5]}
        rotation={[0, Math.PI / 2, 0]}
        size={{ width: 3, height: 2, depth: 0.4 }}
        shelves={4}
        slotsPerShelf={6}
        shelfIndex={1}
        products={products}
        onProductClick={onProductClick}
      />

      {/* Back wall - Shelf 2 */}
      <PerfumeShelf
        position={[-2.5, 0, depth / 2 - 0.25]}
        rotation={[0, Math.PI, 0]}
        size={{ width: 3, height: 2, depth: 0.4 }}
        shelves={4}
        slotsPerShelf={6}
        shelfIndex={2}
        products={products}
        onProductClick={onProductClick}
      />

      {/* Back wall - Shelf 3 */}
      <PerfumeShelf
        position={[2.5, 0, depth / 2 - 0.25]}
        rotation={[0, Math.PI, 0]}
        size={{ width: 3, height: 2, depth: 0.4 }}
        shelves={4}
        slotsPerShelf={6}
        shelfIndex={3}
        products={products}
        onProductClick={onProductClick}
      />

      {/* Right wall - Shelf 4 */}
      <PerfumeShelf
        position={[width / 2 - 0.25, 0, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        size={{ width: 3, height: 2, depth: 0.4 }}
        shelves={4}
        slotsPerShelf={6}
        shelfIndex={4}
        products={products}
        onProductClick={onProductClick}
      />

      {/* Center island - Shelf 5 (smaller for featured products) */}
      <PerfumeShelf
        position={[0, -0.8, 0]}
        rotation={[0, 0, 0]}
        size={{ width: 2, height: 1.6, depth: 0.8 }}
        shelves={3}
        slotsPerShelf={4}
        shelfIndex={5}
        products={products}
        onProductClick={onProductClick}
      />
    </group>
  );
}
