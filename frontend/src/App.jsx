import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import RegisterPage from './pages/RegisterPage';
import OfficialLoginPage from './pages/OfficialLoginPage';
import OfficialDashboard from './pages/OfficialDashboard';
import DischargePage from './pages/DischargePage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <div className="global-print-header" style={{ display: 'none', flexDirection: 'column', alignItems: 'center' }}>
          <img src="/tn_logo.png" alt="Tamil Nadu Logo" style={{ width: '80px', height: 'auto', marginBottom: '10px' }} />
          <div>WELCOME TO GOVT HOSPITAL VIRUDHACHALAM</div>
        </div>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/official-login" element={<OfficialLoginPage />} />
          <Route path="/official-dashboard" element={<OfficialDashboard />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="/discharge" element={<DischargePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
