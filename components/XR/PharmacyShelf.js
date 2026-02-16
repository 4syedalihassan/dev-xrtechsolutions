/**
 * Pharmacy Shelf Component
 * Medical-grade shelving for pharmaceutical storage
 *
 * Can render either:
 * 1. A real 3D model (if modelUrl is provided)
 * 2. A fallback geometric representation with product slots
 * 
 * Now supports systematic product rendering with proper slot containment
 */

import { useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import Model3DLoader from './Model3DLoader';
import ProductRenderer, { calculateSlotDimensions } from './ProductRenderer';

export default function PharmacyShelf({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  color = '#FFFFFF', // Clean white
  modelUrl = null,
  useModel = false,
  shelfLevels = 5,
  slotsPerShelf = 4,
  products = [], // Array of products to display
  onProductClick // Callback for product clicks
}) {

  // If model URL is provided and useModel is true, use the 3D model loader
  if (useModel && modelUrl) {
    return (
      <Model3DLoader
        url={modelUrl}
        position={position}
        rotation={rotation}
        scale={scale}
        color={color}
        metalness={0.4}
        roughness={0.6}
      />
    );
  }

  // Fallback: Geometric representation with product slots
  const [scaleX, scaleY, scaleZ] = scale;
  const width = 2.5 * scaleX;
  const height = 2.2 * scaleY;
  const depth = 0.5 * scaleZ;
  const shelfThickness = 0.04;
  const shelfSpacing = height / (shelfLevels + 1);
  const slotWidth = width / slotsPerShelf;
  
  const shelfRef = useRef();
  const { camera } = useThree();
  const [hoveredSlot, setHoveredSlot] = useState(null);
  
  // Calculate slot dimensions for ProductRenderer
  const slotDimensions = calculateSlotDimensions({
    width,
    height,
    depth,
    shelves: shelfLevels,
    slotsPerShelf
  });

  // Helper to get distance from camera to slot
  const getDistanceToSlot = (slotWorldPosition) => {
    if (!camera) return Infinity;
    const cameraPos = camera.position;
    return cameraPos.distanceTo(slotWorldPosition);
  };

  return (
    <group ref={shelfRef} position={position} rotation={rotation}>
      {/* Back Panel */}
      <mesh position={[0, height / 2, -depth / 2 + 0.01]} castShadow receiveShadow>
        <boxGeometry args={[width, height, 0.02]} />
        <meshStandardMaterial
          color={color}
          metalness={0.4}
          roughness={0.6}
        />
      </mesh>

      {/* Left Side Panel */}
      <mesh position={[-width / 2 + 0.01, height / 2, 0]} castShadow>
        <boxGeometry args={[0.02, height, depth]} />
        <meshStandardMaterial
          color={color}
          metalness={0.4}
          roughness={0.6}
        />
      </mesh>

      {/* Right Side Panel */}
      <mesh position={[width / 2 - 0.01, height / 2, 0]} castShadow>
        <boxGeometry args={[0.02, height, depth]} />
        <meshStandardMaterial
          color={color}
          metalness={0.4}
          roughness={0.6}
        />
      </mesh>

      {/* Shelves with product slots */}
      {Array.from({ length: shelfLevels }, (_, i) => {
        const yPos = shelfSpacing * (i + 1) - height / 2 + shelfThickness / 2;
        return (
          <group key={`shelf-level-${i}`}>
            {/* Shelf surface */}
            <mesh
              position={[0, yPos, 0]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[width - 0.04, shelfThickness, depth - 0.02]} />
              <meshStandardMaterial
                color={color}
                metalness={0.4}
                roughness={0.6}
              />
            </mesh>
            
            {/* Product slots for this shelf level */}
            {Array.from({ length: slotsPerShelf }, (_, slotIdx) => {
              // Find product for this shelf level and slot
              const product = products.find(
                p => Number(p.shelf_index) === i &&
                     Number(p.slot_index) === slotIdx
              );

              const slotPosition = [
                -width / 2 + slotIdx * slotWidth + slotWidth / 2,
                yPos + shelfThickness / 2 + slotDimensions.height / 2,
                0
              ];

              // Create world position for distance check
              const slotWorldPos = new THREE.Vector3(
                position[0] + slotPosition[0],
                position[1] + slotPosition[1],
                position[2] + slotPosition[2]
              );

              const slotKey = `pharmacy-shelf-${i}-${slotIdx}`;
              const isHovered = hoveredSlot === slotKey;

              return (
                <group key={slotKey}>
                  {/* Clickable hotspot for interaction */}
                  <mesh
                    position={slotPosition}
                    onClick={(e) => {
                      e.stopPropagation();
                      const currentDistance = getDistanceToSlot(slotWorldPos);
                      const isNearby = currentDistance <= 5;
                      
                      if (!isNearby) return;
                      
                      if (product && onProductClick) {
                        onProductClick(product);
                      }
                    }}
                    onPointerOver={(e) => {
                      e.stopPropagation();
                      setHoveredSlot(slotKey);
                      
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
                    {/* Slot boundaries */}
                    <boxGeometry args={[
                      slotWidth - 0.04,
                      slotDimensions.height,
                      depth / 2 - 0.04
                    ]} />
                    <meshBasicMaterial
                      color={
                        product && isHovered ? "#FFD700" :
                        product ? "#90EE90" :
                        "#E0E0E0"
                      }
                      transparent
                      opacity={
                        isHovered ? 0.3 :
                        product ? 0.15 : 0.05
                      }
                    />
                  </mesh>

                  {/* Render product if assigned to this slot */}
                  {product && (
                    <ProductRenderer
                      product={product}
                      slotDimensions={slotDimensions}
                      position={slotPosition}
                      onClick={onProductClick}
                      animated={true}
                      centerInSlot={true}
                    />
                  )}
                </group>
              );
            })}
          </group>
        );
      })}

      {/* Top Panel */}
      <mesh position={[0, height - shelfThickness / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, shelfThickness, depth]} />
        <meshStandardMaterial
          color={color}
          metalness={0.4}
          roughness={0.6}
        />
      </mesh>

      {/* Bottom Panel */}
      <mesh position={[0, 0 + shelfThickness / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, shelfThickness, depth]} />
        <meshStandardMaterial
          color={color}
          metalness={0.4}
          roughness={0.6}
        />
      </mesh>

      {/* Shelf Supports (vertical metal bars) */}
      {Array.from({ length: 3 }, (_, i) => {
        const xPos = (i - 1) * (width / 3);
        return (
          <mesh
            key={`support-${i}`}
            position={[xPos, height / 2, -depth / 2 + 0.02]}
            castShadow
          >
            <cylinderGeometry args={[0.01, 0.01, height - 0.1, 8]} />
            <meshStandardMaterial
              color="#D3D3D3"
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
        );
      })}
    </group>
  );
}
