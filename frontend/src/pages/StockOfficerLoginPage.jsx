import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Lock, User, LogIn, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './LoginPage.css'; // Reusing existing styles

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const StockOfficerLoginPage = () => {
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
      const response = await fetch(`${API_BASE_URL}/api/stock-officer-access/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // You could store the officerType and name in localStorage here
        localStorage.setItem('stockOfficerType', data.officerType);
        localStorage.setItem('stockOfficerName', data.name);
        navigate('/stock-dashboard');
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
            <div className="icon-container" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
              <Package size={32} />
            </div>
            <h2>{t('stock_officer_login_title', 'Stock Officer Login')}</h2>
            <p>{t('access_inventory', 'Access your assigned inventory & bills')}</p>
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
              style={{ backgroundColor: '#d97706', border: 'none', gap: '0.5rem', display: 'flex' }}
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
            <p>{t('new_officer', 'New officer?')} <Link to="/stock-register" style={{ color: '#d97706' }}>{t('register_here', 'Register here')}</Link></p>
            <Link to="/" className="back-link">{t('return_to_home', 'Return to Home')}</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockOfficerLoginPage;
