import React from 'react';

/**
 * SignboardConfigForm Component
 * extracted from pages/admin/buildings/[id].js
 */
const SignboardConfigForm = ({
    signboardConfig,
    handleSignboardChange,
    availableTemplates,
    applyTemplate,
    handleLogoUpload,
    handleLogoRemove,
    saveSignboardConfig,
    loading,
    uploadingLogo
}) => {
    if (!signboardConfig) return null;

    return (
        <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ marginBottom: '1.5rem', color: 'var(--color-text-primary)', fontSize: '1.1rem', fontWeight: '600' }}>
                🪧 Advanced Signboard Management
            </h4>

            {/* Templates Section */}
            <div style={{ marginBottom: '2rem', padding: '1.5rem', backgroundColor: 'rgba(102, 126, 234, 0.1)', border: '1px solid rgba(102, 126, 234, 0.2)', borderRadius: '12px' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '1rem', color: 'var(--color-text-primary)' }}>
                    🎨 Quick Templates
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
                    {availableTemplates.map(template => (
                        <button
                            key={template.name}
                            type="button"
                            onClick={() => applyTemplate(template)}
                            style={{
                                padding: '0.75rem',
                                background: signboardConfig.template === template.name
                                    ? 'var(--primary-50)'
                                    : 'var(--bg-secondary)',
                                border: signboardConfig.template === template.name
                                    ? '2px solid var(--primary-500)'
                                    : '1px solid var(--border-primary)',
                                borderRadius: '8px',
                                color: 'var(--text-primary)',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: signboardConfig.template === template.name ? '600' : '500',
                                transition: 'all 0.2s',
                                textAlign: 'center'
                            }}
                        >
                            {template.display_name}
                        </button>
                    ))}
                </div>
                <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                    Click a template to apply pre-configured styles
                </div>
            </div>

            {/* Logo Upload Section */}
            <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--color-text-primary)' }}>
                    🖼️ Building Logo
                </label>

                {signboardConfig.logo_url ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', backgroundColor: 'rgba(39, 174, 96, 0.1)', border: '1px solid rgba(39, 174, 96, 0.2)', borderRadius: '8px' }}>
                        <img
                            src={signboardConfig.logo_url}
                            alt="Building logo"
                            style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                        />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
                                Logo uploaded successfully
                            </div>
                            <a href={signboardConfig.logo_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: '#4a90e2' }}>
                                View full size
                            </a>
                        </div>
                        <button
                            type="button"
                            onClick={handleLogoRemove}
                            style={{
                                padding: '0.5rem 1rem',
                                background: 'var(--danger-bg)',
                                border: '1px solid var(--danger-border)',
                                borderRadius: '6px',
                                color: 'var(--color-danger)',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: '500'
                            }}
                        >
                            Remove
                        </button>
                    </div>
                ) : (
                    <div style={{ position: 'relative' }}>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            disabled={uploadingLogo}
                            style={{
                                width: '100%',
                                padding: '3rem 1rem',
                                border: '2px dashed var(--primary-200)',
                                borderRadius: '8px',
                                background: 'var(--primary-50)',
                                cursor: 'pointer',
                                color: 'var(--text-secondary)',
                                fontSize: '0.9rem',
                                textAlign: 'center'
                            }}
                        />
                        {uploadingLogo && (
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                                Uploading...
                            </div>
                        )}
                    </div>
                )}
                <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                    Supported: JPG, PNG, SVG, WebP (max 5MB)
                </div>
            </div>

            {/* Building Name */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">📝 Building Name</label>
                <input
                    type="text"
                    value={signboardConfig.name || ''}
                    onChange={(e) => handleSignboardChange('name', e.target.value)}
                    className="form-input"
                    placeholder="e.g., City Healthcare Center"
                />
            </div>

            {/* Color Settings */}
            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--color-text-primary)' }}>
                    🎨 Colors
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                    <div>
                        <label style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem', display: 'block' }}>
                            Background
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <input
                                type="color"
                                value={signboardConfig.bg_color || '#000000'}
                                onChange={(e) => handleSignboardChange('bg_color', e.target.value)}
                                style={{ width: '50px', height: '40px', border: '2px solid #667eea', borderRadius: '6px', cursor: 'pointer', backgroundColor: 'transparent' }}
                            />
                            <input
                                type="text"
                                value={signboardConfig.bg_color || '#000000'}
                                onChange={(e) => handleSignboardChange('bg_color', e.target.value)}
                                className="form-input"
                                placeholder="#000000"
                                style={{ flex: 1, textTransform: 'uppercase' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem', display: 'block' }}>
                            Text Color
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <input
                                type="color"
                                value={signboardConfig.text_color || '#FFFFFF'}
                                onChange={(e) => handleSignboardChange('text_color', e.target.value)}
                                style={{ width: '50px', height: '40px', border: '2px solid #667eea', borderRadius: '6px', cursor: 'pointer', backgroundColor: 'transparent' }}
                            />
                            <input
                                type="text"
                                value={signboardConfig.text_color || '#FFFFFF'}
                                onChange={(e) => handleSignboardChange('text_color', e.target.value)}
                                className="form-input"
                                placeholder="#FFFFFF"
                                style={{ flex: 1, textTransform: 'uppercase' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem', display: 'block' }}>
                            Border Color
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <input
                                type="color"
                                value={signboardConfig.border_color || '#FFFFFF'}
                                onChange={(e) => handleSignboardChange('border_color', e.target.value)}
                                style={{ width: '50px', height: '40px', border: '2px solid #667eea', borderRadius: '6px', cursor: 'pointer', backgroundColor: 'transparent' }}
                            />
                            <input
                                type="text"
                                value={signboardConfig.border_color || '#FFFFFF'}
                                onChange={(e) => handleSignboardChange('border_color', e.target.value)}
                                className="form-input"
                                placeholder="#FFFFFF"
                                style={{ flex: 1, textTransform: 'uppercase' }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Logo Settings */}
            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--color-text-primary)' }}>
                    📐 Logo Settings
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div>
                        <label style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem', display: 'block' }}>
                            Position
                        </label>
                        <select
                            value={signboardConfig.logo_position || 'left'}
                            onChange={(e) => handleSignboardChange('logo_position', e.target.value)}
                            className="form-select"
                        >
                            <option value="left">Left</option>
                            <option value="right">Right</option>
                            <option value="above">Above Text</option>
                            <option value="center">Center</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem', display: 'block' }}>
                            Width (0.5 - 10.0)
                        </label>
                        <input
                            type="number"
                            value={signboardConfig.logo_width || 2.0}
                            onChange={(e) => handleSignboardChange('logo_width', parseFloat(e.target.value))}
                            min="0.5"
                            max="10.0"
                            step="0.1"
                            className="form-input"
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem', display: 'block' }}>
                            Height (0.5 - 10.0)
                        </label>
                        <input
                            type="number"
                            value={signboardConfig.logo_height || 2.0}
                            onChange={(e) => handleSignboardChange('logo_height', parseFloat(e.target.value))}
                            min="0.5"
                            max="10.0"
                            step="0.1"
                            className="form-input"
                        />
                    </div>
                </div>
            </div>

            {/* Dimensions */}
            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--color-text-primary)' }}>
                    📏 Signboard Dimensions
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                    <div>
                        <label style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem', display: 'block' }}>
                            Width (meters)
                        </label>
                        <input
                            type="number"
                            value={signboardConfig.signboard_width || 10.0}
                            onChange={(e) => handleSignboardChange('signboard_width', parseFloat(e.target.value))}
                            min="5.0"
                            max="20.0"
                            step="0.5"
                            className="form-input"
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem', display: 'block' }}>
                            Height (meters)
                        </label>
                        <input
                            type="number"
                            value={signboardConfig.signboard_height || 1.6}
                            onChange={(e) => handleSignboardChange('signboard_height', parseFloat(e.target.value))}
                            min="1.0"
                            max="5.0"
                            step="0.1"
                            className="form-input"
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem', display: 'block' }}>
                            Border Width
                        </label>
                        <input
                            type="number"
                            value={signboardConfig.border_width || 0.1}
                            onChange={(e) => handleSignboardChange('border_width', parseFloat(e.target.value))}
                            min="0"
                            max="1.0"
                            step="0.05"
                            className="form-input"
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem', display: 'block' }}>
                            Opacity
                        </label>
                        <input
                            type="number"
                            value={signboardConfig.opacity || 1.0}
                            onChange={(e) => handleSignboardChange('opacity', parseFloat(e.target.value))}
                            min="0.0"
                            max="1.0"
                            step="0.05"
                            className="form-input"
                        />
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div style={{ display: 'flex', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(102, 126, 234, 0.2)' }}>
                <button
                    type="button"
                    onClick={saveSignboardConfig}
                    disabled={loading}
                    style={{
                        padding: '0.75rem 2rem',
                        background: 'linear-gradient(135deg, rgba(39, 174, 96, 0.3), rgba(34, 153, 84, 0.3))',
                        border: '1px solid rgba(39, 174, 96, 0.5)',
                        borderRadius: '8px',
                        color: '#27ae60',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        opacity: loading ? 0.6 : 1
                    }}
                >
                    {loading ? 'Saving...' : '💾 Save Signboard Configuration'}
                </button>
            </div>

            {/* Preview Info */}
            <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'rgba(52, 152, 219, 0.1)', border: '1px solid rgba(52, 152, 219, 0.2)', borderRadius: '8px' }}>
                <p style={{ fontSize: '0.85rem', margin: 0, color: 'var(--color-text-primary)' }}>
                    💡 <strong>Preview:</strong> Visit the 3D immersive experience to see your signboard changes in real-time. Changes apply immediately after saving.
                </p>
            </div>
        </div>
    );
};

export default SignboardConfigForm;
