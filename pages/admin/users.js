import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/Admin/AdminLayout';
import useModalAccessibility from '../../hooks/useModalAccessibility';
import AccessibleAlert, { useAlertManager } from '../../components/Admin/AccessibleAlert';
import Spinner from '../../components/UI/Spinner';
import ConfirmationModal from '../../components/UI/ConfirmationModal';
import { useAuth } from '../../contexts/AuthContext';

function AdminUsersPageClient() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [activeFilter, setActiveFilter] = useState('all');
  const router = useRouter();
  const { user: currentUser, session, loading: authLoading } = useAuth();

  // Client-side super admin check
  useEffect(() => {
    if (!authLoading && (!currentUser || currentUser.role !== 'super_admin')) {
      router.push('/admin?error=super_admin_required');
    }
  }, [currentUser, authLoading, router]);

  // Use alert manager hook
  const { alert, showSuccess, showError, clearAlert } = useAlertManager();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin',
    department: 'General'
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (currentUser && currentUser.role === 'super_admin') {
      loadUsers();
    }
  }, [roleFilter, activeFilter, currentUser]);



  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (activeFilter !== 'all') params.append('active', activeFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setUsers(data.users || []);
      } else {
        showError(data.error || 'Failed to load users');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      showError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'admin',
      department: 'General'
    });
    setSelectedUser(null);
    setShowModal(false);
    setModalMode('add');
    setShowPassword(false);
  }, []);

  const handleAdd = () => {
    resetForm();
    setModalMode('add');
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Don't populate password
      role: user.role,
      department: user.admin_profiles?.[0]?.department || 'General'
    });
    setModalMode('edit');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = modalMode === 'add'
        ? '/api/admin/users'
        : `/api/admin/users/${selectedUser.id}`;

      const method = modalMode === 'add' ? 'POST' : 'PUT';

      // For edit mode, only send password if it's been filled in
      const payload = { ...formData };
      if (modalMode === 'edit' && !payload.password) {
        delete payload.password;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        // Use the message from API response for better detail
        showSuccess(data.message || `User ${modalMode === 'add' ? 'created' : 'updated'} successfully`);
        loadUsers();
        resetForm();
      } else {
        showError(data.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      showError('Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null, // 'deactivate', 'reactivate', 'delete', 'delete_permanent'
    title: '',
    message: '',
    variant: 'danger',
    verificationText: null,
    data: null // { userId, userName, userEmail }
  });

  const closeConfirmModal = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleDeactivate = (userId, userName, userEmail) => {
    if (userId === currentUser.id) {
      showError('You cannot deactivate your own account');
      return;
    }
    setConfirmModal({
      isOpen: true,
      type: 'deactivate',
      title: 'Deactivate User',
      message: `Are you sure you want to deactivate ${userName}?\nThey will no longer be able to access the admin portal.`,
      variant: 'warning',
      confirmText: 'Deactivate',
      data: { userId, userName }
    });
  };

  const handleReactivate = (userId, userName) => {
    setConfirmModal({
      isOpen: true,
      type: 'reactivate',
      title: 'Reactivate User',
      message: `Are you sure you want to reactivate ${userName}?\nThey will regain access to the admin portal.`,
      variant: 'info',
      confirmText: 'Reactivate',
      data: { userId, userName }
    });
  };

  const handlePermanentDelete = (userId, userName, userEmail) => {
    setConfirmModal({
      isOpen: true,
      type: 'delete_permanent',
      title: 'Permanently Delete User',
      message: `⚠️ WARNING: This action cannot be undone.\n\nThis will permanently delete ${userName} (${userEmail}) from the database and authentication system.`,
      variant: 'danger',
      confirmText: 'Delete Forever',
      verificationText: userName, // Require typing name to confirm
      data: { userId, userName, userEmail }
    });
  };

  const handleConfirmAction = async () => {
    const { type, data } = confirmModal;
    if (!data) return;

    setLoading(true);
    try {
      let response;
      let successMessage;

      switch (type) {
        case 'deactivate':
          response = await fetch(`/api/admin/users/${data.userId}`, {
            method: 'DELETE', // Soft delete
            headers: { 'Authorization': `Bearer ${session?.access_token}` },
          });
          successMessage = 'User deactivated successfully';
          break;

        case 'reactivate':
          response = await fetch(`/api/admin/users/${data.userId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify({ active: true })
          });
          successMessage = 'User reactivated successfully';
          break;

        case 'delete_permanent':
          response = await fetch(`/api/admin/users/${data.userId}?permanent=true`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${session?.access_token}` },
          });
          successMessage = 'User permanently deleted successfully';
          break;

        default:
          return;
      }

      const resData = await response.json();

      if (response.ok) {
        showSuccess(successMessage);
        loadUsers();
        closeConfirmModal();
      } else {
        showError(resData.error || 'Operation failed');
      }
    } catch (error) {
      console.error(`Error performing ${type}:`, error);
      showError(`Failed to perform action`);
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
  if (authLoading || !currentUser || currentUser.role !== 'super_admin') {
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
          <p style={{ color: 'var(--text-secondary)' }}>Loading access...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const getRoleBadge = (role) => {
    const styles = {
      super_admin: { className: 'status-primary', text: 'Super Admin', icon: '👑' },
      admin: { className: 'status-secondary', text: 'Admin', icon: '⚙️' }
    };
    const style = styles[role] || styles.admin;
    return (
      <span className={style.className} style={{
        padding: '0.25rem 0.75rem',
        borderRadius: '4px',
        fontSize: '0.85rem',
        fontWeight: '600'
      }}>
        {style.icon} {style.text}
      </span>
    );
  };

  const getStatusBadge = (active) => {
    return (
      <span className={active ? 'status-success' : 'status-error'} style={{
        padding: '0.25rem 0.75rem',
        borderRadius: '4px',
        fontSize: '0.85rem',
        fontWeight: '600'
      }}>
        {active ? '✓ Active' : '✗ Inactive'}
      </span>
    );
  };

  return (
    <AdminLayout currentPage="Users">
      <section className="admin-card" role="region" aria-labelledby="users-heading">
        <div className="card-header">
          <div>
            <h2 id="users-heading" className="card-title">Admin User Management</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>
              Manage admin and super admin accounts
            </p>
          </div>
          <button className="btn btn-primary" onClick={handleAdd} aria-label="Add new admin user">
            Add Admin User
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
          aria-label="User filters"
        >
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && loadUsers()}
            style={{
              flex: 1,
              minWidth: '250px',
              padding: '0.5rem 1rem',
              border: '1px solid var(--border-primary)',
              borderRadius: '4px',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)'
            }}
            aria-label="Search users by name or email"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid var(--border-primary)',
              borderRadius: '4px',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)'
            }}
            aria-label="Filter users by role"
          >
            <option value="all">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="admin">Admin</option>
          </select>
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid var(--border-primary)',
              borderRadius: '4px',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)'
            }}
            aria-label="Filter users by status"
          >
            <option value="all">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          <button className="btn btn-secondary" onClick={loadUsers} aria-label="Search users">
            Search
          </button>
        </div>

        {loading ? (
          <Spinner text="Loading admin users..." />
        ) : users.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            background: 'var(--bg-secondary)',
            borderRadius: '8px'
          }}>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              No admin users found
            </p>
            <button className="btn btn-primary" onClick={handleAdd}>
              Add First Admin User
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }} role="region" aria-label="Admin users list table">
            <table className="admin-table" role="table" aria-label="Admin users data table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Email</th>
                  <th scope="col">Role</th>
                  <th scope="col">Department</th>
                  <th scope="col">Status</th>
                  <th scope="col">Created</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td style={{ fontWeight: '600' }}>
                      {user.name}
                      {user.id === currentUser.id && (
                        <span style={{
                          marginLeft: '0.5rem',
                          fontSize: '0.75rem',
                          color: 'var(--text-tertiary)',
                          fontWeight: '400'
                        }}>
                          (You)
                        </span>
                      )}
                    </td>
                    <td>{user.email}</td>
                    <td>{getRoleBadge(user.role)}</td>
                    <td>{user.admin_profiles?.[0]?.department || '-'}</td>
                    <td>{getStatusBadge(user.active)}</td>
                    <td>
                      <time dateTime={user.created_at}>
                        {new Date(user.created_at).toLocaleDateString()}
                      </time>
                    </td>
                    <td>
                      <div className="table-actions" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                          className="action-btn action-btn-edit"
                          onClick={() => handleEdit(user)}
                          aria-label={`Edit ${user.name}`}
                        >
                          Edit
                        </button>
                        {user.active ? (
                          <button
                            className="action-btn action-btn-delete"
                            onClick={() => handleDeactivate(user.id, user.name)}
                            disabled={user.id === currentUser.id}
                            aria-label={`Deactivate ${user.name}`}
                            style={{
                              opacity: user.id === currentUser.id ? 0.5 : 1,
                              cursor: user.id === currentUser.id ? 'not-allowed' : 'pointer'
                            }}
                          >
                            Deactivate
                          </button>
                        ) : (
                          <>
                            <button
                              className="action-btn"
                              style={{ background: 'var(--success-600)', color: 'white' }}
                              onClick={() => handleReactivate(user.id, user.name)}
                              aria-label={`Reactivate ${user.name}`}
                            >
                              Reactivate
                            </button>
                            <button
                              className="action-btn"
                              style={{ background: 'var(--error-600)', color: 'white', fontSize: '0.85rem' }}
                              onClick={() => handlePermanentDelete(user.id, user.name, user.email)}
                              aria-label={`Permanently delete ${user.name}`}
                              title="Permanently delete this user from the system"
                            >
                              🗑️ Delete Forever
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Statistics */}
      <section
        className="stats-grid"
        style={{ marginTop: '2rem' }}
        role="region"
        aria-label="Admin user statistics"
      >
        <article className="stat-card" role="article" aria-label="Total admin users statistic">
          <div className="stat-info">
            <h3>Total Admin Users</h3>
            <p className="stat-value" aria-label={`${users.length} total admin users`}>
              {users.length}
            </p>
          </div>
        </article>

        <article className="stat-card" role="article" aria-label="Super admin users statistic">
          <div className="stat-info">
            <h3>Super Admins</h3>
            <p className="stat-value" style={{ color: 'var(--primary-600)' }} aria-label={`${users.filter(u => u.role === 'super_admin').length} super admin users`}>
              {users.filter(u => u.role === 'super_admin').length}
            </p>
          </div>
        </article>

        <article className="stat-card" role="article" aria-label="Regular admin users statistic">
          <div className="stat-info">
            <h3>Admins</h3>
            <p className="stat-value" style={{ color: 'var(--accent-purple-600)' }} aria-label={`${users.filter(u => u.role === 'admin').length} regular admin users`}>
              {users.filter(u => u.role === 'admin').length}
            </p>
          </div>
        </article>

        <article className="stat-card" role="article" aria-label="Active admin users statistic">
          <div className="stat-info">
            <h3>Active</h3>
            <p className="stat-value" style={{ color: 'var(--success-600)' }} aria-label={`${users.filter(u => u.active).length} active admin users`}>
              {users.filter(u => u.active).length}
            </p>
          </div>
        </article>
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
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="user-modal-title"
        >
          <div
            ref={modalRef}
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderRadius: '12px',
              width: '90%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflow: 'auto',
              padding: '2rem'
            }}
            role="document"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 id="user-modal-title" style={{ margin: 0 }}>
                {modalMode === 'add' ? 'Add Admin User' : 'Edit Admin User'}
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

            <form onSubmit={handleSubmit} aria-label="Admin user form">
              <div className="form-group">
                <label htmlFor="user-name" className="form-label">Name *</label>
                <input
                  id="user-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  aria-required="true"
                  placeholder="e.g., Ali Khan"
                />
              </div>

              <div className="form-group">
                <label htmlFor="user-email" className="form-label">Email *</label>
                <input
                  id="user-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                  disabled={modalMode === 'edit'}
                  aria-required="true"
                  placeholder="admin@xrtechsolutions.com"
                />
                {modalMode === 'edit' && (
                  <small style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                    Email cannot be changed after creation
                  </small>
                )}
              </div>

              {/* Password field - only shown in edit mode */}
              {modalMode === 'edit' && (
                <div className="form-group">
                  <label htmlFor="user-password" className="form-label">
                    New Password (leave blank to keep current)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="user-password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Minimum 8 characters"
                      minLength="8"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        color: 'var(--text-secondary)'
                      }}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  <small style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                    Must be at least 8 characters long. Leave blank to keep current password.
                  </small>
                </div>
              )}

              {/* Invitation notice for add mode */}
              {modalMode === 'add' && (
                <div style={{
                  padding: '1rem',
                  backgroundColor: 'var(--primary-50)',
                  border: '1px solid var(--primary-200)',
                  borderRadius: '6px',
                  marginBottom: '1rem'
                }}>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--primary-700)' }}>
                    📧 <strong>Invitation Email:</strong> An invitation email will be sent to the user.
                    They will set their own password through a secure link.
                  </p>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="user-role" className="form-label">Role *</label>
                  <select
                    id="user-role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="form-select"
                    required
                    disabled={modalMode === 'edit' && selectedUser?.id === currentUser.id}
                    aria-required="true"
                  >
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                  {modalMode === 'edit' && selectedUser?.id === currentUser.id && (
                    <small style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                      You cannot change your own role
                    </small>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="user-department" className="form-label">Department</label>
                  <input
                    id="user-department"
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="e.g., Management, IT, Sales"
                  />
                </div>
              </div>

              <div style={{
                background: 'var(--bg-secondary)',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1.5rem'
              }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Role Permissions:</h4>
                <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {formData.role === 'super_admin' ? (
                    <>
                      <li>Full access to all admin features</li>
                      <li>Can create, edit, and delete admin users</li>
                      <li>Can manage system settings</li>
                      <li>Can access all reports and analytics</li>
                    </>
                  ) : (
                    <>
                      <li>Manage products, categories, and inventory</li>
                      <li>View and process orders</li>
                      <li>Manage customer accounts</li>
                      <li>Cannot create or manage admin users</li>
                    </>
                  )}
                </ul>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Sending...' : modalMode === 'add' ? 'Send Invitation' : 'Update User'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={handleConfirmAction}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        confirmText={confirmModal.confirmText}
        verificationText={confirmModal.verificationText}
        loading={loading}
      />
    </AdminLayout>
  );
}

export default AdminUsersPageClient;
