import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);
  const router = useRouter();

  //  Quick search items
  const quickActions = [
    { name: 'Add Product', path: '/admin/products', icon: '➕', type: 'action' },
    { name: 'View Orders', path: '/admin/orders', icon: '📋', type: 'action' },
    { name: 'Manage Customers', path: '/admin/customers', icon: '👥', type: 'action' },
    { name: 'Settings', path: '/admin/settings', icon: '⚙️', type: 'action' },
  ];

  useEffect(() => {
    // Keyboard shortcut: Ctrl/Cmd + K
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSearch = async (searchQuery) => {
    setQuery(searchQuery);

    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);

    // Simulate search (in production, this would call your API)
    setTimeout(() => {
      const filtered = quickActions.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setResults(filtered);
      setLoading(false);
    }, 200);
  };

  const handleSelect = (path) => {
    router.push(path);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <>
      {/* Search trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="hidden md:inline">Search...</span>
        <kbd className="hidden md:inline px-1.5 py-0.5 text-xs bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600">
          ⌘K
        </kbd>
      </button>

      {/* Search modal */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 animate-fadeIn" onClick={() => setIsOpen(false)} />

          {/* Search dialog */}
          <div className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 animate-scaleIn" ref={searchRef}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Search input */}
              <div className="flex items-center border-b border-gray-200 dark:border-gray-700 px-4 py-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search pages, products, customers..."
                  className="flex-1 ml-3 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none"
                  autoFocus
                />
                {loading && (
                  <div className="animate-spin w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full"></div>
                )}
              </div>

              {/* Results */}
              <div className="max-h-96 overflow-y-auto p-2">
                {query.length === 0 && (
                  <div className="py-2">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-3 mb-2">
                      Quick Actions
                    </p>
                    {quickActions.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => handleSelect(item.path)}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <span className="text-xl">{item.icon}</span>
                        <span>{item.name}</span>
                      </button>
                    ))}
                  </div>
                )}

                {query.length > 0 && results.length > 0 && (
                  <div className="py-2">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase px-3 mb-2">
                      Results
                    </p>
                    {results.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => handleSelect(item.path)}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <span className="text-xl">{item.icon}</span>
                        <span>{item.name}</span>
                      </button>
                    ))}
                  </div>
                )}

                {query.length > 0 && results.length === 0 && !loading && (
                  <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                    <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>No results found for "{query}"</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">↑↓</kbd>
                    Navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">↵</kbd>
                    Select
                  </span>
                </div>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">ESC</kbd>
                  Close
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
