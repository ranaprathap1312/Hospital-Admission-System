import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, Lock, Mail, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './OfficialLoginPage.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const OfficialLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: Email/Pass, 2: OTP
  const { t } = useTranslation();

  const navigate = useNavigate();

  const handleLoginStep1 = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/official/login-step1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStep(2);
        setSuccessMsg(t('credentials_accepted', "Credentials accepted. An OTP has been sent to your email."));
      } else {
        setError(data.message || t('invalid_credentials_unauthorized', 'Invalid credentials or unauthorized'));
      }
    } catch (err) {
      setError(t('server_error', 'Could not connect to the server.'));
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setSuccessMsg('');
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/official/login-step1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccessMsg(t('new_otp_sent', "A new OTP has been sent to your email."));
      } else {
        setError(data.message || t('failed_resend_otp', 'Failed to resend OTP.'));
      }
    } catch (err) {
      setError(t('server_error', 'Could not connect to the server.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginStep2 = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/official/login-step2`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // In a real app, you'd save a token here
        console.log('Official Login successful');
        navigate('/official-dashboard');
      } else {
        setError(data.message || t('invalid_otp', 'Invalid OTP'));
      }
    } catch (err) {
      setError(t('server_error', 'Could not connect to the server.'));
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="official-login-wrapper">
      <Link to="/" className="back-link dark">
        <ArrowLeft size={20} /> {t('back_to_home', 'Back to Home')}
      </Link>
      
      <div className="login-container glass-panel official-panel">
        <div className="login-header">
          <div className="logo-circle danger-circle">
            <img src="/new_logo.jpg" alt="TN Logo" className="logo-icon-large" style={{ width: '64px', height: 'auto' }} />
          </div>
          <h2>{t('higher_official_portal', 'Higher Official Portal')}</h2>
          <p>{t('super_admin_access', 'Super Admin access requires 2-Factor Authentication')}</p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleLoginStep1} className="login-form" noValidate>
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-group">
              <label>{t('official_email', 'Official Email Address')}</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={18} />
                <input 
                  type="email" 
                  placeholder={t('enter_official_email', 'Enter official email')} 
                  value={email}
                  onChange={(e) => {
                setEmail(e.target.value);
                if (formErrors.email) setFormErrors(prev => ({...prev, email: null}));
              }}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>{t('master_password', 'Master Password')}</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input 
                  type="password" 
                  placeholder={t('enter_master_password', 'Enter master password')} 
                  value={password}
                  onChange={(e) => {
                setPassword(e.target.value);
                if (formErrors.password) setFormErrors(prev => ({...prev, password: null}));
              }}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-danger btn-block" disabled={isSubmitting}>
              {isSubmitting ? t('verifying', 'Verifying...') : t('verify_credentials', 'Verify Credentials & Send OTP')}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLoginStep2} className="login-form">
            {error && <div className="error-message">{error}</div>}
            {successMsg && <div className="success-message-banner">{successMsg}</div>}
            
            <div className="form-group otp-section">
              <label>{t('enter_6_digit_otp', 'Enter 6-Digit OTP from Email')}</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  placeholder="000000" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength="6"
                  required
                  autoFocus
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc', textAlign: 'center', fontSize: '1.25rem', letterSpacing: '0.2em' }}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-danger btn-block" disabled={isSubmitting || otp.length !== 6}>
              {isSubmitting ? t('authenticating', 'Authenticating...') : t('secure_login', 'Secure Login')}
            </button>
            
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button 
                type="button" 
                onClick={handleResendOtp} 
                disabled={isSubmitting}
                style={{ background: 'none', border: 'none', color: '#9ca3af', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.875rem' }}
              >
                {t('resend_otp', "Didn't receive code? Resend OTP")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default OfficialLoginPage;
