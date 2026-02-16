// Admin Furniture Management Page - Client Component
// List all furniture with filters and create new items
// Sprint 3 - User Story 3.3

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import AdminLayout from './AdminLayout';
import { useAlertManager } from './AccessibleAlert';
import { NoFurniture } from './EmptyState';
import Spinner from '../UI/Spinner';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminFurnitureClient() {
  const router = useRouter();
  const { session } = useAuth();
  const [furniture, setFurniture] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [furnitureTypes, setFurnitureTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use alert manager hook
  const { showSuccess, showError } = useAlertManager();

  // Filters
  const [filterBuildingId, setFilterBuildingId] = useState('');
  const [filterFurnitureType, setFilterFurnitureType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterActive, setFilterActive] = useState('true');

  // Create form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [formData, setFormData] = useState({
    building_id: '',
    name: '',
    position_x: 0,
    position_y: 0,
    position_z: 0
  });

  // Initialize building filter from URL query params
  useEffect(() => {
    if (router.query.building_id) {
      setFilterBuildingId(router.query.building_id);
      // Also pre-select in create form
      setFormData(prev => ({ ...prev, building_id: router.query.building_id }));
    }
  }, [router.query.building_id]);

  useEffect(() => {
    loadData();
  }, [filterBuildingId, filterFurnitureType, filterActive]);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);

      // Build query params
      const params = new URLSearchParams();
      if (filterBuildingId) params.append('building_id', filterBuildingId);
      if (filterFurnitureType) params.append('furniture_type', filterFurnitureType);
      if (filterActive) params.append('active', filterActive);

      // Load furniture
      const furnitureRes = await fetch(`/api/furniture?${params.toString()}`);
      const furnitureData = await furnitureRes.json();

      if (!furnitureData.success) {
        throw new Error(furnitureData.error || 'Failed to load furniture');
      }

      setFurniture(furnitureData.furniture || []);

      // Load buildings (only once)
      if (buildings.length === 0) {
        const buildingsRes = await fetch('/api/buildings');
        const buildingsData = await buildingsRes.json();
        if (buildingsData.success) {
          setBuildings(buildingsData.buildings || []);
        }
      }

      // Load furniture types (only once)
      if (furnitureTypes.length === 0) {
        const typesRes = await fetch('/api/furniture-types');
        const typesData = await typesRes.json();
        if (typesData.success) {
          setFurnitureTypes(typesData.furniture_types || []);
          setCategories(typesData.categories || []);
        }
      }

    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();

    if (!formData.building_id) {
      alert('Please select a building');
      return;
    }

    if (!selectedTypeId) {
      alert('Please select a furniture type');
      return;
    }

    try {
      setCreating(true);

      // Get default properties for selected type
      const selectedType = furnitureTypes.find(t => t.id === selectedTypeId);
      if (!selectedType) {
        throw new Error('Invalid furniture type');
      }

      const createData = {
        building_id: formData.building_id,
        furniture_type: selectedTypeId,
        name: formData.name || selectedType.name,
        position_x: parseFloat(formData.position_x) || 0,
        position_y: parseFloat(formData.position_y) || 0,
        position_z: parseFloat(formData.position_z) || 0,
        ...selectedType.default_properties
      };

      const res = await fetch('/api/furniture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(createData)
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create furniture');
      }

      showSuccess('Furniture created successfully!');
      setShowCreateForm(false);
      setFormData({
        building_id: '',
        name: '',
        position_x: 0,
        position_y: 0,
        position_z: 0
      });
      setSelectedTypeId('');
      loadData();

    } catch (err) {
      console.error('Error creating furniture:', err);
      showError(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id, name) {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/furniture/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to delete furniture');
      }

      showSuccess('Furniture deleted successfully!');
      loadData();

    } catch (err) {
      console.error('Error deleting furniture:', err);
      showError(err.message);
    }
  }

  // Group furniture by building
  const furnitureByBuilding = furniture.reduce((acc, item) => {
    const buildingId = item.building?.id || 'unknown';
    const buildingName = item.building?.name || 'Unknown Building';
    const buildingKey = `${buildingId}|${buildingName}`;
    if (!acc[buildingKey]) {
      acc[buildingKey] = {
        id: buildingId,
        name: buildingName,
        items: []
      };
    }
    acc[buildingKey].items.push(item);
    return acc;
  }, {});

  return (
    <AdminLayout currentPage="Furniture">
      {/* Header with Actions */}
      <section className="admin-card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Furniture Management</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', margin: '0.5rem 0 0 0' }}>
              Manage furniture items across all buildings
            </p>
          </div>
          <div className="card-actions">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="btn btn-primary"
              aria-label={showCreateForm ? 'Cancel adding furniture' : 'Add new furniture'}
            >
              {showCreateForm ? 'Cancel' : '+ Add Furniture'}
            </button>
            <button
              onClick={loadData}
              className="btn btn-secondary"
              aria-label="Refresh furniture list"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: showCreateForm ? '1.5rem' : '0'
        }} role="search" aria-label="Furniture filters">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.85rem' }}>
              Building
            </label>
            <select
              value={filterBuildingId}
              onChange={(e) => setFilterBuildingId(e.target.value)}
              className="form-select"
            >
              <option value="">All Buildings</option>
              {buildings.map(building => (
                <option key={building.id} value={building.id}>
                  {building.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.85rem' }}>
              Furniture Type
            </label>
            <select
              value={filterFurnitureType}
              onChange={(e) => setFilterFurnitureType(e.target.value)}
              className="form-select"
            >
              <option value="">All Types</option>
              {furnitureTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.85rem' }}>
              Status
            </label>
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="form-select"
            >
              <option value="">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
      </section>

      {/* Create Form */}
      {showCreateForm && (
        <section className="admin-card">
          <h3 style={{ marginTop: 0, color: 'var(--color-text-primary)', fontSize: '1.25rem', marginBottom: '1.5rem' }}>
            Add New Furniture
          </h3>
          <form onSubmit={handleCreate}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Building *
                </label>
                <select
                  value={formData.building_id}
                  onChange={(e) => setFormData({ ...formData, building_id: e.target.value })}
                  required
                  className="form-select"
                >
                  <option value="">Select Building</option>
                  {buildings.map(building => (
                    <option key={building.id} value={building.id}>
                      {building.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Furniture Type *
                </label>
                <select
                  value={selectedTypeId}
                  onChange={(e) => setSelectedTypeId(e.target.value)}
                  required
                  className="form-select"
                >
                  <option value="">Select Type</option>
                  {categories.map(category => {
                    const typesInCategory = furnitureTypes.filter(t => t.category === category);
                    return (
                      <optgroup key={category} label={category.toUpperCase()}>
                        {typesInCategory.map(type => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Custom Name (optional)
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Leave empty for default name"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Position (X, Y, Z)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                <input
                  type="number"
                  step="0.1"
                  value={formData.position_x}
                  onChange={(e) => setFormData({ ...formData, position_x: e.target.value })}
                  placeholder="X"
                  className="form-input"
                />
                <input
                  type="number"
                  step="0.1"
                  value={formData.position_y}
                  onChange={(e) => setFormData({ ...formData, position_y: e.target.value })}
                  placeholder="Y"
                  className="form-input"
                />
                <input
                  type="number"
                  step="0.1"
                  value={formData.position_z}
                  onChange={(e) => setFormData({ ...formData, position_z: e.target.value })}
                  placeholder="Z"
                  className="form-input"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                type="submit"
                disabled={creating}
                className="btn btn-success"
              >
                {creating ? 'Creating...' : 'Create Furniture'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Loading/Error States */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <Spinner text="Loading furniture..." />
        </div>
      )}

      {error && !loading && (
        <div className="alert alert-error" role="alert" aria-live="polite">
          Error: {error}
        </div>
      )}

      {/* Furniture List */}
      {!loading && !error && (
        <>
          <div style={{ marginBottom: '1rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }} aria-live="polite">
            Total: {furniture.length} item{furniture.length !== 1 ? 's' : ''}
          </div>

          {furniture.length === 0 ? (
            <NoFurniture onAdd={() => setShowCreateForm(true)} />
          ) : (
            Object.keys(furnitureByBuilding).map(buildingKey => {
              const buildingGroup = furnitureByBuilding[buildingKey];
              return (
              <section key={buildingKey} className="admin-card">
                <div className="card-header">
                  <h3 className="card-title">
                    {buildingGroup.name} ({buildingGroup.items.length})
                  </h3>
                </div>

                <table className="admin-table">
                  <thead>
                    <tr>
                      <th scope="col">Name</th>
                      <th scope="col">Type</th>
                      <th scope="col">Position</th>
                      <th scope="col">Scale</th>
                      <th scope="col">Color</th>
                      <th scope="col">Status</th>
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buildingGroup.items.map(item => (
                      <tr key={item.id} style={{ opacity: item.active ? 1 : 0.6 }}>
                        <td>
                          <strong>{item.name || item.furniture_type}</strong>
                        </td>
                        <td style={{ textTransform: 'capitalize' }}>
                          {item.furniture_type?.replace(/_/g, ' ')}
                        </td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                          ({item.position_x?.toFixed(1)}, {item.position_y?.toFixed(1)}, {item.position_z?.toFixed(1)})
                        </td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                          ({item.scale_x?.toFixed(2)}, {item.scale_y?.toFixed(2)}, {item.scale_z?.toFixed(2)})
                        </td>
                        <td>
                          {item.color && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{
                                display: 'inline-block',
                                width: '24px',
                                height: '24px',
                                backgroundColor: item.color,
                                border: '2px solid var(--color-border-light)',
                                borderRadius: '4px'
                              }}></span>
                              <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{item.color}</span>
                            </div>
                          )}
                        </td>
                        <td>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '4px',
                            backgroundColor: item.active ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
                            color: item.active ? 'var(--color-success)' : 'var(--color-danger)',
                            fontSize: '0.85rem',
                            fontWeight: '600'
                          }}>
                            {item.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="table-actions">
                            <Link
                              href={`/admin/furniture/${item.id}`}
                              className="action-btn"
                              style={{ background: 'var(--color-primary)', color: 'white', textDecoration: 'none' }}
                              aria-label={`Edit ${item.name || item.furniture_type}`}
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(item.id, item.name || item.furniture_type)}
                              className="action-btn action-btn-delete"
                              aria-label={`Delete ${item.name || item.furniture_type}`}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
              );
            })
          )}
        </>
      )}
    </AdminLayout>
  );
}
