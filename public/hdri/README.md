# HDRI Environment Maps

This directory contains High Dynamic Range Images (HDRI) used for realistic environment lighting and reflections.

## Required HDRIs for Download

Download the following HDRIs from **Poly Haven** (https://polyhaven.com/hdris) - All are **CC0 License** (free for any use):

### 1. Indoor HDRIs

| Name | Resolution | Use Case | Download Link |
|------|------------|----------|---------------|
| **studio_small_08** | 2K | Main interior lighting | https://polyhaven.com/a/studio_small_08 |
| **warehouse** | 2K | Alternative indoor | https://polyhaven.com/a/warehouse |
| **modern_buildings_night** | 2K | Night interior | https://polyhaven.com/a/modern_buildings_night |

### 2. Outdoor HDRIs

| Name | Resolution | Use Case | Download Link |
|------|------------|----------|---------------|
| **kloofendal_48d_partly_cloudy** | 2K | Daytime exterior | https://polyhaven.com/a/kloofendal_48d_partly_cloudy |
| **sunset_fairway** | 2K | Sunset/dusk | https://polyhaven.com/a/sunset_fairway |
| **evening_road_01** | 2K | Evening lighting | https://polyhaven.com/a/evening_road_01|
| **moonlit_golf** | 2K | Nighttime/moonlight | https://polyhaven.com/a/moonlit_golf |

### 3. Time-of-Day HDRIs

| Time | HDRI File | Description |
|------|-----------|-------------|
| **Dawn** | `sunset_fairway_2k.hdr` | Warm morning light |
| **Day** | `kloofendal_48d_partly_cloudy_2k.hdr` | Bright daylight |
| **Dusk** | `evening_road_01_2k.hdr` | Orange evening light |
| **Night** | `moonlit_golf_2k.hdr` | Cool moonlight |
| **Indoor** | `studio_small_08_2k.hdr` | Neutral indoor light |

### 4. Winter/Seasonal HDRIs (Optional)

For enhanced winter realism, download these snowy/cold environment HDRIs:

| Name | Resolution | Use Case | Download Link |
|------|------------|----------|---------------|
| **snowy_forest** | 2K | Snowy outdoor day | https://polyhaven.com/a/snowy_forest |
| **snowy_park** | 2K | Winter park scene | https://polyhaven.com/a/snowy_park_01 |
| **winter_evening** | 2K | Cold winter sunset | https://polyhaven.com/a/winter_evening |
| **kloppenheim** | 2K | Overcast winter sky | https://polyhaven.com/a/kloppenheim_06 |

**Winter Mapping:**
- **Dawn**: `winter_evening_2k.hdr` (cold morning)
- **Day**: `snowy_forest_2k.hdr` or `snowy_park_01_2k.hdr` (bright snowy day)
- **Dusk**: `winter_evening_2k.hdr` (cold sunset)
- **Night**: `kloppenheim_06_2k.hdr` (overcast night)

## Download Instructions

1. Visit Poly Haven: https://polyhaven.com/hdris
2. Search for the HDRI name from the table above
3. Click on the HDRI to open its detail page
4. Click the **Download** button
5. Select **HDR format** (NOT JPG/EXR)
6. Choose **2K resolution** (2048x1024) for web optimization
7. Download and save to this directory (`/public/hdri/`)

## File Naming Convention

Rename downloaded files to match this convention:
```
dawn.hdr          (sunset_fairway_2k.hdr)
day.hdr           (kloofendal_48d_partly_cloudy_2k.hdr)
dusk.hdr          (evening_road_01_2k.hdr)
night.hdr         (moonlit_golf_2k.hdr)
indoor.hdr        (studio_small_08_2k.hdr)
warehouse.hdr     (warehouse_2k.hdr)
```

Or keep original names and update the code references.

## File Size Guidelines

- **Target size**: 2-5 MB per HDRI
- **Maximum size**: 10 MB
- If file is too large, use a compression tool or download 1K version

## Testing

After downloading, verify the HDRIs work by:
1. Start the development server: `npm run dev`
2. Navigate to `/immersiveexp`
3. Check reflections on metallic surfaces
4. Verify lighting changes based on time of day

## Alternative HDRI Sources

If Poly Haven is unavailable:
- **HDRI Haven**: https://hdrihaven.com/ (archived, same as Poly Haven)
- **HDRIHub**: https://www.hdrihub.com/
- **sIBL Archive**: http://www.hdrlabs.com/sibl/archive.html

## Technical Specifications

- **Format**: .HDR (Radiance RGBE) or .EXR
- **Projection**: Equirectangular (360° panorama)
- **Bit Depth**: 32-bit float (HDR)
- **Resolution**: 2K (2048x1024) recommended for web
- **Color Space**: Linear (not sRGB)

## Usage in Code

HDRIs are loaded in `/components/XR/EnvironmentSetup.jsx`:

```jsx
<Environment
  files="/hdri/day.hdr"
  background={false}
  intensity={1.0}
/>
```

Time-based switching in `/components/XR/DynamicLighting.js`:
```javascript
const hdriMap = {
  dawn: '/hdri/dawn.hdr',
  day: '/hdri/day.hdr',
  dusk: '/hdri/dusk.hdr',
  night: '/hdri/night.hdr',
};
```
