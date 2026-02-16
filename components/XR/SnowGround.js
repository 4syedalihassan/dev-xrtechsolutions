import { useMemo } from 'react';
import * as THREE from 'three';

/**
 * SnowGround - Snow-covered ground for winter season
 *
 * Features:
 * - Procedural snow texture
 * - PBR materials for realistic snow appearance
 * - Subtle bumps and variations
 *
 * Snow Properties:
 * - Color: Bright white with subtle blue tint
 * - Roughness: 0.8 (matte snow surface)
 * - Metalness: 0.0 (non-metallic)
 * - Displacement: Subtle height variation
 */
export default function SnowGround({
  size = [100, 100],
  position = [0, 0.01, 0] // Slightly above RoadGround to prevent z-fighting
}) {
  // Create procedural snow texture
  const snowTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    const texSize = 1024;
    canvas.width = texSize;
    canvas.height = texSize;
    const ctx = canvas.getContext('2d');

    // Base snow color - bright white with very slight blue tint
    ctx.fillStyle = '#FAFCFF';
    ctx.fillRect(0, 0, texSize, texSize);

    // Add subtle snow texture variations
    for (let i = 0; i < 5000; i++) {
      const x = Math.random() * texSize;
      const y = Math.random() * texSize;
      const size = Math.random() * 3 + 1;
      const opacity = Math.random() * 0.15;

      // Slight variations in brightness
      const brightness = Math.floor(Math.random() * 20 - 10);
      ctx.fillStyle = `rgba(${245 + brightness}, ${248 + brightness}, ${255}, ${opacity})`;
      ctx.fillRect(x, y, size, size);
    }

    // Add some sparkle highlights (ice crystals)
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * texSize;
      const y = Math.random() * texSize;
      const size = Math.random() * 2 + 0.5;

      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.4})`;
      ctx.fillRect(x, y, size, size);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 8);

    return texture;
  }, []);

  // Create normal map for subtle bumps
  const normalMap = useMemo(() => {
    const canvas = document.createElement('canvas');
    const texSize = 512;
    canvas.width = texSize;
    canvas.height = texSize;
    const ctx = canvas.getContext('2d');

    // Normal map base color (neutral normal)
    ctx.fillStyle = '#8080FF';
    ctx.fillRect(0, 0, texSize, texSize);

    // Add subtle bump variations
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * texSize;
      const y = Math.random() * texSize;
      const size = Math.random() * 5 + 2;
      const variation = Math.floor(Math.random() * 20 - 10);

      ctx.fillStyle = `rgba(${128 + variation}, ${128 + variation}, ${255}, 0.3)`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(8, 8);

    return texture;
  }, []);

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={position}
      receiveShadow
    >
      <planeGeometry args={[...size, 128, 128]} />
      <meshStandardMaterial
        map={snowTexture}
        normalMap={normalMap}
        normalScale={[0.2, 0.2]}
        color="#FAFCFF"  // Bright snow white with blue tint
        roughness={0.8}   // Matte snow surface
        metalness={0.0}   // Non-metallic
        envMapIntensity={0.4}
      />
    </mesh>
  );
}
