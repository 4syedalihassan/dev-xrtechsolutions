import { useState, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * PerfumeShopDoors - Realistic luxury glass doors with PBR materials
 *
 * Features:
 * - MeshPhysicalMaterial for realistic glass panels
 * - Proper transparency and refraction
 * - Metallic gold frame with PBR properties
 * - Smooth sliding animation
 *
 * Glass Properties:
 * - Transmission: 0.95 (95% light passes through)
 * - Roughness: 0.03 (very smooth luxury glass)
 * - IOR: 1.52 (standard glass)
 * - Clearcoat: Glossy protective layer
 */
export default function PerfumeShopDoors({ 
  position = [0, 0, 0], 
  rotation = [0, 0, 0],
  doorWidth = 2.5,
  doorHeight = 4,
  isOpen,
  onToggle
}) {
  const leftDoorRef = useRef();
  const rightDoorRef = useRef();
  const [animating, setAnimating] = useState(false);

  // Smooth door animation - sliding sideways
  useFrame((state, delta) => {
    if (leftDoorRef.current && rightDoorRef.current && animating) {
      const leftTargetX = isOpen ? -singleDoorWidth : 0;
      const rightTargetX = isOpen ? singleDoorWidth : 0;
      
      const leftCurrentX = leftDoorRef.current.position.x;
      const rightCurrentX = rightDoorRef.current.position.x;
      
      if (Math.abs(leftCurrentX - leftTargetX) > 0.01 || 
          Math.abs(rightCurrentX - rightTargetX) > 0.01) {
        leftDoorRef.current.position.x = THREE.MathUtils.lerp(
          leftCurrentX, 
          leftTargetX, 
          delta * 3
        );
        rightDoorRef.current.position.x = THREE.MathUtils.lerp(
          rightCurrentX, 
          rightTargetX, 
          delta * 3
        );
      } else {
        leftDoorRef.current.position.x = leftTargetX;
        rightDoorRef.current.position.x = rightTargetX;
        setAnimating(false);
      }
    }
  });

  // Start animation when isOpen changes
  useEffect(() => {
    setAnimating(true);
  }, [isOpen]);

  const singleDoorWidth = doorWidth / 2;

  return (
    <group position={position} rotation={rotation}>
      {/* Door Frame - Grey to match healthcare center */}
      <group>
        {/* Left Frame */}
        <mesh position={[-doorWidth/2 - 0.08, doorHeight/2, 0]} castShadow>
          <boxGeometry args={[0.15, doorHeight + 0.3, 0.2]} />
          <meshStandardMaterial
            color="#777777"
            metalness={0.2}
            roughness={0.6}
            envMapIntensity={0.5}
          />
        </mesh>

        {/* Right Frame */}
        <mesh position={[doorWidth/2 + 0.08, doorHeight/2, 0]} castShadow>
          <boxGeometry args={[0.15, doorHeight + 0.3, 0.2]} />
          <meshStandardMaterial
            color="#777777"
            metalness={0.2}
            roughness={0.6}
            envMapIntensity={0.5}
          />
        </mesh>

        {/* Top Frame */}
        <mesh position={[0, doorHeight + 0.08, 0]} castShadow>
          <boxGeometry args={[doorWidth + 0.3, 0.15, 0.2]} />
          <meshStandardMaterial
            color="#777777"
            metalness={0.2}
            roughness={0.6}
            envMapIntensity={0.5}
          />
        </mesh>
      </group>

      {/* Left Glass Door Panel */}
      <group
        ref={leftDoorRef}
        position={[0, 0, 0]}
        onClick={onToggle}
      >
        {/* Realistic Glass Panel - 3D */}
        <mesh position={[-singleDoorWidth/2, doorHeight/2, 0]} castShadow receiveShadow>
          <boxGeometry args={[singleDoorWidth - 0.1, doorHeight - 0.1, 0.05]} />
          <meshPhysicalMaterial
            color="#ffffff"
            metalness={0.0}
            roughness={0.03}  // Very smooth luxury glass
            transmission={0.95}  // 95% light transmission
            thickness={0.5}
            envMapIntensity={0.8}
            ior={1.52}  // Index of refraction for glass
            clearcoat={1.0}
            clearcoatRoughness={0.02}
            transparent={true}
            opacity={0.2}  // Browser compatibility
          />
        </mesh>

        {/* Thin metallic edge border */}
        <mesh position={[-singleDoorWidth/2, doorHeight/2, 0.03]} castShadow>
          <boxGeometry args={[singleDoorWidth, doorHeight, 0.02]} />
          <meshStandardMaterial
            color="#777777"
            metalness={0.3}
            roughness={0.5}
            wireframe={true}
          />
        </mesh>

        {/* Door Handle - Chrome/Silver */}
        <mesh position={[-0.15, doorHeight/2, 0.08]} castShadow rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, 0.15, 16]} />
          <meshStandardMaterial
            color="#C0C0C0"
            metalness={0.5}
            roughness={0.4}
            envMapIntensity={0.4}
          />
        </mesh>

        {/* Door Details - Grey accents */}
        <mesh position={[-singleDoorWidth/2, doorHeight * 0.7, 0.04]} castShadow>
          <boxGeometry args={[singleDoorWidth - 0.3, 0.03, 0.02]} />
          <meshStandardMaterial
            color="#777777"
            metalness={0.2}
            roughness={0.6}
          />
        </mesh>

        <mesh position={[-singleDoorWidth/2, doorHeight * 0.3, 0.04]} castShadow>
          <boxGeometry args={[singleDoorWidth - 0.3, 0.03, 0.02]} />
          <meshStandardMaterial
            color="#777777"
            metalness={0.2}
            roughness={0.6}
          />
        </mesh>
      </group>

      {/* Right Glass Door Panel */}
      <group
        ref={rightDoorRef}
        position={[0, 0, 0]}
        onClick={onToggle}
      >
        {/* Realistic Glass Panel - 3D */}
        <mesh position={[singleDoorWidth/2, doorHeight/2, 0]} castShadow receiveShadow>
          <boxGeometry args={[singleDoorWidth - 0.1, doorHeight - 0.1, 0.05]} />
          <meshPhysicalMaterial
            color="#ffffff"
            metalness={0.0}
            roughness={0.03}  // Very smooth luxury glass
            transmission={0.95}  // 95% light transmission
            thickness={0.5}
            envMapIntensity={0.8}
            ior={1.52}  // Index of refraction for glass
            clearcoat={1.0}
            clearcoatRoughness={0.02}
            transparent={true}
            opacity={0.2}  // Browser compatibility
          />
        </mesh>

        {/* Thin metallic edge border */}
        <mesh position={[singleDoorWidth/2, doorHeight/2, 0.03]} castShadow>
          <boxGeometry args={[singleDoorWidth, doorHeight, 0.02]} />
          <meshStandardMaterial
            color="#777777"
            metalness={0.3}
            roughness={0.5}
            wireframe={true}
          />
        </mesh>

        {/* Door Handle - Chrome/Silver */}
        <mesh position={[0.15, doorHeight/2, 0.08]} castShadow rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.03, 0.03, 0.15, 16]} />
          <meshStandardMaterial
            color="#C0C0C0"
            metalness={0.5}
            roughness={0.4}
            envMapIntensity={0.4}
          />
        </mesh>

        {/* Door Details - Grey accents */}
        <mesh position={[singleDoorWidth/2, doorHeight * 0.7, 0.04]} castShadow>
          <boxGeometry args={[singleDoorWidth - 0.3, 0.03, 0.02]} />
          <meshStandardMaterial
            color="#777777"
            metalness={0.2}
            roughness={0.6}
          />
        </mesh>

        <mesh position={[singleDoorWidth/2, doorHeight * 0.3, 0.04]} castShadow>
          <boxGeometry args={[singleDoorWidth - 0.3, 0.03, 0.02]} />
          <meshStandardMaterial
            color="#777777"
            metalness={0.2}
            roughness={0.6}
          />
        </mesh>
      </group>

      {/* Welcome Sign Above Doors */}
      <mesh position={[0, doorHeight + 0.4, 0.1]} castShadow>
        <boxGeometry args={[2, 0.3, 0.05]} />
        <meshStandardMaterial
          color="#FFFFFF"
          roughness={0.5}
          metalness={0.0}
        />
      </mesh>

      {/* Sign Text Area (placeholder) - Grey accent */}
      <mesh position={[0, doorHeight + 0.4, 0.13]} castShadow>
        <boxGeometry args={[1.8, 0.25, 0.02]} />
        <meshStandardMaterial
          color="#777777"
          metalness={0.2}
          roughness={0.6}
          emissive="#777777"
          emissiveIntensity={0.05}
        />
      </mesh>
    </group>
  );
}