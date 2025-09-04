import { useState, useCallback, useRef, useEffect } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
const LIBRARIES = ["geometry"];

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const center = {
  lat: 23.215451,
  lng: 77.410072,
};

const LandMapping = () => {
  const [farmerName, setFarmerName] = useState("");
  const [farmerId, setFarmerId] = useState("");
  const [village, setVillage] = useState("");
  const [cropType, setCropType] = useState("");
  const [area, setArea] = useState(0);
  const [coordinates, setCoordinates] = useState([]);
  const [map, setMap] = useState(null);
  const [clickedPoints, setClickedPoints] = useState([]);
  const [polygon, setPolygon] = useState(null);
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyCbsHRudpggcTfqJGa7Lfq--vSEeMn6Mkk",
    libraries: LIBRARIES,
  });

  useEffect(() => {
    if (loadError) {
      console.error("Google Maps loading error:", loadError);
      alert(
        "Google Maps failed to load. Please check the browser console for details."
      );
    }
  }, [loadError]);

  const onMapLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const handleMapClick = useCallback(
    (event) => {
      const newPoint = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      };
      const updatedPoints = [...clickedPoints, newPoint];
      setClickedPoints(updatedPoints);
      if (updatedPoints.length >= 3) {
        createPolygonAndCalculateArea(updatedPoints);
      }
    },
    [clickedPoints]
  );

  const createPolygonAndCalculateArea = (points) => {
    if (polygon) {
      polygon.setMap(null);
    }
    const newPolygon = new window.google.maps.Polygon({
      paths: points,
      strokeColor: "#1e6e3d",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#2c974b",
      fillOpacity: 0.35,
    });
    newPolygon.setMap(map);
    setPolygon(newPolygon);
    const area =
      window.google.maps.geometry.spherical.computeArea(newPolygon.getPath()) /
      10000;
    setArea(area);
    setCoordinates(points);
  };

  const resetDrawing = () => {
    setClickedPoints([]);
    setCoordinates([]);
    setArea(0);
    if (polygon) {
      polygon.setMap(null);
      setPolygon(null);
    }
  };

  const handleSaveParcel = async () => {
    if (!farmerName || !farmerId || !village || !cropType) {
      alert("Please complete all farmer information fields.");
      return;
    }
    if (coordinates.length < 3) {
      alert(
        "Please select at least 3 points on the map to define your land parcel."
      );
      return;
    }
    const parcelData = {
      farmerId,
      coordinates,
      area,
      cropType,
    };

    try {
      const response = await fetch(
        "http://localhost:5000/api/receive-coordinates",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(parcelData),
        }
      );

      if (response.ok) {
        const result = await response.json();
        alert(
          `Land data saved successfully!\n\nArea: ${area.toFixed(
            2
          )} Hectares\nFarmer: ${farmerName}\nFarmer ID: ${farmerId}`
        );
      } else {
        alert("Error saving land data. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error saving land data. Please check your connection.");
    }
  };

  const simulateDemoFarm = () => {
    setFarmerName("Rajesh Kumar");
    setFarmerId("FARM-2023-0542");
    setVillage("Shivapur");
    setCropType("agroforestry");

    const demoCoords = [
      { lat: 15.4865, lng: 75.117 },
      { lat: 15.484, lng: 75.1195 },
      { lat: 15.481, lng: 75.1175 },
      { lat: 15.483, lng: 75.114 },
    ];

    setClickedPoints(demoCoords);
    if (map) {
      createPolygonAndCalculateArea(demoCoords);
    }
  };

  if (loadError) {
    return (
      <div className="main-content">
        <div className="map-container">
          <div
            style={{
              padding: "20px",
              textAlign: "center",
              color: "#d32f2f",
              backgroundColor: "#ffebee",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <h3>Google Maps API Error</h3>
            <p>There's an issue with your Google Maps API key.</p>
            <p>Please check:</p>
            <ul style={{ textAlign: "left", margin: "10px 0" }}>
              <li>API key is valid and enabled</li>
              <li>Maps JavaScript API is enabled</li>
              <li>Billing is set up for your Google Cloud project</li>
            </ul>
            <button
              onClick={() => window.location.reload()}
              style={{ marginTop: "15px", padding: "10px 20px" }}
            >
              Reload Page
            </button>
          </div>
        </div>
        <div className="info-panel">
          <div className="panel-content">
            <div className="panel-section">
              <h2>Instructions</h2>
              <div className="instructions">
                <p>
                  Google Maps is currently unavailable due to API configuration
                  issues.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="main-content">
        <div className="map-container">
          <div
            style={{
              padding: "20px",
              textAlign: "center",
              color: "#1976d2",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <h3>Loading Google Maps...</h3>
            <p>Please wait while we load the mapping tools.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="map-container">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={15}
          center={center}
          onLoad={onMapLoad}
          onClick={handleMapClick}
        >
          {clickedPoints.map((point, index) => (
            <Marker
              key={index}
              position={point}
              label={(index + 1).toString()}
            />
          ))}
        </GoogleMap>
        <div className="map-overlay">
          <h3>Mapping Instructions</h3>
          <p>Click on the map to place points around your land boundary.</p>
          <p>Click at least 3 points to define your parcel.</p>
          <div className="controls">
            <button className="secondary" onClick={resetDrawing}>
              Reset Points
            </button>
          </div>
        </div>
      </div>

      <div className="info-panel">
        <div className="panel-content">
          <div className="panel-section">
            <h2>Instructions</h2>
            <div className="instructions">
              <ol>
                <li>Zoom and pan the map to locate your land parcel</li>
                <li>Click on the map to place points around the boundary</li>
                <li>Click at least 3 points to define your land</li>
                <li>The area will be automatically calculated</li>
                <li>Click "Save Parcel" to store the information</li>
              </ol>
            </div>
          </div>

          <div className="panel-section">
            <h2>Farmer Information</h2>
            <div className="form-group">
              <label htmlFor="farmer-name">Full Name</label>
              <input
                type="text"
                id="farmer-name"
                placeholder="Enter farmer's name"
                value={farmerName}
                onChange={(e) => setFarmerName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="farmer-id">Farmer ID</label>
              <input
                type="text"
                id="farmer-id"
                placeholder="Enter your farmer ID"
                value={farmerId}
                onChange={(e) => setFarmerId(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="village">Village</label>
              <input
                type="text"
                id="village"
                placeholder="Enter village name"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="crop-type">Primary Crop</label>
              <select
                id="crop-type"
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
              >
                <option value="">Select crop type</option>
                <option value="rice">Rice</option>
                <option value="wheat">Wheat</option>
                <option value="corn">Corn</option>
                <option value="agroforestry">Agroforestry</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="panel-section">
            <h2>Land Parcel Details</h2>
            <div className="result-box">
              <div>Calculated Area</div>
              <div className="area-value">{area.toFixed(2)} Hectares</div>
            </div>

            <h3>Boundary Points</h3>
            <div className="coordinates-box">
              {clickedPoints.length > 0
                ? clickedPoints.map((point, index) => (
                    <div key={index}>
                      Point {index + 1}: {point.lat.toFixed(6)},{" "}
                      {point.lng.toFixed(6)}
                    </div>
                  ))
                : "No points selected yet. Click on the map to add points."}
            </div>

            <button
              onClick={handleSaveParcel}
              disabled={clickedPoints.length < 3}
            >
              Save Parcel
            </button>
            <button className="secondary" onClick={simulateDemoFarm}>
              Simulate Demo Farm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandMapping;
