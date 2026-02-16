import { useRef } from 'react';

export default function ParkingArea({ timeData }) {
  const parkingRef = useRef();

  // Determine if street lights should be on
  const lightsOn = timeData && (timeData.timeOfDay === 'dusk' || timeData.timeOfDay === 'night' || timeData.timeOfDay === 'dawn');

  return (
    <group ref={parkingRef} position={[8, 0, -35]}>
      {/* Main Parking Lot Surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[35, 25]} />
        <meshBasicMaterial color="#2C2C2C" /> {/* Dark asphalt color */}
      </mesh>

      {/* Road Leading to Buildings */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 25]} receiveShadow>
        <planeGeometry args={[8, 15]} />
        <meshBasicMaterial color="#2C2C2C" />
      </mesh>

      {/* Sidewalk */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 32]} receiveShadow>
        <planeGeometry args={[40, 2]} />
        <meshBasicMaterial color="#C0C0C0" /> {/* Light concrete color */}
      </mesh>

      {/* Parking Space Lines */}
      {/* Horizontal lines */}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh 
          key={`h-line-${i}`}
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[-15 + (i * 6), 0.02, 0]} 
        >
          <planeGeometry args={[0.2, 25]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
      ))}

      {/* Vertical lines */}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh 
          key={`v-line-${i}`}
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[0, 0.02, -10 + (i * 4)]} 
        >
          <planeGeometry args={[35, 0.2]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
      ))}

      {/* Center Road Divider */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 10]} receiveShadow>
        <planeGeometry args={[0.3, 15]} />
        <meshBasicMaterial color="#FFFF00" /> {/* Yellow center line */}
      </mesh>

      {/* Parking Space Numbers */}
      {Array.from({ length: 20 }, (_, i) => {
        const row = Math.floor(i / 5);
        const col = i % 5;
        return (
          <mesh 
            key={`number-${i}`}
            rotation={[-Math.PI / 2, 0, 0]} 
            position={[-12 + (col * 6), 0.025, -8 + (row * 4)]} 
          >
            <planeGeometry args={[0.8, 0.8]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
        );
      })}

      {/* Street Light Poles */}
      {Array.from({ length: 6 }, (_, i) => (
        <group key={`pole-${i}`} position={[-15 + (i * 7), 0, 3]}>
          {/* Light Pole */}
          <mesh position={[0, 3, 0]}>
            <cylinderGeometry args={[0.1, 0.15, 6, 8]} />
            <meshBasicMaterial color="#333333" />
          </mesh>
          
          {/* Light Fixture */}
          <mesh position={[0, 5.8, 0]}>
            <cylinderGeometry args={[0.4, 0.3, 0.4, 8]} />
            <meshBasicMaterial color="#444444" />
          </mesh>
          
          {/* Light Bulb/LED */}
          <mesh position={[0, 5.6, 0]}>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshBasicMaterial 
              color={lightsOn ? "#FFEB3B" : "#CCCCCC"}
              transparent
              opacity={lightsOn ? 1 : 0.3}
            />
          </mesh>
          
          {/* Light Cast (when lights are on) */}
          {lightsOn && (
            <pointLight
              position={[0, 5.5, 0]}
              intensity={0.6}
              distance={12}
              color="#FFA726"
              castShadow
            />
          )}
        </group>
      ))}

      {/* Additional Perimeter Light Poles */}
      {Array.from({ length: 4 }, (_, i) => (
        <group key={`perimeter-pole-${i}`} position={[16, 0, -15 + (i * 5)]}>
          {/* Light Pole */}
          <mesh position={[0, 3, 0]}>
            <cylinderGeometry args={[0.1, 0.15, 6, 8]} />
            <meshBasicMaterial color="#333333" />
          </mesh>
          
          {/* Light Fixture */}
          <mesh position={[0, 5.8, 0]}>
            <cylinderGeometry args={[0.4, 0.3, 0.4, 8]} />
            <meshBasicMaterial color="#444444" />
          </mesh>
          
          {/* Light Bulb/LED */}
          <mesh position={[0, 5.6, 0]}>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshBasicMaterial 
              color={lightsOn ? "#FFEB3B" : "#CCCCCC"}
              transparent
              opacity={lightsOn ? 1 : 0.3}
            />
          </mesh>
          
          {/* Light Cast */}
          {lightsOn && (
            <pointLight
              position={[0, 5.5, 0]}
              intensity={0.6}
              distance={12}
              color="#FFA726"
            />
          )}
        </group>
      ))}

      {/* Parking Entrance Sign */}
      <group position={[-12, 0, -12]}>
        {/* Sign Post */}
        <mesh position={[0, 1.5, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 3, 8]} />
          <meshBasicMaterial color="#333333" />
        </mesh>
        
        {/* Sign Board */}
        <mesh position={[0, 2.8, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[2, 1, 0.1]} />
          <meshBasicMaterial color="#0066CC" />
        </mesh>
        
        {/* "PARKING" text area */}
        <mesh position={[0, 2.8, 0.06]}>
          <planeGeometry args={[1.8, 0.4]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
      </group>

      {/* Traffic Cones for Construction/Safety */}
      {Array.from({ length: 3 }, (_, i) => (
        <group key={`cone-${i}`} position={[10 + (i * 2), 0, -12]}>
          <mesh position={[0, 0.3, 0]}>
            <coneGeometry args={[0.2, 0.6, 8]} />
            <meshBasicMaterial color="#FF6600" />
          </mesh>
          
          {/* White stripes on cone */}
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[0.15, 0.18, 0.08, 8]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
        </group>
      ))}

      {/* Curb Stones */}
      {/* Front curb */}
      <mesh position={[0, 0.1, -12.5]} receiveShadow>
        <boxGeometry args={[35, 0.2, 0.5]} />
        <meshBasicMaterial color="#CCCCCC" />
      </mesh>
      
      {/* Back curb */}
      <mesh position={[0, 0.1, 12.5]} receiveShadow>
        <boxGeometry args={[35, 0.2, 0.5]} />
        <meshBasicMaterial color="#CCCCCC" />
      </mesh>
      
      {/* Side curbs */}
      <mesh position={[-17.5, 0.1, 0]} receiveShadow>
        <boxGeometry args={[0.5, 0.2, 25]} />
        <meshBasicMaterial color="#CCCCCC" />
      </mesh>
      
      <mesh position={[17.5, 0.1, 0]} receiveShadow>
        <boxGeometry args={[0.5, 0.2, 25]} />
        <meshBasicMaterial color="#CCCCCC" />
      </mesh>

      {/* Landscaping Elements */}
      {/* Small planted areas */}
      {Array.from({ length: 4 }, (_, i) => (
        <group key={`landscape-${i}`} position={[-14 + (i * 9), 0, 11]}>
          {/* Planter box */}
          <mesh position={[0, 0.2, 0]}>
            <boxGeometry args={[1.5, 0.4, 1.5]} />
            <meshBasicMaterial color="#8B4513" /> {/* Brown wood */}
          </mesh>
          
          {/* Soil */}
          <mesh position={[0, 0.35, 0]}>
            <boxGeometry args={[1.4, 0.1, 1.4]} />
            <meshBasicMaterial color="#654321" />
          </mesh>
          
          {/* Small plant */}
          <mesh position={[0, 0.6, 0]}>
            <sphereGeometry args={[0.3, 8, 8]} />
            <meshBasicMaterial color="#228B22" />
          </mesh>
        </group>
      ))}

      {/* Parking Meter (optional detail) */}
      <group position={[-8, 0, -10]}>
        <mesh position={[0, 0.6, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 1.2, 8]} />
          <meshBasicMaterial color="#333333" />
        </mesh>
        
        <mesh position={[0, 1.1, 0]}>
          <boxGeometry args={[0.2, 0.3, 0.1]} />
          <meshBasicMaterial color="#0066CC" />
        </mesh>
      </group>
    </group>
  );
}