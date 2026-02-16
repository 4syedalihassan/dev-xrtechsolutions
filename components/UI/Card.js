/**
 * Card Component
 * Sprint 5 - US-5.7: Component Library
 * Reusable card container component with optional title and actions
 */
import React from 'react';

export default function Card({
  children,
  title,
  actions,
  className = '',
  ...props
}) {
  return (
    <div className={`admin-card ${className}`} {...props}>
      {(title || actions) && (
        <div className="card-header">
          {title && <h2 className="card-title">{title}</h2>}
          {actions && <div className="card-actions">{actions}</div>}
        </div>
      )}
      <div className="card-content">
        {children}
      </div>
    </div>
  );
}
