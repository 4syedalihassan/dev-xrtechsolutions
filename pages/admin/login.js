import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { logLogin, logFailedLogin } from '../../lib/auditLog';
import { supabase } from '../../lib/supabase';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorFromQuery, setErrorFromQuery] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();
  const { signIn, user, isAdmin } = useAuth();

  useEffect(() => {
    const { setup } = router.query;

    // Don't auto-redirect if coming from password setup
    // User needs to manually log in with their new password
    if (!setup && user && isAdmin) {
      // Only redirect if NOT coming from setup completion
      router.push('/admin');
    }

    // Check for error messages in query params
    const { error } = router.query;
    if (error) {
      const errorMessages = {
        session_expired: 'Your session has expired. Please log in again.',
        access_denied: 'Access denied. Admin privileges required.',
        account_inactive: 'Your account is inactive. Please contact support.',
        user_not_found: 'User not found. Please contact support.',
        server_error: 'Server error. Please try again later.',
        super_admin_required: 'This action requires super admin privileges.',
        invalid_invitation: 'Invalid or expired invitation link. Please contact your administrator.',
      };
      setErrorFromQuery(errorMessages[error] || 'Authentication error occurred.');
    }

    // Check for success messages
    if (setup === 'complete') {
      setSuccessMessage('Password setup complete! Please log in with your new credentials.');
    }
  }, [user, isAdmin, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrorFromQuery('');
    setSuccessMessage('');
    setLoading(true);

    try {
      // Sign in with Supabase
      const { data, error: signInError } = await signIn(email, password);

      if (signInError) {
        setError(signInError.message || 'Login failed');

        // Log failed login attempt (don't block on failure)
        try {
          await logFailedLogin(email, signInError.message);
        } catch (logError) {
          console.error('Failed to log failed login:', logError);
        }
        setLoading(false);
        return;
      }

      if (!data?.user) {
        setError('Login failed. Please try again.');
        setLoading(false);
        return;
      }

      // Check if user has admin role
      console.log('Checking user with auth_id:', data.user.id);
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, role, active')
        .eq('auth_id', data.user.id)
        .single();

      console.log('User query result:', { userData, userError });

      if (userError || !userData) {
        const errorMessage = userError
          ? `Database error: ${userError.message || JSON.stringify(userError)}`
          : 'User record not found in database.';
        setError(errorMessage);
        console.error('User verification failed:', { userError, userData, auth_id: data.user.id });
        await supabase.auth.signOut(); // Sign out if we can't verify
        setLoading(false);
        return;
      }

      // Verify admin role
      if (!['admin', 'super_admin'].includes(userData.role)) {
        setError('Access denied. Admin privileges required.');
        await supabase.auth.signOut();

        // Log failed attempt due to insufficient permissions (don't block on failure)
        try {
          await logFailedLogin(email, 'Insufficient permissions');
        } catch (logError) {
          console.error('Failed to log insufficient permissions:', logError);
        }
        setLoading(false);
        return;
      }

      // Verify account is active
      if (!userData.active) {
        setError('Your account is inactive. Please contact support.');
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      // Log successful admin login (don't block on failure)
      try {
        await logLogin(userData.id);
      } catch (logError) {
        console.error('Failed to log successful login:', logError);
      }

      // Successful admin login - redirect to admin dashboard
      router.push('/admin');
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-secondary);
          padding: 2rem;
        }

        .login-card {
          background: var(--card-bg);
          border-radius: 16px;
          box-shadow: var(--shadow-xl);
          padding: 3rem;
          width: 100%;
          max-width: 450px;
          border: 1px solid var(--border-primary);
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .login-header h1 {
          font-size: 2rem;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .login-header p {
          color: var(--text-secondary);
          font-size: 1rem;
        }

        .logo {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .form-input {
          width: 100%;
          padding: 0.875rem 1rem;
          border: 2px solid var(--border-primary);
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.2s;
          background: var(--input-bg);
          color: var(--input-text);
        }

        .form-input:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
        }

        .login-button {
          width: 100%;
          padding: 1rem;
          background: var(--primary-color);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
          margin-top: 1rem;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          background: var(--primary-dark);
        }

        .login-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .error-message {
          background: var(--error-bg);
          color: var(--error-text);
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          border-left: 4px solid var(--error-color);
          font-size: 0.9rem;
        }

        .success-message {
          background: var(--success-bg);
          color: var(--success-text);
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          border-left: 4px solid var(--success-color);
          font-size: 0.9rem;
        }

        .info-message {
          background: var(--bg-tertiary);
          color: var(--text-secondary);
          padding: 1rem;
          border-radius: 8px;
          margin-top: 1.5rem;
          font-size: 0.875rem;
          border-left: 4px solid var(--primary-color);
        }

        .info-message strong {
          display: block;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }

        .footer-link {
          text-align: center;
          margin-top: 2rem;
        }

        .footer-link a {
          color: var(--primary-color);
          text-decoration: none;
          font-weight: 600;
        }

        .footer-link a:hover {
          text-decoration: underline;
        }
      `}</style>

      <div className="login-container">
        <div className="login-card" role="main" aria-labelledby="login-heading">
          <div className="login-header">
            <div className="logo" aria-hidden="true">🔐</div>
            <h1 id="login-heading">Admin Login</h1>
            <p>XR Tech Solutions - Admin Portal</p>
          </div>

          {successMessage && (
            <div className="success-message" role="status" aria-live="polite">
              {successMessage}
            </div>
          )}

          {(error || errorFromQuery) && (
            <div className="error-message" role="alert" aria-live="polite">
              {error || errorFromQuery}
            </div>
          )}

          <form onSubmit={handleSubmit} aria-label="Admin login form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address</label>
              <input
                id="email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-required="true"
                autoFocus
                placeholder="admin@xrtechsolutions.com"
                aria-label="Enter your email address"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                id="password"
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                aria-required="true"
                placeholder="Enter your password"
                aria-label="Enter your password"
              />
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading}
              aria-label={loading ? 'Logging in' : 'Login to admin panel'}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="info-message">
            <strong>ℹ️ Admin Access Only</strong>
            This portal is restricted to authorized administrators.
            All login attempts are logged for security purposes.
          </div>

          <div className="footer-link">
            <a href="/immersiveexp">← Back to Store</a>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminLogin;

// Prevent static generation
export async function getServerSideProps() {
  return { props: {} };
}
