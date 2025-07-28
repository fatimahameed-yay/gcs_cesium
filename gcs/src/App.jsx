import React, { useState, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import ConnectPanel from './components/ConnectPanel';
import MissionPlanPanel from './components/MissionPlanPanel';
import ControlsPanel from './components/ControlsPanel';
import ChecklistPanel from './components/ChecklistPanel';
import SettingsPanel from './components/SettingsPanel';
import TelemetryLogs from './components/TelemetryLogs';
import MainNavbar from './components/MainNavbar';
import SubNavbar from './components/SubNavbar';
import MapView from './components/MapView';
import StatusBar from './components/StatusBar';

// Initialize Leaflet icons (fix for default icon issue)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Sample Data
const sampleWaypoints = [
  { id: 1, lat: 47.5585, lng: 7.5891, alt: 0, command: 'TAKEOFF', objective: 'Launch Base' },
  { id: 2, lat: 47.5586, lng: 7.5892, alt: 21.2, command: 'WAYPOINT', objective: 'Recon Point Alpha' },
  { id: 3, lat: 47.5587, lng: 7.5893, alt: 0.1, command: 'LANDING', objective: 'Extraction Zone' },
];

const sampleTelemetryData = [
  { altitude: 21.200, speed: 0.000, battery: 85.000, health: 95.000, signalStrength: 75.000, enemyDetection: false, lat: 47.558500, lng: 7.589100, weather: { temp: 15.000, humidity: 60.000, windSpeed: 5.000 } },
  { altitude: 21.312, speed: 0.042, battery: 84.900, health: 94.950, signalStrength: 74.800, enemyDetection: false, lat: 47.558503, lng: 7.589102, weather: { temp: 15.124, humidity: 59.873, windSpeed: 5.042 } },
  { altitude: 21.245, speed: 0.087, battery: 84.800, health: 94.900, signalStrength: 74.600, enemyDetection: false, lat: 47.558501, lng: 7.589105, weather: { temp: 15.213, humidity: 60.124, windSpeed: 4.987 } },
  { altitude: 21.378, speed: 0.124, battery: 84.700, health: 94.850, signalStrength: 74.400, enemyDetection: true, lat: 47.558506, lng: 7.589107, weather: { temp: 15.087, humidity: 59.956, windSpeed: 5.124 } },
  { altitude: 21.456, speed: 0.087, battery: 84.600, health: 94.800, signalStrength: 74.200, enemyDetection: false, lat: 47.558509, lng: 7.589110, weather: { temp: 15.312, humidity: 60.213, windSpeed: 5.213 } },
  { altitude: 21.389, speed: 0.042, battery: 84.500, health: 94.750, signalStrength: 74.000, enemyDetection: false, lat: 47.558512, lng: 7.589112, weather: { temp: 15.245, humidity: 60.087, windSpeed: 5.156 } },
  { altitude: 21.267, speed: 0.000, battery: 84.400, health: 94.700, signalStrength: 73.800, enemyDetection: false, lat: 47.558515, lng: 7.589115, weather: { temp: 15.178, humidity: 59.956, windSpeed: 5.042 } },
  { altitude: 21.178, speed: -0.042, battery: 84.300, health: 94.650, signalStrength: 73.600, enemyDetection: false, lat: 47.558518, lng: 7.589117, weather: { temp: 15.312, humidity: 60.124, windSpeed: 4.956 } },
  { altitude: 21.045, speed: -0.087, battery: 84.200, health: 94.600, signalStrength: 73.400, enemyDetection: false, lat: 47.558521, lng: 7.589120, weather: { temp: 15.245, humidity: 60.213, windSpeed: 5.087 } },
  { altitude: 20.956, speed: -0.124, battery: 84.100, health: 94.550, signalStrength: 73.200, enemyDetection: false, lat: 47.558524, lng: 7.589122, weather: { temp: 15.178, humidity: 60.087, windSpeed: 5.213 } },
  { altitude: 22.124, speed: 1.245, battery: 83.500, health: 94.250, signalStrength: 72.000, enemyDetection: false, lat: 47.558545, lng: 7.589145, weather: { temp: 15.456, humidity: 59.756, windSpeed: 5.345 } },
  { altitude: 23.456, speed: 2.124, battery: 82.900, health: 93.950, signalStrength: 70.800, enemyDetection: true, lat: 47.558567, lng: 7.589167, weather: { temp: 15.789, humidity: 60.124, windSpeed: 5.678 } },
  { altitude: 24.789, speed: 3.045, battery: 82.300, health: 93.650, signalStrength: 69.600, enemyDetection: false, lat: 47.558589, lng: 7.589189, weather: { temp: 16.124, humidity: 59.956, windSpeed: 5.912 } },
  { altitude: 25.124, speed: 3.456, battery: 19.900, health: 90.250, signalStrength: 45.600, enemyDetection: false, lat: 47.558612, lng: 7.589212, weather: { temp: 16.456, humidity: 60.345, windSpeed: 6.124 } },
  { altitude: 25.000, speed: 3.200, battery: 19.800, health: 90.200, signalStrength: 45.400, enemyDetection: false, lat: 47.558615, lng: 7.589215, weather: { temp: 16.389, humidity: 60.212, windSpeed: 6.045 } },
  { altitude: 20.456, speed: 2.100, battery: 19.500, health: 90.100, signalStrength: 45.200, enemyDetection: false, lat: 47.558618, lng: 7.589218, weather: { temp: 16.312, humidity: 60.124, windSpeed: 5.956 } },
  { altitude: 15.789, speed: 1.500, battery: 19.200, health: 90.000, signalStrength: 45.000, enemyDetection: false, lat: 47.558621, lng: 7.589221, weather: { temp: 16.245, humidity: 60.045, windSpeed: 5.845 } },
  { altitude: 5.124, speed: 0.750, battery: 18.900, health: 89.900, signalStrength: 44.800, enemyDetection: false, lat: 47.558624, lng: 7.589224, weather: { temp: 16.178, humidity: 59.956, windSpeed: 5.712 } },
  { altitude: 0.100, speed: 0.100, battery: 18.600, health: 89.800, signalStrength: 44.600, enemyDetection: false, lat: 47.558627, lng: 7.589227, weather: { temp: 16.124, humidity: 59.845, windSpeed: 5.624 } }
];

const sampleLogs = [
  { id: 1, timestamp: '2025-06-25 12:00 PM PKT', data: { altitude: 100, speed: 15, status: 'Normal', missionStatus: 'En Route' } },
  { id: 2, timestamp: '2025-06-25 12:01 PM PKT', data: { altitude: 120, speed: 16, status: 'Normal', missionStatus: 'Recon Initiated' } },
  { id: 3, timestamp: '2025-06-25 12:02 PM PKT', data: { altitude: 110, speed: 14, status: 'Warning', missionStatus: 'Alert: Low Battery' } },
];

function App() {
  const [uavType, setUavType] = useState('copter');
  const [waypoints, setWaypoints] = useState(sampleWaypoints);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [telemetry, setTelemetry] = useState(sampleTelemetryData[0]);
  const [logs, setLogs] = useState(sampleLogs);
  const [showChecklist, setShowChecklist] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [section, setSection] = useState(null);
  const [subnavOpen, setSubnavOpen] = useState(false);
  const [missionType, setMissionType] = useState('grid');
  const [mode, setMode] = useState('Cruise');
  const [theme, setTheme] = useState('dark');
  const [timelineValue, setTimelineValue] = useState(0);
  const [activeTab, setActiveTab] = useState('vitals');

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => {
        const newIndex = prevIndex + 1 >= sampleTelemetryData.length ? 0 : prevIndex + 1;
        setTelemetry(sampleTelemetryData[newIndex]);
        return newIndex;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleConnect = (type) => {
    setUavType(type);
    setSection('connect');
    setSubnavOpen(true);
    console.log(`Connected to ${type}`);
  };

  const handleEmergencyStop = () => {
    alert('Emergency Stop Activated!');
    console.log('Emergency stop triggered');
    setUavType(null);
    setSection(null);
    setSubnavOpen(false);
  };

  const handleSectionChange = (newSection) => {
    setSection(newSection);
    setSubnavOpen(!!newSection);
    setShowChecklist(false);
    setShowSettings(false);
  };

  const handleEditWaypoint = (id, updatedWaypoint) => {
    setWaypoints(prev =>
      prev.map(wp => (wp.id === id ? { ...wp, ...updatedWaypoint } : wp))
    );
  };

  const handleImportWaypoints = (importedWaypoints) => {
    setWaypoints(importedWaypoints);
  };

  const handleArmDisarm = (type) => {
    alert(`${type} ${mode === 'Armed' ? 'Disarmed' : 'Armed'}`);
    setMode(mode === 'Armed' ? 'Disarmed' : 'Armed');
    console.log(`${type} ${mode === 'Armed' ? 'disarmed' : 'armed'}`);
  };

  const handleAngleChange = (angle) => {
    console.log(`Angle set to: ${angle}°`);
  };

  const handlePrerequisites = () => {
    setShowChecklist(true);
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    console.log(`Mode changed to: ${newMode}`);
  };

  const handleSubnavClose = () => {
    setSubnavOpen(false);
    setSection(null);
  };

  const handleDownload = () => {
    let csvContent = "lat,lng,alt,command,objective\n";
    waypoints.forEach(wp => {
      csvContent += `${wp.lat},${wp.lng},${wp.alt},${wp.command},${wp.objective}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'waypoints.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csvData = event.target.result;
      const lines = csvData.split('\n');
      const headers = lines[0].split(',');
      const importedWaypoints = [];

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i]) continue;
        const currentLine = lines[i].split(',');
        if (currentLine.length === headers.length) {
          importedWaypoints.push({
            id: i,
            lat: parseFloat(currentLine[0]),
            lng: parseFloat(currentLine[1]),
            alt: parseFloat(currentLine[2]),
            command: currentLine[3],
            objective: currentLine[4]
          });
        }
      }

      if (importedWaypoints.length > 0) {
        setWaypoints(importedWaypoints);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className={`app ${theme}`}>
      <MainNavbar
        onSectionChange={handleSectionChange}
        uavType={uavType}
        setUavType={setUavType}
        missionType={missionType}
        setMissionType={setMissionType}
        onEmergencyStop={handleEmergencyStop}
        theme={theme}
        setTheme={setTheme}
      />
      <div className="main-content">
        <MapView
          waypoints={waypoints}
          telemetry={telemetry}
          timelineValue={timelineValue}
          setTimelineValue={setTimelineValue}
        />
        <StatusBar telemetry={telemetry} />
        {section === 'connect' && (
          <ConnectPanel
            onConnect={handleConnect}
            onClose={handleSubnavClose}
            show={section === 'connect'}
          />
        )}
        {section === 'mission' && (
          <MissionPlanPanel
            waypoints={waypoints}
            logs={logs}
            onClose={handleSubnavClose}
            onEditWaypoint={handleEditWaypoint}
            onImportWaypoints={handleImportWaypoints}
          />
        )}
        {section === 'controls' && (
          <ControlsPanel
            uavType={uavType}
            onClose={handleSubnavClose}
          />
        )}
        {section === 'telemetry' && (
          <TelemetryLogs
            telemetry={telemetry}
            logs={logs}
            onClose={handleSubnavClose}
            activeTab={activeTab}
          />
        )}
        <SubNavbar
          section={section}
          uavType={uavType}
          onArmDisarm={handleArmDisarm}
          onAngleChange={handleAngleChange}
          onPrerequisites={handlePrerequisites}
          onModeChange={handleModeChange}
          onClose={handleSubnavClose}
          onDownload={handleDownload}
          onImport={handleImport}
          setActiveTab={setActiveTab}
        />
      </div>
    </div>
  );
}

export default App;