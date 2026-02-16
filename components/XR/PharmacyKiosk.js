import MinecraftPharmacist from './MinecraftPharmacist';

/**
 * PharmacyKiosk - Pharmacy service kiosk with animated pharmacist
 *
 * Features:
 * - Counter/desk for pharmacy services
 * - Medicine display shelves behind counter
 * - Animated Minecraft-style pharmacist character
 * - Realistic PBR materials
 * - Medical cross symbol
 */
export default function PharmacyKiosk({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  size = [3, 1.2, 1.2] // [width, height, depth]
}) {
  const [width, height, depth] = size;

  return (
    <group position={position} rotation={rotation}>
      {/* Main Counter - white/light medical colors */}
      <group>
        {/* Counter Base */}
        <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[width, height, depth]} />
          <meshStandardMaterial
            color="#F0F0F0" // Light grey/white
            roughness={0.4}
            metalness={0.1}
          />
        </mesh>

        {/* Counter Top - slightly darker */}
        <mesh position={[0, height + 0.05, 0]} castShadow receiveShadow>
          <boxGeometry args={[width + 0.1, 0.1, depth + 0.1]} />
          <meshStandardMaterial
            color="#E0E0E0"
            roughness={0.3}
            metalness={0.2}
          />
        </mesh>

        {/* Medical Cross Symbol - front of counter */}
        <group position={[0, height / 2, depth / 2 + 0.02]}>
          {/* Vertical bar */}
          <mesh castShadow>
            <boxGeometry args={[0.15, 0.5, 0.02]} />
            <meshStandardMaterial
              color="#FF0000" // Red cross
              roughness={0.3}
              metalness={0.0}
              emissive="#FF0000"
              emissiveIntensity={0.2}
            />
          </mesh>
          {/* Horizontal bar */}
          <mesh castShadow>
            <boxGeometry args={[0.5, 0.15, 0.02]} />
            <meshStandardMaterial
              color="#FF0000"
              roughness={0.3}
              metalness={0.0}
              emissive="#FF0000"
              emissiveIntensity={0.2}
            />
          </mesh>
        </group>

        {/* "PHARMACY" Sign on top */}
        <mesh position={[0, height + 0.5, 0]} castShadow>
          <boxGeometry args={[width - 0.2, 0.3, 0.05]} />
          <meshStandardMaterial
            color="#FFFFFF"
            roughness={0.3}
            metalness={0.1}
          />
        </mesh>

        {/* Sign text background */}
        <mesh position={[0, height + 0.5, 0.03]} castShadow>
          <boxGeometry args={[width - 0.3, 0.25, 0.02]} />
          <meshStandardMaterial
            color="#00A86B" // Medical green
            roughness={0.4}
            metalness={0.0}
            emissive="#00A86B"
            emissiveIntensity={0.3}
          />
        </mesh>
      </group>

      {/* Medicine Shelves Behind Counter */}
      <group position={[0, 0, -depth / 2 - 0.5]}>
        {/* Back wall shelf unit */}
        <mesh position={[0, height + 0.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[width - 0.2, height * 1.5, 0.2]} />
          <meshStandardMaterial
            color="#FFFFFF"
            roughness={0.5}
            metalness={0.0}
          />
        </mesh>

        {/* Shelf dividers */}
        {[0.3, 0.6, 0.9, 1.2].map((y, i) => (
          <mesh key={i} position={[0, y, 0]} castShadow>
            <boxGeometry args={[width - 0.25, 0.03, 0.25]} />
            <meshStandardMaterial
              color="#E0E0E0"
              roughness={0.4}
              metalness={0.2}
            />
          </mesh>
        ))}

        {/* Medicine Bottles/Boxes (simplified) */}
        {Array.from({ length: 12 }, (_, i) => {
          const row = Math.floor(i / 4);
          const col = i % 4;
          const x = -width / 3 + (col * width / 4);
          const y = 0.4 + (row * 0.35);
          const isBottle = i % 2 === 0;

          return (
            <mesh
              key={i}
              position={[x, y, 0.05]}
              castShadow
            >
              {isBottle ? (
                <cylinderGeometry args={[0.05, 0.05, 0.15, 8]} />
              ) : (
                <boxGeometry args={[0.08, 0.12, 0.08]} />
              )}
              <meshStandardMaterial
                color={['#FF6B6B', '#4ECDC4', '#FFD93D', '#95E1D3'][col]}
                roughness={0.4}
                metalness={0.1}
              />
            </mesh>
          );
        })}
      </group>

      {/* Computer/Tablet on counter */}
      <group position={[width / 3, height + 0.1, 0]}>
        {/* Base */}
        <mesh castShadow>
          <boxGeometry args={[0.15, 0.02, 0.2]} />
          <meshStandardMaterial
            color="#333333"
            roughness={0.3}
            metalness={0.6}
          />
        </mesh>
        {/* Screen */}
        <mesh position={[0, 0.15, 0]} rotation={[-0.2, 0, 0]} castShadow>
          <boxGeometry args={[0.25, 0.18, 0.02]} />
          <meshStandardMaterial
            color="#1a1a1a"
            roughness={0.1}
            metalness={0.8}
            emissive="#4A90E2"
            emissiveIntensity={0.3}
          />
        </mesh>
      </group>

      {/* Pharmacist Character - standing behind counter */}
      <MinecraftPharmacist position={[-width / 3, height + 0.1, -depth / 2 - 0.2]} />

      {/* Small light above kiosk */}
      <pointLight
        position={[0, height + 1.5, 0]}
        intensity={0.8}
        distance={5}
        color="#FFFFFF"
        castShadow
      />
    </group>
  );
}
