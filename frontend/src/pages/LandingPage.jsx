import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ShieldPlus, Activity, Stethoscope, ChevronRight, ChevronDown, Users, Truck, Settings, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './LandingPage.css';

const LandingPage = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const settingsRef = useRef(null);
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsSettingsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setIsSettingsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="landing-wrapper">
      {/* Navbar */}
      <nav className="navbar glass-panel">
        <div className="container flex-between">
          <div className="logo">
            <Activity className="logo-icon" />
            <span className="logo-text">{t('hospital_name', 'GOVT HOSPITAL VIRUDHACHALAM')}</span>
          </div>
          <div className="nav-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            
            <div className="dropdown-container" ref={settingsRef}>
              <button 
                className="btn btn-outline" 
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.6rem 1rem', background: 'white' }}
              >
                <Settings size={18} /> {t('settings', 'Settings')} <ChevronDown size={18} />
              </button>
              
              {isSettingsOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-header" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>
                    <Globe size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} /> {t('language', 'Language')}
                  </div>
                  <button className={`dropdown-item ${i18n.language === 'en' ? 'active-lang' : ''}`} onClick={() => changeLanguage('en')} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}>{t('english', 'English')}</button>
                  <button className={`dropdown-item ${i18n.language === 'ta' ? 'active-lang' : ''}`} onClick={() => changeLanguage('ta')} style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}>{t('tamil', 'Tamil')}</button>
                </div>
              )}
            </div>

            <div className="dropdown-container" ref={dropdownRef}>
              <button 
                className="btn btn-primary" 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              >
                {t('login_button', 'Login')} <ChevronDown size={18} />
              </button>
              
              {isDropdownOpen && (
                <div className="dropdown-menu">
                  <Link to="/official-login" className="dropdown-item">{t('higher_official_login', 'Higher Official Login')}</Link>
                  <Link to="/login" className="dropdown-item">{t('admission_login', 'Admission Login')}</Link>
                  <Link to="/bill-login" className="dropdown-item">{t('bill_register_login', 'Bill Register Login')}</Link>
                  <Link to="/stock-login" className="dropdown-item">{t('stock_officer_login', 'Stock Officer Login')}</Link>
                  <Link to="/distribute-login" className="dropdown-item">{t('distribute_officer_login', 'Distribute Officer Login')}</Link>
                  <Link to="/assistant-login" className="dropdown-item">{t('assistant_login', 'Assistant Login')}</Link>
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
            <div className="badge">{t('modern_healthcare', 'Modern Healthcare')}</div>
            <h1 className="hero-title">{t('welcome_title', 'WELCOME TO GOVT HOSPITAL VIRUDHACHALAM')}</h1>
            <p className="hero-subtitle">
              {t('welcome_subtitle', 'Streamlining patient admissions, optimizing hospital workflows, and delivering the best care possible with our state-of-the-art management system.')}
            </p>
            <div className="hero-buttons">
              <button className="btn btn-primary btn-large" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                {t('access_portal', 'Access Portal')} <ChevronRight size={20} />
              </button>
            </div>
          </div>
          <div className="hero-image-area">
            <div className="glass-card floating-card">
              <div className="card-header">
                <ShieldPlus className="card-icon" />
                <h3>{t('secure_system_title', 'Secure System')}</h3>
              </div>
              <p>{t('secure_system_desc', 'End-to-end encrypted patient records and fast admission workflows.')}</p>
            </div>
            <div className="glass-card floating-card delay-1">
              <div className="card-header">
                <Stethoscope className="card-icon" />
                <h3>{t('expert_care_title', 'Expert Care')}</h3>
              </div>
              <p>{t('expert_care_desc', 'Connecting patients with specialized doctors instantly.')}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} {t('footer_text', 'GOVT HOSPITAL VIRUDHACHALAM - Hospital Admission System. All rights reserved.')}</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
