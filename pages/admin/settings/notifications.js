// =====================================================
// ADMIN NOTIFICATIONS SETTINGS PAGE
// Enable/disable notification channels
// =====================================================

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../components/Admin/AdminLayout';
import { useAuth } from '../../../contexts/AuthContext';

function AdminNotificationSettings() {
  const [settings, setSettings] = useState({
    email_notifications: true,
    sms_notifications: false,
    push_notifications: false,
    order_notifications: true,
    review_notifications: true,
    chat_notifications: true,
    marketing_notifications: false,
    email_provider: 'resend',
    sms_provider: 'twilio'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Client-side auth check
  useEffect(() => {
    if (!authLoading && (!user || !['admin', 'super_admin'].includes(user.role))) {
      router.push('/admin/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && ['admin', 'super_admin'].includes(user.role)) {
      loadSettings();
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
            borderTop: '4px solid #00BCD4',
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

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings');

      if (response.ok) {
        const data = await response.json();
        setSettings(prev => ({
          ...prev,
          email_notifications: data.email_notifications ?? true,
          sms_notifications: data.sms_notifications ?? false,
          push_notifications: data.push_notifications ?? false,
          order_notifications: data.order_notifications ?? true,
          review_notifications: data.review_notifications ?? true,
          chat_notifications: data.chat_notifications ?? true,
          marketing_notifications: data.marketing_notifications ?? false,
          email_provider: data.email_provider ?? 'resend',
          sms_provider: data.sms_provider ?? 'twilio'
        }));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Notification settings saved successfully!' });
      } else {
        setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      setMessage({ type: 'error', text: 'An error occurred while saving settings.' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSelect = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <AdminLayout currentPage="Notification Settings">
      <div className="settings-container">
        <div className="settings-header">
          <h2>Notification Settings</h2>
          <p>Configure how and when notifications are sent to customers and admins</p>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading settings...</p>
          </div>
        ) : (
          <>
            {message && (
              <div className={`message ${message.type}`}>
                {message.text}
              </div>
            )}

            {/* Notification Channels */}
            <div className="settings-section">
              <h3>📬 Notification Channels</h3>
              <p className="section-desc">Enable or disable notification delivery methods</p>

              <div className="settings-grid">
                <div className="setting-card">
                  <div className="setting-icon">📧</div>
                  <div className="setting-info">
                    <h4>Email Notifications</h4>
                    <p>Send notifications via email to customers</p>
                  </div>
                  <button
                    className={`toggle ${settings.email_notifications ? 'on' : 'off'}`}
                    onClick={() => handleToggle('email_notifications')}
                  >
                    <span className="toggle-slider"></span>
                  </button>
                </div>

                <div className="setting-card">
                  <div className="setting-icon">📱</div>
                  <div className="setting-info">
                    <h4>SMS Notifications</h4>
                    <p>Send notifications via SMS (requires Twilio)</p>
                  </div>
                  <button
                    className={`toggle ${settings.sms_notifications ? 'on' : 'off'}`}
                    onClick={() => handleToggle('sms_notifications')}
                  >
                    <span className="toggle-slider"></span>
                  </button>
                </div>

                <div className="setting-card">
                  <div className="setting-icon">🔔</div>
                  <div className="setting-info">
                    <h4>Push Notifications</h4>
                    <p>Send browser push notifications (requires Firebase)</p>
                  </div>
                  <button
                    className={`toggle ${settings.push_notifications ? 'on' : 'off'}`}
                    onClick={() => handleToggle('push_notifications')}
                  >
                    <span className="toggle-slider"></span>
                  </button>
                </div>
              </div>
            </div>

            {/* Notification Types */}
            <div className="settings-section">
              <h3>🔔 Notification Types</h3>
              <p className="section-desc">Choose which events trigger notifications</p>

              <div className="settings-grid">
                <div className="setting-card">
                  <div className="setting-icon">📦</div>
                  <div className="setting-info">
                    <h4>Order Updates</h4>
                    <p>Notify customers about order status changes</p>
                  </div>
                  <button
                    className={`toggle ${settings.order_notifications ? 'on' : 'off'}`}
                    onClick={() => handleToggle('order_notifications')}
                  >
                    <span className="toggle-slider"></span>
                  </button>
                </div>

                <div className="setting-card">
                  <div className="setting-icon">⭐</div>
                  <div className="setting-info">
                    <h4>Review Notifications</h4>
                    <p>Notify admins when new reviews are submitted</p>
                  </div>
                  <button
                    className={`toggle ${settings.review_notifications ? 'on' : 'off'}`}
                    onClick={() => handleToggle('review_notifications')}
                  >
                    <span className="toggle-slider"></span>
                  </button>
                </div>

                <div className="setting-card">
                  <div className="setting-icon">💬</div>
                  <div className="setting-info">
                    <h4>Chat Notifications</h4>
                    <p>Notify admins about new chat messages</p>
                  </div>
                  <button
                    className={`toggle ${settings.chat_notifications ? 'on' : 'off'}`}
                    onClick={() => handleToggle('chat_notifications')}
                  >
                    <span className="toggle-slider"></span>
                  </button>
                </div>

                <div className="setting-card">
                  <div className="setting-icon">📣</div>
                  <div className="setting-info">
                    <h4>Marketing Emails</h4>
                    <p>Send promotional emails to customers</p>
                  </div>
                  <button
                    className={`toggle ${settings.marketing_notifications ? 'on' : 'off'}`}
                    onClick={() => handleToggle('marketing_notifications')}
                  >
                    <span className="toggle-slider"></span>
                  </button>
                </div>
              </div>
            </div>

            {/* Provider Settings */}
            <div className="settings-section">
              <h3>⚙️ Provider Configuration</h3>
              <p className="section-desc">Select and configure notification service providers</p>

              <div className="provider-settings">
                <div className="provider-card">
                  <h4>📧 Email Provider</h4>
                  <select
                    value={settings.email_provider}
                    onChange={(e) => handleSelect('email_provider', e.target.value)}
                    className="provider-select"
                  >
                    <option value="resend">Resend</option>
                    <option value="sendgrid">SendGrid</option>
                    <option value="smtp">Custom SMTP</option>
                  </select>
                  <p className="provider-note">
                    {settings.email_provider === 'resend' && 'Configure RESEND_API_KEY in environment variables'}
                    {settings.email_provider === 'sendgrid' && 'Configure SENDGRID_API_KEY in environment variables'}
                    {settings.email_provider === 'smtp' && 'Configure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in environment variables'}
                  </p>
                </div>

                <div className="provider-card">
                  <h4>📱 SMS Provider</h4>
                  <select
                    value={settings.sms_provider}
                    onChange={(e) => handleSelect('sms_provider', e.target.value)}
                    className="provider-select"
                  >
                    <option value="twilio">Twilio</option>
                    <option value="nexmo">Vonage (Nexmo)</option>
                  </select>
                  <p className="provider-note">
                    {settings.sms_provider === 'twilio' && 'Configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER in environment variables'}
                    {settings.sms_provider === 'nexmo' && 'Configure NEXMO_API_KEY, NEXMO_API_SECRET in environment variables'}
                  </p>
                </div>
              </div>
            </div>

            {/* API Keys Info */}
            <div className="settings-section info-section">
              <h3>🔑 API Keys Required</h3>
              <div className="api-keys-info">
                <div className="api-key-item">
                  <span className="key-name">RESEND_API_KEY</span>
                  <span className="key-status missing">
                    Check server configuration
                  </span>
                </div>
                <div className="api-key-item">
                  <span className="key-name">TWILIO_ACCOUNT_SID</span>
                  <span className="key-status missing">
                    Check server configuration
                  </span>
                </div>
                <div className="api-key-item">
                  <span className="key-name">FIREBASE_CONFIG</span>
                  <span className="key-status missing">
                    Check server configuration
                  </span>
                </div>
              </div>
              <p className="info-note">
                💡 API keys are configured as server-side environment variables. Check your .env.local file or hosting environment.
              </p>
            </div>

            {/* Save Button */}
            <div className="save-section">
              <button
                className="save-btn"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : '💾 Save Settings'}
              </button>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .settings-container {
          max-width: 900px;
        }

        .settings-header {
          margin-bottom: 2rem;
        }

        .settings-header h2 {
          margin: 0 0 0.5rem 0;
          font-size: 24px;
          color: var(--color-text-primary, #333);
        }

        .settings-header p {
          margin: 0;
          color: var(--color-text-secondary, #666);
        }

        .loading-state {
          text-align: center;
          padding: 4rem 2rem;
          background: white;
          border-radius: 12px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f0f0f0;
          border-top: 4px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .message {
          padding: 1rem 1.5rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          font-weight: 500;
        }

        .message.success {
          background: #E8F5E9;
          color: #4CAF50;
          border-left: 4px solid #4CAF50;
        }

        .message.error {
          background: #FFEBEE;
          color: #F44336;
          border-left: 4px solid #F44336;
        }

        .settings-section {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .settings-section h3 {
          margin: 0 0 0.5rem 0;
          font-size: 18px;
          color: var(--color-text-primary, #333);
        }

        .section-desc {
          margin: 0 0 1.5rem 0;
          color: var(--color-text-secondary, #666);
          font-size: 14px;
        }

        .settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1rem;
        }

        .setting-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: var(--color-bg-secondary, #f8f9fa);
          border-radius: 8px;
          border: 1px solid var(--color-border-light, #e0e0e0);
        }

        .setting-icon {
          font-size: 24px;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border-radius: 8px;
        }

        .setting-info {
          flex: 1;
        }

        .setting-info h4 {
          margin: 0 0 0.25rem 0;
          font-size: 14px;
          color: #333;
        }

        .setting-info p {
          margin: 0;
          font-size: 12px;
          color: #666;
        }

        .toggle {
          width: 50px;
          height: 28px;
          border-radius: 14px;
          border: none;
          cursor: pointer;
          position: relative;
          transition: background 0.2s;
        }

        .toggle.on {
          background: #4CAF50;
        }

        .toggle.off {
          background: #ccc;
        }

        .toggle-slider {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 22px;
          height: 22px;
          background: white;
          border-radius: 50%;
          transition: transform 0.2s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }

        .toggle.on .toggle-slider {
          transform: translateX(22px);
        }

        .provider-settings {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .provider-card {
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
        }

        .provider-card h4 {
          margin: 0 0 1rem 0;
          font-size: 16px;
          color: #333;
        }

        .provider-select {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          background: white;
          cursor: pointer;
        }

        .provider-select:focus {
          outline: none;
          border-color: #667eea;
        }

        .provider-note {
          margin: 1rem 0 0 0;
          font-size: 12px;
          color: #666;
          background: #fff;
          padding: 0.75rem;
          border-radius: 6px;
          border-left: 3px solid #667eea;
        }

        .info-section {
          background: #F3E5F5;
          border: 1px solid #CE93D8;
        }

        .api-keys-info {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .api-key-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          background: white;
          border-radius: 6px;
        }

        .key-name {
          font-family: 'Courier New', monospace;
          font-size: 13px;
          color: #333;
        }

        .key-status {
          font-size: 12px;
          font-weight: 600;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
        }

        .key-status.configured {
          background: #E8F5E9;
          color: #4CAF50;
        }

        .key-status.missing {
          background: #FFF3E0;
          color: #FF9800;
        }

        .info-note {
          margin: 0;
          font-size: 13px;
          color: #7B1FA2;
        }

        .save-section {
          margin-top: 2rem;
          text-align: right;
        }

        .save-btn {
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #667eea 0%, #5a67d8 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .save-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .save-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </AdminLayout>
  );
}

export default AdminNotificationSettings;
