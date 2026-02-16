/**
 * Furniture Component Registry
 * Maps furniture types from database to React Three Fiber components
 *
 * This enables dynamic furniture rendering based on database configuration
 */

import ReceptionDesk from '../components/XR/ReceptionDesk';
import OfficeChair from '../components/XR/OfficeChair';
import CheckoutCounter from '../components/XR/CheckoutCounter';
import PerfumeShelf from '../components/XR/PerfumeShelf';
import LEDTV from '../components/XR/LEDTV';
import Whiteboard from '../components/XR/Whiteboard';
import CorkBoard from '../components/XR/CorkBoard';
import PlantPot from '../components/XR/PlantPot';
import PharmacyCounter from '../components/XR/PharmacyCounter';
import PharmacyShelf from '../components/XR/PharmacyShelf';

/**
 * Registry of all available furniture components
 * Key: furniture_type from database
 * Value: React component
 */
export const FURNITURE_REGISTRY = {
  // Office Furniture
  'reception_desk': ReceptionDesk,
  'office_chair': OfficeChair,
  'desk': ReceptionDesk, // Alias

  // Medical/Pharmacy Furniture
  'pharmacy_counter': PharmacyCounter,
  'pharmacy_shelf': PharmacyShelf,

  // Retail Furniture
  'checkout_counter': CheckoutCounter,
  'perfume_shelf': PerfumeShelf,
  'shelf': PerfumeShelf, // Generic shelf
  'display_shelf': PerfumeShelf,

  // Electronics & Displays
  'led_tv': LEDTV,
  'tv': LEDTV,
  'monitor': LEDTV,

  // Educational & Informational
  'whiteboard': Whiteboard,
  'cork_board': CorkBoard,
  'bulletin_board': CorkBoard,

  // Decorative
  'plant_pot': PlantPot,
  'plant': PlantPot,
};

/**
 * Get component for a given furniture type
 * @param {string} furnitureType - The furniture type from database
 * @returns {React.Component|null} The component or null if not found
 */
export function getFurnitureComponent(furnitureType) {
  const component = FURNITURE_REGISTRY[furnitureType?.toLowerCase()];

  if (!component) {
    console.warn(`Furniture type "${furnitureType}" not found in registry. Available types:`, Object.keys(FURNITURE_REGISTRY));
  }

  return component || null;
}

/**
 * Check if a furniture type is registered
 * @param {string} furnitureType - The furniture type to check
 * @returns {boolean}
 */
export function isFurnitureTypeRegistered(furnitureType) {
  return !!FURNITURE_REGISTRY[furnitureType?.toLowerCase()];
}

/**
 * Get all registered furniture types
 * @returns {string[]}
 */
export function getAllFurnitureTypes() {
  return Object.keys(FURNITURE_REGISTRY);
}

/**
 * Register a new furniture component
 * Useful for adding custom furniture types at runtime
 * @param {string} furnitureType - The furniture type identifier
 * @param {React.Component} component - The React component
 */
export function registerFurnitureComponent(furnitureType, component) {
  if (FURNITURE_REGISTRY[furnitureType]) {
    console.warn(`Furniture type "${furnitureType}" is already registered. Overwriting.`);
  }

  FURNITURE_REGISTRY[furnitureType] = component;
  console.log(`Registered furniture component: ${furnitureType}`);
}

/**
 * Get furniture metadata for admin UI
 * Returns information about available furniture types for building configuration
 */
export const FURNITURE_METADATA = {
  'reception_desk': {
    name: 'Reception Desk',
    category: 'office',
    description: 'Professional reception desk with computer setup',
    defaultProps: { size: [4, 1.2, 1.5] },
    icon: '🖥️'
  },
  'office_chair': {
    name: 'Office Chair',
    category: 'office',
    description: 'Ergonomic office chair with wheels',
    defaultProps: { size: 1 },
    icon: '💺'
  },
  'pharmacy_counter': {
    name: 'Pharmacy Counter',
    category: 'medical',
    description: 'Medical-grade pharmacy counter with aluminum finish',
    defaultProps: { color: '#B0B0B0', scale: [1, 1, 1] },
    icon: '💊'
  },
  'pharmacy_shelf': {
    name: 'Pharmacy Shelf',
    category: 'medical',
    description: 'Medical-grade shelving for pharmaceutical storage',
    defaultProps: { color: '#FFFFFF', shelfLevels: 5, scale: [1, 1, 1] },
    icon: '🏥'
  },
  'checkout_counter': {
    name: 'Checkout Counter',
    category: 'retail',
    description: 'Retail checkout counter with cash register',
    defaultProps: { has_register: true, has_card_reader: true },
    icon: '🛒'
  },
  'perfume_shelf': {
    name: 'Display Shelf',
    category: 'retail',
    description: 'Product display shelving unit',
    defaultProps: { slots: 7, levels: 4 },
    icon: '🧴'
  },
  'led_tv': {
    name: 'LED TV',
    category: 'electronics',
    description: 'Wall-mounted LED television display',
    defaultProps: { size: [3, 1.7], content: 'Display Content', isOn: true },
    icon: '📺'
  },
  'whiteboard': {
    name: 'Whiteboard',
    category: 'educational',
    description: 'Medical or educational whiteboard',
    defaultProps: { size: [2.8, 1.6], content: 'Information' },
    icon: '📋'
  },
  'cork_board': {
    name: 'Cork Board',
    category: 'educational',
    description: 'Bulletin board for notices',
    defaultProps: { size: [1.8, 1.2] },
    icon: '📌'
  },
  'plant_pot': {
    name: 'Plant Pot',
    category: 'decorative',
    description: 'Decorative plant in pot',
    defaultProps: { size: 1, plantType: 'leafy' },
    icon: '🪴'
  }
};

/**
 * Get furniture metadata for a specific type
 * @param {string} furnitureType
 * @returns {object|null}
 */
export function getFurnitureMetadata(furnitureType) {
  return FURNITURE_METADATA[furnitureType] || null;
}

export default FURNITURE_REGISTRY;
