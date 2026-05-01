import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, LogOut, Check, X, Clock, UserCheck } from 'lucide-react';
import './OfficialDashboard.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const OfficialDashboard = () => {
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [pendingBillAccesses, setPendingBillAccesses] = useState([]);
  const [pendingStockOfficers, setPendingStockOfficers] = useState([]);
  const [pendingDistributeOfficers, setPendingDistributeOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('admins'); // 'admins', 'billing', 'stock', or 'distribute'
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllPending();
  }, []);

  const fetchAllPending = async () => {
    setLoading(true);
    try {
      const [adminRes, billRes, stockRes, distributeRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/pending`),
        fetch(`${API_BASE_URL}/api/bill-register-access/pending`),
        fetch(`${API_BASE_URL}/api/stock-officer-access/pending`),
        fetch(`${API_BASE_URL}/api/distribute-officer-access/pending`)
      ]);
      
      const adminData = await adminRes.json();
      const billData = await billRes.json();
      const stockData = await stockRes.json();
      const distributeData = await distributeRes.json();
      
      setPendingAdmins(adminData);
      setPendingBillAccesses(billData);
      setPendingStockOfficers(stockData);
      setPendingDistributeOfficers(distributeData);
    } catch (err) {
      setError('Failed to fetch pending requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAdmin = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/approve/${id}`, { method: 'PUT' });
      if (response.ok) {
        setPendingAdmins(pendingAdmins.filter(admin => admin.id !== id));
      }
    } catch (err) {
      console.error('Failed to approve admin', err);
    }
  };

  const handleRejectAdmin = async (id) => {
    if (!window.confirm('Are you sure you want to completely remove this candidate?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/reject/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setPendingAdmins(pendingAdmins.filter(admin => admin.id !== id));
      }
    } catch (err) {
      console.error('Failed to reject admin', err);
    }
  };

  const handleApproveBillAccess = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bill-register-access/approve/${id}`, { method: 'PUT' });
      if (response.ok) {
        setPendingBillAccesses(pendingBillAccesses.filter(access => access.id !== id));
      }
    } catch (err) {
      console.error('Failed to approve bill access', err);
    }
  };

  const handleRejectBillAccess = async (id) => {
    if (!window.confirm('Are you sure you want to completely remove this candidate?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/bill-register-access/reject/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setPendingBillAccesses(pendingBillAccesses.filter(access => access.id !== id));
      }
    } catch (err) {
      console.error('Failed to reject bill access', err);
    }
  };

  const handleApproveStockOfficer = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stock-officer-access/${id}/status`, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACTIVE' })
      });
      if (response.ok) {
        setPendingStockOfficers(pendingStockOfficers.filter(access => access.id !== id));
      }
    } catch (err) {
      console.error('Failed to approve stock officer', err);
    }
  };

  const handleRejectStockOfficer = async (id) => {
    if (!window.confirm('Are you sure you want to reject this candidate?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/stock-officer-access/${id}/status`, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED' })
      });
      if (response.ok) {
        setPendingStockOfficers(pendingStockOfficers.filter(access => access.id !== id));
      }
    } catch (err) {
      console.error('Failed to reject stock officer', err);
    }
  };

  const handleApproveDistributeOfficer = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/distribute-officer-access/${id}/status`, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACTIVE' })
      });
      if (response.ok) {
        setPendingDistributeOfficers(pendingDistributeOfficers.filter(access => access.id !== id));
      }
    } catch (err) {
      console.error('Failed to approve distribute officer', err);
    }
  };

  const handleRejectDistributeOfficer = async (id) => {
    if (!window.confirm('Are you sure you want to reject this candidate?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/distribute-officer-access/${id}/status`, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED' })
      });
      if (response.ok) {
        setPendingDistributeOfficers(pendingDistributeOfficers.filter(access => access.id !== id));
      }
    } catch (err) {
      console.error('Failed to reject distribute officer', err);
    }
  };

  const handleLogout = () => {
    navigate('/official-login');
  };

  const renderTable = (data, handleApprove, handleReject, isStockOfficer = false) => {
    if (data.length === 0) {
      return (
        <div className="empty-state">
          <UserCheck size={48} className="empty-icon" />
          <h3>All Caught Up!</h3>
          <p>There are no pending registrations to review.</p>
        </div>
      );
    }

    return (
      <table className="official-table">
        <thead>
          <tr>
            <th>Name</th>
            {isStockOfficer && <th>Officer Type</th>}
            <th>Email</th>
            <th>Phone</th>
            <th>Registration Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr key={item.id}>
              <td><strong>{item.name}</strong></td>
              {isStockOfficer && <td><span className="badge" style={{backgroundColor: '#e2e8f0', padding: '0.25rem 0.5rem', borderRadius: '0.25rem'}}>{item.officerType}</span></td>}
              <td>{item.email}</td>
              <td>{item.phone || item.phoneNumber || 'N/A'}</td>
              <td>{new Date(item.createdAt).toLocaleString()}</td>
              <td>
                <span className="status-badge pending">
                  <Clock size={14} /> Pending
                </span>
              </td>
              <td className="action-cell">
                <button 
                  className="btn-action approve" 
                  onClick={() => handleApprove(item.id)}
                  title="Approve Account"
                >
                  <Check size={18} /> Approve
                </button>
                <button 
                  className="btn-action reject" 
                  onClick={() => handleReject(item.id)}
                  title="Reject Account"
                >
                  <X size={18} /> Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="official-dashboard-wrapper">
      <nav className="official-navbar">
        <div className="navbar-brand">
          <ShieldCheck size={24} className="brand-icon" />
          <span>Higher Official Dashboard</span>
        </div>
        <button onClick={handleLogout} className="btn-logout">
          <LogOut size={18} /> Logout
        </button>
      </nav>

      <main className="dashboard-content">
        <div className="page-header">
          <h1>Pending Approvals</h1>
          <p>Review and authorize new accounts</p>
        </div>

        {error && <div className="error-alert">{error}</div>}

        <div className="tabs-container" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <button 
            className={`btn ${activeTab === 'admins' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('admins')}
          >
            Admission Admins ({pendingAdmins.length})
          </button>
          <button 
            className={`btn ${activeTab === 'billing' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('billing')}
          >
            Billing Staff ({pendingBillAccesses.length})
          </button>
          <button 
            className={`btn ${activeTab === 'stock' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('stock')}
          >
            Stock Officers ({pendingStockOfficers.length})
          </button>
          <button 
            className={`btn ${activeTab === 'distribute' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('distribute')}
          >
            Distribute Officers ({pendingDistributeOfficers.length})
          </button>
        </div>

        <div className="table-container glass-panel-dark">
          {loading ? (
            <div className="loading-state">Loading pending requests...</div>
          ) : (
            activeTab === 'admins' 
              ? renderTable(pendingAdmins, handleApproveAdmin, handleRejectAdmin)
              : activeTab === 'billing'
              ? renderTable(pendingBillAccesses, handleApproveBillAccess, handleRejectBillAccess)
              : activeTab === 'stock'
              ? renderTable(pendingStockOfficers, handleApproveStockOfficer, handleRejectStockOfficer, true)
              : renderTable(pendingDistributeOfficers, handleApproveDistributeOfficer, handleRejectDistributeOfficer)
          )}
        </div>
      </main>
    </div>
  );
};

export default OfficialDashboard;
