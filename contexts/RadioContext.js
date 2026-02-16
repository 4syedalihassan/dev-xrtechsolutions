// =====================================================
// RADIO SYSTEM CONTEXT
// Manages music playback across XR environment
// =====================================================

import { createContext, useContext, useState, useRef, useEffect } from 'react';

const RadioContext = createContext();

// Radio stations with streaming URLs (royalty-free/public streams)
export const RADIO_STATIONS = [
  {
    id: 'lofi',
    name: 'Lo-Fi Beats',
    genre: 'Chill',
    icon: '🎵',
    // SomaFM - Groove Salad (ambient/chill)
    url: 'https://ice1.somafm.com/groovesalad-128-mp3',
    color: '#667eea'
  },
  {
    id: 'jazz',
    name: 'Smooth Jazz',
    genre: 'Jazz',
    icon: '🎷',
    // SomaFM - Secret Agent (smooth jazz/lounge)
    url: 'https://ice1.somafm.com/secretagent-128-mp3',
    color: '#f59e0b'
  },
  {
    id: 'electronic',
    name: 'Electronic Vibes',
    genre: 'Electronic',
    icon: '🎹',
    // SomaFM - DEF CON Radio (electronic)
    url: 'https://ice1.somafm.com/defcon-128-mp3',
    color: '#10b981'
  },
  {
    id: 'classical',
    name: 'Classical',
    genre: 'Classical',
    icon: '🎻',
    // SomaFM - Illinois Street Lounge (classic lounge)
    url: 'https://ice1.somafm.com/illstreet-128-mp3',
    color: '#8b5cf6'
  },
  {
    id: 'nature',
    name: 'Nature Sounds',
    genre: 'Ambient',
    icon: '🌿',
    // SomaFM - Drone Zone (ambient/atmospheric soundscapes)
    url: 'https://ice1.somafm.com/dronezone-128-mp3',
    color: '#059669'
  }
];

export function useRadio() {
  const context = useContext(RadioContext);
  if (!context) {
    throw new Error('useRadio must be used within a RadioProvider');
  }
  return context;
}

export function RadioProvider({ children }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStation, setCurrentStation] = useState(RADIO_STATIONS[0]);
  const [volume, setVolume] = useState(0.3);
  const [isMuted, setIsMuted] = useState(false);
  const [isRadioOpen, setIsRadioOpen] = useState(false);
  const [currentZone, setCurrentZone] = useState('environment'); // 'environment', 'healthcare', 'perfume'

  const audioRef = useRef(null);
  const previousVolume = useRef(0.3);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.crossOrigin = 'anonymous';
    audioRef.current.volume = volume;

    // Add error handling for audio loading issues
    const handleError = (e) => {
      console.warn('Radio stream error:', e.target?.error?.message || 'Unknown error');
      setIsPlaying(false);
    };

    audioRef.current.addEventListener('error', handleError);

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('error', handleError);
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  // Update audio source when station changes
  useEffect(() => {
    if (audioRef.current && currentStation) {
      const wasPlaying = isPlaying;
      audioRef.current.src = currentStation.url;

      if (wasPlaying) {
        audioRef.current.play().catch(() => {
          // Audio play failed, likely need user interaction first
          setIsPlaying(false);
        });
      }
    }
  }, [currentStation]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Play/Pause controls
  const play = () => {
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        // Autoplay blocked
        setIsPlaying(false);
      });
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  // Station controls
  const changeStation = (station) => {
    setCurrentStation(station);
  };

  const nextStation = () => {
    const currentIndex = RADIO_STATIONS.findIndex(s => s.id === currentStation.id);
    const nextIndex = (currentIndex + 1) % RADIO_STATIONS.length;
    setCurrentStation(RADIO_STATIONS[nextIndex]);
  };

  const prevStation = () => {
    const currentIndex = RADIO_STATIONS.findIndex(s => s.id === currentStation.id);
    const prevIndex = (currentIndex - 1 + RADIO_STATIONS.length) % RADIO_STATIONS.length;
    setCurrentStation(RADIO_STATIONS[prevIndex]);
  };

  // Volume controls
  const adjustVolume = (newVolume) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
    if (clampedVolume > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(previousVolume.current);
      setIsMuted(false);
    } else {
      previousVolume.current = volume;
      setIsMuted(true);
    }
  };

  // Zone-based volume adjustment
  const setZone = (zone) => {
    setCurrentZone(zone);
    // Could adjust volume based on zone
    // e.g., quieter in buildings, louder outside
  };

  const toggleRadio = () => {
    setIsRadioOpen(prev => !prev);
  };

  const value = {
    // State
    isPlaying,
    currentStation,
    volume,
    isMuted,
    isRadioOpen,
    currentZone,
    stations: RADIO_STATIONS,

    // Controls
    play,
    pause,
    togglePlay,
    changeStation,
    nextStation,
    prevStation,
    adjustVolume,
    toggleMute,
    setZone,
    toggleRadio,
    setIsRadioOpen
  };

  return (
    <RadioContext.Provider value={value}>
      {children}
    </RadioContext.Provider>
  );
}
