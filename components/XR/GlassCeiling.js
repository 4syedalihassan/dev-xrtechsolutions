import { useMemo } from 'react';
import * as THREE from 'three';

/**
 * GlassCeiling - Realistic glass ceiling with PBR materials
 *
 * Features:
 * - MeshPhysicalMaterial for realistic glass
 * - Proper transparency and refraction
 * - Environmental reflections
 * - Metallic framework grid
 *
 * PBR Glass Properties:
 * - Transmission: 0.9 (90% light passes through)
 * - Roughness: 0.05 (very smooth/glossy)
 * - IOR: 1.52 (standard glass index of refraction)
 * - Clearcoat: Glossy top layer
 */
export default function GlassCeiling({ size = 20, height = 5, blockSize = 2 }) {
  // Create grid of glass blocks
  const glassBlocks = useMemo(() => {
    const blocks = [];
    const blocksPerSide = Math.floor(size / blockSize);
    const startPos = -(blocksPerSide * blockSize) / 2 + blockSize / 2;

    for (let x = 0; x < blocksPerSide; x++) {
      for (let z = 0; z < blocksPerSide; z++) {
        blocks.push({
          position: [
            startPos + x * blockSize,
            height,
            startPos + z * blockSize
          ],
          key: `glass-${x}-${z}`
        });
      }
    }
    return blocks;
  }, [size, height, blockSize]);

  return (
    <group>
      {glassBlocks.map((block) => (
        <mesh
          key={block.key}
          position={block.position}
          receiveShadow
          castShadow
        >
          {/* Slightly smaller than blockSize to create grid lines */}
          <boxGeometry args={[blockSize - 0.1, 0.2, blockSize - 0.1]} />
          {/* Realistic Glass Material with PBR */}
          <meshPhysicalMaterial
            color="#ffffff"
            metalness={0.0}
            roughness={0.05}
            transmission={0.9}  // 90% light transmission (realistic glass)
            thickness={0.5}
            envMapIntensity={0.8}
            ior={1.52}  // Index of refraction for glass
            clearcoat={1.0}
            clearcoatRoughness={0.03}
            transparent={true}
            opacity={0.3}  // For browser compatibility
          />
        </mesh>
      ))}

      {/* Minimal grid framework - very thin, subtle metal lines */}
      {/* Horizontal grid lines - much thinner */}
      {Array.from({ length: Math.floor(size / blockSize) + 1 }, (_, i) => (
        <mesh
          key={`h-grid-${i}`}
          position={[
            -(Math.floor(size / blockSize) * blockSize) / 2 + i * blockSize,
            height - 0.05,
            0
          ]}
        >
          <boxGeometry args={[0.02, 0.08, size]} />
          {/* Very subtle metallic frame */}
          <meshStandardMaterial
            color="#cccccc"
            metalness={0.6}
            roughness={0.4}
            transparent={true}
            opacity={0.3}
          />
        </mesh>
      ))}

      {/* Vertical grid lines - much thinner */}
      {Array.from({ length: Math.floor(size / blockSize) + 1 }, (_, i) => (
        <mesh
          key={`v-grid-${i}`}
          position={[
            0,
            height - 0.05,
            -(Math.floor(size / blockSize) * blockSize) / 2 + i * blockSize
          ]}
        >
          <boxGeometry args={[size, 0.08, 0.02]} />
          {/* Very subtle metallic frame */}
          <meshStandardMaterial
            color="#cccccc"
            metalness={0.6}
            roughness={0.4}
            transparent={true}
            opacity={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}