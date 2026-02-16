export default function PlantPot({ 
  position = [0, 0, 0], 
  size = 1,
  plantType = "leafy" // "leafy", "tall", "bushy"
}) {
  const potRadius = 0.3 * size;
  const potHeight = 0.4 * size;
  const plantHeight = 0.8 * size;
  
  return (
    <group position={position}>
      {/* Pot Base */}
      <mesh position={[0, potHeight / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[potRadius, potRadius * 0.8, potHeight, 16]} />
        <meshBasicMaterial color="#8B4513" /> {/* Brown terracotta pot */}
      </mesh>
      
      {/* Pot Rim */}
      <mesh position={[0, potHeight - 0.02, 0]}>
        <torusGeometry args={[potRadius + 0.02, 0.02, 8, 16]} />
        <meshBasicMaterial color="#A0522D" /> {/* Sienna rim */}
      </mesh>
      
      {/* Soil */}
      <mesh position={[0, potHeight - 0.05, 0]}>
        <cylinderGeometry args={[potRadius - 0.02, potRadius - 0.02, 0.08, 16]} />
        <meshBasicMaterial color="#654321" /> {/* Dark brown soil */}
      </mesh>
      
      {/* Plant based on type */}
      {plantType === "leafy" && (
        <>
          {/* Main Stem */}
          <mesh position={[0, potHeight + plantHeight / 3, 0]}>
            <cylinderGeometry args={[0.02, 0.02, plantHeight / 2, 8]} />
            <meshBasicMaterial color="#228B22" /> {/* Forest green stem */}
          </mesh>
          
          {/* Leaves */}
          <mesh position={[-0.15, potHeight + plantHeight * 0.6, 0]} rotation={[0, 0, Math.PI / 6]}>
            <planeGeometry args={[0.2, 0.3]} />
            <meshBasicMaterial color="#32CD32" side={2} /> {/* Lime green leaf */}
          </mesh>
          
          <mesh position={[0.15, potHeight + plantHeight * 0.7, 0]} rotation={[0, 0, -Math.PI / 6]}>
            <planeGeometry args={[0.25, 0.35]} />
            <meshBasicMaterial color="#228B22" side={2} /> {/* Forest green leaf */}
          </mesh>
          
          <mesh position={[0, potHeight + plantHeight * 0.8, 0.1]} rotation={[Math.PI / 8, 0, 0]}>
            <planeGeometry args={[0.3, 0.4]} />
            <meshBasicMaterial color="#90EE90" side={2} /> {/* Light green leaf */}
          </mesh>
          
          <mesh position={[0, potHeight + plantHeight * 0.8, -0.1]} rotation={[-Math.PI / 8, 0, 0]}>
            <planeGeometry args={[0.28, 0.38]} />
            <meshBasicMaterial color="#9ACD32" side={2} /> {/* Yellow green leaf */}
          </mesh>
        </>
      )}
      
      {plantType === "tall" && (
        <>
          {/* Main Trunk */}
          <mesh position={[0, potHeight + plantHeight / 2, 0]}>
            <cylinderGeometry args={[0.03, 0.04, plantHeight, 8]} />
            <meshBasicMaterial color="#8B7355" /> {/* Burlywood trunk */}
          </mesh>
          
          {/* Top Leaves */}
          <mesh position={[0, potHeight + plantHeight * 0.9, 0]}>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshBasicMaterial color="#228B22" /> {/* Forest green top */}
          </mesh>
        </>
      )}
      
      {plantType === "bushy" && (
        <>
          {/* Multiple small bushes */}
          <mesh position={[-0.1, potHeight + 0.15, -0.1]}>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshBasicMaterial color="#32CD32" /> {/* Lime green bush */}
          </mesh>
          
          <mesh position={[0.1, potHeight + 0.18, 0.1]}>
            <sphereGeometry args={[0.14, 8, 8]} />
            <meshBasicMaterial color="#228B22" /> {/* Forest green bush */}
          </mesh>
          
          <mesh position={[0, potHeight + 0.2, 0]}>
            <sphereGeometry args={[0.16, 8, 8]} />
            <meshBasicMaterial color="#90EE90" /> {/* Light green bush */}
          </mesh>
        </>
      )}
      
      {/* Small decorative stones on soil */}
      <mesh position={[0.08, potHeight - 0.01, 0.08]}>
        <sphereGeometry args={[0.015, 6, 6]} />
        <meshBasicMaterial color="#A9A9A9" /> {/* Dark gray stone */}
      </mesh>
      
      <mesh position={[-0.06, potHeight - 0.01, -0.05]}>
        <sphereGeometry args={[0.012, 6, 6]} />
        <meshBasicMaterial color="#696969" /> {/* Dim gray stone */}
      </mesh>
    </group>
  );
}