import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../hooks/useTheme';
import GlobalSearch from './GlobalSearch';
import NotificationsBell from './NotificationsBell';

export default function AdminHeader({ logoUrl, logoUrlDark, onMenuToggle }) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const userMenuRef = useRef(null);
  const router = useRouter();
  const { user, signOut } = useAuth();

  // Close user menu on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);


  const handleLogout = async () => {
    try {
      setIsUserMenuOpen(false);

      // Call signOut
      const { error } = await signOut();

      if (error) {
        console.error('Logout error:', error);
      }

      // Force redirect to login page regardless of error
      // Use window.location for hard redirect to clear all state
      window.location.href = '/admin/login';
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect even on error
      window.location.href = '/admin/login';
    }
  };

  const getUserInitial = () => {
    if (!user?.name) return 'A';
    return user.name.charAt(0).toUpperCase();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">

        {/* Logo Section - Left */}
        <Link href="/admin" className="flex items-center h-full">
          <div className="relative h-10 lg:h-12 w-auto flex items-center">
            {/* Light theme logo */}
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo"
                className="h-10 lg:h-12 w-auto object-contain dark:hidden"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'block';
                }}
              />
            ) : (
              <span className="text-lg lg:text-xl font-bold text-gray-800 dark:hidden">XR Admin</span>
            )}

            {/* Dark theme logo */}
            {logoUrlDark || logoUrl ? (
              <img
                src={logoUrlDark || logoUrl}
                alt="Logo"
                className="h-10 lg:h-12 w-auto object-contain hidden dark:block"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const fallback = document.createElement('span');
                  fallback.textContent = 'XR Admin';
                  fallback.className = 'text-lg lg:text-xl font-bold text-white';
                  e.target.parentNode.appendChild(fallback);
                }}
              />
            ) : (
              <span className="text-lg lg:text-xl font-bold text-white hidden dark:block">XR Admin</span>
            )}
          </div>
        </Link>

        {/* Middle Section - Search (Hidden on mobile) */}
        <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
          <GlobalSearch />
        </div>

        {/* Right Section - Mobile Menu + Notifications + Theme Toggle + User Menu */}
        <div className="flex items-center space-x-2 lg:space-x-3">

          {/* Mobile Menu Toggle Button - Only visible on mobile */}
          {onMenuToggle && (
            <button
              onClick={onMenuToggle}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors lg:hidden"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}

          {/* Notifications (Hidden on mobile) */}
          <div className="hidden lg:block">
            <NotificationsBell />
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>

          {/* User Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsUserMenuOpen(!isUserMenuOpen);
              }}
              className="flex items-center space-x-2 lg:space-x-3 hover:opacity-80 transition-opacity"
            >
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-800 to-black dark:from-gray-200 dark:to-white flex items-center justify-center text-white dark:text-black font-bold text-sm">
                {getUserInitial()}
              </div>

              {/* User Info (Hidden on mobile) */}
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-gray-800 dark:text-white">
                  {user?.name || 'Admin'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.role || 'Administrator'}
                </div>
              </div>

              {/* Chevron */}
              <svg
                className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">

                {/* User Info Section */}
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-800 to-black dark:from-gray-200 dark:to-white flex items-center justify-center text-white dark:text-black font-bold">
                      {getUserInitial()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800 dark:text-white">
                        {user?.name || 'Admin'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {user?.email || 'admin@xrtechmart.com'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <Link href="/admin" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <span className="mr-3">📊</span>
                    Admin Dashboard
                  </Link>
                  <Link href="/admin/products" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <span className="mr-3">📦</span>
                    Manage Products
                  </Link>
                  <Link href="/admin/orders" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <span className="mr-3">📋</span>
                    Manage Orders
                  </Link>
                  <Link href="/admin/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <span className="mr-3">⚙️</span>
                    Admin Settings
                  </Link>
                  <Link href="/admin/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <span className="mr-3">🔑</span>
                    Change Password
                  </Link>
                </div>

                {/* View Site */}
                <div className="border-t border-gray-200 dark:border-gray-700 py-2">
                  <Link href="/" target="_blank" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                    <span className="mr-3">👁️</span>
                    View Site
                  </Link>
                </div>

                {/* Logout */}
                <div className="border-t border-gray-200 dark:border-gray-700 py-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold"
                  >
                    <span className="mr-3">🚪</span>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
