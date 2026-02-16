/**
 * BuildingManager Component
 * Orchestrates multiple buildings in the WebXR environment
 *
 * Features:
 * - Loads all active buildings from database
 * - Manages building states (doors, operational status)
 * - Handles player interactions with buildings
 * - Smart door control based on proximity
 * - Dynamic ground/floor rendering
 */

import { useState, useEffect } from 'react';
import * as THREE from 'three';
import DynamicBuilding from './DynamicBuilding';
import RoadGround from './RoadGround';
import BuildingBorders from './BuildingBorders';

export default function BuildingManager({ playerPosition = [0, 2.0, 5], timeData }) {
  const [buildings, setBuildings] = useState([]);
  const [buildingStates, setBuildingStates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load buildings from database
  useEffect(() => {
    loadBuildings();

    // Poll for updates every 30 seconds
    const interval = setInterval(loadBuildings, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadBuildings() {
    try {
      const response = await fetch('/api/buildings');

      if (!response.ok) {
        throw new Error(`Failed to load buildings: ${response.statusText}`);
      }

      const data = await response.json();

      // Transform data into usable format
      const buildingsData = data.buildings || [];

      setBuildings(buildingsData);

      // Initialize building states
      const states = {};
      buildingsData.forEach(building => {
        states[building.id] = {
          doorOpen: false,
          isOperational: building.is_operational !== false,
          status: building.status || 'OPEN'
        };
      });
      setBuildingStates(states);

      setLoading(false);
    } catch (err) {
      console.error('Failed to load buildings:', err);
      setError(err.message);
      setLoading(false);
    }
  }

  // Handle C key for smart door control
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key.toLowerCase() === 'c') {
        // Find nearest building with a door
        let nearestBuilding = null;
        let nearestDistance = Infinity;

        buildings.forEach(building => {
          if (building.door_type === 'none') return;

          const doorPosition = calculateDoorWorldPosition(building);
          const distance = Math.sqrt(
            Math.pow(playerPosition[0] - doorPosition[0], 2) +
            Math.pow(playerPosition[2] - doorPosition[2], 2)
          );

          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestBuilding = building;
          }
        });

        // Toggle door if building is operational and player is close enough
        if (nearestBuilding && nearestDistance < 5) {
          const buildingState = buildingStates[nearestBuilding.id];

          if (buildingState?.isOperational) {
            setBuildingStates(prev => ({
              ...prev,
              [nearestBuilding.id]: {
                ...prev[nearestBuilding.id],
                doorOpen: !prev[nearestBuilding.id].doorOpen
              }
            }));
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [buildings, buildingStates, playerPosition]);

  // Calculate door world position for a building
  function calculateDoorWorldPosition(building) {
    const {
      position_x = 0,
      position_z = 0,
      door_position = 'north',
      door_offset_x = 0,
      door_offset_z = 0,
      width = 10,
      depth = 10
    } = building;

    let doorX = position_x;
    let doorZ = position_z;

    switch (door_position) {
      case 'north':
        doorX += door_offset_x;
        doorZ += -depth / 2 + door_offset_z;
        break;
      case 'south':
        doorX += door_offset_x;
        doorZ += depth / 2 + door_offset_z;
        break;
      case 'east':
        doorX += width / 2 + door_offset_z;
        doorZ += door_offset_x;
        break;
      case 'west':
        doorX += -width / 2 + door_offset_z;
        doorZ += door_offset_x;
        break;
    }

    return [doorX, 0, doorZ];
  }

  // Toggle door for a specific building
  function toggleBuildingDoor(buildingId) {
    setBuildingStates(prev => ({
      ...prev,
      [buildingId]: {
        ...prev[buildingId],
        doorOpen: !prev[buildingId]?.doorOpen
      }
    }));
  }

  // Calculate ground area to cover all buildings
  function calculateGroundBounds() {
    if (buildings.length === 0) {
      return { width: 40, depth: 30, centerX: 0, centerZ: 0 };
    }

    let minX = Infinity, maxX = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    buildings.forEach(building => {
      const halfWidth = (building.width || 10) / 2;
      const halfDepth = (building.depth || 10) / 2;
      const x = building.position_x || 0;
      const z = building.position_z || 0;

      minX = Math.min(minX, x - halfWidth);
      maxX = Math.max(maxX, x + halfWidth);
      minZ = Math.min(minZ, z - halfDepth);
      maxZ = Math.max(maxZ, z + halfDepth);
    });

    // Add padding
    const padding = 10;
    minX -= padding;
    maxX += padding;
    minZ -= padding;
    maxZ += padding;

    return {
      width: maxX - minX,
      depth: maxZ - minZ,
      centerX: (minX + maxX) / 2,
      centerZ: (minZ + maxZ) / 2
    };
  }

  if (loading) {
    return (
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[2, 2, 2]} />
        <meshBasicMaterial color="#007B83" transparent opacity={0.6} />
      </mesh>
    );
  }

  if (error) {
    console.error('BuildingManager error:', error);
    return null;
  }

  if (buildings.length === 0) {
    console.warn('No buildings found. Using fallback.');
    return null;
  }

  const groundBounds = calculateGroundBounds();

  return (
    <group>
      {/* Dynamic Ground/Floor */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[groundBounds.centerX, -0.01, groundBounds.centerZ]}
        receiveShadow
      >
        <planeGeometry args={[groundBounds.width, groundBounds.depth]} />
        <meshBasicMaterial color="#666666" />
      </mesh>

      {/* Render all buildings */}
      {buildings.map((building) => {
        const state = buildingStates[building.id] || {};

        return (
          <DynamicBuilding
            key={building.id}
            building={building}
            furniture={building.furniture || []}
            doorOpen={state.doorOpen || false}
            setDoorOpen={(open) => {
              setBuildingStates(prev => ({
                ...prev,
                [building.id]: { ...prev[building.id], doorOpen: open }
              }));
            }}
            isOperational={state.isOperational}
            timeData={timeData}
          />
        );
      })}

      {/* Building Borders (optional decorative element) */}
      {buildings.map((building) => (
        <group
          key={`border-${building.id}`}
          position={[building.position_x || 0, 0, building.position_z || 0]}
        >
          {/* Thin border lines around each building */}
          <lineSegments>
            <edgesGeometry
              attach="geometry"
              args={[
                new THREE.BoxGeometry(
                  building.width || 10,
                  0.1,
                  building.depth || 10
                )
              ]}
            />
            <lineBasicMaterial attach="material" color="#444444" />
          </lineSegments>
        </group>
      ))}
    </group>
  );
}
