import React, { useState } from 'react';
import ChargerCard from './ChargerCard';
import './ChargerManagement.css';

const ChargerManagement = ({ chargers, loading, onChargerUpdated, onChargerDeleted }) => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');

  const filteredChargers = chargers.filter(charger => {
    if (filterStatus === 'all') return true;
    return charger.availability_status === filterStatus;
  });

  const sortedChargers = [...filteredChargers].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'price':
        return b.price_per_kwh - a.price_per_kwh;
      case 'rating':
        return b.rating - a.rating;
      case 'created_at':
      default:
        return new Date(b.created_at) - new Date(a.created_at);
    }
  });

  if (loading) {
    return (
      <div className="charger-management">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading your chargers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="charger-management">
      {/* Filters and Controls */}
      <div className="management-controls">
        <div className="filters">
          <div className="filter-group">
            <label>Filter by Status:</label>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Chargers</option>
              <option value="available">Available</option>
              <option value="in_use">In Use</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Sort by:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="created_at">Date Added</option>
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="rating">Rating</option>
            </select>
          </div>
        </div>

        <div className="charger-count">
          {sortedChargers.length} charger{sortedChargers.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Chargers Grid */}
      {sortedChargers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔌</div>
          <h3>No chargers found</h3>
          <p>
            {filterStatus === 'all' 
              ? "You haven't added any chargers yet. Add your first charger to start earning!"
              : `No chargers with status "${filterStatus}" found.`
            }
          </p>
        </div>
      ) : (
        <div className="chargers-grid">
          {sortedChargers.map(charger => (
            <ChargerCard
              key={charger.id}
              charger={charger}
              onUpdated={onChargerUpdated}
              onDeleted={onChargerDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ChargerManagement;
