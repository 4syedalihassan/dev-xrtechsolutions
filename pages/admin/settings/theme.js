import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../components/Admin/AdminLayout';
import { useAuth } from '../../../contexts/AuthContext';

function ThemeSettingsClient() {
  const router = useRouter();
  const { user, session, loading: authLoading } = useAuth();

  // Client-side auth check
  useEffect(() => {
    if (!authLoading && (!user || !['admin', 'super_admin'].includes(user.role))) {
      router.push('/admin/login');
    }
  }, [user, authLoading, router]);
  const [settings, setSettings] = useState(null);
  const [themeConfig, setThemeConfig] = useState({
    primaryColor: '#667eea',
    secondaryColor: '#764ba2',
    accentColor: '#00BCD4',
    successColor: '#27ae60',
    warningColor: '#f39c12',
    errorColor: '#e74c3c',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    buttonStyle: 'rounded',
    buttonVariant: 'solid'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fontOptions = [
    { value: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', label: 'System Default' },
    { value: '"Inter", sans-serif', label: 'Inter' },
    { value: '"Roboto", sans-serif', label: 'Roboto' },
    { value: '"Poppins", sans-serif', label: 'Poppins' },
    { value: '"Montserrat", sans-serif', label: 'Montserrat' },
    { value: '"Open Sans", sans-serif', label: 'Open Sans' },
    { value: '"Lato", sans-serif', label: 'Lato' },
    { value: 'Georgia, serif', label: 'Georgia (Serif)' },
    { value: '"Playfair Display", serif', label: 'Playfair Display' }
  ];

  useEffect(() => {
    if (user && session) {
      loadSettings();
    }
  }, [user, session]);

  useEffect(() => {
    // Apply theme preview in real-time
    if (themeConfig) {
      applyThemePreview(themeConfig);
    }
  }, [themeConfig]);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      setSettings(data);

      if (data.theme_config) {
        setThemeConfig(data.theme_config);
      }
    } catch (error) {
      showMessage('error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const applyThemePreview = (theme) => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      // Map theme settings to Unified Theme variables
      root.style.setProperty('--primary-500', theme.primaryColor);
      root.style.setProperty('--color-primary', theme.primaryColor);

      // Secondary maps to gray/slate usually, but we'll map to specific tokens
      root.style.setProperty('--color-secondary', theme.secondaryColor);

      // Accent color
      root.style.setProperty('--accent-color', theme.accentColor); // Keeping this if used elsewhere

      // Status colors - mapping to the main 600 shade and the semantic token
      root.style.setProperty('--success-600', theme.successColor);
      root.style.setProperty('--color-success', theme.successColor);

      root.style.setProperty('--warning-600', theme.warningColor);
      root.style.setProperty('--color-warning', theme.warningColor);

      root.style.setProperty('--error-600', theme.errorColor);
      root.style.setProperty('--color-danger', theme.errorColor); // Note: Unified uses color-danger

      root.style.setProperty('--font-family', theme.fontFamily);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
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
        body: JSON.stringify({
          ...settings,
          theme_config: themeConfig
        })
      });

      const data = await response.json();

      if (data.success) {
        showMessage('success', 'Theme settings saved successfully! Changes will apply to all pages.');
        setSettings({ ...settings, theme_config: themeConfig });
      } else {
        showMessage('error', 'Failed to save theme settings');
      }
    } catch (error) {
      showMessage('error', 'Failed to save theme settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    const defaultTheme = {
      primaryColor: '#667eea',
      secondaryColor: '#764ba2',
      accentColor: '#00BCD4',
      successColor: '#27ae60',
      warningColor: '#f39c12',
      errorColor: '#e74c3c',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      buttonStyle: 'rounded',
      buttonVariant: 'solid'
    };
    setThemeConfig(defaultTheme);
    showMessage('success', 'Theme reset to defaults. Click Save to apply.');
  };

  if (loading) {
    return (
      <AdminLayout currentPage="Theme Settings">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Loading theme settings...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="Theme Settings">
      {message.text && (
        <div
          className={`alert alert-${message.type === 'success' ? 'success' : 'error'}`}
          role="alert"
          aria-live="polite"
          style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            borderRadius: '8px',
            backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
            color: message.type === 'success' ? '#155724' : '#721c24',
            border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
          }}
        >
          {message.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Left Column: Theme Controls */}
        <div>
          <form onSubmit={handleSave}>
            <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
              <div className="card-header">
                <h2 className="card-title">Color Scheme</h2>
                <p style={{ color: '#6c757d', margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
                  Customize your brand colors. Changes preview in real-time.
                </p>
              </div>

              {/* Primary Color */}
              <div className="form-group">
                <label htmlFor="primaryColor" className="form-label">
                  Primary Color
                  <span style={{ marginLeft: '0.5rem', color: '#6c757d', fontSize: '0.85rem' }}>
                    (Main brand color - buttons, links, headers)
                  </span>
                </label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <input
                    id="primaryColor"
                    type="color"
                    value={themeConfig.primaryColor}
                    onChange={(e) => setThemeConfig({ ...themeConfig, primaryColor: e.target.value })}
                    style={{ width: '80px', height: '50px', border: '2px solid #e1e8ed', borderRadius: '8px', cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    value={themeConfig.primaryColor}
                    onChange={(e) => setThemeConfig({ ...themeConfig, primaryColor: e.target.value })}
                    className="form-input"
                    placeholder="#667eea"
                    style={{ flex: 1 }}
                  />
                </div>
              </div>

              {/* Secondary Color */}
              <div className="form-group">
                <label htmlFor="secondaryColor" className="form-label">
                  Secondary Color
                  <span style={{ marginLeft: '0.5rem', color: '#6c757d', fontSize: '0.85rem' }}>
                    (Gradients, accents, secondary buttons)
                  </span>
                </label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <input
                    id="secondaryColor"
                    type="color"
                    value={themeConfig.secondaryColor}
                    onChange={(e) => setThemeConfig({ ...themeConfig, secondaryColor: e.target.value })}
                    style={{ width: '80px', height: '50px', border: '2px solid #e1e8ed', borderRadius: '8px', cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    value={themeConfig.secondaryColor}
                    onChange={(e) => setThemeConfig({ ...themeConfig, secondaryColor: e.target.value })}
                    className="form-input"
                    placeholder="#764ba2"
                    style={{ flex: 1 }}
                  />
                </div>
              </div>

              {/* Accent Color */}
              <div className="form-group">
                <label htmlFor="accentColor" className="form-label">
                  Accent Color
                  <span style={{ marginLeft: '0.5rem', color: '#6c757d', fontSize: '0.85rem' }}>
                    (Highlights, active states, focus indicators)
                  </span>
                </label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <input
                    id="accentColor"
                    type="color"
                    value={themeConfig.accentColor}
                    onChange={(e) => setThemeConfig({ ...themeConfig, accentColor: e.target.value })}
                    style={{ width: '80px', height: '50px', border: '2px solid #e1e8ed', borderRadius: '8px', cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    value={themeConfig.accentColor}
                    onChange={(e) => setThemeConfig({ ...themeConfig, accentColor: e.target.value })}
                    className="form-input"
                    placeholder="#00BCD4"
                    style={{ flex: 1 }}
                  />
                </div>
              </div>

              {/* Semantic Colors */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
                {/* Success */}
                <div>
                  <label htmlFor="successColor" className="form-label" style={{ fontSize: '0.85rem' }}>Success</label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      id="successColor"
                      type="color"
                      value={themeConfig.successColor}
                      onChange={(e) => setThemeConfig({ ...themeConfig, successColor: e.target.value })}
                      style={{ width: '50px', height: '40px', border: '2px solid #e1e8ed', borderRadius: '6px', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={themeConfig.successColor}
                      onChange={(e) => setThemeConfig({ ...themeConfig, successColor: e.target.value })}
                      className="form-input"
                      style={{ fontSize: '0.85rem', padding: '0.5rem' }}
                    />
                  </div>
                </div>

                {/* Warning */}
                <div>
                  <label htmlFor="warningColor" className="form-label" style={{ fontSize: '0.85rem' }}>Warning</label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      id="warningColor"
                      type="color"
                      value={themeConfig.warningColor}
                      onChange={(e) => setThemeConfig({ ...themeConfig, warningColor: e.target.value })}
                      style={{ width: '50px', height: '40px', border: '2px solid #e1e8ed', borderRadius: '6px', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={themeConfig.warningColor}
                      onChange={(e) => setThemeConfig({ ...themeConfig, warningColor: e.target.value })}
                      className="form-input"
                      style={{ fontSize: '0.85rem', padding: '0.5rem' }}
                    />
                  </div>
                </div>

                {/* Error */}
                <div>
                  <label htmlFor="errorColor" className="form-label" style={{ fontSize: '0.85rem' }}>Error</label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      id="errorColor"
                      type="color"
                      value={themeConfig.errorColor}
                      onChange={(e) => setThemeConfig({ ...themeConfig, errorColor: e.target.value })}
                      style={{ width: '50px', height: '40px', border: '2px solid #e1e8ed', borderRadius: '6px', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      value={themeConfig.errorColor}
                      onChange={(e) => setThemeConfig({ ...themeConfig, errorColor: e.target.value })}
                      className="form-input"
                      style={{ fontSize: '0.85rem', padding: '0.5rem' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Typography */}
            <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
              <div className="card-header">
                <h2 className="card-title">Typography</h2>
              </div>

              <div className="form-group">
                <label htmlFor="fontFamily" className="form-label">Font Family</label>
                <select
                  id="fontFamily"
                  value={themeConfig.fontFamily}
                  onChange={(e) => setThemeConfig({ ...themeConfig, fontFamily: e.target.value })}
                  className="form-input"
                >
                  {fontOptions.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.label}
                    </option>
                  ))}
                </select>
                <p style={{ color: '#6c757d', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                  Note: Custom fonts require adding them to your CSS/HTML.
                </p>
              </div>
            </div>

            {/* Button Style */}
            <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
              <div className="card-header">
                <h2 className="card-title">Button Style</h2>
              </div>

              <div className="form-group">
                <label className="form-label">Button Border Radius</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="buttonStyle"
                      value="square"
                      checked={themeConfig.buttonStyle === 'square'}
                      onChange={(e) => setThemeConfig({ ...themeConfig, buttonStyle: e.target.value })}
                      style={{ marginRight: '0.5rem' }}
                    />
                    Square (0px)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="buttonStyle"
                      value="rounded"
                      checked={themeConfig.buttonStyle === 'rounded'}
                      onChange={(e) => setThemeConfig({ ...themeConfig, buttonStyle: e.target.value })}
                      style={{ marginRight: '0.5rem' }}
                    />
                    Rounded (8px)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="buttonStyle"
                      value="pill"
                      checked={themeConfig.buttonStyle === 'pill'}
                      onChange={(e) => setThemeConfig({ ...themeConfig, buttonStyle: e.target.value })}
                      style={{ marginRight: '0.5rem' }}
                    />
                    Pill (50px)
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Button Variant</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="buttonVariant"
                      value="solid"
                      checked={themeConfig.buttonVariant === 'solid'}
                      onChange={(e) => setThemeConfig({ ...themeConfig, buttonVariant: e.target.value })}
                      style={{ marginRight: '0.5rem' }}
                    />
                    Solid
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="buttonVariant"
                      value="outlined"
                      checked={themeConfig.buttonVariant === 'outlined'}
                      onChange={(e) => setThemeConfig({ ...themeConfig, buttonVariant: e.target.value })}
                      style={{ marginRight: '0.5rem' }}
                    />
                    Outlined
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={handleReset}
                className="btn btn-secondary"
                style={{
                  padding: '0.75rem 1.5rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  borderRadius: '8px',
                  border: '1px solid #6c757d',
                  background: 'white',
                  color: '#6c757d',
                  cursor: 'pointer'
                }}
              >
                Reset to Defaults
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary"
                style={{
                  padding: '0.75rem 2rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  borderRadius: '8px',
                  border: 'none',
                  background: `linear-gradient(135deg, ${themeConfig.primaryColor}, ${themeConfig.secondaryColor})`,
                  color: 'white',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.6 : 1
                }}
              >
                {saving ? 'Saving...' : 'Save Theme'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Preview */}
        <div>
          <div className="admin-card" style={{ position: 'sticky', top: '1.5rem' }}>
            <div className="card-header">
              <h2 className="card-title">Live Preview</h2>
              <p style={{ color: '#6c757d', margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
                See how your theme looks in real-time
              </p>
            </div>

            {/* Preview Components */}
            <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px', marginBottom: '1rem' }}>
              <h3 style={{
                color: themeConfig.primaryColor,
                fontFamily: themeConfig.fontFamily,
                marginBottom: '1rem',
                fontSize: '1.5rem'
              }}>
                Heading Example
              </h3>
              <p style={{ fontFamily: themeConfig.fontFamily, marginBottom: '1rem' }}>
                This is body text using your selected font family. The quick brown fox jumps over the lazy dog.
              </p>

              {/* Button Preview */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <button style={{
                  padding: '0.75rem 1.5rem',
                  background: themeConfig.buttonVariant === 'solid'
                    ? `linear-gradient(135deg, ${themeConfig.primaryColor}, ${themeConfig.secondaryColor})`
                    : 'transparent',
                  color: themeConfig.buttonVariant === 'solid' ? 'white' : themeConfig.primaryColor,
                  border: themeConfig.buttonVariant === 'outlined' ? `2px solid ${themeConfig.primaryColor}` : 'none',
                  borderRadius: themeConfig.buttonStyle === 'square' ? '0' : themeConfig.buttonStyle === 'pill' ? '50px' : '8px',
                  fontFamily: themeConfig.fontFamily,
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  Primary Button
                </button>

                <button style={{
                  padding: '0.75rem 1.5rem',
                  background: themeConfig.accentColor,
                  color: 'white',
                  border: 'none',
                  borderRadius: themeConfig.buttonStyle === 'square' ? '0' : themeConfig.buttonStyle === 'pill' ? '50px' : '8px',
                  fontFamily: themeConfig.fontFamily,
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                  Accent Button
                </button>
              </div>

              {/* Color Swatches */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginTop: '1.5rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '100%',
                    height: '60px',
                    background: themeConfig.successColor,
                    borderRadius: '8px',
                    marginBottom: '0.5rem'
                  }} />
                  <span style={{ fontSize: '0.85rem', fontFamily: themeConfig.fontFamily }}>Success</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '100%',
                    height: '60px',
                    background: themeConfig.warningColor,
                    borderRadius: '8px',
                    marginBottom: '0.5rem'
                  }} />
                  <span style={{ fontSize: '0.85rem', fontFamily: themeConfig.fontFamily }}>Warning</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '100%',
                    height: '60px',
                    background: themeConfig.errorColor,
                    borderRadius: '8px',
                    marginBottom: '0.5rem'
                  }} />
                  <span style={{ fontSize: '0.85rem', fontFamily: themeConfig.fontFamily }}>Error</span>
                </div>
              </div>
            </div>

            {/* Gradient Preview */}
            <div style={{
              padding: '2rem',
              background: `linear-gradient(135deg, ${themeConfig.primaryColor}, ${themeConfig.secondaryColor})`,
              borderRadius: '8px',
              color: 'white',
              fontFamily: themeConfig.fontFamily,
              marginBottom: '1rem'
            }}>
              <h4 style={{ marginBottom: '0.5rem' }}>Gradient Preview</h4>
              <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                This shows how your primary and secondary colors blend in gradients.
              </p>
            </div>

            {/* Info Box */}
            <div style={{
              padding: '1rem',
              background: '#e7f3ff',
              border: `2px solid ${themeConfig.accentColor}`,
              borderRadius: '8px',
              fontFamily: themeConfig.fontFamily
            }}>
              <strong style={{ color: themeConfig.accentColor }}>ℹ️ Note:</strong>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
                Theme changes apply immediately to this preview. Click "Save Theme" to apply changes site-wide.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

// Export with SSR disabled to prevent router mounting issues during build

export default ThemeSettingsClient;


// Protect admin route - require authentication and admin role
