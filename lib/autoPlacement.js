// Auto-Placement Algorithm for Building Positioning
// Sprint 2 - User Story 2.3
// Calculates optimal 3D positions for buildings to avoid overlaps

/**
 * Calculate the next available position for a building
 * @param {Array} existingBuildings - Array of existing buildings with position and template data
 * @param {Object} newTemplate - Template of the building to be placed
 * @param {String} placement - Placement preference: 'center', 'left', 'right', 'custom'
 * @returns {Object} - { position_x, position_y, position_z, placement_type }
 */
export function calculateBuildingPosition(existingBuildings, newTemplate, placement = 'center') {
  const SPACING = 0.3; // Gap between buildings in meters
  const DEFAULT_Y = 0; // Ground level

  // If no existing buildings, place at center
  if (!existingBuildings || existingBuildings.length === 0) {
    return {
      position_x: 0,
      position_y: DEFAULT_Y,
      position_z: 0,
      placement_type: 'center'
    };
  }

  // Calculate bounding boxes for all existing buildings
  const boundingBoxes = existingBuildings.map(building => {
    const template = building.template || building;
    const width = template.width || 20;
    const depth = template.depth || 20;

    return {
      building_id: building.id,
      min_x: building.position_x - width / 2,
      max_x: building.position_x + width / 2,
      min_z: building.position_z - depth / 2,
      max_z: building.position_z + depth / 2,
      center_x: building.position_x,
      center_z: building.position_z,
      width,
      depth
    };
  });

  const newWidth = newTemplate.width || 20;
  const newDepth = newTemplate.depth || 20;

  // Handle different placement strategies
  switch (placement) {
    case 'left':
      return placeLeft(boundingBoxes, newWidth, newDepth, SPACING, DEFAULT_Y);

    case 'right':
      return placeRight(boundingBoxes, newWidth, newDepth, SPACING, DEFAULT_Y);

    case 'center':
      return placeCenter(boundingBoxes, newWidth, newDepth, SPACING, DEFAULT_Y);

    default:
      return placeCenter(boundingBoxes, newWidth, newDepth, SPACING, DEFAULT_Y);
  }
}

/**
 * Place building to the left of existing buildings
 */
function placeLeft(boundingBoxes, newWidth, newDepth, spacing, y) {
  // Find the leftmost building
  const leftmost = boundingBoxes.reduce((left, box) => {
    return box.min_x < left.min_x ? box : left;
  });

  // Position new building to the left with spacing
  const position_x = leftmost.min_x - spacing - newWidth / 2;
  const position_z = leftmost.center_z; // Align on same Z axis

  return {
    position_x,
    position_y: y,
    position_z,
    placement_type: 'left'
  };
}

/**
 * Place building to the right of existing buildings
 */
function placeRight(boundingBoxes, newWidth, newDepth, spacing, y) {
  // Find the rightmost building
  const rightmost = boundingBoxes.reduce((right, box) => {
    return box.max_x > right.max_x ? box : right;
  });

  // Position new building to the right with spacing
  const position_x = rightmost.max_x + spacing + newWidth / 2;
  const position_z = rightmost.center_z; // Align on same Z axis

  return {
    position_x,
    position_y: y,
    position_z,
    placement_type: 'right'
  };
}

/**
 * Place building in center with optimal spacing
 * Uses smart grid placement to avoid overlaps
 */
function placeCenter(boundingBoxes, newWidth, newDepth, spacing, y) {
  // Calculate overall bounds of existing buildings
  const minX = Math.min(...boundingBoxes.map(b => b.min_x));
  const maxX = Math.max(...boundingBoxes.map(b => b.max_x));
  const minZ = Math.min(...boundingBoxes.map(b => b.min_z));
  const maxZ = Math.max(...boundingBoxes.map(b => b.max_z));

  const centerX = (minX + maxX) / 2;
  const centerZ = (minZ + maxZ) / 2;

  // Try to place near center, but check for collisions
  const candidatePositions = [
    // Center
    { x: centerX, z: centerZ },
    // Behind (negative Z)
    { x: centerX, z: minZ - spacing - newDepth / 2 },
    // Front (positive Z)
    { x: centerX, z: maxZ + spacing + newDepth / 2 },
    // Left
    { x: minX - spacing - newWidth / 2, z: centerZ },
    // Right
    { x: maxX + spacing + newWidth / 2, z: centerZ },
    // Diagonal positions
    { x: minX - spacing - newWidth / 2, z: minZ - spacing - newDepth / 2 },
    { x: maxX + spacing + newWidth / 2, z: minZ - spacing - newDepth / 2 },
    { x: minX - spacing - newWidth / 2, z: maxZ + spacing + newDepth / 2 },
    { x: maxX + spacing + newWidth / 2, z: maxZ + spacing + newDepth / 2 }
  ];

  // Find first position without collision
  for (const candidate of candidatePositions) {
    const newBox = {
      min_x: candidate.x - newWidth / 2,
      max_x: candidate.x + newWidth / 2,
      min_z: candidate.z - newDepth / 2,
      max_z: candidate.z + newDepth / 2
    };

    // Check for collision with existing buildings
    const hasCollision = boundingBoxes.some(existingBox =>
      checkCollision(newBox, existingBox, spacing)
    );

    if (!hasCollision) {
      return {
        position_x: candidate.x,
        position_y: y,
        position_z: candidate.z,
        placement_type: 'center'
      };
    }
  }

  // If all positions have collisions, place to the right as fallback
  return placeRight(boundingBoxes, newWidth, newDepth, spacing, y);
}

/**
 * Check if two bounding boxes collide (with spacing buffer)
 */
function checkCollision(box1, box2, spacing) {
  const buffer = spacing;

  // Add buffer to both boxes
  const box1_min_x = box1.min_x - buffer;
  const box1_max_x = box1.max_x + buffer;
  const box1_min_z = box1.min_z - buffer;
  const box1_max_z = box1.max_z + buffer;

  const box2_min_x = box2.min_x - buffer;
  const box2_max_x = box2.max_x + buffer;
  const box2_min_z = box2.min_z - buffer;
  const box2_max_z = box2.max_z + buffer;

  // Check for overlap on X axis
  const overlapX = box1_min_x < box2_max_x && box1_max_x > box2_min_x;

  // Check for overlap on Z axis
  const overlapZ = box1_min_z < box2_max_z && box1_max_z > box2_min_z;

  return overlapX && overlapZ;
}

/**
 * Calculate distance between two buildings (center to center)
 */
export function calculateDistance(building1, building2) {
  const dx = building1.position_x - building2.position_x;
  const dz = building1.position_z - building2.position_z;
  return Math.sqrt(dx * dx + dz * dz);
}

/**
 * Get suggested placement based on available space
 * @param {Array} existingBuildings - Existing buildings
 * @param {Object} newTemplate - New building template
 * @returns {Array} - Array of placement suggestions with scores
 */
export function getSuggestedPlacements(existingBuildings, newTemplate) {
  const placements = ['center', 'left', 'right'];
  const suggestions = [];

  for (const placement of placements) {
    const position = calculateBuildingPosition(existingBuildings, newTemplate, placement);

    // Calculate score based on distance from origin and other buildings
    const distanceFromOrigin = Math.sqrt(
      position.position_x ** 2 + position.position_z ** 2
    );

    // Prefer positions closer to origin
    const score = 100 - Math.min(distanceFromOrigin, 100);

    suggestions.push({
      placement,
      position,
      score: Math.round(score),
      description: getPlacementDescription(placement, position)
    });
  }

  // Sort by score (highest first)
  return suggestions.sort((a, b) => b.score - a.score);
}

/**
 * Get human-readable description of placement
 */
function getPlacementDescription(placement, position) {
  const x = position.position_x.toFixed(1);
  const z = position.position_z.toFixed(1);

  const descriptions = {
    center: `Centered at (${x}, ${z}) with optimal spacing`,
    left: `Left side at (${x}, ${z}) aligned with existing buildings`,
    right: `Right side at (${x}, ${z}) aligned with existing buildings`
  };

  return descriptions[placement] || `Custom position at (${x}, ${z})`;
}

/**
 * Validate that a position doesn't overlap with existing buildings
 */
export function validatePosition(existingBuildings, newTemplate, position) {
  if (!existingBuildings || existingBuildings.length === 0) {
    return { valid: true, message: 'No existing buildings to check' };
  }

  const SPACING = 0.3;
  const newWidth = newTemplate.width || 20;
  const newDepth = newTemplate.depth || 20;

  const newBox = {
    min_x: position.position_x - newWidth / 2,
    max_x: position.position_x + newWidth / 2,
    min_z: position.position_z - newDepth / 2,
    max_z: position.position_z + newDepth / 2
  };

  // Check each existing building
  for (const building of existingBuildings) {
    const template = building.template || building;
    const width = template.width || 20;
    const depth = template.depth || 20;

    const existingBox = {
      min_x: building.position_x - width / 2,
      max_x: building.position_x + width / 2,
      min_z: building.position_z - depth / 2,
      max_z: building.position_z + depth / 2
    };

    if (checkCollision(newBox, existingBox, SPACING)) {
      return {
        valid: false,
        message: `Position overlaps with building "${building.name}"`,
        conflicting_building: building.id
      };
    }
  }

  return { valid: true, message: 'Position is valid' };
}

/**
 * Calculate optimal grid layout for multiple buildings
 * Useful for batch placement
 */
export function calculateGridLayout(templates, spacing = 0.3) {
  if (!templates || templates.length === 0) return [];

  const positions = [];
  let currentX = 0;
  let currentZ = 0;
  let maxHeight = 0;

  // Simple row-based grid layout
  const maxWidthPerRow = 60; // Maximum width before wrapping to next row

  for (let i = 0; i < templates.length; i++) {
    const template = templates[i];
    const width = template.width || 20;
    const depth = template.depth || 20;

    // Check if we need to wrap to next row
    if (currentX > 0 && currentX + width / 2 > maxWidthPerRow) {
      currentX = 0;
      currentZ += maxHeight + spacing;
      maxHeight = 0;
    }

    positions.push({
      template_id: template.id,
      position_x: currentX + width / 2,
      position_y: 0,
      position_z: currentZ + depth / 2,
      placement_type: 'grid'
    });

    currentX += width + spacing;
    maxHeight = Math.max(maxHeight, depth);
  }

  return positions;
}
