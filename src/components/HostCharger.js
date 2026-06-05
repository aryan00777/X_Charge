import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';
import LoginModal from './LoginModal';
import './HostCharger.css';

const HostCharger = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { isHoster, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isHoster && user) {
      navigate('/host-dashboard');
    }
  }, [isHoster, user, navigate]);

  const handleLoginClick = () => {
    setIsLoginModalOpen(true);
  };

  const handleLogin = (email, password) => {
    console.log('Login attempt:', { email, password });
    // Handle login logic here
  };

  const handleCloseModal = () => {
    setIsLoginModalOpen(false);
  };
/*  */ 
  return (
    <div className="host-charger">
      <Header onLoginClick={handleLoginClick} />
      <div className="container">
        <div className="hero-section">
          <h1>Host a Charger</h1>
          <p>Turn your EV charger into a source of income while helping the community go green</p>
        </div>
        
        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon">💰</div>
            <h3>Earn Money</h3>
            <p>Generate passive income by sharing your charger with EV drivers in your area</p>
          </div>
          
          <div className="benefit-card">
            <div className="benefit-icon">🌱</div>
            <h3>Help the Environment</h3>
            <p>Contribute to a sustainable future by supporting clean transportation</p>
          </div>
          
          <div className="benefit-card">
            <div className="benefit-icon">🤝</div>
            <h3>Build Community</h3>
            <p>Connect with like-minded individuals who care about sustainability</p>
          </div>
        </div>
        
        <div className="how-it-works">
          <h2>How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h4>List Your Charger</h4>
              <p>Add your charger details, location, and availability</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h4>Set Your Price</h4>
              <p>Choose your pricing and availability schedule</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h4>Start Earning</h4>
              <p>Receive bookings and payments automatically</p>
            </div>
          </div>
        </div>
        
        <div className="cta-section">
          <h2>Ready to Start Hosting?</h2>
          <button className="cta-button">Get Started Today</button>
        </div>
      </div>

      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={handleCloseModal}
        onLogin={handleLogin}
      />
    </div>
  );
};

export default HostCharger;
