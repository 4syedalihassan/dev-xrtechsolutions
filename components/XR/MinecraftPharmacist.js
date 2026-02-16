import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * MinecraftPharmacist - Animated Minecraft-style pharmacist character
 *
 * Features:
 * - Blocky Minecraft-style design
 * - Lab coat (white coat over body)
 * - Animated head rotation (looks around)
 * - Animated arm movements (waving/gesturing)
 * - Realistic PBR materials
 */
export default function MinecraftPharmacist({ position = [0, 0, 0] }) {
  const headRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();

  // Animate head and arms to make character feel alive
  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (headRef.current) {
      // Head looks left and right slowly
      headRef.current.rotation.y = Math.sin(time * 0.5) * 0.3;
      // Slight head tilt
      headRef.current.rotation.x = Math.sin(time * 0.3) * 0.1;
    }

    if (leftArmRef.current) {
      // Left arm waves
      leftArmRef.current.rotation.z = Math.sin(time * 1.2) * 0.4 + 0.2;
      leftArmRef.current.rotation.x = Math.sin(time * 1.2 + 0.5) * 0.3;
    }

    if (rightArmRef.current) {
      // Right arm gestures (opposite phase)
      rightArmRef.current.rotation.z = Math.sin(time * 1.2 + Math.PI) * 0.4 - 0.2;
      rightArmRef.current.rotation.x = Math.sin(time * 1.2 + Math.PI + 0.5) * 0.3;
    }
  });

  // Minecraft character dimensions (blocky)
  const headSize = 0.4;
  const bodyWidth = 0.5;
  const bodyHeight = 0.6;
  const bodyDepth = 0.25;
  const armWidth = 0.15;
  const armHeight = 0.5;
  const legWidth = 0.15;
  const legHeight = 0.6;

  return (
    <group position={position}>
      {/* Head - skin tone with animated rotation */}
      <group ref={headRef} position={[0, bodyHeight + headSize / 2, 0]}>
        <mesh castShadow>
          <boxGeometry args={[headSize, headSize, headSize]} />
          <meshStandardMaterial
            color="#F5C4A0" // Skin tone
            roughness={0.6}
            metalness={0.0}
          />
        </mesh>

        {/* Eyes - simple black rectangles */}
        <mesh position={[0.1, 0.05, headSize / 2 + 0.01]} castShadow>
          <boxGeometry args={[0.08, 0.08, 0.01]} />
          <meshStandardMaterial color="#000000" roughness={0.8} />
        </mesh>
        <mesh position={[-0.1, 0.05, headSize / 2 + 0.01]} castShadow>
          <boxGeometry args={[0.08, 0.08, 0.01]} />
          <meshStandardMaterial color="#000000" roughness={0.8} />
        </mesh>

        {/* Smile */}
        <mesh position={[0, -0.08, headSize / 2 + 0.01]} castShadow>
          <boxGeometry args={[0.2, 0.03, 0.01]} />
          <meshStandardMaterial color="#000000" roughness={0.8} />
        </mesh>

        {/* Hair/Cap - brown */}
        <mesh position={[0, headSize / 2 - 0.05, 0]} castShadow>
          <boxGeometry args={[headSize + 0.02, 0.1, headSize + 0.02]} />
          <meshStandardMaterial
            color="#4A3728" // Brown hair
            roughness={0.7}
            metalness={0.0}
          />
        </mesh>
      </group>

      {/* Body - blue scrubs under white lab coat */}
      <group position={[0, bodyHeight / 2, 0]}>
        {/* Inner shirt - blue scrubs */}
        <mesh castShadow>
          <boxGeometry args={[bodyWidth - 0.05, bodyHeight, bodyDepth - 0.05]} />
          <meshStandardMaterial
            color="#4A90E2" // Medical scrubs blue
            roughness={0.7}
            metalness={0.0}
          />
        </mesh>

        {/* Lab coat - white coat over body */}
        <mesh castShadow position={[0, 0, 0.02]}>
          <boxGeometry args={[bodyWidth + 0.05, bodyHeight - 0.1, bodyDepth + 0.05]} />
          <meshStandardMaterial
            color="#FAFAFA" // White lab coat
            roughness={0.5}
            metalness={0.0}
          />
        </mesh>

        {/* Lab coat collar */}
        <mesh castShadow position={[0, bodyHeight / 2 - 0.05, bodyDepth / 2 + 0.03]}>
          <boxGeometry args={[bodyWidth + 0.1, 0.15, 0.03]} />
          <meshStandardMaterial
            color="#FFFFFF"
            roughness={0.5}
            metalness={0.0}
          />
        </mesh>
      </group>

      {/* Left Arm - with lab coat sleeve */}
      <group
        ref={leftArmRef}
        position={[bodyWidth / 2 + armWidth / 2 + 0.05, bodyHeight - armHeight / 2 + 0.1, 0]}
      >
        {/* Arm - skin */}
        <mesh castShadow>
          <boxGeometry args={[armWidth, armHeight, armWidth]} />
          <meshStandardMaterial
            color="#F5C4A0" // Skin tone
            roughness={0.6}
            metalness={0.0}
          />
        </mesh>

        {/* Lab coat sleeve - white */}
        <mesh castShadow position={[0, armHeight / 4, 0]}>
          <boxGeometry args={[armWidth + 0.05, armHeight / 2, armWidth + 0.05]} />
          <meshStandardMaterial
            color="#FAFAFA"
            roughness={0.5}
            metalness={0.0}
          />
        </mesh>
      </group>

      {/* Right Arm - with lab coat sleeve */}
      <group
        ref={rightArmRef}
        position={[-bodyWidth / 2 - armWidth / 2 - 0.05, bodyHeight - armHeight / 2 + 0.1, 0]}
      >
        {/* Arm - skin */}
        <mesh castShadow>
          <boxGeometry args={[armWidth, armHeight, armWidth]} />
          <meshStandardMaterial
            color="#F5C4A0" // Skin tone
            roughness={0.6}
            metalness={0.0}
          />
        </mesh>

        {/* Lab coat sleeve - white */}
        <mesh castShadow position={[0, armHeight / 4, 0]}>
          <boxGeometry args={[armWidth + 0.05, armHeight / 2, armWidth + 0.05]} />
          <meshStandardMaterial
            color="#FAFAFA"
            roughness={0.5}
            metalness={0.0}
          />
        </mesh>
      </group>

      {/* Left Leg - blue scrubs */}
      <mesh position={[bodyWidth / 4, -legHeight / 2, 0]} castShadow>
        <boxGeometry args={[legWidth, legHeight, legWidth]} />
        <meshStandardMaterial
          color="#4A90E2" // Medical scrubs
          roughness={0.7}
          metalness={0.0}
        />
      </mesh>

      {/* Right Leg - blue scrubs */}
      <mesh position={[-bodyWidth / 4, -legHeight / 2, 0]} castShadow>
        <boxGeometry args={[legWidth, legHeight, legWidth]} />
        <meshStandardMaterial
          color="#4A90E2" // Medical scrubs
          roughness={0.7}
          metalness={0.0}
        />
      </mesh>

      {/* Shoes - white medical shoes */}
      <mesh position={[bodyWidth / 4, -legHeight - 0.05, 0.05]} castShadow>
        <boxGeometry args={[legWidth + 0.05, 0.1, legWidth + 0.1]} />
        <meshStandardMaterial
          color="#FFFFFF"
          roughness={0.6}
          metalness={0.0}
        />
      </mesh>

      <mesh position={[-bodyWidth / 4, -legHeight - 0.05, 0.05]} castShadow>
        <boxGeometry args={[legWidth + 0.05, 0.1, legWidth + 0.1]} />
        <meshStandardMaterial
          color="#FFFFFF"
          roughness={0.6}
          metalness={0.0}
        />
      </mesh>

      {/* Name tag on lab coat */}
      <mesh position={[bodyWidth / 3, bodyHeight / 2 + 0.1, bodyDepth / 2 + 0.05]} castShadow>
        <boxGeometry args={[0.15, 0.08, 0.01]} />
        <meshStandardMaterial
          color="#FFD700" // Gold name tag
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}
