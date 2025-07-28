import React, { useState } from 'react';
import "./../styles/SettingsPanel.css";

function SettingsPanel({ theme, setTheme, onClose }) {
  const [settings, setSettings] = useState({
    autoConnect: false,
    realTimeAlerts: true,
    highPrecisionMode: false,
    theme: theme,
    units: 'metric',
    mapStyle: 'standard',
    coordinateSystem: 'latlng',
    dataRefreshRate: '1',
    mapOverlay: 'none',
    flightSpeed: 50
  });
  const [expandedSection, setExpandedSection] = useState(null);

  const handleToggleChange = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSelectChange = (e, key) => {
    const value = e.target.value;
    if (key === 'theme') {
      setTheme(value);
    }
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSliderChange = (e, key) => {
    setSettings(prev => ({
      ...prev,
      [key]: e.target.value
    }));
  };

  const toggleSection = (section) => {
    setExpandedSection(prev => (prev === section ? null : section));
  };

  return (
    <div className="settings-panel">
      <div className="settings-panel-header">
        <h3>Settings</h3>
        <button onClick={onClose} className="settings-close-btn"><i className="bi bi-x"></i></button>
      </div>
      <div className="settings-panel-content">
        <div className="settings-section">
          <h4 onClick={() => toggleSection('connection')} className="settings-section-header">
            <i className={`bi bi-caret-${expandedSection === 'connection' ? 'down' : 'right'}-fill`}></i> Connection
          </h4>
          {expandedSection === 'connection' && (
            <div className="settings-grid">
              <div className="settings-widget">
                <label>Auto-Connect to UAV</label>
                <label className="settings-toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.autoConnect}
                    onChange={() => handleToggleChange('autoConnect')}
                  />
                  <span className="settings-slider"></span>
                </label>
              </div>
              <div className="settings-widget">
                <label>Real-Time Alerts</label>
                <label className="settings-toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.realTimeAlerts}
                    onChange={() => handleToggleChange('realTimeAlerts')}
                  />
                  <span className="settings-slider"></span>
                </label>
              </div>
            </div>
          )}
        </div>
        <div className="settings-section">
          <h4 onClick={() => toggleSection('display')} className="settings-section-header">
            <i className={`bi bi-caret-${expandedSection === 'display' ? 'down' : 'right'}-fill`}></i> Display
          </h4>
          {expandedSection === 'display' && (
            <div className="settings-grid">
              <div className="settings-widget">
                <label>Theme</label>
                <select
                  value={settings.theme}
                  onChange={(e) => handleSelectChange(e, 'theme')}
                  className="settings-input-field"
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </div>
              <div className="settings-widget">
                <label>Map Style</label>
                <select
                  value={settings.mapStyle}
                  onChange={(e) => handleSelectChange(e, 'mapStyle')}
                  className="settings-input-field"
                >
                  <option value="standard">Standard</option>
                  <option value="satellite">Satellite</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
              <div className="settings-widget">
                <label>Map Overlay</label>
                <select
                  value={settings.mapOverlay}
                  onChange={(e) => handleSelectChange(e, 'mapOverlay')}
                  className="settings-input-field"
                >
                  <option value="none">None</option>
                  <option value="weather">Weather</option>
                  <option value="terrain">Terrain</option>
                  <option value="airspace">Airspace</option>
                </select>
              </div>
            </div>
          )}
        </div>
        <div className="settings-section">
          <h4 onClick={() => toggleSection('flight')} className="settings-section-header">
            <i className={`bi bi-caret-${expandedSection === 'flight' ? 'down' : 'right'}-fill`}></i> Flight
          </h4>
          {expandedSection === 'flight' && (
            <div className="settings-grid">
              <div className="settings-widget">
                <label>High-Precision Mode</label>
                <label className="settings-toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.highPrecisionMode}
                    onChange={() => handleToggleChange('highPrecisionMode')}
                  />
                  <span className="settings-slider"></span>
                </label>
              </div>
              <div className="settings-widget">
                <label>Units</label>
                <select
                  value={settings.units}
                  onChange={(e) => handleSelectChange(e, 'units')}
                  className="settings-input-field"
                >
                  <option value="metric">Metric</option>
                  <option value="imperial">Imperial</option>
                </select>
              </div>
              <div className="settings-widget">
                <label>Coordinate System</label>
                <select
                  value={settings.coordinateSystem}
                  onChange={(e) => handleSelectChange(e, 'coordinateSystem')}
                  className="settings-input-field"
                >
                  <option value="latlng">Latitude/Longitude</option>
                  <option value="utm">UTM</option>
                  <option value="mgrs">MGRS</option>
                </select>
              </div>
              <div className="settings-widget">
                <label>Data Refresh Rate (Hz)</label>
                <select
                  value={settings.dataRefreshRate}
                  onChange={(e) => handleSelectChange(e, 'dataRefreshRate')}
                  className="settings-input-field"
                >
                  <option value="1">1 Hz</option>
                  <option value="2">2 Hz</option>
                  <option value="5">5 Hz</option>
                  <option value="10">10 Hz</option>
                </select>
              </div>
              <div className="settings-widget">
                <label>Flight Speed (%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.flightSpeed}
                  onChange={(e) => handleSliderChange(e, 'flightSpeed')}
                  className="settings-control-slider"
                />
                <p className="settings-holo-text">{settings.flightSpeed}%</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SettingsPanel;