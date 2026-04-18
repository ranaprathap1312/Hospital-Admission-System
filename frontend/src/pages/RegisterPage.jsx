import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, Lock, Mail, User, Phone, ArrowLeft, CheckCircle2 } from 'lucide-react';
import './RegisterPage.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    otp: ''
  });
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Workflow states
  const [otpSent, setOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSendOtp = async () => {
    if (!formData.email) {
      setError("Please enter your email address first.");
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/generate-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setOtpSent(true);
        setSuccessMsg(data.message);
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Could not connect to the server.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!formData.otp) {
      setError("Please enter the OTP.");
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp: formData.otp })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsVerified(true);
        setSuccessMsg("Email verified successfully! You can now set your password.");
      } else {
        setError(data.message || 'Invalid OTP');
      }
    } catch (err) {
      setError('Could not connect to the server.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    // Temporarily disabled OTP verification check
    // if (!isVerified) return;

    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const submitData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      };

      const response = await fetch(`${API_BASE_URL}/api/admin/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccessMsg('Registration successful! Redirecting to login...');
        setTimeout(() => navigate('/login'), 1500); 
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Could not connect to the server.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-wrapper">
      <Link to="/login" className="back-link">
        <ArrowLeft size={20} /> Back to Login
      </Link>
      
      <div className="register-container glass-panel">
        <div className="register-header">
          <div className="logo-circle">
            <Activity className="logo-icon-large" />
          </div>
          <h2>Admin Registration</h2>
          <p>Create a new hospital administrator account</p>
        </div>

        <div className="register-form">
          {error && <div className="error-message">{error}</div>}
          {successMsg && <div className="success-message-banner">{successMsg}</div>}
          
          <div className="form-group">
            <label>Full Name</label>
            <div className="input-wrapper">
              <User className="input-icon" size={18} />
              <input 
                type="text" 
                name="name"
                placeholder="Enter full name" 
                value={formData.name}
                onChange={handleChange}
                // disabled={isVerified} // Temporarily disabled OTP check
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input 
                type="email" 
                name="email"
                placeholder="Enter email address" 
                value={formData.email}
                onChange={handleChange}
                // disabled={otpSent || isVerified} // Temporarily disabled OTP check
              />
            </div>
            {/* Temporarily hidden OTP send button
            {!otpSent && !isVerified && (
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={handleSendOtp}
                disabled={isSubmitting || !formData.email}
                style={{ marginTop: '0.5rem' }}
              >
                {isSubmitting ? 'Sending...' : 'Send OTP to Email'}
              </button>
            )}
            */}
          </div>

          {/* Temporarily disabled OTP section
          {otpSent && !isVerified && (
            <div className="form-group otp-section">
              <label>Enter Verification Code</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  name="otp"
                  placeholder="6-digit code" 
                  value={formData.otp}
                  onChange={handleChange}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc' }}
                  maxLength="6"
                />
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleVerifyOtp}
                  disabled={isSubmitting || formData.otp.length !== 6}
                >
                  Verify OTP
                </button>
              </div>
            </div>
          )}

          {isVerified && (
            <div className="verified-badge" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#36b37e', marginBottom: '1rem' }}>
              <CheckCircle2 size={20} /> Email successfully verified!
            </div>
          )}
          */}

          {/* Removed opacity and pointerEvents lock */}
          <div className="form-group">
            <label>Phone Number</label>
            <div className="input-wrapper">
              <Phone className="input-icon" size={18} />
              <input 
                type="tel" 
                name="phone"
                placeholder="Enter phone number" 
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="form-row-compact">
            <div className="form-group">
              <label>Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input 
                  type="password" 
                  name="password"
                  placeholder="Create password" 
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input 
                  type="password" 
                  name="confirmPassword"
                  placeholder="Confirm password" 
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <button 
            type="button" 
            className="btn btn-primary btn-block" 
            onClick={handleRegister}
            disabled={isSubmitting} // Temporarily removed !isVerified check
          >
            {isSubmitting ? 'Registering...' : 'Register Account'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
