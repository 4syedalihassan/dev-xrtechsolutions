import { useState, useEffect } from 'react';

export default function PointerLockOverlay() {
  const [isLocked, setIsLocked] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [dismissed, setDismissed] = useState(false);

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

  useEffect(() => {
    const handlePointerLockChange = () => {
      const locked = !!document.pointerLockElement;
      setIsLocked(locked);
      if (locked) {
        setTimeout(() => setShowInstructions(false), 3000); // Hide after 3s
      } else {
        setShowInstructions(true);
      }
    };

    document.addEventListener('pointerlockchange', handlePointerLockChange);
    return () => document.removeEventListener('pointerlockchange', handlePointerLockChange);
  }, []);

  // Dismiss overlay on touch for mobile
  useEffect(() => {
    if (!isMobile) return;

    const handleTouch = () => {
      setDismissed(true);
    };

    document.addEventListener('touchstart', handleTouch, { once: true });
    return () => document.removeEventListener('touchstart', handleTouch);
  }, [isMobile]);

  // Mobile-specific styles
  const mobileStyles = {
    lockPrompt: {
      padding: isMobile ? '0.75rem 1rem' : '2rem',
      borderRadius: isMobile ? '8px' : '12px',
      maxWidth: isMobile ? '200px' : 'none'
    },
    promptTitle: {
      fontSize: isMobile ? '0.9rem' : '1.5rem',
      marginBottom: isMobile ? '0.5rem' : '1rem'
    },
    promptText: {
      fontSize: isMobile ? '0.7rem' : '1rem',
      display: isMobile ? 'none' : 'block' // Hide detailed text on mobile
    },
    instructions: {
      padding: isMobile ? '0.75rem' : '1.5rem',
      borderRadius: isMobile ? '6px' : '8px'
    },
    instructionsTitle: {
      fontSize: isMobile ? '0.85rem' : '1.2rem',
      marginBottom: isMobile ? '0.25rem' : '0.5rem'
    },
    instructionsText: {
      fontSize: isMobile ? '0.7rem' : '0.9rem',
      margin: isMobile ? '0.15rem 0' : '0.25rem 0'
    }
  };

  if (isLocked) {
    return showInstructions ? (
      <div className="pointer-lock-overlay active">
        <div className="lock-instructions" style={mobileStyles.instructions}>
          <h3 style={mobileStyles.instructionsTitle}>🎯 {isMobile ? 'FP Mode' : 'First Person Mode Active'}</h3>
          {!isMobile && <p style={mobileStyles.instructionsText}>🖱️ Move mouse to look around</p>}
          {!isMobile && <p style={mobileStyles.instructionsText}>⌨️ Use WASD keys to move</p>}
          <p style={mobileStyles.instructionsText}>Press <kbd>ESC</kbd> to exit</p>
        </div>
      </div>
    ) : null;
  }

  // On mobile, hide overlay after first touch
  if (isMobile && dismissed) {
    return null;
  }

  return (
    <div className="pointer-lock-overlay">
      <div className="lock-prompt" style={mobileStyles.lockPrompt}>
        <h3 style={mobileStyles.promptTitle}>👆 {isMobile ? 'Tap to Look' : 'Click Canvas for First-Person Mode'}</h3>
        <p style={mobileStyles.promptText}>Look around with mouse + Move with WASD keys</p>
      </div>
    </div>
  );
}