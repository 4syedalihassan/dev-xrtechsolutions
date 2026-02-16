import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function SessionEnvironment({ sessionData, onSessionUpdate }) {
  const [currentSession, setCurrentSession] = useState(null);
  const [sessionState, setSessionState] = useState(null);
  const presentationScreenRef = useRef();
  const seatingAreaRef = useRef();
  const lightingRef = useRef();

  // Fetch active session (optional - fails silently if no sessions API)
  useEffect(() => {
    const fetchActiveSession = async () => {
      try {
        const response = await fetch('/api/sessions');
        if (!response.ok) {
          // Silently ignore API errors
          return;
        }
        const data = await response.json();
        
        const activeSession = data.sessions?.find(session => 
          session.status === 'active'
        );
        
        if (activeSession) {
          setCurrentSession(activeSession);
          setSessionState(activeSession.session_state);
        } else {
          setCurrentSession(null);
          setSessionState(null);
        }
      } catch (error) {
        // Silently fail - sessions are optional
      }
    };

    fetchActiveSession();
    
    // Poll for session updates every 5 seconds
    const interval = setInterval(fetchActiveSession, 5000);
    return () => clearInterval(interval);
  }, []);

  // Get session theme colors
  const getThemeColors = () => {
    if (!currentSession?.session_types?.color_scheme) {
      return {
        primary: '#007B83',
        secondary: '#B0E0E6',
        accent: '#FFD700'
      };
    }
    return currentSession.session_types.color_scheme;
  };

  const themeColors = getThemeColors();

  // Show session environment only if there's an active session
  if (!currentSession) {
    return null;
  }

  return (
    <group>
      {/* Presentation Screen */}
      <group ref={presentationScreenRef} position={[0, 2.5, -9.8]}>
        {/* Screen Frame */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[8, 4.5, 0.1]} />
          <meshStandardMaterial 
            color="#2C2C2C"
            roughness={0.3}
            metalness={0.7}
          />
        </mesh>
        
        {/* Screen Surface */}
        <mesh position={[0, 0, 0.06]}>
          <planeGeometry args={[7.5, 4]} />
          <meshBasicMaterial 
            color={sessionState?.is_presentation_mode ? "#F0F8FF" : "#1A1A1A"}
            transparent
            opacity={sessionState?.is_presentation_mode ? 0.9 : 0.3}
          />
        </mesh>

        {/* Session Title Display */}
        {sessionState?.is_presentation_mode && (
          <mesh position={[0, 1.5, 0.07]}>
            <planeGeometry args={[7, 0.8]} />
            <meshBasicMaterial 
              color={themeColors.primary}
              transparent
              opacity={0.8}
            />
          </mesh>
        )}

        {/* Content Area */}
        {sessionState?.is_presentation_mode && (
          <mesh position={[0, -0.2, 0.07]}>
            <planeGeometry args={[7, 2.5]} />
            <meshBasicMaterial 
              color="#FFFFFF"
              transparent
              opacity={0.9}
            />
          </mesh>
        )}
      </group>

      {/* Amphitheater Seating */}
      <group ref={seatingAreaRef}>
        {/* Seating Rows */}
        {Array.from({ length: 4 }, (_, rowIndex) => (
          <group key={`row-${rowIndex}`} position={[0, 0, 2 + rowIndex * 1.5]}>
            {Array.from({ length: 6 - rowIndex }, (_, seatIndex) => {
              const seatSpacing = 1.2;
              const rowWidth = (6 - rowIndex) * seatSpacing;
              const seatX = -rowWidth / 2 + seatIndex * seatSpacing + seatSpacing / 2;
              
              return (
                <group key={`seat-${rowIndex}-${seatIndex}`} position={[seatX, 0, 0]}>
                  {/* Chair Base */}
                  <mesh position={[0, 0.25, 0]}>
                    <boxGeometry args={[0.4, 0.5, 0.4]} />
                    <meshStandardMaterial 
                      color={themeColors.secondary}
                      roughness={0.7}
                      metalness={0.2}
                    />
                  </mesh>
                  
                  {/* Chair Back */}
                  <mesh position={[0, 0.6, -0.15]}>
                    <boxGeometry args={[0.4, 0.6, 0.1]} />
                    <meshStandardMaterial 
                      color={themeColors.secondary}
                      roughness={0.7}
                      metalness={0.2}
                    />
                  </mesh>
                </group>
              );
            })}
          </group>
        ))}
      </group>

      {/* Session-Specific Lighting */}
      <group ref={lightingRef}>
        {/* Presentation Spotlight */}
        {sessionState?.is_presentation_mode && (
          <spotLight
            position={[0, 8, -5]}
            target={presentationScreenRef.current}
            intensity={2}
            angle={Math.PI / 6}
            penumbra={0.3}
            color={themeColors.accent}
            castShadow
          />
        )}

        {/* Ambient Session Lighting */}
        <ambientLight 
          intensity={sessionState?.is_presentation_mode ? 0.3 : 0.6}
          color={themeColors.primary}
        />

        {/* Theme-based Accent Lighting */}
        <pointLight
          position={[-8, 3, 0]}
          intensity={0.5}
          color={themeColors.accent}
          distance={10}
        />
        
        <pointLight
          position={[8, 3, 0]}
          intensity={0.5}
          color={themeColors.accent}
          distance={10}
        />
      </group>

      {/* Session Status Indicators */}
      <group position={[8, 4, -9]}>
        {/* Session Active Indicator */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshBasicMaterial 
            color={currentSession.status === 'active' ? "#00FF00" : "#FF0000"}
            transparent
            opacity={0.8}
          />
        </mesh>

        {/* Participant Count Display */}
        <mesh position={[0, -0.5, 0]}>
          <boxGeometry args={[1, 0.3, 0.1]} />
          <meshBasicMaterial 
            color={themeColors.primary}
            transparent
            opacity={0.7}
          />
        </mesh>
      </group>

      {/* Interactive Session Controls (for presenters) */}
      <group position={[-8, 1.5, -8]}>
        {/* Control Panel */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.5, 1, 0.2]} />
          <meshStandardMaterial 
            color="#2C2C2C"
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>

        {/* Control Buttons */}
        {['Start', 'Pause', 'Next'].map((label, index) => (
          <mesh 
            key={label}
            position={[-0.4 + index * 0.4, 0.1, 0.11]}
            userData={{ 
              type: 'session_control',
              action: label.toLowerCase(),
              session_id: currentSession.id
            }}
          >
            <boxGeometry args={[0.25, 0.15, 0.05]} />
            <meshBasicMaterial 
              color={themeColors.accent}
              transparent
              opacity={0.8}
            />
          </mesh>
        ))}
      </group>

      {/* Topic-Specific 3D Elements */}
      {currentSession.session_types?.name === 'tb_awareness' && (
        <group position={[6, 2, -6]}>
          {/* 3D Lung Model */}
          <mesh>
            <sphereGeometry args={[0.8, 16, 16]} />
            <meshStandardMaterial 
              color="#FF6B6B"
              transparent
              opacity={0.7}
            />
          </mesh>
        </group>
      )}

      {currentSession.session_types?.name === 'heart_health' && (
        <group position={[6, 2, -6]}>
          {/* 3D Heart Model */}
          <mesh>
            <sphereGeometry args={[0.6, 16, 16]} />
            <meshStandardMaterial 
              color="#DC143C"
              transparent
              opacity={0.8}
            />
          </mesh>
        </group>
      )}

      {currentSession.session_types?.name === 'diabetes_sugar' && (
        <group position={[6, 2, -6]}>
          {/* 3D Blood Cell Model */}
          <mesh>
            <sphereGeometry args={[0.4, 12, 12]} />
            <meshStandardMaterial 
              color="#4169E1"
              transparent
              opacity={0.6}
            />
          </mesh>
        </group>
      )}

      {currentSession.session_types?.name === 'breast_cancer' && (
        <group position={[6, 2, -6]}>
          {/* Awareness Ribbon */}
          <mesh>
            <torusGeometry args={[0.5, 0.1, 8, 16]} />
            <meshStandardMaterial 
              color="#FF1493"
              transparent
              opacity={0.8}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}