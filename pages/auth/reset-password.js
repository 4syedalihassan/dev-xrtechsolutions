import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../../lib/supabase';

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        // Check if we have a session (handled by Supabase automatically via hash fragment)
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setError('Invalid or expired reset link. Please request a new one.');
            }
        };

        if (supabase) checkSession();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            setMessage('Password updated successfully! Redirecting...');
            setTimeout(() => {
                router.push('/auth/login');
            }, 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>Reset Password - XR Tech Solutions</title>
            </Head>

            <div className="reset-container">
                <div className="reset-card">
                    <h1>Set New Password</h1>

                    {message && (
                        <div className="success-message">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="password">New Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter new password"
                                minLength={6}
                                required
                            />
                        </div>

                        <button type="submit" disabled={loading || !!message} className="submit-btn">
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </div>

                <style jsx>{`
          .reset-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--bg-tertiary);
            padding: 20px;
          }

          .reset-card {
            background: var(--card-bg);
            padding: 40px;
            border-radius: 12px;
            box-shadow: var(--shadow-lg);
            width: 100%;
            max-width: 400px;
            border: 1px solid var(--border-primary);
          }

          h1 {
            color: var(--text-primary);
            text-align: center;
            margin-bottom: 30px;
          }

          .form-group {
            margin-bottom: 20px;
          }

          label {
            display: block;
            margin-bottom: 8px;
            color: var(--text-primary);
            font-weight: 500;
          }

          input {
            width: 100%;
            padding: 12px;
            border: 1px solid var(--border-primary);
            border-radius: 6px;
            background: var(--input-bg);
            color: var(--input-text);
          }

          .submit-btn {
            width: 100%;
            padding: 12px;
            background: var(--color-primary);
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            transition: opacity 0.2s;
          }

          .submit-btn:disabled {
            opacity: 0.7;
          }

          .success-message {
            background: var(--success-50);
            color: var(--success-700);
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 20px;
            text-align: center;
          }

          .error-message {
            background: var(--error-50);
            color: var(--error-700);
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 20px;
            text-align: center;
          }
        `}</style>
            </div>
        </>
    );
}
