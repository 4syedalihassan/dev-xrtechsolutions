/**
 * Admin Settings Constants
 * 
 * Centralized constants for admin settings to reduce complexity
 * and improve maintainability.
 */

// Centralized status colors aligned with theme tokens
export const STATUS_COLORS = {
  OPEN: '#10b981',      // success-500 from theme
  CLOSED: '#f59e0b',    // warning-500 from theme
  MAINTENANCE: '#ef4444' // error-500 from theme
};

export const currencies = [
  { code: 'PKR', symbol: 'Rs', name: 'Pakistani Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' }
];

export const languages = [
  { code: 'en', name: 'English' },
  { code: 'ur', name: 'Urdu' },
  { code: 'ar', name: 'Arabic' }
];

export const signageStatuses = [
  { value: 'OPEN', label: 'Open', color: STATUS_COLORS.OPEN },
  { value: 'CLOSED', label: 'Closed', color: STATUS_COLORS.CLOSED },
  { value: 'MAINTENANCE', label: 'Maintenance', color: STATUS_COLORS.MAINTENANCE }
];
