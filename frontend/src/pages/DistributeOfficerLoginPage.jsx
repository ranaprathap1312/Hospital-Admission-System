import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Truck, Lock, User, LogIn, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './LoginPage.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const DistributeOfficerLoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/distribute-officer-access/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('distributeOfficerName', data.name);
        navigate('/distribute-dashboard');
      } else {
        setError(data.message || t('invalid_credentials', 'Invalid credentials'));
      }
    } catch (err) {
      setError(t('server_error', 'Failed to connect to the server'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="icon-container" style={{ backgroundColor: '#e0e7ff', color: '#4338ca' }}>
              <Truck size={32} />
            </div>
            <h2>{t('distribute_officer_login_title', 'Distribute Officer Login')}</h2>
            <p>{t('access_distributed_bills', 'Access your distributed bills & inventory')}</p>
          </div>

          {error && (
            <div className="error-message">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <User size={20} className="input-icon" />
              <input
                type="text"
                placeholder={t('email_or_phone', 'Email or Phone Number')}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <Lock size={20} className="input-icon" />
              <input
                type="password"
                placeholder={t('password', 'Password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-block"
              style={{ backgroundColor: '#4338ca', border: 'none', gap: '0.5rem', display: 'flex' }}
              disabled={isLoading}
            >
              {isLoading ? t('logging_in', 'Logging in...') : (
                <>
                  <LogIn size={20} /> {t('login_button', 'Login')}
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>{t('new_officer', 'New officer?')} <Link to="/distribute-register" style={{ color: '#4338ca' }}>{t('register_here', 'Register here')}</Link></p>
            <Link to="/" className="back-link">{t('return_to_home', 'Return to Home')}</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistributeOfficerLoginPage;
