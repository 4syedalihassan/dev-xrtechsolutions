// Admin Individual Furniture Management Page
// View and edit specific furniture item
// Sprint 3 - User Story 3.4

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';

// Client component that uses useRouter
function AdminFurnitureDetailClient() {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading: authLoading } = useAuth();

  const [furniture, setFurniture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({});

  // Client-side auth check
  useEffect(() => {
    if (!authLoading && (!user || !['admin', 'super_admin'].includes(user.role))) {
      router.push('/admin/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (id && user && ['admin', 'super_admin'].includes(user.role)) {
      loadFurniture();
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
        background: '#f5f7fa'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f0f0f0',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: '#666' }}>Loading...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  async function loadFurniture() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/furniture/${id}`);
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to load furniture');
      }

      setFurniture(data.furniture);
      setFormData({
        name: data.furniture.name || '',
        furniture_type: data.furniture.furniture_type || '',
        position_x: data.furniture.position_x || 0,
        position_y: data.furniture.position_y || 0,
        position_z: data.furniture.position_z || 0,
        rotation_x: data.furniture.rotation_x || 0,
        rotation_y: data.furniture.rotation_y || 0,
        rotation_z: data.furniture.rotation_z || 0,
        scale_x: data.furniture.scale_x || 1,
        scale_y: data.furniture.scale_y || 1,
        scale_z: data.furniture.scale_z || 1,
        color: data.furniture.color || '#FFFFFF',
        material: data.furniture.material || '',
        has_collision: data.furniture.has_collision !== undefined ? data.furniture.has_collision : true,
        collision_type: data.furniture.collision_type || 'box',
        is_interactive: data.furniture.is_interactive || false,
        interaction_type: data.furniture.interaction_type || '',
        display_order: data.furniture.display_order || 0,
        active: data.furniture.active !== undefined ? data.furniture.active : true
      });

    } catch (err) {
      console.error('Error loading furniture:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);

      const updateData = {
        ...formData,
        position_x: parseFloat(formData.position_x),
        position_y: parseFloat(formData.position_y),
        position_z: parseFloat(formData.position_z),
        rotation_x: parseFloat(formData.rotation_x),
        rotation_y: parseFloat(formData.rotation_y),
        rotation_z: parseFloat(formData.rotation_z),
        scale_x: parseFloat(formData.scale_x),
        scale_y: parseFloat(formData.scale_y),
        scale_z: parseFloat(formData.scale_z),
        display_order: parseInt(formData.display_order)
      };

      const res = await fetch(`/api/furniture/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to update furniture');
      }

      alert('Furniture updated successfully!');
      loadFurniture();

    } catch (err) {
      console.error('Error saving furniture:', err);
      setError(err.message);
      alert(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete "${furniture.name || furniture.furniture_type}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/furniture/${id}`, {
        method: 'DELETE'
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to delete furniture');
      }

      alert('Furniture deleted successfully!');
      router.push('/admin/furniture');

    } catch (err) {
      console.error('Error deleting furniture:', err);
      alert(`Error: ${err.message}`);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }} role="status" aria-live="polite">
        <p>Loading furniture...</p>
      </div>
    );
  }

  if (error && !furniture) {
    return (
      <div style={{ padding: '2rem' }}>
        <div style={{
          padding: '1rem',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          borderRadius: '4px'
        }} role="alert" aria-live="polite">
          Error: {error}
        </div>
        <Link href="/admin/furniture" style={{ color: '#667eea', marginTop: '1rem', display: 'inline-block' }}>
          ← Back to Furniture List
        </Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Edit Furniture - {furniture?.name || furniture?.furniture_type} - Admin Portal</title>
      </Head>

      <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Header */}
          <header style={{ marginBottom: '2rem', borderBottom: '2px solid #667eea', paddingBottom: '1rem' }} role="banner">
            <h1 style={{ margin: 0, color: '#667eea' }}>
              Edit Furniture: {furniture?.name || furniture?.furniture_type}
            </h1>
            <nav style={{ marginTop: '1rem' }} aria-label="Breadcrumb">
              <Link href="/admin/furniture" style={{ color: '#667eea', textDecoration: 'none', marginRight: '1rem' }}>
                ← Back to Furniture List
              </Link>
              {furniture?.building && (
                <Link
                  href={`/admin/buildings/${furniture.building.id}`}
                  style={{ color: '#667eea', textDecoration: 'none' }}
                >
                  View Building: {furniture.building.name}
                </Link>
              )}
            </nav>
          </header>

          {/* Error Message */}
          {error && (
            <div style={{
              padding: '1rem',
              backgroundColor: '#f8d7da',
              color: '#721c24',
              borderRadius: '4px',
              marginBottom: '1rem'
            }} role="alert" aria-live="polite">
              Error: {error}
            </div>
          )}

          {/* Edit Form */}
          <form onSubmit={handleSave} aria-label="Edit furniture form">
            {/* Basic Info */}
            <div style={{
              marginBottom: '2rem',
              padding: '1.5rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <h2 style={{ marginTop: 0, color: '#667eea' }}>Basic Information</h2>
              <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Type
                  </label>
                  <input
                    type="text"
                    value={formData.furniture_type}
                    disabled
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      backgroundColor: '#e9ecef'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Status
                  </label>
                  <select
                    value={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.value === 'true' })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Position */}
            <div style={{
              marginBottom: '2rem',
              padding: '1.5rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <h2 style={{ marginTop: 0, color: '#667eea' }}>Position</h2>
              <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr 1fr' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>X</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.position_x}
                    onChange={(e) => setFormData({ ...formData, position_x: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Y</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.position_y}
                    onChange={(e) => setFormData({ ...formData, position_y: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Z</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.position_z}
                    onChange={(e) => setFormData({ ...formData, position_z: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
              </div>
            </div>

            {/* Rotation */}
            <div style={{
              marginBottom: '2rem',
              padding: '1.5rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <h2 style={{ marginTop: 0, color: '#667eea' }}>Rotation (radians)</h2>
              <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr 1fr' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>X</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.rotation_x}
                    onChange={(e) => setFormData({ ...formData, rotation_x: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Y</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.rotation_y}
                    onChange={(e) => setFormData({ ...formData, rotation_y: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Z</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.rotation_z}
                    onChange={(e) => setFormData({ ...formData, rotation_z: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
              </div>
            </div>

            {/* Scale */}
            <div style={{
              marginBottom: '2rem',
              padding: '1.5rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <h2 style={{ marginTop: 0, color: '#667eea' }}>Scale</h2>
              <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr 1fr' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>X</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.scale_x}
                    onChange={(e) => setFormData({ ...formData, scale_x: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Y</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.scale_y}
                    onChange={(e) => setFormData({ ...formData, scale_y: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Z</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.scale_z}
                    onChange={(e) => setFormData({ ...formData, scale_z: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
              </div>
            </div>

            {/* Appearance */}
            <div style={{
              marginBottom: '2rem',
              padding: '1.5rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <h2 style={{ marginTop: 0, color: '#667eea' }}>Appearance</h2>
              <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Color
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      style={{ width: '60px', height: '40px', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      placeholder="#FFFFFF"
                      style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Material
                  </label>
                  <select
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                  >
                    <option value="">Default</option>
                    <option value="wood">Wood</option>
                    <option value="metal">Metal</option>
                    <option value="glass">Glass</option>
                    <option value="plastic">Plastic</option>
                    <option value="fabric">Fabric</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Collision */}
            <div style={{
              marginBottom: '2rem',
              padding: '1.5rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <h2 style={{ marginTop: 0, color: '#667eea' }}>Collision Settings</h2>
              <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Has Collision
                  </label>
                  <select
                    value={formData.has_collision}
                    onChange={(e) => setFormData({ ...formData, has_collision: e.target.value === 'true' })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Collision Type
                  </label>
                  <select
                    value={formData.collision_type}
                    onChange={(e) => setFormData({ ...formData, collision_type: e.target.value })}
                    disabled={!formData.has_collision}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      backgroundColor: formData.has_collision ? 'white' : '#e9ecef'
                    }}
                  >
                    <option value="box">Box</option>
                    <option value="sphere">Sphere</option>
                    <option value="cylinder">Cylinder</option>
                    <option value="custom">Custom</option>
                    <option value="none">None</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Interaction */}
            <div style={{
              marginBottom: '2rem',
              padding: '1.5rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <h2 style={{ marginTop: 0, color: '#667eea' }}>Interaction Settings</h2>
              <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Is Interactive
                  </label>
                  <select
                    value={formData.is_interactive}
                    onChange={(e) => setFormData({ ...formData, is_interactive: e.target.value === 'true' })}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Interaction Type
                  </label>
                  <select
                    value={formData.interaction_type}
                    onChange={(e) => setFormData({ ...formData, interaction_type: e.target.value })}
                    disabled={!formData.is_interactive}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      backgroundColor: formData.is_interactive ? 'white' : '#e9ecef'
                    }}
                  >
                    <option value="">None</option>
                    <option value="desk">Desk</option>
                    <option value="storage">Storage</option>
                    <option value="medical_equipment">Medical Equipment</option>
                    <option value="pharmacy_counter">Pharmacy Counter</option>
                    <option value="display">Display</option>
                    <option value="checkout">Checkout</option>
                    <option value="info_display">Info Display</option>
                    <option value="light_switch">Light Switch</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '0.75rem 2rem',
                    backgroundColor: saving ? '#ccc' : '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    fontSize: '1rem',
                    fontWeight: 'bold'
                  }}
                  aria-label="Save furniture changes"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/admin/furniture')}
                  style={{
                    padding: '0.75rem 2rem',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                  aria-label="Cancel editing"
                >
                  Cancel
                </button>
              </div>

              <button
                type="button"
                onClick={handleDelete}
                style={{
                  padding: '0.75rem 2rem',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                aria-label={`Delete ${furniture?.name || furniture?.furniture_type}`}
              >
                Delete Furniture
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

// Export with SSR disabled to prevent router mounting issues during build

export default AdminFurnitureDetailClient;


// Protect admin route - require authentication and admin role
