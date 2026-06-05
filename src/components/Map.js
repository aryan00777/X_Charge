import React from 'react';
import './Map.css';

const Map = () => {
  return (
    <div className="map-container">
      <div className="map-wrapper">
        {/* This would typically be a real map component like Google Maps or Mapbox */}
        <div className="mock-map">
          <div className="map-content">
            <div className="charging-station" style={{ top: '20%', left: '30%' }}>
              <div className="station-marker">⚡</div>
            </div>
            <div className="charging-station" style={{ top: '40%', left: '60%' }}>
              <div className="station-marker">⚡</div>
            </div>
            <div className="charging-station" style={{ top: '60%', left: '25%' }}>
              <div className="station-marker">⚡</div>
            </div>
            <div className="charging-station" style={{ top: '70%', left: '70%' }}>
              <div className="station-marker">⚡</div>
            </div>
            <div className="charging-station" style={{ top: '35%', left: '80%' }}>
              <div className="station-marker">⚡</div>
            </div>
          </div>
          <div className="map-controls">
            <div className="zoom-controls">
              <button className="zoom-btn">+</button>
              <button className="zoom-btn">-</button>
            </div>
          </div>
          <div className="map-attribution">
            <span>Google</span>
            <span>Maps. Terms. Report a map error</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;
