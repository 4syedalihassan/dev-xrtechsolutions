import { useRef, useEffect } from 'react';
import * as THREE from 'three';

export default function CheckoutCounter({ 
  position = [0, 0, 0], 
  rotation = [0, 0, 0],
  size = { width: 2.5, height: 1.2, depth: 0.8 }
}) {
  const counterRef = useRef();
  const { width, height, depth } = size;

  return (
    <group ref={counterRef} position={position} rotation={rotation}>
      {/* Main Counter Base */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshPhysicalMaterial
          color="#8B4513" // Rich wood brown
          roughness={0.7}
          metalness={0.0}
          clearcoat={0.15}
          clearcoatRoughness={0.35}
        />
      </mesh>

      {/* Counter Top */}
      <mesh position={[0, height + 0.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[width + 0.1, 0.1, depth + 0.1]} />
        <meshPhysicalMaterial
          color="#D2B48C" // Light wood/marble top
          roughness={0.05}
          metalness={0.0}
          clearcoat={0.8}
          clearcoatRoughness={0.1}
          transmission={0.05}
          thickness={0.5}
        />
      </mesh>

      {/* Gold Trim around Counter Top */}
      <mesh position={[0, height + 0.12, 0]} castShadow>
        <boxGeometry args={[width + 0.15, 0.04, depth + 0.15]} />
        <meshPhysicalMaterial
          color="#FFD700" // Gold trim
          roughness={0.1}
          metalness={1.0}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
          reflectivity={1.0}
        />
      </mesh>

      {/* Cash Register */}
      <mesh position={[width / 4, height + 0.25, 0]} castShadow>
        <boxGeometry args={[0.4, 0.3, 0.3]} />
        <meshPhysicalMaterial
          color="#2C2C2C" // Dark grey register
          roughness={0.2}
          metalness={0.6}
          clearcoat={0.5}
          clearcoatRoughness={0.15}
        />
      </mesh>

      {/* Register Display */}
      <mesh position={[width / 4, height + 0.35, -0.05]} castShadow>
        <boxGeometry args={[0.25, 0.15, 0.05]} />
        <meshBasicMaterial 
          color="#00FF00" // Green display
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Card Reader */}
      <mesh position={[-width / 4, height + 0.15, depth / 4]} castShadow>
        <boxGeometry args={[0.15, 0.2, 0.1]} />
        <meshPhysicalMaterial
          color="#1A1A1A" // Black card reader
          roughness={0.1}
          metalness={0.3}
          clearcoat={0.6}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* Receipt Printer */}
      <mesh position={[0, height + 0.2, -depth / 3]} castShadow>
        <boxGeometry args={[0.3, 0.2, 0.2]} />
        <meshPhysicalMaterial
          color="#F5F5F5" // White printer
          roughness={0.3}
          metalness={0.0}
          clearcoat={0.2}
          clearcoatRoughness={0.25}
        />
      </mesh>

      {/* Counter Drawers */}
      {/* Left drawer */}
      <mesh position={[-width / 3, height / 2, depth / 2 - 0.05]} castShadow>
        <boxGeometry args={[0.6, 0.15, 0.05]} />
        <meshPhysicalMaterial
          color="#654321" // Darker wood for drawer fronts
          roughness={0.65}
          metalness={0.0}
          clearcoat={0.2}
          clearcoatRoughness={0.3}
        />
      </mesh>

      {/* Right drawer */}
      <mesh position={[width / 3, height / 2, depth / 2 - 0.05]} castShadow>
        <boxGeometry args={[0.6, 0.15, 0.05]} />
        <meshPhysicalMaterial
          color="#654321"
          roughness={0.65}
          metalness={0.0}
          clearcoat={0.2}
          clearcoatRoughness={0.3}
        />
      </mesh>

      {/* Drawer Handles */}
      <mesh position={[-width / 3, height / 2, depth / 2]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.1, 8]} />
        <meshPhysicalMaterial
          color="#FFD700" // Gold handles
          roughness={0.1}
          metalness={1.0}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
          reflectivity={1.0}
        />
      </mesh>

      <mesh position={[width / 3, height / 2, depth / 2]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.1, 8]} />
        <meshPhysicalMaterial
          color="#FFD700"
          roughness={0.1}
          metalness={1.0}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
          reflectivity={1.0}
        />
      </mesh>

      {/* Counter Support Legs */}
      {/* Front left leg */}
      <mesh position={[-width / 2 + 0.1, height / 2 - 0.1, depth / 2 - 0.1]} castShadow>
        <boxGeometry args={[0.08, height - 0.2, 0.08]} />
        <meshPhysicalMaterial
          color="#654321"
          roughness={0.7}
          metalness={0.0}
          clearcoat={0.15}
          clearcoatRoughness={0.35}
        />
      </mesh>

      {/* Front right leg */}
      <mesh position={[width / 2 - 0.1, height / 2 - 0.1, depth / 2 - 0.1]} castShadow>
        <boxGeometry args={[0.08, height - 0.2, 0.08]} />
        <meshPhysicalMaterial
          color="#654321"
          roughness={0.7}
          metalness={0.0}
          clearcoat={0.15}
          clearcoatRoughness={0.35}
        />
      </mesh>

      {/* Back left leg */}
      <mesh position={[-width / 2 + 0.1, height / 2 - 0.1, -depth / 2 + 0.1]} castShadow>
        <boxGeometry args={[0.08, height - 0.2, 0.08]} />
        <meshPhysicalMaterial
          color="#654321"
          roughness={0.7}
          metalness={0.0}
          clearcoat={0.15}
          clearcoatRoughness={0.35}
        />
      </mesh>

      {/* Back right leg */}
      <mesh position={[width / 2 - 0.1, height / 2 - 0.1, -depth / 2 + 0.1]} castShadow>
        <boxGeometry args={[0.08, height - 0.2, 0.08]} />
        <meshPhysicalMaterial
          color="#654321"
          roughness={0.7}
          metalness={0.0}
          clearcoat={0.15}
          clearcoatRoughness={0.35}
        />
      </mesh>

      {/* Invisible Collision Box for Camera Blocking */}
      <mesh position={[0, height / 2, 0]} visible={false}>
        <boxGeometry args={[width + 0.5, height + 0.5, depth + 0.5]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
}