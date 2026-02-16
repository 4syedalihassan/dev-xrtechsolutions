# PBR Texture Assets

This directory contains Physically Based Rendering (PBR) texture sets for realistic materials.

## Directory Structure

```
/textures/
├── floor/          # Floor tile, stone, wood textures
├── walls/          # Brick, concrete, painted wall textures
├── metal/          # Brushed aluminum, steel, brass textures
├── wood/           # Wood grain for furniture
└── README.md       # This file
```

## Required Texture Sets

Download the following PBR texture sets from **Poly Haven** (https://polyhaven.com/textures) - All **CC0 License**:

### Floor Textures

| Name | Type | Resolution | Download Link |
|------|------|------------|---------------|
| **tiles_brown_02** | Ceramic Tiles | 2K | https://polyhaven.com/a/tiles_brown_02 |
| **concrete_floor_worn_001** | Concrete | 2K | https://polyhaven.com/a/concrete_floor_worn_001 |
| **wood_floor_deck_001** | Wood Planks | 2K | https://polyhaven.com/a/wood_floor_deck_001 |

### Wall Textures

| Name | Type | Resolution | Download Link | Used In |
|------|------|------------|---------------|---------|
| **red_brick_03** ⭐ | Red Bricks | 2K | https://polyhaven.com/a/red_brick_03 | Healthcare center exterior walls |
| **white_brick_wall** | White Bricks | 2K | https://polyhaven.com/a/white_brick_wall | Interior walls |
| **concrete_wall_006** | Concrete | 2K | https://polyhaven.com/a/concrete_wall_006 | Industrial areas |
| **plaster_painted_white** | Painted Wall | 2K | https://polyhaven.com/a/plaster_painted_white | Interior painted walls |

**⭐ Priority Download**: `red_brick_03` is actively used on healthcare center walls with PBR materials enabled.

### Wood Textures (for Furniture)

| Name | Type | Resolution | Download Link |
|------|------|------------|---------------|
| **wood_table_001** | Table Wood | 2K | https://polyhaven.com/a/wood_table_001 |
| **wood_cabinet_worn_long** | Cabinet Wood | 2K | https://polyhaven.com/a/wood_cabinet_worn_long |
| **laminate_floor_03** | Laminate | 2K | https://polyhaven.com/a/laminate_floor_03 |

### Metal Textures

| Name | Type | Resolution | Download Link |
|------|------|------------|---------------|
| **brushed_aluminum** | Aluminum | 2K | https://polyhaven.com/a/brushed_aluminum |
| **metal_plate** | Steel Plate | 2K | https://polyhaven.com/a/metal_plate |
| **rusty_metal_02** | Rusted Metal | 2K | https://polyhaven.com/a/rusty_metal_02 |

## Download Instructions

1. Visit Poly Haven Textures: https://polyhaven.com/textures
2. Search for the texture name (e.g., "red_brick_03")
3. Click on the texture
4. Click **Download** button
5. Select **All Maps** (downloads ZIP with all PBR maps)
6. Choose **2K resolution** (2048x2048)
7. Extract ZIP to appropriate subfolder

### Example: Downloading Brick Wall Textures

For healthcare center walls (red_brick_03):

1. Visit: https://polyhaven.com/a/red_brick_03
2. Download "All Maps" at 2K resolution
3. Extract to `/public/textures/walls/` folder
4. Ensure these files exist:
   - `red_brick_03_diff_2k.jpg` (Base color)
   - `red_brick_03_nor_gl_2k.png` (Normal map - bumps)
   - `red_brick_03_rough_2k.jpg` (Roughness - shininess)
   - `red_brick_03_ao_2k.jpg` (Ambient occlusion - shadows)

The walls will automatically load these textures when present.

## PBR Texture Map Types

Each texture set includes multiple maps:

| Map Type | File Suffix | Purpose | Example Filename |
|----------|-------------|---------|------------------|
| **Base Color** | `_diff_2k.jpg` | Surface color | `red_brick_03_diff_2k.jpg` |
| **Normal Map** | `_nor_gl_2k.png` | Surface bumps/detail | `red_brick_03_nor_gl_2k.png` |
| **Roughness** | `_rough_2k.jpg` | Surface glossiness | `red_brick_03_rough_2k.jpg` |
| **Displacement** | `_disp_2k.png` | Height information | `red_brick_03_disp_2k.png` |
| **Ambient Occlusion** | `_ao_2k.jpg` | Crevice darkening | `red_brick_03_ao_2k.jpg` |

**Note**: Not all textures have metallic maps because most architectural materials are non-metallic.

## File Organization Example

After download and extraction:

```
/textures/
├── floor/
│   ├── tiles_brown_02_diff_2k.jpg
│   ├── tiles_brown_02_nor_gl_2k.png
│   ├── tiles_brown_02_rough_2k.jpg
│   ├── tiles_brown_02_disp_2k.png
│   └── tiles_brown_02_ao_2k.jpg
├── walls/
│   ├── red_brick_03_diff_2k.jpg
│   ├── red_brick_03_nor_gl_2k.png
│   ├── red_brick_03_rough_2k.jpg
│   ├── red_brick_03_disp_2k.png
│   └── red_brick_03_ao_2k.jpg
└── wood/
    ├── wood_table_001_diff_2k.jpg
    ├── wood_table_001_nor_gl_2k.png
    ├── wood_table_001_rough_2k.jpg
    └── wood_table_001_ao_2k.jpg
```

## File Size Guidelines

- **Individual texture**: 200 KB - 1 MB (JPG compressed at 85-90% quality)
- **Normal maps**: 500 KB - 2 MB (PNG lossless)
- **Total per material set**: 2-5 MB

## Texture Resolution Guidelines

| Use Case | Resolution | When to Use |
|----------|------------|-------------|
| **Hero Assets** | 2K (2048x2048) | Closeup furniture, products |
| **Standard** | 1K (1024x1024) | General walls, floors |
| **Background** | 512x512 | Distant objects |

Start with 2K, then optimize down if performance is an issue.

## Usage in Code

Example material using PBR textures:

```jsx
import { useTexture } from '@react-three/drei';

function RealisticFloor() {
  const [colorMap, normalMap, roughnessMap, aoMap, dispMap] = useTexture([
    '/textures/floor/tiles_brown_02_diff_2k.jpg',
    '/textures/floor/tiles_brown_02_nor_gl_2k.png',
    '/textures/floor/tiles_brown_02_rough_2k.jpg',
    '/textures/floor/tiles_brown_02_ao_2k.jpg',
    '/textures/floor/tiles_brown_02_disp_2k.png',
  ]);

  // Configure tiling
  [colorMap, normalMap, roughnessMap, aoMap, dispMap].forEach(tex => {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(10, 10);
  });

  return (
    <meshStandardMaterial
      map={colorMap}
      normalMap={normalMap}
      roughnessMap={roughnessMap}
      aoMap={aoMap}
      displacementMap={dispMap}
      displacementScale={0.05}
    />
  );
}
```

## Alternative Texture Sources

If Poly Haven is unavailable:
- **Ambient CG**: https://ambientcg.com/ (CC0, seamless)
- **3D Textures**: https://3dtextures.me/ (Free, commercial use)
- **Texture Haven**: https://texturehaven.com/ (archived, merged with Poly Haven)
- **Free PBR**: https://freepbr.com/

## Texture Optimization Tools

After download, optionally optimize:
```bash
# Compress JPG textures
mogrify -quality 85 *.jpg

# Resize to 1K if needed
mogrify -resize 1024x1024 *_2k.jpg

# Convert to WebP for smaller size (browser support required)
cwebp -q 85 input.jpg -o output.webp
```

## Testing

1. Download at least one floor and one wall texture set
2. Update component files to use new textures
3. Start dev server: `npm run dev`
4. Navigate to `/immersiveexp`
5. Verify textures are tiling correctly
6. Check normal maps add surface detail
7. Inspect roughness variations under lighting

## Quick Start Priority

**Minimum downloads to get started**:
1. ⭐ **Wall: `red_brick_03`** (healthcare center exterior - PBR enabled!)
2. ✅ Floor: `tiles_brown_02` (for ground)
3. ✅ Wood: `wood_table_001` (for furniture)

These 3 texture sets will give you immediate visual improvement.

**Current Status**:
- ✅ Healthcare center walls: PBR textures enabled (`usePBR={true}`)
- ✅ Automatic fallback: Uses procedural textures if files not downloaded
- ⚡ Download `red_brick_03` for instant realistic brick walls!
