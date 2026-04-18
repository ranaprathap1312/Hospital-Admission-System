import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, LogOut, Check, X, Clock, UserCheck } from 'lucide-react';
import './OfficialDashboard.css';

const OfficialDashboard = () => {
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPendingAdmins();
  }, []);

  const fetchPendingAdmins = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/admin/pending');
      const data = await response.json();
      setPendingAdmins(data);
    } catch (err) {
      setError('Failed to fetch pending requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/api/admin/approve/${id}`, {
        method: 'PUT'
      });
      if (response.ok) {
        setPendingAdmins(pendingAdmins.filter(admin => admin.id !== id));
      }
    } catch (err) {
      console.error('Failed to approve admin', err);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to completely remove this candidate?')) return;
    try {
      const response = await fetch(`http://localhost:8080/api/admin/reject/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setPendingAdmins(pendingAdmins.filter(admin => admin.id !== id));
      }
    } catch (err) {
      console.error('Failed to reject admin', err);
    }
  };

  const handleLogout = () => {
    navigate('/official-login');
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
          <p>Review and authorize new administrator accounts</p>
        </div>

        {error && <div className="error-alert">{error}</div>}

        <div className="table-container glass-panel-dark">
          {loading ? (
            <div className="loading-state">Loading pending requests...</div>
          ) : pendingAdmins.length === 0 ? (
            <div className="empty-state">
              <UserCheck size={48} className="empty-icon" />
              <h3>All Caught Up!</h3>
              <p>There are no pending admin registrations to review.</p>
            </div>
          ) : (
            <table className="official-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Registration Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingAdmins.map(admin => (
                  <tr key={admin.id}>
                    <td>
                      <strong>{admin.name}</strong>
                    </td>
                    <td>{admin.email}</td>
                    <td>{admin.phone || 'N/A'}</td>
                    <td>{new Date(admin.createdAt).toLocaleString()}</td>
                    <td>
                      <span className="status-badge pending">
                        <Clock size={14} /> Pending
                      </span>
                    </td>
                    <td className="action-cell">
                      <button 
                        className="btn-action approve" 
                        onClick={() => handleApprove(admin.id)}
                        title="Approve Account"
                      >
                        <Check size={18} /> Approve
                      </button>
                      <button 
                        className="btn-action reject" 
                        onClick={() => handleReject(admin.id)}
                        title="Reject Account"
                      >
                        <X size={18} /> Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default OfficialDashboard;
