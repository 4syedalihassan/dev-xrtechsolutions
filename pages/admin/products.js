import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/Admin/AdminLayout';
import useModalAccessibility from '../../hooks/useModalAccessibility';
import AccessibleAlert, { useAlertManager } from '../../components/Admin/AccessibleAlert';
import { NoProducts } from '../../components/Admin/EmptyState';
import Spinner from '../../components/UI/Spinner';
import FileUpload from '../../components/Admin/FileUpload';
import ConfirmationModal from '../../components/UI/ConfirmationModal';
import Pagination from '../../components/UI/Pagination';
import { useAuth } from '../../contexts/AuthContext';

function ProductsPageClient() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', 'view'
  const [selectedProduct, setSelectedProduct] = useState(null);
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
    name: '',
    brand: '',
    category: '',
    description: '',
    price: '',
    size_ml: '',
    stock_quantity: '',
    fragrance_notes: '',
    shelf_index: '',
    slot_index: '',
    image_url: '',
    model_3d_url: ''
  });

  useEffect(() => {
    if (user && ['admin', 'super_admin'].includes(user.role)) {
      loadProducts();
      loadCategories();
      loadBuildings();
      loadSettings();
    }
  }, [user]);



  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      showError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadBuildings = async () => {
    try {
      const response = await fetch('/api/buildings');
      const data = await response.json();
      if (data.success) {
        setBuildings(data.buildings);
      }
    } catch (error) {
      console.error('Failed to load buildings:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Failed to load settings:', error);
      // Default to USD if settings fail to load
      setSettings({ currency_symbol: '$' });
    }
  };

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      brand: '',
      category: '',
      description: '',
      price: '',
      size_ml: '',
      stock_quantity: '',
      fragrance_notes: '',
      shelf_index: '',
      slot_index: '',
      image_url: '',
      model_3d_url: ''
    });
    setSelectedProduct(null);
    setShowModal(false);
    setModalMode('add');
  }, []);

  const handleAdd = () => {
    resetForm();
    setModalMode('add');
    setShowModal(true);
  };

  const handleView = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      brand: product.brand,
      category: typeof product.category === 'object' ? product.category?.name : product.category,
      description: product.description || '',
      price: product.price,
      size_ml: product.size_ml,
      stock_quantity: product.stock_quantity,
      fragrance_notes: product.fragrance_notes || '',
      shelf_index: product.shelf_index,
      slot_index: product.slot_index,
      image_url: product.image_url || '',
      model_3d_url: product.model_3d_url || ''
    });
    setModalMode('view');
    setShowModal(true);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      brand: product.brand,
      category: typeof product.category === 'object' ? product.category?.name : product.category,
      description: product.description || '',
      price: product.price,
      size_ml: product.size_ml,
      stock_quantity: product.stock_quantity,
      fragrance_notes: product.fragrance_notes || '',
      shelf_index: product.shelf_index,
      slot_index: product.slot_index,
      image_url: product.image_url || '',
      model_3d_url: product.model_3d_url || ''
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
    setConfirmationModal(prev => ({ ...prev, isOpen: false })); // Close modal immediately or keep open with loading state? Modal has loading prop.

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        showSuccess('Product deleted successfully');
        loadProducts();
      } else {
        showError(data.error || 'Failed to delete product');
      }
    } catch (error) {
      showError('Failed to delete product');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Find category_id from category name
      const selectedCategory = categories.find(cat => cat.name === formData.category);
      if (!selectedCategory) {
        showError('Please select a valid category');
        setLoading(false);
        return;
      }

      // Get default building (first building or the one from existing product)
      let building_id;
      if (modalMode === 'edit' && selectedProduct?.building_id) {
        building_id = selectedProduct.building_id;
      } else if (buildings.length > 0) {
        building_id = buildings[0].id;
      } else {
        showError('No buildings available. Please create a building first.');
        setLoading(false);
        return;
      }

      // Prepare data with proper IDs
      const submitData = {
        ...formData,
        building_id,
        category_id: selectedCategory.id,
      };
      // Remove the category name field as we're sending category_id
      delete submitData.category;

      const url = modalMode === 'edit' ? `/api/products/${selectedProduct.id}` : '/api/products';
      const method = modalMode === 'edit' ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(submitData)
      });

      const data = await response.json();

      if (data.success) {
        showSuccess(modalMode === 'edit' ? 'Product updated successfully' : 'Product added successfully');
        loadProducts();
        resetForm();
      } else {
        showError(data.error || 'Operation failed');
      }
    } catch (error) {
      showError('Failed to save product');
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
            border: '4px solid var(--border-subtle)',
            borderTop: '4px solid var(--color-primary)',
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

  return (
    <AdminLayout currentPage="Products">
      <section className="admin-card" role="region" aria-labelledby="products-heading">
        <div className="card-header">
          <div>
            <h2 id="products-heading" className="card-title">Products Management</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>
              Manage perfume inventory and product catalog
            </p>
          </div>
          <button className="btn btn-primary" onClick={handleAdd} aria-label="Add new product">
            Add New Product
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
          <Spinner text="Loading products..." />
        ) : products.length === 0 ? (
          <NoProducts onAdd={handleAdd} />
        ) : (
          <>
            <div style={{ overflowX: 'auto' }} role="region" aria-label="Products table">
              <table className="admin-table" role="table" aria-label="List of products">
                <thead>
                  <tr>
                    <th scope="col">Product Name</th>
                    <th scope="col">Brand</th>
                    <th scope="col">Category</th>
                    <th scope="col">Price</th>
                    <th scope="col">Size</th>
                    <th scope="col">Stock</th>
                    <th scope="col">Location</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td style={{ fontWeight: '600' }}>{product.name}</td>
                      <td>{product.brand}</td>
                      <td>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '4px',
                          backgroundColor: 'var(--primary-50)',
                          color: 'var(--primary-700)',
                          fontSize: '0.85rem'
                        }}>
                          {typeof product.category === 'object' ? product.category.name : product.category}
                        </span>
                      </td>
                      <td style={{ fontWeight: '600', color: 'var(--success-600)' }}>
                        {settings?.currency_symbol || '$'}{product.price}
                      </td>
                      <td>{product.size_ml}ml</td>
                      <td>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '4px',
                          backgroundColor: product.stock_quantity > 10 ? 'var(--success-100)' : 'var(--warning-100)',
                          color: product.stock_quantity > 10 ? 'var(--success-700)' : 'var(--warning-700)',
                          fontSize: '0.85rem'
                        }}>
                          {product.stock_quantity}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          Shelf {product.shelf_index}, Slot {product.slot_index}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="action-btn"
                            style={{ background: 'var(--primary-500)', color: 'white' }}
                            onClick={() => handleView(product)}
                            aria-label={`View ${product.name}`}
                          >
                            View
                          </button>
                          <button
                            className="action-btn action-btn-edit"
                            onClick={() => handleEdit(product)}
                            aria-label={`Edit ${product.name}`}
                          >
                            Edit
                          </button>
                          <button
                            className="action-btn action-btn-delete"
                            onClick={() => handleDelete(product.id)}
                            aria-label={`Delete ${product.name}`}
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
          }} role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
          <div
            ref={modalRef}
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderRadius: '12px',
              width: '90%',
              maxWidth: '800px',
              maxHeight: '90vh',
              overflow: 'auto',
              padding: '2rem'
            }} role="document">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 id="product-modal-title" style={{ margin: 0 }}>
                {modalMode === 'add' ? 'Add New Product' : modalMode === 'edit' ? 'Edit Product' : 'View Product'}
              </h2>
              <button
                onClick={resetForm}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)'
                }}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} aria-label={`${modalMode === 'add' ? 'Add new' : modalMode === 'edit' ? 'Edit' : 'View'} product form`}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="product-name" className="form-label">Product Name *</label>
                  <input
                    id="product-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                    aria-required="true"
                    disabled={modalMode === 'view'}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="product-brand" className="form-label">Brand *</label>
                  <input
                    id="product-brand"
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                    aria-required="true"
                    disabled={modalMode === 'view'}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="product-category" className="form-label">Category *</label>
                <select
                  id="product-category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="form-select"
                  required
                  aria-required="true"
                  disabled={modalMode === 'view'}
                  aria-label="Select product category"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="product-description" className="form-label">Description</label>
                <textarea
                  id="product-description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-textarea"
                  disabled={modalMode === 'view'}
                  aria-label="Product description"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="product-price" className="form-label">
                    Price ({settings?.currency_symbol || '$'}) *
                  </label>
                  <input
                    id="product-price"
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="form-input"
                    step="0.01"
                    min="0"
                    required
                    aria-required="true"
                    disabled={modalMode === 'view'}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="product-size" className="form-label">Size (ml) *</label>
                  <input
                    id="product-size"
                    type="number"
                    name="size_ml"
                    value={formData.size_ml}
                    onChange={handleInputChange}
                    className="form-input"
                    min="1"
                    required
                    aria-required="true"
                    disabled={modalMode === 'view'}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="product-stock" className="form-label">Stock Quantity *</label>
                  <input
                    id="product-stock"
                    type="number"
                    name="stock_quantity"
                    value={formData.stock_quantity}
                    onChange={handleInputChange}
                    className="form-input"
                    min="0"
                    required
                    aria-required="true"
                    disabled={modalMode === 'view'}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="product-notes" className="form-label">Fragrance Notes</label>
                <input
                  id="product-notes"
                  type="text"
                  name="fragrance_notes"
                  value={formData.fragrance_notes}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="e.g., Rose, Jasmine, Amber"
                  disabled={modalMode === 'view'}
                  aria-label="Fragrance notes"
                />
              </div>

              <div className="form-group">
                <label htmlFor="product-shelf" className="form-label">Shelf Index (0-3)</label>
                <input
                  id="product-shelf"
                  type="number"
                  name="shelf_index"
                  value={formData.shelf_index}
                  onChange={handleInputChange}
                  className="form-input"
                  min="0"
                  max="3"
                  disabled={modalMode === 'view'}
                  placeholder="Auto-assigned if empty"
                />
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Leave empty for automatic assignment to next available shelf. Slot position will be automatically assigned.
                </p>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <FileUpload
                    id="product-image"
                    label="Product Image"
                    accept="image/*"
                    allowedTypes={['.jpg', '.jpeg', '.png', '.webp', '.gif']}
                    maxSize={5242880}
                    bucket="company-assets"
                    folder="products/images"
                    onUploadComplete={(file) => {
                      setFormData(prev => ({ ...prev, image_url: file.url }));
                      showSuccess('Image uploaded successfully!');
                    }}
                    onUploadError={(error) => {
                      showError(error.message || 'Failed to upload image');
                    }}
                    showPreview={true}
                    helpText="Upload product image (JPG, PNG, WebP, GIF - max 5MB)"
                    disabled={modalMode === 'view'}
                  />
                  {formData.image_url && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Current image: <a href={formData.image_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-600)' }}>View</a>
                      </p>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <FileUpload
                    id="product-3d-model"
                    label="3D Model"
                    accept=".glb,.gltf"
                    allowedTypes={['.glb', '.gltf']}
                    maxSize={52428800}
                    bucket="company-assets"
                    folder="products/models"
                    onUploadComplete={(file) => {
                      setFormData(prev => ({ ...prev, model_3d_url: file.url }));
                      showSuccess('3D model uploaded successfully!');
                    }}
                    onUploadError={(error) => {
                      showError(error.message || 'Failed to upload 3D model');
                    }}
                    showPreview={false}
                    helpText="Upload 3D model (GLB or GLTF - max 50MB)"
                    disabled={modalMode === 'view'}
                  />
                  {formData.model_3d_url && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Current model: <a href={formData.model_3d_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-600)' }}>Download</a>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {modalMode !== 'view' && (
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="submit" className="btn btn-primary" disabled={loading} aria-label={modalMode === 'edit' ? 'Update product' : 'Add product'}>
                    {loading ? 'Saving...' : modalMode === 'edit' ? 'Update Product' : 'Add Product'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={resetForm} aria-label="Cancel and close modal">
                    Cancel
                  </button>
                </div>
              )}
              {modalMode === 'view' && (
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button type="button" className="btn btn-primary" onClick={() => setModalMode('edit')} aria-label="Switch to edit mode">
                    Edit Product
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
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete Product"
        loading={loading && confirmationModal.isOpen} // Only show loading on modal if it's open, referencing the broader loading state might catch page loads too, but here we set loading=true in executeDelete. Best to differentiate. 
      // Actually executeDelete sets global loading=true. That handles the spinner on the page. 
      // Better to separate loading states or just rely on the global one but modal might close.
      // Let's rely on global loading since I close the modal immediately in my code above? 
      // Update: I should probably NOT close it immediately if I want to show loading state ON the button.
      // But for now, let's Stick to the simple implementations: Close, then spinner shows on table.
      />
    </AdminLayout >
  );
}

// Export with SSR disabled to prevent router mounting issues during build

export default ProductsPageClient;


// Protect admin route - require authentication and admin role
