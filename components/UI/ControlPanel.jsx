/**
 * Control Panel - Sprint 8 UI/UX Enhancement
 *
 * Provides user-accessible controls for:
 * - Post-processing effects toggle (Bloom, SSAO, DOF)
 * - Toon shading toggle
 * - Zoom level control (FOV 40-90)
 * - Neon signs toggle
 * - Animation speed control
 * - Help overlay
 *
 * @module components/UI/ControlPanel
 */

import { useState, useEffect } from 'react';

export default function ControlPanel({
  onPostProcessingToggle,
  onToonShadingToggle,
  onZoomChange,
  onNeonToggle,
  onAnimationSpeedChange,
  initialState = {}
}) {
  // Control panel state
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('effects'); // 'effects', 'camera', 'help'

  // Feature states with defaults
  const [postProcessingEnabled, setPostProcessingEnabled] = useState(
    initialState.postProcessingEnabled ?? true
  );
  const [toonShadingEnabled, setToonShadingEnabled] = useState(
    initialState.toonShadingEnabled ?? false
  );
  const [zoomLevel, setZoomLevel] = useState(
    initialState.zoomLevel ?? 60
  ); // FOV 60 default - natural human eye field of view
  const [neonEnabled, setNeonEnabled] = useState(
    initialState.neonEnabled ?? true
  );
  const [animationSpeed, setAnimationSpeed] = useState(
    initialState.animationSpeed ?? 1.0
  );

  // Show/hide with keyboard shortcut (H key)
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'h' || e.key === 'H') {
        setIsOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Handle post-processing toggle
  const handlePostProcessingToggle = () => {
    const newValue = !postProcessingEnabled;
    setPostProcessingEnabled(newValue);
    if (onPostProcessingToggle) onPostProcessingToggle(newValue);
  };

  // Handle toon shading toggle
  const handleToonShadingToggle = () => {
    const newValue = !toonShadingEnabled;
    setToonShadingEnabled(newValue);
    if (onToonShadingToggle) onToonShadingToggle(newValue);
  };

  // Handle zoom change
  const handleZoomChange = (e) => {
    const newZoom = parseInt(e.target.value, 10);
    setZoomLevel(newZoom);
    if (onZoomChange) onZoomChange(newZoom);
  };

  // Handle neon toggle
  const handleNeonToggle = () => {
    const newValue = !neonEnabled;
    setNeonEnabled(newValue);
    if (onNeonToggle) onNeonToggle(newValue);
  };

  // Handle animation speed change
  const handleAnimationSpeedChange = (e) => {
    const newSpeed = parseFloat(e.target.value);
    setAnimationSpeed(newSpeed);
    if (onAnimationSpeedChange) onAnimationSpeedChange(newSpeed);
  };

  return (
    <>
      {/* Toggle button */}
      <button
        className="control-panel-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle control panel"
        data-testid="control-panel-toggle"
      >
        {isOpen ? '✕' : '⚙️'}
      </button>

      {/* Control panel */}
      {isOpen && (
        <div className="control-panel" data-testid="control-panel">
          {/* Header */}
          <div className="control-panel-header">
            <h3>Visual Controls</h3>
            <p className="hint">Press <kbd>H</kbd> to toggle</p>
          </div>

          {/* Tabs */}
          <div className="control-panel-tabs">
            <button
              className={`tab ${activeTab === 'effects' ? 'active' : ''}`}
              onClick={() => setActiveTab('effects')}
              data-testid="tab-effects"
            >
              Effects
            </button>
            <button
              className={`tab ${activeTab === 'camera' ? 'active' : ''}`}
              onClick={() => setActiveTab('camera')}
              data-testid="tab-camera"
            >
              Camera
            </button>
            <button
              className={`tab ${activeTab === 'help' ? 'active' : ''}`}
              onClick={() => setActiveTab('help')}
              data-testid="tab-help"
            >
              Help
            </button>
          </div>

          {/* Content */}
          <div className="control-panel-content">
            {/* Effects Tab */}
            {activeTab === 'effects' && (
              <div className="tab-content" data-testid="content-effects">
                {/* Post-processing toggle */}
                <div className="control-item">
                  <label htmlFor="post-processing">
                    <span className="control-label">Post-Processing</span>
                    <span className="control-description">
                      Bloom, SSAO, and Depth of Field effects
                    </span>
                  </label>
                  <input
                    id="post-processing"
                    type="checkbox"
                    checked={postProcessingEnabled}
                    onChange={handlePostProcessingToggle}
                    data-testid="post-processing-toggle"
                  />
                </div>

                {/* Toon shading toggle */}
                <div className="control-item">
                  <label htmlFor="toon-shading">
                    <span className="control-label">Toon Shading</span>
                    <span className="control-description">
                      Stylized cel-shaded rendering
                    </span>
                  </label>
                  <input
                    id="toon-shading"
                    type="checkbox"
                    checked={toonShadingEnabled}
                    onChange={handleToonShadingToggle}
                    data-testid="toon-shading-toggle"
                  />
                </div>

                {/* Neon signs toggle */}
                <div className="control-item">
                  <label htmlFor="neon-signs">
                    <span className="control-label">Neon Signs</span>
                    <span className="control-description">
                      Glowing neon sign effects
                    </span>
                  </label>
                  <input
                    id="neon-signs"
                    type="checkbox"
                    checked={neonEnabled}
                    onChange={handleNeonToggle}
                    data-testid="neon-toggle"
                  />
                </div>

                {/* Animation speed slider */}
                <div className="control-item">
                  <label htmlFor="animation-speed">
                    <span className="control-label">
                      Animation Speed: {animationSpeed.toFixed(1)}x
                    </span>
                    <span className="control-description">
                      Perfume bottle rotation speed
                    </span>
                  </label>
                  <input
                    id="animation-speed"
                    type="range"
                    min="0"
                    max="3"
                    step="0.1"
                    value={animationSpeed}
                    onChange={handleAnimationSpeedChange}
                    data-testid="animation-speed-slider"
                  />
                  <div className="slider-labels">
                    <span>Slow</span>
                    <span>Fast</span>
                  </div>
                </div>
              </div>
            )}

            {/* Camera Tab */}
            {activeTab === 'camera' && (
              <div className="tab-content" data-testid="content-camera">
                {/* Zoom/FOV slider */}
                <div className="control-item">
                  <label htmlFor="zoom-level">
                    <span className="control-label">
                      Field of View: {zoomLevel}°
                    </span>
                    <span className="control-description">
                      Lower = Zoomed in, Higher = Wide angle
                    </span>
                  </label>
                  <input
                    id="zoom-level"
                    type="range"
                    min="40"
                    max="90"
                    step="1"
                    value={zoomLevel}
                    onChange={handleZoomChange}
                    data-testid="zoom-slider"
                  />
                  <div className="slider-labels">
                    <span>Narrow (40°)</span>
                    <span>Wide (90°)</span>
                  </div>
                </div>

                {/* Quick presets */}
                <div className="control-item">
                  <span className="control-label">Quick Presets</span>
                  <div className="preset-buttons">
                    <button
                      onClick={() => {
                        setZoomLevel(50);
                        if (onZoomChange) onZoomChange(50);
                      }}
                      data-testid="preset-narrow"
                    >
                      Narrow (50°)
                    </button>
                    <button
                      onClick={() => {
                        setZoomLevel(60);
                        if (onZoomChange) onZoomChange(60);
                      }}
                      data-testid="preset-normal"
                    >
                      Normal (60°)
                    </button>
                    <button
                      onClick={() => {
                        setZoomLevel(90);
                        if (onZoomChange) onZoomChange(90);
                      }}
                      data-testid="preset-wide"
                    >
                      Wide (90°)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Help Tab */}
            {activeTab === 'help' && (
              <div className="tab-content help-content" data-testid="content-help">
                <h4>Keyboard Controls</h4>
                <div className="help-item">
                  <kbd>W A S D</kbd>
                  <span>Move around</span>
                </div>
                <div className="help-item">
                  <kbd>Mouse</kbd>
                  <span>Look around (click canvas first)</span>
                </div>
                <div className="help-item">
                  <kbd>H</kbd>
                  <span>Toggle this control panel</span>
                </div>
                <div className="help-item">
                  <kbd>ESC</kbd>
                  <span>Exit pointer lock</span>
                </div>
                <div className="help-item">
                  <kbd>C</kbd>
                  <span>Open nearest door</span>
                </div>

                <h4>Sprint 8 Features</h4>
                <ul>
                  <li>✨ Post-processing effects (Bloom, SSAO, DOF)</li>
                  <li>🎨 Toon shading for stylized look</li>
                  <li>🔍 Adjustable FOV for zoom</li>
                  <li>💎 Animated perfume bottles</li>
                  <li>🌟 Glowing neon signs</li>
                  <li>📱 Loading screen</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
