import { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import * as THREE from 'three';

export default function Hotspot({ hotspot, content, onActivate, colors, xrMode }) {
  const [hovered, setHovered] = useState(false);
  const [activated, setActivated] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const meshRef = useRef();
  const ringRef = useRef();

  // Animation for hotspot pulsing
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      
      // Pulsing scale animation
      const scale = activated ? 1.2 : (1 + Math.sin(time * 2) * 0.1);
      meshRef.current.scale.setScalar(scale);
      
      // Rotating ring animation
      if (ringRef.current) {
        ringRef.current.rotation.z = time;
      }
      
      // Hover color interpolation
      if (meshRef.current.material) {
        const targetColor = activated ? colors.click : 
                          hovered ? colors.hover : '#ffffff';
        meshRef.current.material.color.lerp(new THREE.Color(targetColor), 0.1);
      }
    }
  });

  const handleClick = (event) => {
    event.stopPropagation();
    
    if (!activated) {
      setActivated(true);
      onActivate(hotspot);
      
      // Play audio if available
      if (hotspot.audio_url) {
        const audio = new Audio(hotspot.audio_url);
        audio.play().catch(() => {});
      }
    }
    
    // Toggle content panel
    setShowPanel(!showPanel);
  };

  const position = [
    hotspot.position.x || 0,
    hotspot.position.y || 1.6,
    hotspot.position.z || -2
  ];

  return (
    <group position={position}>
      {/* Main hotspot sphere */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
      >
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive={activated ? colors.click : hovered ? colors.hover : '#000000'}
          emissiveIntensity={activated ? 0.3 : hovered ? 0.2 : 0.1}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Pulsing ring effect */}
      <mesh ref={ringRef} position={[0, 0, 0]}>
        <ringGeometry args={[0.12, 0.15, 16]} />
        <meshBasicMaterial
          color={colors.hover}
          transparent
          opacity={hovered ? 0.6 : 0.3}
        />
      </mesh>

      {/* Hotspot label */}
      <Text
        position={[0, 0.15, 0]}
        fontSize={0.08}
        color={activated ? colors.click : '#333333'}
        anchorX="center"
        anchorY="bottom"
        maxWidth={2}
      >
        {hotspot.name}
      </Text>

      {/* Content panel */}
      {showPanel && content && (
        <Html
          position={[0, 0.3, 0]}
          transform={!xrMode} // Use screen-space positioning in 2D mode
          occlude
          distanceFactor={xrMode ? 1 : 10}
        >
          <div className="hotspot-panel">
            <button 
              className="close-button"
              onClick={(e) => {
                e.stopPropagation();
                setShowPanel(false);
              }}
            >
              ×
            </button>
            
            {content.title && (
              <h3 style={{ color: colors.click }}>
                {content.title}
              </h3>
            )}
            
            {content.short && (
              <p className="content-short">{content.short}</p>
            )}
            
            {content.body && (
              <div 
                className="content-body"
                dangerouslySetInnerHTML={{ __html: content.body }}
              />
            )}
            
            {content.audio_url && (
              <audio controls className="content-audio">
                <source src={content.audio_url} type="audio/mpeg" />
                Your browser does not support audio playback.
              </audio>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}