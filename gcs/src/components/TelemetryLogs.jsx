import React, { useState, useEffect } from 'react';
import { LineChart, XAxis, YAxis, Line, Tooltip, Legend } from 'recharts';
import "./../styles/TelemetryLogs.css";

function TelemetryLogs({ telemetry, logs, onClose, activeTab }) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [dataRange, setDataRange] = useState({ start: 0, end: logs.length - 1 });

  const graphData = logs.slice(dataRange.start, dataRange.end + 1).map(log => ({
    time: log.timestamp.split(' ')[1],
    altitude: log.data.altitude,
    speed: log.data.speed,
    battery: telemetry.battery - (log.id * 0.5),
    signal: telemetry.signalStrength - (log.id * 0.3)
  }));

  const handleZoomChange = (e) => {
    const zoom = parseFloat(e.target.value);
    setZoomLevel(zoom);
    const dataLength = logs.length;
    const visiblePoints = Math.floor(dataLength / zoom);
    const newEnd = Math.min(dataRange.start + visiblePoints, dataLength - 1);
    setDataRange({ start: dataRange.start, end: newEnd });
  };

  const CircularProgress = ({ value, max, label, unit, color }) => {
    const [animatedValue, setAnimatedValue] = useState(0);
    const percentage = (value / max) * 100;
    
    useEffect(() => {
      const interval = setInterval(() => {
        setAnimatedValue(prev => {
          const diff = value - prev;
          return prev + (diff * 0.1);
        });
      }, 30);
      return () => clearInterval(interval);
    }, [value]);

    return (
      <div className="telemetry-circular-progress">
        <svg viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" className="telemetry-progress-bg" />
          <circle 
            cx="50" 
            cy="50" 
            r="45" 
            className="telemetry-progress-fill"
            style={{ 
              strokeDasharray: `${(animatedValue / max) * 283} 283`,
              stroke: color
            }} 
          />
        </svg>
        <div className="telemetry-progress-text">
          <span className="telemetry-progress-value">{Math.round(animatedValue)}{unit}</span>
          <span className="telemetry-progress-label">{label}</span>
        </div>
      </div>
    );
  };

  const ProgressBar = ({ value, max, label, unit, color }) => {
    const percentage = (value / max) * 100;
    return (
      <div className="telemetry-progress-bar">
        <div className="telemetry-progress-bar-label">{label}: {Math.round(value)}{unit}</div>
        <div className="telemetry-progress-bar-container">
          <div 
            className="telemetry-progress-bar-fill" 
            style={{ 
              width: `${percentage}%`,
              background: color
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="telemetry-panel">
      <div className="telemetry-panel-header">
        <h3>Telemetry Suite</h3>
        <button onClick={onClose} className="telemetry-close-btn"><i className="bi bi-x"></i></button>
      </div>
      <div className="telemetry-panel-content">
        {activeTab === 'vitals' && (
          <div className="telemetry-vitals-section">
            <h4>System Vitals</h4>
            <div className="telemetry-vitals-grid">
              <div className="telemetry-vital-card">
                <ProgressBar 
                  value={telemetry.battery} 
                  max={100} 
                  label="Battery" 
                  unit="%" 
                  color={telemetry.battery < 20 ? '#ef4444' : '#22c55e'}
                />
                {telemetry.battery < 20 && (
                  <div className="telemetry-vital-warning pulse"><i className="bi bi-exclamation-triangle"></i> Low Battery</div>
                )}
              </div>
              
              <div className="telemetry-vital-card">
                <ProgressBar 
                  value={telemetry.signalStrength} 
                  max={100} 
                  label="Signal" 
                  unit="%" 
                  color={telemetry.signalStrength < 30 ? '#ef4444' : '#4682b4'}
                />
                <div className="telemetry-vital-stats">
                  <span>Latency: {Math.round(Math.random() * 50)}ms</span>
                  <span>Uptime: {Math.floor(Math.random() * 24)}h {Math.floor(Math.random() * 60)}m</span>
                </div>
              </div>
              
              <div className="telemetry-vital-card">
                <CircularProgress 
                  value={telemetry.health} 
                  max={100} 
                  label="Health" 
                  unit="%" 
                  color="#f59e0b"
                />
                <div className="telemetry-vital-stats">
                  <span>CPU: {Math.round(Math.random() * 30) + 10}%</span>
                  <span>Memory: {Math.round(Math.random() * 40) + 20}%</span>
                </div>
              </div>
              
              <div className="telemetry-vital-card telemetry-weather-card">
                <h5>Environmental Conditions</h5>
                <div className="telemetry-weather-display">
                  <div className="telemetry-weather-icon">
                    {telemetry.weather.temp > 20 ? <i className="bi bi-sun"></i> : 
                     telemetry.weather.temp < 10 ? <i className="bi bi-snow"></i> : 
                     <i className="bi bi-cloud"></i>}
                  </div>
                  <div className="telemetry-weather-stats">
                    <div className="telemetry-weather-stat">
                      <span>Temperature</span>
                      <span className="telemetry-weather-value">{telemetry.weather.temp}°C</span>
                    </div>
                    <div className="telemetry-weather-stat">
                      <span>Humidity</span>
                      <span className="telemetry-weather-value">{telemetry.weather.humidity}%</span>
                    </div>
                    <div className="telemetry-weather-stat">
                      <span>Wind Speed</span>
                      <span className="telemetry-weather-value">{telemetry.weather.windSpeed}m/s</span>
                    </div>
                    <div className="telemetry-weather-stat">
                      <span>Enemy Detection</span>
                      <span className={`telemetry-weather-value ${telemetry.enemyDetection ? 'alert' : ''}`}>
                        {telemetry.enemyDetection ? <><i className="bi bi-exclamation-triangle"></i> Active</> : 'None'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="telemetry-feed">
            <h4>Mission Log</h4>
            <table className="telemetry-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Time</th>
                  <th>Altitude</th>
                  <th>Speed</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} className={`telemetry-table-row ${log.data.status.toLowerCase()}`}>
                    <td>#{log.id}</td>
                    <td>{log.timestamp}</td>
                    <td>{log.data.altitude}m</td>
                    <td>{log.data.speed}m/s</td>
                    <td>{log.data.missionStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="telemetry-analytics-section">
            <h4>Flight Analytics</h4>
            <div className="telemetry-zoom-controls">
              <input 
                type="range" 
                min="1" 
                max="5" 
                step="0.1" 
                value={zoomLevel} 
                onChange={handleZoomChange}
                className="telemetry-zoom-slider"
              />
              <span className="telemetry-zoom-value">Zoom: {zoomLevel.toFixed(1)}x</span>
            </div>
            <div className="telemetry-graph-container">
              <LineChart 
                width={600} 
                height={400} 
                data={graphData}
                margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
              >
                <XAxis 
                  dataKey="time" 
                  stroke="#ffffff" 
                  tick={{ fill: '#ffffff', fontSize: 12 }}
                  domain={['auto', 'auto']}
                />
                <YAxis 
                  yAxisId="left" 
                  stroke="#ffffff" 
                  tick={{ fill: '#ffffff' }}
                  label={{ value: 'Altitude (m)', angle: -90, position: 'insideLeft', offset: -5, fill: '#ffffff' }}
                  domain={['auto', 'auto']}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  stroke="#ffffff" 
                  tick={{ fill: '#ffffff' }}
                  label={{ value: 'Speed (m/s)', angle: 90, position: 'insideRight', offset: -5, fill: '#ffffff' }}
                  domain={['auto', 'auto']}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(26, 35, 51, 0.95)', 
                    border: '1px solid #4682b4',
                    borderRadius: '4px',
                    color: '#ffffff'
                  }}
                  labelStyle={{ color: '#ffffff' }}
                />
                <Legend verticalAlign="top" height={36} iconSize={12} wrapperStyle={{ color: '#ffffff' }}/>
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="altitude" 
                  stroke="#4682b4" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                  animationDuration={500}
                  name="Altitude"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="speed" 
                  stroke="#2e8b57" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                  animationDuration={500}
                  name="Speed"
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="battery" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                  animationDuration={500}
                  name="Battery"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="signal" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                  animationDuration={500}
                  name="Signal"
                />
              </LineChart>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TelemetryLogs;