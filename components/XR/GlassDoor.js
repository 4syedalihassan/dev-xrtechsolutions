import { useState, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * GlassDoor - Realistic glass door with PBR materials
 *
 * Features:
 * - MeshPhysicalMaterial for realistic glass panels
 * - Proper transparency and refraction
 * - Metallic door frame and handle
 * - Smooth opening/closing animation
 *
 * Glass Properties:
 * - Transmission: 0.95 (95% light passes through)
 * - Roughness: 0.03 (very smooth commercial glass)
 * - IOR: 1.52 (standard glass)
 * - Clearcoat: Glossy protective layer
 */
export default function GlassDoor({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  doorWidth = 2,
  doorHeight = 4,
  isOpen,
  onToggle
}) {
  const doorRef = useRef();
  const [animating, setAnimating] = useState(false);
  const targetRotation = useRef(isOpen ? Math.PI / 2 : 0);

  // Smooth door animation
  useFrame((state, delta) => {
    if (doorRef.current && animating) {
      const currentRotation = doorRef.current.rotation.y;
      const newTargetRotation = isOpen ? Math.PI / 2 : 0;
      
      if (Math.abs(currentRotation - newTargetRotation) > 0.01) {
        doorRef.current.rotation.y = THREE.MathUtils.lerp(
          currentRotation, 
          newTargetRotation, 
          delta * 3
        );
      } else {
        doorRef.current.rotation.y = newTargetRotation;
        setAnimating(false);
      }
    }
  });

  // Start animation when isOpen changes
  useEffect(() => {
    setAnimating(true);
  }, [isOpen]);

  return (
    <group position={position} rotation={rotation}>
      {/* Door Frame - Metallic aluminum/steel frame */}
      <group>
        {/* Left Frame */}
        <mesh position={[-doorWidth/2 - 0.05, doorHeight/2, 0]} castShadow>
          <boxGeometry args={[0.1, doorHeight + 0.2, 0.15]} />
          <meshStandardMaterial
            color="#888888"
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>

        {/* Right Frame */}
        <mesh position={[doorWidth/2 + 0.05, doorHeight/2, 0]} castShadow>
          <boxGeometry args={[0.1, doorHeight + 0.2, 0.15]} />
          <meshStandardMaterial
            color="#888888"
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>

        {/* Top Frame */}
        <mesh position={[0, doorHeight + 0.05, 0]} castShadow>
          <boxGeometry args={[doorWidth + 0.2, 0.1, 0.15]} />
          <meshStandardMaterial
            color="#888888"
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* Glass Door Panel */}
      <group
        ref={doorRef}
        position={[-doorWidth/2, 0, 0]}
        onClick={onToggle}
      >
        {/* Realistic Glass Panel - Main transparent surface */}
        <mesh position={[doorWidth/2, doorHeight/2, 0]} castShadow receiveShadow>
          <boxGeometry args={[doorWidth - 0.1, doorHeight - 0.1, 0.05]} />
          {/* Realistic Glass Material with PBR */}
          <meshPhysicalMaterial
            color="#ffffff"
            metalness={0.0}
            roughness={0.03}  // Very smooth commercial glass
            transmission={0.95}  // 95% light transmission
            thickness={0.5}
            envMapIntensity={0.8}
            ior={1.52}  // Index of refraction for glass
            clearcoat={1.0}
            clearcoatRoughness={0.02}
            transparent={true}
            opacity={0.2}  // Minimal opacity for browser compatibility
          />
        </mesh>

        {/* Thin metallic edge border */}
        <mesh position={[doorWidth/2, doorHeight/2, 0.03]} castShadow>
          <boxGeometry args={[doorWidth, doorHeight, 0.02]} />
          <meshStandardMaterial
            color="#aaaaaa"
            metalness={0.8}
            roughness={0.3}
            wireframe={true}
          />
        </mesh>

        {/* Metallic Door Handle - Gold/brass finish */}
        <mesh position={[doorWidth - 0.2, doorHeight/2, 0.08]} castShadow rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, 0.15, 16]} />
          <meshStandardMaterial
            color="#FFD700"
            metalness={1.0}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* Door Status Text (for debugging) */}
      {/* <Text
        position={[0, doorHeight + 0.5, 0]}
        fontSize={0.2}
        color="#333333"
        anchorX="center"
        anchorY="middle"
      >
        Press C to {isOpen ? 'Close' : 'Open'} Door
      </Text> */}
    </group>
  );
}