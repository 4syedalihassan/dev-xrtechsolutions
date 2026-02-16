// =====================================================
// API: Building Logo Upload & Management
// Endpoint: /api/buildings/[id]/logo
// Methods: POST (upload), DELETE (remove)
// Sprint: Phase 2.4.1 - Advanced Signboard Management
// =====================================================

import { createClient } from '@supabase/supabase-js';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Disable default body parser for file uploads
export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req, res) {
  const { id } = req.query;

  // Validate building ID
  if (!id) {
    return res.status(400).json({
      success: false,
      error: 'Building ID is required'
    });
  }

  try {
    switch (req.method) {
      case 'POST':
        return await uploadLogo(req, res, id);

      case 'DELETE':
        return await deleteLogo(req, res, id);

      default:
        return res.status(405).json({
          success: false,
          error: `Method ${req.method} not allowed`
        });
    }
  } catch (error) {
    console.error('Logo API error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
}

/**
 * POST /api/buildings/[id]/logo
 * Upload logo file to Supabase Storage
 */
async function uploadLogo(req, res, buildingId) {
  try {
    // Verify building exists
    const { data: building, error: buildingError } = await supabase
      .from('buildings')
      .select('id, name')
      .eq('id', buildingId)
      .single();

    if (buildingError || !building) {
      return res.status(404).json({
        success: false,
        error: 'Building not found'
      });
    }

    // Parse multipart form data
    const form = formidable({
      maxFileSize: 5 * 1024 * 1024, // 5MB
      allowEmptyFiles: false,
      filter: ({ mimetype }) => {
        // Only allow images
        return mimetype && mimetype.startsWith('image/');
      }
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    // Get uploaded file
    const logoFile = files.logo;
    if (!logoFile || logoFile.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No logo file provided'
      });
    }

    const file = Array.isArray(logoFile) ? logoFile[0] : logoFile;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid file type. Allowed: JPEG, PNG, GIF, SVG, WebP'
      });
    }

    // Read file buffer
    const fileBuffer = fs.readFileSync(file.filepath);

    // Generate unique filename
    const ext = path.extname(file.originalFilename || file.newFilename);
    const timestamp = Date.now();
    const filename = `logo-${timestamp}${ext}`;
    const filePath = `${buildingId}/${filename}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('building-logos')
      .upload(filePath, fileBuffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return res.status(500).json({
        success: false,
        error: 'Failed to upload logo',
        details: uploadError.message
      });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('building-logos')
      .getPublicUrl(filePath);

    const logoUrl = urlData.publicUrl;

    // Update building signboard config with logo URL
    const { data: currentBuilding } = await supabase
      .from('buildings')
      .select('signboard_config')
      .eq('id', buildingId)
      .single();

    const currentConfig = currentBuilding?.signboard_config || {};
    const newConfig = {
      ...currentConfig,
      logo_url: logoUrl
    };

    // Update both signboard_config AND logo_url field for consistency
    // This ensures both BuildingSignboard and DigitalSignage components can access the logo
    const { error: updateError } = await supabase
      .from('buildings')
      .update({
        signboard_config: newConfig,
        logo_url: logoUrl  // Also update simple logo_url field
      })
      .eq('id', buildingId);

    if (updateError) {
      console.error('Failed to update building config:', updateError);
      // Don't fail - logo is already uploaded
    }

    // Clean up temp file
    fs.unlinkSync(file.filepath);

    return res.status(200).json({
      success: true,
      message: 'Logo uploaded successfully',
      logo_url: logoUrl,
      file_path: filePath,
      file_size: file.size,
      mime_type: file.mimetype
    });

  } catch (error) {
    console.error('Error uploading logo:', error);
    throw error;
  }
}

/**
 * DELETE /api/buildings/[id]/logo
 * Remove logo from Supabase Storage and building config
 */
async function deleteLogo(req, res, buildingId) {
  try {
    // Fetch current building config
    const { data: building, error: fetchError } = await supabase
      .from('buildings')
      .select('signboard_config')
      .eq('id', buildingId)
      .single();

    if (fetchError) {
      return res.status(404).json({
        success: false,
        error: 'Building not found'
      });
    }

    const currentConfig = building.signboard_config || {};
    const logoUrl = currentConfig.logo_url;

    if (!logoUrl) {
      return res.status(404).json({
        success: false,
        error: 'No logo to delete'
      });
    }

    // Extract file path from URL
    // URL format: https://xxx.supabase.co/storage/v1/object/public/building-logos/uuid/filename.ext
    const urlParts = logoUrl.split('/building-logos/');
    if (urlParts.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Invalid logo URL format'
      });
    }

    const filePath = urlParts[1];

    // Delete from storage
    const { error: deleteError } = await supabase.storage
      .from('building-logos')
      .remove([filePath]);

    if (deleteError) {
      console.error('Storage delete error:', deleteError);
      // Continue anyway to update config
    }

    // Update building config to remove logo URL
    const newConfig = {
      ...currentConfig,
      logo_url: null
    };

    // Update both signboard_config AND logo_url field for consistency
    const { error: updateError } = await supabase
      .from('buildings')
      .update({
        signboard_config: newConfig,
        logo_url: null  // Also clear simple logo_url field
      })
      .eq('id', buildingId);

    if (updateError) {
      throw updateError;
    }

    return res.status(200).json({
      success: true,
      message: 'Logo deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting logo:', error);
    throw error;
  }
}

// =====================================================
// USAGE EXAMPLES
// =====================================================

/**
 * POST Request - Upload logo (multipart/form-data):
 *
 * const formData = new FormData();
 * formData.append('logo', file);
 *
 * fetch('/api/buildings/uuid-here/logo', {
 *   method: 'POST',
 *   body: formData
 * })
 *   .then(res => res.json())
 *   .then(data => {
 *     console.log('Logo URL:', data.logo_url);
 *   });
 */

/**
 * DELETE Request - Remove logo:
 *
 * fetch('/api/buildings/uuid-here/logo', {
 *   method: 'DELETE'
 * })
 *   .then(res => res.json())
 *   .then(data => {
 *     console.log(data.message);
 *   });
 */
