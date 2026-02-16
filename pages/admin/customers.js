import dynamic from 'next/dynamic';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/Admin/AdminLayout';
import useModalAccessibility from '../../hooks/useModalAccessibility';
import AccessibleAlert, { useAlertManager } from '../../components/Admin/AccessibleAlert';
import { NoCustomers } from '../../components/Admin/EmptyState';
import Spinner from '../../components/UI/Spinner';
import ConfirmationModal from '../../components/UI/ConfirmationModal';
import Pagination from '../../components/UI/Pagination';
import { useAuth } from '../../contexts/AuthContext';

function CustomersPageClient() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', 'view'
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
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
    email: '',
    phone: '',
    address: '',
    company_name: '',
    logo_url: '',
    subscription_tier: 'basic',
    notes: ''
  });

  useEffect(() => {
    if (user && session && ['admin', 'super_admin'].includes(user.role)) {
      loadCustomers();
    }
  }, [statusFilter, user, session, page]); // Add page dependency



  const loadCustomers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/customers?${params}`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        setCustomers(data.customers);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      showError('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      company_name: '',
      logo_url: '',
      subscription_tier: 'basic',
      notes: ''
    });
    setSelectedCustomer(null);
    setShowModal(false);
    setModalMode('add');
  }, []);

  const handleAdd = () => {
    resetForm();
    setModalMode('add');
    setShowModal(true);
  };

  const handleView = (customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || '',
      address: customer.address || '',
      company_name: customer.company_name || '',
      logo_url: customer.logo_url || '',
      subscription_tier: customer.subscription_tier,
      notes: customer.notes || ''
    });
    setModalMode('view');
    setShowModal(true);
  };

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || '',
      address: customer.address || '',
      company_name: customer.company_name || '',
      logo_url: customer.logo_url || '',
      subscription_tier: customer.subscription_tier,
      notes: customer.notes || ''
    });
    setModalMode('edit');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = modalMode === 'add'
        ? '/api/customers'
        : `/api/customers/${selectedCustomer.id}`;

      const method = modalMode === 'add' ? 'POST' : 'PUT';

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
        showSuccess(`Customer ${modalMode === 'add' ? 'created' : 'updated'} successfully`);
        loadCustomers();
        resetForm();
      } else {
        showError(data.error || 'Operation failed');
      }
    } catch (error) {
      showError('Failed to save customer');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (customerId) => {
    setConfirmationModal({
      isOpen: true,
      data: customerId,
      action: 'delete'
    });
  };

  const executeDelete = async () => {
    const customerId = confirmationModal.data;
    setLoading(true);
    setConfirmationModal(prev => ({ ...prev, isOpen: false }));

    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        showSuccess('Customer deleted successfully');
        loadCustomers();
      } else {
        showError(data.error || 'Delete failed');
      }
    } catch (error) {
      showError('Failed to delete customer');
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

  const getStatusBadge = (status) => {
    const styles = {
      active: { bg: '#d4edda', color: '#155724', text: 'Active' },
      inactive: { bg: '#fff3cd', color: '#856404', text: 'Inactive' },
      suspended: { bg: '#f8d7da', color: '#721c24', text: 'Suspended' }
    };
    const style = styles[status] || styles.active;
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

  const getPlanBadge = (plan) => {
    const styles = {
      basic: { bg: '#e3f2fd', color: '#0d47a1' },
      standard: { bg: '#f3e5f5', color: '#4a148c' },
      premium: { bg: '#fff3e0', color: '#e65100' }
    };
    const style = styles[plan] || styles.basic;
    return (
      <span style={{
        padding: '0.25rem 0.75rem',
        borderRadius: '4px',
        backgroundColor: style.bg,
        color: style.color,
        fontSize: '0.85rem',
        fontWeight: '600',
        textTransform: 'capitalize'
      }}>
        {plan}
      </span>
    );
  };

  return (
    <AdminLayout currentPage="Customers">
      <section className="admin-card" role="region" aria-labelledby="customers-heading">
        <div className="card-header">
          <div>
            <h2 id="customers-heading" className="card-title">Customer Management</h2>
            <p style={{ color: '#6c757d', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>
              Manage all customers and their subscriptions
            </p>
          </div>
          <button className="btn btn-primary" onClick={handleAdd} aria-label="Add new customer">
            Add Customer
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
          aria-label="Customer filters"
        >
          <input
            type="text"
            placeholder="Search by name, email, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && loadCustomers()}
            style={{
              flex: 1,
              minWidth: '250px',
              padding: '0.5rem 1rem',
              border: '1px solid #e1e8ed',
              borderRadius: '4px'
            }}
            aria-label="Search customers by name, email, or company"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #e1e8ed',
              borderRadius: '4px'
            }}
            aria-label="Filter customers by status"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
          <button className="btn btn-secondary" onClick={loadCustomers} aria-label="Search customers">
            Search
          </button>
        </div>

        {loading ? (
          <Spinner text="Loading customers..." />
        ) : customers.length === 0 ? (
          <NoCustomers onAdd={handleAdd} />
        ) : (
          <>
            <div style={{ overflowX: 'auto' }} role="region" aria-label="Customer list table">
              <table className="admin-table" role="table" aria-label="Customers data table">
                <thead>
                  <tr>
                    <th scope="col">Customer Name</th>
                    <th scope="col">Email</th>
                    <th scope="col">Company</th>
                    <th scope="col">Subscription</th>
                    <th scope="col">Status</th>
                    <th scope="col">Created</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id}>
                      <td style={{ fontWeight: '600' }}>{customer.name}</td>
                      <td>{customer.email}</td>
                      <td>{customer.company_name || '-'}</td>
                      <td>{getPlanBadge(customer.subscription_tier)}</td>
                      <td>{getStatusBadge(customer.status)}</td>
                      <td>
                        <time dateTime={customer.created_at}>
                          {new Date(customer.created_at).toLocaleDateString()}
                        </time>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="action-btn"
                            style={{ background: '#667eea', color: 'white' }}
                            onClick={() => handleView(customer)}
                            aria-label={`View ${customer.name} details`}
                          >
                            View
                          </button>
                          <button
                            className="action-btn action-btn-edit"
                            onClick={() => handleEdit(customer)}
                            aria-label={`Edit ${customer.name}`}
                          >
                            Edit
                          </button>
                          <button
                            className="action-btn action-btn-delete"
                            onClick={() => handleDelete(customer.id)}
                            aria-label={`Delete ${customer.name}`}
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
      <section
        className="stats-grid"
        style={{ marginTop: '2rem' }}
        role="region"
        aria-label="Customer statistics"
      >
        <article className="stat-card" role="article" aria-label="Total customers statistic">
          <div className="stat-info">
            <h3>Total Customers</h3>
            <p className="stat-value" aria-label={`${customers.length} total customers`}>
              {customers.length}
            </p>
          </div>
        </article>

        <article className="stat-card" role="article" aria-label="Active customers statistic">
          <div className="stat-info">
            <h3>Active</h3>
            <p className="stat-value" style={{ color: '#27ae60' }} aria-label={`${customers.filter(c => c.status === 'active').length} active customers`}>
              {customers.filter(c => c.status === 'active').length}
            </p>
          </div>
        </article>

        <article className="stat-card" role="article" aria-label="Premium customers statistic">
          <div className="stat-info">
            <h3>Premium</h3>
            <p className="stat-value" style={{ color: '#f39c12' }} aria-label={`${customers.filter(c => c.subscription_tier === 'premium').length} premium customers`}>
              {customers.filter(c => c.subscription_tier === 'premium').length}
            </p>
          </div>
        </article>

        <article className="stat-card" role="article" aria-label="Inactive customers statistic">
          <div className="stat-info">
            <h3>Inactive</h3>
            <p className="stat-value" style={{ color: '#e74c3c' }} aria-label={`${customers.filter(c => c.status === 'inactive').length} inactive customers`}>
              {customers.filter(c => c.status === 'inactive').length}
            </p>
          </div>
        </article>
      </section >

      {/* Modal */}
      {
        showModal && (
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
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="customer-modal-title"
          >
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
              }}
              role="document"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 id="customer-modal-title" style={{ margin: 0 }}>
                  {modalMode === 'add' ? 'Add Customer' : modalMode === 'edit' ? 'Edit Customer' : 'View Customer'}
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

              <form onSubmit={handleSubmit} aria-label="Customer form">
                <div className="form-group">
                  <label htmlFor="customer-name" className="form-label">Customer Name *</label>
                  <input
                    id="customer-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                    disabled={modalMode === 'view'}
                    aria-required="true"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="customer-email" className="form-label">Email *</label>
                  <input
                    id="customer-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                    disabled={modalMode === 'view'}
                    aria-required="true"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="customer-phone" className="form-label">Phone</label>
                    <input
                      id="customer-phone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="form-input"
                      disabled={modalMode === 'view'}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="customer-company" className="form-label">Company Name</label>
                    <input
                      id="customer-company"
                      type="text"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleInputChange}
                      className="form-input"
                      disabled={modalMode === 'view'}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="customer-address" className="form-label">Address</label>
                  <textarea
                    id="customer-address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="form-textarea"
                    disabled={modalMode === 'view'}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="customer-subscription" className="form-label">Subscription Plan</label>
                    <select
                      id="customer-subscription"
                      name="subscription_tier"
                      value={formData.subscription_tier}
                      onChange={handleInputChange}
                      className="form-select"
                      disabled={modalMode === 'view'}
                    >
                      <option value="basic">Basic</option>
                      <option value="standard">Standard</option>
                      <option value="premium">Premium</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="customer-logo" className="form-label">Logo URL</label>
                    <input
                      id="customer-logo"
                      type="text"
                      name="logo_url"
                      value={formData.logo_url}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="https://..."
                      disabled={modalMode === 'view'}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="customer-notes" className="form-label">Notes</label>
                  <textarea
                    id="customer-notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="form-textarea"
                    rows="3"
                    disabled={modalMode === 'view'}
                  />
                </div>

                {modalMode !== 'view' && (
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Saving...' : modalMode === 'add' ? 'Create Customer' : 'Update Customer'}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={resetForm}>
                      Cancel
                    </button>
                  </div>
                )}
                {modalMode === 'view' && (
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                    <button type="button" className="btn btn-primary" onClick={() => setModalMode('edit')}>
                      Edit Customer
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={resetForm}>
                      Close
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        )
      }

      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal({ ...confirmationModal, isOpen: false })}
        onConfirm={executeDelete}
        title="Delete Customer"
        message="Are you sure you want to delete this customer? This will also delete all their buildings and orders. This action cannot be undone."
        confirmText="Delete Customer"
        verificationText="DELETE"
      />
    </AdminLayout >
  );
}

export default CustomersPageClient;


// Protect admin route - require authentication and admin role
