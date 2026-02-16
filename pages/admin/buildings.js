import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/Admin/AdminLayout';
import useModalAccessibility from '../../hooks/useModalAccessibility';
import AccessibleAlert, { useAlertManager } from '../../components/Admin/AccessibleAlert';
import { NoBuildings } from '../../components/Admin/EmptyState';
import Spinner from '../../components/UI/Spinner';
import ConfirmationModal from '../../components/UI/ConfirmationModal';
import Pagination from '../../components/UI/Pagination';
import { useAuth } from '../../contexts/AuthContext';

function BuildingsPageClient() {
  const [buildings, setBuildings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'view'
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [filterCustomer, setFilterCustomer] = useState('all');
  const [filterTemplate, setFilterTemplate] = useState('all');
  const [confirmationModal, setConfirmationModal] = useState({ isOpen: false, data: null, action: null });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();
  const { user, session, loading: authLoading } = useAuth();

  // Client-side auth check
  useEffect(() => {
    if (!authLoading && (!user || !['admin', 'super_admin'].includes(user.role))) {
      router.push('/admin/login');
    }
  }, [user, authLoading, router]);

  // Use alert manager hook
  const { alert, showSuccess, showError, clearAlert } = useAlertManager();

  const [formData, setFormData] = useState({
    customer_id: '',
    template_id: '',
    name: '',
    placement: 'center',
    signage_text: '',
    background_music_url: ''
  });

  useEffect(() => {
    if (user && session && ['admin', 'super_admin'].includes(user.role)) {
      loadData();
    }
  }, [user, session]);

  useEffect(() => {
    if (user && (filterCustomer !== 'all' || filterTemplate !== 'all')) {
      loadBuildings();
    }
  }, [filterCustomer, filterTemplate, user, page]); // Add page dependency



  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadBuildings(),
        loadCustomers(),
        loadTemplates()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadBuildings = async () => {
    try {
      let url = '/api/buildings';
      const params = new URLSearchParams();
      if (filterCustomer !== 'all') params.append('customer_id', filterCustomer);
      if (filterTemplate !== 'all') params.append('template_id', filterTemplate);

      params.append('page', page);
      params.append('limit', 15);

      if (params.toString()) url += `?${params}`;

      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setBuildings(data.buildings);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      showError('Failed to load buildings');
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await fetch('/api/customers', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setCustomers(data.customers.filter(c => c.status === 'active'));
      }
    } catch (error) {
      console.error('Failed to load customers:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/building-templates');
      const data = await response.json();
      if (data.success) {
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const resetForm = useCallback(() => {
    setFormData({
      customer_id: '',
      template_id: '',
      name: '',
      placement: 'center',
      signage_text: '',
      background_music_url: ''
    });
    setSelectedBuilding(null);
    setShowModal(false);
    setModalMode('add');
  }, []);

  const handleAdd = () => {
    resetForm();
    setModalMode('add');
    setShowModal(true);
  };

  const handleView = (building) => {
    setSelectedBuilding(building);
    setModalMode('view');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/buildings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        showSuccess('Building created successfully');
        loadBuildings();
        resetForm();
      } else {
        showError(data.error || 'Creation failed');
      }
    } catch (error) {
      showError('Failed to create building');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (buildingId) => {
    setConfirmationModal({
      isOpen: true,
      data: buildingId,
      action: 'delete'
    });
  };

  const executeDelete = async () => {
    const buildingId = confirmationModal.data;
    setLoading(true);
    setConfirmationModal(prev => ({ ...prev, isOpen: false }));

    try {
      const response = await fetch(`/api/buildings/${buildingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        showSuccess('Building deleted successfully');
        loadBuildings();
      } else {
        showError(data.error || 'Delete failed');
      }
    } catch (error) {
      showError('Failed to delete building');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };

      // Auto-fill signage text when template changes
      if (name === 'template_id') {
        const template = templates.find(t => t.id === value);
        if (template && !prev.signage_text) {
          updated.signage_text = template.default_signage_text;
        }
      }

      return updated;
    });
  };

  // Modal accessibility hook
  const { modalRef, handleBackdropClick } = useModalAccessibility(showModal, resetForm, {
    closeOnEscape: true,
    closeOnBackdropClick: true,
    initialFocusSelector: 'select:not([disabled]), input:not([disabled])',
  });

  const getStatusBadge = (status) => {
    const styles = {
      OPEN: { bg: '#d4edda', color: '#155724', text: 'Open' },
      CLOSED: { bg: '#fff3cd', color: '#856404', text: 'Closed' },
      MAINTENANCE: { bg: '#f8d7da', color: '#721c24', text: 'Maintenance' }
    };
    const style = styles[status] || styles.CLOSED;
    return (
      <span style={{
        padding: '0.25rem 0.75rem',
        borderRadius: '4px',
        backgroundColor: style.bg,
        color: style.color,
        fontSize: '0.85rem',
        fontWeight: '600'
      }}>
        {style.text}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const styles = {
      complex: { bg: '#EEF2FF', color: '#667eea', text: 'Complex' },
      shop: { bg: '#F3E8FF', color: '#764ba2', text: 'Shop' }
    };
    const style = styles[type] || styles.complex;

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

    return (
      <span style={{
        padding: '0.25rem 0.75rem',
        borderRadius: '4px',
        backgroundColor: style.bg,
        color: style.color,
        fontSize: '0.85rem',
        fontWeight: '600'
      }}>
        {style.text}
      </span>
    );
  };

  return (
    <AdminLayout currentPage="Buildings">
      <section className="admin-card" role="region" aria-labelledby="buildings-heading">
        <div className="card-header">
          <div>
            <h2 id="buildings-heading" className="card-title">Buildings Management</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Create and manage customer buildings
            </p>
          </div>
          <button className="btn btn-primary" onClick={handleAdd} aria-label="Add new building">
            Add Building
          </button>
        </div>

        {alert && (
          <AccessibleAlert
            type={alert.type}
            message={alert.message}
            dismissible={true}
            autoDismiss={true}
            onDismiss={clearAlert}
          />
        )}

        {/* Filters */}
        <div
          style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}
          role="search"
          aria-label="Building filters"
        >
          <select
            value={filterCustomer}
            onChange={(e) => setFilterCustomer(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #e1e8ed',
              borderRadius: '4px',
              minWidth: '200px'
            }}
            aria-label="Filter buildings by customer"
          >
            <option value="all">All Customers</option>
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>

          <select
            value={filterTemplate}
            onChange={(e) => setFilterTemplate(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #e1e8ed',
              borderRadius: '4px',
              minWidth: '150px'
            }}
            aria-label="Filter buildings by template type"
          >
            <option value="all">All Types</option>
            {templates.map(template => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>

          <button
            className="btn btn-secondary"
            onClick={() => {
              setFilterCustomer('all');
              setFilterTemplate('all');
              setPage(1); // Reset page
            }}
            aria-label="Reset all filters"
          >
            Reset Filters
          </button>
        </div>

        {loading ? (
          <Spinner text="Loading buildings..." />
        ) : buildings.length === 0 ? (
          <NoBuildings onAdd={handleAdd} />
        ) : (
          <>
            <div style={{ overflowX: 'auto' }} role="region" aria-label="Buildings table">
              <table className="admin-table" role="table" aria-label="List of buildings">
                <thead>
                  <tr>
                    <th scope="col">Building Name</th>
                    <th scope="col">Customer</th>
                    <th scope="col">Type</th>
                    <th scope="col">Status</th>
                    <th scope="col">Position</th>
                    <th scope="col">Created</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {buildings.map((building) => (
                    <tr key={building.id}>
                      <td style={{ fontWeight: '600' }}>{building.name}</td>
                      <td>{building.customer?.name || '-'}</td>
                      <td>{building.template ? getTypeBadge(building.template.type) : '-'}</td>
                      <td>{getStatusBadge(building.status)}</td>
                      <td style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                        {building.placement === 'center' ? 'Center' :
                          building.placement === 'left' ? 'Left' :
                            building.placement === 'right' ? 'Right' : 'Custom'}
                      </td>
                      <td style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                        <time dateTime={building.created_at}>
                          {new Date(building.created_at).toLocaleDateString()}
                        </time>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="action-btn"
                            style={{ background: '#667eea', color: 'white' }}
                            onClick={() => router.push(`/admin/buildings/${building.id}`)}
                            aria-label={`Edit ${building.name}`}
                          >
                            Edit
                          </button>
                          <button
                            className="action-btn action-btn-delete"
                            onClick={() => handleDelete(building.id)}
                            aria-label={`Delete ${building.name}`}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

            </div>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              hasNextPage={page < totalPages}
              hasPrevPage={page > 1}
              loading={loading}
            />
          </>
        )
        }
      </section >

      {/* Statistics */}
      <section role="region" aria-label="Building statistics" className="stats-grid" style={{ marginTop: '2rem' }}>
        <article role="article" aria-label="Total buildings" className="stat-card">
          <div className="stat-info">
            <h3>Total Buildings</h3>
            <p className="stat-value" aria-label={`${buildings.length} total buildings`}>{buildings.length}</p>
          </div>
        </article>

        <article role="article" aria-label="Open buildings" className="stat-card">
          <div className="stat-info">
            <h3>Open</h3>
            <p className="stat-value" style={{ color: '#27ae60' }} aria-label={`${buildings.filter(b => b.status === 'OPEN').length} open buildings`}>
              {buildings.filter(b => b.status === 'OPEN').length}
            </p>
          </div>
        </article>

        <article role="article" aria-label="Complex buildings" className="stat-card">
          <div className="stat-info">
            <h3>Complex Buildings</h3>
            <p className="stat-value" style={{ color: '#667eea' }} aria-label={`${buildings.filter(b => b.template?.type === 'complex').length} complex buildings`}>
              {buildings.filter(b => b.template?.type === 'complex').length}
            </p>
          </div>
        </article>

        <article role="article" aria-label="Shop buildings" className="stat-card">
          <div className="stat-info">
            <h3>Shops</h3>
            <p className="stat-value" style={{ color: '#764ba2' }} aria-label={`${buildings.filter(b => b.template?.type === 'shop').length} shop buildings`}>
              {buildings.filter(b => b.template?.type === 'shop').length}
            </p>
          </div>
        </article>
      </section >

      {/* Add Building Modal */}
      {
        showModal && modalMode === 'add' && (
          <div
            onClick={handleBackdropClick}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000
            }} role="dialog" aria-modal="true" aria-labelledby="add-building-modal-title">
            <div
              ref={modalRef}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                width: '90%',
                maxWidth: '700px',
                maxHeight: '90vh',
                overflow: 'auto',
                padding: '2rem'
              }} role="document">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 id="add-building-modal-title" style={{ margin: 0 }}>Add New Building</h2>
                <button
                  onClick={resetForm}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: '#6c757d'
                  }}
                  aria-label="Close modal"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} aria-label="Add new building form">
                <div className="form-group">
                  <label htmlFor="customer-select" className="form-label">Customer *</label>
                  <select
                    id="customer-select"
                    name="customer_id"
                    value={formData.customer_id}
                    onChange={handleInputChange}
                    className="form-select"
                    required
                    aria-required="true"
                    aria-label="Select customer for building"
                  >
                    <option value="">Select Customer</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} - {customer.subscription_tier}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="template-select" className="form-label">Building Template *</label>
                  <select
                    id="template-select"
                    name="template_id"
                    value={formData.template_id}
                    onChange={handleInputChange}
                    className="form-select"
                    required
                    aria-required="true"
                    aria-label="Select building template"
                  >
                    <option value="">Select Template</option>
                    {templates.map(template => (
                      <option key={template.id} value={template.id}>
                        {template.name} ({template.width}m × {template.depth}m)
                      </option>
                    ))}
                  </select>
                  {formData.template_id && (
                    <div style={{ marginTop: '0.5rem', padding: '0.75rem', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                      {templates.find(t => t.id === formData.template_id)?.description}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="building-name" className="form-label">Building Name *</label>
                  <input
                    id="building-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="e.g., Downtown Medical Center"
                    required
                    aria-required="true"
                    aria-label="Building name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="placement-select" className="form-label">Placement</label>
                  <select
                    id="placement-select"
                    name="placement"
                    value={formData.placement}
                    onChange={handleInputChange}
                    className="form-select"
                    aria-label="Select building placement"
                  >
                    <option value="center">Center (Default)</option>
                    <option value="left">Left of existing buildings</option>
                    <option value="right">Right of existing buildings</option>
                  </select>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#6c757d' }}>
                    Auto-placement will position the building based on existing buildings for this customer
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="signage-text" className="form-label">Signage Text</label>
                  <input
                    id="signage-text"
                    type="text"
                    name="signage_text"
                    value={formData.signage_text}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Text displayed on building signage"
                    aria-label="Signage text"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="music-url" className="form-label">Background Music URL</label>
                  <input
                    id="music-url"
                    type="text"
                    name="background_music_url"
                    value={formData.background_music_url}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="https://example.com/music.mp3"
                    aria-label="Background music URL"
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="submit" className="btn btn-primary" disabled={loading} aria-label="Create building">
                    {loading ? 'Creating...' : 'Create Building'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={resetForm} aria-label="Cancel and close modal">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {/* View Building Modal */}
      {
        showModal && modalMode === 'view' && selectedBuilding && (
          <div
            onClick={handleBackdropClick}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000
            }} role="dialog" aria-modal="true" aria-labelledby="view-building-modal-title">
            <div
              ref={modalRef}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                width: '90%',
                maxWidth: '700px',
                maxHeight: '90vh',
                overflow: 'auto',
                padding: '2rem'
              }} role="document">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 id="view-building-modal-title" style={{ margin: 0 }}>Building Details</h2>
                <button
                  onClick={resetForm}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: '#6c757d'
                  }}
                  aria-label="Close modal"
                >
                  ×
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <div style={{ fontWeight: '600', color: '#6c757d', fontSize: '0.85rem' }}>Building Name</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>{selectedBuilding.name}</div>
                </div>

                <div>
                  <div style={{ fontWeight: '600', color: '#6c757d', fontSize: '0.85rem' }}>Customer</div>
                  <div>{selectedBuilding.customer?.name} ({selectedBuilding.customer?.subscription_tier})</div>
                </div>

                <div>
                  <div style={{ fontWeight: '600', color: '#6c757d', fontSize: '0.85rem' }}>Template</div>
                  <div>{selectedBuilding.template?.name} - {selectedBuilding.template?.type}</div>
                  <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                    {selectedBuilding.template?.width}m × {selectedBuilding.template?.depth}m × {selectedBuilding.template?.wall_height}m
                  </div>
                </div>

                <div>
                  <div style={{ fontWeight: '600', color: '#6c757d', fontSize: '0.85rem' }}>Status</div>
                  <div>{getStatusBadge(selectedBuilding.status)}</div>
                </div>

                <div>
                  <div style={{ fontWeight: '600', color: '#6c757d', fontSize: '0.85rem' }}>3D Position</div>
                  <div style={{ fontSize: '0.9rem' }}>
                    X: {selectedBuilding.position_x}, Y: {selectedBuilding.position_y}, Z: {selectedBuilding.position_z}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                    Placement: {selectedBuilding.placement}
                  </div>
                </div>

                {selectedBuilding.signage_text && (
                  <div>
                    <div style={{ fontWeight: '600', color: '#6c757d', fontSize: '0.85rem' }}>Signage Text</div>
                    <div>{selectedBuilding.signage_text}</div>
                  </div>
                )}

                {selectedBuilding.description && (
                  <div>
                    <div style={{ fontWeight: '600', color: '#6c757d', fontSize: '0.85rem' }}>Description</div>
                    <div>{selectedBuilding.description}</div>
                  </div>
                )}

                <div>
                  <div style={{ fontWeight: '600', color: '#6c757d', fontSize: '0.85rem' }}>Created</div>
                  <div>{new Date(selectedBuilding.created_at).toLocaleString()}</div>
                </div>

                <div>
                  <div style={{ fontWeight: '600', color: '#6c757d', fontSize: '0.85rem' }}>Slug</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{selectedBuilding.slug}</div>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={resetForm} aria-label="Close modal">
                  Close
                </button>
              </div>
            </div>
          </div>
        )
      }

      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal({ ...confirmationModal, isOpen: false })}
        onConfirm={executeDelete}
        title="Delete Building"
        message="Are you sure you want to delete this building? This action cannot be undone and may affect active customers."
        confirmText="Delete Building"
        variant="danger"
        verificationText="DELETE"
      />
    </AdminLayout >
  );
}

// Export with SSR disabled to prevent router mounting issues during build

export default BuildingsPageClient;


// Protect admin route - require authentication and admin role
