import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, LogOut, FileText, Download, Calendar, IndianRupee, ArrowRight } from 'lucide-react';
import './StockDashboard.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const DistributeOfficerDashboard = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const officerName = localStorage.getItem('distributeOfficerName');

  useEffect(() => {
    if (!officerName) {
      navigate('/distribute-login');
      return;
    }
    fetchBills();
  }, [officerName, navigate]);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/distribute-officer-bills`);
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
    localStorage.removeItem('distributeOfficerName');
    navigate('/distribute-login');
  };

  const handleDownload = (id, filename) => {
    window.open(`${API_BASE_URL}/api/distribute-officer-bills/download/${id}`, '_blank');
  };

  return (
    <div className="stock-dashboard-wrapper">
      <aside className="stock-sidebar">
        <div className="stock-sidebar-header">
          <div className="stock-brand-icon" style={{ color: '#4338ca' }}>
            <Truck size={28} />
          </div>
          <h2>Distribution Hub</h2>
        </div>
        
        <div className="officer-profile">
          <div className="profile-avatar" style={{ backgroundColor: '#e0e7ff', color: '#4338ca' }}>
            {officerName ? officerName.charAt(0).toUpperCase() : 'D'}
          </div>
          <div className="profile-info">
            <p className="profile-name">{officerName || 'Officer'}</p>
            <p className="profile-role">Distribute Officer</p>
          </div>
        </div>

        <div className="stock-sidebar-nav">
          <button className="stock-nav-item active">
            <FileText size={20} />
            Distributed Bills
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
            Distribution Overview
          </div>
        </header>

        <div className="stock-content-area">
          <div className="stock-page-header">
            <h1>Ready for Distribution</h1>
            <p>View items forwarded by the Stock Officers for distribution.</p>
          </div>

          {error && <div className="error-alert">{error}</div>}

          <div className="bills-grid">
            {loading ? (
              <div className="loading-state">Loading distributed bills...</div>
            ) : bills.length === 0 ? (
              <div className="empty-state">
                <Truck size={48} className="empty-icon" style={{ color: '#4338ca' }} />
                <h3>No Distributed Bills</h3>
                <p>There are no bills waiting for distribution at this time.</p>
              </div>
            ) : (
              bills.map(bill => (
                <div key={bill.id} className="bill-card" style={{ borderTop: '4px solid #4338ca' }}>
                  <div className="bill-card-header">
                    <span className="bill-number">{bill.billRegisterNo}</span>
                    <span className="bill-date"><Calendar size={14} /> {bill.receivedDate || 'N/A'}</span>
                  </div>
                  
                  <div className="bill-card-body">
                    <div className="bill-company" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>{bill.companyNameAndAddress || 'Unknown Company'}</strong>
                      <span className="badge" style={{ backgroundColor: '#e0e7ff', color: '#4338ca', fontSize: '0.8rem', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <ArrowRight size={14} /> Forwarded by: {bill.sourceStockOfficer}
                      </span>
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
                      <div className="detail-item">
                        <span className="detail-label">Stock Book Name:</span>
                        <span className="detail-value">{bill.stockBookName || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Page No:</span>
                        <span className="detail-value">{bill.pageNo || 'N/A'}</span>
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

                  <div className="bill-card-footer">
                    {bill.attachedInvoiceName ? (
                      <button 
                        className="btn-download" 
                        onClick={() => handleDownload(bill.id, bill.attachedInvoiceName)}
                        title={bill.attachedInvoiceName}
                        style={{ padding: '0.5rem 1rem', width: '100%', justifyContent: 'center' }}
                      >
                        <Download size={18} /> Download Original Excel
                      </button>
                    ) : (
                      <span className="no-attachment" style={{ width: '100%', textAlign: 'center' }}>No Attachment Provided</span>
                    )}
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

export default DistributeOfficerDashboard;
