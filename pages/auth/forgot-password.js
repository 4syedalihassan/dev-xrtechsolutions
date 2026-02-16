import { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { supabase } from '../../lib/supabase';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (!supabase) throw new Error('Supabase not configured');

            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            });

            if (error) throw error;

            setMessage('Check your email for the password reset link.');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>Forgot Password - XR Tech Solutions</title>
            </Head>

            <div className="reset-container">
                <div className="reset-card">
                    <h1>Reset Password</h1>
                    <p className="subtitle">Enter your email to receive a reset link</p>

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
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <button type="submit" disabled={loading} className="submit-btn">
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>

                    <div className="links">
                        <Link href="/auth/login" className="back-link">
                            Back to Login
                        </Link>
                    </div>
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
            margin-bottom: 8px;
          }

          .subtitle {
            color: var(--text-secondary);
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

          .links {
            margin-top: 20px;
            text-align: center;
          }

          .back-link {
            color: var(--text-secondary);
            text-decoration: none;
            font-size: 14px;
          }

          .back-link:hover {
            color: var(--color-primary);
          }
        `}</style>
            </div>
        </>
    );
}
