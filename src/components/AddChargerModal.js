import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import './AddChargerModal.css';

const AddChargerModal = ({ onClose, onChargerAdded }) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    latitude: '',
    longitude: '',
    charger_type: 'Level 2',
    price_per_kwh: '',
    hourly_rate: '',
    operating_hours: '24/7',
    features: []
  });
  const [newFeature, setNewFeature] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (featureToRemove) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(feature => feature !== featureToRemove)
    }));
  };

  const handleGeocodeAddress = async () => {
    if (!formData.address.trim()) {
      showError('Please enter an address first');
      return;
    }

    try {
      setLoading(true);
      // Using a simple geocoding service (you might want to use a proper geocoding API)
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(formData.address)}&key=YOUR_API_KEY&limit=1`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding failed');
      }
      
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry;
        setFormData(prev => ({
          ...prev,
          latitude: lat.toString(),
          longitude: lng.toString()
        }));
        showSuccess('Location coordinates found!');
      } else {
        showError('Address not found. Please enter coordinates manually.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      showError('Could not find coordinates. Please enter them manually.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      showError('You must be logged in to add a charger');
      return;
    }

    // Validation
    if (!formData.name.trim()) {
      showError('Please enter a charger name');
      return;
    }
    if (!formData.address.trim()) {
      showError('Please enter an address');
      return;
    }
    if (!formData.latitude || !formData.longitude) {
      showError('Please enter latitude and longitude coordinates');
      return;
    }
    if (!formData.price_per_kwh || formData.price_per_kwh <= 0) {
      showError('Please enter a valid price per kWh');
      return;
    }
    if (!formData.hourly_rate || formData.hourly_rate <= 0) {
      showError('Please enter a valid hourly rate');
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('charging_stations')
        .insert([{
          hoster_id: user.id,
          name: formData.name.trim(),
          description: formData.description.trim(),
          address: formData.address.trim(),
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          charger_type: formData.charger_type,
          price_per_kwh: parseFloat(formData.price_per_kwh),
          hourly_rate: parseFloat(formData.hourly_rate),
          operating_hours: formData.operating_hours,
          features: formData.features,
          availability_status: 'available',
          is_active: true
        }]);

      if (error) throw error;

      showSuccess('Charger added successfully!');
      onChargerAdded();
    } catch (error) {
      console.error('Error adding charger:', error);
      showError('Failed to add charger. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="add-charger-modal">
        <div className="modal-header">
          <h2>Add New Charger</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="charger-form">
          <div className="form-section">
            <h3>Basic Information</h3>
            
            <div className="form-group">
              <label htmlFor="name">Charger Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Downtown Fast Charger"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your charging station..."
                rows="3"
              />
            </div>

            <div className="form-group">
              <label htmlFor="charger_type">Charger Type *</label>
              <select
                id="charger_type"
                name="charger_type"
                value={formData.charger_type}
                onChange={handleInputChange}
                required
              >
                <option value="Level 2">Level 2 (AC)</option>
                <option value="DC Fast">DC Fast (DC)</option>
              </select>
            </div>
          </div>

          <div className="form-section">
            <h3>Location</h3>
            
            <div className="form-group">
              <label htmlFor="address">Address *</label>
              <div className="address-input-group">
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter full address"
                  required
                />
                <button
                  type="button"
                  className="geocode-btn"
                  onClick={handleGeocodeAddress}
                  disabled={loading}
                >
                  Find Coordinates
                </button>
              </div>
            </div>

            <div className="coordinates-group">
              <div className="form-group">
                <label htmlFor="latitude">Latitude *</label>
                <input
                  type="number"
                  step="any"
                  id="latitude"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  placeholder="55.6761"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="longitude">Longitude *</label>
                <input
                  type="number"
                  step="any"
                  id="longitude"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleInputChange}
                  placeholder="12.5683"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Pricing</h3>
            
            <div className="pricing-group">
              <div className="form-group">
                <label htmlFor="price_per_kwh">Price per kWh (DKK) *</label>
                <input
                  type="number"
                  step="0.01"
                  id="price_per_kwh"
                  name="price_per_kwh"
                  value={formData.price_per_kwh}
                  onChange={handleInputChange}
                  placeholder="2.50"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="hourly_rate">Hourly Rate (DKK) *</label>
                <input
                  type="number"
                  step="0.01"
                  id="hourly_rate"
                  name="hourly_rate"
                  value={formData.hourly_rate}
                  onChange={handleInputChange}
                  placeholder="25.00"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="operating_hours">Operating Hours</label>
              <input
                type="text"
                id="operating_hours"
                name="operating_hours"
                value={formData.operating_hours}
                onChange={handleInputChange}
                placeholder="e.g., 24/7 or 6 AM - 10 PM"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Features</h3>
            
            <div className="features-input-group">
              <input
                type="text"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder="Add a feature (e.g., WiFi, Restrooms)"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
              />
              <button
                type="button"
                className="add-feature-btn"
                onClick={handleAddFeature}
              >
                Add
              </button>
            </div>

            {formData.features.length > 0 && (
              <div className="features-list">
                {formData.features.map((feature, index) => (
                  <span key={index} className="feature-tag">
                    {feature}
                    <button
                      type="button"
                      className="remove-feature-btn"
                      onClick={() => handleRemoveFeature(feature)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Adding Charger...' : 'Add Charger'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddChargerModal;
