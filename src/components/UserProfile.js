import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import './UserProfile.css';

const UserProfile = ({ isOpen, onClose }) => {
  const { user, profile, signOut, updateProfile } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || ''
  });
  const [loading, setLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await updateProfile(formData);
      if (error) {
        showError('Error updating profile: ' + error.message);
      } else {
        setIsEditing(false);
        showSuccess('Profile updated successfully!');
      }
    } catch (err) {
      showError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLogoutLoading(true);
    try {
      await signOut();
      onClose();
    } catch (error) {
      showError('Failed to sign out. Please try again.');
    } finally {
      setLogoutLoading(false);
    }
  };

  console.log('UserProfile render check:', { isOpen, user: !!user, profile: !!profile });
  
  if (!isOpen || !user) {
    console.log('UserProfile not rendering because:', { isOpen, user: !!user, profile: !!profile });
    return null;
  }

  // If profile is not loaded yet, show a loading state
  if (!profile) {
    return (
      <div className="profile-overlay" onClick={onClose}>
        <div className="profile-content" onClick={(e) => e.stopPropagation()}>
          <div className="profile-header">
            <h2>Loading Profile...</h2>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
          <div className="profile-body">
            <p>Loading your profile information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-overlay" onClick={onClose}>
      <div className="profile-content" onClick={(e) => e.stopPropagation()}>
        <div className="profile-header">
          <h2>User Profile</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="profile-body">
          <div className="profile-info">
            <div className="info-item">
              <label>Email:</label>
              <span>{user.email}</span>
            </div>
            
            <div className="info-item">
              <label>Role:</label>
              <span className={`role-badge ${profile.role}`}>
                {profile.role === 'customer' ? 'Customer' : 'Hoster'}
              </span>
            </div>
            
            <div className="info-item">
              <label>Full Name:</label>
              {isEditing ? (
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                />
              ) : (
                <span>{profile.full_name || 'Not provided'}</span>
              )}
            </div>
            
            <div className="info-item">
              <label>Phone:</label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              ) : (
                <span>{profile.phone || 'Not provided'}</span>
              )}
            </div>
            
            <div className="info-item">
              <label>Member Since:</label>
              <span>{new Date(profile.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="profile-actions">
            {isEditing ? (
              <div className="edit-actions">
                <button 
                  className="save-btn"
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  className="cancel-btn"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      full_name: profile.full_name || '',
                      phone: profile.phone || ''
                    });
                  }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button 
                className="edit-btn"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
            )}
            
            <button 
              className="signout-btn"
              onClick={handleSignOut}
              disabled={logoutLoading}
            >
              {logoutLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Signing Out...
                </>
              ) : (
                'Sign Out'
              )}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default UserProfile;
