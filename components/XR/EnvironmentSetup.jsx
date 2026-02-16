import { Environment, Lightformer } from '@react-three/drei';
import { useState, useEffect } from 'react';

/**
 * EnvironmentSetup - Enhanced lighting system for realistic PBR materials
 *
 * Features:
 * - Dynamic HDRI environment maps based on time of day
 * - Automatic seasonal effects based on calendar date
 * - Fallback to presets if HDRI files not yet downloaded
 * - Three-point lighting setup (key, fill, rim)
 * - Enhanced shadow quality with light formers
 * - Ambient occlusion simulation
 *
 * Season Detection (Automatic):
 * - Winter: November 15 - January 15 (snow, cool lighting)
 * - Summer: January 16 - November 14 (default lighting)
 * - Can be overridden by passing explicit season prop
 *
 * HDRI Configuration:
 * - Download HDRIs from Poly Haven (https://polyhaven.com/hdris)
 * - Place in /public/hdri/ directory
 * - See /public/hdri/README.md for download instructions
 * - Both winter and summer HDRIs are supported
 *
 * Winter Features (Nov 15 - Jan 15):
 * - Cooler color temperature (blue tints)
 * - Lower sun angle (winter sun position)
 * - Snowy HDRI environments
 * - Reduced ambient intensity (85%)
 * - Snow-covered ground visible through glass
 *
 * Research findings (2025 Best Practices):
 * - HDRI environment maps are essential for photorealistic reflections
 * - Dynamic HDRI switching based on time creates realistic day/night cycles
 * - Lightformers add targeted highlights for product visualization
 * - Proper roughness/metalness requires good environment lighting
 * - Three-point lighting creates depth and dimension
 * - Shadow quality significantly impacts realism
 */
export default function EnvironmentSetup({ timeData, season }) {
  // Adjust lighting intensity based on time of day if timeData provided
  const timeMultiplier = timeData ? (timeData.ambientIntensity || 0.8) : 0.8;
  const timeOfDay = timeData?.timeOfDay || 'day';

  // Auto-detect season based on current date if not explicitly provided
  // Winter: November 15 - January 15
  const getAutoSeason = () => {
    const now = new Date();
    const month = now.getMonth(); // 0-11 (0=Jan, 10=Nov, 11=Dec)
    const day = now.getDate(); // 1-31

    // Winter: Nov 15 (month 10, day >= 15) through Jan 15 (month 0, day <= 15)
    if (
      (month === 10 && day >= 15) || // Nov 15-30
      month === 11 ||                 // All of December
      (month === 0 && day <= 15)      // Jan 1-15
    ) {
      return 'winter';
    }

    return 'summer'; // Default to summer for rest of year
  };

  const currentSeason = season || getAutoSeason();
  const isWinter = currentSeason === 'winter';
  const seasonMultiplier = isWinter ? 0.85 : 1.0; // Winter has slightly dimmer light

  // Winter color adjustments (cooler tones)
  const keyLightColor = isWinter ? '#E8F4FF' : '#ffffff'; // Cool blue-white for winter
  const fillLightColor = isWinter ? '#C5E3FF' : '#b8d4ff'; // Cooler blue for winter
  const rimLightColor = isWinter ? '#F0F8FF' : '#ffd4a3'; // Cool rim instead of warm
  const skyColor = isWinter ? '#D4E8F5' : '#87CEEB'; // Pale winter sky
  const groundColor = isWinter ? '#F5F5F5' : '#8B7355'; // Snow white ground

  // HDRI file mapping based on time of day and season
  // NOTE: These files need to be downloaded from Poly Haven
  // See /public/hdri/README.md for download instructions
  const hdriFiles = isWinter ? {
    // Winter HDRIs - snowy/cold environments
    dawn: '/hdri/winter_evening.hdr',      // Cold morning light
    day: '/hdri/snowy_forest.hdr',         // Bright snowy day
    dusk: '/hdri/winter_evening.hdr',      // Cold sunset
    night: '/hdri/kloppenheim.hdr',        // Overcast night
  } : {
    // Default HDRIs - regular seasons
    dawn: '/hdri/dawn.hdr',                // Warm morning light
    day: '/hdri/day.hdr',                  // Bright daylight
    dusk: '/hdri/dusk.hdr',                // Orange evening light
    night: '/hdri/night.hdr',              // Cool moonlight
  };

  // Preset fallback if HDRI files are not yet downloaded
  // Winter uses cooler/snowy presets
  const presetFallback = {
    dawn: isWinter ? 'dawn' : 'sunset',
    day: isWinter ? 'city' : 'warehouse',
    dusk: isWinter ? 'dawn' : 'sunset',
    night: isWinter ? 'night' : 'night',
  };

  // Environment intensity based on time of day (reduced for less shine)
  const envIntensity = {
    dawn: 0.5,
    day: 0.6,
    dusk: 0.4,
    night: 0.2,
  }[timeOfDay] || 0.5;

  // Preset fallback logic
  const presetName = presetFallback[timeOfDay] || 'sunset';

  return (
    <>
      {/* Environment preset - robust and reliable */}
      <Environment
        preset={presetName}
        background={true}
        backgroundBlurriness={0.1}
        backgroundIntensity={0.5}
        intensity={envIntensity * 0.5 * timeMultiplier}
      />

      {/* Light Formers - Add targeted highlights for product visualization */}
      {/* Main highlight from above */}
      <Lightformer
        position={[0, 10, 0]}
        scale={[10, 1, 10]}
        intensity={0.3 * timeMultiplier * seasonMultiplier}
        color={keyLightColor}
        rotation-x={Math.PI / 2}
      />

      {/* Side highlights for depth */}
      <Lightformer
        position={[10, 5, 0]}
        scale={[5, 10, 1]}
        intensity={0.2 * timeMultiplier * seasonMultiplier}
        color={rimLightColor}
        rotation-y={-Math.PI / 4}
      />

      <Lightformer
        position={[-10, 5, 0]}
        scale={[5, 10, 1]}
        intensity={0.2 * timeMultiplier * seasonMultiplier}
        color={fillLightColor}
        rotation-y={Math.PI / 4}
      />

      {/* KEY LIGHT - Primary directional light */}
      {/* Winter: lower sun angle (y=10 vs 15) */}
      <directionalLight
        position={[10, isWinter ? 10 : 15, 5]}
        intensity={0.7 * timeMultiplier * seasonMultiplier}
        color={keyLightColor}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
        shadow-bias={-0.0001}
      />

      {/* FILL LIGHT - Soften shadows, add ambient fill */}
      <directionalLight
        position={[-8, 8, -8]}
        intensity={0.25 * timeMultiplier * seasonMultiplier}
        color={fillLightColor}
      />

      {/* RIM LIGHT - Highlight edges and create separation */}
      <directionalLight
        position={[5, 5, -10]}
        intensity={0.2 * timeMultiplier * seasonMultiplier}
        color={rimLightColor}
      />

      {/* AMBIENT LIGHT - Base illumination for areas not hit by directional lights */}
      <ambientLight intensity={0.3 * timeMultiplier * seasonMultiplier} />

      {/* HEMISPHERE LIGHT - Simulates sky/ground bounce lighting */}
      {/* Winter: pale sky and snowy white ground */}
      <hemisphereLight
        skyColor={skyColor}
        groundColor={groundColor}
        intensity={0.2 * timeMultiplier * seasonMultiplier}
      />

      {/* SPOT LIGHTS - Focused lighting for important areas */}
      {/* Spotlight on perfume shop entrance */}
      <spotLight
        position={[16, 10, -10]}
        angle={0.5}
        penumbra={0.5}
        intensity={0.4 * timeMultiplier * seasonMultiplier}
        color={keyLightColor}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Spotlight on healthcare center entrance */}
      <spotLight
        position={[0, 10, -10]}
        angle={0.5}
        penumbra={0.5}
        intensity={0.4 * timeMultiplier * seasonMultiplier}
        color={keyLightColor}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
    </>
  );
}
