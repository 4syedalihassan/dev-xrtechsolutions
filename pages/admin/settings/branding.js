import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../components/Admin/AdminLayout';
import { useAuth } from '../../../contexts/AuthContext';

function BrandingSettingsClient() {
  const router = useRouter();
  const { user, session, loading: authLoading } = useAuth();

  // Client-side auth check
  useEffect(() => {
    if (!authLoading && (!user || !['admin', 'super_admin'].includes(user.role))) {
      router.push('/admin/login');
    }
  }, [user, authLoading, router]);
  const [logos, setLogos] = useState({
    primary: null,
    dark: null,
    icon: null,
    email: null,
    favicon: null
  });
  const [previews, setPreviews] = useState({
    primary: null,
    dark: null,
    icon: null,
    email: null,
    favicon: null
  });
  const [uploading, setUploading] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadLogos();
  }, []);

  const loadLogos = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const settings = await response.json();
        setPreviews({
          primary: settings.store_logo || null,
          dark: settings.store_logo_dark || null,
          icon: settings.store_logo_icon || null,
          email: settings.store_logo_email || null,
          favicon: settings.favicon_url || null
        });
      }
    } catch (error) {
      console.error('Error loading logos:', error);
    }
  };

  const handleFileSelect = (type, e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp', 'image/x-icon'];
    if (!validTypes.includes(file.type)) {
      setMessage({ type: 'error', text: 'Invalid file type. Please upload PNG, JPG, SVG, WEBP, or ICO files.' });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File size must be less than 5MB.' });
      return;
    }

    setLogos({ ...logos, [type]: file });

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviews({ ...previews, [type]: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async (type) => {
    const file = logos[type];
    if (!file) {
      setMessage({ type: 'error', text: 'Please select a file first.' });
      return;
    }

    setUploading({ ...uploading, [type]: true });
    setMessage({ type: '', text: '' });

    try {
      // Create FormData with file and type
      const formData = new FormData();
      formData.append('logo', file);
      formData.append('type', type);

      // Upload via server-side API endpoint
      const response = await fetch('/api/settings/logo-upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to upload logo');
      }

      // Map type to user-friendly names
      const typeNames = {
        'primary': 'Light mode',
        'dark': 'Dark mode',
        'icon': 'Icon',
        'email': 'Email',
        'favicon': 'Favicon'
      };
      const typeName = typeNames[type] || type.charAt(0).toUpperCase() + type.slice(1);
      
      setMessage({ type: 'success', text: `${typeName} logo uploaded successfully!` });
      setPreviews({ ...previews, [type]: data.publicUrl });
      setLogos({ ...logos, [type]: null });

      // Reload settings to get updated logo URLs
      await loadLogos();

    } catch (error) {
      console.error('Upload error:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to upload logo.' });
    } finally {
      setUploading({ ...uploading, [type]: false });
    }
  };

  const handleDelete = async (type) => {
    // Map type to user-friendly names
    const typeNames = {
      'primary': 'light mode',
      'dark': 'dark mode',
      'icon': 'icon',
      'email': 'email',
      'favicon': 'favicon'
    };
    const typeName = typeNames[type] || type;
    
    if (!confirm(`Are you sure you want to delete the ${typeName} logo?`)) return;

    try {
      const fieldMapping = {
        'primary': 'store_logo',
        'dark': 'store_logo_dark',
        'icon': 'store_logo_icon',
        'email': 'store_logo_email',
        'favicon': 'favicon_url'
      };
      const fieldName = fieldMapping[type];

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ [fieldName]: null })
      });

      if (!response.ok) throw new Error('Failed to delete logo');

      setMessage({ type: 'success', text: `${typeName.charAt(0).toUpperCase() + typeName.slice(1)} logo deleted successfully!` });
      setPreviews({ ...previews, [type]: null });
      setLogos({ ...logos, [type]: null });

    } catch (error) {
      console.error('Delete error:', error);
      setMessage({ type: 'error', text: 'Failed to delete logo.' });
    }
  };

  const LogoUploadCard = ({ type, title, description, recommended }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        {recommended && (
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            Recommended: {recommended}
          </p>
        )}
      </div>

      {/* Preview */}
      {previews[type] && (
        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-center" style={{ minHeight: '120px' }}>
          <img
            src={previews[type]}
            alt={`${title} preview`}
            className="max-h-24 max-w-full object-contain"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Upload */}
      <div className="space-y-3">
        <input
          type="file"
          accept="image/png,image/jpeg,image/svg+xml,image/webp,image/x-icon"
          onChange={(e) => handleFileSelect(type, e)}
          className="block w-full text-sm text-gray-600 dark:text-gray-400
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-md file:border-0
                     file:text-sm file:font-semibold
                     file:bg-blue-50 file:text-blue-700
                     hover:file:bg-blue-100
                     dark:file:bg-blue-900 dark:file:text-blue-300"
        />

        <div className="flex space-x-2">
          <button
            onClick={() => handleUpload(type)}
            disabled={!logos[type] || uploading[type]}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-sm"
          >
            {uploading[type] ? 'Uploading...' : 'Upload'}
          </button>

          {previews[type] && (
            <button
              onClick={() => handleDelete(type)}
              disabled={uploading[type]}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-sm"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <AdminLayout currentPage="Branding & Logo Management">
      <div className="max-w-6xl">
        {/* Alert Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-100 dark:bg-green-900/20 border border-green-400 dark:border-green-900/30 text-green-700 dark:text-green-400'
              : 'bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-900/30 text-red-700 dark:text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        {/* Info Card */}
        <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30 rounded-lg">
          <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
            📋 Logo Guidelines
          </h2>
          <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-400">
            <li>• <strong>Light Mode Logo:</strong> Logo for light backgrounds (header, homepage)</li>
            <li>• <strong>Dark Mode Logo:</strong> Logo variant for dark mode and dark backgrounds</li>
            <li>• <strong>Icon Logo:</strong> Square logo for app icons, favicons, social media</li>
            <li>• <strong>Email Logo:</strong> Horizontal logo for email templates</li>
            <li>• <strong>Favicon:</strong> ICO file for browser tab icon (16x16, 32x32, 48x48px)</li>
            <li>• <strong>Max file size:</strong> 5MB per logo</li>
            <li>• <strong>Supported formats:</strong> PNG, JPG, SVG, WEBP, ICO</li>
          </ul>
        </div>

        {/* Logo Upload Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LogoUploadCard
            type="primary"
            title="Light Mode Logo"
            description="Logo for light backgrounds and standard usage"
            recommended="Height: 56px (auto-width), Transparent background"
          />

          <LogoUploadCard
            type="dark"
            title="Dark Mode Logo"
            description="Logo variant for dark backgrounds and dark theme"
            recommended="Height: 56px (auto-width), Light-colored design"
          />

          <LogoUploadCard
            type="icon"
            title="Icon / App Logo"
            description="Square logo for app icons and small displays"
            recommended="Size: 512x512px, Square format, Transparent background"
          />

          <LogoUploadCard
            type="email"
            title="Email Logo"
            description="Horizontal logo for email templates and newsletters"
            recommended="Size: 600x100px, Horizontal format"
          />

          <LogoUploadCard
            type="favicon"
            title="Favicon"
            description="Browser tab icon (ICO format preferred)"
            recommended="Size: 32x32px, ICO format with 16x16, 32x32, 48x48"
          />
        </div>

        {/* Preview Section */}
        <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Logo Preview in Context
          </h2>

          {/* Light Background Preview */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Light Background (Admin Header)</h3>
            <div className="p-4 bg-white border border-gray-300 rounded-lg">
              {previews.primary ? (
                <img src={previews.primary} alt="Light mode logo preview" className="h-14 w-auto" />
              ) : (
                <div className="text-gray-400 text-sm">No light mode logo uploaded</div>
              )}
            </div>
          </div>

          {/* Dark Background Preview */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Dark Background (Dark Mode)</h3>
            <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg">
              {previews.dark || previews.primary ? (
                <img src={previews.dark || previews.primary} alt="Dark logo preview" className="h-14 w-auto" />
              ) : (
                <div className="text-gray-400 text-sm">No dark logo uploaded</div>
              )}
            </div>
          </div>

          {/* Icon Preview */}
          <div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Icon/Favicon Preview</h3>
            <div className="p-4 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg flex items-center space-x-4">
              {previews.icon ? (
                <>
                  <img src={previews.icon} alt="Icon 64px" className="h-16 w-16 object-contain" />
                  <img src={previews.icon} alt="Icon 32px" className="h-8 w-8 object-contain" />
                  <img src={previews.icon} alt="Icon 16px" className="h-4 w-4 object-contain" />
                </>
              ) : (
                <div className="text-gray-400 text-sm">No icon uploaded</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

// Export with SSR disabled to prevent router mounting issues during build

export default BrandingSettingsClient;


// Protect admin route - require authentication and admin role
