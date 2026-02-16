// =====================================================
// API: Settings Logo Upload
// Endpoint: /api/settings/logo-upload
// Method: POST
// Description: Server-side logo upload with service role key
// =====================================================

import { createClient } from '@supabase/supabase-js';
import formidable from 'formidable';
import fs from 'fs';

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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse multipart form data
    const form = formidable({
      maxFileSize: 5 * 1024 * 1024, // 5MB
      allowEmptyFiles: false,
      filter: ({ mimetype }) => {
        // Allow images and icons
        return mimetype && (
          mimetype.startsWith('image/') ||
          mimetype === 'image/x-icon'
        );
      }
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    // Get uploaded file and logo type
    const logoFile = files.logo;
    const logoType = Array.isArray(fields.type) ? fields.type[0] : fields.type;

    if (!logoFile || logoFile.length === 0) {
      return res.status(400).json({ error: 'No logo file provided' });
    }

    if (!logoType) {
      return res.status(400).json({ error: 'Logo type is required' });
    }

    const file = Array.isArray(logoFile) ? logoFile[0] : logoFile;

    // Validate file type
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
      'image/svg+xml', 'image/webp', 'image/x-icon'
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        error: 'Invalid file type. Allowed: JPEG, PNG, GIF, SVG, WebP, ICO'
      });
    }

    // Read file buffer
    const fileBuffer = fs.readFileSync(file.filepath);

    // Generate filename
    const ext = file.originalFilename ? file.originalFilename.split('.').pop() : 'jpg';
    const timestamp = Date.now();
    const fileName = `${timestamp}-Logo-XRTechMart-${logoType.charAt(0).toUpperCase() + logoType.slice(1)}.${ext}`;
    const filePath = `branding/${fileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('company-assets')
      .upload(filePath, fileBuffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return res.status(500).json({
        error: 'Failed to upload logo',
        details: uploadError.message
      });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('company-assets')
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;

    // Update settings with new logo URL
    const fieldMapping = {
      'primary': 'store_logo',
      'dark': 'store_logo_dark',
      'icon': 'store_logo_icon',
      'email': 'store_logo_email',
      'favicon': 'favicon_url'
    };
    const fieldName = fieldMapping[logoType];

    if (!fieldName) {
      return res.status(400).json({ error: 'Invalid logo type' });
    }

    // Update settings via internal function
    const dbFieldMapping = {
      'store_logo': 'platform_logo',
      'store_logo_dark': 'platform_logo_dark',
      'store_logo_icon': 'platform_logo_icon',
      'store_logo_email': 'platform_logo_email',
      'favicon_url': 'favicon_url'
    };
    const dbFieldName = dbFieldMapping[fieldName];

    const { data: existing } = await supabase
      .from('platform_settings')
      .select('id')
      .single();

    if (existing) {
      const { error: updateError } = await supabase
        .from('platform_settings')
        .update({ [dbFieldName]: publicUrl })
        .eq('id', existing.id);

      if (updateError) {
        console.error('Settings update error:', updateError);
        return res.status(500).json({
          error: 'Logo uploaded but failed to update settings',
          details: updateError.message
        });
      }
    } else {
      const { error: insertError } = await supabase
        .from('platform_settings')
        .insert({ [dbFieldName]: publicUrl });

      if (insertError) {
        console.error('Settings insert error:', insertError);
        return res.status(500).json({
          error: 'Logo uploaded but failed to create settings',
          details: insertError.message
        });
      }
    }

    // Clean up temp file
    fs.unlinkSync(file.filepath);

    return res.status(200).json({
      success: true,
      message: 'Logo uploaded successfully',
      publicUrl: publicUrl,
      filePath: filePath
    });

  } catch (error) {
    console.error('Logo upload error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}
