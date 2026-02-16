// =====================================================
// RADIO PLAYER UI
// Floating radio control panel for XR environment
// =====================================================

import { useState, useEffect } from 'react';
import { useRadio } from '../../contexts/RadioContext';

export default function RadioPlayer() {
  const {
    isPlaying,
    currentStation,
    volume,
    isMuted,
    isRadioOpen,
    stations,
    togglePlay,
    changeStation,
    nextStation,
    prevStation,
    adjustVolume,
    toggleMute,
    setIsRadioOpen
  } = useRadio();

  const [showStations, setShowStations] = useState(false);
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

  // Mobile-optimized dimensions
  const buttonSize = isMobile ? '36px' : '50px';
  const bottomOffset = isMobile ? '105px' : '160px';
  const rightOffset = isMobile ? '10px' : '20px';

  if (!isRadioOpen) {
    // Minimized radio button - styled to match clock widget
    return (
      <button
        onClick={() => setIsRadioOpen(true)}
        style={{
          position: 'absolute',
          bottom: bottomOffset,
          right: rightOffset,
          width: buttonSize,
          height: buttonSize,
          borderRadius: isMobile ? '6px' : '8px',
          background: 'rgba(0, 0, 0, 0.7)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          color: 'white',
          fontSize: isMobile ? '18px' : '24px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s ease',
          zIndex: 1000,
          backdropFilter: 'blur(10px)'
        }}
        title="Open Radio"
      >
        📻
      </button>
    );
  }

  return (
    <div
      style={{
        position: 'absolute',
        bottom: bottomOffset,
        right: rightOffset,
        width: isMobile ? '200px' : '280px',
        background: 'rgba(0, 0, 0, 0.7)',
        borderRadius: isMobile ? '6px' : '8px',
        padding: isMobile ? '10px' : '16px',
        color: 'white',
        fontFamily: 'sans-serif',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        border: '2px solid rgba(255, 255, 255, 0.2)',
        zIndex: 1000,
        backdropFilter: 'blur(10px)'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMobile ? '8px' : '12px' }}>
        <span style={{ fontSize: isMobile ? '11px' : '14px', fontWeight: 'bold', opacity: 0.7 }}>XR RADIO</span>
        <button
          onClick={() => setIsRadioOpen(false)}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: isMobile ? '14px' : '18px',
            padding: '4px',
            opacity: 0.7
          }}
        >
          ×
        </button>
      </div>

      {/* Current Station */}
      <div
        style={{
          background: `linear-gradient(135deg, ${currentStation.color}40 0%, #764ba240 100%)`,
          borderRadius: isMobile ? '8px' : '12px',
          padding: isMobile ? '8px' : '12px',
          marginBottom: isMobile ? '8px' : '12px',
          border: `1px solid ${currentStation.color}60`
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '10px' }}>
          <span style={{ fontSize: isMobile ? '20px' : '28px' }}>{currentStation.icon}</span>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: isMobile ? '11px' : '14px' }}>{currentStation.name}</div>
            <div style={{ fontSize: isMobile ? '9px' : '11px', opacity: 0.7 }}>{currentStation.genre}</div>
          </div>
        </div>
      </div>

      {/* Playback Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: isMobile ? '8px' : '12px', marginBottom: isMobile ? '8px' : '12px' }}>
        <button
          onClick={prevStation}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '50%',
            width: isMobile ? '28px' : '36px',
            height: isMobile ? '28px' : '36px',
            color: 'white',
            cursor: 'pointer',
            fontSize: isMobile ? '11px' : '14px'
          }}
        >
          ⏮
        </button>

        <button
          onClick={togglePlay}
          style={{
            background: currentStation.color,
            border: 'none',
            borderRadius: '50%',
            width: isMobile ? '36px' : '48px',
            height: isMobile ? '36px' : '48px',
            color: 'white',
            cursor: 'pointer',
            fontSize: isMobile ? '14px' : '18px',
            boxShadow: `0 4px 15px ${currentStation.color}60`
          }}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        <button
          onClick={nextStation}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '50%',
            width: isMobile ? '28px' : '36px',
            height: isMobile ? '28px' : '36px',
            color: 'white',
            cursor: 'pointer',
            fontSize: isMobile ? '11px' : '14px'
          }}
        >
          ⏭
        </button>
      </div>

      {/* Volume Control */}
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '4px' : '8px', marginBottom: isMobile ? '8px' : '12px' }}>
        <button
          onClick={toggleMute}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: isMobile ? '12px' : '16px',
            padding: '4px'
          }}
        >
          {isMuted || volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
        </button>

        <input
          type="range"
          min="0"
          max="100"
          value={isMuted ? 0 : volume * 100}
          onChange={(e) => adjustVolume(e.target.value / 100)}
          style={{
            flex: 1,
            height: '4px',
            borderRadius: '2px',
            background: `linear-gradient(to right, ${currentStation.color} 0%, ${currentStation.color} ${volume * 100}%, rgba(255,255,255,0.2) ${volume * 100}%, rgba(255,255,255,0.2) 100%)`,
            appearance: 'none',
            cursor: 'pointer'
          }}
        />

        <span style={{ fontSize: isMobile ? '9px' : '11px', opacity: 0.7, width: isMobile ? '24px' : '30px', textAlign: 'right' }}>
          {Math.round(isMuted ? 0 : volume * 100)}%
        </span>
      </div>

      {/* Station List Toggle */}
      <button
        onClick={() => setShowStations(!showStations)}
        style={{
          width: '100%',
          padding: isMobile ? '6px' : '8px',
          background: 'rgba(255, 255, 255, 0.1)',
          border: 'none',
          borderRadius: isMobile ? '6px' : '8px',
          color: 'white',
          cursor: 'pointer',
          fontSize: isMobile ? '10px' : '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <span>Stations</span>
        <span>{showStations ? '▲' : '▼'}</span>
      </button>

      {/* Station List */}
      {showStations && (
        <div style={{ marginTop: '8px', maxHeight: isMobile ? '100px' : '150px', overflowY: 'auto' }}>
          {stations.map((station) => (
            <button
              key={station.id}
              onClick={() => {
                changeStation(station);
                setShowStations(false);
              }}
              style={{
                width: '100%',
                padding: isMobile ? '6px 8px' : '8px 12px',
                background: station.id === currentStation.id
                  ? `${station.color}40`
                  : 'transparent',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? '6px' : '8px',
                marginBottom: '4px',
                textAlign: 'left'
              }}
            >
              <span>{station.icon}</span>
              <div>
                <div style={{ fontSize: isMobile ? '10px' : '12px', fontWeight: station.id === currentStation.id ? 'bold' : 'normal' }}>
                  {station.name}
                </div>
                <div style={{ fontSize: isMobile ? '8px' : '10px', opacity: 0.6 }}>{station.genre}</div>
              </div>
              {station.id === currentStation.id && isPlaying && (
                <span style={{ marginLeft: 'auto', fontSize: isMobile ? '8px' : '10px' }}>♪</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
