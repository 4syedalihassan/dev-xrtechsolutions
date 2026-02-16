import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AdminLayout from '../../components/Admin/AdminLayout';
import StatCard from '../../components/Admin/StatCard';
import RevenueChart from '../../components/Admin/Charts/RevenueChart';
import SalesDonut from '../../components/Admin/Charts/SalesDonut';
import ActivityBar from '../../components/Admin/Charts/ActivityBar';
import RecentOrders from '../../components/Admin/Widgets/RecentOrders';
import TopProducts from '../../components/Admin/Widgets/TopProducts';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

function AdminDashboardClient() {
  const [stats, setStats] = useState({
    products: 0,
    buildings: 2,
    revenue: 0,
    orders: 0
  });
  const [trends, setTrends] = useState({
    products: { value: '+12%', direction: 'up', text: 'from last month' },
    revenue: { value: '+18.2%', direction: 'up', text: 'from last month' },
    buildings: { value: '0%', direction: 'neutral', text: 'no change' },
    orders: { value: '+8%', direction: 'up', text: 'from last week' }
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({ currency: 'PKR', currency_symbol: 'Rs' });
  const [dashboardData, setDashboardData] = useState(null);
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
      loadDashboard();
    }
  }, [user]);

  // Show loading state until auth check completes - prevents flash of content
  if (authLoading || !user || !['admin', 'super_admin'].includes(user.role)) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--bg-primary)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid var(--border-subtle)',
            borderTop: '4px solid var(--primary-color)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: 'var(--text-secondary)' }}>Loading access...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        console.error('No auth token available');
        return;
      }

      const response = await fetch('/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        console.error('Unauthorized access to dashboard stats');
        return;
      }

      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
        setTrends(data.trends);
        setRecentActivity(data.recentOrders.map(order => ({
          type: 'product',
          text: `New order ${order.id} from ${order.customer}`,
          time: order.time,
          icon: '🛍️'
        })));

        setDashboardData(data);
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };


  const quickLinks = [
    {
      title: 'Add Product',
      href: '/admin/products',
      icon: '➕',
      description: 'Add new products to inventory',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'View Store',
      href: '/immersiveexp',
      icon: '🏪',
      description: 'Visit the 3D virtual store',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    },
    {
      title: 'Settings',
      href: '/admin/settings',
      icon: '⚙️',
      description: 'Configure store settings',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
    },
    {
      title: 'Buildings',
      href: '/admin/buildings',
      icon: '🏢',
      description: 'Manage 3D buildings',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
    }
  ];

  // Icon components for stat cards
  const PackageIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );

  const CurrencyIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const BuildingIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );

  const ShoppingCartIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );

  return (
    <AdminLayout currentPage="Dashboard">
      {/* Enhanced Welcome Section */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>

          <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.name || 'Admin'}! 👋
            </h1>
            <p className="text-white text-opacity-90 text-lg">
              Here's what's happening with your store today
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Products"
          value={stats.products}
          icon={PackageIcon}
          trend={trends.products.value}
          trendDirection={trends.products.direction}
          trendText={trends.products.text}
          iconBg="bg-blue-100 dark:bg-blue-900"
          iconColor="text-blue-600 dark:text-blue-400"
          sparklineData={[28, 32, 29, 35, 38, 42, 45]}
          sparklineColor="#3b82f6"
          loading={loading}
        />

        <StatCard
          title="Revenue"
          value={`${settings.currency_symbol} ${stats.revenue.toLocaleString()}`}
          icon={CurrencyIcon}
          trend={trends.revenue.value}
          trendDirection={trends.revenue.direction}
          trendText={trends.revenue.text}
          variant="gradient"
          gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
          sparklineData={[45000, 48000, 52000, 49000, 55000, 58000, 62000]}
          loading={loading}
        />

        <StatCard
          title="Buildings"
          value={stats.buildings}
          icon={BuildingIcon}
          trend={trends.buildings.value}
          trendDirection={trends.buildings.direction}
          trendText={trends.buildings.text}
          iconBg="bg-purple-100 dark:bg-purple-900"
          iconColor="text-purple-600 dark:text-purple-400"
          loading={loading}
        />

        <StatCard
          title="Orders"
          value={stats.orders}
          icon={ShoppingCartIcon}
          trend={trends.orders.value}
          trendDirection={trends.orders.direction}
          trendText={trends.orders.text}
          iconBg="bg-orange-100 dark:bg-orange-900"
          iconColor="text-orange-600 dark:text-orange-400"
          sparklineData={[12, 15, 13, 18, 16, 20, 22]}
          sparklineColor="#f97316"
          loading={loading}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Chart - Takes 2 columns */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Overview</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Last 7 days performance</p>
            </div>
          </div>
          <div className="h-80" style={{ minHeight: '320px' }}>
            <RevenueChart
              data={dashboardData?.charts?.revenue}
              currencySymbol={settings.currency_symbol}
            />
          </div>
        </div>

        {/* Sales Distribution - Takes 1 column */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Sales by Category</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Product distribution</p>
          <div className="h-80" style={{ minHeight: '320px' }}>
            <SalesDonut
              data={dashboardData?.charts?.salesByCategory}
              currencySymbol={settings.currency_symbol}
            />
          </div>
        </div>
      </div>

      {/* Activity Chart - Full Width */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Activity Overview</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Daily activity breakdown</p>
        <div className="h-80" style={{ minHeight: '320px' }}>
          <ActivityBar data={dashboardData?.charts?.activity} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Quick Actions</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className="group"
            >
              <div
                className="relative rounded-xl p-6 text-white overflow-hidden hover:scale-105 transition-transform duration-300 cursor-pointer shadow-md hover:shadow-xl"
                style={{ background: link.gradient }}
              >
                {/* Decorative circle */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>

                <div className="relative z-10">
                  <div className="text-3xl mb-3">{link.icon}</div>
                  <h3 className="text-lg font-semibold mb-1">{link.title}</h3>
                  <p className="text-sm text-white text-opacity-90">{link.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Recent Activity</h2>

        <div className="space-y-4">
          {recentActivity.map((activity, index) => {
            const getTypeColor = (type) => {
              const colors = {
                product: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500' },
                building: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-600 dark:text-green-400', border: 'border-green-500' },
                settings: { bg: 'bg-orange-100 dark:bg-orange-900', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-500' },
                stock: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-600 dark:text-red-400', border: 'border-red-500' },
                user: { bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500' }
              };
              return colors[type] || colors.product;
            };

            const typeColor = getTypeColor(activity.type);

            return (
              <div
                key={index}
                className={`flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 ${typeColor.border} hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors`}
              >
                <div className={`w-10 h-10 ${typeColor.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <span className="text-xl">{activity.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.text}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {activity.time}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <RecentOrders
          orders={dashboardData?.recentOrders}
          currencySymbol={settings.currency_symbol}
        />
        <TopProducts
          products={dashboardData?.topProducts}
          currencySymbol={settings.currency_symbol}
        />
      </div>
    </AdminLayout>
  );
}

// Export with client-side auth check
export default AdminDashboardClient;
