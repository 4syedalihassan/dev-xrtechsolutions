import { useRef } from 'react';

export default function BuildingBorders({ 
  healthcareCenterSize = 20,
  perfumeShopPosition = [26.3, 0, -6],
  perfumeShopSize = { width: 12, depth: 8 },
  wallHeight = 5
}) {
  
  const borderWidth = 0.3;
  const borderHeight = 0.2;
  const pillarSize = 0.4;
  const pillarHeight = wallHeight + 1; // Extends above wall
  
  return (
    <group>
      {/* Healthcare Center Borders */}
      {/* North border */}
      <mesh position={[0, borderHeight/2, -healthcareCenterSize/2 - borderWidth/2]}>
        <boxGeometry args={[healthcareCenterSize + borderWidth*2, borderHeight, borderWidth]} />
        <meshBasicMaterial color="#444444" />
      </mesh>
      
      {/* South border */}
      <mesh position={[0, borderHeight/2, healthcareCenterSize/2 + borderWidth/2]}>
        <boxGeometry args={[healthcareCenterSize + borderWidth*2, borderHeight, borderWidth]} />
        <meshBasicMaterial color="#444444" />
      </mesh>
      
      {/* East border */}
      <mesh position={[healthcareCenterSize/2 + borderWidth/2, borderHeight/2, 0]}>
        <boxGeometry args={[borderWidth, borderHeight, healthcareCenterSize]} />
        <meshBasicMaterial color="#444444" />
      </mesh>
      
      {/* West border */}
      <mesh position={[-healthcareCenterSize/2 - borderWidth/2, borderHeight/2, 0]}>
        <boxGeometry args={[borderWidth, borderHeight, healthcareCenterSize]} />
        <meshBasicMaterial color="#444444" />
      </mesh>

      {/* Perfume Shop Borders */}
      {/* North border */}
      <mesh position={[
        perfumeShopPosition[0], 
        borderHeight/2, 
        perfumeShopPosition[2] - perfumeShopSize.depth/2 - borderWidth/2
      ]}>
        <boxGeometry args={[perfumeShopSize.width + borderWidth*2, borderHeight, borderWidth]} />
        <meshBasicMaterial color="#444444" />
      </mesh>
      
      {/* South border */}
      <mesh position={[
        perfumeShopPosition[0], 
        borderHeight/2, 
        perfumeShopPosition[2] + perfumeShopSize.depth/2 + borderWidth/2
      ]}>
        <boxGeometry args={[perfumeShopSize.width + borderWidth*2, borderHeight, borderWidth]} />
        <meshBasicMaterial color="#444444" />
      </mesh>
      
      {/* East border */}
      <mesh position={[
        perfumeShopPosition[0] + perfumeShopSize.width/2 + borderWidth/2, 
        borderHeight/2, 
        perfumeShopPosition[2]
      ]}>
        <boxGeometry args={[borderWidth, borderHeight, perfumeShopSize.depth]} />
        <meshBasicMaterial color="#444444" />
      </mesh>
      
      {/* West border */}
      <mesh position={[
        perfumeShopPosition[0] - perfumeShopSize.width/2 - borderWidth/2, 
        borderHeight/2, 
        perfumeShopPosition[2]
      ]}>
        <boxGeometry args={[borderWidth, borderHeight, perfumeShopSize.depth]} />
        <meshBasicMaterial color="#444444" />
      </mesh>

      {/* Healthcare Center Corner Pillars */}
      {/* Northeast pillar */}
      <mesh position={[
        healthcareCenterSize/2 + borderWidth/2, 
        pillarHeight/2, 
        -healthcareCenterSize/2 - borderWidth/2
      ]}>
        <boxGeometry args={[pillarSize, pillarHeight, pillarSize]} />
        <meshStandardMaterial color="#333333" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Northwest pillar */}
      <mesh position={[
        -healthcareCenterSize/2 - borderWidth/2, 
        pillarHeight/2, 
        -healthcareCenterSize/2 - borderWidth/2
      ]}>
        <boxGeometry args={[pillarSize, pillarHeight, pillarSize]} />
        <meshStandardMaterial color="#333333" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Southeast pillar */}
      <mesh position={[
        healthcareCenterSize/2 + borderWidth/2, 
        pillarHeight/2, 
        healthcareCenterSize/2 + borderWidth/2
      ]}>
        <boxGeometry args={[pillarSize, pillarHeight, pillarSize]} />
        <meshStandardMaterial color="#333333" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Southwest pillar */}
      <mesh position={[
        -healthcareCenterSize/2 - borderWidth/2, 
        pillarHeight/2, 
        healthcareCenterSize/2 + borderWidth/2
      ]}>
        <boxGeometry args={[pillarSize, pillarHeight, pillarSize]} />
        <meshStandardMaterial color="#333333" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Perfume Shop Corner Pillars */}
      {/* Northeast pillar */}
      <mesh position={[
        perfumeShopPosition[0] + perfumeShopSize.width/2 + borderWidth/2, 
        pillarHeight/2, 
        perfumeShopPosition[2] - perfumeShopSize.depth/2 - borderWidth/2
      ]}>
        <boxGeometry args={[pillarSize, pillarHeight, pillarSize]} />
        <meshStandardMaterial color="#333333" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Northwest pillar */}
      <mesh position={[
        perfumeShopPosition[0] - perfumeShopSize.width/2 - borderWidth/2, 
        pillarHeight/2, 
        perfumeShopPosition[2] - perfumeShopSize.depth/2 - borderWidth/2
      ]}>
        <boxGeometry args={[pillarSize, pillarHeight, pillarSize]} />
        <meshStandardMaterial color="#333333" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Southeast pillar */}
      <mesh position={[
        perfumeShopPosition[0] + perfumeShopSize.width/2 + borderWidth/2, 
        pillarHeight/2, 
        perfumeShopPosition[2] + perfumeShopSize.depth/2 + borderWidth/2
      ]}>
        <boxGeometry args={[pillarSize, pillarHeight, pillarSize]} />
        <meshStandardMaterial color="#333333" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Southwest pillar */}
      <mesh position={[
        perfumeShopPosition[0] - perfumeShopSize.width/2 - borderWidth/2, 
        pillarHeight/2, 
        perfumeShopPosition[2] + perfumeShopSize.depth/2 + borderWidth/2
      ]}>
        <boxGeometry args={[pillarSize, pillarHeight, pillarSize]} />
        <meshStandardMaterial color="#333333" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Healthcare Center Upper Columns (decorative beams) */}
      {/* North beam */}
      <mesh position={[0, pillarHeight - 0.3, -healthcareCenterSize/2 - borderWidth/2]}>
        <boxGeometry args={[healthcareCenterSize + borderWidth*2, 0.3, pillarSize]} />
        <meshStandardMaterial color="#555555" roughness={0.6} metalness={0.3} />
      </mesh>

      {/* South beam */}
      <mesh position={[0, pillarHeight - 0.3, healthcareCenterSize/2 + borderWidth/2]}>
        <boxGeometry args={[healthcareCenterSize + borderWidth*2, 0.3, pillarSize]} />
        <meshStandardMaterial color="#555555" roughness={0.6} metalness={0.3} />
      </mesh>

      {/* East beam */}
      <mesh position={[healthcareCenterSize/2 + borderWidth/2, pillarHeight - 0.3, 0]}>
        <boxGeometry args={[pillarSize, 0.3, healthcareCenterSize]} />
        <meshStandardMaterial color="#555555" roughness={0.6} metalness={0.3} />
      </mesh>

      {/* West beam */}
      <mesh position={[-healthcareCenterSize/2 - borderWidth/2, pillarHeight - 0.3, 0]}>
        <boxGeometry args={[pillarSize, 0.3, healthcareCenterSize]} />
        <meshStandardMaterial color="#555555" roughness={0.6} metalness={0.3} />
      </mesh>

      {/* Perfume Shop Upper Columns (decorative beams) */}
      {/* North beam */}
      <mesh position={[
        perfumeShopPosition[0], 
        pillarHeight - 0.3, 
        perfumeShopPosition[2] - perfumeShopSize.depth/2 - borderWidth/2
      ]}>
        <boxGeometry args={[perfumeShopSize.width + borderWidth*2, 0.3, pillarSize]} />
        <meshStandardMaterial color="#555555" roughness={0.6} metalness={0.3} />
      </mesh>

      {/* South beam */}
      <mesh position={[
        perfumeShopPosition[0], 
        pillarHeight - 0.3, 
        perfumeShopPosition[2] + perfumeShopSize.depth/2 + borderWidth/2
      ]}>
        <boxGeometry args={[perfumeShopSize.width + borderWidth*2, 0.3, pillarSize]} />
        <meshStandardMaterial color="#555555" roughness={0.6} metalness={0.3} />
      </mesh>

      {/* East beam */}
      <mesh position={[
        perfumeShopPosition[0] + perfumeShopSize.width/2 + borderWidth/2, 
        pillarHeight - 0.3, 
        perfumeShopPosition[2]
      ]}>
        <boxGeometry args={[pillarSize, 0.3, perfumeShopSize.depth]} />
        <meshStandardMaterial color="#555555" roughness={0.6} metalness={0.3} />
      </mesh>

      {/* West beam */}
      <mesh position={[
        perfumeShopPosition[0] - perfumeShopSize.width/2 - borderWidth/2, 
        pillarHeight - 0.3, 
        perfumeShopPosition[2]
      ]}>
        <boxGeometry args={[pillarSize, 0.3, perfumeShopSize.depth]} />
        <meshStandardMaterial color="#555555" roughness={0.6} metalness={0.3} />
      </mesh>
    </group>
  );
}