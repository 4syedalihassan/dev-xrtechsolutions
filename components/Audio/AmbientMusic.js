import { useEffect, useRef } from 'react';
import { useSoundManager } from './SoundManager';

export default function AmbientMusic({ playerPosition, shopBounds }) {
  const soundManager = useSoundManager();
  const isPlayingRef = useRef(false);

  useEffect(() => {
    if (!soundManager || !playerPosition || !shopBounds) return;

    // Check if player is inside the shop
    const isInShop =
      playerPosition[0] >= shopBounds.minX &&
      playerPosition[0] <= shopBounds.maxX &&
      playerPosition[2] >= shopBounds.minZ &&
      playerPosition[2] <= shopBounds.maxZ;

    // Start ambient music when entering shop
    if (isInShop && !isPlayingRef.current) {
      console.log('Player entered shop - starting ambient music');
      if (soundManager.sounds.ambient) {
        soundManager.sounds.ambient.play().catch(err => {
          console.log('Ambient music autoplay blocked, will play on user interaction');
        });
        isPlayingRef.current = true;
      }
    }
    // Stop ambient music when leaving shop
    else if (!isInShop && isPlayingRef.current) {
      console.log('Player left shop - stopping ambient music');
      if (soundManager.sounds.ambient) {
        soundManager.sounds.ambient.pause();
        isPlayingRef.current = false;
      }
    }
  }, [playerPosition, shopBounds, soundManager]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (soundManager && soundManager.sounds.ambient) {
        soundManager.sounds.ambient.pause();
        soundManager.sounds.ambient.currentTime = 0;
      }
    };
  }, [soundManager]);

  return null; // This component doesn't render anything
}
