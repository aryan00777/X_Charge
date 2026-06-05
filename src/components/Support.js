import React, { useState } from 'react';
import Header from './Header';
import LoginModal from './LoginModal';
import './Support.css';

const Support = () => {
  const [activeTab, setActiveTab] = useState('faq');
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

  const faqData = [
    {
      question: "How do I find a charging station near me?",
      answer: "Use our interactive map to locate nearby charging stations. You can filter by charger type, availability, and price range."
    },
    {
      question: "How do I book a charging session?",
      answer: "Simply click on a charging station marker on the map, review the details, and click 'Reserve Now' to book your session."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, debit cards, and digital wallets like Apple Pay and Google Pay."
    },
    {
      question: "Can I cancel my booking?",
      answer: "Yes, you can cancel your booking up to 30 minutes before your scheduled time without any fees."
    },
    {
      question: "How do I become a host?",
      answer: "Click on 'Host a Charger' in the navigation menu, fill out the application form, and our team will review your submission within 24 hours."
    }
  ];

  return (
    <div className="support">
      <Header onLoginClick={handleLoginClick} />
      <div className="container">
        <div className="hero-section">
          <h1>Support Center</h1>
          <p>We're here to help you with any questions or concerns</p>
        </div>
        
        <div className="support-tabs">
          <button 
            className={`tab-button ${activeTab === 'faq' ? 'active' : ''}`}
            onClick={() => setActiveTab('faq')}
          >
            FAQ
          </button>
          <button 
            className={`tab-button ${activeTab === 'contact' ? 'active' : ''}`}
            onClick={() => setActiveTab('contact')}
          >
            Contact Us
          </button>
          <button 
            className={`tab-button ${activeTab === 'guides' ? 'active' : ''}`}
            onClick={() => setActiveTab('guides')}
          >
            User Guides
          </button>
        </div>
        
        <div className="tab-content">
          {activeTab === 'faq' && (
            <div className="faq-section">
              <h2>Frequently Asked Questions</h2>
              <div className="faq-list">
                {faqData.map((faq, index) => (
                  <div key={index} className="faq-item">
                    <h4>{faq.question}</h4>
                    <p>{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'contact' && (
            <div className="contact-section">
              <h2>Get in Touch</h2>
              <div className="contact-grid">
                <div className="contact-method">
                  <div className="contact-icon">📧</div>
                  <h3>Email Support</h3>
                  <p>support@xcharge.com</p>
                  <p>We respond within 2 hours</p>
                </div>
                <div className="contact-method">
                  <div className="contact-icon">📞</div>
                  <h3>Phone Support</h3>
                  <p>1-800-XCHARGE</p>
                  <p>Mon-Fri 8AM-8PM EST</p>
                </div>
                <div className="contact-method">
                  <div className="contact-icon">💬</div>
                  <h3>Live Chat</h3>
                  <p>Available 24/7</p>
                  <p>Click the chat icon in the bottom right</p>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'guides' && (
            <div className="guides-section">
              <h2>User Guides</h2>
              <div className="guides-grid">
                <div className="guide-card">
                  <h3>Getting Started</h3>
                  <p>Learn how to create an account and make your first booking</p>
                  <button className="guide-button">Read Guide</button>
                </div>
                <div className="guide-card">
                  <h3>Hosting Your Charger</h3>
                  <p>Complete guide to listing and managing your charging station</p>
                  <button className="guide-button">Read Guide</button>
                </div>
                <div className="guide-card">
                  <h3>Payment & Billing</h3>
                  <p>Everything you need to know about payments and pricing</p>
                  <button className="guide-button">Read Guide</button>
                </div>
                <div className="guide-card">
                  <h3>Troubleshooting</h3>
                  <p>Common issues and how to resolve them</p>
                  <button className="guide-button">Read Guide</button>
                </div>
              </div>
            </div>
          )}
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

export default Support;
