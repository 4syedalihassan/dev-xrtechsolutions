import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AdminLayout from './AdminLayout';
import FileUpload from './FileUpload';
import { useAuth } from '../../contexts/AuthContext';
import { STATUS_COLORS, currencies, languages, signageStatuses } from '../../lib/adminConstants';
import { saveSignageSettings, loadSignageFromAPIs } from '../../lib/adminSettingsHelpers';

const tabs = [
  { id: 'general', name: 'General', icon: '🏪' },
  { id: 'advanced', name: 'Advanced Settings', icon: '⚙️' },
  { id: 'branding', name: 'Branding & Logos', icon: '🎨' },
  { id: 'pricing', name: 'Pricing & Tax', icon: '💰' },
  { id: 'localization', name: 'Localization', icon: '🌍' },
  { id: 'signage', name: 'Digital Signage', icon: '📺' }
];

export default function AdminSettingsClient() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('general');
  const router = useRouter();
  const { user, session, loading: authLoading } = useAuth();

  // Client-side auth check
  useEffect(() => {
    if (!authLoading && (!user || !['admin', 'super_admin'].includes(user.role))) {
      router.push('/admin/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();

      if (!data.signage) {
        data.signage = {
          healthcare_center: {
            text: '',  // Empty text by default (logo only)
            status: 'OPEN',
            color: STATUS_COLORS.OPEN,
            logo_url: null
          },
          perfume_shop: {
            text: '',  // Empty text by default (logo only)
            status: 'OPEN',
            color: STATUS_COLORS.OPEN,
            logo_url: null
          }
        };
      }

      setSettings(data);
    } catch (error) {
      showMessage('error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const reloadSettingsFromDatabase = async () => {
    try {
      // Reload general settings
      const settingsResponse = await fetch('/api/settings');
      const settingsData = await settingsResponse.json();

      // Reload signage data from building APIs
      const signageData = await loadSignageFromAPIs();

      // Merge settings with fresh signage data
      settingsData.signage = signageData;
      setSettings(settingsData);

      console.log('[Admin Settings] All settings reloaded successfully');
    } catch (error) {
      console.error('[Admin Settings] Failed to reload settings:', error);
      // Don't show error message here, settings were already saved successfully
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Get auth token
      const token = session?.access_token;
      if (!token) {
        showMessage('error', 'Authentication required. Please log in again.');
        setSaving(false);
        return;
      }

      const authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // Save general settings
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(settings)
      });

      const data = await response.json();

      // Save digital signage settings separately to building signboard API
      // Save regardless of active tab since this is "Save ALL Settings"
      if (settings.signage) {
        const signageResult = await saveSignageSettings(settings.signage, authHeaders);
        if (!signageResult.success) {
          showMessage('error', signageResult.error);
          setSaving(false);
          return;
        }
      }

      if (data.success) {
        showMessage('success', 'Settings saved successfully');

        // Reload settings from database to refresh form fields with saved values
        console.log('[Admin Settings] Reloading settings from database...');
        await reloadSettingsFromDatabase();
      } else {
        showMessage('error', 'Failed to save settings');
      }
    } catch (error) {
      console.error('Save error:', error);
      showMessage('error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSignage = (building, field, value) => {
    setSettings({
      ...settings,
      signage: {
        ...settings.signage,
        [building]: {
          ...settings.signage[building],
          [field]: value
        }
      }
    });
  };

  if (loading) {
    return (
      <AdminLayout currentPage="Settings">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading settings...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="Store Settings">
      {/* Alert Message */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg border ${message.type === 'success'
            ? 'bg-green-100 dark:bg-green-900/20 border-green-400 dark:border-green-900/30 text-green-700 dark:text-green-400'
            : 'bg-red-100 dark:bg-red-900/20 border-red-400 dark:border-red-900/30 text-red-700 dark:text-red-400'
          }`}>
          {message.text}
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-max px-6 py-4 text-sm font-medium transition-colors border-b-2 ${activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSave}>
        {/* General Settings Tab */}
        {activeTab === 'general' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">General Settings</h2>
              <p className="text-gray-600 dark:text-gray-400">Manage basic store information and contact details</p>
            </div>

            <div className="space-y-6">
              {/* Store Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Store Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={settings.store_name || ''}
                  onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                  placeholder="XR Tech Solutions"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Store Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Store Description
                </label>
                <textarea
                  value={settings.store_description || ''}
                  onChange={(e) => setSettings({ ...settings, store_description: e.target.value })}
                  placeholder="Brief description of your store..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Contact Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={settings.store_email || ''}
                    onChange={(e) => setSettings({ ...settings, store_email: e.target.value })}
                    placeholder="contact@xrtech.com"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={settings.store_phone || ''}
                    onChange={(e) => setSettings({ ...settings, store_phone: e.target.value })}
                    placeholder="+92 300 1234567"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Store Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Physical Address
                </label>
                <textarea
                  value={settings.store_address || ''}
                  onChange={(e) => setSettings({ ...settings, store_address: e.target.value })}
                  placeholder="Enter full store address with postal code"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Feature Toggles */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Store Features</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div>
                      <span className="block font-medium text-gray-900 dark:text-gray-100">Live Chat Widget</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Enable the customer support chat bubble on the storefront</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.chat_enabled !== false}
                        onChange={(e) => {
                          const newValue = e.target.checked;
                          console.log('Toggling chat enabled:', newValue);
                          setSettings(prev => ({ ...prev, chat_enabled: newValue }));
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Advanced Settings Tab */}
        {activeTab === 'advanced' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Advanced Settings</h2>
              <p className="text-gray-600 dark:text-gray-400">Access specialized configuration pages for analytics, branding, and theme customization</p>
            </div>

            {/* Settings Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Analytics Settings Card */}
              <Link href="/admin/settings/analytics">
                <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all hover:shadow-lg cursor-pointer group">
                  <div className="mb-4">
                    <div className="w-12 h-12 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform">
                      📊
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Analytics & Tracking</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Configure Google Analytics, AdSense, and Meta Pixel tracking
                    </p>
                  </div>
                  <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium text-sm group-hover:translate-x-1 transition-transform">
                    Open Settings →
                  </div>
                </div>
              </Link>

              {/* Branding Settings Card */}
              <Link href="/admin/settings/branding">
                <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border-2 border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 transition-all hover:shadow-lg cursor-pointer group">
                  <div className="mb-4">
                    <div className="w-12 h-12 bg-purple-600 dark:bg-purple-500 rounded-lg flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform">
                      🎨
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Advanced Branding</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Manage logos, favicons, app icons, and brand assets
                    </p>
                  </div>
                  <div className="flex items-center text-purple-600 dark:text-purple-400 font-medium text-sm group-hover:translate-x-1 transition-transform">
                    Open Settings →
                  </div>
                </div>
              </Link>

              {/* Theme Settings Card */}
              <Link href="/admin/settings/theme">
                <div className="p-6 bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-lg border-2 border-pink-200 dark:border-pink-800 hover:border-pink-400 dark:hover:border-pink-600 transition-all hover:shadow-lg cursor-pointer group">
                  <div className="mb-4">
                    <div className="w-12 h-12 bg-pink-600 dark:bg-pink-500 rounded-lg flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform">
                      🌈
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Theme Customization</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Customize colors, fonts, buttons, and visual styles
                    </p>
                  </div>
                  <div className="flex items-center text-pink-600 dark:text-pink-400 font-medium text-sm group-hover:translate-x-1 transition-transform">
                    Open Settings →
                  </div>
                </div>
              </Link>
            </div>

            {/* Info Banner */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-start">
                <span className="text-xl mr-3">ℹ️</span>
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-1">About Advanced Settings</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    These specialized settings pages provide detailed configuration options for tracking, branding, and visual customization.
                    Changes made in these sections will affect your store's analytics, appearance, and user experience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Branding & Logos Tab */}
        {activeTab === 'branding' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Branding & Logo Management</h2>
              <p className="text-gray-600 dark:text-gray-400">Upload and manage your store logos for different contexts</p>
            </div>

            {/* Info Banner */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/30 rounded-lg">
              <div className="flex items-start">
                <span className="text-2xl mr-3">💡</span>
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">Advanced Logo Management Available</h3>
                  <p className="text-sm text-blue-800 dark:text-blue-400 mb-2">
                    For comprehensive logo management including light/dark variants, app icons, favicons, and email logos, use our dedicated branding page.
                  </p>
                  <Link
                    href="/admin/settings/branding"
                    className="inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    Open Advanced Branding Settings →
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Logo Upload */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Quick Logo Upload</h3>
              <FileUpload
                id="store-logo"
                label="Primary Store Logo"
                accept="image/*"
                allowedTypes={['.jpg', '.jpeg', '.png', '.svg', '.webp']}
                maxSize={3145728}
                bucket="company-assets"
                folder="branding"
                onUploadComplete={async (file) => {
                  const updatedSettings = { ...settings, store_logo: file.url };
                  setSettings(updatedSettings);

                  try {
                    const response = await fetch('/api/settings', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(updatedSettings)
                    });

                    const data = await response.json();
                    if (data.success) {
                      showMessage('success', 'Logo uploaded and saved successfully!');
                    } else {
                      showMessage('error', 'Logo uploaded but failed to save to database');
                    }
                  } catch (error) {
                    showMessage('error', 'Logo uploaded but failed to save to database');
                  }
                }}
                onUploadError={(error) => {
                  showMessage('error', error.message || 'Failed to upload logo');
                }}
                showPreview={true}
                helpText="Upload primary logo (JPG, PNG, SVG - max 3MB). Recommended: Height 56px, transparent background"
              />

              {settings.store_logo && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Current Logo Preview:</p>
                  <div className="flex items-center space-x-4">
                    <img
                      src={settings.store_logo}
                      alt="Store logo"
                      className="h-14 w-auto object-contain"
                    />
                    <a
                      href={settings.store_logo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View Full Size →
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pricing & Tax Tab */}
        {activeTab === 'pricing' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Pricing & Tax Configuration</h2>
              <p className="text-gray-600 dark:text-gray-400">Configure currency, tax rates, and pricing policies</p>
            </div>

            <div className="space-y-8">
              {/* Currency Settings */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Currency Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Store Currency <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={settings.currency}
                      onChange={(e) => {
                        const currency = currencies.find(c => c.code === e.target.value);
                        setSettings({
                          ...settings,
                          currency: currency.code,
                          currency_symbol: currency.symbol
                        });
                      }}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {currencies.map(curr => (
                        <option key={curr.code} value={curr.code}>
                          {curr.name} ({curr.symbol})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Currency Symbol
                    </label>
                    <input
                      type="text"
                      value={settings.currency_symbol}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Currency Position
                    </label>
                    <select
                      value={settings.currency_position || 'before'}
                      onChange={(e) => setSettings({ ...settings, currency_position: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="before">Before (Rs 1000)</option>
                      <option value="after">After (1000 Rs)</option>
                    </select>
                  </div>
                </div>

                {/* Currency Format Preview */}
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Price Display Preview:</strong>{' '}
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">
                      {settings.currency_position === 'after'
                        ? `1,000${settings.currency_symbol}`
                        : `${settings.currency_symbol}1,000`
                      }
                    </span>
                  </p>
                </div>
              </div>

              {/* Tax Configuration */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Tax Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={settings.tax_rate ? settings.tax_rate * 100 : 0}
                      onChange={(e) => setSettings({
                        ...settings,
                        tax_rate: parseFloat(e.target.value) / 100
                      })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Current GST rate in Pakistan is 17%
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tax Display
                    </label>
                    <select
                      value={settings.tax_display || 'inclusive'}
                      onChange={(e) => setSettings({ ...settings, tax_display: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="inclusive">Inclusive (Price includes tax)</option>
                      <option value="exclusive">Exclusive (Tax added at checkout)</option>
                    </select>
                  </div>
                </div>

                {/* Tax Calculation Example */}
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Example Calculation:</p>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex justify-between">
                      <span>Base Price:</span>
                      <span className="font-medium">{settings.currency_symbol}1,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax ({settings.tax_rate ? (settings.tax_rate * 100).toFixed(2) : 0}%):</span>
                      <span className="font-medium">
                        {settings.currency_symbol}{settings.tax_rate ? (1000 * settings.tax_rate).toFixed(2) : 0}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-gray-300 dark:border-gray-600 pt-1">
                      <span className="font-semibold">Total:</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {settings.currency_symbol}{settings.tax_rate ? (1000 + 1000 * settings.tax_rate).toFixed(2) : 1000}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Policies */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Pricing Policies</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enable_discounts"
                      checked={settings.enable_discounts || false}
                      onChange={(e) => setSettings({ ...settings, enable_discounts: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="enable_discounts" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Enable product discounts and promotions
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="show_original_price"
                      checked={settings.show_original_price || false}
                      onChange={(e) => setSettings({ ...settings, show_original_price: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="show_original_price" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Show original price when discounted (strikethrough)
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="allow_free_shipping"
                      checked={settings.allow_free_shipping || false}
                      onChange={(e) => setSettings({ ...settings, allow_free_shipping: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="allow_free_shipping" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Offer free shipping on eligible orders
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Localization Tab */}
        {activeTab === 'localization' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Localization Settings</h2>
              <p className="text-gray-600 dark:text-gray-400">Configure language, timezone, and regional preferences</p>
            </div>

            <div className="space-y-6">
              {/* Language Settings */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Language Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Default Language <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={settings.language || 'en'}
                      onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {languages.map(lang => (
                        <option key={lang.code} value={lang.code}>
                          {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date Format
                    </label>
                    <select
                      value={settings.date_format || 'DD/MM/YYYY'}
                      onChange={(e) => setSettings({ ...settings, date_format: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2025)</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2025)</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD (2025-12-31)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Timezone Settings */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Timezone Settings</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Store Timezone
                  </label>
                  <select
                    value={settings.timezone || 'Asia/Karachi'}
                    onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="Asia/Karachi">Pakistan (GMT+5)</option>
                    <option value="Asia/Dubai">UAE (GMT+4)</option>
                    <option value="Asia/Riyadh">Saudi Arabia (GMT+3)</option>
                    <option value="Europe/London">London (GMT)</option>
                    <option value="America/New_York">New York (GMT-5)</option>
                    <option value="America/Los_Angeles">Los Angeles (GMT-8)</option>
                    <option value="Asia/Tokyo">Tokyo (GMT+9)</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Used for order timestamps and scheduled events
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Digital Signage Tab */}
        {activeTab === 'signage' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Digital Signage Management</h2>
              <p className="text-gray-600 dark:text-gray-400">Manage building signage text and status displays in 3D world</p>
            </div>

            <div className="space-y-6">
              {/* Healthcare Center Signage */}
              <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Healthcare Center Signage</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Display Text (optional - leave blank for logo only)
                    </label>
                    <input
                      type="text"
                      value={settings.signage.healthcare_center.text}
                      onChange={(e) => updateSignage('healthcare_center', 'text', e.target.value)}
                      placeholder="Leave blank for logo only"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={settings.signage.healthcare_center.status}
                      onChange={(e) => {
                        const status = signageStatuses.find(s => s.value === e.target.value);
                        updateSignage('healthcare_center', 'status', status.value);
                        updateSignage('healthcare_center', 'color', status.color);
                      }}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {signageStatuses.map(status => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Logo Upload */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Signage Logo (displayed on left side)
                  </label>
                  <FileUpload
                    id="healthcare-logo"
                    label="Upload Logo"
                    accept="image/*"
                    allowedTypes={['.jpg', '.jpeg', '.png', '.svg', '.webp']}
                    maxSize={2097152}
                    bucket="company-assets"
                    folder="signage/logos"
                    onUploadComplete={(file) => {
                      updateSignage('healthcare_center', 'logo_url', file.url);
                      showMessage('success', 'Logo uploaded! Click "Save All Settings" to apply changes.');
                    }}
                    onUploadError={(error) => {
                      showMessage('error', error.message || 'Failed to upload logo');
                    }}
                    showPreview={true}
                    helpText="Upload logo (JPG, PNG, SVG - max 2MB). Square images work best."
                  />
                  {settings.signage.healthcare_center.logo_url && (
                    <div className="mt-2 flex items-center gap-4">
                      <img
                        src={settings.signage.healthcare_center.logo_url}
                        alt="Healthcare Center Logo"
                        className="h-16 w-16 object-contain bg-gray-100 dark:bg-gray-700 rounded p-2"
                      />
                      <button
                        type="button"
                        onClick={() => updateSignage('healthcare_center', 'logo_url', null)}
                        className="text-sm text-red-600 dark:text-red-400 hover:underline"
                      >
                        Remove Logo
                      </button>
                    </div>
                  )}
                </div>

                {/* Preview */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Live Preview
                  </label>
                  <div className="p-6 bg-white rounded-lg border-4 border-gray-800 text-center">
                    <div className="flex flex-col items-center justify-center gap-4">
                      {settings.signage.healthcare_center.logo_url && (
                        <img
                          src={settings.signage.healthcare_center.logo_url}
                          alt="Logo"
                          className="h-16 w-16 object-contain"
                        />
                      )}
                      {settings.signage.healthcare_center.text && (
                        <div>
                          <div className="text-gray-900 text-xl font-bold mb-1">
                            {settings.signage.healthcare_center.text}
                          </div>
                          <div className="text-lg font-bold" style={{ color: settings.signage.healthcare_center.color }}>
                            {settings.signage.healthcare_center.status}
                          </div>
                        </div>
                      )}
                      {!settings.signage.healthcare_center.text && !settings.signage.healthcare_center.logo_url && (
                        <div className="text-gray-400 text-sm">Upload a logo or add text</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Perfume Shop Signage */}
              <div className="p-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Perfume Shop Signage</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Display Text (optional - leave blank for logo only)
                    </label>
                    <input
                      type="text"
                      value={settings.signage.perfume_shop.text}
                      onChange={(e) => updateSignage('perfume_shop', 'text', e.target.value)}
                      placeholder="Leave blank for logo only"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={settings.signage.perfume_shop.status}
                      onChange={(e) => {
                        const status = signageStatuses.find(s => s.value === e.target.value);
                        updateSignage('perfume_shop', 'status', status.value);
                        updateSignage('perfume_shop', 'color', status.color);
                      }}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {signageStatuses.map(status => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Logo Upload */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Signage Logo (displayed on left side)
                  </label>
                  <FileUpload
                    id="perfume-logo"
                    label="Upload Logo"
                    accept="image/*"
                    allowedTypes={['.jpg', '.jpeg', '.png', '.svg', '.webp']}
                    maxSize={2097152}
                    bucket="company-assets"
                    folder="signage/logos"
                    onUploadComplete={(file) => {
                      updateSignage('perfume_shop', 'logo_url', file.url);
                      showMessage('success', 'Logo uploaded! Click "Save All Settings" to apply changes.');
                    }}
                    onUploadError={(error) => {
                      showMessage('error', error.message || 'Failed to upload logo');
                    }}
                    showPreview={true}
                    helpText="Upload logo (JPG, PNG, SVG - max 2MB). Square images work best."
                  />
                  {settings.signage.perfume_shop.logo_url && (
                    <div className="mt-2 flex items-center gap-4">
                      <img
                        src={settings.signage.perfume_shop.logo_url}
                        alt="Perfume Shop Logo"
                        className="h-16 w-16 object-contain bg-gray-100 dark:bg-gray-700 rounded p-2"
                      />
                      <button
                        type="button"
                        onClick={() => updateSignage('perfume_shop', 'logo_url', null)}
                        className="text-sm text-red-600 dark:text-red-400 hover:underline"
                      >
                        Remove Logo
                      </button>
                    </div>
                  )}
                </div>

                {/* Preview */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Live Preview
                  </label>
                  <div className="p-6 bg-white rounded-lg border-4 border-gray-800 text-center">
                    <div className="flex flex-col items-center justify-center gap-4">
                      {settings.signage.perfume_shop.logo_url && (
                        <img
                          src={settings.signage.perfume_shop.logo_url}
                          alt="Logo"
                          className="h-16 w-16 object-contain"
                        />
                      )}
                      {settings.signage.perfume_shop.text && (
                        <div>
                          <div className="text-gray-900 text-xl font-bold mb-1">
                            {settings.signage.perfume_shop.text}
                          </div>
                          <div className="text-lg font-bold" style={{ color: settings.signage.perfume_shop.color }}>
                            {settings.signage.perfume_shop.status}
                          </div>
                        </div>
                      )}
                      {!settings.signage.perfume_shop.text && !settings.signage.perfume_shop.logo_url && (
                        <div className="text-gray-400 text-sm">Upload a logo or add text</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Button - Fixed Bottom */}
        <div className="mt-6 flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Changes will be applied immediately after saving
          </p>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {saving ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              'Save All Settings'
            )}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
