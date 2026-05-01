import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, LogOut, FileText, Download, Calendar, IndianRupee, ArrowRight, ClipboardCheck } from 'lucide-react';
import './StockDashboard.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const AssistantDashboard = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const assistantName = localStorage.getItem('assistantName');
  const assistantType = localStorage.getItem('assistantType');

  useEffect(() => {
    if (!assistantName || !assistantType) {
      navigate('/assistant-login');
      return;
    }
    fetchBills();
  }, [assistantName, assistantType, navigate]);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/assistant-bills/assistant/${assistantType}`);
      if (response.ok) {
        const data = await response.json();
        setBills(data);
      } else {
        setError('Failed to load assigned tasks.');
      }
    } catch (err) {
      setError('Connection error.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('assistantName');
    localStorage.removeItem('assistantType');
    navigate('/assistant-login');
  };

  const handleDownload = (id) => {
    window.open(`${API_BASE_URL}/api/assistant-bills/download/${id}`, '_blank');
  };

  return (
    <div className="stock-dashboard-wrapper">
      <aside className="stock-sidebar">
        <div className="stock-sidebar-header">
          <div className="stock-brand-icon" style={{ color: '#be185d' }}>
            <Users size={28} />
          </div>
          <h2>Assistant Portal</h2>
        </div>
        
        <div className="officer-profile">
          <div className="profile-avatar" style={{ backgroundColor: '#fce7f3', color: '#be185d' }}>
            {assistantType || 'A'}
          </div>
          <div className="profile-info">
            <p className="profile-name">{assistantName || 'Assistant'}</p>
            <p className="profile-role">Assistant {assistantType}</p>
          </div>
        </div>

        <div className="stock-sidebar-nav">
          <button className="stock-nav-item active">
            <ClipboardCheck size={20} />
            My Tasks
          </button>
        </div>
        
        <div className="stock-sidebar-footer">
          <button className="btn btn-outline btn-block" onClick={handleLogout}>
            <LogOut size={18} style={{ marginRight: '0.5rem' }} /> Logout
          </button>
        </div>
      </aside>

      <main className="stock-main-content">
        <header className="stock-topbar">
          <div className="topbar-title">
            Task Overview
          </div>
        </header>

        <div className="stock-content-area">
          <div className="stock-page-header">
            <h1>Assigned Bills & Tasks</h1>
            <p>View items forwarded to you by the Distribution Hub.</p>
          </div>

          {error && <div className="error-alert">{error}</div>}

          <div className="table-responsive" style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            {loading ? (
              <div className="loading-state" style={{ padding: '2rem', textAlign: 'center' }}>Loading your tasks...</div>
            ) : bills.length === 0 ? (
              <div className="empty-state" style={{ padding: '3rem', textAlign: 'center' }}>
                <ClipboardCheck size={48} className="empty-icon" style={{ color: '#be185d', margin: '0 auto 1rem' }} />
                <h3>No Tasks Assigned</h3>
                <p>You have no pending bills to process at this time.</p>
              </div>
            ) : (
              <table className="table table-bordered table-hover" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ backgroundColor: '#fdf2f8', borderBottom: '2px solid #fbcfe8' }}>
                  <tr>
                    <th style={{ padding: '1rem', color: '#831843', fontWeight: '600' }}>Bill Reg No</th>
                    <th style={{ padding: '1rem', color: '#831843', fontWeight: '600' }}>Received Date</th>
                    <th style={{ padding: '1rem', color: '#831843', fontWeight: '600' }}>Company Name & Address</th>
                    <th style={{ padding: '1rem', color: '#831843', fontWeight: '600' }}>Invoice No</th>
                    <th style={{ padding: '1rem', color: '#831843', fontWeight: '600' }}>Invoice Date</th>
                    <th style={{ padding: '1rem', color: '#831843', fontWeight: '600' }}>Supply Order No</th>
                    <th style={{ padding: '1rem', color: '#831843', fontWeight: '600' }}>Supply Order Date</th>
                    <th style={{ padding: '1rem', color: '#831843', fontWeight: '600' }}>Supply To</th>
                    <th style={{ padding: '1rem', color: '#831843', fontWeight: '600' }}>Stock Info</th>
                    <th style={{ padding: '1rem', color: '#831843', fontWeight: '600' }}>Amount</th>
                    <th style={{ padding: '1rem', color: '#831843', fontWeight: '600' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map(bill => (
                    <tr key={bill.id} style={{ borderBottom: '1px solid #fbcfe8' }}>
                      <td style={{ padding: '1rem', verticalAlign: 'top', fontWeight: 'bold', color: '#1e293b' }}>
                        {bill.billRegisterNo}
                      </td>
                      <td style={{ padding: '1rem', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                        <Calendar size={12} style={{marginRight:'4px'}}/> {bill.receivedDate || 'N/A'}
                      </td>
                      <td style={{ padding: '1rem', verticalAlign: 'top', maxWidth: '200px' }}>
                        <div style={{ fontWeight: '500', color: '#1e293b', marginBottom: '0.25rem' }}>{bill.companyNameAndAddress || 'Unknown Company'}</div>
                        <span className="badge" style={{ backgroundColor: '#fce7f3', color: '#be185d', fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <ArrowRight size={12} /> Forwarded from Hub
                        </span>
                      </td>
                      <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                        {bill.invoiceNo || 'N/A'}
                      </td>
                      <td style={{ padding: '1rem', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                        {bill.invoiceDate || 'N/A'}
                      </td>
                      <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                        {bill.supplyOrderNo || 'N/A'}
                      </td>
                      <td style={{ padding: '1rem', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                        {bill.supplyOrderDate || 'N/A'}
                      </td>
                      <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                        {bill.supplyTo || 'N/A'}
                      </td>
                      <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                        <div style={{ fontSize: '0.9rem' }}><span style={{ color: '#64748b' }}>Book:</span> {bill.stockBookName || 'N/A'}</div>
                        <div style={{ fontSize: '0.9rem' }}><span style={{ color: '#64748b' }}>Page:</span> {bill.pageNo || 'N/A'}</div>
                      </td>
                      <td style={{ padding: '1rem', verticalAlign: 'top', fontWeight: 'bold', color: '#059669' }}>
                        ₹{bill.amount ? bill.amount.toFixed(2) : '0.00'}
                      </td>
                      <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                        {bill.attachedInvoiceName && (
                          <button 
                            className="btn-download" 
                            onClick={() => handleDownload(bill.id)}
                            title={bill.attachedInvoiceName}
                            style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', width: '100%', justifyContent: 'center', backgroundColor: '#be185d', color: 'white', border: 'none', borderRadius: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}
                          >
                            <Download size={14} /> Download Excel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AssistantDashboard;
