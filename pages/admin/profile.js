import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/Admin/AdminLayout';
import { useAuth } from '../../contexts/AuthContext';

function AdminProfileClient() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState({
    username: 'admin',
    email: 'admin@xrtech.com',
    role: 'Administrator',
    joinedDate: '2025-01-01',
    lastLogin: new Date().toLocaleString(),
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  // Client-side auth check
  useEffect(() => {
    if (!authLoading && (!user || !['admin', 'super_admin'].includes(user.role))) {
      router.push('/admin/login');
    }
  }, [user, authLoading, router]);

  // Update profile with actual user data when available
  useEffect(() => {
    if (user) {
      setProfile({
        username: user.name || 'Admin',
        email: user.email || 'admin@xrtech.com',
        role: user.role === 'super_admin' ? 'Super Administrator' : 'Administrator',
        joinedDate: user.created_at || '2025-01-01',
        lastLogin: new Date().toLocaleString(),
      });
    }
  }, [user]);

  // Show loading state until auth check completes
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

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage('error', 'New passwords do not match!');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showMessage('error', 'Password must be at least 6 characters!');
      return;
    }

    // In production, this would call an API
    showMessage('success', 'Password changed successfully!');
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const stats = [
    { label: 'Products Created', value: '15', icon: '📦' },
    { label: 'Buildings Managed', value: '2', icon: '🏢' },
    { label: 'Settings Updated', value: '8', icon: '⚙️' },
    { label: 'Days Active', value: '30', icon: '📅' }
  ];

  return (
    <AdminLayout currentPage="Profile">
      {message.text && (
        <div
          className={`alert alert-${message.type === 'success' ? 'success' : 'error'}`}
          role="alert"
          aria-live="polite"
        >
          {message.text}
        </div>
      )}

      {/* Profile Header */}
      <header style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '2rem',
        borderRadius: '12px',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '2rem'
      }} role="banner" aria-label="Profile header">
        <div style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '3rem'
        }} aria-hidden="true">
          👤
        </div>
        <div>
          <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem' }}>
            {profile.username}
          </h2>
          <p style={{ margin: '0 0 0.25rem 0', opacity: 0.9, fontSize: '1.1rem' }}>
            {profile.role}
          </p>
          <p style={{ margin: 0, opacity: 0.8, fontSize: '0.9rem' }}>
            Last login: {profile.lastLogin}
          </p>
        </div>
      </header>

      {/* Activity Stats */}
      <section className="stats-grid" style={{ marginBottom: '2rem' }} role="region" aria-label="Activity statistics">
        {stats.map((stat, index) => (
          <article key={index} className="stat-card" role="article" aria-label={`${stat.label}: ${stat.value}`}>
            <div className="stat-icon" style={{ background: '#e3f2fd' }} aria-hidden="true">{stat.icon}</div>
            <div className="stat-info">
              <h3>{stat.label}</h3>
              <p className="stat-value" aria-label={`${stat.value} ${stat.label.toLowerCase()}`}>{stat.value}</p>
            </div>
          </article>
        ))}
      </section>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '2rem'
      }}>
        {/* Profile Information */}
        <section className="admin-card" role="region" aria-labelledby="profile-info-heading">
          <div className="card-header">
            <h2 id="profile-info-heading" className="card-title"><span aria-hidden="true">📝</span> Profile Information</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#2d3142'
              }}>
                Username
              </label>
              <input
                type="text"
                value={profile.username}
                readOnly
                className="form-input"
                style={{ background: '#f5f7fa' }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#2d3142'
              }}>
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                readOnly
                className="form-input"
                style={{ background: '#f5f7fa' }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#2d3142'
              }}>
                Role
              </label>
              <input
                type="text"
                value={profile.role}
                readOnly
                className="form-input"
                style={{ background: '#f5f7fa' }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#2d3142'
              }}>
                Member Since
              </label>
              <input
                type="text"
                value={new Date(profile.joinedDate).toLocaleDateString()}
                readOnly
                className="form-input"
                style={{ background: '#f5f7fa' }}
              />
            </div>
          </div>
        </section>

        {/* Change Password */}
        <section className="admin-card" role="region" aria-labelledby="password-heading">
          <div className="card-header">
            <h2 id="password-heading" className="card-title"><span aria-hidden="true">🔒</span> Change Password</h2>
          </div>

          <form onSubmit={handlePasswordChange} aria-label="Change password form">
            <div className="form-group">
              <label htmlFor="current-password" className="form-label">Current Password</label>
              <input
                id="current-password"
                type="password"
                className="form-input"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({
                  ...passwordForm,
                  currentPassword: e.target.value
                })}
                required
                aria-required="true"
              />
            </div>

            <div className="form-group">
              <label htmlFor="new-password" className="form-label">New Password</label>
              <input
                id="new-password"
                type="password"
                className="form-input"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({
                  ...passwordForm,
                  newPassword: e.target.value
                })}
                required
                aria-required="true"
                minLength={6}
                aria-describedby="password-help"
              />
              <small id="password-help" style={{ color: '#6c757d', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                Minimum 6 characters
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password" className="form-label">Confirm New Password</label>
              <input
                id="confirm-password"
                type="password"
                className="form-input"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({
                  ...passwordForm,
                  confirmPassword: e.target.value
                })}
                required
                aria-required="true"
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} aria-label="Update password">
              Update Password
            </button>
          </form>
        </section>
      </div>

      {/* Permissions */}
      <section className="admin-card" style={{ marginTop: '2rem' }} role="region" aria-labelledby="permissions-heading">
        <div className="card-header">
          <h2 id="permissions-heading" className="card-title"><span aria-hidden="true">🔑</span> Permissions & Access</h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem'
        }}>
          {[
            { name: 'Product Management', granted: true },
            { name: 'Building Control', granted: true },
            { name: 'Settings Management', granted: true },
            { name: 'User Management', granted: true },
            { name: 'Analytics Access', granted: true },
            { name: 'System Configuration', granted: true }
          ].map((permission, index) => (
            <div key={index} style={{
              padding: '1rem',
              background: permission.granted ? '#d4edda' : '#f8d7da',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              border: `2px solid ${permission.granted ? '#28a745' : '#dc3545'}20`
            }}>
              <span style={{ fontSize: '1.5rem' }}>
                {permission.granted ? '✅' : '❌'}
              </span>
              <span style={{
                fontWeight: '600',
                color: permission.granted ? '#155724' : '#721c24'
              }}>
                {permission.name}
              </span>
            </div>
          ))}
        </div>
      </section>
    </AdminLayout>
  );
}

// Export with SSR disabled to prevent router mounting issues during build

export default AdminProfileClient;


// Protect admin route - require authentication and admin role
