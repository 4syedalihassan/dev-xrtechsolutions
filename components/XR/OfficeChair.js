export default function OfficeChair({ 
  position = [0, 0, 0], 
  rotation = [0, 0, 0],
  size = 1 // scale factor
}) {
  const seatHeight = 0.5 * size;
  const backHeight = 0.8 * size;
  const seatWidth = 0.5 * size;
  const seatDepth = 0.5 * size;
  
  return (
    <group position={position} rotation={rotation}>
      {/* Chair Base - 5-point star base */}
      <mesh position={[0, 0.05 * size, 0]}>
        <cylinderGeometry args={[0.03 * size, 0.05 * size, 0.1 * size, 8]} />
        <meshBasicMaterial color="#2F2F2F" /> {/* Black plastic base */}
      </mesh>
      
      {/* Chair Base Arms (5 spokes) */}
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = (i / 5) * Math.PI * 2;
        return (
          <mesh 
            key={i}
            position={[
              Math.cos(angle) * 0.15 * size, 
              0.02 * size, 
              Math.sin(angle) * 0.15 * size
            ]}
            rotation={[0, angle, 0]}
          >
            <boxGeometry args={[0.3 * size, 0.02 * size, 0.03 * size]} />
            <meshBasicMaterial color="#2F2F2F" /> {/* Black plastic */}
          </mesh>
        );
      })}
      
      {/* Chair Wheels */}
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = (i / 5) * Math.PI * 2;
        return (
          <mesh 
            key={i}
            position={[
              Math.cos(angle) * 0.28 * size, 
              0.04 * size, 
              Math.sin(angle) * 0.28 * size
            ]}
          >
            <cylinderGeometry args={[0.03 * size, 0.03 * size, 0.02 * size, 8]} />
            <meshBasicMaterial color="#696969" /> {/* Dark gray wheels */}
          </mesh>
        );
      })}
      
      {/* Gas Cylinder */}
      <mesh position={[0, seatHeight / 2, 0]}>
        <cylinderGeometry args={[0.04 * size, 0.04 * size, seatHeight, 12]} />
        <meshBasicMaterial color="#2F2F2F" /> {/* Black cylinder */}
      </mesh>
      
      {/* Seat */}
      <mesh position={[0, seatHeight, 0]} castShadow receiveShadow>
        <boxGeometry args={[seatWidth, 0.08 * size, seatDepth]} />
        <meshBasicMaterial color="#4169E1" /> {/* Blue office chair seat */}
      </mesh>
      
      {/* Seat Cushion Padding */}
      <mesh position={[0, seatHeight + 0.05 * size, 0]} receiveShadow>
        <boxGeometry args={[seatWidth - 0.02 * size, 0.04 * size, seatDepth - 0.02 * size]} />
        <meshBasicMaterial color="#6495ED" /> {/* Lighter blue padding */}
      </mesh>
      
      {/* Backrest */}
      <mesh position={[0, seatHeight + backHeight / 2, -seatDepth / 2 + 0.05 * size]} castShadow>
        <boxGeometry args={[seatWidth, backHeight, 0.08 * size]} />
        <meshBasicMaterial color="#4169E1" /> {/* Blue backrest */}
      </mesh>
      
      {/* Backrest Padding */}
      <mesh position={[0, seatHeight + backHeight / 2, -seatDepth / 2 + 0.09 * size]}>
        <boxGeometry args={[seatWidth - 0.02 * size, backHeight - 0.02 * size, 0.04 * size]} />
        <meshBasicMaterial color="#6495ED" /> {/* Lighter blue padding */}
      </mesh>
      
      {/* Left Armrest */}
      <mesh position={[-seatWidth / 2 - 0.05 * size, seatHeight + 0.25 * size, 0]} castShadow>
        <boxGeometry args={[0.1 * size, 0.05 * size, seatDepth * 0.8]} />
        <meshBasicMaterial color="#2F2F2F" /> {/* Black armrest */}
      </mesh>
      
      {/* Left Armrest Support */}
      <mesh position={[-seatWidth / 2 - 0.05 * size, seatHeight + 0.15 * size, 0]}>
        <boxGeometry args={[0.05 * size, 0.25 * size, 0.05 * size]} />
        <meshBasicMaterial color="#2F2F2F" /> {/* Black support */}
      </mesh>
      
      {/* Right Armrest */}
      <mesh position={[seatWidth / 2 + 0.05 * size, seatHeight + 0.25 * size, 0]} castShadow>
        <boxGeometry args={[0.1 * size, 0.05 * size, seatDepth * 0.8]} />
        <meshBasicMaterial color="#2F2F2F" /> {/* Black armrest */}
      </mesh>
      
      {/* Right Armrest Support */}
      <mesh position={[seatWidth / 2 + 0.05 * size, seatHeight + 0.15 * size, 0]}>
        <boxGeometry args={[0.05 * size, 0.25 * size, 0.05 * size]} />
        <meshBasicMaterial color="#2F2F2F" /> {/* Black support */}
      </mesh>
      
      {/* Backrest Support Mechanism */}
      <mesh position={[0, seatHeight, -seatDepth / 2]} castShadow>
        <boxGeometry args={[0.1 * size, 0.1 * size, 0.1 * size]} />
        <meshBasicMaterial color="#2F2F2F" /> {/* Black mechanism */}
      </mesh>
    </group>
  );
}