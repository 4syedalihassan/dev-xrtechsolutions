/**
 * DynamicBuilding Component
 * Universal building renderer that creates buildings from database configuration
 *
 * Features:
 * - Dynamic walls, floors, and ceilings
 * - Configurable doors (hinged, sliding, automatic)
 * - Dynamic furniture placement
 * - Collision detection
 * - Digital signage integration
 */

import { useRef } from 'react';
import * as THREE from 'three';
import BrickWall from './BrickWall';
import GlassCeiling from './GlassCeiling';
import GlassDoor from './GlassDoor';
import PerfumeShopDoors from './PerfumeShopDoors';
import DigitalSignage from './DigitalSignage';
import FurnitureRenderer from './FurnitureRenderer';

export default function DynamicBuilding({
  building,
  furniture = [],
  doorOpen = false,
  setDoorOpen,
  isOperational = true,
  timeData
}) {
  const buildingRef = useRef();

  if (!building) {
    console.warn('DynamicBuilding: No building configuration provided');
    return null;
  }

  const {
    width = 10,
    depth = 10,
    height = 5,
    position_x = 0,
    position_y = 0,
    position_z = 0,
    rotation_y = 0,
    floor_color = '#666666',
    wall_color = '#888888',
    ceiling_color = '#F5F5DC',
    ceiling_type = 'glass',
    door_type = 'hinged',
    door_position = 'north',
    door_width = 2.5,
    door_height,
    door_offset_x = 0,
    door_offset_z = 0,
    signage_text,
    signage_width,
    signage_height,
    signage_color = '#000000',
    signage_text_color = '#FFFFFF'
  } = building;

  // Calculate door position based on wall side
  const getDoorPosition = () => {
    const baseHeight = door_height || (height * 0.8);

    switch (door_position) {
      case 'north':
        return [door_offset_x, 0, -depth / 2 + door_offset_z];
      case 'south':
        return [door_offset_x, 0, depth / 2 + door_offset_z];
      case 'east':
        return [width / 2 + door_offset_z, 0, door_offset_x];
      case 'west':
        return [-width / 2 + door_offset_z, 0, door_offset_x];
      default:
        return [door_offset_x, 0, -depth / 2 + door_offset_z];
    }
  };

  const doorPosition = getDoorPosition();
  const doorRotation = door_position === 'east' || door_position === 'west' ? Math.PI / 2 : 0;

  // Calculate wall segments for door opening
  const getWallSegments = (side) => {
    if (side === door_position) {
      // This wall has the door
      if (side === 'north' || side === 'south') {
        const leftWidth = (width - door_width) / 2 - Math.abs(door_offset_x);
        const rightWidth = (width - door_width) / 2 + Math.abs(door_offset_x);
        const zPos = side === 'north' ? -depth / 2 : depth / 2;

        return [
          { width: leftWidth, position: [-(width/2 + leftWidth/2) / 2, height / 2, zPos] },
          { width: rightWidth, position: [(width/2 + rightWidth/2) / 2, height / 2, zPos] }
        ];
      } else {
        const leftDepth = (depth - door_width) / 2 - Math.abs(door_offset_x);
        const rightDepth = (depth - door_width) / 2 + Math.abs(door_offset_x);
        const xPos = side === 'east' ? width / 2 : -width / 2;

        return [
          { width: leftDepth, position: [xPos, height / 2, -(depth/2 + leftDepth/2) / 2] },
          { width: rightDepth, position: [xPos, height / 2, (depth/2 + rightDepth/2) / 2] }
        ];
      }
    }

    // Full wall (no door)
    return null;
  };

  const northWallSegments = getWallSegments('north');
  const southWallSegments = getWallSegments('south');
  const eastWallSegments = getWallSegments('east');
  const westWallSegments = getWallSegments('west');

  return (
    <group
      ref={buildingRef}
      position={[position_x, position_y, position_z]}
      rotation={[0, rotation_y, 0]}
    >
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[width, depth]} />
        <meshBasicMaterial color={floor_color} />
      </mesh>

      {/* Walls */}
      {/* North Wall */}
      {northWallSegments ? (
        northWallSegments.map((segment, index) => (
          <BrickWall
            key={`north-${index}`}
            width={segment.width}
            height={height}
            thickness={0.3}
            position={segment.position}
            color={wall_color}
          />
        ))
      ) : (
        <BrickWall
          width={door_position === 'north' || door_position === 'south' ? depth : width}
          height={height}
          thickness={0.3}
          position={[0, height / 2, -depth / 2]}
          rotation={door_position === 'north' || door_position === 'south' ? [0, 0, 0] : [0, Math.PI / 2, 0]}
          color={wall_color}
        />
      )}

      {/* South Wall */}
      {southWallSegments ? (
        southWallSegments.map((segment, index) => (
          <BrickWall
            key={`south-${index}`}
            width={segment.width}
            height={height}
            thickness={0.3}
            position={segment.position}
            color={wall_color}
          />
        ))
      ) : (
        <BrickWall
          width={width}
          height={height}
          thickness={0.3}
          position={[0, height / 2, depth / 2]}
          color={wall_color}
        />
      )}

      {/* East Wall */}
      {eastWallSegments ? (
        eastWallSegments.map((segment, index) => (
          <BrickWall
            key={`east-${index}`}
            width={segment.width}
            height={height}
            thickness={0.3}
            position={segment.position}
            rotation={[0, Math.PI / 2, 0]}
            color={wall_color}
          />
        ))
      ) : (
        <BrickWall
          width={depth}
          height={height}
          thickness={0.3}
          position={[width / 2, height / 2, 0]}
          rotation={[0, Math.PI / 2, 0]}
          color={wall_color}
        />
      )}

      {/* West Wall */}
      {westWallSegments ? (
        westWallSegments.map((segment, index) => (
          <BrickWall
            key={`west-${index}`}
            width={segment.width}
            height={height}
            thickness={0.3}
            position={segment.position}
            rotation={[0, Math.PI / 2, 0]}
            color={wall_color}
          />
        ))
      ) : (
        <BrickWall
          width={depth}
          height={height}
          thickness={0.3}
          position={[-width / 2, height / 2, 0]}
          rotation={[0, Math.PI / 2, 0]}
          color={wall_color}
        />
      )}

      {/* Door */}
      {door_type !== 'none' && (
        <>
          {door_type === 'double_sliding' ? (
            <PerfumeShopDoors
              position={doorPosition}
              rotation={[0, doorRotation, 0]}
              doorWidth={door_width}
              doorHeight={door_height || (height * 0.8)}
              isOpen={doorOpen && isOperational}
              onToggle={() => setDoorOpen && setDoorOpen(!doorOpen)}
            />
          ) : door_type === 'sliding' ? (
            <PerfumeShopDoors
              position={doorPosition}
              rotation={[0, doorRotation, 0]}
              doorWidth={door_width}
              doorHeight={door_height || (height * 0.8)}
              isOpen={doorOpen && isOperational}
              onToggle={() => setDoorOpen && setDoorOpen(!doorOpen)}
              singleDoor={true}
            />
          ) : (
            <GlassDoor
              position={doorPosition}
              rotation={[0, doorRotation, 0]}
              doorWidth={door_width}
              doorHeight={door_height || (height * 0.8)}
              isOpen={doorOpen && isOperational}
              onToggle={() => setDoorOpen && setDoorOpen(!doorOpen)}
            />
          )}
        </>
      )}

      {/* Ceiling */}
      {ceiling_type === 'glass' && (
        <GlassCeiling size={Math.max(width, depth)} height={height} blockSize={2} />
      )}
      {ceiling_type === 'solid' && (
        <mesh position={[0, height, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[width, depth]} />
          <meshBasicMaterial color={ceiling_color || '#FFFFFF'} />
        </mesh>
      )}
      {ceiling_type === 'transparent' && (
        <mesh position={[0, height, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[width, depth]} />
          <meshBasicMaterial color={ceiling_color || '#FFFFFF'} transparent opacity={0.3} />
        </mesh>
      )}

      {/* Signage */}
      {signage_text && signage_width && signage_height && (
        <DigitalSignage
          position={[0, height + (signage_height / 2) + 0.5, doorPosition[2] - 0.05]}
          buildingId={building.slug || building.id}
          defaultName={signage_text}
          width={signage_width}
          height={signage_height}
          backgroundColor={signage_color}
          textColor={signage_text_color}
        />
      )}

      {/* Corner Pillars */}
      {['nw', 'ne', 'sw', 'se'].map((corner) => {
        const xPos = corner.includes('e') ? width / 2 - 0.15 : -width / 2 + 0.15;
        const zPos = corner.includes('n') ? -depth / 2 + 0.15 : depth / 2 - 0.15;

        return (
          <mesh key={corner} position={[xPos, height / 2, zPos]} castShadow>
            <boxGeometry args={[0.3, height, 0.3]} />
            <meshStandardMaterial color="#777777" roughness={0.9} metalness={0.1} />
          </mesh>
        );
      })}

      {/* Dynamic Furniture */}
      {furniture && furniture.length > 0 && (
        <FurnitureRenderer furniture={furniture} buildingConfig={building} />
      )}
    </group>
  );
}
