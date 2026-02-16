import { useRef, useState, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei'; // Kept for other potential uses or verify removal if unused
import * as THREE from 'three';
import Model3DLoader from './Model3DLoader';

/**
 * PerfumeBottle - Realistic perfume bottle with varied shapes and product images
 *
 * Features:
 * - Custom 3D model support (priority if model_3d_url exists)
 * - Multiple bottle shapes (rectangular, cylindrical, round, fancy)
 * - Product images wrapped as labels
 * - Realistic glass with transmission and refraction
 * - Colored liquid inside with glow effect
 * - Metallic caps with brand-specific colors
 * - Hover effects and animations
 */
export default function PerfumeBottle({
  position = [0, 0, 0],
  product,
  onClick,
  animated = true,  // Enable/disable animations for performance control
  modelPosition = [0, 0, 0],  // Fine-tune position offset for 3D models
  modelScale = [1, 1, 1],     // Fine-tune scale for 3D models
  modelRotation = [0, 0, 0]   // Fine-tune rotation for 3D models
}) {
  const groupRef = useRef();
  const meshRef = useRef();
  const liquidRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Animation state
  const timeRef = useRef(0);
  const rotationOffsetRef = useRef(Math.random() * Math.PI * 2);

  // Animation constants
  const ROTATION_SPEED = 0.3; // Spin speed for Y-axis rotation

  // Model scale constants - consistent size for all 3D models on shelves
  // JS bottles have dimensions ~0.12-0.18 units tall
  // Custom models are auto-fit to MODEL_MAX_SIZE, then multiplied by PERFUME_BOTTLE_SCALE
  // To match JS bottle size: MODEL_MAX_SIZE * PERFUME_BOTTLE_SCALE ≈ 0.18
  const PERFUME_BOTTLE_SCALE = 0.15;
  const MODEL_MAX_SIZE = 1.2; // Results in ~0.18 final size to match JS bottles

  // Determine bottle shape based on product category or brand
  const getBottleShape = (product) => {
    const brand = product?.brand?.toLowerCase() || '';
    const category = product?.category?.toLowerCase() || '';

    // Shape patterns by brand/category
    if (brand.includes('chanel') || brand.includes('dior')) return 'rectangular';
    if (brand.includes('gucci') || brand.includes('versace')) return 'round';
    if (brand.includes('tom ford') || brand.includes('creed')) return 'fancy';
    if (category.includes('cologne') || category.includes('eau')) return 'cylindrical';

    // Random distribution for variety
    const shapes = ['rectangular', 'cylindrical', 'round', 'fancy'];
    const hash = (product?.id || Math.random()).toString().split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return shapes[Math.abs(hash) % shapes.length];
  };

  // Get dimensions based on bottle shape
  const getBottleDimensions = (shape) => {
    const baseScale = 1.0;
    switch (shape) {
      case 'rectangular':
        return {
          height: 0.12 * baseScale,
          width: 0.04 * baseScale,
          depth: 0.025 * baseScale,
          neckHeight: 0.03 * baseScale,
          neckRadius: 0.012 * baseScale,
          capHeight: 0.02 * baseScale,
          capRadius: 0.015 * baseScale
        };
      case 'cylindrical':
        return {
          height: 0.14 * baseScale,
          radius: 0.025 * baseScale,
          neckHeight: 0.025 * baseScale,
          neckRadius: 0.01 * baseScale,
          capHeight: 0.015 * baseScale,
          capRadius: 0.012 * baseScale
        };
      case 'round':
        return {
          radius: 0.035 * baseScale,
          neckHeight: 0.02 * baseScale,
          neckRadius: 0.01 * baseScale,
          capHeight: 0.015 * baseScale,
          capRadius: 0.012 * baseScale
        };
      case 'fancy':
        return {
          height: 0.10 * baseScale,
          topRadius: 0.02 * baseScale,
          bottomRadius: 0.03 * baseScale,
          neckHeight: 0.035 * baseScale,
          neckRadius: 0.008 * baseScale,
          capHeight: 0.025 * baseScale,
          capRadius: 0.015 * baseScale
        };
      default:
        return getBottleDimensions('rectangular');
    }
  };

  // Color based on brand/category
  const getBottleColor = (brand) => {
    const brandLower = (brand || '').toLowerCase();
    const colorMap = {
      'chanel': '#FFD700',
      'dior': '#4169E1',
      'gucci': '#32CD32',
      'tom ford': '#8B0000',
      'ysl': '#FF1493',
      'versace': '#FFD700',
      'giorgio armani': '#00CED1',
      'd&g': '#87CEEB',
      'burberry': '#DEB887',
      'paco rabanne': '#C0C0C0',
      'calvin klein': '#98FB98',
      'hugo boss': '#2F4F4F',
      'marc jacobs': '#FFB6C1',
      'viktor & rolf': '#FF69B4',
      'lancôme': '#FFC0CB',
      'jo malone': '#F5F5DC',
      'creed': '#DAA520',
      'hermès': '#FF8C00'
    };

    for (const [key, color] of Object.entries(colorMap)) {
      if (brandLower.includes(key)) return color;
    }
    return '#87CEEB'; // Default sky blue
  };

  const bottleShape = getBottleShape(product);
  const dimensions = getBottleDimensions(bottleShape);
  const liquidColor = getBottleColor(product?.brand);
  const scale = hovered ? 1.1 : 1.0;

  // Load product image as texture for label
  const [labelTexture, setLabelTexture] = useState(null);

  useEffect(() => {
    if (product?.image) {
      const loader = new THREE.TextureLoader();
      loader.load(
        product.image,
        (texture) => setLabelTexture(texture),
        undefined,
        (err) => console.warn(`Failed to load texture for ${product.name}:`, err)
      );
    } else {
      setLabelTexture(null);
    }
  }, [product?.image, product?.name]);

  // Product userData for raycasting
  const productUserData = {
    type: 'perfume_product',
    productId: product?.id,
    product: product
  };

  // Check if product has a custom 3D model
  const hasCustomModel = product?.model_3d_url && product.model_3d_url.trim() !== '';

  // Animation loop - runs every frame
  useFrame((state, delta) => {
    if (!animated || !groupRef.current) return;

    timeRef.current += delta;

    // Spin rotation around Y-axis (no floating)
    groupRef.current.rotation.y = timeRef.current * ROTATION_SPEED + rotationOffsetRef.current;

    // PULSING GLOW - Liquid emissive intensity (only for procedural bottles)
    // Pulse between 0.1 and 0.4 intensity
    // Pulse speed: 1 cycle per 2 seconds
    if (!hasCustomModel && liquidRef.current && liquidRef.current.material) {
      const pulseSpeed = 3.0; // radians per second
      const minIntensity = 0.1;
      const maxIntensity = 0.4;
      const pulseIntensity = minIntensity + (Math.sin(timeRef.current * pulseSpeed) + 1) * 0.5 * (maxIntensity - minIntensity);

      liquidRef.current.material.emissive = new THREE.Color(liquidColor);
      liquidRef.current.material.emissiveIntensity = pulseIntensity;
    }
  });

  // If product has a custom 3D model, render it instead of generic bottles
  if (hasCustomModel) {
    return (
      <group
        ref={groupRef}
        position={position}
        scale={[scale * PERFUME_BOTTLE_SCALE, scale * PERFUME_BOTTLE_SCALE, scale * PERFUME_BOTTLE_SCALE]}
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
          <mesh userData={productUserData}>
            <boxGeometry args={[0.04, 0.12, 0.025]} />
            <meshStandardMaterial color="#CCCCCC" />
          </mesh>
        }>
          <Model3DLoader
            url={product.model_3d_url}
            position={modelPosition}
            scale={modelScale}
            rotation={modelRotation}
            castShadow={true}
            receiveShadow={true}
            autoFit={true}
            maxSize={MODEL_MAX_SIZE}
            userData={productUserData}
          />
        </Suspense>

        {/* Hover glow effect */}
        {hovered && (
          <pointLight
            position={[0, 0.06, 0]}
            intensity={0.5}
            distance={0.3}
            color="#FFD700"
          />
        )}
      </group>
    );
  }

  // Render bottle based on shape
  const renderBottle = () => {
    switch (bottleShape) {
      case 'rectangular':
        return renderRectangularBottle();
      case 'cylindrical':
        return renderCylindricalBottle();
      case 'round':
        return renderRoundBottle();
      case 'fancy':
        return renderFancyBottle();
      default:
        return renderRectangularBottle();
    }
  };

  // Realistic glass material
  const glassMaterial = (
    <meshPhysicalMaterial
      color="#ffffff"
      transparent
      opacity={0.1}
      roughness={0.0}
      metalness={0.0}
      transmission={0.98}
      thickness={0.5}
      ior={1.52}
      reflectivity={0.5}
      clearcoat={1.0}
      clearcoatRoughness={0.0}
    />
  );

  // Liquid material
  const createLiquidMaterial = () => (
    <meshPhysicalMaterial
      color={liquidColor}
      transparent
      opacity={0.85}
      roughness={0.05}
      metalness={0.0}
      transmission={0.3}
      ior={1.33}
      reflectivity={0.3}
      emissive={liquidColor}
      emissiveIntensity={0.2}
    />
  );

  // Label material with product image
  const createLabelMaterial = () => {
    if (labelTexture) {
      return (
        <meshStandardMaterial
          map={labelTexture}
          transparent
          opacity={0.95}
          roughness={0.3}
          metalness={0.1}
        />
      );
    } else {
      // Fallback label with brand name
      return (
        <meshStandardMaterial
          color="#ffffff"
          opacity={0.9}
          transparent
          roughness={0.4}
        />
      );
    }
  };

  // Rectangular bottle (Chanel No.5 style)
  const renderRectangularBottle = () => {
    const { height, width, depth, neckHeight, neckRadius, capHeight, capRadius } = dimensions;

    return (
      <>
        {/* Main bottle body - glass */}
        <mesh
          ref={meshRef}
          position={[0, height / 2, 0]}
          castShadow
          receiveShadow
          userData={productUserData}
        >
          <boxGeometry args={[width, height, depth]} />
          {glassMaterial}
        </mesh>

        {/* Liquid inside */}
        <mesh
          ref={liquidRef}
          position={[0, height / 2.5, 0]}
          castShadow
          userData={productUserData}
        >
          <boxGeometry args={[width * 0.88, height * 0.75, depth * 0.88]} />
          {createLiquidMaterial()}
        </mesh>

        {/* Bottle neck */}
        <mesh
          position={[0, height + neckHeight / 2, 0]}
          castShadow
          receiveShadow
          userData={productUserData}
        >
          <cylinderGeometry args={[neckRadius, neckRadius * 1.2, neckHeight, 16]} />
          {glassMaterial}
        </mesh>

        {/* Cap */}
        <mesh
          position={[0, height + neckHeight + capHeight / 2, 0]}
          castShadow
          userData={productUserData}
        >
          <cylinderGeometry args={[capRadius, capRadius * 0.9, capHeight, 16]} />
          <meshStandardMaterial
            color={liquidColor}
            roughness={0.2}
            metalness={0.9}
          />
        </mesh>

        {/* Label wrapped around bottle */}
        <mesh
          position={[0, height / 2, depth / 2 + 0.001]}
          userData={productUserData}
        >
          <planeGeometry args={[width * 0.8, height * 0.4]} />
          {createLabelMaterial()}
        </mesh>
      </>
    );
  };

  // Cylindrical bottle (Classic cologne style)
  const renderCylindricalBottle = () => {
    const { height, radius, neckHeight, neckRadius, capHeight, capRadius } = dimensions;

    return (
      <>
        {/* Main bottle body - glass cylinder */}
        <mesh
          ref={meshRef}
          position={[0, height / 2, 0]}
          castShadow
          receiveShadow
          userData={productUserData}
        >
          <cylinderGeometry args={[radius, radius, height, 32]} />
          {glassMaterial}
        </mesh>

        {/* Liquid inside */}
        <mesh
          ref={liquidRef}
          position={[0, height / 2.8, 0]}
          castShadow
          userData={productUserData}
        >
          <cylinderGeometry args={[radius * 0.9, radius * 0.9, height * 0.7, 32]} />
          {createLiquidMaterial()}
        </mesh>

        {/* Neck */}
        <mesh
          position={[0, height + neckHeight / 2, 0]}
          castShadow
          userData={productUserData}
        >
          <cylinderGeometry args={[neckRadius, neckRadius, neckHeight, 16]} />
          {glassMaterial}
        </mesh>

        {/* Cap */}
        <mesh
          position={[0, height + neckHeight + capHeight / 2, 0]}
          castShadow
          userData={productUserData}
        >
          <cylinderGeometry args={[capRadius, capRadius * 0.85, capHeight, 16]} />
          <meshStandardMaterial
            color={liquidColor}
            roughness={0.15}
            metalness={0.95}
          />
        </mesh>

        {/* Cylindrical label wrapped around */}
        <mesh
          position={[0, height / 2, 0]}
          rotation={[0, 0, 0]}
          userData={productUserData}
        >
          <cylinderGeometry args={[radius + 0.001, radius + 0.001, height * 0.5, 32, 1, true]} />
          {createLabelMaterial()}
        </mesh>
      </>
    );
  };

  // Round bottle (Sphere/orb style)
  const renderRoundBottle = () => {
    const { radius, neckHeight, neckRadius, capHeight, capRadius } = dimensions;

    return (
      <>
        {/* Main bottle body - glass sphere */}
        <mesh
          ref={meshRef}
          position={[0, radius, 0]}
          castShadow
          receiveShadow
          userData={productUserData}
        >
          <sphereGeometry args={[radius, 32, 32]} />
          {glassMaterial}
        </mesh>

        {/* Liquid inside */}
        <mesh
          ref={liquidRef}
          position={[0, radius * 0.85, 0]}
          castShadow
          userData={productUserData}
        >
          <sphereGeometry args={[radius * 0.85, 32, 32]} />
          {createLiquidMaterial()}
        </mesh>

        {/* Neck */}
        <mesh
          position={[0, radius * 2 + neckHeight / 2, 0]}
          castShadow
          userData={productUserData}
        >
          <cylinderGeometry args={[neckRadius, neckRadius, neckHeight, 16]} />
          {glassMaterial}
        </mesh>

        {/* Cap */}
        <mesh
          position={[0, radius * 2 + neckHeight + capHeight / 2, 0]}
          castShadow
          userData={productUserData}
        >
          <sphereGeometry args={[capRadius, 16, 16]} />
          <meshStandardMaterial
            color={liquidColor}
            roughness={0.1}
            metalness={1.0}
          />
        </mesh>

        {/* Spherical label */}
        <mesh
          position={[0, radius, 0]}
          userData={productUserData}
        >
          <sphereGeometry args={[radius + 0.001, 32, 32, 0, Math.PI, 0, Math.PI / 2]} />
          {createLabelMaterial()}
        </mesh>
      </>
    );
  };

  // Fancy bottle (Tapered designer style)
  const renderFancyBottle = () => {
    const { height, topRadius, bottomRadius, neckHeight, neckRadius, capHeight, capRadius } = dimensions;

    return (
      <>
        {/* Main bottle body - tapered glass */}
        <mesh
          ref={meshRef}
          position={[0, height / 2, 0]}
          castShadow
          receiveShadow
          userData={productUserData}
        >
          <cylinderGeometry args={[topRadius, bottomRadius, height, 32]} />
          {glassMaterial}
        </mesh>

        {/* Liquid inside */}
        <mesh
          ref={liquidRef}
          position={[0, height / 3, 0]}
          castShadow
          userData={productUserData}
        >
          <cylinderGeometry args={[topRadius * 0.85, bottomRadius * 0.85, height * 0.65, 32]} />
          {createLiquidMaterial()}
        </mesh>

        {/* Elegant neck */}
        <mesh
          position={[0, height + neckHeight / 2, 0]}
          castShadow
          userData={productUserData}
        >
          <cylinderGeometry args={[neckRadius, topRadius * 0.9, neckHeight, 16]} />
          {glassMaterial}
        </mesh>

        {/* Designer cap */}
        <mesh
          position={[0, height + neckHeight + capHeight / 2, 0]}
          castShadow
          userData={productUserData}
        >
          <cylinderGeometry args={[capRadius, capRadius * 1.1, capHeight, 6]} />
          <meshStandardMaterial
            color={liquidColor}
            roughness={0.15}
            metalness={0.95}
          />
        </mesh>

        {/* Wrap label around tapered body */}
        <mesh
          position={[0, height / 2, 0]}
          userData={productUserData}
        >
          <cylinderGeometry args={[(topRadius + bottomRadius) / 2 + 0.001, (topRadius + bottomRadius) / 2 + 0.001, height * 0.6, 32, 1, true]} />
          {createLabelMaterial()}
        </mesh>
      </>
    );
  };

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
      {renderBottle()}

      {/* Hover glow effect */}
      {hovered && (
        <pointLight
          position={[0, 0.08, 0]}
          intensity={0.6}
          distance={0.4}
          color={liquidColor}
        />
      )}
    </group>
  );
}
