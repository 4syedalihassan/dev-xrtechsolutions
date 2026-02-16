/**
 * Status Style Configuration
 * Central configuration for all status indicator styles
 * Used by getStatusStyle utility
 */

export const STATUS_STYLE_CONFIG = {
  success: {
    icon: '✓',
    label: 'Success',
    light: {
      bg: 'bg-white',
      text: 'text-black',
      border: 'border-2 border-black',
      className: 'bg-white border-2 border-black text-black',
    },
    dark: {
      bg: 'bg-black',
      text: 'text-white',
      border: 'border-2 border-white',
      className: 'bg-black border-2 border-white text-white',
    },
  },
  error: {
    icon: '✕',
    label: 'Error',
    light: {
      bg: 'bg-black',
      text: 'text-white',
      border: 'border-[3px] border-black',
      className: 'bg-black border-[3px] border-black text-white',
    },
    dark: {
      bg: 'bg-white',
      text: 'text-black',
      border: 'border-[3px] border-black',
      className: 'bg-white border-[3px] border-black text-black',
    },
  },
  warning: {
    icon: '⚠',
    label: 'Warning',
    light: {
      bg: 'bg-gray-100',
      text: 'text-black',
      border: 'border-2 border-dashed border-gray-900',
      className: 'bg-gray-100 border-2 border-dashed border-gray-900 text-black',
    },
    dark: {
      bg: 'bg-gray-900',
      text: 'text-white',
      border: 'border-2 border-dashed border-gray-100',
      className: 'bg-gray-900 border-2 border-dashed border-gray-100 text-white',
    },
  },
  info: {
    icon: 'ℹ',
    label: 'Info',
    light: {
      bg: 'bg-white',
      text: 'text-black',
      border: 'border border-black',
      className: 'bg-white border border-black text-black',
    },
    dark: {
      bg: 'bg-black',
      text: 'text-white',
      border: 'border border-white',
      className: 'bg-black border border-white text-white',
    },
  },
  pending: {
    icon: '⏳',
    label: 'Pending',
    light: {
      bg: 'bg-white',
      text: 'text-gray-600',
      border: 'border border-dashed border-gray-400',
      className: 'bg-white border border-dashed border-gray-400 text-gray-600',
    },
    dark: {
      bg: 'bg-black',
      text: 'text-gray-400',
      border: 'border border-dashed border-gray-600',
      className: 'bg-black border border-dashed border-gray-600 text-gray-400',
    },
  },
  // Order-specific statuses
  confirmed: {
    icon: '✓',
    label: 'Confirmed',
    light: {
      bg: 'bg-white',
      text: 'text-black',
      border: 'border-2 border-black',
      className: 'bg-white border-2 border-black text-black',
    },
    dark: {
      bg: 'bg-black',
      text: 'text-white',
      border: 'border-2 border-white',
      className: 'bg-black border-2 border-white text-white',
    },
  },
  processing: {
    icon: '⚙',
    label: 'Processing',
    light: {
      bg: 'bg-gray-200',
      text: 'text-black',
      border: 'border border-gray-700',
      className: 'bg-gray-200 border border-gray-700 text-black',
    },
    dark: {
      bg: 'bg-gray-800',
      text: 'text-white',
      border: 'border border-gray-300',
      className: 'bg-gray-800 border border-gray-300 text-white',
    },
  },
  shipped: {
    icon: '📦',
    label: 'Shipped',
    light: {
      bg: 'bg-gray-100',
      text: 'text-black',
      border: 'border-2 border-gray-800',
      className: 'bg-gray-100 border-2 border-gray-800 text-black',
    },
    dark: {
      bg: 'bg-gray-900',
      text: 'text-white',
      border: 'border-2 border-gray-200',
      className: 'bg-gray-900 border-2 border-gray-200 text-white',
    },
  },
  out_for_delivery: {
    icon: '🚚',
    label: 'Out for Delivery',
    light: {
      bg: 'bg-gray-50',
      text: 'text-black',
      border: 'border-2 border-black',
      className: 'bg-gray-50 border-2 border-black text-black',
    },
    dark: {
      bg: 'bg-gray-950',
      text: 'text-white',
      border: 'border-2 border-white',
      className: 'bg-gray-950 border-2 border-white text-white',
    },
  },
  delivered: {
    icon: '✓',
    label: 'Delivered',
    light: {
      bg: 'bg-white',
      text: 'text-black',
      border: 'border-[3px] border-black',
      className: 'bg-white border-[3px] border-black text-black',
    },
    dark: {
      bg: 'bg-black',
      text: 'text-white',
      border: 'border-[3px] border-white',
      className: 'bg-black border-[3px] border-white text-white',
    },
  },
  cancelled: {
    icon: '✕',
    label: 'Cancelled',
    light: {
      bg: 'bg-black',
      text: 'text-white',
      border: 'border-2 border-black',
      className: 'bg-black border-2 border-black text-white',
    },
    dark: {
      bg: 'bg-white',
      text: 'text-black',
      border: 'border-2 border-white',
      className: 'bg-white border-2 border-white text-black',
    },
  },
  // User statuses
  active: {
    icon: '●',
    label: 'Active',
    light: {
      bg: 'bg-white',
      text: 'text-black',
      border: 'border-2 border-black',
      className: 'bg-white border-2 border-black text-black',
    },
    dark: {
      bg: 'bg-black',
      text: 'text-white',
      border: 'border-2 border-white',
      className: 'bg-black border-2 border-white text-white',
    },
  },
  inactive: {
    icon: '○',
    label: 'Inactive',
    light: {
      bg: 'bg-gray-200',
      text: 'text-gray-700',
      border: 'border border-gray-400',
      className: 'bg-gray-200 border border-gray-400 text-gray-700',
    },
    dark: {
      bg: 'bg-gray-800',
      text: 'text-gray-300',
      border: 'border border-gray-600',
      className: 'bg-gray-800 border border-gray-600 text-gray-300',
    },
  },
  suspended: {
    icon: '⊘',
    label: 'Suspended',
    light: {
      bg: 'bg-black',
      text: 'text-white',
      border: 'border-2 border-black',
      className: 'bg-black border-2 border-black text-white',
    },
    dark: {
      bg: 'bg-white',
      text: 'text-black',
      border: 'border-2 border-white',
      className: 'bg-white border-2 border-white text-black',
    },
  },
};

/**
 * Color mapping constants for inline styles
 */
export const BG_COLOR_MAP = {
  'bg-white': '#ffffff',
  'bg-black': '#000000',
  'bg-gray-50': '#fafafa',
  'bg-gray-100': '#f5f5f5',
  'bg-gray-200': '#e5e5e5',
  'bg-gray-800': '#262626',
  'bg-gray-900': '#171717',
  'bg-gray-950': '#0a0a0a',
};

export const TEXT_COLOR_MAP = {
  'text-white': '#ffffff',
  'text-black': '#000000',
  'text-gray-300': '#d4d4d4',
  'text-gray-400': '#a3a3a3',
  'text-gray-600': '#525252',
  'text-gray-700': '#404040',
};

export const BORDER_COLOR_MAP = {
  'border-white': '#ffffff',
  'border-black': '#000000',
  'border-gray-100': '#f5f5f5',
  'border-gray-200': '#e5e5e5',
  'border-gray-300': '#d4d4d4',
  'border-gray-400': '#a3a3a3',
  'border-gray-600': '#525252',
  'border-gray-700': '#404040',
  'border-gray-800': '#262626',
  'border-gray-900': '#171717',
};
