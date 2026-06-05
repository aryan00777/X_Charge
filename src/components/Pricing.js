import React, { useState } from 'react';
import Header from './Header';
import LoginModal from './LoginModal';
import './Pricing.css';

const Pricing = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

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

  return (
    <div className="pricing">
      <Header onLoginClick={handleLoginClick} />
      <div className="container">
        <div className="hero-section">
          <h1>Simple, Transparent Pricing</h1>
          <p>No hidden fees, no surprises. Just fair pricing for everyone.</p>
        </div>
        
        <div className="pricing-grid">
          <div className="pricing-card">
            <div className="card-header">
              <h3>For Drivers</h3>
              <div className="price">$0.20 - $0.40</div>
              <div className="price-unit">per kWh</div>
            </div>
            <ul className="features">
              <li>✓ Access to all charging stations</li>
              <li>✓ Real-time availability</li>
              <li>✓ Easy booking system</li>
              <li>✓ Secure payments</li>
              <li>✓ 24/7 customer support</li>
            </ul>
            <button className="pricing-button">Start Charging</button>
          </div>
          
          <div className="pricing-card featured">
            <div className="card-header">
              <h3>For Hosts</h3>
              <div className="price">5%</div>
              <div className="price-unit">service fee</div>
            </div>
            <ul className="features">
              <li>✓ Keep 95% of your earnings</li>
              <li>✓ Set your own prices</li>
              <li>✓ Manage availability</li>
              <li>✓ Automatic payments</li>
              <li>✓ Marketing support</li>
            </ul>
            <button className="pricing-button">Start Hosting</button>
          </div>
        </div>
        
        <div className="pricing-faq">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h4>How are prices determined?</h4>
              <p>Hosts set their own prices based on location, charger type, and market demand. We provide pricing recommendations to help you stay competitive.</p>
            </div>
            <div className="faq-item">
              <h4>When do I get paid?</h4>
              <p>Payments are processed automatically and deposited into your account within 2-3 business days after each charging session.</p>
            </div>
            <div className="faq-item">
              <h4>Are there any setup fees?</h4>
              <p>No setup fees! We only take a small service fee from each transaction to cover payment processing and platform maintenance.</p>
            </div>
            <div className="faq-item">
              <h4>What if there's an issue with my charger?</h4>
              <p>Our support team is available 24/7 to help resolve any issues. We also provide insurance coverage for eligible hosts.</p>
            </div>
          </div>
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

export default Pricing;
