import { useEffect, useRef, useState } from 'react';

class SoundManager {
  constructor() {
    this.sounds = {};
    this.musicVolume = 0.3;
    this.sfxVolume = 0.5;
    this.isMuted = false;
  }

  // Load a sound
  loadSound(name, url, loop = false) {
    const audio = new Audio(url);
    audio.loop = loop;
    audio.volume = loop ? this.musicVolume : this.sfxVolume;
    this.sounds[name] = audio;
    return audio;
  }

  // Play a sound
  play(name) {
    if (this.isMuted) return;
    const sound = this.sounds[name];
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(err => console.log('Audio play failed:', err));
    }
  }

  // Stop a sound
  stop(name) {
    const sound = this.sounds[name];
    if (sound) {
      sound.pause();
      sound.currentTime = 0;
    }
  }

  // Set volume
  setMusicVolume(volume) {
    this.musicVolume = volume;
    Object.entries(this.sounds).forEach(([name, audio]) => {
      if (audio.loop) {
        audio.volume = volume;
      }
    });
  }

  setSFXVolume(volume) {
    this.sfxVolume = volume;
    Object.entries(this.sounds).forEach(([name, audio]) => {
      if (!audio.loop) {
        audio.volume = volume;
      }
    });
  }

  // Toggle mute
  toggleMute() {
    this.isMuted = !this.isMuted;
    Object.values(this.sounds).forEach(audio => {
      audio.muted = this.isMuted;
    });
    return this.isMuted;
  }

  // Create click sound using Web Audio API
  createClickSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    return () => {
      if (this.isMuted) return;

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(this.sfxVolume * 0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    };
  }

  // Create success sound (for add to cart)
  createSuccessSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    return () => {
      if (this.isMuted) return;

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5

      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(this.sfxVolume * 0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
    };
  }

  // Create ambient music using Web Audio API
  createAmbientMusic() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Create ambient drone with multiple oscillators for rich pad sound
    const masterGain = audioContext.createGain();
    masterGain.connect(audioContext.destination);
    masterGain.gain.value = this.musicVolume * 0.15; // Soft ambient volume

    // Create multiple oscillators for a rich ambient pad
    // Using notes from C major chord (C, E, G) with octaves
    const frequencies = [
      130.81, // C3
      164.81, // E3
      196.00, // G3
      261.63, // C4
      329.63  // E4
    ];

    const oscillators = [];
    const gains = [];

    frequencies.forEach((freq, index) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      // Slightly different volumes for each oscillator
      gain.gain.value = 0.2 / frequencies.length;

      osc.connect(gain);
      gain.connect(masterGain);

      oscillators.push(osc);
      gains.push(gain);
    });

    // Store references for play/pause control
    const ambientAudio = {
      isPlaying: false,
      audioContext,
      oscillators,
      gains,
      masterGain,
      play: () => {
        return new Promise((resolve, reject) => {
          if (ambientAudio.isPlaying) {
            resolve();
            return;
          }

          try {
            // Resume audio context if suspended (due to autoplay policy)
            if (audioContext.state === 'suspended') {
              audioContext.resume().then(() => {
                oscillators.forEach(osc => {
                  if (osc.playbackState !== 'PLAYING') {
                    try {
                      osc.start();
                    } catch (e) {
                      // Already started
                    }
                  }
                });
                ambientAudio.isPlaying = true;
                console.log('Ambient music started');
                resolve();
              }).catch(reject);
            } else {
              oscillators.forEach(osc => {
                try {
                  osc.start();
                } catch (e) {
                  // Already started
                }
              });
              ambientAudio.isPlaying = true;
              console.log('Ambient music started');
              resolve();
            }
          } catch (error) {
            reject(error);
          }
        });
      },
      pause: () => {
        if (!ambientAudio.isPlaying) return;

        // Fade out
        masterGain.gain.setValueAtTime(masterGain.gain.value, audioContext.currentTime);
        masterGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);

        setTimeout(() => {
          if (audioContext.state === 'running') {
            audioContext.suspend();
          }
          ambientAudio.isPlaying = false;
          console.log('Ambient music paused');
        }, 500);
      },
      currentTime: 0,
      loop: true,
      volume: this.musicVolume,
      muted: false
    };

    // Update volume when changed
    Object.defineProperty(ambientAudio, 'volume', {
      get: () => masterGain.gain.value / 0.15,
      set: (value) => {
        masterGain.gain.value = value * 0.15;
      }
    });

    // Handle mute
    Object.defineProperty(ambientAudio, 'muted', {
      get: () => this.isMuted,
      set: (value) => {
        if (value && ambientAudio.isPlaying) {
          ambientAudio.pause();
        }
      }
    });

    this.sounds.ambient = ambientAudio;
    console.log('Ambient music created');
  }
}

// Singleton instance
let soundManagerInstance = null;

export function useSoundManager() {
  const [manager] = useState(() => {
    if (!soundManagerInstance) {
      soundManagerInstance = new SoundManager();
    }
    return soundManagerInstance;
  });

  return manager;
}

export default function SoundManagerComponent({ children }) {
  const manager = useSoundManager();

  useEffect(() => {
    // Initialize sounds
    manager.clickSound = manager.createClickSound();
    manager.successSound = manager.createSuccessSound();

    // Create ambient music using Web Audio API
    manager.createAmbientMusic();
  }, [manager]);

  return <>{children}</>;
}

// Volume Control component - to be rendered inside XR container
export function VolumeControl() {
  const manager = useSoundManager();
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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

  const toggleMute = () => {
    const muted = manager.toggleMute();
    setIsMuted(muted);
  };

  // Mobile-optimized dimensions
  const buttonSize = isMobile ? '36px' : '50px';
  const bottomOffset = isMobile ? '150px' : '220px';
  const rightOffset = isMobile ? '10px' : '20px';
  const fontSize = isMobile ? '0.9rem' : '1.2rem';

  return (
    <div style={{
      position: 'absolute',
      bottom: bottomOffset,
      right: rightOffset,
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    }}>
      <button
        onClick={() => setShowControls(!showControls)}
        style={{
          width: buttonSize,
          height: buttonSize,
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          borderRadius: isMobile ? '6px' : '8px',
          cursor: 'pointer',
          fontSize: fontSize,
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)'
        }}
        title="Sound Controls"
      >
        {isMuted ? '🔇' : '🔊'}
      </button>

      {showControls && (
        <div style={{
          background: 'rgba(0, 0, 0, 0.7)',
          padding: isMobile ? '0.75rem' : '1rem',
          borderRadius: isMobile ? '6px' : '8px',
          minWidth: isMobile ? '160px' : '200px',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          position: 'absolute',
          bottom: isMobile ? '44px' : '60px',
          right: '0'
        }}>
          <div style={{ color: 'white', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: isMobile ? '0.75rem' : '1rem' }}>
            Sound
          </div>

          <button
            onClick={toggleMute}
            style={{
              width: '100%',
              background: isMuted ? 'rgba(231, 76, 60, 0.8)' : 'rgba(39, 174, 96, 0.8)',
              color: 'white',
              border: 'none',
              padding: isMobile ? '0.35rem' : '0.5rem',
              borderRadius: '6px',
              cursor: 'pointer',
              marginBottom: '0.5rem',
              fontSize: isMobile ? '0.7rem' : '0.9rem'
            }}
          >
            {isMuted ? '🔇 Unmute' : '🔊 Mute'}
          </button>

          <div style={{ color: 'white', fontSize: isMobile ? '0.65rem' : '0.8rem', marginTop: '0.5rem' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              Music
              <input
                type="range"
                min="0"
                max="100"
                defaultValue="30"
                onChange={(e) => manager.setMusicVolume(e.target.value / 100)}
                style={{ width: '100%', marginTop: '0.25rem' }}
              />
            </div>
            <div>
              SFX
              <input
                type="range"
                min="0"
                max="100"
                defaultValue="50"
                onChange={(e) => manager.setSFXVolume(e.target.value / 100)}
                style={{ width: '100%', marginTop: '0.25rem' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Export for use in other components
export { SoundManager };
