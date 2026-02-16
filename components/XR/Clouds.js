import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export default function Clouds({ timeData, visible = true }) {
  const cloudsRef = useRef();
  
  // Calculate current time
  const timeDecimal = timeData ? timeData.hour + timeData.minute / 60 : 12;
  
  // Animate clouds moving in a consistent direction
  useFrame((state) => {
    if (cloudsRef.current) {
      // Move clouds slowly from east to west (like real clouds)
      cloudsRef.current.rotation.y += 0.0002; // Very slow rotation for natural movement
    }
  });
  
  // Only show clouds during day
  if (!visible || !timeData || timeDecimal < 8 || timeDecimal > 17) {
    return null;
  }

  return (
    <group ref={cloudsRef}>
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const distance = 25 + (i % 3) * 5;
        const cloudHeight = 30 + Math.sin(i * 0.5) * 6; // 2x higher than before
        
        return (
          <group
            key={`cloud-${i}`}
            position={[
              Math.sin(angle) * distance,
              cloudHeight,
              Math.cos(angle) * distance
            ]}
            rotation={[0, angle, 0]}
          >
            {/* Main cloud body - larger ellipse */}
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[3 + (i % 2), 16, 8]} />
              <meshBasicMaterial 
                color="#F8F8FF"
                transparent
                opacity={0.3}
              />
            </mesh>
            
            {/* Cloud bumps for more realistic shape */}
            <mesh position={[-1.5, 0.5, 0]}>
              <sphereGeometry args={[2, 12, 8]} />
              <meshBasicMaterial 
                color="#F8F8FF"
                transparent
                opacity={0.3}
              />
            </mesh>
            
            <mesh position={[1.8, 0.3, 0.5]}>
              <sphereGeometry args={[1.8, 12, 8]} />
              <meshBasicMaterial 
                color="#F8F8FF"
                transparent
                opacity={0.3}
              />
            </mesh>
            
            <mesh position={[0.5, -0.5, -1]}>
              <sphereGeometry args={[1.5, 12, 8]} />
              <meshBasicMaterial 
                color="#F8F8FF"
                transparent
                opacity={0.3}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}