import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import UserProfile from './UserProfile';
import './Header.css';

const Header = ({ onLoginClick }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { user, profile, signOut } = useAuth();

  const closeMenu = () => setMenuOpen(false);

  const handleProfileClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Profile clicked!', { user: !!user, profile: !!profile, showProfile });
    setShowProfile(true);
    closeMenu();
  };

  return (
    <>
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/" className="logo-link">
            <h1>XCharge</h1>
          </Link>
        </div>
        <button
          className={`menu-toggle${menuOpen ? ' active' : ''}`}
          aria-label="Toggle navigation menu"
          aria-controls="primary-navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(prev => !prev)}
        >
          <span className="menu-bar" />
          <span className="menu-bar" />
          <span className="menu-bar" />
        </button>
        <nav
          id="primary-navigation"
          className={`navigation${menuOpen ? ' open' : ''}`}
        >
          <Link to="/" className="nav-link" onClick={closeMenu}>Home</Link>
          <Link to="/host" className="nav-link" onClick={closeMenu}>Host a Charger</Link>
          <Link to="/pricing" className="nav-link" onClick={closeMenu}>Pricing</Link>
          <Link to="/support" className="nav-link" onClick={closeMenu}>Support</Link>
          
          {user ? (
            <div className="user-menu">
              <button 
                className="nav-link user-btn" 
                onClick={handleProfileClick}
              >
                <span className="user-avatar">
                  {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </span>
                <span className="user-name">
                  {profile?.full_name || user.email.split('@')[0]}
                </span>
              </button>
            </div>
          ) : (
            <button className="nav-link login-btn" onClick={() => { closeMenu(); onLoginClick && onLoginClick(); }}>
              Login | Signup
            </button>
          )}
        </nav>
      </div>
    </header>
    
    <UserProfile 
      isOpen={showProfile}
      onClose={() => setShowProfile(false)}
    />
    
  </>
  );
};

export default Header;
