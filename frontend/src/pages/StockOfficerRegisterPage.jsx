import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Mail, Lock, Phone, User, LogIn, ChevronDown } from 'lucide-react';
import './RegisterPage.css'; // Reusing existing styles

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const StockOfficerRegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    officerType: ''
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.officerType) {
      setError('Please select an Officer Type');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/stock-officer-access/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          password: formData.password,
          officerType: formData.officerType
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setRegistrationSuccess(true);
        setTimeout(() => {
          navigate('/stock-login');
        }, 3000);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Failed to connect to the server');
    } finally {
      setIsLoading(false);
    }
  };

  if (registrationSuccess) {
    return (
      <div className="login-wrapper">
        <div className="login-container">
          <div className="login-card" style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="icon-container" style={{ margin: '0 auto 1.5rem', backgroundColor: '#e2ffe9', color: '#16a34a' }}>
              <Package size={32} />
            </div>
            <h2 style={{ color: '#16a34a' }}>Registration Successful!</h2>
            <p style={{ marginTop: '1rem', color: '#64748b' }}>
              Your stock officer account has been created and is pending approval from a higher official.
            </p>
            <p style={{ marginTop: '0.5rem', color: '#64748b', fontSize: '0.875rem' }}>
              Redirecting to login page...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="icon-container" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
              <Package size={32} />
            </div>
            <h2>Stock Officer Registration</h2>
            <p>Create your account for inventory tracking</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <User size={20} className="input-icon" />
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <Mail size={20} className="input-icon" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <Phone size={20} className="input-icon" />
              <input
                type="tel"
                name="phoneNumber"
                placeholder="Phone Number"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <Package size={20} className="input-icon" />
              <select
                name="officerType"
                value={formData.officerType}
                onChange={handleChange}
                required
                style={{ paddingLeft: '3rem', width: '100%', height: '3rem', border: '1px solid var(--border)', borderRadius: '0.5rem', backgroundColor: '#f8fafc', color: 'var(--text-dark)', appearance: 'none' }}
              >
                <option value="" disabled>Select Officer Role</option>
                <option value="Stock officer-1">Stock officer-1</option>
                <option value="Stock officer-2">Stock officer-2</option>
                <option value="Stock officer-3">Stock officer-3</option>
                <option value="Stock officer-4">Stock officer-4</option>
                <option value="Stock officer-5">Stock officer-5</option>
              </select>
              <ChevronDown size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
            </div>

            <div className="input-group">
              <Lock size={20} className="input-icon" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
              />
            </div>

            <div className="input-group">
              <Lock size={20} className="input-icon" />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength="6"
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-block"
              style={{ backgroundColor: '#d97706', border: 'none', gap: '0.5rem', display: 'flex' }}
              disabled={isLoading}
            >
              {isLoading ? 'Registering...' : (
                <>
                  <LogIn size={20} /> Register Account
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>Already have an account? <Link to="/stock-login" style={{ color: '#d97706' }}>Login here</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockOfficerRegisterPage;
