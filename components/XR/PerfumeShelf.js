import { useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import PerfumeBottle from './PerfumeBottle';

// Helper function to parse JSONB vector data
const parseModelVector = (vectorData, defaultValue = [0, 0, 0]) => {
  if (!vectorData) return defaultValue;
  return [
    vectorData.x || defaultValue[0],
    vectorData.y || defaultValue[1],
    vectorData.z || defaultValue[2]
  ];
};

export default function PerfumeShelf({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  size = { width: 2, height: 1.8, depth: 0.4 },
  shelves = 4,
  slotsPerShelf = 6,
  shelfIndex = 0,
  products = [],
  onProductClick
}) {
  const shelfRef = useRef();
  const { camera } = useThree();
  const [hoveredSlot, setHoveredSlot] = useState(null);
  const { width, height, depth } = size;
  const shelfSpacing = height / shelves;
  const slotWidth = width / slotsPerShelf;

  // Raise shelf by 0.8m so bottom shelf is at waist height (~1m from ground)
  // This puts shelves at eye level (1-2.8m high)
  const baseHeight = 0.8;

  // Calculate distance from camera to slot
  const getDistanceToSlot = (slotWorldPosition) => {
    const cameraPos = camera.position;
    const distance = cameraPos.distanceTo(slotWorldPosition);
    return distance;
  };

  // Check if camera is close enough to interact (within 5 meters - increased range)
  const isWithinInteractionRange = (slotWorldPosition) => {
    const distance = getDistanceToSlot(slotWorldPosition);
    return distance <= 5; // Increased from 3 to 5 meters for easier interaction
  };

  // Helper function to parse JSONB vector data (position/scale/rotation)
  const parseModelVector = (vectorData, defaultValue = [0, 0, 0]) => {
    if (!vectorData) return defaultValue;
    return [
      vectorData.x ?? defaultValue[0],
      vectorData.y ?? defaultValue[1],
      vectorData.z ?? defaultValue[2]
    ];
  };

  return (
    <group ref={shelfRef} position={[position[0], position[1] + baseHeight, position[2]]} rotation={rotation}>
      {/* Main shelf frame */}
      {/* Back panel */}
      <mesh position={[0, height / 2, -depth / 2 + 0.01]} castShadow>
        <boxGeometry args={[width, height, 0.02]} />
        <meshPhysicalMaterial
          color="#8B4513" // Dark wood
          roughness={0.75}
          metalness={0.0}
          clearcoat={0.1}
          clearcoatRoughness={0.4}
        />
      </mesh>

      {/* Left side panel */}
      <mesh position={[-width / 2 + 0.01, height / 2, 0]} castShadow>
        <boxGeometry args={[0.02, height, depth]} />
        <meshPhysicalMaterial
          color="#8B4513"
          roughness={0.75}
          metalness={0.0}
          clearcoat={0.1}
          clearcoatRoughness={0.4}
        />
      </mesh>

      {/* Right side panel */}
      <mesh position={[width / 2 - 0.01, height / 2, 0]} castShadow>
        <boxGeometry args={[0.02, height, depth]} />
        <meshPhysicalMaterial
          color="#8B4513"
          roughness={0.75}
          metalness={0.0}
          clearcoat={0.1}
          clearcoatRoughness={0.4}
        />
      </mesh>

      {/* Shelf levels */}
      {Array.from({ length: shelves + 1 }, (_, levelIndex) => (
        <group key={`shelf-${levelIndex}`}>
          {/* Shelf surface */}
          <mesh position={[0, levelIndex * shelfSpacing, 0]} castShadow receiveShadow>
            <boxGeometry args={[width - 0.04, 0.03, depth]} />
            <meshPhysicalMaterial
              color="#D2B48C" // Light wood
              roughness={0.6}
              metalness={0.0}
              clearcoat={0.3}
              clearcoatRoughness={0.2}
            />
          </mesh>

          {/* Only add dividers and slots for shelves (not the top) */}
          {levelIndex < shelves && (
            <>
              {/* Vertical dividers between slots */}
              {Array.from({ length: slotsPerShelf - 1 }, (_, dividerIndex) => (
                <mesh
                  key={`divider-${levelIndex}-${dividerIndex}`}
                  position={[
                    -width / 2 + (dividerIndex + 1) * slotWidth,
                    levelIndex * shelfSpacing + shelfSpacing / 2,
                    0
                  ]}
                  castShadow
                >
                  <boxGeometry args={[0.01, shelfSpacing - 0.06, depth - 0.02]} />
                  <meshPhysicalMaterial
                    color="#A0522D" // Medium wood
                    roughness={0.7}
                    metalness={0.0}
                    clearcoat={0.15}
                    clearcoatRoughness={0.3}
                  />
                </mesh>
              ))}

              {/* Interactive slot hotspots */}
              {Array.from({ length: slotsPerShelf }, (_, slotIdx) => {
                // Find product for this specific shelf unit, level, and slot
                // shelf_unit = which shelf (0-5) 
                // shelf_index = vertical level (0-3)
                // slot_index = horizontal slot (0-5)
                // Note: Products without shelf_unit (null/undefined) will appear on shelf 0 for backwards compatibility
                const product = products.find(
                  p => (p.shelf_unit === shelfIndex || (p.shelf_unit == null && shelfIndex === 0)) && 
                       p.shelf_index === levelIndex && 
                       p.slot_index === slotIdx
                );

                // Debug logging
                if (product && product.model_3d_url) {
                  console.log(`[PerfumeShelf] Found product with 3D model:`, {
                    name: product.name,
                    shelf_unit: shelfIndex,
                    shelf_index: levelIndex,
                    slot_index: slotIdx,
                    model_3d_url: product.model_3d_url
                  });
                }

                const slotPosition = [
                  -width / 2 + slotIdx * slotWidth + slotWidth / 2,
                  levelIndex * shelfSpacing + shelfSpacing / 2,
                  depth / 4
                ];

                // Create world position for distance check
                const slotWorldPos = new THREE.Vector3(
                  position[0] + slotPosition[0],
                  position[1] + baseHeight + slotPosition[1],
                  position[2] + slotPosition[2]
                );

                const slotKey = `${levelIndex}-${slotIdx}`;
                const isHovered = hoveredSlot === slotKey;

                // Product userData for raycast detection (used by CrosshairInteraction)
                const slotUserData = product ? {
                  type: 'perfume_product',
                  productId: product.id,
                  product: product
                } : null;

                return (
                  <group key={`slot-${slotKey}`}>
                    {/* Clickable hotspot - always clickable, distance checked on click */}
                    <mesh
                      position={slotPosition}
                      userData={slotUserData}
                      onClick={(e) => {
                        e.stopPropagation();

                        // Calculate distance at click time (not render time)
                        const currentDistance = getDistanceToSlot(slotWorldPos);
                        const isNearby = currentDistance <= 5;

                        // Only process click if within interaction range
                        if (!isNearby) {
                          return;
                        }

                        if (product && onProductClick) {
                          onProductClick(product);
                        }
                      }}
                      onPointerOver={(e) => {
                        e.stopPropagation();
                        setHoveredSlot(slotKey);

                        // Real-time distance check on hover
                        const currentDistance = getDistanceToSlot(slotWorldPos);
                        const isNearby = currentDistance <= 5;

                        if (product && isNearby) {
                          document.body.style.cursor = 'pointer';
                        } else if (product && !isNearby) {
                          document.body.style.cursor = 'not-allowed';
                        }
                      }}
                      onPointerOut={(e) => {
                        e.stopPropagation();
                        setHoveredSlot(null);
                        document.body.style.cursor = 'default';
                      }}
                    >
                      {/* Precise slot boundaries - exact size of slot area */}
                      <boxGeometry args={[
                        slotWidth - 0.04,  // Slightly smaller than slot for precision
                        shelfSpacing - 0.1, // Leave space for shelf surfaces
                        depth / 2 - 0.04    // Precise depth
                      ]} />
                      <meshBasicMaterial
                        color={
                          product && isHovered ? "#FFD700" :  // Bright gold when hovering over product
                          product ? "#FFA500" :  // Orange if product exists
                          "#87CEEB"  // Blue if empty slot
                        }
                        transparent
                        opacity={
                          isHovered ? 0.3 :   // More visible when hovering
                          product ? 0.15 : 0.05  // Default visibility
                        }
                        wireframe={false}
                      />
                    </mesh>

                    {/* Render product if exists */}
                    {product && (
                      <PerfumeBottle
                        position={[
                          -width / 2 + slotIdx * slotWidth + slotWidth / 2,
                          levelIndex * shelfSpacing + 0.08,
                          depth / 3
                        ]}
                        product={product}
                        onClick={onProductClick}
                        // Support custom positioning for 3D models
                        modelPosition={product.model_position ? [
                          product.model_position.x || 0,
                          product.model_position.y || 0,
                          product.model_position.z || 0
                        ] : [0, 0, 0]}
                        modelScale={product.model_scale ? [
                          product.model_scale.x || 1,
                          product.model_scale.y || 1,
                          product.model_scale.z || 1
                        ] : [1, 1, 1]}
                        modelRotation={product.model_rotation ? [
                          product.model_rotation.x || 0,
                          product.model_rotation.y || 0,
                          product.model_rotation.z || 0
                        ] : [0, 0, 0]}
                      />
                    )}
                  </group>
                );
              })}

              {/* Slot outlines for visual reference */}
              {Array.from({ length: slotsPerShelf }, (_, slotIndex) => (
                <mesh
                  key={`slot-outline-${levelIndex}-${slotIndex}`}
                  position={[
                    -width / 2 + slotIndex * slotWidth + slotWidth / 2,
                    levelIndex * shelfSpacing + 0.02,
                    depth / 4
                  ]}
                >
                  <boxGeometry args={[slotWidth - 0.01, 0.002, depth / 2]} />
                  <meshBasicMaterial 
                    color="#FFD700" // Gold outline
                    transparent
                    opacity={0.3}
                  />
                </mesh>
              ))}
            </>
          )}
        </group>
      ))}

      {/* Decorative elements */}
      {/* Top crown molding */}
      <mesh position={[0, height + 0.05, 0]} castShadow>
        <boxGeometry args={[width + 0.1, 0.1, depth + 0.1]} />
        <meshPhysicalMaterial
          color="#654321" // Dark wood trim
          roughness={0.65}
          metalness={0.0}
          clearcoat={0.2}
          clearcoatRoughness={0.3}
        />
      </mesh>

      {/* Bottom base */}
      <mesh position={[0, -0.05, 0]} castShadow>
        <boxGeometry args={[width + 0.05, 0.1, depth + 0.05]} />
        <meshPhysicalMaterial
          color="#654321"
          roughness={0.65}
          metalness={0.0}
          clearcoat={0.2}
          clearcoatRoughness={0.3}
        />
      </mesh>

      {/* Gold accent strips */}
      <mesh position={[0, height / 2, depth / 2 + 0.005]} castShadow>
        <boxGeometry args={[width, 0.02, 0.01]} />
        <meshPhysicalMaterial
          color="#FFD700" // Gold accent
          roughness={0.15}
          metalness={1.0}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
          reflectivity={1.0}
        />
      </mesh>
    </group>
  );
}