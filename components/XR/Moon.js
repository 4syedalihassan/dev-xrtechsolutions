import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Moon({ position, opacity = 1, skyColor = "#1a1a2e", shadowColor = "#0f0f40" }) {
  const moonRef = useRef();
  const glowRef = useRef();

  // Calculate moon phase based on current date
  const calculateMoonPhase = () => {
    const now = new Date();
    
    // Known new moon date: January 1, 2000 at 18:14 UTC
    const knownNewMoon = new Date('2000-01-06T18:14:00Z');
    const lunarCycle = 29.530588853; // days
    
    // Calculate days since known new moon
    const daysSince = (now - knownNewMoon) / (1000 * 60 * 60 * 24);
    
    // Calculate current lunar cycle position (0 = new moon, 0.5 = full moon)
    const phasePosition = (daysSince % lunarCycle) / lunarCycle;
    
    // Return phase information
    return {
      position: phasePosition, // 0-1 where 0 is new moon, 0.5 is full moon
      illumination: Math.cos((phasePosition - 0.5) * 2 * Math.PI) * 0.5 + 0.5, // 0-1 brightness
      phaseName: getPhaseName(phasePosition)
    };
  };

  const getPhaseName = (position) => {
    if (position < 0.0625) return 'New Moon';
    if (position < 0.1875) return 'Waxing Crescent';
    if (position < 0.3125) return 'First Quarter';
    if (position < 0.4375) return 'Waxing Gibbous';
    if (position < 0.5625) return 'Full Moon';
    if (position < 0.6875) return 'Waning Gibbous';
    if (position < 0.8125) return 'Last Quarter';
    if (position < 0.9375) return 'Waning Crescent';
    return 'New Moon';
  };

  // Get current moon phase data
  const currentPhase = useMemo(() => calculateMoonPhase(), []);

  // Create realistic moon phase material using simple approach
  const moonMaterial = useMemo(() => {
    const material = new THREE.ShaderMaterial({
      transparent: true,
      uniforms: {
        phase: { value: currentPhase.position },
        moonColor: { value: new THREE.Color('#E6E6FA') },
        opacity: { value: 1.0 }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        void main() {
          vUv = uv;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float phase;
        uniform vec3 moonColor;
        uniform float opacity;
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          // Convert UV to centered coordinates (-1 to 1)
          vec2 pos = (vUv - 0.5) * 2.0;
          float dist = length(pos);
          
          // Discard pixels outside circle
          if (dist > 1.0) discard;
          
          // Calculate realistic lunar terminator line
          // Phase 0.0 = New Moon, 0.5 = Full Moon, 1.0 = New Moon
          float phaseAngle = phase * 6.28318; // Convert to full circle
          
          // Calculate the position of the terminator (day/night boundary)
          float terminator = cos(phaseAngle - 3.14159); // Offset for correct orientation
          
          // Create smooth crescent shape
          float illuminated = 1.0;
          
          // Calculate distance from terminator line with smooth falloff
          float termDist = pos.x - terminator;
          
          if (phase < 0.5) {
            // Waxing phases (New → Full)
            illuminated = smoothstep(-0.1, 0.1, termDist);
          } else {
            // Waning phases (Full → New)
            illuminated = smoothstep(-0.1, 0.1, -termDist);
          }
          
          // Add subtle 3D sphere shading
          float sphereShading = 1.0 - (dist * dist * 0.2);
          illuminated *= sphereShading;
          
          // Ensure new moon is nearly invisible
          if (phase < 0.05 || phase > 0.95) {
            illuminated *= 0.1;
          }
          
          // Soft circular edge
          float edge = 1.0 - smoothstep(0.9, 1.0, dist);
          illuminated *= edge;
          
          // Apply subtle color variation based on phase
          vec3 finalColor = moonColor;
          if (illuminated < 0.3) {
            finalColor = mix(moonColor * 0.7, moonColor, illuminated / 0.3);
          }
          
          gl_FragColor = vec4(finalColor, opacity * illuminated);
        }
      `
    });
    return material;
  }, []);

  useFrame(() => {
    if (moonRef.current) {
      // Update shader uniforms
      moonRef.current.material.uniforms.phase.value = currentPhase.position;
      moonRef.current.material.uniforms.opacity.value = opacity;
    }

    if (glowRef.current) {
      // Glow intensity based on phase
      const glowOpacity = currentPhase.illumination * 0.3;
      glowRef.current.material.opacity = opacity * glowOpacity;
    }
  });

  return (
    <group position={position}>
      {/* Main moon body with phase shader */}
      <mesh ref={moonRef}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <primitive object={moonMaterial} />
      </mesh>
      
      {/* Moon glow effect */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.8, 16, 16]} />
        <meshBasicMaterial 
          color="#B0C4DE"
          transparent
          opacity={opacity * 0.2}
        />
      </mesh>
    </group>
  );
}