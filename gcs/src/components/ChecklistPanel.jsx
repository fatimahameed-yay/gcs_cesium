import React, { useState } from 'react';
import "./../styles/ChecklistPanel.css";

function ChecklistPanel({ onClose, onProceed, telemetry }) {
  const [checks, setChecks] = useState({
    battery: false,
    weather: false,
    uav: false,
    connection: false
  });

  const allChecked = Object.values(checks).every(check => check);

  const handleCheck = (key) => {
    setChecks(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="checklist-panel">
      <div className="checklist-panel-header">
        <h3>Pre-Flight Checklist</h3>
        <button onClick={onClose} className="checklist-close-btn"><i className="bi bi-x"></i></button>
      </div>
      <div className="checklist-panel-content">
        <div className="checklist-items">
          <div className="checklist-item">
            <input 
              type="checkbox" 
              checked={checks.battery} 
              onChange={() => handleCheck('battery')} 
            />
            <span>Battery Sufficient ({telemetry.battery}%)</span>
          </div>
          <div className="checklist-item">
            <input 
              type="checkbox" 
              checked={checks.weather} 
              onChange={() => handleCheck('weather')} 
            />
            <span>Weather Conditions Optimal</span>
          </div>
          <div className="checklist-item">
            <input 
              type="checkbox" 
              checked={checks.uav} 
              onChange={() => handleCheck('uav')} 
            />
            <span>UAV Systems Functional</span>
          </div>
          <div className="checklist-item">
            <input 
              type="checkbox" 
              checked={checks.connection} 
              onChange={() => handleCheck('connection')} 
            />
            <span>Connection Stable</span>
          </div>
        </div>
        <button 
          onClick={onProceed} 
          className="btn btn-primary checklist-proceed-btn"
          disabled={!allChecked}
        >
          <span className="checklist-btn-icon"><i className="bi bi-rocket-takeoff"></i></span>
          <span className="checklist-btn-text">Proceed to Mission</span>
        </button>
      </div>
    </div>
  );
}

export default ChecklistPanel;