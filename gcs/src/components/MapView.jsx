import React, { useEffect, useRef, useState } from 'react';
import '../styles/MapView.css';
import MainNavbar from './MainNavbar';
import ConnectPanel from './ConnectPanel';
import MissionPlanPanel from './MissionPlanPanel';
import TelemetryLogs from './TelemetryLogs';
import SubNavbar from './SubNavbar';
import ControlsPanel from './ControlsPanel';

const MapView = ({ onSectionChange, uavType, setUavType, missionType, setMissionType, onEmergencyStop, theme, setTheme }) => {
  const cesiumContainer = useRef(null);
  const viewerRef = useRef(null);
  const [activeSection, setActiveSection] = useState(null);
  const [showChecklist, setShowChecklist] = useState(false);
  const [clickData, setClickData] = useState([]);
  const [pinEntities, setPinEntities] = useState([]);
  const [positions, setPositions] = useState([]);
  const [polylineEntity, setPolylineEntity] = useState(null);
  const droneEntityRef = useRef(null);
  const [mapType, setMapType] = useState('osm');
  const sessionFilenameRef = useRef(null);

  // Update polyline when positions change
  useEffect(() => {
    if (positions.length >= 2 && viewerRef.current) {
      if (polylineEntity) {
        viewerRef.current.entities.remove(polylineEntity);
      }
      const newPolyline = viewerRef.current.entities.add({
        name: 'mission-path',
        polyline: {
          positions: positions,
          width: 5,
          material: Cesium.Color.RED.withAlpha(0.8),
          clampToGround: false,
          height: 20,
          depthFailMaterial: Cesium.Color.RED.withAlpha(0.6)
        }
      });
      console.log('Polyline created:', newPolyline);
      setPolylineEntity(newPolyline);
    } else if (positions.length < 2 && polylineEntity) {
      viewerRef.current.entities.remove(polylineEntity);
      setPolylineEntity(null);
    }
  }, [positions]);

  useEffect(() => {
    if (!window.Cesium) {
      console.error('Cesium is not loaded. Ensure Cesium files are served at http://localhost:8484/cesium/');
      return;
    }

    if (!cesiumContainer.current) {
      console.error('Cesium container ref is null');
      return;
    }

    const osmProvider = new Cesium.OpenStreetMapImageryProvider({
      url: 'http://localhost:8484/osm/'
    });

    const googleProvider = new Cesium.UrlTemplateImageryProvider({
      url: 'http://localhost:8484/gsat/{z}/{x}/{y}.png'
    });

    const viewer = new Cesium.Viewer(cesiumContainer.current, {
      imageryProvider: osmProvider,
      baseLayerPicker: false,
      shouldAnimate: true,
      navigationInstructionsInitiallyVisible: false,
      navigationHelpButton: true,
      fullscreenButton: true,
      timeline: true,
      animation: false,
      geocoder: false,
      homeButton: true,
      sceneModePicker: true,
      infoBox: true,
      sceneMode: Cesium.SceneMode.SCENE3D,
    });

    viewerRef.current = viewer;

    const providerViewModels = [
      new Cesium.ProviderViewModel({
        name: 'OpenStreetMap',
        iconUrl: Cesium.buildModuleUrl('Widgets/Images/ImageryProviders/openStreetMap.png'),
        tooltip: 'Local OpenStreetMap tiles',
        creationFunction: () => osmProvider,
      }),
      new Cesium.ProviderViewModel({
        name: 'Google Maps',
        iconUrl: Cesium.buildModuleUrl('Widgets/Images/ImageryProviders/googleEarth.png'),
        tooltip: 'Local Google Maps tiles',
        creationFunction: () => googleProvider,
      }),
    ];

    const baseLayerPicker = new Cesium.BaseLayerPicker('baseLayerPickerContainer', {
      globe: viewer.scene.globe,
      imageryProviderViewModels: providerViewModels,
    });

    viewer.scene.globe.depthTestAgainstTerrain = false;

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(73.036905, 33.680867, 3000),
      duration: 0.3,
    });

    try {
      const droneEntity = viewer.entities.add({
        id: 'drone',
        position: Cesium.Cartesian3.fromDegrees(73.036905, 33.680867, 100),
        model: {
          uri: 'Drone.glb',
          minimumPixelSize: 64,
          maximumScale: 200,
          scale: 1.0,
          color: Cesium.Color.WHITE,
          modelMatrix: Cesium.Transforms.eastNorthUpToFixedFrame(
            Cesium.Cartesian3.fromDegrees(73.036905, 33.680867, 100)
          )
        },
        description: '3D Drone Model',
      });
      droneEntityRef.current = droneEntity;
    } catch (error) {
      console.error('Error loading drone.gltf model:', error);
      try {
        const pinEntity = viewer.entities.add({
          id: 'drone',
          position: Cesium.Cartesian3.fromDegrees(73.036905, 33.680867, 100),
          billboard: {
            image: 'pin.png',
            scale: 0.1,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM
          },
          description: 'Drone Fallback Pin',
        });
        droneEntityRef.current = pinEntity;
      } catch (fallbackError) {
        console.error('Error loading fallback pin.png:', fallbackError);
      }
    }

    const getDynamicScale = (altitude) => {
      if (altitude < 500) return 1.0;
      if (altitude < 2000) return 0.75;
      if (altitude < 5000) return 0.5;
      if (altitude < 10000) return 0.35;
      return 0.15;
    };

    viewer.scene.preRender.addEventListener(() => {
      const cameraAltitude = viewer.camera.positionCartographic.height;
      const scale = getDynamicScale(cameraAltitude);
      if (droneEntityRef.current && droneEntityRef.current.model) {
        droneEntityRef.current.model.scale = scale;
      } else if (droneEntityRef.current && droneEntityRef.current.billboard) {
        droneEntityRef.current.billboard.scale = scale * 0.5;
      }
      const pinScale = getDynamicScale(cameraAltitude) * 0.15;
      pinEntities.forEach(pin => {
        if (pin && pin.billboard) pin.billboard.scale = pinScale;
      });
    });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    sessionFilenameRef.current = `mission_coordinates_${mapType}_${timestamp}.json`;

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction(async (click) => {
      const cartesian = viewer.scene.globe.pick(viewer.camera.getPickRay(click.position), viewer.scene);
      if (Cesium.defined(cartesian)) {
        const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        const longitude = Cesium.Math.toDegrees(cartographic.longitude);
        const latitude = Cesium.Math.toDegrees(cartographic.latitude);
        const height = 10;

        const pinEntity = viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
          billboard: {
            image: 'pin.png',
            scale: 0.3,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM
          }
        });

        const newPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
        setPinEntities(prev => [...prev, pinEntity]);
        setPositions(prev => [...prev, newPosition]);
        const newClickData = [...clickData, { latitude, longitude, altitude: height }];
        setClickData(newClickData);

        console.log('Click Data:', JSON.stringify(newClickData, null, 2));
        console.log('Positions for Polyline:', positions.length + 1);
        
        try {
          const response = await fetch('http://localhost:8484/save-mission', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ coordinates: newClickData, imageryType: mapType, filename: sessionFilenameRef.current })
          });

          const result = await response.json();
          if (result.status !== 'success') {
            console.error('Failed to save mission coordinates:', result.message);
          }
        } catch (error) {
          console.error('Error saving mission coordinates:', error);
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

    handler.setInputAction((click) => {
      const pickedObject = viewer.scene.pick(click.position);
      if (Cesium.defined(pickedObject) && pickedObject.id === 'drone') {
        viewer.trackedEntity = droneEntityRef.current;
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    return () => {
      handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
      handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
      if (polylineEntity) {
        viewerRef.current.entities.remove(polylineEntity);
      }
      if (viewer) viewer.destroy();
      if (baseLayerPicker) baseLayerPicker.destroy();
    };
  }, []);

  useEffect(() => {
    if (!viewerRef.current) return;

    const osmProvider = new Cesium.OpenStreetMapImageryProvider({
      url: 'http://localhost:8484/osm/'
    });
    const googleProvider = new Cesium.UrlTemplateImageryProvider({
      url: 'http://localhost:8484/gsat/{z}/{x}/{y}.png'
    });

    viewerRef.current.scene.imageryLayers.removeAll();
    viewerRef.current.scene.imageryLayers.addImageryProvider(mapType === 'osm' ? osmProvider : googleProvider);
  }, [mapType]);

  const handleZoomIn = () => {
    if (viewerRef.current) {
      viewerRef.current.camera.zoomIn(500);
    }
  };

  const handleZoomOut = () => {
    if (viewerRef.current) {
      viewerRef.current.camera.zoomOut(500);
    }
  };

  const handleSaveMission = async () => {
    if (clickData.length === 0) {
      alert('No coordinates to save!');
      return;
    }

    try {
      const response = await fetch('http://localhost:8484/save-mission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ coordinates: clickData, imageryType: mapType, filename: sessionFilenameRef.current })
      });

      const result = await response.json();
      if (result.status === 'success') {
        alert(`Mission coordinates saved successfully to ${result.filename}!`);
        setPositions([]);
        setClickData([]);
        setPinEntities(prev => {
          prev.forEach(pin => viewerRef.current.entities.remove(pin));
          return [];
        });
        if (polylineEntity) {
          viewerRef.current.entities.remove(polylineEntity);
          setPolylineEntity(null);
        }
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        sessionFilenameRef.current = `mission_coordinates_${mapType}_${timestamp}.json`;
      } else {
        alert('Failed to save mission coordinates: ' + result.message);
      }
    } catch (error) {
      console.error('Error saving mission:', error);
      alert('Error saving mission coordinates. Check server logs at http://localhost:8484/');
    }
  };

  const uavStatus = { battery: 85, signalStrength: 75, health: 90, weather: { temp: 15, humidity: 60, windSpeed: 5, enemyDetection: false } };
  const telemetryData = [
    { id: 1, timestamp: '2025-07-21 12:00', data: { altitude: 100, speed: 15, status: 'active', missionStatus: 'In Progress' } },
    { id: 2, timestamp: '2025-07-21 12:05', data: { altitude: 120, speed: 18, status: 'active', missionStatus: 'In Progress' } },
  ];
  const waypoints = [
    { id: 1, lat: 33.680867, lng: 73.036905, alt: 3000, command: 'TAKEOFF', objective: 'Start Point' },
    { id: 2, lat: 33.690000, lng: 73.050000, alt: 3100, command: 'WAYPOINT', objective: 'Checkpoint 1' },
  ];

  const handleConnect = (type) => console.log('Connected:', type);
  const handleArmDisarm = (type) => console.log('Arm/Disarm:', type);
  const handleAngleChange = (angle) => console.log('Angle changed to:', angle);
  const handlePrerequisites = () => console.log('Checking prerequisites');
  const handleModeChange = (mode) => console.log('Mode changed to:', mode);
  const handleDownload = () => console.log('Download waypoints');
  const handleImport = (e) => console.log('Import waypoints:', e.target.files);
  const setActiveTab = (tab) => console.log('Active tab:', tab);

  return (
    <div className="map-view-container">
      <MainNavbar
        onSectionChange={(section) => {
          setActiveSection(section);
          onSectionChange(section);
        }}
        uavType={uavType}
        setUavType={setUavType}
        missionType={missionType}
        setMissionType={setMissionType}
        onEmergencyStop={onEmergencyStop}
        theme={theme}
        setTheme={setTheme}
      />
      <div className="map-content relative">
        <div id="cesiumContainer" ref={cesiumContainer} className="w-full h-full"></div>
        <div id="baseLayerPickerContainer"></div>
        <select
          id="mapTypeSelector"
          className="map-type-selector bg-white border border-gray-300 rounded px-2 py-1 text-sm"
          value={mapType}
          onChange={(e) => setMapType(e.target.value)}
        >
          <option value="osm">OpenStreetMap</option>
          <option value="google">Google Maps</option>
        </select>
        <div className="absolute top-20 left-4 z-10 flex flex-col space-y-2">
          <button
            onClick={handleZoomIn}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={handleZoomOut}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
            title="Zoom Out"
          >
            −
          </button>
        </div>
        <button
          onClick={handleSaveMission}
          className="absolute top-20 right-4 z-10 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
        >
          Save Mission
        </button>
      </div>
      {activeSection === 'connect' && (
        <ConnectPanel
          onConnect={handleConnect}
          onClose={() => setActiveSection(null)}
          show={true}
        />
      )}
      {activeSection === 'mission' && (
        <MissionPlanPanel
          viewer={viewerRef.current}
          waypoints={waypoints}
          logs={telemetryData}
          onClose={() => setActiveSection(null)}
          onEditWaypoint={(id, wp) => console.log('Edit waypoint:', id, wp)}
          onImportWaypoints={(wps) => console.log('Import waypoints:', wps)}
        />
      )}
      {activeSection === 'telemetry' && (
        <TelemetryLogs
          telemetry={uavStatus}
          logs={telemetryData}
          onClose={() => setActiveSection(null)}
          activeTab="vitals"
        />
      )}
      {activeSection === 'controls' && (
        <ControlsPanel
          uavType={uavType}
          onClose={() => setActiveSection(null)}
        />
      )}
      {activeSection && (
        <SubNavbar
          section={activeSection}
          uavType={uavType}
          onArmDisarm={handleArmDisarm}
          onAngleChange={handleAngleChange}
          onPrerequisites={handlePrerequisites}
          onModeChange={handleModeChange}
          onClose={() => setActiveSection(null)}
          onDownload={handleDownload}
          onImport={handleImport}
          setActiveTab={setActiveTab}
        />
      )}
    </div>
  );
};

export default MapView;