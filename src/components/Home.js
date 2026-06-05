import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';
import Banner from './Banner';
import LoginForm from './LoginForm';
import LiveMap from './LiveMap';
import HostCharger from './HostCharger';
import LoginModal from './LoginModal';
import './Home.css';

const Home = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { user, isHoster, isCustomer } = useAuth();

  const handleLoginClick = () => {
    setIsLoginModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsLoginModalOpen(false);
  };

  // Show HostCharger page for logged-in hosts
  if (isHoster && user) {
    return <HostCharger />;
  }

  return (
    <div className="home">
      <Header onLoginClick={handleLoginClick} />
      <Banner />
      
      <main className="main-content">
        <div className="hero-section">
          <h1 className="main-title">Peer-to-Peer EV Charging</h1>
          <p className="main-subtitle">
            Locate a charger for your vehicle and achieve a seamless charging experience
          </p>
        </div>  
        
        <div className="content-grid">
          {!user && (
            <div className="login-section">
              <LoginForm />
            </div>
          )}
          <div className={`map-section ${user ? 'map-full-width' : ''}`}>
            <LiveMap />
          </div>
        </div>
      </main>
      
      <div className="bottom-cta">
        <button className="find-stations-btn">
          Find Charging Stations
        </button>
      </div>

      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default Home;
