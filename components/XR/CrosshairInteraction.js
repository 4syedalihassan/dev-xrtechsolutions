import { useEffect, useRef, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { isPositionInsidePerfumeShop } from '../../lib/sceneBoundaries';

export default function CrosshairInteraction({ onProductClick, onProductHover, playerPosition }) {
  const { camera, scene } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const hoveredProduct = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Use ref to track current player position without causing re-renders
  const playerPositionRef = useRef(playerPosition || [0, 0, 0]);
  
  // Update ref when playerPosition changes
  useEffect(() => {
    if (playerPosition) {
      playerPositionRef.current = playerPosition;
    }
  }, [playerPosition]);

  // Helper function to check if player is inside the perfume shop
  const isInsidePerfumeShop = () => {
    const [px, , pz] = playerPositionRef.current;
    return isPositionInsidePerfumeShop(px, pz);
  };

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                     ('ontouchstart' in window) ||
                     (navigator.maxTouchPoints > 0);
      setIsMobile(mobile);
    };

    checkMobile();
  }, []);

  useEffect(() => {
    const handleKeyPress = (e) => {
      // Press E to interact - only works inside perfume shop
      if (e.key === 'e' || e.key === 'E') {
        if (hoveredProduct.current && isInsidePerfumeShop()) {
          onProductClick(hoveredProduct.current);
        }
      }
    };

    const handleClick = (e) => {
      // Left mouse button click - works both with and without pointer lock on mobile
      // Only works inside perfume shop
      if (e.button === 0) {
        // On desktop, require pointer lock. On mobile, allow direct clicks
        if (document.pointerLockElement || isMobile) {
          if (hoveredProduct.current && isInsidePerfumeShop()) {
            onProductClick(hoveredProduct.current);
          }
        }
      }
    };

    // Touch handler for mobile - tap to interact with products
    // Only works inside perfume shop
    const handleTouch = (e) => {
      if (hoveredProduct.current && isInsidePerfumeShop()) {
        e.preventDefault();
        onProductClick(hoveredProduct.current);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('mousedown', handleClick);
    
    // Add touch event for mobile
    if (isMobile) {
      window.addEventListener('touchend', handleTouch, { passive: false });
    }

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('mousedown', handleClick);
      if (isMobile) {
        window.removeEventListener('touchend', handleTouch);
      }
    };
  }, [onProductClick, isMobile]);

  useFrame(() => {
    // Raycast from slightly above center of screen (where crosshair is)
    // Y value of 0.05 moves the raycast point slightly upward
    raycaster.current.setFromCamera(new THREE.Vector2(0, 0.05), camera);

    // Get all intersections
    const intersects = raycaster.current.intersectObjects(scene.children, true);

    // Find first product in intersections
    let foundProduct = null;
    for (const intersect of intersects) {
      // Traverse up the object hierarchy to find product userData
      let obj = intersect.object;
      while (obj) {
        if (obj.userData?.type === 'perfume_product' && obj.userData?.product) {
          foundProduct = obj.userData.product;
          break;
        }
        obj = obj.parent;
      }
      if (foundProduct) break;
    }

    // Update hovered product and set cursor for Crosshair hint
    // Only show hover prompt when inside the perfume shop
    const insideShop = isInsidePerfumeShop();
    
    if (foundProduct && foundProduct.id !== hoveredProduct.current?.id && insideShop) {
      hoveredProduct.current = foundProduct;
      document.body.style.cursor = 'pointer';
      if (onProductHover) onProductHover(foundProduct);
    } else if ((!foundProduct || !insideShop) && hoveredProduct.current) {
      hoveredProduct.current = null;
      document.body.style.cursor = 'auto';
      if (onProductHover) onProductHover(null);
    }
  });

  // No HTML rendering - this component only does raycasting
  return null;
}
