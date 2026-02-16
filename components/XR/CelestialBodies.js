import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Moon from './Moon';
import Stars from './Stars';
import Clouds from './Clouds';

export default function CelestialBodies({ timeData }) {
  const sunRef = useRef();
  const sunGroupRef = useRef();
  const moonPosition = useRef([0, 0, 0]);
  const moonOpacity = useRef(1);

  // Calculate current time outside useFrame for JSX conditions
  const timeDecimal = timeData ? timeData.hour + timeData.minute / 60 : 12;


  useFrame(() => {
    if (!timeData) return;

    const { hour, minute } = timeData;
    
    // Calculate time as decimal (0-24)
    const timeDecimal = hour + minute / 60;
    
    // Calculate celestial positions based on realistic horizon movement
    
    // Sun position: Rises at 6 AM (East), Zenith at 12 PM, Sets at 6 PM (West)
    let sunAzimuth, sunElevation;
    let moonAzimuth, moonElevation;
    
    if (timeDecimal >= 6 && timeDecimal <= 18) {
      // Daytime: sun moves from east (90°) to west (270°)
      sunAzimuth = 90 + ((timeDecimal - 6) / 12) * 180; // 90° to 270°
      
      // Sun elevation: starts at horizon (0°), peaks at zenith (80°), back to horizon
      const noonProgress = (timeDecimal - 6) / 12; // 0 to 1
      sunElevation = Math.sin(noonProgress * Math.PI) * 80; // 0° to 80° back to 0°
    } else {
      // Night: sun below horizon
      sunAzimuth = timeDecimal < 6 ? 90 : 270; // East or West
      sunElevation = -20; // Below horizon
    }
    
    // Moon position: Rises at 6 PM (East), Zenith at 12 AM, Sets at 6 AM (West)
    if (timeDecimal >= 18 || timeDecimal <= 6) {
      // Night time: moon moves from east to west
      const nightProgress = timeDecimal >= 18 ? 
        (timeDecimal - 18) / 12 : // 18-24 hours (0-0.5)
        (timeDecimal + 6) / 12;   // 0-6 hours (0.5-1)
      
      moonAzimuth = 270 + (nightProgress * 180); // 270° to 450° (wraps to 90°)
      
      // Moon elevation: starts at horizon, peaks at zenith, back to horizon
      moonElevation = Math.sin(nightProgress * Math.PI) * 70; // 0° to 70° back to 0°
    } else {
      // Day: moon below horizon or very low
      moonAzimuth = timeDecimal < 12 ? 270 : 90; // Opposite to sun
      moonElevation = -10; // Below or at horizon
    }

    // Update sun position using azimuth and elevation
    if (sunGroupRef.current) {
      const sunDistance = 60;
      
      // Convert azimuth and elevation to 3D coordinates
      const azimuthRad = (sunAzimuth * Math.PI) / 180;
      const elevationRad = (sunElevation * Math.PI) / 180;
      
      // Calculate 3D position from spherical coordinates (4x higher total)
      const sunX = sunDistance * Math.cos(elevationRad) * Math.sin(azimuthRad);
      const sunY = Math.max(32, sunDistance * Math.sin(elevationRad) * 4); // 4x higher, minimum 32
      const sunZ = sunDistance * Math.cos(elevationRad) * Math.cos(azimuthRad);
      
      sunGroupRef.current.position.set(sunX, sunY, sunZ);
      
      // Sun opacity based on time
      if (sunRef.current) {
        let sunOpacity = 1;
        if (timeDecimal < 6 || timeDecimal > 18) {
          sunOpacity = 0; // Hidden at night
        } else if (timeDecimal < 7 || timeDecimal > 17) {
          // Fade during dawn/dusk
          const fadeTime = timeDecimal < 7 ? (7 - timeDecimal) : (timeDecimal - 17);
          sunOpacity = Math.max(0, 1 - fadeTime);
        }
        sunRef.current.material.opacity = sunOpacity;
      }
    }

    // Update moon position using azimuth and elevation
    const moonDistance = 50;
    
    // Convert azimuth and elevation to 3D coordinates
    const azimuthRad = (moonAzimuth * Math.PI) / 180;
    const elevationRad = (moonElevation * Math.PI) / 180;
    
    // Calculate 3D position from spherical coordinates (4x higher total)
    const moonX = moonDistance * Math.cos(elevationRad) * Math.sin(azimuthRad);
    const moonY = Math.max(32, moonDistance * Math.sin(elevationRad) * 4); // 4x higher, minimum 32
    const moonZ = moonDistance * Math.cos(elevationRad) * Math.cos(azimuthRad);
    
    // Store moon position
    moonPosition.current = [moonX, moonY, moonZ];
    
    // Calculate moon opacity based on time
    let calculatedOpacity = 1;
    
    if (timeDecimal >= 7 && timeDecimal <= 17) {
      calculatedOpacity = 0.1; // Very faint during day
    } else if (timeDecimal >= 6 && timeDecimal < 8) {
      // Fade out in morning
      calculatedOpacity = Math.max(0.1, 1 - (timeDecimal - 6) / 2);
    } else if (timeDecimal >= 17 && timeDecimal < 19) {
      // Fade in during evening
      calculatedOpacity = 0.1 + (timeDecimal - 17) / 2 * 0.9;
    }
    
    moonOpacity.current = calculatedOpacity;
  });

  return (
    <>
      {/* Sun - Single Body Only */}
      <group ref={sunGroupRef}>
        <mesh ref={sunRef}>
          <sphereGeometry args={[1.5, 16, 16]} />
          <meshBasicMaterial 
            color="#FDB813"
            transparent
            opacity={1}
          />
        </mesh>
      </group>

      {/* Moon with Realistic Phases */}
      <Moon 
        position={moonPosition.current}
        opacity={moonOpacity.current}
        skyColor={timeData ? timeData.skyColor : "#1a1a2e"}
        shadowColor={timeData ? timeData.shadowColor : "#0f0f40"}
      />

      {/* Stars Component */}
      <Stars timeData={timeData} />

      {/* Clouds Component */}
      <Clouds timeData={timeData} />
    </>
  );
}