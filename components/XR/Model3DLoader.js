/**
 * Generic 3D Model Loader Component
 * Loads GLTF/GLB models from URLs and displays them in 3D space
 *
 * Supports:
 * - GLTF/GLB format (industry standard)
 * - Auto-scaling and positioning
 * - Auto-fit to container bounds
 * - Color overrides
 * - Shadow casting and receiving
 * - Collision bounds
 *
 * Usage:
 * <Model3DLoader
 *   url="/models/pharmacy-counter.glb"
 *   position={[0, 0, 0]}
 *   rotation={[0, 0, 0]}
 *   scale={[1, 1, 1]}
 *   color="#B0B0B0"
 *   autoFit={true}
 *   maxSize={0.3}
 * />
 */

import { useGLTF } from '@react-three/drei';
import { useMemo, Suspense } from 'react';
import * as THREE from 'three';

// Module-level Set to track logged URLs (prevents duplicate logs across instances)
const loggedUrls = new Set();

function Model3DContent({
  url,
  position,
  rotation,
  scale,
  color,
  castShadow,
  receiveShadow,
  metalness,
  roughness,
  autoFit,
  maxSize,
  userData
}) {
  // Load the GLTF/GLB model - hooks must be called unconditionally
  const { scene } = useGLTF(url);

  // Clone and configure the scene once, with optional auto-fit scaling
  const { configuredScene, autoFitScale, centerOffset } = useMemo(() => {
    if (!scene) {
      return { configuredScene: null, autoFitScale: 1, centerOffset: [0, 0, 0] };
    }

    // Log successful load once per URL in development
    if (!loggedUrls.has(url) && process.env.NODE_ENV === 'development') {
      console.log(`[Model3DLoader] Successfully loaded model: ${url}`);
      loggedUrls.add(url);
    }

    // Shallow clone is sufficient for most cases and more performant
    const clonedScene = scene.clone();

    // Calculate auto-fit scale and centering offset if enabled
    let calculatedAutoFitScale = 1;
    let calculatedCenterOffset = [0, 0, 0];
    
    if (autoFit) {
      // Compute bounding box of the model
      const box = new THREE.Box3().setFromObject(clonedScene);
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(size);
      box.getCenter(center);
      
      // Find the largest dimension
      const maxDimension = Math.max(size.x, size.y, size.z);
      
      // Scale to fit within maxSize
      if (maxDimension > 0) {
        calculatedAutoFitScale = maxSize / maxDimension;
      }
      
      // Calculate offset to center model on X/Z and place bottom at Y=0
      // After scaling, the center and min Y will be at scaled positions
      const scaledMinY = box.min.y * calculatedAutoFitScale;
      calculatedCenterOffset = [
        -center.x * calculatedAutoFitScale,  // Center on X
        -scaledMinY,                          // Place bottom at Y=0
        -center.z * calculatedAutoFitScale   // Center on Z
      ];
    }

    // Apply userData to ALL objects for proper raycast parent traversal
    clonedScene.traverse((child) => {
      // Apply userData to all objects (not just meshes) for raycasting
      if (userData) {
        child.userData = { ...child.userData, ...userData };
      }

      // Apply shadows and material overrides only to meshes
      if (child.isMesh) {
        child.castShadow = castShadow;
        child.receiveShadow = receiveShadow;

        // Apply color override if provided
        if (color && child.material) {
          // Clone material to avoid affecting other instances
          child.material = child.material.clone();
          child.material.color = new THREE.Color(color);

          // Update material properties
          if (child.material.metalness !== undefined) {
            child.material.metalness = metalness;
          }
          if (child.material.roughness !== undefined) {
            child.material.roughness = roughness;
          }
        }
      }
    });

    // Also set userData on the root scene for hierarchy traversal
    if (userData) {
      clonedScene.userData = { ...clonedScene.userData, ...userData };
    }

    return { configuredScene: clonedScene, autoFitScale: calculatedAutoFitScale, centerOffset: calculatedCenterOffset };
  }, [scene, color, castShadow, receiveShadow, metalness, roughness, url, autoFit, maxSize, userData]);

  if (!configuredScene) {
    // This is expected during initial load - Suspense will handle the loading state
    return null;
  }

  // Apply auto-fit scale to the existing scale
  const finalScale = autoFit 
    ? scale.map(s => s * autoFitScale)
    : scale;

  // Apply center offset to position when autoFit is enabled
  const finalPosition = autoFit
    ? [
        position[0] + centerOffset[0],
        position[1] + centerOffset[1],
        position[2] + centerOffset[2]
      ]
    : position;

  return (
    <primitive
      object={configuredScene}
      position={finalPosition}
      rotation={rotation}
      scale={finalScale}
    />
  );
}

// Fallback placeholder while loading or on error
const Placeholder = ({ position, rotation, userData }) => (
  <mesh position={position} rotation={rotation} userData={userData}>
    <boxGeometry args={[0.05, 0.05, 0.05]} />
    <meshStandardMaterial color="#CCCCCC" opacity={0.3} transparent />
  </mesh>
);

export default function Model3DLoader({
  url,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  color = null,
  castShadow = true,
  receiveShadow = true,
  metalness = 0.5,
  roughness = 0.5,
  autoFit = false,
  maxSize = 0.3,
  userData = null
}) {

  return (
    <Suspense fallback={<Placeholder position={position} rotation={rotation} userData={userData} />}>
      <Model3DContent
        url={url}
        position={position}
        rotation={rotation}
        scale={scale}
        color={color}
        castShadow={castShadow}
        receiveShadow={receiveShadow}
        metalness={metalness}
        roughness={roughness}
        autoFit={autoFit}
        maxSize={maxSize}
        userData={userData}
      />
    </Suspense>
  );
}

/**
 * Preload models to improve performance
 * Call this at app startup with commonly used models
 */
export function preloadModels(urls) {
  urls.forEach(url => {
    useGLTF.preload(url);
  });
}
