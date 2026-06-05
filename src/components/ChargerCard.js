import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNotification } from '../contexts/NotificationContext';
import './ChargerCard.css';

const ChargerCard = ({ charger, onUpdated, onDeleted }) => {
  const { showSuccess, showError } = useNotification();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState({
    name: charger.name,
    description: charger.description,
    price_per_kwh: charger.price_per_kwh,
    hourly_rate: charger.hourly_rate,
    availability_status: charger.availability_status,
    operating_hours: charger.operating_hours
  });

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      name: charger.name,
      description: charger.description,
      price_per_kwh: charger.price_per_kwh,
      hourly_rate: charger.hourly_rate,
      availability_status: charger.availability_status,
      operating_hours: charger.operating_hours
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('charging_stations')
        .update(editData)
        .eq('id', charger.id);

      if (error) throw error;

      showSuccess('Charger updated successfully!');
      setIsEditing(false);
      onUpdated();
    } catch (error) {
      console.error('Error updating charger:', error);
      showError('Failed to update charger. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      name: charger.name,
      description: charger.description,
      price_per_kwh: charger.price_per_kwh,
      hourly_rate: charger.hourly_rate,
      availability_status: charger.availability_status,
      operating_hours: charger.operating_hours
    });
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this charger? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('charging_stations')
        .delete()
        .eq('id', charger.id);

      if (error) throw error;

      showSuccess('Charger deleted successfully!');
      onDeleted();
    } catch (error) {
      console.error('Error deleting charger:', error);
      showError('Failed to delete charger. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return '#10B981';
      case 'in_use': return '#F59E0B';
      case 'maintenance': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available': return 'Available';
      case 'in_use': return 'In Use';
      case 'maintenance': return 'Maintenance';
      default: return 'Unknown';
    }
  };

  return (
    <div className="charger-card">
      <div className="charger-header">
        <div className="charger-title">
          {isEditing ? (
            <input
              type="text"
              value={editData.name}
              onChange={(e) => setEditData({...editData, name: e.target.value})}
              className="edit-input"
            />
          ) : (
            <h3>{charger.name}</h3>
          )}
        </div>
        <div className="charger-status">
          <span 
            className="status-badge"
            style={{ backgroundColor: getStatusColor(charger.availability_status) }}
          >
            {getStatusText(charger.availability_status)}
          </span>
        </div>
      </div>

      <div className="charger-content">
        <div className="charger-info">
          <div className="info-row">
            <span className="info-label">Type:</span>
            <span className="info-value">{charger.charger_type}</span>
          </div>
          
          <div className="info-row">
            <span className="info-label">Location:</span>
            <span className="info-value">{charger.address}</span>
          </div>

          {isEditing ? (
            <div className="info-row">
              <span className="info-label">Description:</span>
              <textarea
                value={editData.description}
                onChange={(e) => setEditData({...editData, description: e.target.value})}
                className="edit-textarea"
                rows="2"
              />
            </div>
          ) : (
            <div className="info-row">
              <span className="info-label">Description:</span>
              <span className="info-value">{charger.description || 'No description'}</span>
            </div>
          )}

          <div className="pricing-row">
            {isEditing ? (
              <>
                <div className="price-input">
                  <label>Price per kWh:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editData.price_per_kwh}
                    onChange={(e) => setEditData({...editData, price_per_kwh: parseFloat(e.target.value)})}
                    className="edit-input"
                  />
                </div>
                <div className="price-input">
                  <label>Hourly Rate:</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editData.hourly_rate}
                    onChange={(e) => setEditData({...editData, hourly_rate: parseFloat(e.target.value)})}
                    className="edit-input"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="price-info">
                  <span className="price-label">Price per kWh:</span>
                  <span className="price-value">${charger.price_per_kwh}</span>
                </div>
                <div className="price-info">
                  <span className="price-label">Hourly Rate:</span>
                  <span className="price-value">${charger.hourly_rate}</span>
                </div>
              </>
            )}
          </div>

          <div className="info-row">
            <span className="info-label">Operating Hours:</span>
            {isEditing ? (
              <input
                type="text"
                value={editData.operating_hours}
                onChange={(e) => setEditData({...editData, operating_hours: e.target.value})}
                className="edit-input"
                placeholder="e.g., 24/7 or 6 AM - 10 PM"
              />
            ) : (
              <span className="info-value">{charger.operating_hours}</span>
            )}
          </div>

          <div className="info-row">
            <span className="info-label">Rating:</span>
            <span className="info-value">
              ⭐ {charger.rating} ({charger.total_reviews} reviews)
            </span>
          </div>

          {charger.features && charger.features.length > 0 && (
            <div className="features">
              <span className="info-label">Features:</span>
              <div className="features-list">
                {charger.features.map((feature, index) => (
                  <span key={index} className="feature-tag">{feature}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="charger-actions">
        {isEditing ? (
          <>
            <button 
              className="action-btn save-btn" 
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button 
              className="action-btn cancel-btn" 
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button 
              className="action-btn edit-btn" 
              onClick={handleEdit}
            >
              Edit
            </button>
            <button 
              className="action-btn delete-btn" 
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ChargerCard;
