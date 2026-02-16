import { useState, useRef, useEffect } from 'react';

/**
 * MobileControls - Virtual joystick for mobile navigation
 *
 * Features:
 * - Left side: Virtual joystick for movement (WASD equivalent)
 * - Right side: Touch area for camera look (existing touch in FirstPersonControls)
 * - Auto-hide on desktop devices
 * - Optimized size for mobile to leave more screen room
 */
export default function MobileControls({ onMove, visible = true }) {
  const [isMobile, setIsMobile] = useState(false);
  const [joystickActive, setJoystickActive] = useState(false);
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
  const joystickRef = useRef(null);
  const joystickCenter = useRef({ x: 0, y: 0 });
  
  // Optimized dimensions for mobile
  const joystickSize = 80; // Reduced from 120px for more screen room
  const knobSize = 35; // Reduced from 50px
  const maxDistance = 30; // Reduced from 40 for tighter control

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                     ('ontouchstart' in window) ||
                     (navigator.maxTouchPoints > 0);
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle joystick touch
  const handleTouchStart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const touch = e.touches[0];
    const rect = joystickRef.current.getBoundingClientRect();
    joystickCenter.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
    setJoystickActive(true);
    updateJoystick(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!joystickActive) return;
    const touch = e.touches[0];
    updateJoystick(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setJoystickActive(false);
    setJoystickPos({ x: 0, y: 0 });
    if (onMove) {
      onMove({ forward: false, backward: false, left: false, right: false });
    }
  };

  const updateJoystick = (touchX, touchY) => {
    const dx = touchX - joystickCenter.current.x;
    const dy = touchY - joystickCenter.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Clamp to max distance
    const clampedDistance = Math.min(distance, maxDistance);
    const angle = Math.atan2(dy, dx);

    const x = (clampedDistance / maxDistance) * Math.cos(angle);
    const y = (clampedDistance / maxDistance) * Math.sin(angle);

    setJoystickPos({
      x: x * maxDistance,
      y: y * maxDistance
    });

    // Convert to movement directions
    if (onMove) {
      const threshold = 0.3;
      onMove({
        forward: y < -threshold,
        backward: y > threshold,
        left: x < -threshold,
        right: x > threshold
      });
    }
  };

  if (!isMobile || !visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '15px',
        left: '15px',
        zIndex: 1000,
        touchAction: 'none',
        pointerEvents: 'auto'
      }}
    >
      {/* Joystick base */}
      <div
        ref={joystickRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          width: `${joystickSize}px`,
          height: `${joystickSize}px`,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.15)',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Joystick knob */}
        <div
          style={{
            width: `${knobSize}px`,
            height: `${knobSize}px`,
            borderRadius: '50%',
            background: joystickActive
              ? 'rgba(102, 126, 234, 0.8)'
              : 'rgba(255, 255, 255, 0.4)',
            transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)`,
            transition: joystickActive ? 'none' : 'transform 0.2s ease-out',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
          }}
        />
      </div>

      {/* Instructions - smaller text */}
      <div
        style={{
          textAlign: 'center',
          marginTop: '4px',
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '9px',
          fontFamily: 'sans-serif'
        }}
      >
        Move
      </div>
    </div>
  );
}
