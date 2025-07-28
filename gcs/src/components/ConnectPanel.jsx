import React, { useState } from 'react';
import "./../styles/ConnectPanel.css";

function ConnectPanel({ onConnect, onClose, show }) {
  const [mode, setMode] = useState('auto');
  const [connection, setConnection] = useState(null);
  const [manualConfig, setManualConfig] = useState({
    ip: '',
    port: '',
    protocol: 'udp',
    comm: 'serial',
  });

  const handleConnect = () => {
    if (mode === 'auto') {
      const uavType = Math.random() > 0.5 ? 'copter' : 'plane';
      setConnection(uavType);
      onConnect(uavType);
    } else {
      if (manualConfig.ip && manualConfig.port) {
        setConnection(`manual:${manualConfig.ip}:${manualConfig.port}`);
        onConnect('manual');
      } else {
        alert('Please fill in all required fields');
      }
    }
  };

  const handleInputChange = (e) => {
    setManualConfig({ ...manualConfig, [e.target.name]: e.target.value });
  };

  if (!show) return null;

  return (
    <div className="connect-panel">
      <div className="connect-panel-header">
        <h3>UAV CONNECTION TERMINAL</h3>
        <button onClick={onClose} className="connect-close-btn"><i className="bi bi-x"></i></button>
      </div>
      <div className="connect-panel-content">
        {!connection ? (
          <>
            <div className="connect-mode-selector">
              <div 
                className={`connect-mode-option ${mode === 'auto' ? 'active' : ''}`}
                onClick={() => setMode('auto')}
              >
                <div className="connect-mode-icon"><i className="bi bi-search"></i></div>
                <div className="connect-mode-text">Auto Scan</div>
              </div>
              <div 
                className={`connect-mode-option ${mode === 'manual' ? 'active' : ''}`}
                onClick={() => setMode('manual')}
              >
                <div className="connect-mode-icon"><i className="bi bi-gear"></i></div>
                <div className="connect-mode-text">Manual Config</div>
              </div>
            </div>
            
            {mode === 'manual' && (
              <div className="connect-manual-config">
                <h4 className="connect-config-title">MANUAL CONNECTION PARAMETERS</h4>
                <div className="connect-config-grid">
                  <div className="connect-input-group">
                    <label>IP Address</label>
                    <input 
                      type="text" 
                      name="ip" 
                      value={manualConfig.ip} 
                      onChange={handleInputChange} 
                      placeholder="192.168.1.100" 
                      className="connect-input-field" 
                    />
                  </div>
                  <div className="connect-input-group">
                    <label>Port</label>
                    <input 
                      type="number" 
                      name="port" 
                      value={manualConfig.port} 
                      onChange={handleInputChange} 
                      placeholder="14550" 
                      className="connect-input-field" 
                    />
                  </div>
                  <div className="connect-input-group">
                    <label>Protocol</label>
                    <select 
                      name="protocol" 
                      value={manualConfig.protocol} 
                      onChange={handleInputChange} 
                      className="connect-select-field"
                    >
                      <option value="udp">UDP</option>
                      <option value="tcp">TCP</option>
                    </select>
                  </div>
                  <div className="connect-input-group">
                    <label>Comm Type</label>
                    <select 
                      name="comm" 
                      value={manualConfig.comm} 
                      onChange={handleInputChange} 
                      className="connect-select-field"
                    >
                      <option value="serial">Serial</option>
                      <option value="radio">Radio</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            
            <div className="connect-actions">
              <button onClick={handleConnect} className="btn btn-primary connect-btn">
                <span className="connect-btn-icon"><i className="bi bi-link-45deg"></i></span>
                <span className="connect-btn-text">ESTABLISH LINK</span>
              </button>
            </div>
          </>
        ) : (
          <div className="connect-status">
            <div className="connect-status-icon"><i className="bi bi-check-circle-fill"></i></div>
            <p className="connect-holo-text">CONNECTED TO: <span className="connect-type">{connection.toUpperCase()}</span></p>
            <div className="connect-signal-pulse"></div>
            <button onClick={() => setConnection(null)} className="btn btn-danger connect-disconnect-btn">
              <span className="connect-btn-icon"><i className="bi bi-exclamation-triangle"></i></span>
              <span className="connect-btn-text">TERMINATE LINK</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ConnectPanel;