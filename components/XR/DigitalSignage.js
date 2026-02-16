// =====================================================
// DIGITAL SIGNAGE - 3D Building Signboard Component
// Sprint: Phase 2.4.1 - Advanced Signboard Management
// Version: 2.0.0 - Config-driven rendering
// =====================================================

import { useState, useEffect, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { TextureLoader } from 'three';

export default function DigitalSignage({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  buildingId = "building_1",
  defaultName = "Building Name",
  width = 6,
  height = 1.5,
  neonEnabled = false  // Disabled by default - use config colors instead
}) {
  const [buildingData, setBuildingData] = useState({
    name: defaultName,
    status: 'OPEN',
    isOperational: true
  });

  const [signboardConfig, setSignboardConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  // Refs for animation
  const groupRef = useRef();
  const timeRef = useRef(0);

  // Fetch building data and signboard config
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch building status
        const buildingUrl = `/api/buildings/${buildingId}?t=${Date.now()}`;
        console.log('[DigitalSignage] Fetching building:', buildingUrl);
        const buildingResponse = await fetch(buildingUrl);

        if (buildingResponse.ok) {
          const buildingData = await buildingResponse.json();
          setBuildingData({
            name: buildingData.building?.name || defaultName,
            status: buildingData.building?.status || 'OPEN',
            isOperational: buildingData.building?.is_operational !== false
          });
        }

        // Fetch signboard configuration
        const signboardUrl = `/api/buildings/${buildingId}/signboard?t=${Date.now()}`;
        console.log('[DigitalSignage] Fetching signboard:', signboardUrl);
        const signboardResponse = await fetch(signboardUrl);

        if (signboardResponse.ok) {
          const signboardData = await signboardResponse.json();
          if (signboardData.success && signboardData.signboard_config) {
            setSignboardConfig(signboardData.signboard_config);
          }
        } else {
          console.error(`[DigitalSignage] Failed to fetch signboard config for ${buildingId}:`, signboardResponse.status);
        }
      } catch (error) {
        console.error('Failed to fetch signboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchData, 30000);

    return () => clearInterval(interval);
  }, [buildingId, defaultName]);

  // Use config values or fallback to defaults
  const config = signboardConfig || {
    name: defaultName,
    bg_color: '#FFFFFF',  // White background
    text_color: '#000000',  // Black text for visibility on white
    border_color: '#000000',  // Black border
    border_width: 0.1,
    signboard_width: width,
    signboard_height: height,
    opacity: 1.0,
    logo_url: null,
    logo_position: 'center',  // Center logo by default
    logo_size: 1.0
  };

  const signWidth = config.signboard_width || width;
  const signHeight = config.signboard_height || height;
  const borderWidth = config.border_width || 0.1;
  const opacity = config.opacity || 1.0;

  // Gentle idle animation
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    timeRef.current += delta;

    // Subtle floating motion - add to initial position instead of replacing it
    groupRef.current.position.y = position[1] + Math.sin(timeRef.current * 0.5) * 0.02;
  });

  if (loading) {
    return null; // Don't render while loading
  }

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Border frame */}
      {borderWidth > 0 && (
        <mesh position={[0, 0, -0.01]}>
          <boxGeometry args={[signWidth + borderWidth * 2, signHeight + borderWidth * 2, 0.05]} />
          <meshStandardMaterial
            color={config.border_color || '#FFFFFF'}
            transparent={opacity < 1.0}
            opacity={opacity}
          />
        </mesh>
      )}

      {/* Main signboard background */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[signWidth, signHeight, 0.04]} />
        <meshStandardMaterial
          color={config.bg_color || '#000000'}
          transparent={opacity < 1.0}
          opacity={opacity}
        />
      </mesh>

      {/* Logo rendering (if provided) */}
      {config.logo_url && (
        <LogoImage
          logoUrl={config.logo_url}
          position={config.logo_position || 'left'}
          size={config.logo_size || 1.0}
          logoWidth={config.logo_width || 2.0}
          logoHeight={config.logo_height || 2.0}
          signWidth={signWidth}
          signHeight={signHeight}
          offsetX={config.logo_offset_x || 0}
          offsetY={config.logo_offset_y || 0}
        />
      )}

      {/* Building name text (only show if text is not empty) */}
      {config.name && config.name.trim() !== '' && (
        <Text
          position={[
            config.logo_position === 'left' && config.logo_url ? signWidth * 0.15 : 0,
            config.logo_position === 'center' && config.logo_url ? -signHeight * 0.35 : signHeight * 0.15,
            0.025
          ]}
          fontSize={Math.min(signHeight * 0.4, 0.7) * (config.name_font_size || 1.0)}
          color={config.text_color || '#000000'}
          anchorX="center"
          anchorY="middle"
          maxWidth={config.logo_url ? signWidth * 0.65 : signWidth * 0.9}
          textAlign="center"
          font={config.name_font_family === 'Arial' ? undefined : config.name_font_family}
        >
          {config.name}
        </Text>
      )}

      {/* Status indicator (small, bottom corner) - only show if there's text */}
      {config.name && config.name.trim() !== '' && (
        <Text
          position={[signWidth * 0.4, -signHeight * 0.35, 0.025]}
          fontSize={0.15}
          color={buildingData.isOperational ? '#4ade80' : '#ff6b6b'}
          anchorX="right"
          anchorY="bottom"
        >
          {buildingData.isOperational ? '● OPEN' : '● CLOSED'}
        </Text>
      )}
    </group>
  );
}

/**
 * Logo Image Component
 * Loads and displays logo texture on signboard with proper aspect ratio
 */
function LogoImage({ logoUrl, position, size, logoWidth, logoHeight, signWidth, signHeight, offsetX, offsetY }) {
  const [texture, setTexture] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!logoUrl) {
      return;
    }

    const loader = new TextureLoader();
    loader.load(
      logoUrl,
      (loadedTexture) => {
        setTexture(loadedTexture);
        setError(false);
      },
      undefined,
      () => {
        setError(true);
      }
    );
  }, [logoUrl]);

  if (error || !texture) {
    return null; // Don't render if logo failed to load
  }

  // Calculate logo position based on config
  let logoX = offsetX;
  let logoY = offsetY;

  switch (position) {
    case 'left':
      logoX = -signWidth * 0.3 + offsetX;
      logoY = 0 + offsetY;
      break;
    case 'right':
      logoX = signWidth * 0.3 + offsetX;
      logoY = 0 + offsetY;
      break;
    case 'above':
      logoX = 0 + offsetX;
      logoY = signHeight * 0.3 + offsetY;
      break;
    case 'center':
      logoX = 0 + offsetX;
      logoY = 0 + offsetY;
      break;
  }

  // Use explicit width/height from config to prevent stretching
  // Apply size multiplier for backward compatibility
  const finalWidth = logoWidth * size;
  const finalHeight = logoHeight * size;

  return (
    <mesh position={[logoX, logoY, 0.025]}>
      <planeGeometry args={[finalWidth, finalHeight]} />
      <meshStandardMaterial
        map={texture}
        transparent={true}
        opacity={1.0}
      />
    </mesh>
  );
}

// =====================================================
// USAGE EXAMPLE
// =====================================================
/**
 * <DigitalSignage
 *   position={[0, 5, 0]}
 *   rotation={[0, 0, 0]}
 *   buildingId="healthcare-center-uuid"
 *   defaultName="Healthcare Center"
 *   width={12}
 *   height={1.8}
 * />
 */
