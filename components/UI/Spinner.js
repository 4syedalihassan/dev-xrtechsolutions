/**
 * Spinner Component
 *
 * A versatile loading spinner component with multiple variants and sizes.
 *
 * Features:
 * - 3 spinner types (circular, dots, pulse)
 * - 4 sizes (xs, sm, md, lg)
 * - 5 color variants (primary, success, danger, warning, white)
 * - Optional loading text
 * - Full-page overlay option
 * - Accessible with aria-label and role="status"
 * - Reduced motion support (prefers-reduced-motion)
 *
 * WCAG Compliance:
 * - 4.1.3 Status Messages (Level AA) - Loading state announced
 * - 2.3.3 Animation from Interactions (Level AAA) - Respects prefers-reduced-motion
 * - 1.4.1 Use of Color (Level A) - Loading text supplements visual indicator
 *
 * @component
 */

export default function Spinner({
  type = 'circular',
  size = 'md',
  color = 'primary',
  text,
  fullPage = false,
  className = '',
}) {
  // Size mappings
  const sizeClasses = {
    xs: 'spinner-xs',
    sm: 'spinner-sm',
    md: 'spinner-md',
    lg: 'spinner-lg',
  };

  // Color mappings
  const colorClasses = {
    primary: 'spinner-primary',
    success: 'spinner-success',
    danger: 'spinner-danger',
    warning: 'spinner-warning',
    white: 'spinner-white',
  };

  // Spinner content based on type
  const renderSpinner = () => {
    switch (type) {
      case 'circular':
        return (
          <div className={`spinner-circular ${sizeClasses[size]} ${colorClasses[color]}`}>
            <div className="spinner-circle"></div>
          </div>
        );

      case 'dots':
        return (
          <div className={`spinner-dots ${sizeClasses[size]} ${colorClasses[color]}`}>
            <div className="spinner-dot"></div>
            <div className="spinner-dot"></div>
            <div className="spinner-dot"></div>
          </div>
        );

      case 'pulse':
        return (
          <div className={`spinner-pulse ${sizeClasses[size]} ${colorClasses[color]}`}>
            <div className="spinner-pulse-ring"></div>
            <div className="spinner-pulse-ring"></div>
          </div>
        );

      default:
        return (
          <div className={`spinner-circular ${sizeClasses[size]} ${colorClasses[color]}`}>
            <div className="spinner-circle"></div>
          </div>
        );
    }
  };

  // Full-page overlay
  if (fullPage) {
    return (
      <div className="spinner-overlay" role="status" aria-live="polite">
        <div className="spinner-overlay-content">
          {renderSpinner()}
          {text && <p className="spinner-text">{text}</p>}
        </div>
        <span className="sr-only">{text || 'Loading...'}</span>
      </div>
    );
  }

  // Inline spinner
  return (
    <div className={`spinner-container ${className}`} role="status" aria-live="polite">
      {renderSpinner()}
      {text && <span className="spinner-text">{text}</span>}
      <span className="sr-only">{text || 'Loading...'}</span>
    </div>
  );
}

/**
 * LoadingState Component
 *
 * Wrapper component for conditional loading states.
 * Shows spinner while loading, content when ready.
 */
export function LoadingState({
  loading,
  children,
  spinnerProps = {},
  fallback = null,
}) {
  if (loading) {
    return fallback || <Spinner {...spinnerProps} />;
  }

  return <>{children}</>;
}

/**
 * Usage Examples:
 *
 * // Basic circular spinner (default)
 * <Spinner />
 *
 * // Small primary spinner with text
 * <Spinner size="sm" text="Loading..." />
 *
 * // Large success spinner
 * <Spinner type="circular" size="lg" color="success" />
 *
 * // Dots spinner
 * <Spinner type="dots" color="primary" text="Please wait..." />
 *
 * // Pulse spinner
 * <Spinner type="pulse" color="warning" />
 *
 * // Full-page overlay spinner
 * <Spinner fullPage text="Loading your data..." />
 *
 * // White spinner for dark backgrounds
 * <Spinner color="white" />
 *
 * // Using LoadingState wrapper
 * <LoadingState loading={isLoading} spinnerProps={{ text: "Fetching data..." }}>
 *   <DataTable data={data} />
 * </LoadingState>
 *
 * // Custom fallback
 * <LoadingState
 *   loading={isLoading}
 *   fallback={<Spinner type="pulse" size="lg" text="Loading..." />}
 * >
 *   <Content />
 * </LoadingState>
 */

/**
 * Button with Loading State
 *
 * Enhanced Button component with integrated loading spinner.
 */
export function LoadingButton({
  loading = false,
  children,
  disabled,
  className = '',
  spinnerSize = 'sm',
  ...props
}) {
  return (
    <button
      className={`btn ${className}`}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading && <Spinner type="circular" size={spinnerSize} color="white" />}
      {children}
    </button>
  );
}

/**
 * Inline Loading
 *
 * Small inline spinner for use in text or small UI elements.
 */
export function InlineSpinner({ className = '' }) {
  return (
    <span className={`spinner-inline ${className}`} role="status" aria-label="Loading">
      <span className="spinner-circle-inline"></span>
    </span>
  );
}
