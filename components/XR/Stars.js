import { useRef } from 'react';

export default function Stars({ timeData, visible = true }) {
  // Calculate current time
  const timeDecimal = timeData ? timeData.hour + timeData.minute / 60 : 12;
  
  // Only show stars at night
  if (!visible || !timeData || !(timeData.timeOfDay === 'night' || timeData.timeOfDay === 'dusk' || timeDecimal < 6 || timeDecimal > 19)) {
    return null;
  }

  return (
    <group>
      {/* Create a field of stars */}
      {Array.from({ length: 50 }, (_, i) => {
        // Use index for consistent positioning
        const angle1 = (i * 2.4) % (Math.PI * 2);
        const angle2 = (i * 1.1) % Math.PI;
        
        return (
          <mesh
            key={`star-${i}`}
            position={[
              Math.sin(angle1) * (30 + (i % 20)),
              25 + Math.abs(Math.cos(angle2)) * 15,
              Math.cos(angle1) * (30 + (i % 20))
            ]}
          >
            <sphereGeometry args={[0.01, 4, 4]} />
            <meshBasicMaterial 
              color="#FFFFFF"
              transparent
              opacity={(timeDecimal < 6 || timeDecimal > 19) ? 0.8 : 0.4}
            />
          </mesh>
        );
      })}
    </group>
  );
}