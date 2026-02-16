import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AdminLayout from '../../../components/Admin/AdminLayout';
import FileUpload from '../../../components/Admin/FileUpload';
import SignboardConfigForm from '../../../components/Admin/Building/SignboardConfigForm';
import { useAuth } from '../../../contexts/AuthContext';

function BuildingDetailsPageClient() {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading: authLoading } = useAuth();
  const [building, setBuilding] = useState(null);
  const [furnitureStats, setFurnitureStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('basic'); // Tab state: basic, signboard, audio, position

  // Client-side auth check
  useEffect(() => {
    if (!authLoading && (!user || !['admin', 'super_admin'].includes(user.role))) {
      router.push('/admin/login');
    }
  }, [user, authLoading, router]);

  const [formData, setFormData] = useState({
    name: '',
    status: 'OPEN',
    is_operational: true,
    description: '',
    logo_url: '',
    signage_text: '',
    signage_subtitle: '',
    signage_tagline: '',
    background_music_url: '',
    background_music_volume: 0.3,
    background_music_loop: true
  });

  const [signboardConfig, setSignboardConfig] = useState(null);
  const [availableTemplates, setAvailableTemplates] = useState([]);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    if (id && user && ['admin', 'super_admin'].includes(user.role)) {
      loadBuilding();
      loadSignboardConfig();
    }
  }, [id, user]);

  // Show loading state until auth check completes - prevents flash of content
  if (authLoading || !user || !['admin', 'super_admin'].includes(user.role)) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--bg-secondary)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid var(--gray-200)',
            borderTop: '4px solid var(--primary-500)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const loadBuilding = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/buildings/${id}`);
      const data = await response.json();

      if (data.success) {
        setBuilding(data.building);
        setFormData({
          name: data.building.name,
          status: data.building.status,
          is_operational: data.building.is_operational,
          description: data.building.description || '',
          logo_url: data.building.logo_url || '',
          signage_text: data.building.signage_text || '',
          signage_subtitle: data.building.signage_subtitle || '',
          signage_tagline: data.building.signage_tagline || '',
          background_music_url: data.building.background_music_url || '',
          background_music_volume: data.building.background_music_volume || 0.3,
          background_music_loop: data.building.background_music_loop !== false
        });

        // Load furniture statistics
        loadFurnitureStats();
      } else {
        showMessage('error', 'Building not found');
        router.push('/admin/buildings');
      }
    } catch (error) {
      showMessage('error', 'Failed to load building');
    } finally {
      setLoading(false);
    }
  };

  const loadSignboardConfig = async () => {
    try {
      const response = await fetch(`/api/buildings/${id}/signboard`);
      const data = await response.json();

      if (data.success) {
        setSignboardConfig(data.signboard_config);
        setAvailableTemplates(data.available_templates || []);
      }
    } catch (error) {
      console.error('Failed to load signboard config:', error);
    }
  };

  const loadFurnitureStats = async () => {
    try {
      const response = await fetch(`/api/buildings/${id}/furniture`);
      const data = await response.json();

      if (data.success) {
        setFurnitureStats(data.statistics);
      }
    } catch (error) {
      console.error('Failed to load furniture stats:', error);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/buildings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        showMessage('success', 'Building updated successfully');
        setBuilding(data.building);
        setEditMode(false);
      } else {
        showMessage('error', data.error || 'Update failed');
      }
    } catch (error) {
      showMessage('error', 'Failed to update building');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this building? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/buildings/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        showMessage('success', 'Building deleted successfully');
        setTimeout(() => router.push('/admin/buildings'), 1500);
      } else {
        showMessage('error', data.error || 'Delete failed');
        setLoading(false);
      }
    } catch (error) {
      showMessage('error', 'Failed to delete building');
      setLoading(false);
    }
  };

  const toggleOperational = async () => {
    const newStatus = !building.is_operational;
    setLoading(true);

    try {
      const response = await fetch(`/api/buildings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_operational: newStatus,
          status: newStatus ? 'OPEN' : 'CLOSED'
        })
      });

      const data = await response.json();

      if (data.success) {
        showMessage('success', `Building ${newStatus ? 'opened' : 'closed'} successfully`);
        loadBuilding();
      } else {
        showMessage('error', data.error || 'Toggle failed');
      }
    } catch (error) {
      showMessage('error', 'Failed to toggle operational status');
    } finally {
      setLoading(false);
    }
  };

  const handleSignboardChange = (field, value) => {
    setSignboardConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await fetch(`/api/buildings/${id}/logo`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setSignboardConfig(prev => ({
          ...prev,
          logo_url: data.logo_url
        }));
        showMessage('success', 'Logo uploaded successfully');
      } else {
        showMessage('error', data.error || 'Failed to upload logo');
      }
    } catch (error) {
      showMessage('error', 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleLogoRemove = async () => {
    if (!confirm('Remove logo from signboard?')) return;

    try {
      const response = await fetch(`/api/buildings/${id}/logo`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        setSignboardConfig(prev => ({
          ...prev,
          logo_url: null
        }));
        showMessage('success', 'Logo removed successfully');
      } else {
        showMessage('error', data.error || 'Failed to remove logo');
      }
    } catch (error) {
      showMessage('error', 'Failed to remove logo');
    }
  };

  const applyTemplate = (template) => {
    if (!template) return;

    const templateConfig = template.config;
    setSignboardConfig(prev => ({
      ...prev,
      ...templateConfig,
      template: template.name
    }));
    showMessage('success', `Applied ${template.display_name} template`);
  };

  const saveSignboardConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/buildings/${id}/signboard`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signboardConfig)
      });

      const data = await response.json();

      if (data.success) {
        showMessage('success', 'Signboard configuration saved');
        loadSignboardConfig();
      } else {
        showMessage('error', data.error || 'Failed to save configuration');
      }
    } catch (error) {
      showMessage('error', 'Failed to save configuration');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      OPEN: {
        className: 'status-success',
        text: 'Open'
      },
      CLOSED: {
        className: 'status-warning',
        text: 'Closed'
      },
      MAINTENANCE: {
        className: 'status-error',
        text: 'Maintenance'
      }
    };
    const style = styles[status] || styles.CLOSED;
    return (
      <span className={style.className} style={{
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: '600',
        backdropFilter: 'blur(10px)'
      }}>
        {style.text}
      </span>
    );
  };

  if (loading && !building) {
    return (
      <AdminLayout currentPage="Buildings">
        <div style={{ textAlign: 'center', padding: '3rem' }} role="status" aria-live="polite">
          <p>Loading building...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!building) {
    return null;
  }

  return (
    <AdminLayout currentPage="Buildings">
      {/* Header */}
      <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <button
              onClick={() => router.push('/admin/buildings')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary-500)',
                cursor: 'pointer',
                fontSize: '0.9rem',
                marginBottom: '0.5rem'
              }}
            >
              ← Back to Buildings
            </button>
            <h2 className="card-title" style={{ margin: 0 }}>{building.name}</h2>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              {building.customer?.name} • {building.template?.name} ({building.template?.type})
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {getStatusBadge(building.status)}
            {!editMode && (
              <>
                <button
                  className="btn btn-primary"
                  onClick={() => setEditMode(true)}
                  aria-label="Edit building details"
                >
                  Edit Building
                </button>
                <button
                  className={`btn ${building.is_operational ? 'btn-secondary' : 'btn-primary'}`}
                  onClick={toggleOperational}
                  disabled={loading}
                  aria-label={building.is_operational ? 'Close building' : 'Open building'}
                >
                  {building.is_operational ? 'Close Building' : 'Open Building'}
                </button>
              </>
            )}
          </div>
        </div>

        {message.text && (
          <div
            className={`alert alert-${message.type === 'success' ? 'success' : 'error'}`}
            role="alert"
            aria-live="polite"
          >
            {message.text}
          </div>
        )}
      </div>

      {editMode ? (
        /* Edit Mode with Tabbed Interface */
        <section className="admin-card" role="region" aria-labelledby="edit-building-heading">
          <h3 id="edit-building-heading" style={{ marginBottom: '1.5rem' }}>Edit Building Details</h3>

          {/* Tab Navigation */}
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '2rem',
            borderBottom: '2px solid rgba(102, 126, 234, 0.2)',
            paddingBottom: '0'
          }}>
            {[
              { id: 'basic', label: 'Basic Info', icon: '📋' },
              { id: 'signboard', label: 'Signboard', icon: '🪧' },
              { id: 'audio', label: 'Audio', icon: '🎵' },
              { id: 'furniture', label: 'Furniture', icon: '🪑' },
              { id: 'lighting', label: 'Lighting', icon: '💡' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '12px 24px',
                  background: activeTab === tab.id
                    ? 'var(--primary-50)'
                    : 'transparent',
                  color: activeTab === tab.id ? 'var(--primary-600)' : 'var(--text-secondary)',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '2px solid var(--primary-500)' : '2px solid transparent',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: activeTab === tab.id ? '600' : '500',
                  transition: 'all 0.3s ease',
                  borderRadius: '8px 8px 0 0',
                  marginBottom: '-2px'
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} aria-label="Edit building form">
            {/* Basic Information Tab */}
            {activeTab === 'basic' && (
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ marginBottom: '1rem', color: 'var(--color-text-primary)', fontSize: '0.95rem', fontWeight: '600' }}>
                  Basic Information
                </h4>

                <div className="form-group">
                  <label className="form-label">Building Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="form-textarea"
                    rows="3"
                    placeholder="Describe this building..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="OPEN">Open</option>
                    <option value="CLOSED">Closed</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </select>
                </div>

                <div className="form-group">
                  <FileUpload
                    id="building-logo"
                    label="Building Logo"
                    accept="image/*"
                    allowedTypes={['.jpg', '.jpeg', '.png', '.svg', '.webp']}
                    maxSize={2097152}
                    bucket="building-logos"
                    folder="logos"
                    onUploadComplete={(file) => {
                      setFormData(prev => ({ ...prev, logo_url: file.url }));
                      showMessage('success', 'Logo uploaded successfully!');
                    }}
                    onUploadError={(error) => {
                      showMessage('error', error.message || 'Failed to upload logo');
                    }}
                    showPreview={true}
                    helpText="Upload building logo (JPG, PNG, SVG - max 2MB)"
                  />
                  {formData.logo_url && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <p style={{ fontSize: '0.85rem', color: '#666' }}>
                        Current logo: <a href={formData.logo_url} target="_blank" rel="noopener noreferrer" style={{ color: '#4a90e2' }}>View</a>
                      </p>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="is_operational"
                      checked={formData.is_operational}
                      onChange={handleInputChange}
                      style={{ marginRight: '0.5rem', width: '20px', height: '20px' }}
                    />
                    <span className="form-label" style={{ margin: 0 }}>Building is Operational</span>
                  </label>
                </div>
              </div>
            )}

            {/* Signboard Tab - Advanced Management */}
            {activeTab === 'signboard' && signboardConfig && (
              <SignboardConfigForm
                signboardConfig={signboardConfig}
                handleSignboardChange={handleSignboardChange}
                availableTemplates={availableTemplates}
                applyTemplate={applyTemplate}
                handleLogoUpload={handleLogoUpload}
                handleLogoRemove={handleLogoRemove}
                saveSignboardConfig={saveSignboardConfig}
                loading={loading}
                uploadingLogo={uploadingLogo}
              />
            )}

            {/* Audio Tab */}
            {activeTab === 'audio' && (
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ marginBottom: '1rem', color: 'var(--color-text-primary)', fontSize: '0.95rem', fontWeight: '600' }}>
                  Audio System
                </h4>

                <div className="form-group">
                  <label className="form-label">Background Music URL</label>
                  <input
                    type="text"
                    name="background_music_url"
                    value={formData.background_music_url}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="https://example.com/music.mp3"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Volume (0.0 - 1.0)</label>
                    <input
                      type="number"
                      name="background_music_volume"
                      value={formData.background_music_volume}
                      onChange={handleInputChange}
                      className="form-input"
                      min="0"
                      max="1"
                      step="0.1"
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', height: '100%', paddingTop: '2rem' }}>
                      <input
                        type="checkbox"
                        name="background_music_loop"
                        checked={formData.background_music_loop}
                        onChange={handleInputChange}
                        style={{ marginRight: '0.5rem', width: '20px', height: '20px' }}
                      />
                      <span>Loop Music</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Furniture Tab */}
            {activeTab === 'furniture' && (
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ marginBottom: '1rem', color: 'var(--color-text-primary)', fontSize: '0.95rem', fontWeight: '600' }}>
                  Furniture Management
                </h4>

                {furnitureStats ? (
                  <div>
                    {/* Capacity Overview */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                      gap: '1rem',
                      marginBottom: '1.5rem'
                    }}>
                      <div style={{
                        padding: '1rem',
                        backgroundColor: 'rgba(39, 174, 96, 0.1)',
                        border: '1px solid rgba(39, 174, 96, 0.3)',
                        borderRadius: '8px',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: '#27ae60' }}>
                          {furnitureStats.used_slots}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                          Active Items
                        </div>
                      </div>

                      <div style={{
                        padding: '1rem',
                        backgroundColor: 'rgba(243, 156, 18, 0.1)',
                        border: '1px solid rgba(243, 156, 18, 0.3)',
                        borderRadius: '8px',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: '#f39c12' }}>
                          {furnitureStats.available_slots}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                          Available Slots
                        </div>
                      </div>

                      <div style={{
                        padding: '1rem',
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        border: '1px solid rgba(52, 152, 219, 0.3)',
                        borderRadius: '8px',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3498db' }}>
                          {furnitureStats.max_furniture}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                          Max Capacity
                        </div>
                      </div>
                    </div>

                    {/* Furniture by Type */}
                    {furnitureStats.by_type && furnitureStats.by_type.length > 0 && (
                      <div style={{ marginTop: '1.5rem' }}>
                        <div style={{ fontWeight: '600', color: 'var(--color-text-primary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                          Furniture by Type
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
                          {furnitureStats.by_type.map((typeInfo, index) => (
                            <div
                              key={index}
                              style={{
                                padding: '0.75rem',
                                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                border: '1px solid rgba(102, 126, 234, 0.2)',
                                borderRadius: '8px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}
                            >
                              <div>
                                <div style={{ fontSize: '0.9rem', fontWeight: '500', textTransform: 'capitalize', color: 'var(--color-text-primary)' }}>
                                  {typeInfo.type.replace(/_/g, ' ')}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                                  {typeInfo.active_count} active
                                </div>
                              </div>
                              <div style={{
                                fontSize: '1.2rem',
                                fontWeight: '700',
                                color: '#667eea'
                              }}>
                                {typeInfo.count}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Manage Furniture Link */}
                    <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'rgba(102, 126, 234, 0.1)', border: '1px solid rgba(102, 126, 234, 0.2)', borderRadius: '8px' }}>
                      <p style={{ fontSize: '0.85rem', margin: '0 0 0.75rem 0', color: 'var(--color-text-primary)' }}>
                        💡 <strong>Note:</strong> Furniture items are managed separately in the furniture management section.
                      </p>
                      <Link
                        href={`/admin/furniture?building_id=${id}`}
                        style={{
                          display: 'inline-block',
                          padding: '0.5rem 1rem',
                          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.3))',
                          color: 'white',
                          textDecoration: 'none',
                          borderRadius: '6px',
                          fontSize: '0.9rem',
                          border: '1px solid rgba(102, 126, 234, 0.5)',
                          fontWeight: '500'
                        }}
                      >
                        Manage Furniture Items →
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>
                    Loading furniture data...
                  </div>
                )}
              </div>
            )}

            {/* Lighting Tab */}
            {activeTab === 'lighting' && (
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ marginBottom: '1rem', color: 'var(--color-text-primary)', fontSize: '0.95rem', fontWeight: '600' }}>
                  Lighting Controls
                </h4>

                <div style={{ marginTop: '1rem', padding: '1.5rem', backgroundColor: 'rgba(102, 126, 234, 0.1)', border: '1px solid rgba(102, 126, 234, 0.2)', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💡</div>
                  <h5 style={{ color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>Lighting Controls Coming Soon</h5>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                    Advanced lighting management including ambient intensity, directional lights, and color controls will be available in a future update.
                  </p>
                </div>

                <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'rgba(39, 174, 96, 0.1)', border: '1px solid rgba(39, 174, 96, 0.2)', borderRadius: '8px' }}>
                  <p style={{ fontSize: '0.85rem', margin: 0, color: 'var(--color-text-primary)' }}>
                    📝 <strong>Planned Features:</strong>
                  </p>
                  <ul style={{ marginTop: '0.5rem', marginBottom: 0, paddingLeft: '1.5rem', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                    <li>Ambient light intensity control</li>
                    <li>Directional light positioning</li>
                    <li>Spot light configuration</li>
                    <li>Color temperature adjustments</li>
                    <li>Shadow quality settings</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Form Actions - Always visible at bottom */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(102, 126, 234, 0.2)' }}>
              <button type="submit" className="btn btn-primary" disabled={loading} aria-label="Save building changes">
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setEditMode(false);
                  loadBuilding();
                }}
                aria-label="Cancel editing"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      ) : (
        /* View Mode */
        <>
          {/* Building Information */}
          <section className="admin-card" style={{ marginBottom: '1.5rem' }} role="region" aria-labelledby="building-info-heading">
            <h3 id="building-info-heading" style={{ marginBottom: '1.5rem' }}>Building Information</h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              <div>
                <div style={{ fontWeight: '600', color: '#6c757d', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  Customer
                </div>
                <div style={{ fontSize: '1.05rem' }}>
                  {building.customer?.name}
                  <div style={{ fontSize: '0.85rem', color: '#6c757d', marginTop: '0.25rem' }}>
                    {building.customer?.subscription_tier} Plan
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontWeight: '600', color: '#6c757d', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  Template
                </div>
                <div style={{ fontSize: '1.05rem' }}>
                  {building.template?.name}
                  <div style={{ fontSize: '0.85rem', color: '#6c757d', marginTop: '0.25rem' }}>
                    {building.template?.width}m × {building.template?.depth}m × {building.template?.wall_height}m
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontWeight: '600', color: '#6c757d', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  Operational Status
                </div>
                <div style={{ fontSize: '1.05rem' }}>
                  {building.is_operational ? (
                    <span style={{ color: '#27ae60', fontWeight: '600' }}>Operational</span>
                  ) : (
                    <span style={{ color: '#e74c3c', fontWeight: '600' }}>Not Operational</span>
                  )}
                </div>
              </div>

              <div>
                <div style={{ fontWeight: '600', color: '#6c757d', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  Created
                </div>
                <div style={{ fontSize: '0.95rem' }}>
                  {new Date(building.created_at).toLocaleString()}
                </div>
              </div>
            </div>

            {building.description && (
              <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                <div style={{ fontWeight: '600', color: '#6c757d', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  Description
                </div>
                <div>{building.description}</div>
              </div>
            )}
          </section>

          {/* 3D Position */}
          <section className="admin-card" style={{ marginBottom: '1.5rem' }} role="region" aria-labelledby="position-heading">
            <h3 id="position-heading" style={{ marginBottom: '1.5rem' }}>3D World Position</h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
              <div>
                <div style={{ fontWeight: '600', color: '#6c757d', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  Position X
                </div>
                <div style={{ fontSize: '1.2rem', fontFamily: 'monospace' }}>{building.position_x.toFixed(2)}</div>
              </div>

              <div>
                <div style={{ fontWeight: '600', color: '#6c757d', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  Position Y
                </div>
                <div style={{ fontSize: '1.2rem', fontFamily: 'monospace' }}>{building.position_y.toFixed(2)}</div>
              </div>

              <div>
                <div style={{ fontWeight: '600', color: '#6c757d', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  Position Z
                </div>
                <div style={{ fontSize: '1.2rem', fontFamily: 'monospace' }}>{building.position_z.toFixed(2)}</div>
              </div>

              <div>
                <div style={{ fontWeight: '600', color: '#6c757d', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  Placement
                </div>
                <div style={{ fontSize: '1rem', textTransform: 'capitalize' }}>{building.placement}</div>
              </div>
            </div>
          </section>

          {/* Digital Signage */}
          <section className="admin-card" style={{ marginBottom: '1.5rem' }} role="region" aria-labelledby="signage-heading">
            <h3 id="signage-heading" style={{ marginBottom: '1.5rem' }}>Digital Signage</h3>

            {building.signage_text ? (
              <div>
                <div style={{
                  padding: '2rem',
                  backgroundColor: '#000',
                  color: '#fff',
                  textAlign: 'center',
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  borderRadius: '8px',
                  border: '4px solid #000'
                }}>
                  {building.signage_text}
                </div>
                <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#6c757d' }}>
                  Dimensions: {building.signage_width}m × {building.signage_height}m
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
                No signage text configured
              </div>
            )}
          </section>

          {/* Audio System */}
          <section className="admin-card" style={{ marginBottom: '1.5rem' }} role="region" aria-labelledby="audio-heading">
            <h3 id="audio-heading" style={{ marginBottom: '1.5rem' }}>Audio System</h3>

            {building.background_music_url ? (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div>
                    <div style={{ fontWeight: '600', color: '#6c757d', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                      Music URL
                    </div>
                    <div style={{ fontSize: '0.9rem', wordBreak: 'break-all' }}>
                      <a href={building.background_music_url} target="_blank" rel="noopener noreferrer" style={{ color: '#4a90e2' }}>
                        {building.background_music_url}
                      </a>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontWeight: '600', color: '#6c757d', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                      Volume
                    </div>
                    <div style={{ fontSize: '1rem' }}>
                      {Math.round((building.background_music_volume || 0.3) * 100)}%
                    </div>
                  </div>

                  <div>
                    <div style={{ fontWeight: '600', color: '#6c757d', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                      Loop
                    </div>
                    <div style={{ fontSize: '1rem' }}>
                      {building.background_music_loop !== false ? 'Enabled' : 'Disabled'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
                No background music configured
              </div>
            )}
          </section>

          {/* Furniture Management */}
          <section className="admin-card" style={{ marginBottom: '1.5rem' }} role="region" aria-labelledby="furniture-heading">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 id="furniture-heading" style={{ margin: 0 }}>Furniture Management</h3>
              <Link
                href={`/admin/furniture?building_id=${id}`}
                style={{
                  display: 'inline-block',
                  padding: '0.5rem 1rem',
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.3))',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  border: '1px solid rgba(102, 126, 234, 0.5)',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
                aria-label="Manage furniture for this building"
              >
                Manage Furniture →
              </Link>
            </div>

            {furnitureStats ? (
              <div>
                {/* Capacity Overview */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{
                    padding: '1rem',
                    backgroundColor: 'rgba(39, 174, 96, 0.1)',
                    border: '1px solid rgba(39, 174, 96, 0.3)',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: '#27ae60' }}>
                      {furnitureStats.used_slots}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                      Active Items
                    </div>
                  </div>

                  <div style={{
                    padding: '1rem',
                    backgroundColor: 'rgba(243, 156, 18, 0.1)',
                    border: '1px solid rgba(243, 156, 18, 0.3)',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: '#f39c12' }}>
                      {furnitureStats.available_slots}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                      Available Slots
                    </div>
                  </div>

                  <div style={{
                    padding: '1rem',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    border: '1px solid rgba(52, 152, 219, 0.3)',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3498db' }}>
                      {furnitureStats.max_furniture}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                      Max Capacity
                    </div>
                  </div>

                  <div style={{
                    padding: '1rem',
                    backgroundColor: furnitureStats.usage_percentage > 80 ? 'rgba(231, 76, 60, 0.1)' : 'rgba(102, 126, 234, 0.1)',
                    border: furnitureStats.usage_percentage > 80 ? '1px solid rgba(231, 76, 60, 0.3)' : '1px solid rgba(102, 126, 234, 0.3)',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '2rem',
                      fontWeight: '700',
                      color: furnitureStats.usage_percentage > 80 ? '#e74c3c' : '#667eea'
                    }}>
                      {furnitureStats.usage_percentage}%
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                      Capacity Used
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{
                    height: '30px',
                    backgroundColor: 'var(--color-bg-secondary)',
                    borderRadius: '15px',
                    overflow: 'hidden',
                    position: 'relative',
                    border: '1px solid var(--color-border-light)'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${furnitureStats.usage_percentage}%`,
                      background: furnitureStats.usage_percentage > 80 ? 'linear-gradient(135deg, rgba(231, 76, 60, 0.8), rgba(192, 57, 43, 0.8))' :
                        furnitureStats.usage_percentage > 60 ? 'linear-gradient(135deg, rgba(243, 156, 18, 0.8), rgba(230, 126, 34, 0.8))' :
                          'linear-gradient(135deg, rgba(39, 174, 96, 0.8), rgba(34, 153, 84, 0.8))',
                      transition: 'width 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      backdropFilter: 'blur(10px)'
                    }}>
                      {furnitureStats.used_slots} / {furnitureStats.max_furniture}
                    </div>
                  </div>
                </div>

                {/* Furniture by Type */}
                {furnitureStats.by_type && furnitureStats.by_type.length > 0 && (
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--color-text-primary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                      Furniture by Type
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
                      {furnitureStats.by_type.map((typeInfo, index) => (
                        <div
                          key={index}
                          style={{
                            padding: '0.75rem',
                            backgroundColor: 'rgba(102, 126, 234, 0.1)',
                            border: '1px solid rgba(102, 126, 234, 0.2)',
                            borderRadius: '8px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '0.9rem', fontWeight: '500', textTransform: 'capitalize', color: 'var(--color-text-primary)' }}>
                              {typeInfo.type.replace(/_/g, ' ')}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                              {typeInfo.active_count} active
                            </div>
                          </div>
                          <div style={{
                            fontSize: '1.2rem',
                            fontWeight: '700',
                            color: '#667eea'
                          }}>
                            {typeInfo.count}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }} role="status">
                Loading furniture statistics...
              </div>
            )}
          </section>

          {/* Danger Zone */}
          <section className="admin-card" style={{ borderColor: '#e74c3c' }} role="region" aria-labelledby="danger-zone-heading">
            <h3 id="danger-zone-heading" style={{ marginBottom: '1rem', color: '#e74c3c' }}>Danger Zone</h3>
            <p style={{ color: '#6c757d', marginBottom: '1rem' }}>
              Once you delete a building, there is no going back. Please be certain.
            </p>
            <button
              className="btn"
              style={{ backgroundColor: '#e74c3c', color: 'white' }}
              onClick={handleDelete}
              disabled={loading}
              aria-label={`Delete ${building.name}`}
            >
              Delete Building
            </button>
          </section>
        </>
      )}
    </AdminLayout>
  );
}

// Export with SSR disabled to prevent router mounting issues during build

export default BuildingDetailsPageClient;


// Protect admin route - require authentication and admin role
