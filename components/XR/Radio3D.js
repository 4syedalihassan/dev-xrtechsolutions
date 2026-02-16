// =====================================================
// 3D RADIO - Positional Audio Source
// Creates spatialized audio in 3D space
// =====================================================

import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { PositionalAudio } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Radio3D - A 3D radio object with positional audio
 *
 * @param {Array} position - [x, y, z] position in scene
 * @param {string} audioUrl - URL of audio to play
 * @param {boolean} isPlaying - Whether audio should be playing
 * @param {number} volume - Volume level 0-1
 * @param {number} refDistance - Distance at which volume is full (default 1)
 * @param {number} rolloffFactor - How quickly volume decreases with distance (default 1)
 * @param {boolean} showModel - Whether to show a visual radio model
 */
export default function Radio3D({
  position = [0, 1, 0],
  audioUrl,
  isPlaying = false,
  volume = 0.5,
  refDistance = 5,
  rolloffFactor = 1,
  maxDistance = 50,
  showModel = true,
  buildingType = 'generic'
}) {
  const soundRef = useRef();
  const meshRef = useRef();
  const { camera } = useThree();

  // Update audio state
  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.setVolume(volume);
      soundRef.current.setRefDistance(refDistance);
      soundRef.current.setRolloffFactor(rolloffFactor);
      soundRef.current.setMaxDistance(maxDistance);

      if (isPlaying && !soundRef.current.isPlaying) {
        soundRef.current.play();
      } else if (!isPlaying && soundRef.current.isPlaying) {
        soundRef.current.pause();
      }
    }
  }, [isPlaying, volume, refDistance, rolloffFactor, maxDistance]);

  // Animate radio when playing
  useFrame((state) => {
    if (meshRef.current && isPlaying) {
      // Subtle pulse animation
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.02;
      meshRef.current.scale.setScalar(scale);
    }
  });

  // Radio model colors based on building type
  const getRadioColor = () => {
    switch (buildingType) {
      case 'healthcare':
        return '#667eea';
      case 'perfume':
        return '#f59e0b';
      default:
        return '#4a5568';
    }
  };

  return (
    <group position={position}>
      {/* Visual Radio Model */}
      {showModel && (
        <group ref={meshRef}>
          {/* Radio body */}
          <mesh castShadow>
            <boxGeometry args={[0.4, 0.25, 0.15]} />
            <meshStandardMaterial
              color={getRadioColor()}
              metalness={0.3}
              roughness={0.7}
            />
          </mesh>

          {/* Speaker grille */}
          <mesh position={[0, 0, 0.076]}>
            <planeGeometry args={[0.3, 0.15]} />
            <meshStandardMaterial
              color="#1a1a1a"
              metalness={0.5}
              roughness={0.8}
            />
          </mesh>

          {/* Antenna */}
          <mesh position={[0.15, 0.2, 0]}>
            <cylinderGeometry args={[0.008, 0.005, 0.3]} />
            <meshStandardMaterial color="#666" metalness={0.8} />
          </mesh>

          {/* Playing indicator light */}
          {isPlaying && (
            <mesh position={[-0.15, 0.1, 0.076]}>
              <sphereGeometry args={[0.02]} />
              <meshStandardMaterial
                color="#00ff00"
                emissive="#00ff00"
                emissiveIntensity={0.2}
              />
            </mesh>
          )}
        </group>
      )}

      {/* Positional Audio - only render if we have a valid URL */}
      {audioUrl && (
        <PositionalAudioComponent
          ref={soundRef}
          url={audioUrl}
          distance={refDistance}
          loop
        />
      )}
    </group>
  );
}

/**
 * Simple wrapper for positional audio
 * Uses Web Audio API for 3D sound
 */
function PositionalAudioComponent({ url, distance, loop }) {
  const sound = useRef();
  const { camera } = useThree();

  useEffect(() => {
    if (!url) return;

    const listener = new THREE.AudioListener();
    camera.add(listener);

    const audio = new THREE.PositionalAudio(listener);
    const audioLoader = new THREE.AudioLoader();

    audioLoader.load(url, (buffer) => {
      audio.setBuffer(buffer);
      audio.setRefDistance(distance);
      audio.setLoop(loop);
    });

    sound.current = audio;

    return () => {
      camera.remove(listener);
      if (audio.isPlaying) {
        audio.stop();
      }
    };
  }, [url, camera, distance, loop]);

  return sound.current ? <primitive object={sound.current} /> : null;
}

/**
 * RadioZone - Invisible zone that triggers zone change
 */
export function RadioZone({ position, size, zone, onEnter }) {
  const meshRef = useRef();

  return (
    <mesh
      ref={meshRef}
      position={position}
      visible={false}
      onPointerEnter={() => onEnter && onEnter(zone)}
    >
      <boxGeometry args={size} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
}
