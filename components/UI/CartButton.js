// =====================================================
// CART BUTTON - Floating Cart Icon for 3D Environment
// Sprint 7: E-Commerce Order Lifecycle
// Version: 7.0.0
// =====================================================

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useCart } from '../../contexts/CartContext';

export default function CartButton() {
  const router = useRouter();
  const { getCartTotals } = useCart();
  const totals = getCartTotals();
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

  const handleClick = () => {
    router.push('/cart');
  };

  // Mobile-optimized dimensions
  const buttonSize = isMobile ? '36px' : '50px';
  const bottomOffset = isMobile ? '60px' : '100px';
  const rightOffset = isMobile ? '10px' : '20px';
  const iconSize = isMobile ? 18 : 24;
  const badgeSize = isMobile ? '16px' : '22px';
  const badgeFontSize = isMobile ? '9px' : '11px';

  return (
    <>
      <button
        onClick={handleClick}
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
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          zIndex: 1000,
          backdropFilter: 'blur(10px)',
        }}
        aria-label="Shopping cart"
      >
        {/* Cart Icon */}
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>

        {/* Item Count Badge */}
        {totals.itemCount > 0 && (
          <span style={{
            position: 'absolute',
            top: isMobile ? '-6px' : '-8px',
            right: isMobile ? '-6px' : '-8px',
            background: '#FF5252',
            color: 'white',
            borderRadius: '50%',
            minWidth: badgeSize,
            height: badgeSize,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: badgeFontSize,
            fontWeight: 'bold',
            boxShadow: '0 2px 8px rgba(255, 82, 82, 0.4)',
            animation: 'pulse 2s infinite',
          }}>
            {totals.itemCount > 99 ? '99+' : totals.itemCount}
          </span>
        )}
      </button>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
      `}</style>
    </>
  );
}
