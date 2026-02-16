import { useState, useEffect } from 'react';

/**
 * ClientOnly component - renders children only on client side
 * Prevents SSR/build-time rendering issues with router and browser APIs
 */
export default function ClientOnly({ children, fallback = null }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return fallback;
  }

  return children;
}
