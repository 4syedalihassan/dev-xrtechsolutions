/**
 * ModelViewer Component
 * 
 * A wrapper component for Google's <model-viewer> web component.
 * Provides an easy-to-use interface for displaying 3D models in product popups.
 * 
 * Features:
 * - Auto-rotate and camera controls
 * - AR support (on compatible devices)
 * - Loading poster/placeholder
 * - Shadow and lighting
 * - Touch gestures for mobile
 * 
 * @see https://modelviewer.dev/
 */

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

// Inline styles for spinner animation - defined here to ensure it's available immediately
const spinnerKeyframes = `
  @keyframes model-viewer-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

export default function ModelViewer({
  src,
  alt = '3D Model',
  poster,
  autoRotate = true,
  cameraControls = true,
  ar = false,
  shadowIntensity = 1,
  exposure = 1,
  style = {},
  className = '',
  onLoad,
  onError,
}) {
  const containerRef = useRef(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [scriptError, setScriptError] = useState(false);
  const loadTimeoutRef = useRef(null);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check if model-viewer is already loaded and set a timeout
  useEffect(() => {
    if (!isClient) return;

    // Track if component is still mounted
    let isMounted = true;

    // Check if model-viewer custom element is already defined
    if (typeof window !== 'undefined' && window.customElements && window.customElements.get('model-viewer')) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[ModelViewer] model-viewer already loaded');
      }
      if (isMounted) setScriptLoaded(true);
      return;
    }

    // Set a timeout to force load state after 10 seconds if script hasn't loaded
    loadTimeoutRef.current = setTimeout(() => {
      // Only update state if component is still mounted
      if (!isMounted) return;

      if (process.env.NODE_ENV === 'development') {
        console.warn('[ModelViewer] Script loading timeout - checking load state');
      }
      // Check one more time if the element is defined (prevents race condition)
      if (typeof window !== 'undefined' && window.customElements && window.customElements.get('model-viewer')) {
        setScriptLoaded(true);
      } else {
        setScriptError(true);
      }
    }, 10000);

    return () => {
      isMounted = false;
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, [isClient]);

  // Handle model load event
  useEffect(() => {
    if (!scriptLoaded || !containerRef.current) return;

    const modelViewer = containerRef.current.querySelector('model-viewer');
    if (!modelViewer) return;

    const handleLoad = () => {
      if (onLoad) onLoad();
    };

    const handleError = (event) => {
      console.error('[ModelViewer] Error loading model:', event);
      if (onError) onError(event);
    };

    modelViewer.addEventListener('load', handleLoad);
    modelViewer.addEventListener('error', handleError);

    return () => {
      modelViewer.removeEventListener('load', handleLoad);
      modelViewer.removeEventListener('error', handleError);
    };
  }, [scriptLoaded, onLoad, onError]);

  // Don't render on server
  if (!isClient) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-secondary)',
          ...style
        }}
        className={className}
      >
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>🎨</div>
          <p>Loading 3D Viewer...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Inject spinner keyframes immediately */}
      <style dangerouslySetInnerHTML={{ __html: spinnerKeyframes }} />
      {/* Load the model-viewer script */}
      <Script
        src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js"
        type="module"
        strategy="afterInteractive"
        onLoad={() => {
          if (process.env.NODE_ENV === 'development') {
            console.log('[ModelViewer] Script loaded successfully');
          }
          setScriptLoaded(true);
          if (loadTimeoutRef.current) {
            clearTimeout(loadTimeoutRef.current);
          }
        }}
        onError={(e) => {
          console.error('[ModelViewer] Failed to load model-viewer script:', e);
          setScriptError(true);
          if (loadTimeoutRef.current) {
            clearTimeout(loadTimeoutRef.current);
          }
        }}
      />

      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
        }}
        className={className}
      >
        {scriptLoaded ? (
          <model-viewer
            src={src}
            alt={alt}
            poster={poster}
            shadow-intensity={shadowIntensity}
            exposure={exposure}
            camera-controls={cameraControls ? '' : null}
            auto-rotate={autoRotate ? '' : null}
            ar={ar ? '' : null}
            touch-action="pan-y"
            role="img"
            tabIndex="0"
            aria-label={alt}
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: 'transparent',
              '--poster-color': 'transparent',
            }}
          >
            {/* Loading indicator slot */}
            <div
              slot="poster"
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-secondary)',
              }}
            >
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    border: '3px solid var(--border-subtle)',
                    borderTopColor: 'var(--color-primary)',
                    borderRadius: '50%',
                    animation: 'model-viewer-spin 1s linear infinite',
                    margin: '0 auto 10px',
                  }}
                />
                <p style={{ margin: 0, fontSize: '14px' }}>Loading 3D Model...</p>
              </div>
            </div>

            {/* Progress bar slot */}
            <div
              slot="progress-bar"
              style={{
                position: 'absolute',
                bottom: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '80%',
                height: '4px',
                backgroundColor: 'rgba(0,0,0,0.1)',
                borderRadius: '2px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  backgroundColor: 'var(--color-primary)',
                  transition: 'width 0.3s',
                }}
              />
            </div>
          </model-viewer>
        ) : scriptError ? (
          <div
            role="alert"
            aria-live="assertive"
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--error-50)',
              border: '1px solid var(--error-200)',
              padding: '20px',
            }}
          >
            <div style={{ textAlign: 'center', color: 'var(--error-700)' }}>
              <div style={{ fontSize: '48px', marginBottom: '10px' }}>⚠️</div>
              <p style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: 'bold' }}>
                Failed to load 3D Viewer
              </p>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--error-600)' }}>
                Please check your internet connection and try refreshing the page
              </p>
            </div>
          </div>
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--bg-secondary)',
            }}
          >
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  border: '3px solid var(--border-subtle)',
                  borderTopColor: 'var(--color-primary)',
                  borderRadius: '50%',
                  animation: 'model-viewer-spin 1s linear infinite',
                  margin: '0 auto 10px',
                }}
              />
              <p style={{ margin: 0, fontSize: '14px' }}>Initializing 3D Viewer...</p>
            </div>
          </div>
        )}

        <style jsx global>{`
          model-viewer {
            --poster-color: transparent;
          }
          
          model-viewer::part(default-progress-bar) {
            background-color: var(--color-primary);
          }
        `}</style>
      </div>
    </>
  );
}
