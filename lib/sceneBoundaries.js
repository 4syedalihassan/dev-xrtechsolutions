/**
 * Scene Boundaries Configuration
 * 
 * This file contains the boundary definitions for buildings and areas in the XR scene.
 * These constants are used by multiple components (FirstPersonControls, CrosshairInteraction, etc.)
 * to ensure consistent collision detection and interaction boundaries.
 */

// Platform/Building base size
export const PLATFORM_SIZE = 20;
export const WALL_THICKNESS = 0.2;
export const PLAYER_RADIUS = 0.5;

// Perfume Shop boundaries
export const PERFUME_SHOP_WIDTH = 12;
export const PERFUME_SHOP_DEPTH = 8;
export const PERFUME_SHOP_X = PLATFORM_SIZE / 2 + 6 + 0.3; // Adjacent to east wall with 0.3m gap
export const PERFUME_SHOP_Z = -PLATFORM_SIZE / 2 + 4; // Moved forward to align walls

/**
 * Check if a position is inside the perfume shop boundaries
 * @param {number} x - X coordinate
 * @param {number} z - Z coordinate
 * @returns {boolean} - True if position is inside the perfume shop
 */
export function isPositionInsidePerfumeShop(x, z) {
  return (
    x >= PERFUME_SHOP_X - PERFUME_SHOP_WIDTH / 2 &&
    x <= PERFUME_SHOP_X + PERFUME_SHOP_WIDTH / 2 &&
    z >= PERFUME_SHOP_Z - PERFUME_SHOP_DEPTH / 2 &&
    z <= PERFUME_SHOP_Z + PERFUME_SHOP_DEPTH / 2
  );
}
