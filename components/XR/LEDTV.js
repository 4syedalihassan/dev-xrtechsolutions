import { useRef, useState } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export default function LEDTV({ 
  position = [0, 0, 0], 
  rotation = [0, 0, 0], 
  size = [3, 1.7], // 16:9 aspect ratio TV
  content = "TB Awareness",
  isOn = true 
}) {
  const tvRef = useRef();
  const [isInteracted, setIsInteracted] = useState(false);
  
  const [width, height] = size;
  const depth = 0.1;
  const frameThickness = 0.05;
  
  return (
    <group position={position} rotation={rotation}>
      {/* TV Frame/Bezel */}
      <mesh castShadow>
        <boxGeometry args={[width + frameThickness, height + frameThickness, depth]} />
        <meshBasicMaterial 
          color="#1a1a1a" // Dark TV frame
        />
      </mesh>
      
      {/* TV Screen */}
      <mesh position={[0, 0, depth / 2 + 0.001]} ref={tvRef}>
        <planeGeometry args={[width - 0.1, height - 0.1]} />
        <meshBasicMaterial
          color={isOn ? "#000020" : "#000000"}
        />
      </mesh>
      
      {/* LED indicator light */}
      <mesh position={[width / 2 - 0.2, -height / 2 + 0.1, depth / 2 + 0.002]}>
        <circleGeometry args={[0.02, 8]} />
        <meshBasicMaterial 
          color={isOn ? "#00ff00" : "#ff0000"}
        />
      </mesh>
      
      {/* TV Content - Simple Text Display */}
      {isOn && (
        <mesh position={[0, 0, depth / 2 + 0.002]}>
          <planeGeometry args={[width - 0.2, height - 0.2]} />
          <meshBasicMaterial
            color="#1e3c72"
            transparent={true}
            opacity={0.9}
          />
        </mesh>
      )}
      
      {/* TV Stand/Mount (small bracket) */}
      <mesh position={[0, -height / 2 - 0.1, -0.05]}>
        <boxGeometry args={[0.3, 0.1, 0.1]} />
        <meshBasicMaterial 
          color="#2a2a2a"
        />
      </mesh>
      
      {/* Wall mount bracket */}
      <mesh position={[0, 0, -depth / 2 - 0.05]}>
        <boxGeometry args={[width * 0.6, 0.1, 0.1]} />
        <meshBasicMaterial 
          color="#404040"
        />
      </mesh>
    </group>
  );
}