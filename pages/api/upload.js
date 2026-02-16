// File Upload API - Supabase Storage Integration
// POST /api/upload - Upload images, 3D models, or audio files
// Sprint 1 - User Story 1.3

import { createClient } from '@supabase/supabase-js';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

// Supabase client with service role (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Disable Next.js body parsing (we'll use formidable)
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * File Upload Handler
 * Accepts multipart/form-data with file upload
 * Validates file type and size
 * Uploads to Supabase Storage
 * Tracks upload in database
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST.'
    });
  }

  try {
    // Parse multipart form data
    const { fields, files } = await parseForm(req);

    // Extract metadata from fields
    const fileType = fields.fileType?.[0]; // 'image', '3d_model', 'audio'
    const usedIn = fields.usedIn?.[0]; // 'product', 'building', 'furniture', etc.
    const usedInId = fields.usedInId?.[0]; // UUID of entity
    const customerId = fields.customerId?.[0]; // Optional customer ID

    // Get uploaded file
    const uploadedFile = files.file?.[0];

    if (!uploadedFile) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    // Validate file type
    const validation = validateFile(uploadedFile, fileType);
    if (!validation.valid) {
      // Clean up temp file
      fs.unlinkSync(uploadedFile.filepath);
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }

    // Determine storage bucket
    const bucket = getBucketForFileType(fileType);

    // Generate unique filename
    const ext = path.extname(uploadedFile.originalFilename || uploadedFile.newFilename);
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const filename = `${timestamp}-${randomStr}${ext}`;

    // Determine folder path
    const folder = getFolderPath(usedIn);
    const storagePath = `${folder}${filename}`;

    // Read file buffer
    const fileBuffer = fs.readFileSync(uploadedFile.filepath);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from(bucket)
      .upload(storagePath, fileBuffer, {
        contentType: uploadedFile.mimetype,
        upsert: false
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      fs.unlinkSync(uploadedFile.filepath);
      return res.status(500).json({
        success: false,
        error: 'File upload failed',
        details: uploadError.message
      });
    }

    // Get public URL
    const { data: urlData } = supabase
      .storage
      .from(bucket)
      .getPublicUrl(storagePath);

    const publicUrl = urlData.publicUrl;

    // Track upload in database
    const { data: fileRecord, error: dbError } = await supabase
      .from('uploaded_files')
      .insert({
        filename: filename,
        original_filename: uploadedFile.originalFilename || uploadedFile.newFilename,
        file_type: fileType || detectFileType(uploadedFile.mimetype),
        mime_type: uploadedFile.mimetype,
        file_size: uploadedFile.size,
        storage_bucket: bucket,
        storage_path: storagePath,
        public_url: publicUrl,
        uploaded_by_customer_id: customerId || null,
        uploaded_by_admin: 'system', // TODO: Replace with actual admin user
        used_in: usedIn || null,
        used_in_id: usedInId || null,
        metadata: {
          original_name: uploadedFile.originalFilename,
          upload_timestamp: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database tracking error:', dbError);
      // File uploaded but not tracked - log warning but don't fail
    }

    // Clean up temp file
    fs.unlinkSync(uploadedFile.filepath);

    // Success response
    return res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        id: fileRecord?.id,
        filename: filename,
        originalFilename: uploadedFile.originalFilename,
        publicUrl: publicUrl,
        size: uploadedFile.size,
        mimeType: uploadedFile.mimetype,
        fileType: fileType || detectFileType(uploadedFile.mimetype)
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}

/**
 * Parse multipart form data using formidable
 */
function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = formidable({
      maxFileSize: 50 * 1024 * 1024, // 50MB max
      keepExtensions: true,
      multiples: false
    });

    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });
}

/**
 * Validate file based on type and size
 */
function validateFile(file, fileType) {
  const mimeType = file.mimetype;
  const fileSize = file.size;

  // Define allowed types and size limits
  const rules = {
    image: {
      mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
      maxSize: 5 * 1024 * 1024, // 5MB
      label: 'Images'
    },
    '3d_model': {
      mimeTypes: ['model/gltf-binary', 'model/gltf+json', 'application/octet-stream'],
      maxSize: 50 * 1024 * 1024, // 50MB
      label: '3D models'
    },
    audio: {
      mimeTypes: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/webm'],
      maxSize: 20 * 1024 * 1024, // 20MB
      label: 'Audio files'
    }
  };

  // Auto-detect file type if not provided
  const detectedType = fileType || detectFileType(mimeType);
  const rule = rules[detectedType];

  if (!rule) {
    return {
      valid: false,
      error: `Invalid file type: ${detectedType}. Allowed: image, 3d_model, audio`
    };
  }

  // Check MIME type
  if (!rule.mimeTypes.includes(mimeType)) {
    return {
      valid: false,
      error: `Invalid MIME type for ${rule.label}. Allowed: ${rule.mimeTypes.join(', ')}`
    };
  }

  // Check file size
  if (fileSize > rule.maxSize) {
    const maxMB = (rule.maxSize / (1024 * 1024)).toFixed(0);
    const actualMB = (fileSize / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `File too large. Max ${maxMB}MB for ${rule.label}, got ${actualMB}MB`
    };
  }

  return { valid: true };
}

/**
 * Detect file type from MIME type
 */
function detectFileType(mimeType) {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.startsWith('model/') || mimeType === 'application/octet-stream') return '3d_model';
  if (mimeType.startsWith('video/')) return 'video';
  return 'document';
}

/**
 * Get Supabase storage bucket for file type
 */
function getBucketForFileType(fileType) {
  const buckets = {
    image: 'admin-uploads',
    '3d_model': '3d-models',
    audio: 'audio-files',
    video: 'admin-uploads',
    document: 'admin-uploads'
  };
  return buckets[fileType] || 'admin-uploads';
}

/**
 * Get folder path based on usage
 */
function getFolderPath(usedIn) {
  const folders = {
    product: 'products/',
    building: 'buildings/',
    furniture: 'furniture/',
    customer: 'logos/',
    category: 'categories/',
    settings: 'logos/'
  };
  return folders[usedIn] || '';
}
