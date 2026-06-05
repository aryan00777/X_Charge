import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import './HostAnalytics.css';

const HostAnalytics = ({ chargers, stats }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30'); // days

  useEffect(() => {
    if (chargers.length > 0) {
      fetchBookings();
    }
  }, [chargers, timeRange]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const stationIds = chargers.map(c => c.id);
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          charging_stations!inner(name),
          profiles!bookings_customer_id_fkey(full_name)
        `)
        .in('station_id', stationIds)
        .gte('booking_date', new Date(Date.now() - parseInt(timeRange) * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('booking_date', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateEarnings = () => {
    const completedBookings = bookings.filter(b => b.status === 'completed');
    return completedBookings.reduce((sum, booking) => sum + booking.total_cost, 0);
  };

  const calculateBookingStats = () => {
    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(b => b.status === 'completed').length;
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
    
    return {
      total: totalBookings,
      completed: completedBookings,
      pending: pendingBookings,
      cancelled: cancelledBookings,
      completionRate: totalBookings > 0 ? (completedBookings / totalBookings * 100).toFixed(1) : 0
    };
  };

  const getPopularCharger = () => {
    if (chargers.length === 0) return null;
    
    const chargerBookings = chargers.map(charger => ({
      ...charger,
      bookingCount: bookings.filter(b => b.station_id === charger.id).length
    }));
    
    return chargerBookings.reduce((prev, current) => 
      prev.bookingCount > current.bookingCount ? prev : current
    );
  };

  const getRecentBookings = () => {
    return bookings.slice(0, 5);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const bookingStats = calculateBookingStats();
  const earnings = calculateEarnings();
  const popularCharger = getPopularCharger();
  const recentBookings = getRecentBookings();

  if (loading) {
    return (
      <div className="host-analytics">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="host-analytics">
      <div className="analytics-header">
        <h2>Analytics Dashboard</h2>
        <div className="time-range-selector">
          <label>Time Range:</label>
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-select"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      <div className="analytics-grid">
        {/* Earnings Overview */}
        <div className="analytics-card earnings-card">
          <h3>Earnings Overview</h3>
          <div className="earnings-stats">
            <div className="earnings-main">
              <span className="earnings-amount">${earnings.toFixed(2)}</span>
              <span className="earnings-period">in {timeRange} days</span>
            </div>
            <div className="earnings-breakdown">
              <div className="breakdown-item">
                <span className="breakdown-label">Total Bookings:</span>
                <span className="breakdown-value">{bookingStats.total}</span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-label">Completed:</span>
                <span className="breakdown-value">{bookingStats.completed}</span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-label">Completion Rate:</span>
                <span className="breakdown-value">{bookingStats.completionRate}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Status */}
        <div className="analytics-card booking-status-card">
          <h3>Booking Status</h3>
          <div className="status-stats">
            <div className="status-item completed">
              <div className="status-icon">✅</div>
              <div className="status-info">
                <span className="status-count">{bookingStats.completed}</span>
                <span className="status-label">Completed</span>
              </div>
            </div>
            <div className="status-item pending">
              <div className="status-icon">⏳</div>
              <div className="status-info">
                <span className="status-count">{bookingStats.pending}</span>
                <span className="status-label">Pending</span>
              </div>
            </div>
            <div className="status-item cancelled">
              <div className="status-icon">❌</div>
              <div className="status-info">
                <span className="status-count">{bookingStats.cancelled}</span>
                <span className="status-label">Cancelled</span>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Charger */}
        {popularCharger && (
          <div className="analytics-card popular-charger-card">
            <h3>Most Popular Charger</h3>
            <div className="popular-charger-info">
              <h4>{popularCharger.name}</h4>
              <p>{popularCharger.address}</p>
              <div className="popular-stats">
                <div className="popular-stat">
                  <span className="stat-value">{popularCharger.bookingCount}</span>
                  <span className="stat-label">Bookings</span>
                </div>
                <div className="popular-stat">
                  <span className="stat-value">${popularCharger.price_per_kwh}</span>
                  <span className="stat-label">per kWh</span>
                </div>
                <div className="popular-stat">
                  <span className="stat-value">⭐ {popularCharger.rating}</span>
                  <span className="stat-label">Rating</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Bookings */}
        <div className="analytics-card recent-bookings-card">
          <h3>Recent Bookings</h3>
          <div className="recent-bookings-list">
            {recentBookings.length === 0 ? (
              <p className="no-bookings">No bookings in the selected time range</p>
            ) : (
              recentBookings.map(booking => (
                <div key={booking.id} className="booking-item">
                  <div className="booking-info">
                    <div className="booking-station">{booking.charging_stations.name}</div>
                    <div className="booking-customer">
                      {booking.profiles?.full_name || 'Anonymous'}
                    </div>
                    <div className="booking-details">
                      {formatDate(booking.booking_date)} • {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                    </div>
                  </div>
                  <div className="booking-status">
                    <span className={`status-badge ${booking.status}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                    <span className="booking-cost">${booking.total_cost.toFixed(2)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostAnalytics;
