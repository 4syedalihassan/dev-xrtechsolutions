/**
 * Pharmacy Counter Component
 * Can render either:
 * 1. A real 3D model (if modelUrl is provided)
 * 2. A fallback geometric representation
 *
 * This dual approach allows gradual migration to real models
 */

import Model3DLoader from './Model3DLoader';

export default function PharmacyCounter({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  color = '#B0B0B0', // Aluminum silver
  modelUrl = null, // Optional: path to GLTF/GLB model
  useModel = false  // Toggle to use 3D model vs geometric fallback
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
        metalness={0.7}  // More metallic for aluminum
        roughness={0.3}  // Somewhat shiny
      />
    );
  }

  // Fallback: Geometric representation (current approach)
  const [scaleX, scaleY, scaleZ] = scale;
  const width = 3.0 * scaleX;
  const height = 1.1 * scaleY;
  const depth = 1.0 * scaleZ;

  return (
    <group position={position} rotation={rotation}>
      {/* Main Counter Body - Aluminum */}
      <mesh position={[0, height / 2, 0]} castShadow>
        <boxGeometry args={[width, height * 0.9, depth]} />
        <meshStandardMaterial
          color={color}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* Glass Top */}
      <mesh position={[0, height - 0.02, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, 0.04, depth]} />
        <meshStandardMaterial
          color="#FFFFFF"
          transparent={true}
          opacity={0.3}
          metalness={0.1}
          roughness={0.1}
        />
      </mesh>

      {/* Counter Front Panel */}
      <mesh position={[0, height / 2, depth / 2 - 0.02]} castShadow>
        <planeGeometry args={[width - 0.1, height * 0.85]} />
        <meshStandardMaterial
          color={color}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* Drawer Sections */}
      {[-width / 3, 0, width / 3].map((xPos, i) => (
        <group key={i}>
          {/* Drawer Front */}
          <mesh position={[xPos, height * 0.3, depth / 2 - 0.01]} castShadow>
            <planeGeometry args={[width / 4, height * 0.25]} />
            <meshStandardMaterial
              color="#E0E0E0"
              metalness={0.5}
              roughness={0.4}
            />
          </mesh>

          {/* Drawer Handle */}
          <mesh position={[xPos, height * 0.3, depth / 2 + 0.02]}>
            <boxGeometry args={[width / 5, 0.02, 0.03]} />
            <meshStandardMaterial
              color="#C0C0C0"
              metalness={0.9}
              roughness={0.2}
            />
          </mesh>
        </group>
      ))}

      {/* Toe Kick */}
      <mesh position={[0, 0.05, depth / 2 - 0.05]}>
        <boxGeometry args={[width, 0.1, 0.1]} />
        <meshStandardMaterial
          color="#808080"
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>

      {/* Side Panels */}
      <mesh position={[-width / 2 + 0.01, height / 2, 0]} castShadow>
        <boxGeometry args={[0.02, height * 0.9, depth]} />
        <meshStandardMaterial
          color={color}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      <mesh position={[width / 2 - 0.01, height / 2, 0]} castShadow>
        <boxGeometry args={[0.02, height * 0.9, depth]} />
        <meshStandardMaterial
          color={color}
          metalness={0.7}
          roughness={0.3}
        />
      </mesh>

      {/* Invisible Collision Box for Camera Blocking */}
      <mesh position={[0, height / 2, 0]} visible={false}>
        <boxGeometry args={[width + 0.3, height + 0.2, depth + 0.3]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
}
