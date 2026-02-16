import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';

export default function DynamicLighting({ timeData }) {
  const directionalLightRef = useRef();
  const ambientLightRef = useRef();

  // Update lighting based on time of day
  useFrame(() => {
    if (directionalLightRef.current) {
      directionalLightRef.current.intensity = timeData.lightIntensity;
      
      // Adjust light position based on time of day
      const { hour } = timeData;
      let sunAngle = 0;
      
      if (hour >= 6 && hour <= 18) {
        // Sun moves from east to west during day
        sunAngle = ((hour - 6) / 12) * Math.PI; // 0 to PI (east to west)
      } else {
        // Moon position at night
        sunAngle = hour < 6 ? Math.PI * 1.5 : Math.PI * 0.5;
      }
      
      // Calculate light position based on angle
      const lightX = Math.sin(sunAngle) * 15;
      const lightY = Math.max(5, Math.cos(sunAngle) * 15); // Keep above ground
      const lightZ = 5;
      
      directionalLightRef.current.position.set(lightX, lightY, lightZ);
      
      // Adjust light color based on time
      if (timeData.timeOfDay === 'dawn') {
        directionalLightRef.current.color.setHex(0xFFB366); // Orange morning light
      } else if (timeData.timeOfDay === 'day') {
        directionalLightRef.current.color.setHex(0xFFFFFF); // White daylight
      } else if (timeData.timeOfDay === 'dusk') {
        directionalLightRef.current.color.setHex(0xFF6B35); // Orange evening light
      } else {
        directionalLightRef.current.color.setHex(0x9BB5FF); // Cool blue moonlight
      }
    }

    if (ambientLightRef.current) {
      ambientLightRef.current.intensity = timeData.ambientIntensity;
    }
  });

  return (
    <>
      {/* Main directional light (sun/moon) */}
      <directionalLight
        ref={directionalLightRef}
        intensity={timeData.lightIntensity}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
      />
      
      {/* Ambient light for overall scene illumination */}
      <ambientLight 
        ref={ambientLightRef}
        intensity={timeData.ambientIntensity}
        color={timeData.timeOfDay === 'night' ? '#4169E1' : '#FFFFFF'}
      />
      
      {/* Additional evening/night lights */}
      {(timeData.timeOfDay === 'dusk' || timeData.timeOfDay === 'night') && (
        <>
          {/* Building exterior lights */}
          <pointLight
            position={[0, 6, -12]}
            intensity={0.5}
            distance={20}
            color="#FFEB3B"
          />
          <pointLight
            position={[16.3, 6, -10]}
            intensity={0.5}
            distance={20}
            color="#FFEB3B"
          />
          
          {/* Street lighting effect */}
          <pointLight
            position={[-10, 4, 0]}
            intensity={0.3}
            distance={25}
            color="#FFA726"
          />
          <pointLight
            position={[25, 4, 0]}
            intensity={0.3}
            distance={25}
            color="#FFA726"
          />
        </>
      )}
    </>
  );
}