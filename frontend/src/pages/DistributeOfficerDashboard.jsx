import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, LogOut, FileText, Download, Calendar, IndianRupee, ArrowRight } from 'lucide-react';
import './StockDashboard.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const DistributeOfficerDashboard = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [forwardSelection, setForwardSelection] = useState({});
  
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

  const handleForwardSelection = (id, value) => {
    setForwardSelection(prev => ({ ...prev, [id]: value }));
  };

  const handleForwardBill = async (id) => {
    const target = forwardSelection[id];
    if (!target) {
      alert("Please select an assistant (A1, A2, A3) to forward to.");
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/distribute-officer-bills/${id}/forward`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetAssistant: target })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setBills(bills.filter(b => b.id !== id));
      } else {
        alert(data.message || "Failed to forward bill");
      }
    } catch (err) {
      alert("Connection error");
    }
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

          <div className="table-responsive" style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            {loading ? (
              <div className="loading-state" style={{ padding: '2rem', textAlign: 'center' }}>Loading distributed bills...</div>
            ) : bills.length === 0 ? (
              <div className="empty-state" style={{ padding: '3rem', textAlign: 'center' }}>
                <Truck size={48} className="empty-icon" style={{ color: '#4338ca', margin: '0 auto 1rem' }} />
                <h3>No Distributed Bills</h3>
                <p>There are no bills waiting for distribution at this time.</p>
              </div>
            ) : (
              <table className="table table-bordered table-hover" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <tr>
                    <th style={{ padding: '1rem', color: '#475569', fontWeight: '600' }}>Bill Reg No</th>
                    <th style={{ padding: '1rem', color: '#475569', fontWeight: '600' }}>Received Date</th>
                    <th style={{ padding: '1rem', color: '#475569', fontWeight: '600' }}>Company Name & Address</th>
                    <th style={{ padding: '1rem', color: '#475569', fontWeight: '600' }}>Invoice No</th>
                    <th style={{ padding: '1rem', color: '#475569', fontWeight: '600' }}>Invoice Date</th>
                    <th style={{ padding: '1rem', color: '#475569', fontWeight: '600' }}>Supply Order No</th>
                    <th style={{ padding: '1rem', color: '#475569', fontWeight: '600' }}>Supply Order Date</th>
                    <th style={{ padding: '1rem', color: '#475569', fontWeight: '600' }}>Supply To</th>
                    <th style={{ padding: '1rem', color: '#475569', fontWeight: '600' }}>Stock Info</th>
                    <th style={{ padding: '1rem', color: '#475569', fontWeight: '600' }}>Amount</th>
                    <th style={{ padding: '1rem', color: '#475569', fontWeight: '600' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map(bill => (
                    <tr key={bill.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '1rem', verticalAlign: 'top', fontWeight: 'bold', color: '#1e293b' }}>
                        {bill.billRegisterNo}
                      </td>
                      <td style={{ padding: '1rem', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                        <Calendar size={12} style={{marginRight:'4px'}}/> {bill.receivedDate || 'N/A'}
                      </td>
                      <td style={{ padding: '1rem', verticalAlign: 'top', maxWidth: '200px' }}>
                        <div style={{ fontWeight: '500', color: '#1e293b', marginBottom: '0.25rem' }}>{bill.companyNameAndAddress || 'Unknown Company'}</div>
                        <span className="badge" style={{ backgroundColor: '#e0e7ff', color: '#4338ca', fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <ArrowRight size={12} /> From: {bill.sourceStockOfficer}
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
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <select 
                              value={forwardSelection[bill.id] || ''} 
                              onChange={(e) => handleForwardSelection(bill.id, e.target.value)}
                              style={{ flex: 1, padding: '0.4rem', borderRadius: '0.25rem', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                            >
                              <option value="">Assistant...</option>
                              <option value="A1">A1</option>
                              <option value="A2">A2</option>
                              <option value="A3">A3</option>
                            </select>
                            <button 
                              className="btn btn-primary" 
                              onClick={() => handleForwardBill(bill.id)}
                              style={{ padding: '0.4rem 0.75rem', backgroundColor: '#4338ca', fontSize: '0.85rem' }}
                            >
                              Forward
                            </button>
                          </div>
                          {bill.attachedInvoiceName && (
                            <button 
                              className="btn-download" 
                              onClick={() => handleDownload(bill.id, bill.attachedInvoiceName)}
                              title={bill.attachedInvoiceName}
                              style={{ padding: '0.4rem', fontSize: '0.85rem', width: '100%', justifyContent: 'center', backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1' }}
                            >
                              <Download size={14} style={{ marginRight: '0.25rem' }} /> Invoice Excel
                            </button>
                          )}
                        </div>
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

export default DistributeOfficerDashboard;
