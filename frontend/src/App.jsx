import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import RegisterPage from './pages/RegisterPage';
import OfficialLoginPage from './pages/OfficialLoginPage';
import OfficialDashboard from './pages/OfficialDashboard';
import DischargePage from './pages/DischargePage';
import BillRegisterLoginPage from './pages/BillRegisterLoginPage';
import BillRegisterRegisterPage from './pages/BillRegisterRegisterPage';
import BillDashboard from './pages/BillDashboard';
import StockOfficerLoginPage from './pages/StockOfficerLoginPage';
import StockOfficerRegisterPage from './pages/StockOfficerRegisterPage';
import StockOfficerDashboard from './pages/StockOfficerDashboard';
import DistributeOfficerLoginPage from './pages/DistributeOfficerLoginPage';
import DistributeOfficerRegisterPage from './pages/DistributeOfficerRegisterPage';
import DistributeOfficerDashboard from './pages/DistributeOfficerDashboard';
import tnLogo from '../asserts/tn_logo.jpg';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
          <img src={tnLogo} alt="Tamil Nadu Government Logo" className="tn-logo" />
          <h1 className="header-title">Government Hospital Virudhachalam</h1>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/official-login" element={<OfficialLoginPage />} />
            <Route path="/official-dashboard" element={<OfficialDashboard />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
            <Route path="/discharge" element={<DischargePage />} />
            <Route path="/bill-login" element={<BillRegisterLoginPage />} />
            <Route path="/bill-register" element={<BillRegisterRegisterPage />} />
            <Route path="/bill-dashboard" element={<BillDashboard />} />
            <Route path="/stock-login" element={<StockOfficerLoginPage />} />
            <Route path="/stock-register" element={<StockOfficerRegisterPage />} />
            <Route path="/stock-dashboard" element={<StockOfficerDashboard />} />
            <Route path="/distribute-login" element={<DistributeOfficerLoginPage />} />
            <Route path="/distribute-register" element={<DistributeOfficerRegisterPage />} />
            <Route path="/distribute-dashboard" element={<DistributeOfficerDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
