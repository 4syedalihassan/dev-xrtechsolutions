import React from 'react';

class WebGLErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Check if it's a WebGL-related error
    if (error.message && (
      error.message.includes('WebGL') ||
      error.message.includes('context') ||
      error.message.includes('CONTEXT_LOST_WEBGL')
    )) {
      return { hasError: true, error };
    }
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('WebGL Error caught by boundary:', error, errorInfo);
  }

  checkWebGLSupport() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) {
        return {
          supported: false,
          reason: 'WebGL is not supported by this browser'
        };
      }

      // Check for common WebGL extensions
      const extensions = {
        loseContext: gl.getExtension('WEBGL_lose_context'),
        depthTexture: gl.getExtension('WEBGL_depth_texture'),
        textureFloat: gl.getExtension('OES_texture_float')
      };

      return {
        supported: true,
        version: gl.getParameter(gl.VERSION),
        vendor: gl.getParameter(gl.VENDOR),
        renderer: gl.getParameter(gl.RENDERER),
        extensions
      };
    } catch (e) {
      return {
        supported: false,
        reason: `WebGL context creation failed: ${e.message}`
      };
    }
  }

  render() {
    if (this.state.hasError) {
      const webglInfo = this.checkWebGLSupport();
      
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: '#1a1a1a',
          color: '#ffffff',
          fontFamily: 'Arial, sans-serif',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#ff6b6b', marginBottom: '20px' }}>
            3D Environment Unavailable
          </h2>
          
          {!webglInfo.supported ? (
            <div>
              <p style={{ fontSize: '18px', marginBottom: '15px' }}>
                {webglInfo.reason}
              </p>
              <div style={{ backgroundColor: '#333', padding: '20px', borderRadius: '8px', maxWidth: '600px' }}>
                <h3>Possible Solutions:</h3>
                <ul style={{ textAlign: 'left', lineHeight: '1.6' }}>
                  <li>Update your browser to the latest version</li>
                  <li>Enable hardware acceleration in browser settings</li>
                  <li>Update your graphics drivers</li>
                  <li>Try a different browser (Chrome, Firefox, Safari)</li>
                  <li>Check if WebGL is disabled in browser settings</li>
                </ul>
              </div>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '18px', marginBottom: '15px' }}>
                WebGL context creation failed unexpectedly
              </p>
              <div style={{ backgroundColor: '#333', padding: '15px', borderRadius: '8px', maxWidth: '600px' }}>
                <p><strong>WebGL Version:</strong> {webglInfo.version}</p>
                <p><strong>Vendor:</strong> {webglInfo.vendor}</p>
                <p><strong>Renderer:</strong> {webglInfo.renderer}</p>
              </div>
            </div>
          )}
          
          <button 
            onClick={() => window.location.reload()} 
            style={{
              marginTop: '20px',
              padding: '12px 24px',
              backgroundColor: '#007B83',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
          
          <p style={{ marginTop: '15px', fontSize: '14px', color: '#999' }}>
            If the problem persists, your device may not support WebGL or 3D graphics.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default WebGLErrorBoundary;