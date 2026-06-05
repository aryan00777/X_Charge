import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './LiveMap.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom charging station icon
const createChargingIcon = (color = '#4CAF50') => {
  return L.divIcon({
    className: 'custom-charging-icon',
    html: `<div style="
      background-color: ${color};
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 3px solid white;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      font-size: 16px;
      color: white;
      cursor: pointer;
    ">⚡</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });
};

const LiveMap = () => {
  const [chargingStations, setChargingStations] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStations, setFilteredStations] = useState([]);
  const navigate = useNavigate();

  // Mock charging station data - in a real app, this would come from an API
  const mockStations = [
    {
      id: 1,
      name: "København Central Station",
      position: [55.6300, 12.4600],
      type: "Level 2 Charger",
      price: "2.5 kr/kWh",
      availability: "Available",
      rating: 4.8,
      address: "København H, 1570 København, Denmark",
      hours: "24/7",
      description: "Convenient downtown location with fast charging",
      hourlyRate: 25,
      serviceFee: 5,
      features: ["WiFi", "Restrooms", "Shopping", "Parking"]
    },
    {
      id: 2,
      name: "Nørreport Station",
      position: [55.6200, 12.4500],
      type: "DC Fast Charger",
      price: "3.2 kr/kWh",
      availability: "Available",
      rating: 4.6,
      address: "Nørreport, 1165 København, Denmark",
      hours: "6 AM - 10 PM",
      description: "Solar-powered fast charging station",
      hourlyRate: 32,
      serviceFee: 5,
      features: ["WiFi", "Restrooms", "Food Court"]
    },
    {
      id: 3,
      name: "Amager Strandpark",
      position: [55.6150, 12.4650],
      type: "Level 2 Charger",
      price: "2.1 kr/kWh",
      availability: "Available",
      rating: 4.9,
      address: "Amager Strandpark, 2300 København, Denmark",
      hours: "5 AM - 11 PM",
      description: "Environmentally conscious charging solution",
      hourlyRate: 21,
      serviceFee: 5,
      features: ["Beach Access", "WiFi", "Parking"]
    },
    {
      id: 4,
      name: "Frederiksberg Centrum",
      position: [55.6350, 12.4400],
      type: "Level 2 Charger",
      price: "2.3 kr/kWh",
      availability: "Available",
      rating: 4.7,
      address: "Frederiksberg Centret, 2000 Frederiksberg, Denmark",
      hours: "24/7",
      description: "100% solar powered charging station",
      hourlyRate: 23,
      serviceFee: 5,
      features: ["Shopping", "WiFi", "Restrooms", "Parking"]
    },
    {
      id: 5,
      name: "Ørestad Station",
      position: [55.6100, 12.4800],
      type: "DC Fast Charger",
      price: "3.0 kr/kWh",
      availability: "Available",
      rating: 4.5,
      address: "Ørestad Station, 2300 København, Denmark",
      hours: "24/7",
      description: "Ultra-fast charging in the heart of the city",
      hourlyRate: 30,
      serviceFee: 5,
      features: ["WiFi", "Restrooms", "Shopping", "Metro Access"]
    }
  ];

  const handleStationClick = (station) => {
    setSelectedStation(station);
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedStation(null);
  };

  const handleBookNow = () => {
    if (selectedStation) {
      // Navigate to payment page with station data
      navigate('/payment', { 
        state: { 
          selectedStation: selectedStation,
          chargingType: 'book'
        } 
      });
    }
  };

  const handleRentNow = () => {
    if (selectedStation) {
      // Navigate to payment page with station data
      navigate('/payment', { 
        state: { 
          selectedStation: selectedStation,
          chargingType: 'rent'
        } 
      });
    }
  };

  useEffect(() => {
    // Simulate loading charging stations
    setChargingStations(mockStations);
    setFilteredStations(mockStations);

    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.log('Error getting location:', error);
          // Default to Copenhagen if location access is denied
          setUserLocation([55.6761, 12.5683]);
        }
      );
    } else {
      // Default to Copenhagen if geolocation is not supported
      setUserLocation([55.6761, 12.5683]);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter stations based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredStations(chargingStations);
    } else {
      const filtered = chargingStations.filter(station =>
        station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredStations(filtered);
    }
  }, [searchQuery, chargingStations]);

  const getStationIcon = (station) => {
    // Use default markers for now to ensure visibility
    return L.icon({
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });
  };


  if (!userLocation) {
    return (
      <div className="map-loading">
        <div className="loading-spinner"></div>
        <p>Loading map...</p>
      </div>
    );
  }

  console.log('About to render map with stations:', chargingStations.length);

  return (
    <div className="live-map-container">
      {/* Search Bar */}
      <div className="map-search-container">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Search charging stations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="map-search-input"
          />
          <div className="search-icon">🔍</div>
        </div>
        {searchQuery && (
          <div className="search-results-count">
            {filteredStations.length} station{filteredStations.length !== 1 ? 's' : ''} found
          </div>
        )}
      </div>

      <MapContainer
        center={userLocation}
        zoom={13}
        className="map-container"
        scrollWheelZoom={true}
        style={{height: '600px', width: '100%'}}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User location marker */}
        <Marker position={userLocation}>
          <Popup>
            <div className="popup-content">
              <h4>Your Location</h4>
              <p>You are here</p>
            </div>
          </Popup>
        </Marker>

        {/* Charging stations in Denmark */}
        {filteredStations.map((station) => (
          <Marker 
            key={station.id} 
            position={station.position}
            eventHandlers={{
              click: () => handleStationClick(station)
            }}
          >
            <Popup>
              <div className="simple-popup">
                <h4>{station.name}</h4>
                <p>{station.type} • {station.price}</p>
                <p className="status-badge available">{station.availability}</p>
                <button 
                  className="quick-view-btn"
                  onClick={() => handleStationClick(station)}
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* New Enhanced Popup Container */}
      {showPopup && selectedStation && (
        <div className="enhanced-popup-overlay" onClick={handleClosePopup}>
          <div className="enhanced-popup-container" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <div className="station-title">
                <h2>{selectedStation.name}</h2>
                <div className="station-type-badge">{selectedStation.type}</div>
              </div>
              <button className="close-btn" onClick={handleClosePopup}>×</button>
            </div>
            
            <div className="popup-content">
              <div className="station-info-section">
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">📍 Address</span>
                    <span className="info-value">{selectedStation.address}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">🕒 Hours</span>
                    <span className="info-value">{selectedStation.hours}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">💰 Price</span>
                    <span className="info-value price-highlight">{selectedStation.price}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">⭐ Rating</span>
                    <span className="info-value rating-highlight">{selectedStation.rating}</span>
                  </div>
                </div>
                
                <div className="description-section">
                  <h3>Description</h3>
                  <p>{selectedStation.description}</p>
                </div>
                
                <div className="features-section">
                  <h3>Available Features</h3>
                  <div className="features-grid">
                    {selectedStation.features.map((feature, index) => (
                      <div key={index} className="feature-tag">
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="booking-section">
                <div className="pricing-breakdown">
                  <h3>Pricing Breakdown</h3>
                  <div className="pricing-item">
                    <span>1 Hour Charging</span>
                    <span>{selectedStation.hourlyRate} kr</span>
                  </div>
                  <div className="pricing-item">
                    <span>Service Fee</span>
                    <span>{selectedStation.serviceFee} kr</span>
                  </div>
                  <div className="pricing-divider"></div>
                  <div className="pricing-total">
                    <span>Total (1 hour)</span>
                    <span>{selectedStation.hourlyRate + selectedStation.serviceFee} kr</span>
                  </div>
                </div>
                
                <div className="action-buttons">
                  <button className="book-now-btn" onClick={handleBookNow}>
                    <span>🔋</span>
                    Book Now
                  </button>
                  <button className="rent-now-btn" onClick={handleRentNow}>
                    <span>⏰</span>
                    Rent Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveMap;
