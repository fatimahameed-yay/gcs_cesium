import React from 'react';
import "./../styles/StatusBar.css";

function StatusBar({ telemetry }) {
  return (
    <div className="status-bar">
      <div className="status-item">
        <span className="status-icon"><i className="bi bi-shield-check"></i></span>
        <span className="status-label">STATUS:</span>
        <span className={`status-value ${telemetry.battery < 20 ? 'critical' : 'operational'}`}>
          {telemetry.battery < 20 ? 'CRITICAL' : 'OPERATIONAL'}
        </span>
      </div>
      <div className="status-item">
        <span className="status-icon"><i className="bi bi-geo-alt"></i></span>
        <span className="status-label">POS:</span>
        <span className="status-value">{telemetry.lat.toFixed(6)}, {telemetry.lng.toFixed(6)}</span>
      </div>
      <div className="status-item">
        <span className="status-icon"><i className="bi bi-clock"></i></span>
        <span className="status-label">TIME:</span>
        <span className="status-value">{new Date().toLocaleTimeString('en-US', { hour12: true, timeZone: 'Asia/Karachi' })}</span>
      </div>
    </div>
  );
}

export default StatusBar;