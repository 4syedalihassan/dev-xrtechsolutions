/**
 * FileUpload Component
 *
 * A comprehensive, accessible file upload component with:
 * - Drag-and-drop support
 * - File type validation
 * - File size validation
 * - Progress indicator
 * - Preview for images
 * - Multiple file support
 * - Supabase Storage integration
 * - WCAG 2.1 AA compliant
 *
 * Features:
 * - Keyboard accessible (Space/Enter to trigger upload)
 * - Screen reader compatible
 * - ARIA live regions for upload status
 * - Error handling with accessible alerts
 * - File type icons
 * - Thumbnail previews for images
 * - Upload progress tracking
 *
 * WCAG Compliance:
 * - 2.1.1 Keyboard (Level A) - Full keyboard control
 * - 4.1.3 Status Messages (Level AA) - Upload status announced
 * - 1.3.1 Info and Relationships (Level A) - Proper labeling
 * - 1.4.1 Use of Color (Level A) - Status not conveyed by color alone
 *
 * @component
 */

import { useState, useRef, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

export default function FileUpload({
  id,
  label,
  accept = '*',
  maxSize = 10485760, // 10MB default
  multiple = false,
  bucket = 'uploads',
  folder = '',
  onUploadComplete,
  onUploadError,
  allowedTypes = [],
  required = false,
  helpText,
  className = '',
  showPreview = true,
  disabled = false,
}) {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);

  // Validate file type
  const validateFileType = (file) => {
    if (allowedTypes.length === 0) return true;

    const fileExtension = file.name.split('.').pop().toLowerCase();
    const mimeType = file.type.toLowerCase();

    return allowedTypes.some(type => {
      if (type.startsWith('.')) {
        return fileExtension === type.substring(1);
      }
      return mimeType === type || mimeType.startsWith(type.split('/')[0]);
    });
  };

  // Validate file size
  const validateFileSize = (file) => {
    return file.size <= maxSize;
  };

  // Get file icon based on type
  const getFileIcon = (file) => {
    const extension = file.name.split('.').pop().toLowerCase();
    const iconMap = {
      // Images
      jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️', svg: '🖼️', webp: '🖼️',
      // Documents
      pdf: '📄', doc: '📝', docx: '📝', txt: '📃',
      // 3D Models
      gltf: '🧊', glb: '🧊', obj: '🧊', fbx: '🧊', dae: '🧊',
      // Archives
      zip: '🗜️', rar: '🗜️', '7z': '🗜️',
      // Video
      mp4: '🎥', mov: '🎥', avi: '🎥', mkv: '🎥',
      // Audio
      mp3: '🎵', wav: '🎵', ogg: '🎵',
    };
    return iconMap[extension] || '📁';
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Handle file selection
  const handleFileSelect = useCallback((selectedFiles) => {
    const newFiles = Array.from(selectedFiles);
    const validationErrors = [];

    const validatedFiles = newFiles.map((file, index) => {
      const fileId = `${Date.now()}-${index}`;
      const errors = [];

      if (!validateFileType(file)) {
        errors.push(`Invalid file type: ${file.name}`);
        validationErrors.push(`${file.name}: Invalid file type`);
      }

      if (!validateFileSize(file)) {
        errors.push(`File too large: ${file.name} (max ${formatFileSize(maxSize)})`);
        validationErrors.push(`${file.name}: File exceeds ${formatFileSize(maxSize)}`);
      }

      return {
        id: fileId,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        errors,
        status: errors.length > 0 ? 'error' : 'pending',
      };
    });

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
    } else {
      setErrors([]);
    }

    if (multiple) {
      setFiles(prev => [...prev, ...validatedFiles.filter(f => f.status !== 'error')]);
    } else {
      setFiles(validatedFiles.filter(f => f.status !== 'error'));
    }
  }, [multiple, maxSize, allowedTypes]);

  // Handle drag events
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles);
    }
  }, [handleFileSelect]);

  // Handle input change
  const handleInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files);
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  // Handle keyboard interaction
  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      triggerFileInput();
    }
  };

  // Helper: Calculate dynamic timeout based on file size
  const calculateUploadTimeout = (fileSize) => {
    // Use conservative upload speed (100 KB/s) with 50% safety margin
    const assumedUploadSpeedBytesPerSec = 100 * 1024;
    const estimatedUploadTimeMs = (fileSize / assumedUploadSpeedBytesPerSec) * 1000;
    const timeoutWithMarginMs = estimatedUploadTimeMs * 1.5; // 50% safety margin
    const minTimeoutMs = 60000; // 60 seconds minimum
    const maxTimeoutMs = 600000; // 10 minutes maximum
    const effectiveTimeoutMs = Math.min(
      maxTimeoutMs,
      Math.max(minTimeoutMs, timeoutWithMarginMs)
    );
    const timeoutSeconds = Math.round(effectiveTimeoutMs / 1000);
    
    return new Promise((_, reject) => 
      setTimeout(
        () => reject(new Error(
          `Upload timeout after ${timeoutSeconds} seconds. ` +
          'Please try again with a smaller file or a faster connection.'
        )),
        effectiveTimeoutMs
      )
    );
  };

  // Helper: Start primary progress simulation (0-90%)
  const startPrimaryProgressSimulation = (id, fileSize) => {
    const BYTES_PER_SECOND_ESTIMATE = 100000;
    const estimatedTime = Math.max(fileSize / BYTES_PER_SECOND_ESTIMATE, 1);
    const totalSteps = 18; // 0% to 90% in 18 steps (5% increments)
    const stepDuration = (estimatedTime * 1000) / totalSteps;
    
    let simulatedProgress = 0;
    const interval = setInterval(() => {
      simulatedProgress = Math.min(simulatedProgress + 5, 90);
      setUploadProgress(prev => ({ ...prev, [id]: simulatedProgress }));
      
      if (simulatedProgress >= 90) {
        clearInterval(interval);
      }
    }, stepDuration);
    
    return { interval, simulationDuration: totalSteps * stepDuration };
  };

  // Helper: Start secondary progress tracking (95-99%)
  const startSecondaryProgressTracking = (id, fileName) => {
    console.log(`[FileUpload] Starting secondary interval for ${fileName}`);
    let uploadProgress = 95;
    
    const interval = setInterval(() => {
      if (uploadProgress >= 99) return;
      
      const increment = uploadProgress < 98 ? 0.5 : 0.25;
      uploadProgress = Math.min(uploadProgress + increment, 99);
      
      // Only log at key milestones to reduce console noise
      if (uploadProgress === 96 || uploadProgress === 98 || uploadProgress === 99) {
        console.log(`[FileUpload] Progress: ${uploadProgress}% for ${fileName}`);
      }
      
      setUploadProgress(prev => ({ ...prev, [id]: uploadProgress }));
    }, 2000);
    
    return interval;
  };

  // Helper: Perform upload with timeout handling
  const performUploadWithTimeout = async (uploadPromise, uploadTimeout, fileName) => {
    console.log(`[FileUpload] Awaiting upload completion for ${fileName}...`);
    
    try {
      const uploadResult = await Promise.race([uploadPromise, uploadTimeout]);
      // Supabase returns { data, error } structure
      const error = uploadResult?.error || null;
      console.log(`[FileUpload] Upload ${error ? 'failed' : 'completed'} for ${fileName}`, error || '');
      return { uploadResult, error };
    } catch (err) {
      // Timeout or other rejection
      console.log(`[FileUpload] Upload failed for ${fileName}`, err);
      return { uploadResult: null, error: err };
    }
  };

  // Helper: Handle successful upload
  const handleUploadSuccess = (id, publicUrl, fileName, fileObj) => {
    setFiles(prev => prev.map(f =>
      f.id === id ? { ...f, status: 'success', url: publicUrl, path: fileName } : f
    ));
    
    console.log(`[FileUpload] Setting progress to 100% for ${fileObj.name}`);
    setUploadProgress(prev => ({ ...prev, [id]: 100 }));

    if (onUploadComplete) {
      onUploadComplete({ ...fileObj, url: publicUrl, path: fileName });
    }

    return { success: true, url: publicUrl, path: fileName };
  };

  // Helper: Handle upload error
  const handleUploadError = (id, error) => {
    console.error('Upload error:', error);
    
    setFiles(prev => prev.map(f =>
      f.id === id ? { ...f, status: 'error', errors: [error.message] } : f
    ));

    if (onUploadError) {
      onUploadError(error);
    }

    return { success: false, error: error.message };
  };

  // Upload file to Supabase
  const uploadFile = async (fileObj) => {
    const { file, id } = fileObj;
    const fileName = `${folder ? folder + '/' : ''}${Date.now()}-${file.name}`;
    let progressInterval = null;
    let secondaryInterval = null;

    try {
      // Update status to uploading
      setFiles(prev => prev.map(f =>
        f.id === id ? { ...f, status: 'uploading' } : f
      ));

      // Start primary progress simulation (0-90%)
      const { interval, simulationDuration } = startPrimaryProgressSimulation(id, file.size);
      progressInterval = interval;

      // Start the actual upload immediately
      const uploadPromise = supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      // Wait for either upload or simulation to complete
      const raceResult = await Promise.race([
        uploadPromise,
        new Promise(resolve => setTimeout(resolve, simulationDuration))
      ]);
      
      // Clear the primary interval
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      
      // Check if upload already failed during Promise.race
      if (raceResult?.error) {
        console.log(`[FileUpload] Upload failed early for ${file.name}:`, raceResult.error);
        throw raceResult.error;
      }
      
      // Set progress to 95% and start secondary tracking
      console.log(`[FileUpload] Setting progress to 95% for ${file.name}`);
      setUploadProgress(prev => ({ ...prev, [id]: 95 }));
      await new Promise(resolve => setTimeout(resolve, 100)); // Let React render
      
      secondaryInterval = startSecondaryProgressTracking(id, file.name);
      
      // Await upload completion with timeout
      const uploadTimeout = calculateUploadTimeout(file.size);
      const { error } = await performUploadWithTimeout(uploadPromise, uploadTimeout, file.name);
      
      // Clear secondary interval
      if (secondaryInterval) {
        clearInterval(secondaryInterval);
        secondaryInterval = null;
      }

      if (error) throw error;

      // Get public URL and handle success
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return handleUploadSuccess(id, publicUrl, fileName, fileObj);
      
    } catch (error) {
      return handleUploadError(id, error);
    } finally {
      // Always clear intervals to prevent memory leaks
      if (progressInterval) clearInterval(progressInterval);
      if (secondaryInterval) clearInterval(secondaryInterval);
    }
  };

  // Upload all pending files
  const handleUploadAll = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');

    for (const fileObj of pendingFiles) {
      await uploadFile(fileObj);
    }
  };

  // Remove file
  const handleRemoveFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[id];
      return newProgress;
    });
  };

  return (
    <div className={`file-upload-container ${className}`}>
      {/* Label */}
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
          {required && <span aria-label="required" className="text-danger"> *</span>}
        </label>
      )}

      {/* Help Text */}
      {helpText && (
        <p id={`${id}-help`} className="form-help-text">
          {helpText}
        </p>
      )}

      {/* Drop Zone */}
      <div
        className={`file-dropzone ${isDragging ? 'dragging' : ''} ${disabled ? 'disabled' : ''}`}
        onDragOver={disabled ? undefined : handleDragOver}
        onDragLeave={disabled ? undefined : handleDragLeave}
        onDrop={disabled ? undefined : handleDrop}
        onClick={disabled ? undefined : triggerFileInput}
        onKeyDown={disabled ? undefined : handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-label={`Upload ${multiple ? 'files' : 'file'}. ${label || ''}`}
        aria-describedby={helpText ? `${id}-help` : undefined}
        aria-disabled={disabled}
      >
        <div className="dropzone-content">
          <span className="dropzone-icon" aria-hidden="true">📤</span>
          <p className="dropzone-text">
            {disabled ? 'Upload disabled in view mode' : `Drag and drop ${multiple ? 'files' : 'a file'} here, or click to browse`}
          </p>
          {!disabled && (
            <p className="dropzone-subtext">
              {allowedTypes.length > 0 && `Allowed: ${allowedTypes.join(', ')}`}
              {allowedTypes.length > 0 && ' • '}
              Max size: {formatFileSize(maxSize)}
            </p>
          )}
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleInputChange}
        className="file-input-hidden"
        aria-hidden="true"
        tabIndex={-1}
        disabled={disabled}
      />

      {/* Errors */}
      {errors.length > 0 && (
        <div role="alert" aria-live="assertive" className="file-upload-errors">
          {errors.map((error, index) => (
            <p key={index} className="form-error-text">{error}</p>
          ))}
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="file-list" role="region" aria-label="Selected files">
          {files.map((fileObj) => (
            <div key={fileObj.id} className={`file-item file-status-${fileObj.status}`}>
              {/* Preview or Icon */}
              <div className="file-preview">
                {showPreview && fileObj.preview ? (
                  <img src={fileObj.preview} alt={`Preview of ${fileObj.name}`} className="file-thumbnail" />
                ) : (
                  <span className="file-icon" aria-hidden="true">{getFileIcon(fileObj.file)}</span>
                )}
              </div>

              {/* File Info */}
              <div className="file-info">
                <p className="file-name">{fileObj.name}</p>
                <p className="file-size">{formatFileSize(fileObj.size)}</p>

                {/* Status */}
                <div className="file-status" aria-live="polite">
                  {fileObj.status === 'pending' && <span className="status-badge status-pending">Ready</span>}
                  {fileObj.status === 'uploading' && (
                    <span className="status-badge status-uploading">
                      Uploading {Math.min(99, Math.round(uploadProgress[fileObj.id] || 0))}%
                    </span>
                  )}
                  {fileObj.status === 'success' && <span className="status-badge status-success">✓ Uploaded</span>}
                  {fileObj.status === 'error' && <span className="status-badge status-error">✕ Failed</span>}
                </div>

                {/* Progress Bar */}
                {fileObj.status === 'uploading' && (
                  <div className="file-progress-bar">
                    <div
                      className="file-progress-fill"
                      style={{ width: `${Math.min(99, uploadProgress[fileObj.id] || 0)}%` }}
                      role="progressbar"
                      aria-valuenow={Math.min(99, Math.round(uploadProgress[fileObj.id] || 0))}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    />
                  </div>
                )}
              </div>

              {/* Remove Button */}
              <button
                type="button"
                className="file-remove-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile(fileObj.id);
                }}
                aria-label={`Remove ${fileObj.name}`}
                disabled={fileObj.status === 'uploading'}
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {files.length > 0 && files.some(f => f.status === 'pending') && !disabled && (
        <button
          type="button"
          className="btn btn-primary btn-upload-all"
          onClick={handleUploadAll}
          aria-label={`Upload ${files.filter(f => f.status === 'pending').length} file(s)`}
        >
          Upload {files.filter(f => f.status === 'pending').length} file(s)
        </button>
      )}
    </div>
  );
}

/**
 * Usage Examples:
 *
 * // Image upload
 * <FileUpload
 *   id="product-image"
 *   label="Product Image"
 *   accept="image/*"
 *   allowedTypes={['.jpg', '.jpeg', '.png', '.webp']}
 *   maxSize={5242880} // 5MB
 *   bucket="product-images"
 *   folder="products"
 *   onUploadComplete={(file) => console.log('Uploaded:', file)}
 *   showPreview={true}
 *   helpText="Upload a product image (JPG, PNG, WebP, max 5MB)"
 *   required
 * />
 *
 * // 3D Model upload
 * <FileUpload
 *   id="furniture-model"
 *   label="3D Model"
 *   accept=".gltf,.glb,.obj,.fbx"
 *   allowedTypes={['.gltf', '.glb', '.obj', '.fbx']}
 *   maxSize={52428800} // 50MB
 *   bucket="3d-models"
 *   folder="furniture"
 *   onUploadComplete={(file) => console.log('Model uploaded:', file)}
 *   helpText="Upload 3D model file (GLTF, GLB, OBJ, FBX, max 50MB)"
 *   showPreview={false}
 * />
 *
 * // Multiple file upload
 * <FileUpload
 *   id="session-materials"
 *   label="Session Materials"
 *   multiple={true}
 *   accept=".pdf,.doc,.docx,.ppt,.pptx"
 *   allowedTypes={['.pdf', '.doc', '.docx', '.ppt', '.pptx']}
 *   maxSize={10485760} // 10MB
 *   bucket="session-materials"
 *   folder="healthcare-sessions"
 *   onUploadComplete={(file) => console.log('Material uploaded:', file)}
 *   helpText="Upload presentation materials (PDF, DOC, PPT, max 10MB each)"
 * />
 */
