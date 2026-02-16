import { useState, useEffect, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

/**
 * BuildingSignboard - 3D signboard positioned above building
 * Displays: Logo, Building Name, Subtitle, Tagline
 * All content is managed from Admin > Buildings > Building Settings
 */
export default function BuildingSignboard({
  position = [0, 8, 0], // Positioned above building
  rotation = [0, 0, 0],
  buildingId = "building_1",
  defaultName = "Building Name",
  width = 8,
  height = 3,
  neonEnabled = true
}) {
  const [buildingData, setBuildingData] = useState({
    name: defaultName,
    logo_url: null,
    signage_subtitle: '',
    signage_tagline: '',
    status: 'OPEN',
    is_operational: true
  });

  // Refs for neon glow animation
  const glowRef = useRef();
  const timeRef = useRef(0);

  // Logo texture
  const [logoTexture, setLogoTexture] = useState(null);

  // Fetch backend data
  useEffect(() => {
    const fetchBuildingData = async () => {
      try {
        const response = await fetch(`/api/buildings/${buildingId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch building data');
        }

        const data = await response.json();
        if (data.success && data.building) {
          setBuildingData({
            name: data.building.name || defaultName,
            logo_url: data.building.logo_url,
            signage_subtitle: data.building.signage_subtitle || '',
            signage_tagline: data.building.signage_tagline || '',
            status: data.building.status || 'OPEN',
            is_operational: data.building.is_operational !== false
          });
        }
      } catch (error) {
        console.error('Failed to fetch building data:', error);
        // Fallback to default values
        setBuildingData({
          name: defaultName,
          logo_url: null,
          signage_subtitle: '',
          signage_tagline: '',
          status: 'CLOSED',
          is_operational: false
        });
      }
    };

    fetchBuildingData();

    // Set up polling for real-time updates (every 30 seconds)
    const interval = setInterval(fetchBuildingData, 30000);

    return () => clearInterval(interval);
  }, [buildingId, defaultName]);

  // Load logo texture when URL changes
  useEffect(() => {
    if (buildingData.logo_url) {
      try {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(
          buildingData.logo_url,
          (texture) => {
            setLogoTexture(texture);
          },
          undefined,
          (error) => {
            console.error('Failed to load logo texture:', error);
            setLogoTexture(null);
          }
        );
      } catch (error) {
        console.error('Error loading logo:', error);
        setLogoTexture(null);
      }
    } else {
      setLogoTexture(null);
    }
  }, [buildingData.logo_url]);

  // Determine colors based on status
  const getStatusColors = () => {
    if (!buildingData.is_operational) {
      return {
        background: '#1a0a0a',
        frameColor: '#FF1493',
        neonColor: '#FF1493',
        textColor: '#FFFFFF',
        glowIntensity: 2.0
      };
    } else if (buildingData.status === 'OPEN') {
      return {
        background: '#0a1a1a',
        frameColor: '#667eea',
        neonColor: '#667eea',
        textColor: '#FFFFFF',
        glowIntensity: 2.0
      };
    } else {
      return {
        background: '#1a0a0a',
        frameColor: '#FF00FF',
        neonColor: '#FF00FF',
        textColor: '#FFFFFF',
        glowIntensity: 2.0
      };
    }
  };

  const colors = getStatusColors();

  // Neon pulsing animation
  useFrame((state, delta) => {
    if (!neonEnabled || !glowRef.current) return;

    // Increment time
    timeRef.current += delta;

    // Pulsing glow: 1.57-second cycle
    const pulseSpeed = 4.0;
    const minIntensity = 0.8;
    const maxIntensity = 1.2;
    const pulseIntensity = minIntensity + (Math.sin(timeRef.current * pulseSpeed) + 1) * 0.5 * (maxIntensity - minIntensity);

    // Apply pulsing to glow light
    if (glowRef.current) {
      glowRef.current.intensity = colors.glowIntensity * pulseIntensity;
    }
  });

  const logoSize = 1.2; // Logo size
  const logoX = -width / 2 + logoSize / 2 + 0.5; // Left side with padding
  const textStartX = logoTexture ? -width / 2 + logoSize + 1.0 : 0; // Text starts after logo or centered

  return (
    <group position={position} rotation={rotation}>
      {/* Glow frame */}
      <mesh position={[0, 0, 0.01]}>
        <boxGeometry args={[width + 0.4, height + 0.4, 0.15]} />
        <meshStandardMaterial
          color={colors.frameColor}
          emissive={colors.frameColor}
          emissiveIntensity={neonEnabled ? 0.5 : 0}
          toneMapped={false}
        />
      </mesh>

      {/* Main signboard panel */}
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[width, height, 0.14]} />
        <meshStandardMaterial
          color={colors.background}
          emissive={colors.frameColor}
          emissiveIntensity={neonEnabled ? 0.2 : 0}
        />
      </mesh>

      {/* Main glow light */}
      {neonEnabled && (
        <pointLight
          ref={glowRef}
          position={[0, 0, 0.5]}
          color={colors.neonColor}
          intensity={colors.glowIntensity}
          distance={width * 2}
          decay={2}
        />
      )}

      {/* Logo (left side if available) */}
      {logoTexture && (
        <mesh position={[logoX, 0, 0.08]}>
          <planeGeometry args={[logoSize, logoSize]} />
          <meshBasicMaterial map={logoTexture} transparent={true} />
        </mesh>
      )}

      {/* Building Name */}
      <Text
        position={[textStartX, 0.6, 0.08]}
        fontSize={0.5}
        color={colors.textColor}
        anchorX={logoTexture ? "left" : "center"}
        anchorY="middle"
        maxWidth={logoTexture ? width - logoSize - 1.5 : width - 1}
        textAlign={logoTexture ? "left" : "center"}
        outlineWidth={neonEnabled ? 0.02 : 0}
        outlineColor={colors.neonColor}
        font="/fonts/Roboto-Bold.ttf"
        fontWeight="bold"
      >
        {buildingData.name}
      </Text>

      {/* Subtitle */}
      {buildingData.signage_subtitle && (
        <Text
          position={[textStartX, 0.1, 0.08]}
          fontSize={0.3}
          color={colors.textColor}
          anchorX={logoTexture ? "left" : "center"}
          anchorY="middle"
          maxWidth={logoTexture ? width - logoSize - 1.5 : width - 1}
          textAlign={logoTexture ? "left" : "center"}
          outlineWidth={neonEnabled ? 0.015 : 0}
          outlineColor={colors.neonColor}
        >
          {buildingData.signage_subtitle}
        </Text>
      )}

      {/* Tagline */}
      {buildingData.signage_tagline && (
        <Text
          position={[textStartX, -0.4, 0.08]}
          fontSize={0.25}
          color={colors.textColor}
          anchorX={logoTexture ? "left" : "center"}
          anchorY="middle"}
          maxWidth={logoTexture ? width - logoSize - 1.5 : width - 1}
          textAlign={logoTexture ? "left" : "center"}
          outlineWidth={neonEnabled ? 0.01 : 0}
          outlineColor={colors.neonColor}
          opacity={0.9}
        >
          {buildingData.signage_tagline}
        </Text>
      )}

      {/* Corner glow lights */}
      {neonEnabled && (
        <>
          <pointLight
            position={[-width / 2, height / 2, 0.3]}
            color={colors.neonColor}
            intensity={0.5}
            distance={2}
            decay={2}
          />
          <pointLight
            position={[width / 2, height / 2, 0.3]}
            color={colors.neonColor}
            intensity={0.5}
            distance={2}
            decay={2}
          />
          <pointLight
            position={[-width / 2, -height / 2, 0.3]}
            color={colors.neonColor}
            intensity={0.5}
            distance={2}
            decay={2}
          />
          <pointLight
            position={[width / 2, -height / 2, 0.3]}
            color={colors.neonColor}
            intensity={0.5}
            distance={2}
            decay={2}
          />
        </>
      )}
    </group>
  );
}
