import React, { useState } from 'react';
import SettingsPanel from './SettingsPanel';
import ChecklistPanel from './ChecklistPanel';
import "./../styles/MainNavbar.css";

function MainNavbar({ onSectionChange, uavType, setUavType, missionType, setMissionType, onEmergencyStop, theme, setTheme }) {
  const [activeSection, setActiveSection] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);

  const handleSectionChange = (section) => {
    setActiveSection(prev => (prev === section ? null : section));
    onSectionChange(section === activeSection ? null : section);
    if (section === 'controls' && !uavType) {
      console.log('Setting default uavType to copter');
      setUavType('copter');
    }
  };

  const handleShowChecklist = () => {
    setShowChecklist(true);
    setShowSettings(false);
  };

  const handleShowSettings = () => {
    setShowSettings(true);
    setShowChecklist(false);
  };

  return (
    <div className="main-navbar">
      <div className="main-nav-buttons">
        <button onClick={() => handleSectionChange('connect')} className={`main-navbar-btn ${activeSection === 'connect' ? 'active' : ''}`}>
          <span className="main-btn-icon"><i className="bi bi-link-45deg"></i></span>
          <span className="main-btn-text">Connect</span>
        </button>
        <button onClick={() => handleSectionChange('mission')} className={`main-navbar-btn ${activeSection === 'mission' ? 'active' : ''}`}>
          <span className="main-btn-icon"><i className="bi bi-geo-alt"></i></span>
          <span className="main-btn-text">Mission</span>
        </button>
        <button onClick={() => handleSectionChange('telemetry')} className={`main-navbar-btn ${activeSection === 'telemetry' ? 'active' : ''}`}>
          <span className="main-btn-icon"><i className="bi bi-bar-chart"></i></span>
          <span className="main-btn-text">Telemetry</span>
        </button>
        <button onClick={() => handleSectionChange('controls')} className={`main-navbar-btn ${activeSection === 'controls' ? 'active' : ''}`}>
          <span className="main-btn-icon"><i className="bi bi-joystick"></i></span>
          <span className="main-btn-text">Controls</span>
        </button>
        <button onClick={handleShowChecklist} className={`main-navbar-btn ${showChecklist ? 'active' : ''}`}>
          <span className="main-btn-icon"><i className="bi bi-check2-square"></i></span>
          <span className="main-btn-text">Checklist</span>
        </button>
        <button onClick={() => { onEmergencyStop(); setActiveSection(null); onSectionChange(null); }} className="main-navbar-btn btn-danger">
          <span className="main-btn-icon"><i className="bi bi-exclamation-octagon"></i></span>
          <span className="main-btn-text">Emergency</span>
        </button>
      </div>
      <div className="main-nav-options">
        <select value={missionType} onChange={(e) => setMissionType(e.target.value)} className="main-input-field">
          <option value="grid">Grid Pattern</option>
          <option value="circle">Circle Sweep</option>
          <option value="strike">Target Strike</option>
        </select>
        <select value={uavType || 'copter'} onChange={(e) => setUavType(e.target.value)} className="main-input-field">
          <option value="copter">Copter</option>
          <option value="plane">Plane</option>
          <option value="drone">Stealth Drone</option>
        </select>
        <button onClick={handleShowSettings} className={`main-navbar-btn ${showSettings ? 'active' : ''}`}>
          <span className="main-btn-icon"><i className="bi bi-gear"></i></span>
          <span className="main-btn-text">Settings</span>
        </button>
      </div>
      {showSettings && (
        <SettingsPanel 
          theme={theme} 
          setTheme={setTheme} 
          onClose={() => setShowSettings(false)} 
        />
      )}
      {showChecklist && (
        <ChecklistPanel 
          telemetry={{
            battery: 85,
            weather: { temp: 15, humidity: 60, windSpeed: 5 }
          }}
          onClose={() => setShowChecklist(false)}
          onProceed={() => {
            alert('All checks passed! Proceeding to mission...');
            setShowChecklist(false);
          }}
        />
      )}
    </div>
  );
}

export default MainNavbar;