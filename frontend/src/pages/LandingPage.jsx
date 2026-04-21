import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldPlus, Activity, Stethoscope, ChevronRight, ChevronDown } from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  return (
    <div className="landing-wrapper">
      {/* Navbar */}
      <nav className="navbar glass-panel">
        <div className="container flex-between">
          <div className="logo">
            <Activity className="logo-icon" />
            <span className="logo-text">GOVT HOSPITAL VIRUDHACHALAM</span>
          </div>
          <div className="nav-actions">
            <div className="dropdown-container">
              <button 
                className="btn btn-primary" 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                Login <ChevronDown size={18} />
              </button>
              
              {isDropdownOpen && (
                <div className="dropdown-menu">
                  <Link to="/official-login" className="dropdown-item">Higher Official Login</Link>
                  <Link to="/login" className="dropdown-item">Admission Login</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero">
        <div className="hero-background"></div>
        <div className="container hero-content">
          <div className="hero-text-area">
            <div className="badge">Modern Healthcare</div>
            <h1 className="hero-title">WELCOME TO GOVT HOSPITAL VIRUDHACHALAM</h1>
            <p className="hero-subtitle">
              Streamlining patient admissions, optimizing hospital workflows, and delivering the best care possible with our state-of-the-art management system.
            </p>
            <div className="hero-buttons">
              <button className="btn btn-primary btn-large" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                Access Portal <ChevronRight size={20} />
              </button>
            </div>
          </div>
          <div className="hero-image-area">
            <div className="glass-card floating-card">
              <div className="card-header">
                <ShieldPlus className="card-icon" />
                <h3>Secure System</h3>
              </div>
              <p>End-to-end encrypted patient records and fast admission workflows.</p>
            </div>
            <div className="glass-card floating-card delay-1">
              <div className="card-header">
                <Stethoscope className="card-icon" />
                <h3>Expert Care</h3>
              </div>
              <p>Connecting patients with specialized doctors instantly.</p>
            </div>
          </div>
        </div>
      </header>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} GOVT HOSPITAL VIRUDHACHALAM - Hospital Admission System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
