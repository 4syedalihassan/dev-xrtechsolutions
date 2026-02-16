/**
 * Professional 3D Loading Screen - Sprint 8 Visual Enhancement
 *
 * Features:
 * - Animated logo with rotation and pulsing
 * - Progress bar with percentage
 * - Loading tips and status messages
 * - Particle effects in background
 * - Smooth fade-out when complete
 *
 * @module components/XR/LoadingScreen
 */

import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

export default function LoadingScreen({
  progress = 0, // 0-100
  onComplete = null,
  showTips = true,
  animated = true
}) {
  const logoRef = useRef();
  const progressBarRef = useRef();
  const particlesRef = useRef();
  const timeRef = useRef(0);

  const [currentTip, setCurrentTip] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [fadeOpacity, setFadeOpacity] = useState(1);

  // BUG FIX #3: Handle NaN, undefined, null progress values
  const safeProgress = Number.isNaN(progress) || progress === undefined || progress === null ? 0 : progress;

  // Loading tips to show users
  const loadingTips = [
    "Tip: Use mouse wheel to zoom in and out",
    "Tip: Press C to open nearby doors",
    "Tip: Click on products to view details",
    "Tip: WASD keys to move around the shop",
    "Tip: Look around with your mouse",
    "Tip: Press F for fullscreen mode"
  ];

  // Rotate through tips every 3 seconds
  useEffect(() => {
    // BUG FIX #4: Check if tips array is empty
    if (!showTips || loadingTips.length === 0) return;

    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % loadingTips.length);
    }, 3000);

    // BUG FIX #8: Always clean up intervals to prevent memory leaks
    return () => clearInterval(interval);
  }, [showTips, loadingTips.length]);

  // Handle loading completion
  useEffect(() => {
    // BUG FIX #5: Use isComplete flag to prevent multiple onComplete calls
    if (safeProgress >= 100 && !isComplete) {
      setIsComplete(true);

      // Fade out animation
      const fadeInterval = setInterval(() => {
        setFadeOpacity((prev) => {
          // BUG FIX #1 & #2: Use Math.max to prevent negative opacity and precision errors
          const newOpacity = Math.max(0, prev - 0.05);

          if (newOpacity <= 0) {
            clearInterval(fadeInterval);
            // BUG FIX #5: Only call onComplete once (already guarded by isComplete flag)
            if (onComplete) onComplete();
            return 0;
          }
          return newOpacity;
        });
      }, 50);

      // BUG FIX #8: Clean up interval on unmount
      return () => clearInterval(fadeInterval);
    }
  }, [safeProgress, isComplete, onComplete]);

  // Animation loop
  useFrame((state, delta) => {
    if (!animated) return;

    timeRef.current += delta;

    // 1. Logo rotation animation
    if (logoRef.current) {
      logoRef.current.rotation.y = timeRef.current * 2; // 2 rad/s rotation

      // Pulsing scale
      const pulseScale = 1 + Math.sin(timeRef.current * 3) * 0.1;
      logoRef.current.scale.set(pulseScale, pulseScale, pulseScale);
    }

    // 2. Progress bar color animation
    if (progressBarRef.current && progressBarRef.current.material) {
      // BUG FIX #6: Handle negative time by ensuring positive hue [0, 1]
      // Adding 1 and taking modulo again ensures positive result
      const hue = ((timeRef.current * 0.2) % 1 + 1) % 1;
      progressBarRef.current.material.color.setHSL(hue, 0.8, 0.5);
    }

    // 3. Particle rotation
    if (particlesRef.current) {
      particlesRef.current.rotation.y = timeRef.current * 0.5;
    }
  });

  // Clamp progress to 0-100
  const clampedProgress = Math.max(0, Math.min(100, safeProgress));
  const progressWidth = (clampedProgress / 100) * 4; // Max width 4 units

  return (
    <group opacity={fadeOpacity}>
      {/* Background plane with dark gradient */}
      <mesh position={[0, 0, -5]}>
        <planeGeometry args={[20, 12]} />
        <meshBasicMaterial
          color="#0a0a0a"
          transparent
          opacity={fadeOpacity * 0.9}
        />
      </mesh>

      {/* Rotating logo cube */}
      <mesh ref={logoRef} position={[0, 2, 0]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#007B83"
          emissive="#007B83"
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Logo glow light */}
      <pointLight
        position={[0, 2, 0]}
        color="#007B83"
        intensity={2}
        distance={5}
        decay={2}
      />

      {/* Title text */}
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.4}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#007B83"
      >
        Loading XR Experience...
      </Text>

      {/* Progress bar background */}
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[4, 0.2, 0.1]} />
        <meshBasicMaterial color="#333333" transparent opacity={fadeOpacity} />
      </mesh>

      {/* Progress bar fill */}
      <mesh
        ref={progressBarRef}
        position={[-2 + progressWidth / 2, -0.5, 0.06]}
      >
        <boxGeometry args={[progressWidth, 0.2, 0.1]} />
        <meshStandardMaterial
          color="#00FF00"
          emissive="#00FF00"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Progress percentage */}
      <Text
        position={[0, -1, 0]}
        fontSize={0.3}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {Math.round(clampedProgress)}%
      </Text>

      {/* Loading tip */}
      {showTips && (
        <Text
          position={[0, -1.8, 0]}
          fontSize={0.2}
          color="#aaaaaa"
          anchorX="center"
          anchorY="middle"
          maxWidth={6}
          textAlign="center"
        >
          {loadingTips[currentTip]}
        </Text>
      )}

      {/* Background particles for visual interest */}
      <group ref={particlesRef}>
        {[...Array(20)].map((_, i) => {
          const angle = (i / 20) * Math.PI * 2;
          const radius = 8;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const z = -3 + Math.random() * 2;

          return (
            <mesh key={i} position={[x, y, z]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshBasicMaterial
                color="#007B83"
                transparent
                opacity={fadeOpacity * 0.5}
              />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

/**
 * Hook to track loading progress based on loaded items
 *
 * @param {number} totalItems - Total number of items to load
 * @param {number} loadedItems - Number of items loaded so far
 * @returns {number} Progress percentage (0-100)
 */
export function useLoadingProgress(totalItems, loadedItems) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // BUG FIX #7: Handle division by zero
    if (totalItems === 0) {
      setProgress(100); // Consider empty load as complete
      return;
    }

    const percentage = (loadedItems / totalItems) * 100;

    // Clamp to [0, 100] range
    const clampedPercentage = Math.max(0, Math.min(100, percentage));

    setProgress(clampedPercentage);
  }, [totalItems, loadedItems]);

  return progress;
}
