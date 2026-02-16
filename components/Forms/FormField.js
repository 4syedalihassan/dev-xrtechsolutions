/**
 * FormField Component
 * WCAG 2.1 AA Compliant Form Field
 * Sprint 4 - US-4.4: Form Accessibility
 */
import React from 'react';

export default function FormField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  error,
  helpText,
  required = false,
  disabled = false,
  placeholder,
  ...props
}) {
  const errorId = error ? `${id}-error` : undefined;
  const helpId = helpText ? `${id}-help` : undefined;
  const describedBy = [errorId, helpId].filter(Boolean).join(' ');

  return (
    <div className="form-group">
      <label htmlFor={id} className="form-label">
        {label}
        {required && <span aria-label="required" className="text-danger"> *</span>}
      </label>

      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        className={`form-input ${error ? 'form-input-error' : ''}`}
        aria-required={required}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={describedBy || undefined}
        disabled={disabled}
        placeholder={placeholder}
        {...props}
      />

      {helpText && (
        <p id={helpId} className="form-help-text">
          {helpText}
        </p>
      )}

      {error && (
        <p id={errorId} className="form-error-text" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
