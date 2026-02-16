/**
 * AccessibleAlert Component
 *
 * A WCAG 2.1 AA compliant alert component with ARIA live regions
 * for announcing dynamic content changes to screen readers.
 *
 * Features:
 * - aria-live for screen reader announcements
 * - 4 semantic variants (success, error, warning, info)
 * - Role="alert" for errors
 * - Role="status" for non-critical updates
 * - Icon support with aria-hidden
 * - Dismissible with accessible close button
 * - Auto-dismiss option
 *
 * WCAG Compliance:
 * - 4.1.3 Status Messages (Level AA) - Dynamic announcements
 * - 1.4.1 Use of Color (Level A) - Icons supplement color
 * - 2.1.1 Keyboard (Level A) - Close button keyboard accessible
 *
 * @component
 */

import { useEffect, useState } from 'react';

export default function AccessibleAlert({
  type = 'info',
  message,
  title,
  dismissible = false,
  autoDismiss = false,
  autoDismissDuration = 5000,
  onDismiss,
  className = '',
  icon,
}) {
  const [visible, setVisible] = useState(true);

  // Auto-dismiss functionality
  useEffect(() => {
    if (autoDismiss && visible) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoDismissDuration);

      return () => clearTimeout(timer);
    }
  }, [autoDismiss, autoDismissDuration, visible]);

  const handleDismiss = () => {
    setVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  if (!visible) return null;

  // Determine ARIA attributes based on alert type
  const ariaAttributes = {
    // Use role="alert" for errors (assertive announcements)
    // Use role="status" for success/info (polite announcements)
    role: type === 'error' ? 'alert' : 'status',
    'aria-live': type === 'error' ? 'assertive' : 'polite',
    'aria-atomic': 'true',
  };

  // Icon mapping for each alert type
  const defaultIcons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  const alertIcon = icon || defaultIcons[type];

  return (
    <div
      className={`accessible-alert alert-${type} ${className}`}
      {...ariaAttributes}
    >
      {/* Icon (aria-hidden as it's decorative) */}
      {alertIcon && (
        <span className="alert-icon" aria-hidden="true">
          {alertIcon}
        </span>
      )}

      {/* Alert Content */}
      <div className="alert-content">
        {title && <div className="alert-title">{title}</div>}
        <div className="alert-message">{message}</div>
      </div>

      {/* Dismissible Close Button */}
      {dismissible && (
        <button
          type="button"
          className="alert-close"
          onClick={handleDismiss}
          aria-label={`Dismiss ${type} alert`}
        >
          <span aria-hidden="true">×</span>
        </button>
      )}
    </div>
  );
}

/**
 * Usage Examples:
 *
 * // Success message
 * <AccessibleAlert
 *   type="success"
 *   message="Customer saved successfully!"
 *   dismissible={true}
 *   autoDismiss={true}
 * />
 *
 * // Error message with title
 * <AccessibleAlert
 *   type="error"
 *   title="Validation Error"
 *   message="Please fill in all required fields."
 *   dismissible={true}
 * />
 *
 * // Warning message
 * <AccessibleAlert
 *   type="warning"
 *   message="This action cannot be undone."
 * />
 *
 * // Info message with custom icon
 * <AccessibleAlert
 *   type="info"
 *   message="New features available in settings."
 *   icon="🔔"
 *   dismissible={true}
 * />
 *
 * // Non-dismissible error
 * <AccessibleAlert
 *   type="error"
 *   message="Network connection lost. Please check your internet."
 * />
 */

/**
 * Alert Manager Hook (Optional)
 *
 * Usage:
 * const { alert, showSuccess, showError, showWarning, showInfo, clearAlert } = useAlertManager();
 *
 * showSuccess('Operation completed!');
 * showError('Something went wrong!');
 */
export function useAlertManager() {
  const [alert, setAlert] = useState(null);

  const showAlert = (type, message, options = {}) => {
    setAlert({
      type,
      message,
      ...options,
    });
  };

  const showSuccess = (message, options) => showAlert('success', message, options);
  const showError = (message, options) => showAlert('error', message, options);
  const showWarning = (message, options) => showAlert('warning', message, options);
  const showInfo = (message, options) => showAlert('info', message, options);
  const clearAlert = () => setAlert(null);

  return {
    alert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearAlert,
  };
}
