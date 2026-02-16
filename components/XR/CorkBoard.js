export default function CorkBoard({ 
  position = [0, 0, 0], 
  rotation = [0, 0, 0], 
  size = [1.8, 1.2] 
}) {
  const [width, height] = size;
  const frameThickness = 0.08;
  const depth = 0.04;
  
  return (
    <group position={position} rotation={rotation}>
      {/* Cork Board Frame */}
      <mesh castShadow>
        <boxGeometry args={[width + frameThickness, height + frameThickness, depth]} />
        <meshBasicMaterial color="#8B4513" /> {/* Saddle brown wooden frame */}
      </mesh>
      
      {/* Cork Surface */}
      <mesh position={[0, 0, depth / 2 + 0.001]}>
        <planeGeometry args={[width - 0.02, height - 0.02]} />
        <meshBasicMaterial color="#DEB887" /> {/* Burlywood cork color */}
      </mesh>
      
      {/* Pinned Notice 1 - TB Awareness Poster */}
      <mesh position={[-width/4, height/4, depth / 2 + 0.002]}>
        <planeGeometry args={[0.5, 0.3]} />
        <meshBasicMaterial color="#FF6347" /> {/* Tomato red for attention */}
      </mesh>
      
      {/* Pinned Notice 2 - Vaccination Schedule */}
      <mesh position={[width/4, height/4, depth / 2 + 0.002]}>
        <planeGeometry args={[0.4, 0.35]} />
        <meshBasicMaterial color="#87CEEB" /> {/* Sky blue */}
      </mesh>
      
      {/* Pinned Notice 3 - Prevention Tips */}
      <mesh position={[-width/4, -height/6, depth / 2 + 0.002]}>
        <planeGeometry args={[0.6, 0.4]} />
        <meshBasicMaterial color="#98FB98" /> {/* Pale green */}
      </mesh>
      
      {/* Pinned Notice 4 - Contact Information */}
      <mesh position={[width/4, -height/4, depth / 2 + 0.002]}>
        <planeGeometry args={[0.45, 0.25]} />
        <meshBasicMaterial color="#FFE4B5" /> {/* Moccasin */}
      </mesh>
      
      {/* Push Pins */}
      <mesh position={[-width/4, height/4 + 0.12, depth / 2 + 0.003]}>
        <cylinderGeometry args={[0.01, 0.01, 0.01, 8]} />
        <meshBasicMaterial color="#FF0000" /> {/* Red pin */}
      </mesh>
      
      <mesh position={[width/4, height/4 + 0.15, depth / 2 + 0.003]}>
        <cylinderGeometry args={[0.01, 0.01, 0.01, 8]} />
        <meshBasicMaterial color="#0000FF" /> {/* Blue pin */}
      </mesh>
      
      <mesh position={[-width/4, -height/6 + 0.18, depth / 2 + 0.003]}>
        <cylinderGeometry args={[0.01, 0.01, 0.01, 8]} />
        <meshBasicMaterial color="#008000" /> {/* Green pin */}
      </mesh>
      
      <mesh position={[width/4, -height/4 + 0.1, depth / 2 + 0.003]}>
        <cylinderGeometry args={[0.01, 0.01, 0.01, 8]} />
        <meshBasicMaterial color="#FFA500" /> {/* Orange pin */}
      </mesh>
      
      {/* Wall Mount */}
      <mesh position={[0, 0, -depth / 2 - 0.02]}>
        <boxGeometry args={[width * 0.4, 0.04, 0.03]} />
        <meshBasicMaterial color="#654321" />
      </mesh>
    </group>
  );
}