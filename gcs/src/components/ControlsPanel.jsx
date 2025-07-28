import React, { useState, useEffect, useRef } from 'react';
import { Joystick } from 'react-joystick-component';
import "./../styles/ControlsPanel.css";

function ControlsPanel({ uavType, onClose }) {
  const [joystick, setJoystick] = useState({ x: 0, y: 0 });
  const [controlMode, setControlMode] = useState('manual');
  const [throttle, setThrottle] = useState(50);
  const [yaw, setYaw] = useState(0);
  const [flaps, setFlaps] = useState(0);
  const [stealthMode, setStealthMode] = useState(false);
  const [rudder, setRudder] = useState(0);
  const [hardwareControl, setHardwareControl] = useState('software');
  const gamepadRef = useRef(null);

  useEffect(() => {
    console.log(`ControlsPanel rendered with uavType: ${uavType}`);
    
    const handleGamepadConnected = (e) => {
      console.log('Gamepad connected:', e.gamepad);
      gamepadRef.current = e.gamepad;
      setHardwareControl('hardware');
    };

    const handleGamepadDisconnected = () => {
      console.log('Gamepad disconnected');
      gamepadRef.current = null;
      setHardwareControl('software');
    };

    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);

    const pollGamepad = () => {
      if (gamepadRef.current && hardwareControl === 'hardware') {
        const gamepad = navigator.getGamepads()[gamepadRef.current.index];
        if (gamepad) {
          setJoystick({
            x: gamepad.axes[0] * 100,
            y: gamepad.axes[1] * 100,
          });
          setRudder(gamepad.axes[2] * 100);
          setThrottle((gamepad.axes[3] + 1) * 50);
        }
      }
    };

    const interval = setInterval(pollGamepad, 100);
    return () => {
      clearInterval(interval);
      window.removeEventListener('gamepadconnected', handleGamepadConnected);
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
    };
  }, [hardwareControl]);

  const handleMove = (data) => {
    if (hardwareControl !== 'hardware') {
      setJoystick({ x: data.x, y: data.y });
      console.log(`Joystick: X=${data.x.toFixed(2)}, Y=${data.y.toFixed(2)}`);
    }
  };

  const handleThrottleChange = (e) => {
    if (hardwareControl !== 'hardware') {
      setThrottle(e.target.value);
      console.log(`Throttle: ${e.target.value}%`);
    }
  };

  const handleYawChange = (e) => {
    if (hardwareControl !== 'hardware') {
      setYaw(e.target.value);
      console.log(`Yaw: ${e.target.value}°`);
    }
  };

  const handleFlapsChange = (e) => {
    if (hardwareControl !== 'hardware') {
      setFlaps(e.target.value);
      console.log(`Flaps: ${e.target.value}%`);
    }
  };

  const handleRudderChange = (e) => {
    if (hardwareControl !== 'hardware') {
      setRudder(e.target.value);
      console.log(`Rudder: ${e.target.value}°`);
    }
  };

  const handleDisarm = () => {
    alert('UAV Disarmed!');
    console.log('Disarm action triggered');
  };

  const handleHover = () => {
    alert('Hover Mode Activated!');
    console.log('Hover mode activated');
  };

  const handleCruise = () => {
    alert('Cruise Control Activated!');
    console.log('Cruise control activated');
  };

  const handlePayloadRelease = () => {
    alert('Payload Released!');
    console.log('Payload release triggered');
  };

  const handleStealthToggle = () => {
    setStealthMode(!stealthMode);
    alert(`Stealth Mode ${!stealthMode ? 'Activated' : 'Deactivated'}`);
    console.log(`Stealth mode: ${!stealthMode ? 'Activated' : 'Deactivated'}`);
  };

  const handleAutoTakeoff = () => {
    alert('Auto Takeoff Initiated!');
    console.log('Auto takeoff initiated');
  };

  const handleAutoLand = () => {
    alert('Auto Landing Initiated!');
    console.log('Auto landing initiated');
  };

  const renderControls = () => {
    if (!uavType || !['copter', 'plane', 'drone'].includes(uavType)) {
      console.warn(`Invalid or undefined uavType: ${uavType}`);
      return <p className="controls-holo-text">No UAV selected. Please connect to a UAV from the Connect panel.</p>;
    }

    try {
      switch (uavType) {
        case 'copter':
          return (
            <div className="controls-grid">
              <div className="controls-widget">
                <label>Pitch/Roll Control</label>
                <div className="controls-joystick-container">
                  <Joystick 
                    size={80} 
                    sticky={false} 
                    baseColor="#444" 
                    stickColor="#888" 
                    move={handleMove} 
                    stop={() => setJoystick({ x: 0, y: 0 })} 
                  />
                </div>
                <p className="controls-holo-text">X: {joystick.x.toFixed(2)} | Y: {joystick.y.toFixed(2)}</p>
              </div>
              <div className="controls-widget">
                <label>Throttle</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={throttle}
                  onChange={handleThrottleChange}
                  className="controls-slider"
                />
                <p className="controls-holo-text">{throttle}%</p>
              </div>
              <div className="controls-widget">
                <label>Yaw</label>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={yaw}
                  onChange={handleYawChange}
                  className="controls-slider"
                />
                <p className="controls-holo-text">{yaw}°</p>
              </div>
              <div className="controls-widget">
                <label>Rudder</label>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={rudder}
                  onChange={handleRudderChange}
                  className="controls-slider"
                />
                <p className="controls-holo-text">{rudder}°</p>
              </div>
              <div className="controls-widget">
                <label>Control Source</label>
                <select
                  value={hardwareControl}
                  onChange={(e) => setHardwareControl(e.target.value)}
                  className="controls-input-field"
                >
                  <option value="software">Software</option>
                  <option value="hardware">Hardware (Joystick/Rudder)</option>
                </select>
              </div>
              <div className="controls-widget controls-buttons">
                <button onClick={handleHover} className="btn btn-secondary controls-btn">
                  <i className="bi bi-pause-circle"></i>
                </button>
                <button onClick={handleAutoTakeoff} className="btn btn-primary controls-btn">
                  <i className="bi bi-rocket-takeoff"></i>
                </button>
                <button onClick={handleAutoLand} className="btn btn-primary controls-btn">
                  <i className="bi bi-arrow-down-circle"></i>
                </button>
              </div>
            </div>
          );
        case 'plane':
          return (
            <div className="controls-grid">
              <div className="controls-widget">
                <label>Aileron/Elevator</label>
                <div className="controls-joystick-container">
                  <Joystick 
                    size={80} 
                    sticky={false} 
                    baseColor="#444" 
                    stickColor="#888" 
                    move={handleMove} 
                    stop={() => setJoystick({ x: 0, y: 0 })} 
                  />
                </div>
                <p className="controls-holo-text">X: {joystick.x.toFixed(2)} | Y: {joystick.y.toFixed(2)}</p>
              </div>
              <div className="controls-widget">
                <label>Throttle</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={throttle}
                  onChange={handleThrottleChange}
                  className="controls-slider"
                />
                <p className="controls-holo-text">{throttle}%</p>
              </div>
              <div className="controls-widget">
                <label>Flaps</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={flaps}
                  onChange={handleFlapsChange}
                  className="controls-slider"
                />
                <p className="controls-holo-text">{flaps}%</p>
              </div>
              <div className="controls-widget">
                <label>Rudder</label>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={rudder}
                  onChange={handleRudderChange}
                  className="controls-slider"
                />
                <p className="controls-holo-text">{rudder}°</p>
              </div>
              <div className="controls-widget">
                <label>Control Source</label>
                <select
                  value={hardwareControl}
                  onChange={(e) => setHardwareControl(e.target.value)}
                  className="controls-input-field"
                >
                  <option value="software">Software</option>
                  <option value="hardware">Hardware (Joystick/Rudder)</option>
                </select>
              </div>
              <div className="controls-widget controls-buttons">
                <button onClick={handleCruise} className="btn btn-secondary controls-btn">
                  <i className="bi bi-airplane"></i>
                </button>
                <button onClick={handleAutoTakeoff} className="btn btn-primary controls-btn">
                  <i className="bi bi-rocket-takeoff"></i>
                </button>
                <button onClick={handleAutoLand} className="btn btn-primary controls-btn">
                  <i className="bi bi-arrow-down-circle"></i>
                </button>
              </div>
            </div>
          );
        case 'drone':
          return (
            <div className="controls-grid">
              <div className="controls-widget">
                <label>Navigation</label>
                <div className="controls-joystick-container">
                  <Joystick 
                    size={80} 
                    sticky={false} 
                    baseColor="#444" 
                    stickColor="#888" 
                    move={handleMove} 
                    stop={() => setJoystick({ x: 0, y: 0 })} 
                  />
                </div>
                <p className="controls-holo-text">X: {joystick.x.toFixed(2)} | Y: {joystick.y.toFixed(2)}</p>
              </div>
              <div className="controls-widget">
                <label>Speed</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={throttle}
                  onChange={handleThrottleChange}
                  className="controls-slider"
                />
                <p className="controls-holo-text">{throttle}%</p>
              </div>
              <div className="controls-widget">
                <label>Rudder</label>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={rudder}
                  onChange={handleRudderChange}
                  className="controls-slider"
                />
                <p className="controls-holo-text">{rudder}°</p>
              </div>
              <div className="controls-widget">
                <label>Stealth Mode</label>
                <label className="controls-toggle-switch">
                  <input
                    type="checkbox"
                    checked={stealthMode}
                    onChange={handleStealthToggle}
                  />
                  <span className="controls-slider"></span>
                </label>
                <p className="controls-holo-text">{stealthMode ? 'Active' : 'Inactive'}</p>
              </div>
              <div className="controls-widget">
                <label>Control Source</label>
                <select
                  value={hardwareControl}
                  onChange={(e) => setHardwareControl(e.target.value)}
                  className="controls-input-field"
                >
                  <option value="software">Software</option>
                  <option value="hardware">Hardware (Joystick/Rudder)</option>
                </select>
              </div>
              <div className="controls-widget controls-buttons">
                <button onClick={handlePayloadRelease} className="btn btn-danger controls-btn">
                  <i className="bi bi-exclamation-octagon"></i>
                </button>
                <button onClick={handleAutoTakeoff} className="btn btn-primary controls-btn">
                  <i className="bi bi-rocket-takeoff"></i>
                </button>
                <button onClick={handleAutoLand} className="btn btn-primary controls-btn">
                  <i className="bi bi-arrow-down-circle"></i>
                </button>
              </div>
            </div>
          );
        default:
          console.warn(`Unexpected uavType: ${uavType}`);
          return <p className="controls-holo-text">Unknown UAV type. Please select a valid UAV.</p>;
      }
    } catch (error) {
      console.error('Error rendering controls:', error);
      return <p className="controls-holo-text">Error rendering controls. Please try again.</p>;
    }
  };

  return (
    <div className="controls-panel">
      <div className="controls-panel-header">
        <h3>Command Center</h3>
        <button onClick={onClose} className="controls-close-btn"><i className="bi bi-x"></i></button>
      </div>
      <div className="controls-panel-content">
        <div className="controls-mode-selector">
          <label>Control Mode</label>
          <select
            value={controlMode}
            onChange={(e) => setControlMode(e.target.value)}
            className="controls-input-field"
          >
            <option value="manual">Manual</option>
            <option value="autonomous">Autonomous</option>
          </select>
        </div>
        {controlMode === 'manual' ? (
          <>
            {renderControls()}
            <div className="controls-widget controls-buttons">
              <button onClick={handleDisarm} className="btn btn-danger controls-btn">
                <i className="bi bi-power"></i>
              </button>
            </div>
          </>
        ) : (
          <p className="controls-holo-text">Autonomous mode active. Manual controls disabled.</p>
        )}
      </div>
    </div>
  );
}

export default ControlsPanel;