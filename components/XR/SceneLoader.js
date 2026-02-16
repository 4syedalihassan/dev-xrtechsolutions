import { useEffect, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { playerAPI } from '../../lib/supabase';
import Hotspot from './Hotspot';
import Model from './Model';
import Platform from './Platform';

export default function SceneLoader({ scene, config, session, player, setPlayer, xrMode, doorOpen, setDoorOpen, perfumeShopDoorOpen, setPerfumeShopDoorOpen, playerPosition, timeData, onProductClick }) {
  
  // Initialize or get player data
  useEffect(() => {
    if (session && !player) {
      initializePlayer();
    }
  }, [session, player]);

  // Log scene entry event (only for old scene structure)
  useEffect(() => {
    if (player && scene && scene.id) {
      logSceneEntry();
    }
  }, [player, scene?.id]);

  async function initializePlayer() {
    try {
      if (session && session.user) {
        const playerData = await playerAPI.getOrCreatePlayer(session.user);
        setPlayer(playerData);
      }
    } catch (error) {
      console.error('Failed to initialize player:', error);
    }
  }

  async function logSceneEntry() {
    try {
      if (scene.id && scene.title) {
        await playerAPI.logEvent(player.id, 'scene_entered', {
          scene_id: scene.id,
          scene_title: scene.title
        });
      }
    } catch (error) {
      console.error('Failed to log scene entry:', error);
    }
  }

  const handleHotspotActivate = async (hotspot) => {
    if (!player) return;

    try {
      // Award XP for hotspot interaction (only if gamification exists)
      if (config.gamification) {
        const result = await playerAPI.awardXP(
          player.id,
          config.gamification.xp_per_hotspot,
          'hotspot_interaction'
        );

        // Update local player state
        setPlayer(prev => ({
          ...prev,
          xp: result.new_xp,
          level: result.new_level
        }));

        // Log the interaction
        await playerAPI.logEvent(player.id, 'hotspot_opened', {
          scene_id: scene.id,
          hotspot_id: hotspot.id,
          hotspot_name: hotspot.name
        });
      }
    } catch (error) {
      console.error('Failed to process hotspot interaction:', error);
    }
  };

  return (
    <group>

      {/* Background Model (only for old scene structure) */}
      {scene && scene.background_model_url && (
        <Suspense fallback={null}>
          <Model
            url={scene.background_model_url}
            position={[0, 0, 0]}
            scale={[1, 1, 1]}
          />
        </Suspense>
      )}

      {/* Hotspots (only for old scene structure) */}
      {scene && scene.hotspots && config.content && scene.hotspots.map((hotspot) => (
        <Hotspot
          key={hotspot.id}
          hotspot={hotspot}
          content={config.content[hotspot.content_key]}
          onActivate={handleHotspotActivate}
          colors={{
            hover: hotspot.hover_color || config.project?.accent_color || '#4a90e2',
            click: hotspot.click_color || config.project?.primary_color || '#667eea'
          }}
          xrMode={xrMode}
        />
      ))}

      {/* Platform with glass walls - This is the shopping environment */}
      <Platform
        size={20}
        wallHeight={5}
        doorOpen={doorOpen}
        setDoorOpen={setDoorOpen}
        perfumeShopDoorOpen={perfumeShopDoorOpen}
        setPerfumeShopDoorOpen={setPerfumeShopDoorOpen}
        playerPosition={playerPosition}
        timeData={timeData}
        onProductClick={onProductClick}
        products={scene?.products || config.products || []}
        buildings={scene?.buildings || config.buildings || []}
      />
    </group>
  );
}