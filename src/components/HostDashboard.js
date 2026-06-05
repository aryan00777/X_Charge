import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Header from './Header';
import ChargerManagement from './ChargerManagement';
import HostAnalytics from './HostAnalytics';
import AddChargerModal from './AddChargerModal';
import './HostDashboard.css';

const HostDashboard = () => {
  const { user, profile, isHoster } = useAuth();
  const [activeTab, setActiveTab] = useState('chargers');
  const [showAddCharger, setShowAddCharger] = useState(false);
  const [chargers, setChargers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalChargers: 0,
    totalEarnings: 0,
    totalBookings: 0,
    averageRating: 0
  });

  useEffect(() => {
    if (isHoster && user) {
      fetchChargers();
      fetchStats();
    }
  }, [isHoster, user]);

  const fetchChargers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('charging_stations')
        .select('*')
        .eq('hoster_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChargers(data || []);
    } catch (error) {
      console.error('Error fetching chargers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch total chargers
      const { count: chargerCount } = await supabase
        .from('charging_stations')
        .select('*', { count: 'exact', head: true })
        .eq('hoster_id', user.id);

      // Fetch total earnings from completed bookings
      const { data: bookings } = await supabase
        .from('bookings')
        .select('total_cost')
        .eq('status', 'completed')
        .in('station_id', chargers.map(c => c.id));

      const totalEarnings = bookings?.reduce((sum, booking) => sum + booking.total_cost, 0) || 0;

      // Fetch total bookings
      const { count: bookingCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .in('station_id', chargers.map(c => c.id));

      // Calculate average rating
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .in('station_id', chargers.map(c => c.id));

      const averageRating = reviews?.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
        : 0;

      setStats({
        totalChargers: chargerCount || 0,
        totalEarnings: totalEarnings,
        totalBookings: bookingCount || 0,
        averageRating: Math.round(averageRating * 10) / 10
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleAddCharger = () => {
    setShowAddCharger(true);
  };

  const handleChargerAdded = () => {
    setShowAddCharger(false);
    fetchChargers();
    fetchStats();
  };

  const handleChargerUpdated = () => {
    fetchChargers();
    fetchStats();
  };

  const handleChargerDeleted = () => {
    fetchChargers();
    fetchStats();
  };

  if (!isHoster) {
    return (
      <div className="host-dashboard">
        <Header />
        <div className="unauthorized">
          <h2>Access Denied</h2>
          <p>You need to be a host to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="host-dashboard">
      <Header />
      
      <div className="dashboard-container">
        {/* Welcome Section */}
        <div className="welcome-section">
          <div className="welcome-content">
            <h1>Welcome back, {profile?.full_name || 'Host'}!</h1>
            <p>Manage your charging stations and track your earnings</p>
          </div>
          <button className="add-charger-btn" onClick={handleAddCharger}>
            <span className="btn-icon">+</span>
            Add New Charger
          </button>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🔌</div>
            <div className="stat-content">
              <h3>{stats.totalChargers}</h3>
              <p>Active Chargers</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>${stats.totalEarnings.toFixed(2)}</h3>
              <p>Total Earnings</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <h3>{stats.totalBookings}</h3>
              <p>Total Bookings</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <h3>{stats.averageRating}</h3>
              <p>Average Rating</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'chargers' ? 'active' : ''}`}
            onClick={() => setActiveTab('chargers')}
          >
            My Chargers
          </button>
          <button 
            className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'chargers' && (
            <ChargerManagement 
              chargers={chargers}
              loading={loading}
              onChargerUpdated={handleChargerUpdated}
              onChargerDeleted={handleChargerDeleted}
            />
          )}
          {activeTab === 'analytics' && (
            <HostAnalytics 
              chargers={chargers}
              stats={stats}
            />
          )}
        </div>
      </div>

      {/* Add Charger Modal */}
      {showAddCharger && (
        <AddChargerModal 
          onClose={() => setShowAddCharger(false)}
          onChargerAdded={handleChargerAdded}
        />
      )}
    </div>
  );
};

export default HostDashboard;
