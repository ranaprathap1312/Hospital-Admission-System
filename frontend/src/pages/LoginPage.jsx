import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, Lock, Mail, ArrowLeft } from 'lucide-react';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await fetch('http://localhost:8080/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('Login successful');
        navigate('/admin');
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
        <ArrowLeft size={20} /> Back to Home
      </Link>
      
      <div className="login-container glass-panel">
        <div className="login-header">
          <div className="logo-circle">
            <Activity className="logo-icon-large" />
          </div>
          <h2>Admin Portal</h2>
          <p>Sign in to manage admissions</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input 
                type="email" 
                placeholder="Enter your email address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input 
                type="password" 
                placeholder="Enter your password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" /> Remember me
            </label>
            <a href="#" className="forgot-password">Forgot password?</a>
          </div>

          <button type="submit" className="btn btn-primary btn-block">
            Sign In
          </button>

          <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem' }}>
            New admin candidate? <Link to="/register" style={{ fontWeight: '600' }}>Register here</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
