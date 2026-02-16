/**
 * getStatusStyle Utility
 * Provides consistent status indicator styling across the application
 * Replaces hardcoded color functions with icon + border style combinations
 * Supports light and dark modes
 */

import {
  STATUS_STYLE_CONFIG,
  BG_COLOR_MAP,
  TEXT_COLOR_MAP,
  BORDER_COLOR_MAP,
} from './statusStyleConfig';

/**
 * Get styling for status indicators
 * @param {string} status - The status type (success, error, warning, info, pending, etc.)
 * @param {boolean} isDark - Whether dark mode is active
 * @returns {object} Style configuration with icon, classes, and variants
 */
export const getStatusStyle = (status, isDark = false) => {
  const normalizedStatus = status?.toLowerCase() || 'info';
  const statusConfig = STATUS_STYLE_CONFIG[normalizedStatus] || STATUS_STYLE_CONFIG.info;
  const themeVariant = isDark ? statusConfig.dark : statusConfig.light;

  return {
    icon: statusConfig.icon,
    label: statusConfig.label,
    ...themeVariant,
    // For backwards compatibility with old color-based systems
    color: isDark ? '#ffffff' : '#000000',
  };
};

/**
 * Get CSS class string for a status badge
 * @param {string} status - The status type
 * @param {boolean} isDark - Whether dark mode is active
 * @param {string} additionalClasses - Additional CSS classes to append
 * @returns {string} Complete className string
 */
export const getStatusClassName = (status, isDark = false, additionalClasses = '') => {
  const style = getStatusStyle(status, isDark);
  return `${style.className} ${additionalClasses}`.trim();
};

/**
 * Helper: Get background color from Tailwind class
 * @param {string} bgClass - Tailwind background class (e.g., 'bg-white')
 * @returns {string} Hex color value
 */
const getBgColor = (bgClass) => {
  return BG_COLOR_MAP[bgClass] || '#ffffff';
};

/**
 * Helper: Get text color from Tailwind class
 * @param {string} textClass - Tailwind text class (e.g., 'text-black')
 * @returns {string} Hex color value
 */
const getTextColor = (textClass) => {
  return TEXT_COLOR_MAP[textClass] || '#000000';
};

/**
 * Helper: Parse border style from Tailwind border string
 * @param {string} borderString - Border class string (e.g., 'border-2 border-dashed border-black')
 * @returns {object} Border style object with width, style, and color
 */
const parseBorderStyle = (borderString) => {
  // Extract border width
  const borderMatch = borderString.match(/border-(\[?\d+\]?|2|[0-9]+)/);
  const borderWidth = borderMatch ? borderMatch[1].replace(/[\[\]]/g, '') + 'px' : '1px';

  // Extract border style (solid or dashed)
  const borderStyle = borderString.includes('dashed') ? 'dashed' : 'solid';

  // Extract border color - find the first matching color class
  let borderColor = '#000000';
  for (const className of Object.keys(BORDER_COLOR_MAP)) {
    if (borderString.includes(className)) {
      borderColor = BORDER_COLOR_MAP[className];
      break;
    }
  }

  return { borderWidth, borderStyle, borderColor };
};

/**
 * Get inline styles for a status (for legacy components using style prop)
 * @param {string} status - The status type
 * @param {boolean} isDark - Whether dark mode is active
 * @returns {object} Inline style object
 */
export const getStatusInlineStyle = (status, isDark = false) => {
  const statusStyle = getStatusStyle(status, isDark);

  // Get colors using helper functions
  const backgroundColor = getBgColor(statusStyle.bg);
  const color = getTextColor(statusStyle.text);

  // Parse border properties using helper function
  const { borderWidth, borderStyle, borderColor } = parseBorderStyle(statusStyle.border);

  return {
    backgroundColor,
    color,
    border: `${borderWidth} ${borderStyle} ${borderColor}`,
    padding: '0.5rem 1rem',
    borderRadius: '0.25rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
  };
};

export default getStatusStyle;
