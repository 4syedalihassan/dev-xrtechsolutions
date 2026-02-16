import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import Head from 'next/head';

export default function AcceptInvite() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const checkInvitation = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        router.push('/admin/login?error=invalid_invitation');
        return;
      }

      setUserEmail(session.user.email || '');
      setUserName(session.user.user_metadata?.name || '');

      // If already set password, redirect to login
      if (session.user.user_metadata?.password_set) {
        router.push('/admin/login');
        return;
      }
    };

    checkInvitation();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      // Update password first (requires active session)
      console.log('[Accept Invite] Updating password...');
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
        data: {
          name: userName,
          password_set: true,
          password_set_at: new Date().toISOString()
        }
      });

      if (updateError) {
        console.error('[Accept Invite] Password update error:', updateError);
        throw updateError;
      }

      console.log('[Accept Invite] Password updated successfully');

      // IMMEDIATELY sign out to prevent AuthContext redirect race condition
      console.log('[Accept Invite] Signing out immediately...');
      await supabase.auth.signOut({ scope: 'local' });

      // Show success message briefly
      setSuccess(true);

      // Redirect to login (user is now signed out)
      // Use shorter timeout and hard redirect to prevent any race conditions
      setTimeout(() => {
        console.log('[Accept Invite] Redirecting to login...');
        // Use replace instead of href to prevent back button issues
        window.location.replace('/admin/login?setup=complete');
      }, 800);

      setLoading(false);

    } catch (err) {
      console.error('[Accept Invite] Error:', err);
      setError(err.message || 'Failed to set password. Please try again.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '1rem'
      }}>
        <Head>
          <title>Password Set Successfully - XR Tech Solutions</title>
        </Head>

        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '12px',
          maxWidth: '450px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
          <h1 style={{ color: '#27ae60', marginBottom: '1rem' }}>Password Set Successfully!</h1>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>
            Your admin account is now ready. Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '1rem'
    }}>
      <Head>
        <title>Set Your Password - XR Tech Solutions</title>
      </Head>

      <div style={{
        backgroundColor: 'white',
        padding: '2.5rem',
        borderRadius: '12px',
        maxWidth: '450px',
        width: '100%',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '1.75rem',
            margin: '0 0 0.5rem 0',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Welcome to XR Tech Solutions
          </h1>
          <p style={{ color: '#666', margin: 0, fontSize: '0.95rem' }}>
            Set your password to complete setup
          </p>
        </div>

        {userEmail && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#e7f3ff',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            border: '1px solid #2196F3'
          }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#0d47a1' }}>
              {userName && <><strong>{userName}</strong><br /></>}
              <span style={{ color: '#666' }}>{userEmail}</span>
            </p>
          </div>
        )}

        {error && (
          <div style={{
            padding: '1rem',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            border: '1px solid #f5c6cb',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#333',
              fontSize: '0.9rem'
            }}>
              New Password *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Minimum 8 characters"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  paddingRight: '3rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
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
                  fontSize: '1.2rem'
                }}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            <small style={{ color: '#666', fontSize: '0.85rem', display: 'block', marginTop: '0.25rem' }}>
              Must be at least 8 characters
            </small>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#333',
              fontSize: '0.9rem'
            }}>
              Confirm Password *
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Re-enter your password"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'transform 0.2s',
              transform: loading ? 'scale(1)' : 'scale(1)',
            }}
            onMouseEnter={(e) => {
              if (!loading) e.target.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
            }}
          >
            {loading ? 'Setting Password...' : 'Set Password & Continue'}
          </button>
        </form>

        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          fontSize: '0.85rem',
          color: '#666'
        }}>
          <strong>Password Requirements:</strong>
          <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.25rem' }}>
            <li>At least 8 characters long</li>
            <li>Mix of letters and numbers recommended</li>
            <li>Use special characters for extra security</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
