import React, { useState, useEffect } from 'react';
import useModalAccessibility from '../../hooks/useModalAccessibility';

/**
 * ConfirmationModal Component
 * 
 * A accessible modal for confirming actions.
 * Supports:
 * - Custom title and message
 * - visual variants (danger, warning, info)
 * - "Type to confirm" verification for destructive actions
 */
const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger', // danger, warning, info
    verificationText = null, // If provided, user must type this to enable confirm
    loading = false
}) => {
    const [verificationInput, setVerificationInput] = useState('');

    // Reset input when modal opens
    useEffect(() => {
        if (isOpen) setVerificationInput('');
    }, [isOpen]);

    const { modalRef, handleBackdropClick } = useModalAccessibility(isOpen, onClose, {
        initialFocusSelector: verificationText ? '#verification-input' : '#confirm-btn'
    });

    if (!isOpen) return null;

    const isConfirmDisabled = verificationText && verificationInput !== verificationText;

    const getVariantStyles = () => {
        switch (variant) {
            case 'danger':
                return {
                    icon: '⚠️',
                    color: 'var(--error-600)',
                    bg: 'var(--error-50)',
                    btnBg: 'var(--error-600)',
                    btnColor: '#ffffff'
                };
            case 'warning':
                return {
                    icon: '⚠️',
                    color: 'var(--warning-600)',
                    bg: 'var(--warning-50)',
                    btnBg: 'var(--warning-500)',
                    btnColor: '#ffffff'
                };
            case 'info':
            default:
                return {
                    icon: 'ℹ️',
                    color: 'var(--primary-600)',
                    bg: 'var(--primary-50)',
                    btnBg: 'var(--primary-600)',
                    btnColor: '#ffffff'
                };
        }
    };

    const styles = getVariantStyles();

    return (
        <div
            onClick={handleBackdropClick}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2100 // Higher than standard modal
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
            aria-describedby="confirm-modal-desc"
        >
            <div
                ref={modalRef}
                style={{
                    backgroundColor: 'var(--bg-primary)',
                    borderRadius: '12px',
                    width: '90%',
                    maxWidth: '450px',
                    padding: '2rem',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                }}
                role="document"
            >
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '3rem',
                        height: '3rem',
                        borderRadius: '50%',
                        backgroundColor: styles.bg,
                        color: styles.color,
                        fontSize: '1.5rem',
                        marginBottom: '1rem'
                    }}>
                        {styles.icon}
                    </div>
                    <h3 id="confirm-modal-title" style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        margin: '0 0 0.5rem 0'
                    }}>
                        {title}
                    </h3>
                    <p id="confirm-modal-desc" style={{
                        color: 'var(--text-secondary)',
                        margin: 0,
                        whiteSpace: 'pre-line'
                    }}>
                        {message}
                    </p>
                </div>

                {verificationText && (
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label
                            htmlFor="verification-input"
                            style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-primary)' }}
                        >
                            Please type <strong>{verificationText}</strong> to confirm:
                        </label>
                        <input
                            id="verification-input"
                            type="text"
                            value={verificationInput}
                            onChange={(e) => setVerificationInput(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.5rem 0.75rem',
                                border: '1px solid var(--border-primary)',
                                borderRadius: '6px',
                                fontSize: '1rem',
                                backgroundColor: 'var(--bg-secondary)',
                                color: 'var(--text-primary)'
                            }}
                            placeholder={verificationText}
                            autoComplete="off"
                        />
                    </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button
                        className="btn"
                        onClick={onClose}
                        disabled={loading}
                        style={{
                            padding: '0.625rem 1.25rem',
                            backgroundColor: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border-primary)',
                            borderRadius: '6px',
                            fontWeight: '500',
                            cursor: 'pointer'
                        }}
                    >
                        {cancelText}
                    </button>
                    <button
                        id="confirm-btn"
                        className="btn"
                        onClick={onConfirm}
                        disabled={loading || isConfirmDisabled}
                        style={{
                            padding: '0.625rem 1.25rem',
                            backgroundColor: isConfirmDisabled ? 'var(--text-tertiary)' : styles.btnBg,
                            color: styles.btnColor,
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: '500',
                            cursor: (loading || isConfirmDisabled) ? 'not-allowed' : 'pointer',
                            opacity: (loading || isConfirmDisabled) ? 0.7 : 1,
                            transition: 'all 0.2s'
                        }}
                    >
                        {loading ? 'Processing...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
