import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, LogOut, Check, X, Clock, UserCheck } from 'lucide-react';
import './OfficialDashboard.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const OfficialDashboard = () => {
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [grantedAdmins, setGrantedAdmins] = useState([]);
  const [grantedBillAccesses, setGrantedBillAccesses] = useState([]);
  const [grantedStockOfficers, setGrantedStockOfficers] = useState([]);
  const [grantedDistributeOfficers, setGrantedDistributeOfficers] = useState([]);
  const [grantedAssistants, setGrantedAssistants] = useState([]);
  const [pendingBillAccesses, setPendingBillAccesses] = useState([]);
  const [pendingStockOfficers, setPendingStockOfficers] = useState([]);
  const [pendingDistributeOfficers, setPendingDistributeOfficers] = useState([]);
  const [pendingAssistants, setPendingAssistants] = useState([]);
  const [patientIdEditEnabled, setPatientIdEditEnabled] = useState(false);
  const [togglingAdminId, setTogglingAdminId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('admins'); // 'admins', 'billing', 'stock', or 'distribute'
  const [grantedActiveTab, setGrantedActiveTab] = useState('admins');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllPending();
  }, []);

  const fetchAllPending = async () => {
    setLoading(true);
    try {
      const [
        adminRes, billRes, stockRes, distributeRes, assistantRes, 
        grantedAdminsRes, grantedBillRes, grantedStockRes, grantedDistributeRes, grantedAssistantRes
      ] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/pending`),
        fetch(`${API_BASE_URL}/api/bill-register-access/pending`),
        fetch(`${API_BASE_URL}/api/stock-officer-access/pending`),
        fetch(`${API_BASE_URL}/api/distribute-officer-access/pending`),
        fetch(`${API_BASE_URL}/api/assistant-access/pending`),
        fetch(`${API_BASE_URL}/api/admin/granted`),
        fetch(`${API_BASE_URL}/api/bill-register-access/granted`),
        fetch(`${API_BASE_URL}/api/stock-officer-access/granted`),
        fetch(`${API_BASE_URL}/api/distribute-officer-access/granted`),
        fetch(`${API_BASE_URL}/api/assistant-access/granted`)
      ]);
      
      const adminData = await adminRes.json();
      const billData = await billRes.json();
      const stockData = await stockRes.json();
      const distributeData = await distributeRes.json();
      const assistantData = await assistantRes.json();
      const grantedAdminsData = await grantedAdminsRes.json();
      const grantedBillData = await grantedBillRes.json();
      const grantedStockData = await grantedStockRes.json();
      const grantedDistributeData = await grantedDistributeRes.json();
      const grantedAssistantData = await grantedAssistantRes.json();
      
      setPendingAdmins(adminData);
      setGrantedAdmins(grantedAdminsData);
      setGrantedBillAccesses(grantedBillData);
      setGrantedStockOfficers(grantedStockData);
      setGrantedDistributeOfficers(grantedDistributeData);
      setGrantedAssistants(grantedAssistantData);
      setPendingBillAccesses(billData);
      setPendingStockOfficers(stockData);
      setPendingDistributeOfficers(distributeData);
      setPendingAssistants(assistantData);
      // Derive indicator: true if any admin has patient ID edit access active
      setPatientIdEditEnabled(grantedAdminsData.some(a => a.patientIdEditEnabled));
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

  const handleTogglePauseGeneric = async (id, endpoint, fetchEndpoint, setter) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}/${id}`, { method: 'PUT' });
      if (response.ok) {
        const res = await fetch(`${API_BASE_URL}${fetchEndpoint}`);
        setter(await res.json());
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to toggle pause');
      }
    } catch (err) {
      console.error('Failed to toggle pause', err);
    }
  };

  const handleRemoveGrantedGeneric = async (id, endpoint, fetchEndpoint, setter, dataState) => {
    if (!window.confirm('Are you sure you want to completely remove this granted user?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setter(dataState.filter(user => user.id !== id));
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

  const handleTogglePatientIdEditForAdmin = async (adminId) => {
    setTogglingAdminId(adminId);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/${adminId}/toggle-patient-id-edit`, { method: 'PUT' });
      if (response.ok) {
        // Refresh granted admins list to reflect the change
        const res = await fetch(`${API_BASE_URL}/api/admin/granted`);
        const updatedAdmins = await res.json();
        setGrantedAdmins(updatedAdmins);
        // Update aggregate indicator
        setPatientIdEditEnabled(updatedAdmins.some(a => a.patientIdEditEnabled));
      } else {
        alert('Failed to update Patient ID Edit Access for this admin.');
      }
    } catch (err) {
      console.error('Failed to toggle patient ID edit access', err);
      alert('Error connecting to server.');
    } finally {
      setTogglingAdminId(null);
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

  const renderGrantedTable = (data, toggleEndpoint, fetchEndpoint, setter, typeField = null, typeLabel = 'Role') => {
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
            {typeField && <th>{typeLabel}</th>}
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
              {typeField && <td><span className="badge" style={{backgroundColor: '#e2e8f0', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', color: '#1e293b', fontWeight: '500'}}>{item[typeField]}</span></td>}
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
                  onClick={() => handleTogglePauseGeneric(item.id, toggleEndpoint, fetchEndpoint, setter)}
                  title={item.status === 'PAUSED' ? 'Resume Access' : 'Pause Access'}
                >
                  {item.status === 'PAUSED' ? <Check size={18} /> : <Clock size={18} />} {item.status === 'PAUSED' ? 'Resume' : 'Pause'}
                </button>
                <button 
                  className="btn-action reject" 
                  onClick={() => handleRemoveGrantedGeneric(item.id, toggleEndpoint.replace('toggle-pause', 'remove'), fetchEndpoint, setter, data)}
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

  const renderGrantedSection = () => {
    return (
      <div>
        <div className="tabs-container" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <button className={`btn ${grantedActiveTab === 'admins' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setGrantedActiveTab('admins')} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Admins</button>
          <button className={`btn ${grantedActiveTab === 'billing' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setGrantedActiveTab('billing')} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Billing</button>
          <button className={`btn ${grantedActiveTab === 'stock' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setGrantedActiveTab('stock')} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Stock</button>
          <button className={`btn ${grantedActiveTab === 'distribute' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setGrantedActiveTab('distribute')} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Distribute</button>
          <button className={`btn ${grantedActiveTab === 'assistant' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setGrantedActiveTab('assistant')} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Assistant</button>
        </div>
        {grantedActiveTab === 'admins' && renderGrantedTable(grantedAdmins, '/api/admin/toggle-pause', '/api/admin/granted', setGrantedAdmins)}
        {grantedActiveTab === 'billing' && renderGrantedTable(grantedBillAccesses, '/api/bill-register-access/toggle-pause', '/api/bill-register-access/granted', setGrantedBillAccesses)}
        {grantedActiveTab === 'stock' && renderGrantedTable(grantedStockOfficers, '/api/stock-officer-access/toggle-pause', '/api/stock-officer-access/granted', setGrantedStockOfficers, 'officerType', 'Officer Type')}
        {grantedActiveTab === 'distribute' && renderGrantedTable(grantedDistributeOfficers, '/api/distribute-officer-access/toggle-pause', '/api/distribute-officer-access/granted', setGrantedDistributeOfficers)}
        {grantedActiveTab === 'assistant' && renderGrantedTable(grantedAssistants, '/api/assistant-access/toggle-pause', '/api/assistant-access/granted', setGrantedAssistants, 'assistantType', 'Assistant Level')}
      </div>
    );
  };

  const renderPatientIdEditSection = () => {
    const activeCount = grantedAdmins.filter(a => a.patientIdEditEnabled).length;
    return (
      <div style={{ padding: '1rem 0' }}>
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.25rem' }}>Patient ID Edit Access — Per Admin Control</h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Grant or pause the ability to change Patient IDs for each Admission Admin individually. When granted, the admin can edit Patient IDs in the Active Patients form and the change propagates to all linked records.</p>
        </div>

        {grantedAdmins.length === 0 ? (
          <div className="empty-state">
            <UserCheck size={48} className="empty-icon" />
            <h3>No Admission Admins</h3>
            <p>There are no granted Admission Admins yet. Approve admins first.</p>
          </div>
        ) : (
          <>
            {/* Summary bar */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '1rem',
              padding: '0.85rem 1.25rem', borderRadius: '0.5rem',
              backgroundColor: activeCount > 0 ? '#f0fdf4' : '#f8fafc',
              border: `1px solid ${activeCount > 0 ? '#86efac' : '#e2e8f0'}`,
              marginBottom: '1rem'
            }}>
              <span style={{ fontSize: '1.4rem' }}>{activeCount > 0 ? '✏️' : '🔒'}</span>
              <div>
                <p style={{ fontWeight: '700', color: '#1e293b', fontSize: '0.9rem' }}>
                  {activeCount} of {grantedAdmins.length} admin{grantedAdmins.length !== 1 ? 's' : ''} have Patient ID Edit access
                </p>
                <p style={{ color: '#64748b', fontSize: '0.8rem' }}>Use the buttons below to give or pause access per admin</p>
              </div>
            </div>

            {/* Per-admin table */}
            <table className="official-table">
              <thead>
                <tr>
                  <th>Admin Name</th>
                  <th>Email</th>
                  <th>Account Status</th>
                  <th>Patient ID Edit Access</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {grantedAdmins.map(admin => (
                  <tr key={admin.id}>
                    <td><strong>{admin.name}</strong></td>
                    <td>{admin.email}</td>
                    <td>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                        padding: '0.25rem 0.6rem', borderRadius: '2rem', fontSize: '0.8rem', fontWeight: '600',
                        backgroundColor: admin.status === 'ACTIVE' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                        color: admin.status === 'ACTIVE' ? '#10b981' : '#ef4444'
                      }}>
                        {admin.status === 'ACTIVE' ? <Check size={12} /> : <X size={12} />}
                        {admin.status}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                        padding: '0.3rem 0.75rem', borderRadius: '2rem', fontSize: '0.82rem', fontWeight: '700',
                        backgroundColor: admin.patientIdEditEnabled ? '#dcfce7' : '#fee2e2',
                        color: admin.patientIdEditEnabled ? '#16a34a' : '#dc2626'
                      }}>
                        {admin.patientIdEditEnabled ? <Check size={13} /> : <X size={13} />}
                        {admin.patientIdEditEnabled ? 'ACTIVE' : 'PAUSED'}
                      </span>
                    </td>
                    <td className="action-cell">
                      <button
                        className={`btn-action ${admin.patientIdEditEnabled ? 'reject' : 'approve'}`}
                        onClick={() => handleTogglePatientIdEditForAdmin(admin.id)}
                        disabled={togglingAdminId === admin.id}
                        title={admin.patientIdEditEnabled ? 'Pause Patient ID Edit Access' : 'Give Patient ID Edit Access'}
                      >
                        {togglingAdminId === admin.id ? (
                          '⏳'
                        ) : admin.patientIdEditEnabled ? (
                          <><Clock size={15} /> Pause Access</>
                        ) : (
                          <><Check size={15} /> Give Access</>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* Warning note */}
        <div style={{
          marginTop: '1.25rem', padding: '0.9rem 1.1rem', borderRadius: '0.5rem',
          backgroundColor: '#fffbeb', border: '1px solid #fcd34d',
          display: 'flex', gap: '0.75rem', alignItems: 'flex-start'
        }}>
          <span style={{ fontSize: '1.1rem' }}>⚠️</span>
          <div>
            <p style={{ fontWeight: '600', color: '#92400e', fontSize: '0.85rem', marginBottom: '0.2rem' }}>Important Note</p>
            <p style={{ color: '#78350f', fontSize: '0.82rem' }}>Changing a Patient ID updates it across all linked records: active patients, master admission table, discharge entries, and all destination tables (MLC, Death, Maternity, etc.).</p>
          </div>
        </div>
      </div>
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
            Granted Users ({grantedAdmins.length + grantedBillAccesses.length + grantedStockOfficers.length + grantedDistributeOfficers.length + grantedAssistants.length})
          </button>
          <button 
            className={`btn ${activeTab === 'patientIdEdit' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('patientIdEdit')}
            style={{
              backgroundColor: activeTab === 'patientIdEdit' ? '#f59e0b' : 'transparent',
              color: activeTab === 'patientIdEdit' ? '#fff' : '#d97706',
              borderColor: '#f59e0b',
              display: 'flex', alignItems: 'center', gap: '0.4rem'
            }}
          >
            ✏️ Patient ID Edit Access
            <span style={{
              display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%',
              backgroundColor: patientIdEditEnabled ? '#10b981' : '#ef4444',
              marginLeft: '0.25rem'
            }} />
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
              ? renderGrantedSection()
              : activeTab === 'patientIdEdit'
              ? renderPatientIdEditSection()
              : renderTable(pendingAssistants, handleApproveAssistant, handleRejectAssistant, 'assistantType', 'Assistant Level')
          )}
        </div>
      </main>
    </div>
  );
};

export default OfficialDashboard;
