export default function Whiteboard({ 
  position = [0, 0, 0], 
  rotation = [0, 0, 0], 
  size = [2.5, 1.5],
  content = "TB Education"
}) {
  const [width, height] = size;
  const frameThickness = 0.05;
  const depth = 0.03;
  
  return (
    <group position={position} rotation={rotation}>
      {/* Whiteboard Frame */}
      <mesh castShadow>
        <boxGeometry args={[width + frameThickness, height + frameThickness, depth]} />
        <meshBasicMaterial color="#C0C0C0" /> {/* Silver aluminum frame */}
      </mesh>
      
      {/* Whiteboard Surface */}
      <mesh position={[0, 0, depth / 2 + 0.001]}>
        <planeGeometry args={[width - 0.05, height - 0.05]} />
        <meshBasicMaterial color="#FFFFFF" /> {/* White surface */}
      </mesh>
      
      {/* Medical Chart Content (simple colored rectangles) */}
      {/* TB Anatomy Chart */}
      <mesh position={[-width/4, height/4, depth / 2 + 0.002]}>
        <planeGeometry args={[0.8, 0.4]} />
        <meshBasicMaterial color="#FFE4E1" /> {/* Light pink for lungs */}
      </mesh>
      
      {/* Chart Title */}
      <mesh position={[0, height/3, depth / 2 + 0.002]}>
        <planeGeometry args={[1.5, 0.1]} />
        <meshBasicMaterial color="#4169E1" /> {/* Blue title bar */}
      </mesh>
      
      {/* Symptoms List */}
      <mesh position={[width/4, 0, depth / 2 + 0.002]}>
        <planeGeometry args={[0.8, 0.8]} />
        <meshBasicMaterial color="#F0F8FF" /> {/* Alice blue for text area */}
      </mesh>
      
      {/* Prevention Box */}
      <mesh position={[0, -height/4, depth / 2 + 0.002]}>
        <planeGeometry args={[1.8, 0.3]} />
        <meshBasicMaterial color="#98FB98" /> {/* Pale green for prevention */}
      </mesh>
      
      {/* Marker Tray */}
      <mesh position={[0, -height/2 - 0.08, 0]}>
        <boxGeometry args={[width * 0.8, 0.05, 0.08]} />
        <meshBasicMaterial color="#C0C0C0" />
      </mesh>
      
      {/* Wall Mount */}
      <mesh position={[0, 0, -depth / 2 - 0.02]}>
        <boxGeometry args={[width * 0.3, 0.05, 0.04]} />
        <meshBasicMaterial color="#808080" />
      </mesh>
    </group>
  );
}