import { Canvas } from '@react-three/fiber';
import { Suspense, useState, useEffect } from 'react';
import SceneLoader from './SceneLoader';
import HUD from '../UI/HUD';
import FirstPersonControls from './FirstPersonControls';
import PointerLockOverlay from '../UI/PointerLockOverlay';
import TimeManager, { useTimeOfDay } from './TimeManager';
import DynamicLighting from './DynamicLighting';
import CelestialBodies from './CelestialBodies';
import WebGLErrorBoundary from './WebGLErrorBoundary';
import CrosshairInteraction from './CrosshairInteraction';
import AmbientMusic from '../Audio/AmbientMusic';
import PostProcessing, { detectPerformancePreset } from './PostProcessing';
import EnvironmentSetup from './EnvironmentSetup';
import MobileControls from './MobileControls';
import RadioPlayer from '../UI/RadioPlayer';
import CartButton from '../UI/CartButton';
import { VolumeControl } from '../Audio/SoundManager';

export default function XRCanvas({ config, session, onProductClick, onProductHover }) {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [player, setPlayer] = useState(null);
  const [xrMode, setXrMode] = useState(false);
  const [doorOpen, setDoorOpen] = useState(false);
  const [perfumeShopDoorOpen, setPerfumeShopDoorOpen] = useState(false);
  const [playerPosition, setPlayerPosition] = useState([16.3, 2.0, -13]);
  const [webglSupported, setWebglSupported] = useState(true);
  const [performancePreset, setPerformancePreset] = useState(null);
  const [mobileMove, setMobileMove] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Get current time data
  const timeData = useTimeOfDay();

  // Check WebGL support and detect performance capabilities on component mount
  useEffect(() => {
    const checkWebGL = () => {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        setWebglSupported(!!gl);

        // Detect performance preset for post-processing
        if (gl) {
          const preset = detectPerformancePreset();
          setPerformancePreset(preset);
        }
      } catch (e) {
        console.error('WebGL check failed:', e);
        setWebglSupported(false);
      }
    };

    checkWebGL();
  }, []);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                     window.innerWidth <= 768;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const currentScene = config.products && config.products.length > 0 ? {
    name: 'XR Tech Store',
    products: config.products,
    buildings: config.buildings || []
  } : null;
  const canGoNext = false; // Single scene mode for shopping
  const canGoPrev = false; // Single scene mode for shopping

  const handleNextScene = () => {
    if (canGoNext) {
      setCurrentSceneIndex(prev => prev + 1);
    }
  };

  const handlePrevScene = () => {
    if (canGoPrev) {
      setCurrentSceneIndex(prev => prev - 1);
    }
  };

  const handleXRModeChange = (isXR) => {
    setXrMode(isXR);
  };


  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
      } catch (error) {
        console.warn('Fullscreen not available:', error);
      }
    } else {
      try {
        await document.exitFullscreen();
      } catch (error) {
        console.warn('Exit fullscreen failed:', error);
      }
    }
  };

  // Show fallback message if WebGL is not supported
  if (!webglSupported) {
    return (
      <div className="xr-container" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#1a1a1a',
        color: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#ff6b6b', marginBottom: '20px' }}>
          WebGL Not Supported
        </h2>
        <p style={{ fontSize: '18px', marginBottom: '15px' }}>
          This 3D experience requires WebGL, which is not available in your current browser or device.
        </p>
        <div style={{ backgroundColor: '#333', padding: '20px', borderRadius: '8px', maxWidth: '600px' }}>
          <h3>Try these solutions:</h3>
          <ul style={{ textAlign: 'left', lineHeight: '1.6' }}>
            <li>Update your browser to the latest version</li>
            <li>Enable hardware acceleration in browser settings</li>
            <li>Try a different browser (Chrome, Firefox, Safari)</li>
            <li>Update your graphics drivers</li>
          </ul>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          style={{
            marginTop: '20px',
            padding: '12px 24px',
            backgroundColor: '#007B83',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Reload Page
        </button>
      </div>
    );
  }

  return (
    <div className="xr-container">
      {/* Control Buttons */}
      <div className="xr-buttons" style={{ display: 'flex', gap: isMobile ? '0.5rem' : '0.75rem', alignItems: 'flex-start' }}>
        <button 
          onClick={toggleFullscreen} 
          style={{
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            borderRadius: isMobile ? '6px' : '8px',
            padding: isMobile ? '0.4rem 0.6rem' : '0.75rem 1rem',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: isMobile ? '0.7rem' : '0.9rem',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease'
          }}
        >
          {isMobile ? '⛶' : 'Fullscreen'}
        </button>
      </div>

      {/* Pointer Lock Overlay */}
      <PointerLockOverlay />

      {/* Ambient Music for Perfume Shop */}
      <AmbientMusic
        playerPosition={playerPosition}
        shopBounds={{
          minX: 14 - 6,   // Perfume shop X position (14) - half width (6)
          maxX: 14 + 6,   // Perfume shop X position (14) + half width (6)
          minZ: -4,       // Perfume shop Z position (0) - half depth (4)
          maxZ: 4         // Perfume shop Z position (0) + half depth (4)
        }}
      />

      {/* HUD Overlay */}
      <HUD
        player={player}
        currentScene={currentScene}
        sceneIndex={1}
        totalScenes={1}
        onNext={null}
        onPrev={null}
        projectColors={config.project}
        xrMode={xrMode}
        timeData={timeData}
      />

      {/* 3D Canvas with WebGL Error Boundary */}
      <WebGLErrorBoundary>
        <Canvas
          className="webxr-canvas"
          camera={{
            position: [16.3, 2.0, -13],  // Starting in front of perfume shop door
            fov: 60,  // Natural human eye field of view
            rotation: [0, 0, 0]  // Facing south towards shop entrance
          }}
          gl={{ 
            antialias: false,
            alpha: false,
            powerPreference: "default",
            failIfMajorPerformanceCaveat: false,
            preserveDrawingBuffer: false
          }}
          onCreated={() => {}}
        >
          {/* Enhanced Environment Setup with HDR lighting for PBR materials */}
          {/* Season auto-detects: winter (Nov 15 - Jan 15), summer (rest of year) */}
          <EnvironmentSetup timeData={timeData} />

          {/* DISABLED: DynamicLighting conflicts with EnvironmentSetup - causes double lighting and excessive bloom */}
          {/* <DynamicLighting timeData={timeData} /> */}

          {/* Sun, Moon, and Stars */}
          <CelestialBodies timeData={timeData} />

          {/* Environment */}
          <Suspense fallback={null}>
            {/* Dynamic sky background based on time */}
            <color attach="background" args={[timeData.skyColor]} />
          </Suspense>

          {/* Scene Content */}
          <Suspense fallback={<LoadingBox />}>
            <SceneLoader
              scene={currentScene}
              config={config}
              session={session}
              player={player}
              setPlayer={setPlayer}
              xrMode={xrMode}
              doorOpen={doorOpen}
              setDoorOpen={setDoorOpen}
              perfumeShopDoorOpen={perfumeShopDoorOpen}
              setPerfumeShopDoorOpen={setPerfumeShopDoorOpen}
              playerPosition={playerPosition}
              timeData={timeData}
              onProductClick={onProductClick}
            />
          </Suspense>

          {/* First Person Controls - Camera rotation only, no movement */}
          <FirstPersonControls
            enabled={!xrMode}
            doorOpen={doorOpen}
            perfumeShopDoorOpen={perfumeShopDoorOpen}
            onPlayerPositionChange={setPlayerPosition}
            mobileMove={mobileMove}
          />

          {/* Crosshair Raycasting for Product Interactions */}
          <CrosshairInteraction
            onProductClick={onProductClick}
            onProductHover={onProductHover}
            playerPosition={playerPosition}
          />

          {/* Post-Processing Effects - Bloom, SSAO, Tone Mapping, Toon Shader */}
          {performancePreset && (
            <PostProcessing
              bloomEnabled={performancePreset.bloomEnabled}
              ssaoEnabled={performancePreset.ssaoEnabled}
              bloomIntensity={performancePreset.bloomIntensity}
              bloomRadius={performancePreset.bloomRadius}
              toonEnabled={performancePreset.toonEnabled}
            />
          )}
        </Canvas>
      </WebGLErrorBoundary>

      {/* Mobile Controls - Virtual Joystick */}
      <MobileControls onMove={setMobileMove} visible={!xrMode} />

      {/* Volume Control - inside immersive view */}
      <VolumeControl />

      {/* Radio Player UI - inside immersive view */}
      <RadioPlayer />

      {/* Cart Button - inside immersive view */}
      <CartButton />
    </div>
  );
}

// Simple loading indicator for 3D content
function LoadingBox() {
  return (
    <mesh position={[0, 1, -2]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#007B83" transparent opacity={0.6} />
    </mesh>
  );
}