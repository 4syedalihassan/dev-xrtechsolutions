import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/Admin/AdminLayout';
import useModalAccessibility from '../../hooks/useModalAccessibility';
import AccessibleAlert, { useAlertManager } from '../../components/Admin/AccessibleAlert';
import { NoData } from '../../components/Admin/EmptyState';
import Spinner from '../../components/UI/Spinner';
import ConfirmationModal from '../../components/UI/ConfirmationModal';
import { useAuth } from '../../contexts/AuthContext';

function CategoriesPageClient() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', 'view'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState({ isOpen: false, data: null, action: null });
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
    name: '',
    description: ''
  });

  useEffect(() => {
    if (user && session && ['admin', 'super_admin'].includes(user.role)) {
      loadCategories();
    }
  }, [user, session]);

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

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      showError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = useCallback(() => {
    setFormData({ name: '', description: '' });
    setSelectedCategory(null);
    setShowModal(false);
    setModalMode('add');
  }, []);

  const handleAdd = () => {
    resetForm();
    setModalMode('add');
    setShowModal(true);
  };

  const handleView = (category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || ''
    });
    setModalMode('view');
    setShowModal(true);
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || ''
    });
    setModalMode('edit');
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setConfirmationModal({
      isOpen: true,
      data: id,
      action: 'delete'
    });
  };

  const executeDelete = async () => {
    const id = confirmationModal.data;
    setLoading(true);
    setConfirmationModal(prev => ({ ...prev, isOpen: false }));

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        showSuccess('Category deleted successfully');
        loadCategories();
      } else {
        showError(data.error || 'Failed to delete category');
      }
    } catch (error) {
      showError('Failed to delete category');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = modalMode === 'edit' ? `/api/categories/${selectedCategory.id}` : '/api/categories';
      const method = modalMode === 'edit' ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        showSuccess(modalMode === 'edit' ? 'Category updated successfully' : 'Category added successfully');
        loadCategories();
        resetForm();
      } else {
        showError(data.error || 'Operation failed');
      }
    } catch (error) {
      showError('Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Modal accessibility hook
  const { modalRef, handleBackdropClick } = useModalAccessibility(showModal, resetForm, {
    closeOnEscape: true,
    closeOnBackdropClick: true,
    initialFocusSelector: 'input:not([disabled])',
  });

  return (
    <AdminLayout currentPage="Categories">
      <section className="admin-card" role="region" aria-labelledby="categories-heading">
        <div className="card-header">
          <div>
            <h2 id="categories-heading" className="card-title">Categories Management</h2>
            <p style={{ color: '#6c757d', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>
              Manage product categories and classifications
            </p>
          </div>
          <button className="btn btn-primary" onClick={handleAdd} aria-label="Add new category">
            Add New Category
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

        {loading ? (
          <Spinner text="Loading categories..." />
        ) : categories.length === 0 ? (
          <NoData resourceName="categories" onAdd={handleAdd} />
        ) : (
          <div style={{ overflowX: 'auto' }} role="region" aria-label="Categories table">
            <table className="admin-table" role="table" aria-label="List of categories">
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Category Name</th>
                  <th scope="col">Description</th>
                  <th scope="col">Created</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td style={{ fontWeight: '600' }}>#{category.id}</td>
                    <td style={{ fontWeight: '600' }}>{category.name}</td>
                    <td style={{ color: '#6c757d', maxWidth: '400px' }}>
                      {category.description || 'No description'}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                      <time dateTime={category.created_at}>
                        {new Date(category.created_at).toLocaleDateString()}
                      </time>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="action-btn"
                          style={{ background: '#667eea', color: 'white' }}
                          onClick={() => handleView(category)}
                          aria-label={`View ${category.name}`}
                        >
                          View
                        </button>
                        <button
                          className="action-btn action-btn-edit"
                          onClick={() => handleEdit(category)}
                          aria-label={`Edit ${category.name}`}
                        >
                          Edit
                        </button>
                        <button
                          className="action-btn action-btn-delete"
                          onClick={() => handleDelete(category.id)}
                          aria-label={`Delete ${category.name}`}
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
        )}
      </section>

      {/* Modal */}
      {showModal && (
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
          }} role="dialog" aria-modal="true" aria-labelledby="category-modal-title">
          <div
            ref={modalRef}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              width: '90%',
              maxWidth: '600px',
              padding: '2rem'
            }} role="document">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 id="category-modal-title" style={{ margin: 0 }}>
                {modalMode === 'add' ? 'Add New Category' : modalMode === 'edit' ? 'Edit Category' : 'View Category'}
              </h2>
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

            <form onSubmit={handleSubmit} aria-label={`${modalMode === 'add' ? 'Add new' : modalMode === 'edit' ? 'Edit' : 'View'} category form`}>
              <div className="form-group">
                <label htmlFor="category-name" className="form-label">Category Name *</label>
                <input
                  id="category-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  aria-required="true"
                  disabled={modalMode === 'view'}
                  placeholder="e.g., Floral, Woody, Fresh"
                />
              </div>

              <div className="form-group">
                <label htmlFor="category-description" className="form-label">Description</label>
                <textarea
                  id="category-description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-textarea"
                  disabled={modalMode === 'view'}
                  placeholder="Describe this category..."
                  aria-label="Category description"
                />
              </div>

              {modalMode !== 'view' && (
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="submit" className="btn btn-primary" disabled={loading} aria-label={modalMode === 'edit' ? 'Update category' : 'Add category'}>
                    {loading ? 'Saving...' : modalMode === 'edit' ? 'Update Category' : 'Add Category'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={resetForm} aria-label="Cancel and close modal">
                    Cancel
                  </button>
                </div>
              )}
              {modalMode === 'view' && (
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="button" className="btn btn-primary" onClick={() => setModalMode('edit')} aria-label="Switch to edit mode">
                    Edit Category
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={resetForm} aria-label="Close modal">
                    Close
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal({ ...confirmationModal, isOpen: false })}
        onConfirm={executeDelete}
        title="Delete Category"
        message="Are you sure you want to delete this category? This will remove the category from all associated products."
        confirmText="Delete Category"
      />
    </AdminLayout >
  );
}

// Export with SSR disabled to prevent router mounting issues during build

export default CategoriesPageClient;


// Protect admin route - require authentication and admin role
