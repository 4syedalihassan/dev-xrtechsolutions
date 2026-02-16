/**
 * FurnitureRenderer Component
 * Dynamically renders furniture based on database configuration
 *
 * Features:
 * - Maps furniture types to components via registry
 * - Applies position, rotation, and scale from database
 * - Passes custom properties to furniture components
 * - Handles missing components gracefully
 */

import { getFurnitureComponent } from '../../lib/furnitureRegistry';

export default function FurnitureRenderer({ furniture = [], buildingConfig }) {
  if (!furniture || furniture.length === 0) {
    return null;
  }

  return (
    <group>
      {furniture.map((item, index) => {
        if (!item.active) {
          return null; // Skip inactive furniture
        }

        const Component = getFurnitureComponent(item.furniture_type);

        if (!Component) {
          console.warn(`Furniture type "${item.furniture_type}" not found. Rendering placeholder.`);

          // Render a simple placeholder box
          return (
            <mesh
              key={item.id || `furniture-${index}`}
              position={[
                item.position_x || 0,
                item.position_y || 0,
                item.position_z || 0
              ]}
              rotation={[
                item.rotation_x || 0,
                item.rotation_y || 0,
                item.rotation_z || 0
              ]}
            >
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial color="#FF00FF" opacity={0.5} transparent />
            </mesh>
          );
        }

        // Extract properties from database config
        const props = {
          position: [
            item.position_x || 0,
            item.position_y || 0,
            item.position_z || 0
          ],
          rotation: [
            item.rotation_x || 0,
            item.rotation_y || 0,
            item.rotation_z || 0
          ],
          scale: item.scale_x || item.scale_y || item.scale_z
            ? [item.scale_x || 1, item.scale_y || 1, item.scale_z || 1]
            : undefined,
          color: item.color,
          // Merge database properties with component-specific props
          ...(item.properties || {})
        };

        // Map common properties to component-specific prop names
        const mappedProps = mapPropsToComponent(item.furniture_type, props);

        return (
          <Component
            key={item.id || `furniture-${index}`}
            {...mappedProps}
          />
        );
      })}
    </group>
  );
}

/**
 * Maps generic furniture properties to component-specific prop names
 * Different components may expect different prop names for the same concept
 */
function mapPropsToComponent(furnitureType, props) {
  const mapped = { ...props };

  switch (furnitureType.toLowerCase()) {
    case 'reception_desk':
    case 'desk':
      // ReceptionDesk expects 'size' prop
      if (mapped.properties?.size) {
        mapped.size = mapped.properties.size;
      }
      break;

    case 'office_chair':
      // OfficeChair expects 'size' as single number
      if (mapped.properties?.size) {
        mapped.size = mapped.properties.size;
      }
      break;

    case 'checkout_counter':
      // CheckoutCounter uses direct properties
      // No special mapping needed
      break;

    case 'perfume_shelf':
    case 'shelf':
    case 'display_shelf':
      // PerfumeShelf expects 'slots' and 'levels'
      if (mapped.properties?.slots) {
        mapped.slotCount = mapped.properties.slots;
      }
      if (mapped.properties?.levels) {
        mapped.shelfLevels = mapped.properties.levels;
      }
      break;

    case 'led_tv':
    case 'tv':
    case 'monitor':
      // LEDTV expects 'size', 'content', 'isOn'
      if (mapped.properties?.size) {
        mapped.size = mapped.properties.size;
      }
      if (mapped.properties?.content) {
        mapped.content = mapped.properties.content;
      }
      if (mapped.properties?.isOn !== undefined) {
        mapped.isOn = mapped.properties.isOn;
      }
      break;

    case 'whiteboard':
      // Whiteboard expects 'size' and 'content'
      if (mapped.properties?.size) {
        mapped.size = mapped.properties.size;
      }
      if (mapped.properties?.content) {
        mapped.content = mapped.properties.content;
      }
      break;

    case 'cork_board':
    case 'bulletin_board':
      // CorkBoard expects 'size'
      if (mapped.properties?.size) {
        mapped.size = mapped.properties.size;
      }
      break;

    case 'plant_pot':
    case 'plant':
      // PlantPot expects 'size' and 'plantType'
      if (mapped.properties?.size) {
        mapped.size = mapped.properties.size;
      }
      if (mapped.properties?.plantType) {
        mapped.plantType = mapped.properties.plantType;
      }
      break;

    case 'pharmacy_counter':
      // PharmacyCounter expects 'color', 'scale', 'modelUrl', 'useModel'
      // Already mapped: position, rotation, scale, color
      if (mapped.properties?.modelUrl) {
        mapped.modelUrl = mapped.properties.modelUrl;
        mapped.useModel = true;
      }
      break;

    case 'pharmacy_shelf':
      // PharmacyShelf expects 'color', 'scale', 'shelfLevels', 'modelUrl', 'useModel'
      if (mapped.properties?.shelfLevels) {
        mapped.shelfLevels = mapped.properties.shelfLevels;
      }
      if (mapped.properties?.modelUrl) {
        mapped.modelUrl = mapped.properties.modelUrl;
        mapped.useModel = true;
      }
      break;

    default:
      // For unknown types, pass props as-is
      break;
  }

  return mapped;
}

/**
 * Helper function to calculate furniture collision bounds
 * Used by collision detection system
 */
export function getFurnitureCollisionBounds(furniture) {
  return furniture
    .filter(item => item.active && item.has_collision !== false)
    .map(item => ({
      id: item.id,
      type: item.furniture_type,
      position: [item.position_x || 0, item.position_y || 0, item.position_z || 0],
      collisionType: item.collision_type || 'box',
      radius: item.collision_radius || 0.5,
      // Approximate bounds based on furniture type
      bounds: estimateFurnitureBounds(item)
    }));
}

/**
 * Estimates furniture bounds for collision detection
 * TODO: These should ideally come from the database or component metadata
 */
function estimateFurnitureBounds(item) {
  const defaultBounds = { width: 1, depth: 1, height: 1 };

  // Furniture-specific bound estimates
  const boundsMap = {
    'reception_desk': { width: 4, depth: 1.5, height: 1.2 },
    'office_chair': { width: 0.8, depth: 0.8, height: 1.2 },
    'checkout_counter': { width: 2.5, depth: 1.2, height: 1.1 },
    'perfume_shelf': { width: 3, depth: 0.6, height: 2 },
    'pharmacy_counter': { width: 3, depth: 1, height: 1.1 },
    'pharmacy_shelf': { width: 2.5, depth: 0.5, height: 2.2 },
    'led_tv': { width: 3, depth: 0.2, height: 1.7 },
    'whiteboard': { width: 2.8, depth: 0.1, height: 1.6 },
    'cork_board': { width: 1.8, depth: 0.1, height: 1.2 },
    'plant_pot': { width: 0.5, depth: 0.5, height: 1 }
  };

  const bounds = boundsMap[item.furniture_type] || defaultBounds;

  // Apply scale if specified
  if (item.scale_x || item.scale_y || item.scale_z) {
    return {
      width: bounds.width * (item.scale_x || 1),
      depth: bounds.depth * (item.scale_z || 1),
      height: bounds.height * (item.scale_y || 1)
    };
  }

  return bounds;
}
