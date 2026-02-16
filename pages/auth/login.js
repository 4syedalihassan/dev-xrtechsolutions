import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signIn, user } = useAuth();

  // Get redirect URL from query params
  const { redirect } = router.query;

  // Redirect if already logged in
  useEffect(() => {
    console.log('🔄 [Login Page] User state changed:', {
      hasUser: !!user,
      userEmail: user?.email,
      userRole: user?.role
    });

    if (user) {
      const redirectUrl = redirect || '/immersiveexp';
      console.log('✅ [Login Page] User loaded! Redirecting to:', redirectUrl);
      router.push(redirectUrl);
    }
  }, [user, router, redirect]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🚀 [Login Page] Form submitted for email:', email);
    setError('');
    setLoading(true);

    try {
      console.log('🚀 [Login Page] Calling signIn function...');
      const { data, error: signInError } = await signIn(email, password);

      console.log('🚀 [Login Page] SignIn response received:', {
        hasData: !!data,
        hasError: !!signInError,
        errorMessage: signInError?.message
      });

      if (signInError) {
        console.error('❌ [Login Page] SignIn error:', signInError);
        setError(signInError.message || 'Login failed. Please check your credentials.');
        setLoading(false);
        return;
      }

      // Successful login - reset loading and handle redirect
      setLoading(false);

      if (data?.session) {
        // Session exists, redirect immediately
        const redirectUrl = redirect || '/immersiveexp';
        router.push(redirectUrl);
      }
      // If no session in response, let AuthContext handle user state update and redirect
    } catch (err) {
      console.error('💥 [Login Page] Exception in handleSubmit:', err);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login - XR Tech Solutions</title>
      </Head>

      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="logo">🔐</div>
            <h1>Welcome Back</h1>
            <p>Login to continue shopping</p>
          </div>

          {error && (
            <div className="error-message" role="alert">
              <strong>Error:</strong> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hassan@xrtechsolutions.app"
                required
                autoFocus
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
            </div>

            <div className="form-actions">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <Link href="/auth/forgot-password" className="forgot-link">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link href="/auth/register">
                Create one here
              </Link>
            </p>
          </div>

          <div className="back-link">
            <Link href="/immersiveexp">
              ← Back to Store
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-tertiary);
          padding: 2rem;
          position: relative;
        }

        .login-card {
          background: var(--bg-primary);
          border-radius: 20px;
          box-shadow: var(--shadow-xl);
          padding: 3rem;
          width: 100%;
          max-width: 450px;
          position: relative;
          z-index: 1;
          border: 1px solid var(--border-primary);
        }

        .login-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .logo {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .login-header h1 {
          font-size: 2rem;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
          font-weight: 700;
        }

        .login-header p {
          color: var(--text-secondary);
          font-size: 1rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: var(--text-primary);
          font-size: 0.95rem;
        }

        .form-group input {
          width: 100%;
          padding: 1rem 1.25rem;
          border: 2px solid var(--border-primary);
          border-radius: 10px;
          font-size: 1rem;
          transition: all 0.3s;
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .form-group input:focus {
          outline: none;
          border-color: var(--color-primary);
          background: var(--bg-primary);
          box-shadow: 0 0 0 4px var(--focus-ring);
        }

        .form-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .remember-me {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .remember-me input {
          cursor: pointer;
        }

        .forgot-link {
          color: var(--color-primary);
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 600;
          transition: all 0.2s;
        }

        .forgot-link:hover {
          color: var(--color-secondary);
          text-decoration: underline;
        }

        .error-message {
          background: var(--error-50);
          color: var(--error-700);
          padding: 1rem 1.25rem;
          border-radius: 10px;
          margin-bottom: 1.5rem;
          font-size: 0.95rem;
          border: 1px solid var(--error-200);
        }

        .error-message strong {
          font-weight: 700;
        }

        .submit-button {
          width: 100%;
          padding: 1rem;
          background: var(--color-primary);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 1.05rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .submit-button:hover:not(:disabled) {
          background: var(--color-primary-dark);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .submit-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .auth-footer {
          text-align: center;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid var(--border-primary);
        }

        .auth-footer p {
          color: var(--text-secondary);
          font-size: 0.95rem;
        }

        .auth-footer a {
          color: var(--color-primary);
          text-decoration: none;
          font-weight: 700;
          transition: all 0.2s;
        }

        .auth-footer a:hover {
          color: var(--color-secondary);
          text-decoration: underline;
        }

        .back-link {
          text-align: center;
          margin-top: 1.5rem;
        }

        .back-link a {
          color: var(--color-primary);
          text-decoration: none;
          font-weight: 600;
          font-size: 0.95rem;
          transition: all 0.2s;
        }

        .back-link a:hover {
          color: var(--color-secondary);
          text-decoration: underline;
        }

        @media (max-width: 640px) {
          .login-container {
            padding: 1rem;
          }

          .login-card {
            padding: 2rem 1.5rem;
          }

          .login-header h1 {
            font-size: 1.75rem;
          }

          .logo {
            font-size: 3rem;
          }
        }
      `}</style>
    </>
  );
}

// Prevent static generation
export async function getServerSideProps() {
  return { props: {} };
}
