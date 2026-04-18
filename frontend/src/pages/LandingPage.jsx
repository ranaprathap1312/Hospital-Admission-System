import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldPlus, Activity, Stethoscope, ChevronRight } from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-wrapper">
      {/* Navbar */}
      <nav className="navbar glass-panel">
        <div className="container flex-between">
          <div className="logo">
            <Activity className="logo-icon" />
            <span className="logo-text">TN GH</span>
          </div>
          <div className="nav-actions">
            <Link to="/official-login" className="btn btn-outline" style={{ marginRight: '1rem' }}>
              Official
            </Link>
            <Link to="/login" className="btn btn-primary">
              Admission login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero">
        <div className="hero-background"></div>
        <div className="container hero-content">
          <div className="hero-text-area">
            <div className="badge">Modern Healthcare</div>
            <h1 className="hero-title">Welcome to TN GH</h1>
            <p className="hero-subtitle">
              Streamlining patient admissions, optimizing hospital workflows, and delivering the best care possible with our state-of-the-art management system.
            </p>
            <div className="hero-buttons">
              <Link to="/login" className="btn btn-primary btn-large">
                Access Portal <ChevronRight size={20} />
              </Link>
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
          <p>&copy; {new Date().getFullYear()} TN GH - Hospital Admission System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
