/**
 * Button Component
 * Sprint 5 - US-5.7: Component Library
 * Reusable button component with variants, sizes, and loading states
 */
import React from 'react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  ...props
}) {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;

  return (
    <button
      className={`${baseClass} ${variantClass} ${sizeClass}`}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading && <span className="spinner" aria-hidden="true" />}
      {icon && <span className="btn-icon" aria-hidden="true">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
