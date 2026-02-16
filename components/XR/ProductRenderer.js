/**
 * ProductRenderer Component
 * Generic component for rendering products within shelf slots
 *
 * Features:
 * - Uses fixed scale (0.5) for 3D models - adjust modelScale if needed
 * - Centers products within their assigned slots
 * - Supports custom 3D models via model_3d_url
 * - Falls back to generic product box when no 3D model
 *
 * Usage:
 * <ProductRenderer
 *   product={productData}
 *   slotDimensions={{ width: 0.3, height: 0.4, depth: 0.2 }}
 *   position={[x, y, z]}
 *   onClick={handleClick}
 * />
 */

import { useRef, useState, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import Model3DLoader from './Model3DLoader';

export default function ProductRenderer({
  product,
  slotDimensions = { width: 0.3, height: 0.4, depth: 0.2 },
  position = [0, 0, 0],
  onClick,
  animated = true,
  centerInSlot = true
}) {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  // Animation state
  const timeRef = useRef(0);
  const rotationOffsetRef = useRef(Math.random() * Math.PI * 2);

  // Animation constants
  const ROTATION_SPEED = 0.3; // Spin speed for Y-axis rotation

  // Model scale constants
  const BASE_MODEL_SCALE = 0.12; // Reduced to fit within slot boundaries
  const HOVER_SCALE_MULTIPLIER = 1.05;

  // Check if product has a custom 3D model
  const hasCustomModel = product?.model_3d_url;

  // Product userData for raycasting
  const productUserData = {
    type: 'product',
    productId: product?.id,
    product: product
  };

  // Animation loop
  useFrame((state, delta) => {
    if (!animated || !groupRef.current) return;

    timeRef.current += delta;

    // Spin rotation around Y-axis (no floating)
    groupRef.current.rotation.y = timeRef.current * ROTATION_SPEED + rotationOffsetRef.current;
  });

  // Fixed scale for 3D models - further reduced to fit within slot boundaries
  const modelScale = BASE_MODEL_SCALE;
  const scale = hovered ? modelScale * HOVER_SCALE_MULTIPLIER : modelScale;

  // Render custom 3D model if available
  if (hasCustomModel) {
    return (
      <group
        ref={groupRef}
        position={position}
        scale={[scale, scale, scale]}
        onClick={(e) => {
          e.stopPropagation();
          if (onClick) onClick(product);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
        userData={productUserData}
      >
        <Suspense fallback={
          <mesh>
            <boxGeometry args={[
              slotDimensions.width * 0.6,
              slotDimensions.height * 0.6,
              slotDimensions.depth * 0.6
            ]} />
            <meshStandardMaterial color="#CCCCCC" />
          </mesh>
        }>
          <Model3DLoader
            url={product.model_3d_url}
            position={[0, 0, 0]}
            scale={[1, 1, 1]}
            castShadow={true}
            receiveShadow={true}
          />
        </Suspense>

        {/* Hover glow effect */}
        {hovered && (
          <pointLight
            position={[0, slotDimensions.height * 0.3, 0]}
            intensity={0.5}
            distance={slotDimensions.width * 2}
            color="#FFD700"
          />
        )}
      </group>
    );
  }

  // Fallback: Render generic product box with product image
  return (
    <GenericProductBox
      product={product}
      slotDimensions={slotDimensions}
      position={position}
      hovered={hovered}
      setHovered={setHovered}
      onClick={onClick}
      productUserData={productUserData}
      animated={animated}
    />
  );
}

/**
 * GenericProductBox
 * Fallback representation for products without custom 3D models
 */
function GenericProductBox({
  product,
  slotDimensions,
  position,
  hovered,
  setHovered,
  onClick,
  productUserData,
  animated
}) {
  const groupRef = useRef();
  const timeRef = useRef(0);
  const rotationOffsetRef = useRef(Math.random() * Math.PI * 2);

  // Animation loop
  useFrame((state, delta) => {
    if (!animated || !groupRef.current) return;
    timeRef.current += delta;
    groupRef.current.rotation.y = timeRef.current * 0.5 + rotationOffsetRef.current;
  });

  // Size the box to fit within slot with margin
  const boxWidth = slotDimensions.width * 0.6;
  const boxHeight = slotDimensions.height * 0.6;
  const boxDepth = slotDimensions.depth * 0.6;

  const scale = hovered ? 1.1 : 1.0;

  return (
    <group
      ref={groupRef}
      position={position}
      scale={[scale, scale, scale]}
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick(product);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
      userData={productUserData}
    >
      {/* Product box */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[boxWidth, boxHeight, boxDepth]} />
        <meshStandardMaterial
          color={hovered ? "#FFD700" : "#FFFFFF"}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>

      {/* Product image on front face - use Suspense for texture loading */}
      {product?.image_url && (
        <Suspense fallback={null}>
          <ProductImage
            imageUrl={product.image_url}
            boxWidth={boxWidth}
            boxHeight={boxHeight}
            boxDepth={boxDepth}
          />
        </Suspense>
      )}

      {/* Product name label */}
      {product?.name && (
        <mesh position={[0, -boxHeight / 2 - 0.02, 0]}>
          <planeGeometry args={[boxWidth, 0.02]} />
          <meshBasicMaterial color="#333333" />
        </mesh>
      )}

      {/* Hover glow */}
      {hovered && (
        <pointLight
          position={[0, boxHeight * 0.3, 0]}
          intensity={0.5}
          distance={boxWidth * 2}
          color="#FFD700"
        />
      )}
    </group>
  );
}

/**
 * ProductImage - Separate component for texture loading to satisfy hook rules
 */
function ProductImage({ imageUrl, boxWidth, boxHeight, boxDepth }) {
  const texture = useTexture(imageUrl);
  
  return (
    <mesh position={[0, 0, boxDepth / 2 + 0.001]}>
      <planeGeometry args={[boxWidth * 0.8, boxHeight * 0.8]} />
      <meshStandardMaterial
        map={texture}
        transparent
        opacity={0.95}
      />
    </mesh>
  );
}

/**
 * Calculate slot dimensions from shelf configuration
 * Helper function for components using ProductRenderer
 */
export function calculateSlotDimensions(shelfConfig) {
  const {
    width = 2,
    height = 1.8,
    depth = 0.4,
    shelves = 4,
    slotsPerShelf = 6
  } = shelfConfig;

  const shelfSpacing = height / shelves;
  const slotWidth = width / slotsPerShelf;

  return {
    width: slotWidth - 0.04, // Leave small gap between slots
    height: shelfSpacing - 0.1, // Leave space for shelf surfaces
    depth: depth / 2 - 0.04 // Use half depth for products
  };
}
