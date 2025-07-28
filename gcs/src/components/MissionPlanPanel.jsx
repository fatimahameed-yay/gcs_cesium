import React, { useState } from 'react';
import "./../styles/MissionPlanPanel.css";

function MissionPlanPanel({ waypoints, logs, onClose, onEditWaypoint, onImportWaypoints }) {
  const [editingId, setEditingId] = useState(null);
  const [editWaypoint, setEditWaypoint] = useState(null);

  const handleEdit = (wp) => {
    setEditingId(wp.id);
    setEditWaypoint({ ...wp });
  };

  const handleSave = () => {
    onEditWaypoint(editingId, editWaypoint);
    setEditingId(null);
    setEditWaypoint(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditWaypoint(null);
  };

  const handleChange = (e, field) => {
    setEditWaypoint({ ...editWaypoint, [field]: e.target.value });
  };

  const handleFileUpload = (e) => {
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
        onImportWaypoints(importedWaypoints);
      }
    };
    reader.readAsText(file);
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

  return (
    <div className="mission-plan-panel">
      <div className="mission-plan-header">
        <h3>Mission Control</h3>
        <button onClick={onClose} className="mission-plan-close-btn">
          <i className="bi bi-x"></i>
        </button>
      </div>
      <div className="mission-plan-content">
        <div className="mission-plan-objective-tracker">
          <h4>Objective Tracker</h4>
          <div className="mission-plan-actions">
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleFileUpload} 
              id="waypoint-upload" 
              style={{ display: 'none' }}
            />
            <label htmlFor="waypoint-upload" className="btn btn-primary">
              <i className="bi bi-upload"></i> Import
            </label>
            <button onClick={handleDownload} className="btn btn-secondary">
              <i className="bi bi-download"></i> Export
            </button>
          </div>
          <table className="mission-plan-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Latitude</th>
                <th>Longitude</th>
                <th>Altitude</th>
                <th>Objective</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {waypoints.map(wp => (
                <tr key={wp.id} className="mission-plan-table-row">
                  {editingId === wp.id ? (
                    <>
                      <td>#{wp.id}</td>
                      <td>
                        <input 
                          type="number" 
                          value={editWaypoint.lat} 
                          onChange={(e) => handleChange(e, 'lat')} 
                          className="mission-plan-inline-edit"
                        />
                      </td>
                      <td>
                        <input 
                          type="number" 
                          value={editWaypoint.lng} 
                          onChange={(e) => handleChange(e, 'lng')} 
                          className="mission-plan-inline-edit"
                        />
                      </td>
                      <td>
                        <input 
                          type="number" 
                          value={editWaypoint.alt} 
                          onChange={(e) => handleChange(e, 'alt')} 
                          className="mission-plan-inline-edit"
                        />
                      </td>
                      <td>
                        <input 
                          type="text" 
                          value={editWaypoint.objective} 
                          onChange={(e) => handleChange(e, 'objective')} 
                          className="mission-plan-inline-edit"
                        />
                      </td>
                      <td className="mission-plan-edit-buttons">
                        <button onClick={handleSave} className="btn btn-success">
                          <i className="bi bi-check"></i>
                        </button>
                        <button onClick={handleCancel} className="btn btn-danger">
                          <i className="bi bi-x"></i>
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>#{wp.id}</td>
                      <td>{wp.lat.toFixed(6)}</td>
                      <td>{wp.lng.toFixed(6)}</td>
                      <td>{wp.alt.toFixed(1)}m</td>
                      <td>
                        <span className={`mission-plan-waypoint-${wp.command.toLowerCase()}`}>
                          {wp.objective}
                        </span>
                      </td>
                      <td>
                        <button onClick={() => handleEdit(wp)} className="btn btn-secondary">
                          <i className="bi bi-pencil"></i> Edit
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mission-plan-feed">
          <h4>Mission Feed</h4>
          <table className="mission-plan-table">
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
                <tr key={log.id} className={`mission-plan-table-row ${log.data.status.toLowerCase()}`}>
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
      </div>
    </div>
  );
}

export default MissionPlanPanel;