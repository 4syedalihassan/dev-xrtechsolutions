import { useState, useEffect } from 'react';

export default function HUD({ 
  player, 
  currentScene, 
  sceneIndex, 
  totalScenes, 
  onNext, 
  onPrev, 
  projectColors,
  xrMode,
  timeData
}) {
  const [showStats, setShowStats] = useState(false);
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

  // Don't show HUD in XR mode (it interferes with immersion)
  if (xrMode) return null;

  const progressPercentage = (sceneIndex / totalScenes) * 100;

  // Mobile-optimized styles
  const mobileTimeDisplay = {
    padding: isMobile ? '0.4rem 0.6rem' : '0.75rem 1rem',
    borderRadius: isMobile ? '6px' : '8px',
    marginRight: isMobile ? '0.5rem' : '1rem'
  };

  const mobileTimeText = {
    fontSize: isMobile ? '0.9rem' : '1.2rem'
  };

  const mobilePeriodText = {
    fontSize: isMobile ? '0.65rem' : '0.8rem'
  };

  return (
    <div className="hud-container">
      {/* Top Bar */}
      <div className="hud-top" style={isMobile ? { padding: '0.5rem' } : {}}>
        {/* Time Display */}
        {timeData && (
          <div className="time-display" style={mobileTimeDisplay}>
            <div className="current-time" style={mobileTimeText}>
              {timeData.hour.toString().padStart(2, '0')}:{timeData.minute.toString().padStart(2, '0')}
            </div>
            <div className="time-period" style={mobilePeriodText}>
              {timeData.timeOfDay.charAt(0).toUpperCase() + (isMobile ? '' : timeData.timeOfDay.slice(1))}
            </div>
          </div>
        )}

        {/* Player Stats */}
        {player && (
          <div className="player-stats">
            <button 
              className="stats-toggle"
              onClick={() => setShowStats(!showStats)}
              style={{ 
                borderColor: projectColors.accent_color,
                padding: isMobile ? '0.3rem 0.6rem' : '0.5rem 1rem'
              }}
            >
              <div className="xp-display">
                <span className="xp-value" style={{ fontSize: isMobile ? '0.9rem' : '1.2rem' }}>{player.xp} XP</span>
                <span className="level" style={{ fontSize: isMobile ? '0.65rem' : '0.8rem' }}>Lv {player.level}</span>
              </div>
            </button>
            
            {showStats && (
              <div className="stats-dropdown" style={isMobile ? { minWidth: '150px', padding: '0.75rem' } : {}}>
                <div className="stat-item" style={{ fontSize: isMobile ? '0.75rem' : '1rem' }}>
                  <span>XP</span>
                  <span>{player.xp}</span>
                </div>
                <div className="stat-item" style={{ fontSize: isMobile ? '0.75rem' : '1rem' }}>
                  <span>Level</span>
                  <span>{player.level}</span>
                </div>
                <div className="stat-item" style={{ fontSize: isMobile ? '0.75rem' : '1rem' }}>
                  <span>Badges</span>
                  <span>{player.badges?.length || 0}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="hud-bottom">

      </div>

      {/* Loading indicator for scene transitions */}
      {/* This could be enhanced with actual loading state */}
    </div>
  );
}