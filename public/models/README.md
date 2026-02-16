# 3D Models Directory

This directory contains GLTF/GLB format 3D models for the immersive experience.

## Directory Structure

```
/models/
├── furniture/      # Desks, chairs, shelves, counters
├── products/       # Bottles, boxes, merchandise
├── props/          # Detail objects (cups, pens, signs, etc.)
├── architecture/   # Doors, windows, structural elements
└── README.md       # This file
```

## Supported Format

- **GLB (Binary glTF 2.0)** - Recommended ✅
  - Single file with embedded textures
  - Smaller size, faster loading
  - Best for web deployment

- **GLTF (Text glTF 2.0)** - Alternative
  - Separate files (model + textures)
  - Easier to edit textures
  - Can be converted to GLB

## Model Sources

### Free 3D Model Libraries

| Source | Quality | License | Download Link |
|--------|---------|---------|---------------|
| **Sketchfab** | ⭐⭐⭐⭐⭐ | CC0/CC-BY | https://sketchfab.com/features/free-3d-models |
| **Poly Pizza** | ⭐⭐⭐⭐⭐ | CC0 | https://poly.pizza/ |
| **Quaternius** | ⭐⭐⭐⭐ | CC0 | https://quaternius.com/ |
| **Kenney** | ⭐⭐⭐⭐ | CC0 | https://www.kenney.nl/assets |
| **Free3D** | ⭐⭐⭐ | Various | https://free3d.com/ |

### Recommended Models to Download

#### Furniture (Priority: HIGH)

| Item | Search Terms | Target Poly Count | Source |
|------|--------------|-------------------|--------|
| Pharmacy Counter | "pharmacy counter", "reception desk", "checkout counter" | 5K-10K | Sketchfab |
| Pharmacy Shelf | "pharmacy shelf", "display shelf", "retail shelf" | 3K-7K | Sketchfab |
| Office Chair | "office chair", "desk chair", "swivel chair" | 3K-5K | Poly Pizza |
| Reception Desk | "reception desk", "office desk" | 5K-8K | Sketchfab |
| Display Cabinet | "glass cabinet", "display case" | 4K-6K | Sketchfab |

#### Products (Priority: HIGH)

| Item | Search Terms | Target Poly Count | Source |
|------|--------------|-------------------|--------|
| Medicine Bottle | "pill bottle", "medicine bottle", "pharmacy bottle" | 1K-2K | Poly Pizza |
| Perfume Bottle | "perfume bottle", "fragrance bottle" | 1K-2K | Sketchfab |
| Product Box | "cardboard box", "product package" | 500-1K | Kenney |
| Shopping Basket | "shopping basket", "retail basket" | 2K-3K | Sketchfab |

#### Props/Details (Priority: MEDIUM)

| Item | Search Terms | Target Poly Count | Source |
|------|--------------|-------------------|--------|
| Coffee Cup | "coffee mug", "cup" | 500-1K | Poly Pizza |
| Computer Monitor | "lcd monitor", "desktop monitor" | 1K-2K | Kenney |
| Exit Sign | "exit sign", "emergency sign" | 200-500 | Sketchfab |
| Fire Extinguisher | "fire extinguisher" | 1K-2K | Poly Pizza |
| Trash Bin | "waste bin", "garbage can" | 500-1K | Quaternius |
| Plant Pot | "potted plant", "office plant" | 2K-4K | Sketchfab |
| Pen Holder | "pen holder", "desk organizer" | 500-1K | Poly Pizza |
| Papers/Documents | "papers", "documents", "office papers" | 200-500 | Kenney |

#### Architecture (Priority: MEDIUM)

| Item | Search Terms | Target Poly Count | Source |
|------|--------------|-------------------|--------|
| Glass Door | "glass door", "commercial door" | 500-1K | Sketchfab |
| Door Handle | "door handle", "door knob" | 300-500 | Poly Pizza |
| Window Frame | "window frame", "commercial window" | 500-1K | Sketchfab |

## Download Instructions

### From Sketchfab

1. Go to https://sketchfab.com/search?features=downloadable&licenses=322a749bcfa841b29dff1e8a1bb74b0b&type=models
2. Filter by "Downloadable" and "CC0" license
3. Search for model (e.g., "pharmacy counter")
4. Click on model → Click **Download 3D Model**
5. Select **glTF** format (NOT FBX or OBJ)
6. If available, choose "Original format (GLB)" or "glTF Binary"
7. Download and extract
8. Place `.glb` file in appropriate subfolder

### From Poly Pizza

1. Go to https://poly.pizza/
2. Search for model
3. Click on model thumbnail
4. Click **Download GLB** button
5. Save to appropriate subfolder

### From Quaternius / Kenney

1. Visit site
2. Download model pack (usually ZIP)
3. Extract and locate GLB files
4. Copy to appropriate subfolder

## File Naming Convention

Use descriptive, lowercase names with underscores:

```
✅ Good:
- pharmacy_counter_v1.glb
- office_chair_ergonomic.glb
- perfume_bottle_01.glb
- coffee_mug.glb

❌ Bad:
- model.glb
- asset1.glb
- temp_download.glb
```

## Model Requirements

| Specification | Requirement |
|---------------|-------------|
| **Format** | GLB (glTF 2.0 Binary) |
| **Polygon Count** | Low: <2K, Medium: 2K-5K, High: 5K-15K |
| **File Size** | Individual: <2 MB, Max: 5 MB |
| **Textures** | Embedded in GLB, 1024x1024 or 2048x2048 |
| **Materials** | PBR (Metallic-Roughness workflow) |
| **Scale** | Real-world dimensions (meters) |
| **Up Axis** | +Y up (standard for glTF) |
| **Triangulated** | Yes (glTF requirement) |

## Optimization Tools

### Convert FBX/OBJ to GLB

If you download FBX or OBJ files, convert them:

**Online Converters:**
- https://products.aspose.app/3d/conversion/fbx-to-gltf
- https://imagetostl.com/convert/fbx/to/gltf

**Command Line (Blender):**
```bash
blender --background --python convert_to_glb.py -- input.fbx output.glb
```

### Compress GLB Files

Use gltf-pipeline to reduce file size:

```bash
npm install -g gltf-pipeline
gltf-pipeline -i input.glb -o output.glb -d
```

Use gltf-transform for advanced optimization:

```bash
npm install -g @gltf-transform/cli
gltf-transform optimize input.glb output.glb
```

### Reduce Polygon Count

Use Blender's Decimate modifier:
1. Open GLB in Blender
2. Select model → Add Modifier → Decimate
3. Set Ratio to 0.5 (50% reduction)
4. Apply modifier
5. Export as GLB

## Creating Models in Blender

If you want to create custom models:

1. **Model** with clean quad topology
2. **UV Unwrap** for texturing
3. **Apply Materials** (Principled BSDF = glTF PBR)
4. **Set Real-World Scale** (1 Blender unit = 1 meter)
5. **Export as GLB**:
   - File → Export → glTF 2.0 (.glb/.gltf)
   - Format: glTF Binary (.glb)
   - Include: Selected Objects
   - Transform: +Y Up
   - Geometry: Apply Modifiers, UVs, Normals, Tangents
   - Compression: Draco (optional)

See `/docs/realistic-scene-enhancement-plan.md` Appendix A for detailed Blender workflow.

## Usage in Code

### Load Single Model

```jsx
import { useGLTF } from '@react-three/drei';

function PharmacyCounter() {
  const { scene } = useGLTF('/models/furniture/pharmacy_counter_v1.glb');

  return (
    <primitive
      object={scene}
      position={[0, 0, 0]}
      scale={[1, 1, 1]}
      rotation={[0, 0, 0]}
    />
  );
}

// Preload for better performance
useGLTF.preload('/models/furniture/pharmacy_counter_v1.glb');
```

### Use Existing Model3DLoader Component

```jsx
import Model3DLoader from '@/components/XR/Model3DLoader';

<Model3DLoader
  url="/models/furniture/pharmacy_counter_v1.glb"
  position={[0, 0, 0]}
  scale={[1, 1, 1]}
  rotation={[0, 0, 0]}
  castShadow
  receiveShadow
/>
```

## Database Integration

Update Supabase furniture records to use models:

```sql
UPDATE furniture
SET properties = jsonb_set(
  properties,
  '{modelUrl}',
  '"/models/furniture/pharmacy_counter_v1.glb"'::jsonb
)
WHERE type = 'pharmacy_counter';

UPDATE furniture
SET properties = jsonb_set(
  properties,
  '{useModel}',
  'true'::jsonb
)
WHERE type = 'pharmacy_counter';
```

## Testing

After adding models:

1. Start dev server: `npm run dev`
2. Navigate to `/immersiveexp`
3. Verify model loads correctly
4. Check scale (should match real-world size)
5. Verify shadows cast/receive properly
6. Test interactions (if applicable)

## Performance Tips

- **Use Instancing** for repeated objects (bottles, boxes)
- **Implement LOD** (Level of Detail) for complex models
- **Lazy Load** models only when visible
- **Compress Textures** embedded in GLB
- **Limit Poly Count** to target ranges above
- **Test on Target Devices** (mobile, desktop)

## Quick Start Checklist

Minimum models to download for immediate improvement:

- [ ] 1 Pharmacy Counter model
- [ ] 1 Pharmacy Shelf model
- [ ] 1 Office Chair model
- [ ] 3-5 Product bottle models (variations)
- [ ] 1 Glass door model
- [ ] 5-10 Detail props (coffee cup, monitor, plant, etc.)

**Total estimated download**: 20-50 MB
