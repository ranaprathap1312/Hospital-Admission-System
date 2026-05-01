import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, LogOut, Check, X, Clock, UserCheck } from 'lucide-react';
import './OfficialDashboard.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const OfficialDashboard = () => {
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [grantedAdmins, setGrantedAdmins] = useState([]);
  const [pendingBillAccesses, setPendingBillAccesses] = useState([]);
  const [pendingStockOfficers, setPendingStockOfficers] = useState([]);
  const [pendingDistributeOfficers, setPendingDistributeOfficers] = useState([]);
  const [pendingAssistants, setPendingAssistants] = useState([]);
  const [manualEditEnabled, setManualEditEnabled] = useState(false);
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
      const [adminRes, billRes, stockRes, distributeRes, assistantRes, manualEditRes, grantedAdminsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/pending`),
        fetch(`${API_BASE_URL}/api/bill-register-access/pending`),
        fetch(`${API_BASE_URL}/api/stock-officer-access/pending`),
        fetch(`${API_BASE_URL}/api/distribute-officer-access/pending`),
        fetch(`${API_BASE_URL}/api/assistant-access/pending`),
        fetch(`${API_BASE_URL}/api/manual-edit-control`),
        fetch(`${API_BASE_URL}/api/admin/granted`)
      ]);
      
      const adminData = await adminRes.json();
      const billData = await billRes.json();
      const stockData = await stockRes.json();
      const distributeData = await distributeRes.json();
      const assistantData = await assistantRes.json();
      const manualEditData = await manualEditRes.json();
      const grantedAdminsData = await grantedAdminsRes.json();
      
      setPendingAdmins(adminData);
      setGrantedAdmins(grantedAdminsData);
      setPendingBillAccesses(billData);
      setPendingStockOfficers(stockData);
      setPendingDistributeOfficers(distributeData);
      setPendingAssistants(assistantData);
      setManualEditEnabled(manualEditData.isEnabled);
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

  const handleTogglePause = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/toggle-pause/${id}`, { method: 'PUT' });
      if (response.ok) {
        const res = await fetch(`${API_BASE_URL}/api/admin/granted`);
        setGrantedAdmins(await res.json());
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to toggle pause');
      }
    } catch (err) {
      console.error('Failed to toggle pause', err);
    }
  };

  const handleRemoveGranted = async (id) => {
    if (!window.confirm('Are you sure you want to completely remove this granted user?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/remove/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setGrantedAdmins(grantedAdmins.filter(admin => admin.id !== id));
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to remove user');
      }
    } catch (err) {
      console.error('Failed to remove granted user', err);
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

  const handleApproveAssistant = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/assistant-access/${id}/status`, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACTIVE' })
      });
      if (response.ok) {
        setPendingAssistants(pendingAssistants.filter(access => access.id !== id));
      }
    } catch (err) {
      console.error('Failed to approve assistant', err);
    }
  };

  const handleRejectAssistant = async (id) => {
    if (!window.confirm('Are you sure you want to reject this candidate?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/assistant-access/${id}/status`, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED' })
      });
      if (response.ok) {
        setPendingAssistants(pendingAssistants.filter(access => access.id !== id));
      }
    } catch (err) {
      console.error('Failed to reject assistant', err);
    }
  };

  const handleLogout = () => {
    navigate('/official-login');
  };

  const toggleManualEdit = async (enable) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/manual-edit-control`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isEnabled: enable })
      });
      if (response.ok) {
        setManualEditEnabled(enable);
      }
    } catch (err) {
      console.error('Failed to update manual edit access', err);
    }
  };

  const renderTable = (data, handleApprove, handleReject, typeField = null, typeLabel = 'Role') => {
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
            {typeField && <th>{typeLabel}</th>}
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
              {typeField && <td><span className="badge" style={{backgroundColor: '#e2e8f0', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', color: '#1e293b', fontWeight: '500'}}>{item[typeField]}</span></td>}
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

  const renderGrantedTable = (data) => {
    if (data.length === 0) {
      return (
        <div className="empty-state">
          <UserCheck size={48} className="empty-icon" />
          <h3>No Granted Users</h3>
          <p>There are no users with granted access yet.</p>
        </div>
      );
    }

    return (
      <table className="official-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr key={item.id}>
              <td><strong>{item.name}</strong></td>
              <td>{item.email}</td>
              <td>{item.phone || item.phoneNumber || 'N/A'}</td>
              <td>
                <span className={`status-badge ${item.status === 'PAUSED' ? 'reject' : 'approve'}`} style={{color: item.status === 'PAUSED' ? '#ef4444' : '#10b981', backgroundColor: item.status === 'PAUSED' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)'}}>
                  {item.status === 'PAUSED' ? <X size={14} /> : <Check size={14} />} {item.status}
                </span>
              </td>
              <td className="action-cell">
                <button 
                  className={`btn-action ${item.status === 'PAUSED' ? 'approve' : 'reject'}`} 
                  onClick={() => handleTogglePause(item.id)}
                  title={item.status === 'PAUSED' ? 'Resume Access' : 'Pause Access'}
                >
                  {item.status === 'PAUSED' ? <Check size={18} /> : <Clock size={18} />} {item.status === 'PAUSED' ? 'Resume' : 'Pause'}
                </button>
                <button 
                  className="btn-action reject" 
                  onClick={() => handleRemoveGranted(item.id)}
                  title="Completely Remove Access"
                >
                  <X size={18} /> Remove
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
        <div className="glass-panel-dark" style={{ marginBottom: '2rem', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
          <h2 style={{ marginTop: 0, marginBottom: '1rem', color: '#f8fafc', fontSize: '1.25rem' }}>Patient id manual edit option access</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ color: '#cbd5e1' }}>
              Current Status: <strong style={{ color: manualEditEnabled ? '#10b981' : '#ef4444' }}>{manualEditEnabled ? 'Enabled' : 'Disabled'}</strong>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => toggleManualEdit(true)} 
                disabled={manualEditEnabled}
                className="btn" 
                style={{ backgroundColor: manualEditEnabled ? '#1e293b' : '#10b981', color: 'white', border: 'none', opacity: manualEditEnabled ? 0.5 : 1, cursor: manualEditEnabled ? 'not-allowed' : 'pointer' }}
              >
                Make Manual Edit Enable
              </button>
              <button 
                onClick={() => toggleManualEdit(false)} 
                disabled={!manualEditEnabled}
                className="btn" 
                style={{ backgroundColor: !manualEditEnabled ? '#1e293b' : '#ef4444', color: 'white', border: 'none', opacity: !manualEditEnabled ? 0.5 : 1, cursor: !manualEditEnabled ? 'not-allowed' : 'pointer' }}
              >
                Disable Manual Edit
              </button>
            </div>
          </div>
        </div>

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
          <button 
            className={`btn ${activeTab === 'assistant' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('assistant')}
          >
            Assistants ({pendingAssistants.length})
          </button>
          <button 
            className={`btn ${activeTab === 'granted' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('granted')}
            style={{ marginLeft: 'auto', backgroundColor: activeTab === 'granted' ? '#10b981' : 'transparent', color: activeTab === 'granted' ? '#fff' : '#10b981', borderColor: '#10b981' }}
          >
            Granted Users ({grantedAdmins.length})
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
              ? renderTable(pendingStockOfficers, handleApproveStockOfficer, handleRejectStockOfficer, 'officerType', 'Officer Type')
              : activeTab === 'distribute'
              ? renderTable(pendingDistributeOfficers, handleApproveDistributeOfficer, handleRejectDistributeOfficer)
              : activeTab === 'granted'
              ? renderGrantedTable(grantedAdmins)
              : renderTable(pendingAssistants, handleApproveAssistant, handleRejectAssistant, 'assistantType', 'Assistant Level')
          )}
        </div>
      </main>
    </div>
  );
};

export default OfficialDashboard;
