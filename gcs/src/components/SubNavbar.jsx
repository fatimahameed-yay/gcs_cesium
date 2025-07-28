import React from 'react';
import "./../styles/SubNavbar.css";
function SubNavbar({ section, uavType, onArmDisarm, onAngleChange, onPrerequisites, onModeChange, onClose, onDownload, onImport, setActiveTab }) {
  if (!section) return null;

  const getButtons = () => {
    switch(section) {
      case 'connect':
        return uavType ? (
          <>
            <button onClick={() => onArmDisarm(uavType)} className="subnav-btn" title="Arm/Disarm">
              <span className="subnav-icon"><i className="bi bi-gear"></i></span>
            </button>
            <div className="subnav-input-group">
              <input type="number" placeholder="Angle" onChange={(e) => onAngleChange(e.target.value)} className="subnav-input-field small" />
            </div>
            <button onClick={() => onPrerequisites()} className="subnav-btn btn-success" title="Check Systems">
              <span className="subnav-icon"><i className="bi bi-check"></i></span>
            </button>
          </>
        ) : null;
      case 'mission':
        return (
          <>
            <button onClick={onDownload} className="subnav-btn btn-primary" title="Download Waypoints">
              <span className="subnav-icon"><i className="bi bi-download"></i></span>
            </button>
            <label className="subnav-btn btn-primary" title="Import Waypoints">
              <span className="subnav-icon"><i className="bi bi-upload"></i></span>
              <input 
                type="file" 
                accept=".csv" 
                onChange={onImport}
                style={{ display: 'none' }}
              />
            </label>
          </>
        );
      case 'telemetry':
        return (
          <>
            <button onClick={() => setActiveTab('logs')} className="subnav-btn" title="Logs">
              <span className="subnav-icon"><i className="bi bi-journal-text"></i></span>
            </button>
            <button onClick={() => setActiveTab('vitals')} className="subnav-btn" title="Vitals">
              <span className="subnav-icon"><i className="bi bi-battery-half"></i></span>
            </button>
            <button onClick={() => setActiveTab('analytics')} className="subnav-btn" title="Analytics">
              <span className="subnav-icon"><i className="bi bi-bar-chart"></i></span>
            </button>
          </>
        );
      case 'controls':
        return (
          <>
            <button className="subnav-btn" title="Settings">
              <span className="subnav-icon"><i className="bi bi-gear"></i></span>
            </button>
            <button className="subnav-btn" title="Manual Control">
              <span className="subnav-icon"><i className="bi bi-joystick"></i></span>
            </button>
            <button className="subnav-btn btn-danger" title="Eject Payload">
              <span className="subnav-icon"><i className="bi bi-exclamation-octagon"></i></span>
            </button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`subnavbar ${section}-active`}>
      <div className="subnav-tray">
        <div className="subnav-content">
          {getButtons()}
        </div>
      </div>
      <button onClick={onClose} className="subnav-close-btn"><i className="bi bi-caret-up-fill"></i></button>
    </div>
  );
}

export default SubNavbar;