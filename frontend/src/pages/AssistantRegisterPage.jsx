import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, Lock, User, Mail, Phone, CheckCircle2, AlertCircle } from 'lucide-react';
import './LoginPage.css'; 

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const AssistantRegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    assistantType: 'A1'
  });
  
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/assistant-access/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus({ type: 'success', message: data.message });
        setTimeout(() => {
          navigate('/assistant-login');
        }, 3000);
      } else {
        setStatus({ type: 'error', message: data.message || 'Registration failed' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'Failed to connect to the server' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container" style={{ maxWidth: '500px' }}>
        <div className="login-card">
          <div className="login-header">
            <div className="icon-container" style={{ backgroundColor: '#fce7f3', color: '#be185d' }}>
              <Users size={32} />
            </div>
            <h2>Assistant Registration</h2>
            <p>Create an account to access tasks</p>
          </div>

          {status.message && (
            <div className={`message-banner ${status.type}`}>
              {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span>{status.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <User size={20} className="input-icon" />
              <input
                type="text"
                name="name"
                placeholder="Full Name *"
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
                placeholder="Email Address *"
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
                placeholder="Phone Number *"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <Lock size={20} className="input-icon" />
              <input
                type="password"
                name="password"
                placeholder="Create Password *"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group select-group">
              <Users size={20} className="input-icon" />
              <select 
                name="assistantType" 
                value={formData.assistantType} 
                onChange={handleChange}
                required
              >
                <option value="A1">Assistant 1 (A1)</option>
                <option value="A2">Assistant 2 (A2)</option>
                <option value="A3">Assistant 3 (A3)</option>
              </select>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-block"
              style={{ backgroundColor: '#be185d', border: 'none', marginTop: '1rem' }}
              disabled={isLoading}
            >
              {isLoading ? 'Registering...' : 'Register Account'}
            </button>
          </form>

          <div className="login-footer">
            <p>Already registered? <Link to="/assistant-login" style={{ color: '#be185d' }}>Login here</Link></p>
            <Link to="/" className="back-link">Return to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssistantRegisterPage;
