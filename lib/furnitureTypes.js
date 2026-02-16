/**
 * Furniture Types Library
 * Categorized furniture with default properties
 * Sprint 3 - User Story 3.2
 *
 * Categories:
 * - Seating (chairs, sofas, benches)
 * - Tables (dining, coffee, desks)
 * - Storage (shelves, cabinets, drawers)
 * - Medical (exam tables, medical cabinets, equipment)
 * - Retail (display shelves, checkout counters, mannequins)
 * - Decorative (plants, artwork, rugs)
 */

export const FURNITURE_CATEGORIES = {
  SEATING: 'seating',
  TABLES: 'tables',
  STORAGE: 'storage',
  MEDICAL: 'medical',
  RETAIL: 'retail',
  DECORATIVE: 'decorative'
};

export const FURNITURE_TYPES = {
  // SEATING
  OFFICE_CHAIR: {
    id: 'office_chair',
    name: 'Office Chair',
    category: FURNITURE_CATEGORIES.SEATING,
    description: 'Ergonomic office chair with wheels and adjustable height',
    default_properties: {
      scale_x: 0.6,
      scale_y: 1.0,
      scale_z: 0.6,
      color: '#4A90E2',
      has_collision: true,
      collision_type: 'cylinder',
      collision_radius: 0.4,
      is_interactive: false
    },
    suggested_models: ['office_chair_basic', 'office_chair_executive', 'office_chair_mesh']
  },

  SOFA: {
    id: 'sofa',
    name: 'Sofa',
    category: FURNITURE_CATEGORIES.SEATING,
    description: 'Comfortable sofa for waiting areas',
    default_properties: {
      scale_x: 2.0,
      scale_y: 0.9,
      scale_z: 0.9,
      color: '#8B7355',
      has_collision: true,
      collision_type: 'box',
      is_interactive: false
    },
    suggested_models: ['sofa_2seat', 'sofa_3seat', 'sofa_sectional']
  },

  BENCH: {
    id: 'bench',
    name: 'Bench',
    category: FURNITURE_CATEGORIES.SEATING,
    description: 'Simple bench for waiting areas',
    default_properties: {
      scale_x: 1.5,
      scale_y: 0.5,
      scale_z: 0.5,
      color: '#A0A0A0',
      has_collision: true,
      collision_type: 'box',
      is_interactive: false
    },
    suggested_models: ['bench_wood', 'bench_metal', 'bench_padded']
  },

  // TABLES
  RECEPTION_DESK: {
    id: 'reception_desk',
    name: 'Reception Desk',
    category: FURNITURE_CATEGORIES.TABLES,
    description: 'Large professional reception desk',
    default_properties: {
      scale_x: 2.5,
      scale_y: 1.1,
      scale_z: 1.2,
      color: '#8B6F47',
      material: 'wood',
      has_collision: true,
      collision_type: 'box',
      is_interactive: true,
      interaction_type: 'desk'
    },
    suggested_models: ['reception_modern', 'reception_classic', 'reception_corner']
  },

  COFFEE_TABLE: {
    id: 'coffee_table',
    name: 'Coffee Table',
    category: FURNITURE_CATEGORIES.TABLES,
    description: 'Low table for waiting areas',
    default_properties: {
      scale_x: 1.2,
      scale_y: 0.5,
      scale_z: 0.7,
      color: '#654321',
      material: 'wood',
      has_collision: true,
      collision_type: 'box',
      is_interactive: false
    },
    suggested_models: ['coffee_table_modern', 'coffee_table_glass', 'coffee_table_wood']
  },

  DESK: {
    id: 'desk',
    name: 'Office Desk',
    category: FURNITURE_CATEGORIES.TABLES,
    description: 'Standard office desk',
    default_properties: {
      scale_x: 1.6,
      scale_y: 0.75,
      scale_z: 0.8,
      color: '#6F4E37',
      material: 'wood',
      has_collision: true,
      collision_type: 'box',
      is_interactive: true,
      interaction_type: 'desk'
    },
    suggested_models: ['desk_standard', 'desk_executive', 'desk_standing']
  },

  // STORAGE
  BOOKSHELF: {
    id: 'bookshelf',
    name: 'Bookshelf',
    category: FURNITURE_CATEGORIES.STORAGE,
    description: 'Tall bookshelf for documents and books',
    default_properties: {
      scale_x: 1.2,
      scale_y: 2.0,
      scale_z: 0.4,
      color: '#8B7355',
      material: 'wood',
      has_collision: true,
      collision_type: 'box',
      is_interactive: true,
      interaction_type: 'storage'
    },
    suggested_models: ['bookshelf_5shelf', 'bookshelf_7shelf', 'bookshelf_cabinet']
  },

  FILING_CABINET: {
    id: 'filing_cabinet',
    name: 'Filing Cabinet',
    category: FURNITURE_CATEGORIES.STORAGE,
    description: 'Metal filing cabinet for documents',
    default_properties: {
      scale_x: 0.5,
      scale_y: 1.3,
      scale_z: 0.7,
      color: '#A9A9A9',
      material: 'metal',
      has_collision: true,
      collision_type: 'box',
      is_interactive: true,
      interaction_type: 'storage'
    },
    suggested_models: ['filing_2drawer', 'filing_4drawer', 'filing_lateral']
  },

  CABINET: {
    id: 'cabinet',
    name: 'Storage Cabinet',
    category: FURNITURE_CATEGORIES.STORAGE,
    description: 'General storage cabinet',
    default_properties: {
      scale_x: 1.0,
      scale_y: 1.8,
      scale_z: 0.5,
      color: '#D2B48C',
      material: 'wood',
      has_collision: true,
      collision_type: 'box',
      is_interactive: true,
      interaction_type: 'storage'
    },
    suggested_models: ['cabinet_tall', 'cabinet_wide', 'cabinet_glass_door']
  },

  // MEDICAL
  EXAM_TABLE: {
    id: 'exam_table',
    name: 'Examination Table',
    category: FURNITURE_CATEGORIES.MEDICAL,
    description: 'Medical examination table',
    default_properties: {
      scale_x: 0.8,
      scale_y: 0.9,
      scale_z: 2.0,
      color: '#E0E0E0',
      material: 'metal',
      has_collision: true,
      collision_type: 'box',
      is_interactive: true,
      interaction_type: 'medical_equipment'
    },
    suggested_models: ['exam_table_standard', 'exam_table_adjustable', 'exam_table_pediatric']
  },

  MEDICAL_CABINET: {
    id: 'medical_cabinet',
    name: 'Medical Cabinet',
    category: FURNITURE_CATEGORIES.MEDICAL,
    description: 'Locked cabinet for medical supplies',
    default_properties: {
      scale_x: 0.8,
      scale_y: 1.5,
      scale_z: 0.4,
      color: '#FFFFFF',
      material: 'metal',
      has_collision: true,
      collision_type: 'box',
      is_interactive: true,
      interaction_type: 'storage'
    },
    suggested_models: ['medical_cabinet_wall', 'medical_cabinet_floor', 'medical_cabinet_glass']
  },

  MEDICAL_CART: {
    id: 'medical_cart',
    name: 'Medical Cart',
    category: FURNITURE_CATEGORIES.MEDICAL,
    description: 'Mobile cart for medical supplies',
    default_properties: {
      scale_x: 0.6,
      scale_y: 1.0,
      scale_z: 0.5,
      color: '#F0F0F0',
      material: 'metal',
      has_collision: true,
      collision_type: 'box',
      is_interactive: true,
      interaction_type: 'medical_equipment'
    },
    suggested_models: ['medical_cart_2shelf', 'medical_cart_3shelf', 'medical_cart_drawer']
  },

  WAITING_ROOM_CHAIR: {
    id: 'waiting_room_chair',
    name: 'Waiting Room Chair',
    category: FURNITURE_CATEGORIES.SEATING,
    description: 'Comfortable chair for waiting areas',
    default_properties: {
      scale_x: 0.7,
      scale_y: 0.9,
      scale_z: 0.7,
      color: '#4682B4',
      has_collision: true,
      collision_type: 'box',
      is_interactive: false
    },
    suggested_models: ['waiting_chair_single', 'waiting_chair_linked', 'waiting_chair_padded']
  },

  PHARMACY_COUNTER: {
    id: 'pharmacy_counter',
    name: 'Pharmacy Counter',
    category: FURNITURE_CATEGORIES.MEDICAL,
    description: 'Professional pharmacy counter with aluminum frame and glass top for dispensing medications',
    default_properties: {
      scale_x: 3.0,
      scale_y: 1.1,
      scale_z: 1.0,
      color: '#B0B0B0',  // Aluminum silver
      material: 'metal',
      has_collision: true,
      collision_type: 'box',
      is_interactive: true,
      interaction_type: 'pharmacy_counter'
    },
    suggested_models: ['pharmacy_counter_standard', 'pharmacy_counter_glass_top', 'pharmacy_counter_modern']
  },

  PHARMACY_SHELF: {
    id: 'pharmacy_shelf',
    name: 'Pharmacy Shelf',
    category: FURNITURE_CATEGORIES.MEDICAL,
    description: 'Medical-grade shelving unit for pharmaceutical storage and organization',
    default_properties: {
      scale_x: 2.5,
      scale_y: 2.2,
      scale_z: 0.5,
      color: '#FFFFFF',  // Clean white for medical environment
      material: 'metal',
      has_collision: true,
      collision_type: 'box',
      is_interactive: true,
      interaction_type: 'storage'
    },
    suggested_models: ['pharmacy_shelf_wall', 'pharmacy_shelf_modular', 'pharmacy_shelf_lockable']
  },

  // RETAIL
  DISPLAY_SHELF: {
    id: 'display_shelf',
    name: 'Display Shelf',
    category: FURNITURE_CATEGORIES.RETAIL,
    description: 'Retail display shelf for products',
    default_properties: {
      scale_x: 1.5,
      scale_y: 1.8,
      scale_z: 0.4,
      color: '#C0C0C0',
      material: 'metal',
      has_collision: true,
      collision_type: 'box',
      is_interactive: true,
      interaction_type: 'display'
    },
    suggested_models: ['display_shelf_glass', 'display_shelf_wood', 'display_shelf_backlit']
  },

  CHECKOUT_COUNTER: {
    id: 'checkout_counter',
    name: 'Checkout Counter',
    category: FURNITURE_CATEGORIES.RETAIL,
    description: 'Point of sale counter',
    default_properties: {
      scale_x: 2.5,
      scale_y: 1.0,
      scale_z: 1.2,
      color: '#8B6F47',
      material: 'wood',
      has_collision: true,
      collision_type: 'box',
      is_interactive: true,
      interaction_type: 'checkout'
    },
    suggested_models: ['checkout_modern', 'checkout_classic', 'checkout_corner']
  },

  MANNEQUIN: {
    id: 'mannequin',
    name: 'Mannequin',
    category: FURNITURE_CATEGORIES.RETAIL,
    description: 'Display mannequin for clothing or accessories',
    default_properties: {
      scale_x: 0.5,
      scale_y: 1.8,
      scale_z: 0.3,
      color: '#F5F5DC',
      has_collision: true,
      collision_type: 'cylinder',
      collision_radius: 0.3,
      is_interactive: true,
      interaction_type: 'display'
    },
    suggested_models: ['mannequin_female', 'mannequin_male', 'mannequin_child']
  },

  PRODUCT_RACK: {
    id: 'product_rack',
    name: 'Product Rack',
    category: FURNITURE_CATEGORIES.RETAIL,
    description: 'Hanging rack for products',
    default_properties: {
      scale_x: 1.2,
      scale_y: 1.5,
      scale_z: 0.5,
      color: '#C0C0C0',
      material: 'metal',
      has_collision: true,
      collision_type: 'box',
      is_interactive: true,
      interaction_type: 'display'
    },
    suggested_models: ['product_rack_circular', 'product_rack_wall', 'product_rack_tiered']
  },

  // DECORATIVE
  PLANT_POT: {
    id: 'plant_pot',
    name: 'Plant Pot',
    category: FURNITURE_CATEGORIES.DECORATIVE,
    description: 'Decorative plant in pot',
    default_properties: {
      scale_x: 0.5,
      scale_y: 1.2,
      scale_z: 0.5,
      color: '#228B22',
      has_collision: true,
      collision_type: 'cylinder',
      collision_radius: 0.3,
      is_interactive: false
    },
    suggested_models: ['plant_tall', 'plant_bushy', 'plant_leafy', 'plant_small']
  },

  WALL_ART: {
    id: 'wall_art',
    name: 'Wall Art',
    category: FURNITURE_CATEGORIES.DECORATIVE,
    description: 'Framed artwork or poster',
    default_properties: {
      scale_x: 1.0,
      scale_y: 0.8,
      scale_z: 0.05,
      color: '#000000',
      has_collision: false,
      collision_type: 'none',
      is_interactive: true,
      interaction_type: 'info_display'
    },
    suggested_models: ['art_landscape', 'art_portrait', 'art_abstract', 'poster_health']
  },

  RUG: {
    id: 'rug',
    name: 'Area Rug',
    category: FURNITURE_CATEGORIES.DECORATIVE,
    description: 'Decorative floor rug',
    default_properties: {
      scale_x: 2.0,
      scale_y: 0.02,
      scale_z: 1.5,
      color: '#8B4513',
      has_collision: false,
      collision_type: 'none',
      is_interactive: false
    },
    suggested_models: ['rug_rectangular', 'rug_circular', 'rug_runner']
  },

  LAMP: {
    id: 'lamp',
    name: 'Floor Lamp',
    category: FURNITURE_CATEGORIES.DECORATIVE,
    description: 'Standing floor lamp',
    default_properties: {
      scale_x: 0.3,
      scale_y: 1.8,
      scale_z: 0.3,
      color: '#FFD700',
      has_collision: true,
      collision_type: 'cylinder',
      collision_radius: 0.2,
      is_interactive: true,
      interaction_type: 'light_switch'
    },
    suggested_models: ['lamp_modern', 'lamp_traditional', 'lamp_arc']
  }
};

/**
 * Get all furniture types as array
 */
export function getAllFurnitureTypes() {
  return Object.values(FURNITURE_TYPES);
}

/**
 * Get furniture types by category
 */
export function getFurnitureTypesByCategory(category) {
  return Object.values(FURNITURE_TYPES).filter(
    type => type.category === category
  );
}

/**
 * Get furniture type by ID
 */
export function getFurnitureTypeById(id) {
  return Object.values(FURNITURE_TYPES).find(
    type => type.id === id
  );
}

/**
 * Get all categories with counts
 */
export function getCategoriesWithCounts() {
  const counts = {};
  Object.values(FURNITURE_CATEGORIES).forEach(category => {
    counts[category] = getFurnitureTypesByCategory(category).length;
  });
  return counts;
}

/**
 * Get category display name
 */
export function getCategoryDisplayName(category) {
  const names = {
    [FURNITURE_CATEGORIES.SEATING]: 'Seating',
    [FURNITURE_CATEGORIES.TABLES]: 'Tables & Desks',
    [FURNITURE_CATEGORIES.STORAGE]: 'Storage',
    [FURNITURE_CATEGORIES.MEDICAL]: 'Medical Equipment',
    [FURNITURE_CATEGORIES.RETAIL]: 'Retail Displays',
    [FURNITURE_CATEGORIES.DECORATIVE]: 'Decorative Items'
  };
  return names[category] || category;
}

/**
 * Validate furniture properties
 */
export function validateFurnitureProperties(properties) {
  const errors = [];

  // Required fields
  if (!properties.furniture_type) {
    errors.push('furniture_type is required');
  }

  // Scale validation
  if (properties.scale_x !== undefined && properties.scale_x <= 0) {
    errors.push('scale_x must be greater than 0');
  }
  if (properties.scale_y !== undefined && properties.scale_y <= 0) {
    errors.push('scale_y must be greater than 0');
  }
  if (properties.scale_z !== undefined && properties.scale_z <= 0) {
    errors.push('scale_z must be greater than 0');
  }

  // Collision type validation
  const validCollisionTypes = ['box', 'sphere', 'cylinder', 'custom', 'none'];
  if (properties.collision_type && !validCollisionTypes.includes(properties.collision_type)) {
    errors.push(`collision_type must be one of: ${validCollisionTypes.join(', ')}`);
  }

  // Interaction type validation (optional field)
  const validInteractionTypes = [
    'desk', 'storage', 'medical_equipment', 'display',
    'checkout', 'info_display', 'light_switch', 'pharmacy_counter'
  ];
  if (properties.interaction_type && !validInteractionTypes.includes(properties.interaction_type)) {
    errors.push(`interaction_type must be one of: ${validInteractionTypes.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get default properties for a furniture type
 */
export function getDefaultProperties(furnitureTypeId) {
  const furnitureType = getFurnitureTypeById(furnitureTypeId);
  if (!furnitureType) {
    return null;
  }

  return {
    ...furnitureType.default_properties,
    furniture_type: furnitureType.id,
    name: furnitureType.name,
    position_x: 0,
    position_y: 0,
    position_z: 0,
    rotation_x: 0,
    rotation_y: 0,
    rotation_z: 0,
    display_order: 0,
    active: true,
    properties: {
      category: furnitureType.category,
      description: furnitureType.description
    }
  };
}
