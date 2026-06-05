import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './Header';
import LoginModal from './LoginModal';
import './StationDetails.css';

const StationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [station, setStation] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedHours, setSelectedHours] = useState(1);
  const serviceFee = 5; // Fixed service fee

  // Mock station data - in a real app, this would come from an API
  const mockStations = [
    {
      id: 1,
      name: "Downtown Charging Hub",
      type: "Level 2 Charger",
      address: "123 Main St, New York, NY",
      hours: "24/7",
      price: "$0.25/kWh",
      availability: "Available",
      rating: 4.8,
      description: "Convenient downtown location with fast charging",
      hourlyRate: 20,
      serviceFee: 5
    },
    {
      id: 2,
      name: "Green Energy Station",
      type: "DC Fast Charger",
      address: "456 Park Ave, New York, NY",
      hours: "6 AM - 10 PM",
      price: "$0.35/kWh",
      availability: "Available",
      rating: 4.6,
      description: "Solar-powered fast charging station",
      hourlyRate: 35,
      serviceFee: 5
    },
    {
      id: 3,
      name: "Eco-Friendly Charging",
      type: "Level 2 Charger",
      address: "789 Broadway, New York, NY",
      hours: "5 AM - 11 PM",
      price: "$0.20/kWh",
      availability: "In Use",
      rating: 4.9,
      description: "Environmentally conscious charging solution",
      hourlyRate: 20,
      serviceFee: 5
    },
    {
      id: 4,
      name: "Solar Power Station",
      type: "Level 2 Charger",
      address: "321 5th Ave, New York, NY",
      hours: "24/7",
      price: "$0.22/kWh",
      availability: "Available",
      rating: 4.7,
      description: "100% solar powered charging station",
      hourlyRate: 22,
      serviceFee: 5
    },
    {
      id: 5,
      name: "Fast Charge Central",
      type: "DC Fast Charger",
      address: "654 Times Square, New York, NY",
      hours: "24/7",
      price: "$0.40/kWh",
      availability: "Available",
      rating: 4.5,
      description: "Ultra-fast charging in the heart of the city",
      hourlyRate: 40,
      serviceFee: 5
    },
    {
      id: 6,
      name: "Home Charging Station",
      type: "Level 2 Charger",
      address: "100 Residential St, New York, NY",
      hours: "5 AM - 5 PM",
      price: "$0.18/kWh",
      availability: "Available",
      rating: 4.9,
      description: "Residential charging station with competitive rates",
      hourlyRate: 18,
      serviceFee: 5
    }
  ];

  useEffect(() => {
    const foundStation = mockStations.find(s => s.id === parseInt(id));
    setStation(foundStation);
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLoginClick = () => {
    setIsLoginModalOpen(true);
  };


  const handleCloseModal = () => {
    setIsLoginModalOpen(false);
  };

  const handlePay = () => {
    // Handle payment logic here
    console.log('Payment initiated for station:', station.name);
    alert('Payment processing... (This is a demo)');
  };

  const calculateTotal = () => {
    if (!station) return 0;
    return (station.hourlyRate * selectedHours) + serviceFee;
  };

  if (!station) {
    return (
      <div className="station-details">
        <Header onLoginClick={handleLoginClick} />
        <div className="loading">
          <p>Loading station details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="station-details">
      <Header onLoginClick={handleLoginClick} />
      
      <div className="breadcrumbs">
        <span className="breadcrumb-link" onClick={() => navigate('/')}>Home</span>
        <span className="breadcrumb-separator">▸</span>
        <span className="breadcrumb-current">Chargers</span>
      </div>

      <div className="main-title">
        <h1>Find Your Charger</h1>
      </div>

      <div className="search-bar">
        <input 
          type="text" 
          placeholder="Enter an address..." 
          className="address-input"
        />
        <button className="search-btn">🔍</button>
      </div>

      <div className="content-container">
        <div className="station-info-card">
          <div className="station-header">
            <h2 className="station-name">{station.name}</h2>
            <div className="station-type">{station.type}</div>
            <div className="station-location">{station.address}</div>
            <div className="station-hours">{station.hours} : {station.price}</div>
          </div>

          <div className="details-section">
            <h3 className="details-section-title">Station Information</h3>
            <div className="details-list" role="group" aria-label="Station details">
              <div className="details-item">
                <span className="details-label">Type</span>
                <span className="details-value">{station.type}</span>
              </div>
              <div className="details-item">
                <span className="details-label">Price</span>
                <span className="details-value">{station.price}</span>
              </div>
              <div className="details-item">
                <span className="details-label">Status</span>
                <span className="details-value">{station.availability}</span>
              </div>
              <div className="details-item">
                <span className="details-label">Rating</span>
                <span className="details-value">⭐ {station.rating}</span>
              </div>
            </div>
          </div>

          <div className="pricing-section">
            <div className="pricing-left">
              <div className="pricing-item">
                <span className="pricing-label">{selectedHours} Hour{selectedHours > 1 ? 's' : ''}</span>
                <span className="pricing-value">{station.hourlyRate * selectedHours} kr</span>
              </div>
              <div className="pricing-item">
                <span className="pricing-label">Service Fee</span>
                <span className="pricing-value">{serviceFee} kr</span>
              </div>
              <div className="pricing-divider"></div>
              <div className="pricing-total">
                <span className="total-label">Total</span>
                <span className="total-value">{calculateTotal()} kr</span>
              </div>
            </div>
          </div>

          <div className="time-selector">
            <label>Select charging duration:</label>
            <div className="time-buttons">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(hours => (
                <button
                  key={hours}
                  className={`time-btn ${selectedHours === hours ? 'active' : ''}`}
                  onClick={() => setSelectedHours(hours)}
                >
                  {hours}h
                </button>
              ))}
            </div>
          </div>

          <div className="station-features">
            <div className="feature">
              <span className="feature-icon">⚡</span>
              <span className="feature-text">{station.type}</span>
            </div>
            <div className="feature">
              <span className="feature-icon">⭐</span>
              <span className="feature-text">{station.rating} Rating</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🕒</span>
              <span className="feature-text">{station.hours}</span>
            </div>
            <div className="feature">
              <span className="feature-icon">📍</span>
              <span className="feature-text">{station.availability}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pay-section">
        <button className="pay-button" onClick={handlePay}>
          Pay {calculateTotal()} kr
        </button>
      </div>

      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default StationDetails;
