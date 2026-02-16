/**
 * Slot Assignment Utilities
 * 
 * Provides utilities for automatic slot assignment in product shelves
 * to prevent conflicts and ensure products are placed in available positions.
 */

/**
 * Fetch occupied slots from database
 * @private
 */
async function fetchOccupiedSlots(supabase, furnitureId, shelfIndex) {
  const { data, error } = await supabase
    .from('products')
    .select('slot_index')
    .eq('furniture_id', furnitureId)
    .eq('shelf_index', shelfIndex)
    .not('slot_index', 'is', null)
    .order('slot_index', { ascending: true });

  if (error) {
    console.error('Error fetching occupied slots:', error);
    return null;
  }
  return data;
}

/**
 * Convert occupied products to Set of indices
 * @private
 */
function createOccupiedSlotsSet(products) {
  return new Set(products.map(p => parseInt(p.slot_index)));
}

/**
 * Find first gap in occupied slots
 * @private
 */
function findFirstGap(occupiedSlots, maxSlots) {
  for (let slot = 0; slot < maxSlots; slot++) {
    if (!occupiedSlots.has(slot)) {
      return slot;
    }
  }
  return null;
}

/**
 * Find the next available slot for a product in a specific furniture/shelf
 * 
 * @param {Object} supabase - Supabase client instance
 * @param {string} furnitureId - The furniture ID (shelf unit)
 * @param {number} shelfIndex - The shelf level (0-3 typically)
 * @param {number} maxSlotsPerShelf - Maximum number of slots per shelf (default: 6)
 * @returns {Promise<number|null>} - The next available slot_index, or null if all slots are full or on error
 */
export async function findNextAvailableSlot(supabase, furnitureId, shelfIndex, maxSlotsPerShelf = 6) {
  try {
    const occupiedProducts = await fetchOccupiedSlots(supabase, furnitureId, shelfIndex);
    if (!occupiedProducts) return null;

    const occupiedSlots = createOccupiedSlotsSet(occupiedProducts);
    return findFirstGap(occupiedSlots, maxSlotsPerShelf);
  } catch (error) {
    console.error('Error in findNextAvailableSlot:', error);
    return null;
  }
}

/**
 * Find the next available position (shelf_index and slot_index) for a product
 * 
 * @param {Object} supabase - Supabase client instance
 * @param {string} furnitureId - The furniture ID (shelf unit)
 * @param {number} maxShelfLevels - Maximum number of shelf levels (default: 4)
 * @param {number} maxSlotsPerShelf - Maximum number of slots per shelf (default: 6)
 * @returns {Promise<{shelfIndex: number, slotIndex: number}|null>} - Available position or null if all full or on error
 */
export async function findNextAvailablePosition(supabase, furnitureId, maxShelfLevels = 4, maxSlotsPerShelf = 6) {
  try {
    // Try each shelf level from bottom to top
    for (let shelfIndex = 0; shelfIndex < maxShelfLevels; shelfIndex++) {
      const slotIndex = await findNextAvailableSlot(supabase, furnitureId, shelfIndex, maxSlotsPerShelf);
      
      if (slotIndex !== null) {
        return { shelfIndex, slotIndex };
      }
    }

    // All positions are full
    return null;
  } catch (error) {
    console.error('Error in findNextAvailablePosition:', error);
    return null; // Return null on error to prevent conflicts
  }
}

/**
 * Build query for checking slot availability
 * @private
 * @param {Object} supabase - Supabase client instance
 * @param {Object} params - Query parameters
 * @param {string} params.furnitureId - The furniture ID
 * @param {number} params.shelfIndex - The shelf level
 * @param {number} params.slotIndex - The slot position
 * @param {string} [params.excludeProductId] - Optional product ID to exclude
 */
function buildAvailabilityQuery(supabase, params) {
  const { furnitureId, shelfIndex, slotIndex, excludeProductId } = params;
  
  let query = supabase
    .from('products')
    .select('id')
    .eq('furniture_id', furnitureId)
    .eq('shelf_index', shelfIndex)
    .eq('slot_index', slotIndex);

  if (excludeProductId) {
    query = query.neq('id', excludeProductId);
  }
  return query;
}

/**
 * Check if a specific slot is available
 * 
 * @param {Object} supabase - Supabase client instance
 * @param {Object} params - Slot parameters
 * @param {string} params.furnitureId - The furniture ID (shelf unit)
 * @param {number} params.shelfIndex - The shelf level
 * @param {number} params.slotIndex - The slot position
 * @param {string} [params.excludeProductId] - Optional product ID to exclude (for updates)
 * @returns {Promise<boolean>} - True if slot is available, false if occupied or on error
 */
export async function isSlotAvailable(supabase, params) {
  try {
    const query = buildAvailabilityQuery(supabase, params);
    const { data, error } = await query;

    if (error) {
      console.error('Error checking slot availability:', error);
      return false;
    }

    return !data || data.length === 0;
  } catch (error) {
    console.error('Error in isSlotAvailable:', error);
    return false;
  }
}

/**
 * Initialize empty occupancy map
 * @private
 */
function initializeEmptyMap(maxShelfLevels, maxSlotsPerShelf) {
  return Array.from({ length: maxShelfLevels }, () => 
    Array(maxSlotsPerShelf).fill(null)
  );
}

/**
 * Check if indices are within valid bounds
 * @private
 */
function isWithinBounds(shelfIdx, slotIdx, maxShelfLevels, maxSlotsPerShelf) {
  const validShelf = shelfIdx >= 0 && shelfIdx < maxShelfLevels;
  const validSlot = slotIdx >= 0 && slotIdx < maxSlotsPerShelf;
  return validShelf && validSlot;
}

/**
 * Fill map with product data
 * @private
 */
function populateMap(map, products, maxShelfLevels, maxSlotsPerShelf) {
  products.forEach(product => {
    const shelfIdx = parseInt(product.shelf_index);
    const slotIdx = parseInt(product.slot_index);
    
    if (isWithinBounds(shelfIdx, slotIdx, maxShelfLevels, maxSlotsPerShelf)) {
      map[shelfIdx][slotIdx] = product;
    }
  });
  return map;
}

/**
 * Get occupancy map for a furniture unit (for visualization)
 * 
 * @param {Object} supabase - Supabase client instance
 * @param {string} furnitureId - The furniture ID (shelf unit)
 * @param {number} maxShelfLevels - Maximum number of shelf levels (default: 4)
 * @param {number} maxSlotsPerShelf - Maximum number of slots per shelf (default: 6)
 * @returns {Promise<Array<Array<Object|null>>>} - 2D array of products [shelf][slot]
 */
export async function getFurnitureOccupancyMap(supabase, furnitureId, maxShelfLevels = 4, maxSlotsPerShelf = 6) {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, shelf_index, slot_index, image_url')
      .eq('furniture_id', furnitureId)
      .not('shelf_index', 'is', null)
      .not('slot_index', 'is', null);

    if (error) {
      console.error('Error fetching occupancy map:', error);
      return [];
    }

    const map = initializeEmptyMap(maxShelfLevels, maxSlotsPerShelf);
    return populateMap(map, products, maxShelfLevels, maxSlotsPerShelf);
  } catch (error) {
    console.error('Error in getFurnitureOccupancyMap:', error);
    return [];
  }
}
