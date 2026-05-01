import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, LogOut, FileText, Download, Calendar, IndianRupee } from 'lucide-react';
import './StockDashboard.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const StockOfficerDashboard = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  
  const officerType = localStorage.getItem('stockOfficerType');
  const officerName = localStorage.getItem('stockOfficerName');

  useEffect(() => {
    if (!officerType) {
      navigate('/stock-login');
      return;
    }
    fetchAssignedBills();
  }, [officerType, navigate]);

  const fetchAssignedBills = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/stock-officer-bills/officer/${officerType}`);
      if (response.ok) {
        const data = await response.json();
        setBills(data);
      } else {
        setError('Failed to load bills.');
      }
    } catch (err) {
      setError('Connection error.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('stockOfficerType');
    localStorage.removeItem('stockOfficerName');
    navigate('/stock-login');
  };

  const handleDownload = (id, filename) => {
    window.open(`${API_BASE_URL}/api/stock-officer-bills/download/${id}`, '_blank');
  };

  const [billInputs, setBillInputs] = useState({});

  const handleInputChange = (id, field, value) => {
    setBillInputs(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  const handleProcessAction = async (id, action) => {
    const inputs = billInputs[id] || {};
    if (!inputs.stockBookName || !inputs.pageNo) {
      alert('Please fill out Stock Book Name and Page No before proceeding.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/stock-officer-bills/${id}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          stockBookName: inputs.stockBookName,
          pageNo: inputs.pageNo
        })
      });
      const data = await response.json();
      if (data.success) {
        setBills(bills.filter(b => b.id !== id));
      } else {
        alert(data.message || 'Failed to process bill');
      }
    } catch (err) {
      alert('Connection error');
    }
  };

  return (
    <div className="stock-dashboard-wrapper">
      {/* Sidebar */}
      <aside className="stock-sidebar">
        <div className="stock-sidebar-header">
          <div className="stock-brand-icon">
            <Package size={28} />
          </div>
          <h2>Inventory System</h2>
        </div>
        
        <div className="officer-profile">
          <div className="profile-avatar">
            {officerName ? officerName.charAt(0).toUpperCase() : 'O'}
          </div>
          <div className="profile-info">
            <p className="profile-name">{officerName || 'Officer'}</p>
            <p className="profile-role">{officerType}</p>
          </div>
        </div>

        <div className="stock-sidebar-nav">
          <button className="stock-nav-item active">
            <FileText size={20} />
            My Assigned Bills
          </button>
        </div>
        
        <div className="stock-sidebar-footer">
          <button className="btn btn-outline btn-block" onClick={handleLogout}>
            <LogOut size={18} style={{ marginRight: '0.5rem' }} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="stock-main-content">
        <header className="stock-topbar">
          <div className="topbar-title">
            Dashboard Overview
          </div>
        </header>

        <div className="stock-content-area">
          <div className="stock-page-header">
            <h1>Assigned Bills & Invoices</h1>
            <p>Manage the items and bills forwarded to your department.</p>
          </div>

          {error && <div className="error-alert">{error}</div>}

          <div className="bills-grid">
            {loading ? (
              <div className="loading-state">Loading your bills...</div>
            ) : bills.length === 0 ? (
              <div className="empty-state">
                <Package size={48} className="empty-icon" />
                <h3>No Bills Assigned</h3>
                <p>You have no bills forwarded to you at this time.</p>
              </div>
            ) : (
              bills.map(bill => (
                <div key={bill.id} className="bill-card">
                  <div className="bill-card-header">
                    <span className="bill-number">{bill.billRegisterNo}</span>
                    <span className="bill-date"><Calendar size={14} /> {bill.receivedDate || 'N/A'}</span>
                  </div>
                  
                  <div className="bill-card-body">
                    <div className="bill-company">
                      <strong>{bill.companyNameAndAddress || 'Unknown Company'}</strong>
                    </div>
                    
                    <div className="bill-details-grid">
                      <div className="detail-item">
                        <span className="detail-label">Invoice No:</span>
                        <span className="detail-value">{bill.invoiceNo || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Supply Order:</span>
                        <span className="detail-value">{bill.supplyOrderNo || 'N/A'}</span>
                      </div>
                      <div className="detail-item full-width amount-item">
                        <span className="detail-label">Total Amount:</span>
                        <span className="detail-value amount-value">
                          <IndianRupee size={16} />
                          {bill.amount ? bill.amount.toFixed(2) : '0.00'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bill-card-footer" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                    <div className="action-inputs" style={{ display: 'flex', gap: '1rem', width: '100%', marginBottom: '1rem' }}>
                      <input 
                        type="text" 
                        placeholder="Stock Book Name *" 
                        value={billInputs[bill.id]?.stockBookName || ''}
                        onChange={(e) => handleInputChange(bill.id, 'stockBookName', e.target.value)}
                        style={{ flex: 1, padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #cbd5e1' }}
                      />
                      <input 
                        type="text" 
                        placeholder="Page No *" 
                        value={billInputs[bill.id]?.pageNo || ''}
                        onChange={(e) => handleInputChange(bill.id, 'pageNo', e.target.value)}
                        style={{ flex: 1, padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                    
                    <div className="action-buttons" style={{ display: 'flex', gap: '1rem', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="btn" 
                          style={{ backgroundColor: '#ef4444', color: 'white', padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                          onClick={() => handleProcessAction(bill.id, 'REJECT')}
                        >
                          Reject
                        </button>
                        <button 
                          className="btn" 
                          style={{ backgroundColor: '#10b981', color: 'white', padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                          onClick={() => handleProcessAction(bill.id, 'DISTRIBUTE')}
                        >
                          Move to Distribute Officer
                        </button>
                      </div>
                      
                      {bill.attachedInvoiceName ? (
                        <button 
                          className="btn-download" 
                          onClick={() => handleDownload(bill.id, bill.attachedInvoiceName)}
                          title={bill.attachedInvoiceName}
                          style={{ padding: '0.5rem 1rem', margin: 0 }}
                        >
                          <Download size={18} /> Excel
                        </button>
                      ) : (
                        <span className="no-attachment">No Attachment</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StockOfficerDashboard;
