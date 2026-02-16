import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { useAuth } from '../../contexts/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { signUp, user } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/immersiveexp');
    }
  }, [user, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Phone validation (optional)
    if (formData.phone && !/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await signUp(
        formData.email,
        formData.password,
        {
          name: formData.name,
          phone: formData.phone || ''
        }
      );

      if (error) {
        setErrors({ submit: error.message || 'Registration failed. Please try again.' });
        setLoading(false);
        return;
      }

      // Registration successful
      setSuccess(true);
      setLoading(false);

      // Redirect after a short delay
      setTimeout(() => {
        router.push('/immersiveexp');
      }, 2000);
    } catch (err) {
      console.error('Registration error:', err);
      setErrors({ submit: 'An unexpected error occurred. Please try again.' });
      setLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <Head>
          <title>Registration Successful - XR Tech Solutions</title>
        </Head>

        <div className="login-container">
          <div className="login-card">
            <div className="success-icon">✅</div>
            <h1>Registration Successful!</h1>
            <p>Your account has been created. Please check your email to verify your account.</p>
            <p className="redirect-text">Redirecting to store...</p>

            <div className="loader-bar">
              <div className="loader-progress"></div>
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
          }

          .login-card {
            background: var(--bg-primary);
            border-radius: 20px;
            box-shadow: var(--shadow-xl);
            padding: 3rem;
            width: 100%;
            max-width: 450px;
            text-align: center;
            animation: slideUp 0.5s ease-out;
            border: 1px solid var(--border-primary);
          }

          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .success-icon {
            font-size: 5rem;
            margin-bottom: 1.5rem;
            animation: scaleIn 0.5s ease-out;
          }

          @keyframes scaleIn {
            from {
              transform: scale(0);
            }
            to {
              transform: scale(1);
            }
          }

          h1 {
            color: var(--text-primary);
            margin-bottom: 1rem;
            font-size: 2rem;
            font-weight: 700;
          }

          p {
            color: var(--text-secondary);
            margin-bottom: 0.5rem;
            font-size: 1rem;
          }

          .redirect-text {
            font-weight: 600;
            color: var(--color-primary);
          }

          .loader-bar {
            width: 100%;
            height: 4px;
            background: var(--border-primary);
            border-radius: 2px;
            overflow: hidden;
            margin-top: 2rem;
          }

          .loader-progress {
            width: 100%;
            height: 100%;
            background: var(--color-primary);
            animation: loadProgress 2s ease-in-out;
          }

          @keyframes loadProgress {
            from { transform: translateX(-100%); }
            to { transform: translateX(0); }
          }
        `}</style>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Create Account - XR Tech Solutions</title>
      </Head>

      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="logo">🎉</div>
            <h1>Create Account</h1>
            <p>Join XR Tech Solutions today</p>
          </div>

          {errors.submit && (
            <div className="error-message" role="alert">
              <strong>Error:</strong> {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'error' : ''}
                placeholder="Hassan Raza"
                required
                autoFocus
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
                placeholder="hassan@xrtechsolutions.app"
                required
                autoComplete="email"
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number (Optional)</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className={errors.phone ? 'error' : ''}
                placeholder="+1 (555) 123-4567"
                autoComplete="tel"
              />
              {errors.phone && <span className="field-error">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'error' : ''}
                placeholder="At least 6 characters"
                required
                autoComplete="new-password"
              />
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? 'error' : ''}
                placeholder="Re-enter your password"
                required
                autoComplete="new-password"
              />
              {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
            </div>

            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link href="/auth/login">
                Login here
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
        }

        .login-card {
          background: var(--bg-primary);
          border-radius: 20px;
          box-shadow: var(--shadow-xl);
          padding: 3rem;
          width: 100%;
          max-width: 500px;
          position: relative;
          z-index: 1;
          animation: slideUp 0.5s ease-out;
          border: 1px solid var(--border-primary);
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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
          margin-bottom: 1.25rem;
          text-align: left;
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
          padding: 0.875rem 1rem;
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

        .form-group input.error {
          border-color: var(--color-danger);
          background: var(--error-50);
        }

        .field-error {
          display: block;
          color: var(--color-danger);
          font-size: 0.825rem;
          margin-top: 0.25rem;
          font-weight: 600;
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
          margin-top: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .submit-button:hover:not(:disabled) {
          background: var(--color-primary-dark);
          transform: translateY(-2px);
          box-shadow: var(--shadow-sm);
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
