import { useState } from "react";
import LandMapping from "./components/LandMapping";
import VisitRequest from "./components/VisitRequest";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("mapping");

  return (
    <div className="container">
      <header>
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">🌱</div>
            <h1>AgriCarbon MRV - Farmer Portal</h1>
          </div>
        </div>
      </header>

      <div className="app-container">
        <div className="tabs">
          <div
            className={`tab ${activeTab === "mapping" ? "active" : ""}`}
            onClick={() => setActiveTab("mapping")}
          >
            Land Mapping
          </div>
          <div
            className={`tab ${activeTab === "request" ? "active" : ""}`}
            onClick={() => setActiveTab("request")}
          >
            Requests for Farm Visit
          </div>
        </div>

        <div className="main-content">
          {activeTab === "mapping" && <LandMapping />}
          {activeTab === "request" && <VisitRequest />}
        </div>
      </div>

      <footer>
        <p>AgriCarbon MRV System • NABARD Hackathon Project</p>
      </footer>
    </div>
  );
}

export default App;
