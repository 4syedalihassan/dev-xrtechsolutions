// =====================================================
// WISHLIST CONTEXT
// Remaining Feature: Wishlist / Favorites
// =====================================================

import { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load wishlist from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        try {
          const parsed = JSON.parse(savedWishlist);
          if (Array.isArray(parsed)) {
            setWishlist(parsed);
          }
        } catch (error) {
          console.error('Failed to load wishlist:', error);
          localStorage.removeItem('wishlist');
        }
      }
      setIsHydrated(true);
    }
  }, []);

  // Save wishlist to localStorage whenever it changes (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined' && isHydrated) {
      if (wishlist.length > 0) {
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
      } else {
        localStorage.removeItem('wishlist');
      }
    }
  }, [wishlist, isHydrated]);

  // Add product to wishlist
  const addToWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) return prev;
      
      return [...prev, {
        id: product.id,
        name: product.name,
        brand: product.brand || '',
        price: parseFloat(product.price),
        image_url: product.image_url || '',
        added_at: new Date().toISOString()
      }];
    });
  };

  // Remove product from wishlist
  const removeFromWishlist = (productId) => {
    setWishlist(prev => prev.filter(item => item.id !== productId));
  };

  // Check if product is in wishlist
  const isInWishlist = (productId) => {
    return wishlist.some(item => item.id === productId);
  };

  // Toggle product in wishlist
  const toggleWishlist = (product) => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  // Clear entire wishlist
  const clearWishlist = () => {
    setWishlist([]);
    localStorage.removeItem('wishlist');
  };

  const value = {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist,
    clearWishlist,
    wishlistCount: wishlist.length
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}
