import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../components/Admin/AdminLayout';
import { useAuth } from '../../../contexts/AuthContext';

function AnalyticsSettingsClient() {
  const router = useRouter();
  const { user, session, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Client-side auth check
  useEffect(() => {
    if (!authLoading && (!user || !['admin', 'super_admin'].includes(user.role))) {
      router.push('/admin/login');
    }
  }, [user, authLoading, router]);

  const [settings, setSettings] = useState({
    google_analytics_enabled: false,
    google_analytics_id: '',
    google_analytics_measurement_id: '',
    google_adsense_enabled: false,
    google_adsense_publisher_id: '',
    google_adsense_auto_ads: true,
    meta_pixel_enabled: false,
    meta_pixel_id: ''
  });

  useEffect(() => {
    if (user && session) {
      loadSettings();
    }
  }, [user, session]);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();

      setSettings({
        google_analytics_enabled: data.google_analytics_enabled || false,
        google_analytics_id: data.google_analytics_id || '',
        google_analytics_measurement_id: data.google_analytics_measurement_id || '',
        google_adsense_enabled: data.google_adsense_enabled || false,
        google_adsense_publisher_id: data.google_adsense_publisher_id || '',
        google_adsense_auto_ads: data.google_adsense_auto_ads !== false,
        meta_pixel_enabled: data.meta_pixel_enabled || false,
        meta_pixel_id: data.meta_pixel_id || ''
      });

      setLoading(false);
    } catch (error) {
      console.error('Error loading settings:', error);
      showMessage('error', 'Failed to load settings');
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(settings)
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('success', 'Analytics settings saved successfully! Reload the page to see changes take effect.');
      } else {
        showMessage('error', data.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showMessage('error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout currentPage="Settings">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="spinner"></div>
          <p>Loading settings...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="Settings">
      <div className="settings-container">
        <div className="settings-header">
          <h1>Analytics & Tracking Settings</h1>
          <p>Configure Google Analytics, AdSense, and other tracking integrations</p>
        </div>

        {message.text && (
          <div className={`message message-${message.type}`} role="alert">
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave}>
          {/* Google Analytics Section */}
          <div className="settings-section">
            <div className="section-header">
              <h2>Google Analytics</h2>
              <p>Track visitor behavior and site performance</p>
            </div>

            <div className="form-group">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={settings.google_analytics_enabled}
                  onChange={(e) => handleChange('google_analytics_enabled', e.target.checked)}
                />
                <span>Enable Google Analytics</span>
              </label>
            </div>

            {settings.google_analytics_enabled && (
              <>
                <div className="form-group">
                  <label>
                    Universal Analytics Tracking ID (Legacy)
                    <span className="optional">Optional</span>
                  </label>
                  <input
                    type="text"
                    value={settings.google_analytics_id}
                    onChange={(e) => handleChange('google_analytics_id', e.target.value)}
                    placeholder="UA-XXXXXXXXX-X"
                    className="form-input"
                  />
                  <small>Format: UA-XXXXXXXXX-X</small>
                </div>

                <div className="form-group">
                  <label>
                    Google Analytics 4 Measurement ID
                    <span className="recommended">Recommended</span>
                  </label>
                  <input
                    type="text"
                    value={settings.google_analytics_measurement_id}
                    onChange={(e) => handleChange('google_analytics_measurement_id', e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                    className="form-input"
                  />
                  <small>Format: G-XXXXXXXXXX (Get this from Google Analytics admin panel)</small>
                </div>

                <div className="info-box">
                  <strong>How to get your Measurement ID:</strong>
                  <ol>
                    <li>Go to Google Analytics</li>
                    <li>Select your property</li>
                    <li>Admin → Data Streams → Your web stream</li>
                    <li>Copy the Measurement ID (starts with G-)</li>
                  </ol>
                </div>
              </>
            )}
          </div>

          {/* Google AdSense Section */}
          <div className="settings-section">
            <div className="section-header">
              <h2>Google AdSense</h2>
              <p>Monetize your site with Google ads</p>
            </div>

            <div className="form-group">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={settings.google_adsense_enabled}
                  onChange={(e) => handleChange('google_adsense_enabled', e.target.checked)}
                />
                <span>Enable Google AdSense</span>
              </label>
            </div>

            {settings.google_adsense_enabled && (
              <>
                <div className="form-group">
                  <label>
                    AdSense Publisher ID
                    <span className="required">Required</span>
                  </label>
                  <input
                    type="text"
                    value={settings.google_adsense_publisher_id}
                    onChange={(e) => handleChange('google_adsense_publisher_id', e.target.value)}
                    placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                    className="form-input"
                    required={settings.google_adsense_enabled}
                  />
                  <small>Format: ca-pub-XXXXXXXXXXXXXXXX</small>
                </div>

                <div className="form-group">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={settings.google_adsense_auto_ads}
                      onChange={(e) => handleChange('google_adsense_auto_ads', e.target.checked)}
                    />
                    <span>Enable Auto Ads</span>
                  </label>
                  <small>Let Google automatically place ads on your site</small>
                </div>

                <div className="info-box">
                  <strong>How to get your Publisher ID:</strong>
                  <ol>
                    <li>Go to Google AdSense</li>
                    <li>Account → Settings</li>
                    <li>Copy your Publisher ID (ca-pub-XXXXXXXXXXXXXXXX)</li>
                  </ol>
                </div>
              </>
            )}
          </div>

          {/* Meta Pixel Section */}
          <div className="settings-section">
            <div className="section-header">
              <h2>Meta (Facebook) Pixel</h2>
              <p>Track conversions and build audiences for Facebook/Instagram ads</p>
            </div>

            <div className="form-group">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={settings.meta_pixel_enabled}
                  onChange={(e) => handleChange('meta_pixel_enabled', e.target.checked)}
                />
                <span>Enable Meta Pixel</span>
              </label>
            </div>

            {settings.meta_pixel_enabled && (
              <>
                <div className="form-group">
                  <label>
                    Meta Pixel ID
                    <span className="required">Required</span>
                  </label>
                  <input
                    type="text"
                    value={settings.meta_pixel_id}
                    onChange={(e) => handleChange('meta_pixel_id', e.target.value)}
                    placeholder="XXXXXXXXXXXXXXXX"
                    className="form-input"
                    required={settings.meta_pixel_enabled}
                  />
                  <small>Your 15-16 digit Pixel ID</small>
                </div>

                <div className="info-box">
                  <strong>How to get your Pixel ID:</strong>
                  <ol>
                    <li>Go to Meta Events Manager</li>
                    <li>Select your Pixel</li>
                    <li>Copy the Pixel ID from the top</li>
                  </ol>
                </div>
              </>
            )}
          </div>

          {/* Save Button */}
          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Analytics Settings'}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .settings-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem;
        }

        .settings-header {
          margin-bottom: 2rem;
        }

        .settings-header h1 {
          font-size: 2rem;
          color: #2d3142;
          margin-bottom: 0.5rem;
        }

        .settings-header p {
          color: #6c757d;
          font-size: 1rem;
        }

        .message {
          padding: 1rem 1.5rem;
          border-radius: 8px;
          margin-bottom: 2rem;
          font-weight: 500;
        }

        .message-success {
          background: #d4edda;
          color: #155724;
          border-left: 4px solid #28a745;
        }

        .message-error {
          background: #f8d7da;
          color: #721c24;
          border-left: 4px solid #dc3545;
        }

        .settings-section {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .section-header {
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #f0f0f0;
        }

        .section-header h2 {
          font-size: 1.5rem;
          color: #2d3142;
          margin-bottom: 0.5rem;
        }

        .section-header p {
          color: #6c757d;
          font-size: 0.95rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          font-weight: 600;
          color: #2d3142;
          margin-bottom: 0.5rem;
        }

        .form-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid #e1e8ed;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.2s;
        }

        .form-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .toggle-label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .toggle-label:hover {
          background: #e9ecef;
        }

        .toggle-label input[type="checkbox"] {
          width: 20px;
          height: 20px;
          cursor: pointer;
        }

        .toggle-label span {
          font-weight: 600;
          color: #2d3142;
        }

        small {
          display: block;
          color: #6c757d;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }

        .optional {
          color: #6c757d;
          font-size: 0.85rem;
          font-weight: normal;
          margin-left: 0.5rem;
        }

        .recommended {
          color: #28a745;
          font-size: 0.85rem;
          font-weight: 600;
          margin-left: 0.5rem;
        }

        .required {
          color: #dc3545;
          font-size: 0.85rem;
          font-weight: 600;
          margin-left: 0.5rem;
        }

        .info-box {
          background: #e7f3ff;
          border-left: 4px solid #667eea;
          padding: 1.25rem;
          border-radius: 8px;
          margin-top: 1.5rem;
        }

        .info-box strong {
          display: block;
          color: #2d3142;
          margin-bottom: 0.75rem;
        }

        .info-box ol {
          margin: 0;
          padding-left: 1.5rem;
          color: #495057;
        }

        .info-box li {
          margin-bottom: 0.5rem;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 2px solid #f0f0f0;
        }

        .btn {
          padding: 0.875rem 2rem;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .settings-container {
            padding: 1rem;
          }

          .settings-section {
            padding: 1.5rem;
          }

          .form-actions {
            flex-direction: column;
          }

          .btn {
            width: 100%;
          }
        }
      `}</style>
    </AdminLayout>
  );
}

export default AnalyticsSettingsClient;

// Protect admin route - require authentication and admin role
