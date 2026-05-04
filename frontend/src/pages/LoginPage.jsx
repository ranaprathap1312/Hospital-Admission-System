import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, Lock, Mail, ArrowLeft } from 'lucide-react';
import './LoginPage.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    // Custom Validation
    const errors = {};
    if (!email) errors.email = 'Email is required';
    if (!password) errors.password = 'Password is required';
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    setError('');
    setSuccessMsg('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Store admin session info (including per-admin permissions)
        sessionStorage.setItem('adminId', data.adminId);
        sessionStorage.setItem('adminName', data.adminName);
        sessionStorage.setItem('adminEmail', data.adminEmail);
        sessionStorage.setItem('patientIdEditEnabled', data.patientIdEditEnabled ? 'true' : 'false');
        setSuccessMsg('Login successful! Redirecting...');
        setTimeout(() => navigate('/admin'), 1000);
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Could not connect to the server. Is the backend running?');
      console.error(err);
    }
  };

  return (
    <div className="login-wrapper">
      <Link to="/" className="back-link">
        <ArrowLeft size={20} /> {'Back to Home'}
      </Link>
      
      <div className="login-container glass-panel">
        <div className="login-header">
          <div className="logo-circle">
            <img src="/new_logo.jpg" alt="TN Logo" className="logo-icon-large" style={{ width: '64px', height: 'auto' }} />
          </div>
          <h2>{'Admin Portal'}</h2>
          <p>{'Sign in to manage admissions'}</p>
        </div>

        <form onSubmit={handleLogin} className="login-form" noValidate>
          {error && <div className="error-message">{error}</div>}
          {successMsg && <div className="success-message" style={{ backgroundColor: '#e6fffa', color: '#00a389', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', border: '1px solid #b2f5ea', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            {successMsg}
          </div>}
          <div className="form-group">
            <label>{'Email Address'}</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input 
                type="email" 
                placeholder={'Enter your email address'} 
                value={email}
                onChange={(e) => {
                setEmail(e.target.value);
                if (formErrors.email) setFormErrors(prev => ({...prev, email: null}));
              }}
                required
              />
            </div>
            {formErrors.email && <span className="error-text">{formErrors.email}</span>}
          </div>
          
          <div className="form-group">
            <label>{'Password'}</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input 
                type="password" 
                placeholder={'Enter your password'} 
                value={password}
                onChange={(e) => {
                setPassword(e.target.value);
                if (formErrors.password) setFormErrors(prev => ({...prev, password: null}));
              }}
                required
              />
            </div>
            {formErrors.password && <span className="error-text">{formErrors.password}</span>}
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" /> {'Remember me'}
            </label>
            <a href="#" className="forgot-password">{'Forgot password?'}</a>
          </div>

          <button type="submit" className="btn btn-primary btn-block">
            {'Sign In'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' }}>
            {'New admin candidate?'} <Link to="/register" style={{ fontWeight: '600' }}>{'Register here'}</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
