import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import GlassCeiling from './GlassCeiling';
import BrickWall from './BrickWall';
import LEDTV from './LEDTV';
import Whiteboard from './Whiteboard';
import CorkBoard from './CorkBoard';
import PlantPot from './PlantPot';
import GlassDoor from './GlassDoor';
import ReceptionDesk from './ReceptionDesk';
import OfficeChair from './OfficeChair';
import PharmacyKiosk from './PharmacyKiosk';
import PharmacyShelf from './PharmacyShelf';
import PerfumeShopPlatform from './PerfumeShopPlatform';
import DigitalSignage from './DigitalSignage';
import SessionEnvironment from './SessionEnvironment';
import RoadGround from './RoadGround';
import SnowGround from './SnowGround';
import BuildingBorders from './BuildingBorders';

// Building slug constants - must match database values
const BUILDING_SLUGS = {
  HEALTHCARE_CENTER: 'central-healthcare-complex',
  PERFUME_SHOP: 'luxury-perfume-boutique'
};

export default function Platform({ size = 20, wallHeight = 5, doorOpen, setDoorOpen, perfumeShopDoorOpen, setPerfumeShopDoorOpen, playerPosition = [0, 2.0, 5], timeData, onProductClick }) {
  const platformRef = useRef();

  // Auto-detect winter season (Nov 15 - Jan 15)
  const isWinterSeason = () => {
    const now = new Date();
    const month = now.getMonth(); // 0-11
    const day = now.getDate(); // 1-31
    return (
      (month === 10 && day >= 15) || // Nov 15-30
      month === 11 ||                 // All of December
      (month === 0 && day <= 15)      // Jan 1-15
    );
  };

  const showSnow = false; // Disabled - was causing white ground appearance
  
  // Building operational status
  const [buildingStatus, setBuildingStatus] = useState({
    healthcare_center: { isOperational: true, status: 'OPEN' },
    perfume_shop: { isOperational: true, status: 'OPEN' }
  });

  // Fetch building status from API (optional - fails silently if buildings not in DB)
  useEffect(() => {
    const fetchBuildingStatus = async () => {
      try {
        const [healthcareRes, perfumeRes] = await Promise.all([
          fetch(`/api/buildings/${BUILDING_SLUGS.HEALTHCARE_CENTER}`),
          fetch(`/api/buildings/${BUILDING_SLUGS.PERFUME_SHOP}`)
        ]);
        
        // Only update if both requests succeed
        if (healthcareRes.ok && perfumeRes.ok) {
          const healthcareData = await healthcareRes.json();
          const perfumeData = await perfumeRes.json();
          
          // Map API response (snake_case) to expected format (camelCase)
          const healthcareBuilding = healthcareData.building;
          const perfumeBuilding = perfumeData.building;
          
          setBuildingStatus({
            healthcare_center: {
              isOperational: healthcareBuilding?.is_operational !== false,
              status: healthcareBuilding?.status || 'OPEN'
            },
            perfume_shop: {
              isOperational: perfumeBuilding?.is_operational !== false,
              status: perfumeBuilding?.status || 'OPEN'
            }
          });
        }
        // Silently ignore 404s - buildings may not exist in database
      } catch (error) {
        // Silently fail - use default status
      }
    };

    fetchBuildingStatus();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchBuildingStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handle C key for smart door control based on player position
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key.toLowerCase() === 'c') {
        // Calculate distances to both doors
        const healthcareDoorPos = [0, 0, -size / 2]; // Healthcare door position
        const perfumeShopDoorPos = [size / 2 + 6 + 0.3, 0, -size / 2 + 4]; // Perfume shop door position
        
        const distToHealthcare = Math.sqrt(
          Math.pow(playerPosition[0] - healthcareDoorPos[0], 2) + 
          Math.pow(playerPosition[2] - healthcareDoorPos[2], 2)
        );
        
        const distToPerfumeShop = Math.sqrt(
          Math.pow(playerPosition[0] - perfumeShopDoorPos[0], 2) + 
          Math.pow(playerPosition[2] - perfumeShopDoorPos[2], 2)
        );
        
        // Toggle the door that's closest to the player, but only if building is operational
        if (distToHealthcare <= distToPerfumeShop) {
          // Healthcare center door
          if (buildingStatus.healthcare_center.isOperational) {
            setDoorOpen(prev => !prev);
          }
        } else {
          // Perfume shop door  
          if (buildingStatus.perfume_shop.isOperational) {
            setPerfumeShopDoorOpen(prev => !prev);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [setDoorOpen, setPerfumeShopDoorOpen, playerPosition, buildingStatus]);
  
  return (
    <group ref={platformRef}>
      {/* Road Ground Component - covers entire base except building areas */}
      <RoadGround
        buildingSize={size}
        perfumeShopPosition={[size / 2 + 6 + 0.3, 0, -size / 2 + 4]}
        perfumeShopSize={{ width: 12, depth: 8 }}
      />

      {/* Winter Snow Ground - only shown Nov 15 to Jan 15 */}
      {showSnow && (
        <SnowGround
          size={[150, 150]}
          position={[0, 0.02, 0]}
        />
      )}

      {/* Building Borders - outline both buildings */}
      <BuildingBorders 
        healthcareCenterSize={size}
        perfumeShopPosition={[size / 2 + 6 + 0.3, 0, -size / 2 + 4]}
        perfumeShopSize={{ width: 12, depth: 8 }}
        wallHeight={wallHeight}
      />

      {/* Inside Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[size, size]} />
        <meshBasicMaterial 
          color="#666666"  // Darker grey
        />
      </mesh>

      {/* Complete Outside Floor - Surrounds both buildings on all 4 sides */}
      {/* Large unified outside floor covering entire compound */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[8, 0, -2]} receiveShadow>
        <planeGeometry args={[40, 30]} />
        <meshBasicMaterial 
          color="#666666"  // Same color as inside floors
        />
      </mesh>

      {/* Brick Walls - Realistic PBR textures */}
      {/* North Wall with Door Space - Left Section */}
      <BrickWall
        width={8.5}
        height={wallHeight}
        thickness={0.3}
        position={[-5.75, wallHeight / 2, -size / 2]}
        usePBR={true}
      />

      {/* North Wall with Door Space - Right Section */}
      <BrickWall
        width={8.5}
        height={wallHeight}
        thickness={0.3}
        position={[5.75, wallHeight / 2, -size / 2]}
        usePBR={true}
      />

      {/* Glass Door */}
      <GlassDoor 
        position={[0, 0, -size / 2]}
        doorWidth={2.5}
        doorHeight={wallHeight * 0.8}
        isOpen={doorOpen}
        onToggle={() => setDoorOpen(!doorOpen)}
      />

      {/* Door Frame Pillars */}
      {/* Left Door Pillar */}
      <mesh position={[-1.4, wallHeight / 2, -size / 2]} castShadow>
        <boxGeometry args={[0.2, wallHeight, 0.4]} />
        <meshBasicMaterial color="#777777" />
      </mesh>
      
      {/* Right Door Pillar */}
      <mesh position={[1.4, wallHeight / 2, -size / 2]} castShadow>
        <boxGeometry args={[0.2, wallHeight, 0.4]} />
        <meshBasicMaterial color="#777777" />
      </mesh>

      {/* Door Header Beam */}
      <mesh position={[0, wallHeight * 0.85, -size / 2]} castShadow>
        <boxGeometry args={[3, 0.3, 0.4]} />
        <meshBasicMaterial color="#777777" />
      </mesh>

      {/* South Wall */}
      <BrickWall
        width={size}
        height={wallHeight}
        thickness={0.3}
        position={[0, wallHeight / 2, size / 2]}
        usePBR={true}
      />

      {/* East Wall (Right wall - will have TVs) */}
      <BrickWall
        width={size}
        height={wallHeight}
        thickness={0.3}
        position={[size / 2, wallHeight / 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
        usePBR={true}
      />

      {/* West Wall (Left wall) - WHITE OUTSIDE */}
      <BrickWall
        width={size}
        height={wallHeight}
        thickness={0.3}
        position={[-size / 2, wallHeight / 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
        flipped={true}
        usePBR={true}
      />

      {/* LED TVs on Right Wall (East wall) */}
      <LEDTV 
        position={[size / 2 - 0.2, wallHeight / 2, -2]} 
        rotation={[0, -Math.PI / 2, 0]}
        size={[3, 1.7]}
        content="TB Symptoms & Detection"
        isOn={true}
      />
      
      <LEDTV 
        position={[size / 2 - 0.2, wallHeight / 2, 2]} 
        rotation={[0, -Math.PI / 2, 0]}
        size={[3, 1.7]}
        content="TB Prevention Methods"
        isOn={true}
      />

      {/* Medical Whiteboards */}
      {/* South Wall - Prevention Guidelines */}
      <Whiteboard 
        position={[0, wallHeight * 0.6, size / 2 - 0.2]}
        rotation={[0, Math.PI, 0]}
        size={[2.8, 1.6]}
        content="Prevention Guide"
      />

      {/* Cork Boards for Notices */}
      {/* West Wall - Left side */}
      <CorkBoard 
        position={[-size / 2 + 0.2, wallHeight * 0.6, -3]}
        rotation={[0, Math.PI / 2, 0]}
        size={[1.8, 1.2]}
      />
      
      {/* West Wall - Center */}
      <CorkBoard 
        position={[-size / 2 + 0.2, wallHeight * 0.6, 3]}
        rotation={[0, Math.PI / 2, 0]}
        size={[1.6, 1.1]}
      />

      {/* Reception Desk - facing the LED TV wall (East wall) */}
      <ReceptionDesk 
        position={[size / 2 - 4, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
        size={[4, 1.2, 1.5]}
      />

      {/* Office Chair - facing the desk */}
      <OfficeChair
        position={[size / 2 - 2.2, 0, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        size={1}
      />

      {/* Pharmacy Kiosk - facing reception desk */}
      <PharmacyKiosk
        position={[-size / 2 + 4, 0, 0]}
        rotation={[0, Math.PI / 2, 0]}
        size={[3, 1.2, 1.2]}
      />

      {/* Pharmacy Medicine Shelf - on wall behind pharmacy kiosk */}
      <PharmacyShelf
        position={[-size / 2 + 0.25, wallHeight * 0.5, 0]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[0.8, 0.8, 0.6]}
        shelfLevels={4}
      />

      {/* Plant Pots in all 4 corners for clinic atmosphere */}
      <PlantPot 
        position={[size / 2 - 1.2, 0, size / 2 - 1.2]}
        size={1.2}
        plantType="leafy"
      />
      
      <PlantPot 
        position={[-size / 2 + 1.2, 0, size / 2 - 1.2]}
        size={1}
        plantType="tall"
      />
      
      <PlantPot 
        position={[size / 2 - 1.2, 0, -size / 2 + 1.2]}
        size={1.1}
        plantType="bushy"
      />
      
      <PlantPot 
        position={[-size / 2 + 1.2, 0, -size / 2 + 1.2]}
        size={0.9}
        plantType="leafy"
      />

      {/* Minecraft-style Glass Ceiling */}
      <GlassCeiling size={size} height={wallHeight} blockSize={2} />

      {/* Perfume Shop - Adjacent to Medical Clinic with gap and aligned walls */}
      <PerfumeShopPlatform
        size={{ width: 12, depth: 8 }}
        wallHeight={wallHeight}
        position={[size / 2 + 6 + 0.3, 0, -size / 2 + 4]} // Moved forward and with 0.3m gap
        doorOpen={perfumeShopDoorOpen}
        setDoorOpen={setPerfumeShopDoorOpen}
        onProductClick={onProductClick}
        buildingId="luxury-perfume-boutique"
      />

      {/* Healthcare Center Signage */}
      <DigitalSignage
        position={[0, wallHeight + 3, -size / 2 - 0.05]}
        rotation={[0, Math.PI, 0]}
        buildingId="central-healthcare-complex"
        defaultName="HEALTHCARE CENTER"
        width={12}
        height={1.8}
      />


      {/* Session Environment (transforms space during active sessions) */}
      <SessionEnvironment timeData={timeData} />

      {/* Corner pillars for structural support */}
      <mesh position={[size / 2 - 0.15, wallHeight / 2, size / 2 - 0.15]} castShadow>
        <boxGeometry args={[0.3, wallHeight, 0.3]} />
        <meshStandardMaterial 
          color="#777777" 
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
      
      <mesh position={[-size / 2 + 0.15, wallHeight / 2, size / 2 - 0.15]} castShadow>
        <boxGeometry args={[0.3, wallHeight, 0.3]} />
        <meshStandardMaterial 
          color="#777777" 
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
      
      <mesh position={[size / 2 - 0.15, wallHeight / 2, -size / 2 + 0.15]} castShadow>
        <boxGeometry args={[0.3, wallHeight, 0.3]} />
        <meshStandardMaterial 
          color="#777777" 
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
      
      <mesh position={[-size / 2 + 0.15, wallHeight / 2, -size / 2 + 0.15]} castShadow>
        <boxGeometry args={[0.3, wallHeight, 0.3]} />
        <meshStandardMaterial 
          color="#777777" 
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
}