import { useRef, useMemo, useState } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

/**
 * RoadGround - Enhanced ground/floor component with PBR material support
 *
 * Features:
 * - PBR texture loading from /public/textures/floor/
 * - Fallback to procedural Minecraft-style stone texture
 * - Normal maps for surface detail
 * - Displacement maps for subtle height variation
 * - Roughness maps for realistic lighting
 *
 * PBR Textures:
 * - Download from Poly Haven (https://polyhaven.com/textures)
 * - Place in /public/textures/floor/
 * - See /public/textures/README.md for details
 *
 * Recommended texture sets:
 * - tiles_brown_02 (ceramic tiles)
 * - concrete_floor_worn_001 (concrete)
 * - wood_floor_deck_001 (wood planks)
 */
export default function RoadGround({
  buildingSize = 20,
  perfumeShopPosition = [26.3, 0, -6],
  perfumeShopSize = { width: 12, depth: 8 },
  usePBR = false, // Enable PBR textures (requires texture downloads)
}) {

  // Create Minecraft-style stone texture
  const stoneTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    const size = 512; // Texture resolution
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Minecraft stone color palette
    const stoneColors = [
      '#7a7a7a', // Light grey
      '#6b6b6b', // Medium grey
      '#5c5c5c', // Dark grey
      '#777777', // Mid grey
      '#808080', // Standard grey
      '#6e6e6e'  // Slate grey
    ];

    const pixelSize = 32; // Size of each "pixel" for blocky effect
    const blocksPerRow = size / pixelSize;

    // Draw pixelated stone pattern
    for (let y = 0; y < blocksPerRow; y++) {
      for (let x = 0; x < blocksPerRow; x++) {
        // Random stone color for each pixel
        const color = stoneColors[Math.floor(Math.random() * stoneColors.length)];
        ctx.fillStyle = color;
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);

        // Add subtle noise/grain for texture
        if (Math.random() > 0.7) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
          ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
        }
      }
    }

    // Draw grid lines between blocks (like Minecraft block edges)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 2;
    for (let i = 0; i <= blocksPerRow; i++) {
      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(i * pixelSize, 0);
      ctx.lineTo(i * pixelSize, size);
      ctx.stroke();

      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(0, i * pixelSize);
      ctx.lineTo(size, i * pixelSize);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(50, 50); // Repeat pattern across large area
    texture.magFilter = THREE.NearestFilter; // Pixelated effect (no smoothing)
    texture.minFilter = THREE.NearestFilter;

    return texture;
  }, []);

  // PBR Texture Loading (conditional - only if usePBR=true and textures available)
  let pbrTextures = null;

  try {
    if (usePBR) {
      // Attempt to load PBR floor textures
      // eslint-disable-next-line react-hooks/rules-of-hooks
      pbrTextures = useTexture({
        map: '/textures/floor/tiles_brown_02_diff_2k.jpg',
        normalMap: '/textures/floor/tiles_brown_02_nor_gl_2k.png',
        roughnessMap: '/textures/floor/tiles_brown_02_rough_2k.jpg',
        aoMap: '/textures/floor/tiles_brown_02_ao_2k.jpg',
        displacementMap: '/textures/floor/tiles_brown_02_disp_2k.png',
      });

      // Configure texture tiling for large floor area
      Object.values(pbrTextures).forEach((texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(50, 50); // Repeat across 200x200 ground (4m tiles)
      });
    }
  } catch (error) {
    // PBR textures not available, will use procedural fallback
  }

  // Create material based on PBR availability
  const groundMaterial = useMemo(() => {
    if (usePBR && pbrTextures) {
      // Use PBR material with realistic lighting and displacement
      return (
        <meshStandardMaterial
          map={pbrTextures.map}
          normalMap={pbrTextures.normalMap}
          roughnessMap={pbrTextures.roughnessMap}
          aoMap={pbrTextures.aoMap}
          displacementMap={pbrTextures.displacementMap}
          displacementScale={0.02} // Subtle height variation
          aoMapIntensity={1.0}
          normalScale={[1, 1]}
          roughness={0.8}
          metalness={0.0}
        />
      );
    } else {
      // Fallback to procedural stone texture with PBR lighting
      return (
        <meshStandardMaterial
          map={stoneTexture}
          color="#888888"
          roughness={0.9}
          metalness={0.0}
        />
      );
    }
  }, [usePBR, pbrTextures, stoneTexture]);

  return (
    <group>
      {/* Main road/ground base with PBR or procedural texture */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[200, 200, 128, 128]} /> {/* More segments for displacement */}
        {groundMaterial}
      </mesh>
    </group>
  );
}