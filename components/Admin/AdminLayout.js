import { useState, useEffect } from 'react';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout({ children, currentPage = '' }) {
  const [settings, setSettings] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (!response.ok) {
        throw new Error(`Settings API returned ${response.status}`);
      }
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Failed to load settings:', error);
      // Use default settings if API fails
      setSettings({
        currency: 'PKR',
        currency_symbol: 'Rs',
        tax_rate: 0,
        store_name: 'XR Tech Solutions',
        store_email: 'admin@xrtech.com',
        store_phone: '+92-XXX-XXXXXXX',
        store_logo: null,
        store_logo_dark: null
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Admin Header - Fixed Top */}
      <AdminHeader
        logoUrl={settings?.store_logo}
        logoUrlDark={settings?.store_logo_dark}
        onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Main Layout - Flex Container */}
      <div className="flex pt-16">
        {/* Sidebar - Left */}
        <AdminSidebar
          currentPage={currentPage}
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content - Right */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto w-full">
          {/* Page Header */}
          {currentPage && (
            <div className="mb-6">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">
                {currentPage}
              </h1>
            </div>
          )}

          {/* Page Content */}
          <div className="space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
