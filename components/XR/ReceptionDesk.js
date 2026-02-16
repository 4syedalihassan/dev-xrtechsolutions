export default function ReceptionDesk({ 
  position = [0, 0, 0], 
  rotation = [0, 0, 0],
  size = [4, 1.2, 1.5] // width, height, depth
}) {
  const [width, height, depth] = size;
  const deskThickness = 0.05;
  
  return (
    <group position={position} rotation={rotation}>
      {/* Main Desk Base/Frame */}
      <mesh position={[0, height / 2 - 0.1, 0]} castShadow>
        <boxGeometry args={[width, height - 0.2, depth]} />
        <meshBasicMaterial color="#8B7355" /> {/* Wood brown */}
      </mesh>
      
      {/* Desk Top Surface */}
      <mesh position={[0, height - deskThickness / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, deskThickness, depth]} />
        <meshBasicMaterial color="#A0522D" /> {/* Darker wood top */}
      </mesh>
      
      {/* Reception Counter Front Panel */}
      <mesh position={[0, height / 2, depth / 2 - 0.02]} castShadow>
        <planeGeometry args={[width - 0.1, height - 0.1]} />
        <meshBasicMaterial color="#DEB887" /> {/* Light wood panel */}
      </mesh>
      
      {/* Left Drawer */}
      <mesh position={[-width / 4, height * 0.3, depth / 2 - 0.01]} castShadow>
        <planeGeometry args={[width / 3, 0.15]} />
        <meshBasicMaterial color="#CD853F" /> {/* Drawer front */}
      </mesh>
      
      {/* Right Drawer */}
      <mesh position={[width / 4, height * 0.3, depth / 2 - 0.01]} castShadow>
        <planeGeometry args={[width / 3, 0.15]} />
        <meshBasicMaterial color="#CD853F" /> {/* Drawer front */}
      </mesh>
      
      {/* Drawer Handles */}
      <mesh position={[-width / 4 + 0.4, height * 0.3, depth / 2 + 0.02]}>
        <cylinderGeometry args={[0.02, 0.02, 0.03, 8]} />
        <meshBasicMaterial color="#C0C0C0" /> {/* Silver handle */}
      </mesh>
      
      <mesh position={[width / 4 + 0.4, height * 0.3, depth / 2 + 0.02]}>
        <cylinderGeometry args={[0.02, 0.02, 0.03, 8]} />
        <meshBasicMaterial color="#C0C0C0" /> {/* Silver handle */}
      </mesh>
      
      {/* Reception Items */}
      {/* Computer Monitor */}
      <mesh position={[-0.8, height + 0.25, -0.2]} castShadow>
        <boxGeometry args={[0.5, 0.3, 0.05]} />
        <meshBasicMaterial color="#2F2F2F" /> {/* Black monitor */}
      </mesh>
      
      {/* Monitor Screen */}
      <mesh position={[-0.8, height + 0.25, -0.17]} castShadow>
        <planeGeometry args={[0.45, 0.25]} />
        <meshBasicMaterial color="#1E90FF" /> {/* Blue screen */}
      </mesh>
      
      {/* Monitor Stand */}
      <mesh position={[-0.8, height + 0.05, -0.2]} castShadow>
        <cylinderGeometry args={[0.08, 0.12, 0.15, 8]} />
        <meshBasicMaterial color="#2F2F2F" /> {/* Black stand */}
      </mesh>
      
      {/* Keyboard */}
      <mesh position={[-0.8, height + 0.02, 0.2]} castShadow>
        <boxGeometry args={[0.4, 0.02, 0.15]} />
        <meshBasicMaterial color="#2F2F2F" /> {/* Black keyboard */}
      </mesh>
      
      {/* Mouse */}
      <mesh position={[-0.4, height + 0.02, 0.3]} castShadow>
        <boxGeometry args={[0.08, 0.02, 0.12]} />
        <meshBasicMaterial color="#2F2F2F" /> {/* Black mouse */}
      </mesh>
      
      {/* Phone */}
      <mesh position={[0.5, height + 0.08, 0]} castShadow>
        <boxGeometry args={[0.15, 0.15, 0.2]} />
        <meshBasicMaterial color="#2F4F4F" /> {/* Dark grey phone */}
      </mesh>
      
      {/* Phone Handset */}
      <mesh position={[0.5, height + 0.17, 0]} castShadow rotation={[0, 0, Math.PI / 6]}>
        <boxGeometry args={[0.04, 0.02, 0.18]} />
        <meshBasicMaterial color="#2F4F4F" /> {/* Handset */}
      </mesh>
      
      {/* Paper Tray */}
      <mesh position={[1.2, height + 0.03, -0.3]} castShadow>
        <boxGeometry args={[0.3, 0.05, 0.4]} />
        <meshBasicMaterial color="#8B7355" /> {/* Wood tray */}
      </mesh>
      
      {/* Papers */}
      <mesh position={[1.2, height + 0.08, -0.3]} castShadow>
        <boxGeometry args={[0.25, 0.01, 0.35]} />
        <meshBasicMaterial color="#FFFFFF" /> {/* White papers */}
      </mesh>
      
      {/* Pen Holder */}
      <mesh position={[0.8, height + 0.08, 0.4]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.15, 8]} />
        <meshBasicMaterial color="#8B4513" /> {/* Brown pen holder */}
      </mesh>
      
      {/* Pens */}
      <mesh position={[0.78, height + 0.2, 0.4]} castShadow>
        <cylinderGeometry args={[0.005, 0.005, 0.12, 8]} />
        <meshBasicMaterial color="#FF0000" /> {/* Red pen */}
      </mesh>
      
      <mesh position={[0.82, height + 0.18, 0.4]} castShadow>
        <cylinderGeometry args={[0.005, 0.005, 0.1, 8]} />
        <meshBasicMaterial color="#0000FF" /> {/* Blue pen */}
      </mesh>
      
      {/* Reception Sign */}
      <mesh position={[0, height + 0.15, -depth / 2 + 0.02]} castShadow>
        <planeGeometry args={[0.6, 0.15]} />
        <meshBasicMaterial color="#FFFFFF" /> {/* White sign */}
      </mesh>
      
      {/* Sign Text Area (placeholder) */}
      <mesh position={[0, height + 0.15, -depth / 2 + 0.025]} castShadow>
        <planeGeometry args={[0.55, 0.1]} />
        <meshBasicMaterial color="#2F2F2F" /> {/* Dark text area */}
      </mesh>
      
      {/* Desk Legs */}
      <mesh position={[-width / 2 + 0.1, height / 2, -depth / 2 + 0.1]} castShadow>
        <boxGeometry args={[0.08, height, 0.08]} />
        <meshBasicMaterial color="#8B7355" /> {/* Wood leg */}
      </mesh>
      
      <mesh position={[width / 2 - 0.1, height / 2, -depth / 2 + 0.1]} castShadow>
        <boxGeometry args={[0.08, height, 0.08]} />
        <meshBasicMaterial color="#8B7355" /> {/* Wood leg */}
      </mesh>
      
      <mesh position={[-width / 2 + 0.1, height / 2, depth / 2 - 0.1]} castShadow>
        <boxGeometry args={[0.08, height, 0.08]} />
        <meshBasicMaterial color="#8B7355" /> {/* Wood leg */}
      </mesh>
      
      <mesh position={[width / 2 - 0.1, height / 2, depth / 2 - 0.1]} castShadow>
        <boxGeometry args={[0.08, height, 0.08]} />
        <meshBasicMaterial color="#8B7355" /> {/* Wood leg */}
      </mesh>
    </group>
  );
}