import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import Header from './Header';
import './PaymentPage.css';

const PaymentPage = () => {
  const { user, profile } = useAuth();
  const { showSuccess, showError } = useNotification();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: '',
    city: '',
    zipCode: '',
    country: 'US'
  });

  const [selectedStation, setSelectedStation] = useState(null);
  const [chargingType, setChargingType] = useState('book');
  const [amount, setAmount] = useState(25.00);
  const [selectedPlan, setSelectedPlan] = useState('standard');

  // Handle station data from navigation
  useEffect(() => {
    if (location.state?.selectedStation) {
      setSelectedStation(location.state.selectedStation);
      setChargingType(location.state.chargingType || 'book');
      // Set amount based on station pricing
      const station = location.state.selectedStation;
      setAmount(station.hourlyRate + station.serviceFee);
    }
  }, [location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setCardDetails(prev => ({
      ...prev,
      cardNumber: formatted
    }));
  };

  const handleExpiryChange = (e) => {
    const formatted = formatExpiryDate(e.target.value);
    setCardDetails(prev => ({
      ...prev,
      expiryDate: formatted
    }));
  };

  const handlePayment = async (method) => {
    setLoading(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (method === 'apple-pay') {
        showSuccess('Payment successful with Apple Pay!');
      } else if (method === 'google-pay') {
        showSuccess('Payment successful with Google Pay!');
      } else if (method === 'card') {
        // Validate card details
        if (!cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv || !cardDetails.cardholderName) {
          showError('Please fill in all card details');
          setLoading(false);
          return;
        }
        showSuccess('Payment successful with card!');
      }
      
      // Redirect to success page or dashboard
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
      
    } catch (error) {
      showError('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Dynamic payment plans based on selected station
  const getPaymentPlans = () => {
    if (!selectedStation) {
      return [
        { id: 'standard', name: 'Standard Charge', price: 25.00, duration: '2 hours', features: ['Level 2 Charging', 'Standard Speed'] },
        { id: 'fast', name: 'Fast Charge', price: 45.00, duration: '1 hour', features: ['DC Fast Charging', 'High Speed'] },
        { id: 'premium', name: 'Premium Charge', price: 65.00, duration: '45 minutes', features: ['Super Fast Charging', 'Premium Location'] }
      ];
    }

    const basePrice = selectedStation.hourlyRate;
    const serviceFee = selectedStation.serviceFee;
    
    return [
      { 
        id: '1hour', 
        name: '1 Hour Session', 
        price: basePrice + serviceFee, 
        duration: '1 hour', 
        features: [selectedStation.type, 'Standard Rate'] 
      },
      { 
        id: '2hour', 
        name: '2 Hour Session', 
        price: (basePrice * 2) + serviceFee, 
        duration: '2 hours', 
        features: [selectedStation.type, 'Extended Session'] 
      },
      { 
        id: '4hour', 
        name: '4 Hour Session', 
        price: (basePrice * 4) + serviceFee, 
        duration: '4 hours', 
        features: [selectedStation.type, 'Full Day Rate'] 
      }
    ];
  };

  const paymentPlans = getPaymentPlans();

  return (
    <div className="payment-page">
      <Header />
      
      <div className="payment-container">
        <div className="payment-header">
          <h1>Complete Your Payment</h1>
          {selectedStation ? (
            <div className="station-info-header">
              <p>Charging at: <strong>{selectedStation.name}</strong></p>
              <p>{selectedStation.type} • {selectedStation.price} • {selectedStation.availability}</p>
            </div>
          ) : (
            <p>Secure payment processing for your EV charging session</p>
          )}
        </div>

        <div className="payment-content">
          <div className="payment-left">
            {/* Payment Plans */}
            <div className="payment-plans">
              <h3>Select Charging Plan</h3>
              <div className="plans-grid">
                {paymentPlans.map(plan => (
                  <div 
                    key={plan.id}
                    className={`plan-card ${selectedPlan === plan.id ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedPlan(plan.id);
                      setAmount(plan.price);
                    }}
                  >
                    <div className="plan-header">
                      <h4>{plan.name}</h4>
                      <div className="plan-price">${plan.price}</div>
                    </div>
                    <div className="plan-duration">{plan.duration}</div>
                    <ul className="plan-features">
                      {plan.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Methods */}
            <div className="payment-methods">
              <h3>Payment Method</h3>
              
              {/* Mobile Payment Options */}
              <div className="mobile-payments">
                <button 
                  className="mobile-pay-btn apple-pay"
                  onClick={() => handlePayment('apple-pay')}
                  disabled={loading}
                >
                  <div className="pay-icon">🍎</div>
                  <span>Pay with Apple Pay</span>
                </button>
                
                <button 
                  className="mobile-pay-btn google-pay"
                  onClick={() => handlePayment('google-pay')}
                  disabled={loading}
                >
                  <div className="pay-icon">G</div>
                  <span>Pay with Google Pay</span>
                </button>
              </div>

              <div className="payment-divider">
                <span>or pay with card</span>
              </div>

              {/* Card Payment Form */}
              <div className="card-payment">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="cardNumber">Card Number</label>
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      value={cardDetails.cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="expiryDate">Expiry Date</label>
                    <input
                      type="text"
                      id="expiryDate"
                      name="expiryDate"
                      value={cardDetails.expiryDate}
                      onChange={handleExpiryChange}
                      placeholder="MM/YY"
                      maxLength="5"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="cvv">CVV</label>
                    <input
                      type="text"
                      id="cvv"
                      name="cvv"
                      value={cardDetails.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                      maxLength="4"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="cardholderName">Cardholder Name</label>
                    <input
                      type="text"
                      id="cardholderName"
                      name="cardholderName"
                      value={cardDetails.cardholderName}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="billingAddress">Billing Address</label>
                    <input
                      type="text"
                      id="billingAddress"
                      name="billingAddress"
                      value={cardDetails.billingAddress}
                      onChange={handleInputChange}
                      placeholder="123 Main Street"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">City</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={cardDetails.city}
                      onChange={handleInputChange}
                      placeholder="New York"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="zipCode">ZIP Code</label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={cardDetails.zipCode}
                      onChange={handleInputChange}
                      placeholder="10001"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="country">Country</label>
                    <select
                      id="country"
                      name="country"
                      value={cardDetails.country}
                      onChange={handleInputChange}
                    >
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="GB">United Kingdom</option>
                      <option value="AU">Australia</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="payment-right">
            {/* Order Summary */}
            <div className="order-summary">
              <h3>Order Summary</h3>
              
              <div className="summary-item">
                <span>Charging Plan</span>
                <span>{paymentPlans.find(p => p.id === selectedPlan)?.name}</span>
              </div>
              
              <div className="summary-item">
                <span>Duration</span>
                <span>{paymentPlans.find(p => p.id === selectedPlan)?.duration}</span>
              </div>
              
              <div className="summary-item">
                <span>Location</span>
                <span>{selectedStation ? selectedStation.name : 'Charging Station'}</span>
              </div>
              
              {selectedStation && (
                <div className="summary-item">
                  <span>Station Type</span>
                  <span>{selectedStation.type}</span>
                </div>
              )}
              
              <div className="summary-item">
                <span>Tax</span>
                <span>$2.50</span>
              </div>
              
              <div className="summary-total">
                <span>Total</span>
                <span>${(amount + 2.50).toFixed(2)}</span>
              </div>

              <button 
                className="pay-now-btn"
                onClick={() => handlePayment('card')}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="loading-spinner"></div>
                    Processing...
                  </>
                ) : (
                  `Pay $${(amount + 2.50).toFixed(2)}`
                )}
              </button>

              <div className="security-badges">
                <div className="security-item">
                  <span className="security-icon">🔒</span>
                  <span>SSL Encrypted</span>
                </div>
                <div className="security-item">
                  <span className="security-icon">✓</span>
                  <span>PCI Compliant</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
