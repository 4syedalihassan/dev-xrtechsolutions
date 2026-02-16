import { useMemo, useState, useEffect } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

/**
 * BrickWall - Enhanced wall component with PBR material support
 *
 * Features:
 * - PBR texture loading from /public/textures/walls/
 * - Fallback to procedural Minecraft-style textures
 * - Supports both exterior (brown brick) and interior (white brick) sides
 * - Normal maps for surface detail
 * - Roughness maps for realistic lighting
 *
 * PBR Textures:
 * - Download from Poly Haven (https://polyhaven.com/textures)
 * - Place in /public/textures/walls/
 * - See /public/textures/README.md for details
 *
 * Required texture maps (if using PBR):
 * - red_brick_03_diff_2k.jpg (base color)
 * - red_brick_03_nor_gl_2k.png (normal map)
 * - red_brick_03_rough_2k.jpg (roughness)
 * - red_brick_03_ao_2k.jpg (ambient occlusion)
 */
export default function BrickWall({
  width,
  height,
  thickness = 0.3,
  position,
  rotation = [0, 0, 0],
  flipped = false,
  usePBR = false, // Enable PBR textures (requires texture downloads)
}) {

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
          ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
          ctx.fillRect(xPos, yPos, brickWidth - 2, brickHeight - 2);
        }

        // Brick mortar lines (dark gaps between bricks)
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

  // PBR Texture Loading (conditional - only if usePBR=true and textures available)
  const [pbrAvailable, setPbrAvailable] = useState(false);
  let pbrTextures = null;

  try {
    if (usePBR) {
      // Attempt to load PBR textures
      // eslint-disable-next-line react-hooks/rules-of-hooks
      pbrTextures = useTexture({
        map: '/textures/walls/red_brick_03_diff_2k.jpg',
        normalMap: '/textures/walls/red_brick_03_nor_gl_2k.png',
        roughnessMap: '/textures/walls/red_brick_03_rough_2k.jpg',
        aoMap: '/textures/walls/red_brick_03_ao_2k.jpg',
      });

      // Configure texture tiling
      Object.values(pbrTextures).forEach((texture) => {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(width / 2, height / 2); // Realistic brick size (~2m per tile)
      });
    }
  } catch (error) {
    // PBR textures not available, will use procedural fallback
  }

  // Create materials based on availability
  let materials;

  if (usePBR && pbrTextures) {
    // Use PBR materials with realistic lighting
    const pbrMaterial = new THREE.MeshStandardMaterial({
      map: pbrTextures.map,
      normalMap: pbrTextures.normalMap,
      roughnessMap: pbrTextures.roughnessMap,
      aoMap: pbrTextures.aoMap,
      aoMapIntensity: 1.0,
      normalScale: new THREE.Vector2(1, 1),
      roughness: 0.8,
      metalness: 0.0,
    });

    const whiteMaterial = new THREE.MeshStandardMaterial({
      map: whiteBrickTexture,
      color: '#F5F5F5',
      roughness: 0.7,
      metalness: 0.0,
    });

    // Box face order: [+X (right), -X (left), +Y (top), -Y (bottom), +Z (front), -Z (back)]
    materials = [
      pbrMaterial.clone(), // Right
      pbrMaterial.clone(), // Left
      whiteMaterial.clone(), // Top
      whiteMaterial.clone(), // Bottom
      whiteMaterial.clone(), // Front
      whiteMaterial.clone(),  // Back
    ];
  } else {
    // Fallback to procedural materials (current behavior)
    materials = [
      new THREE.MeshStandardMaterial({ map: whiteBrickTexture, color: '#F5F5F5', roughness: 0.7, metalness: 0.0 }), // Right
      new THREE.MeshStandardMaterial({ map: whiteBrickTexture, color: '#F5F5F5', roughness: 0.7, metalness: 0.0 }), // Left
      new THREE.MeshStandardMaterial({ map: whiteBrickTexture, color: '#F5F5F5', roughness: 0.7, metalness: 0.0 }), // Top
      new THREE.MeshStandardMaterial({ map: whiteBrickTexture, color: '#F5F5F5', roughness: 0.7, metalness: 0.0 }), // Bottom
      new THREE.MeshStandardMaterial({ map: whiteBrickTexture, color: '#F5F5F5', roughness: 0.7, metalness: 0.0 }), // Front
      new THREE.MeshStandardMaterial({ map: whiteBrickTexture, color: '#F5F5F5', roughness: 0.7, metalness: 0.0 })  // Back
    ];
  }

  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow material={materials}>
      <boxGeometry args={[width, height, thickness]} />
    </mesh>
  );
}