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

          <div className="table-responsive" style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            {loading ? (
              <div className="loading-state" style={{ padding: '2rem', textAlign: 'center' }}>Loading your bills...</div>
            ) : bills.length === 0 ? (
              <div className="empty-state" style={{ padding: '3rem', textAlign: 'center' }}>
                <Package size={48} className="empty-icon" style={{ margin: '0 auto 1rem', color: '#6366f1' }} />
                <h3>No Bills Assigned</h3>
                <p>You have no bills forwarded to you at this time.</p>
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
                    <th style={{ padding: '1rem', color: '#475569', fontWeight: '600' }}>Amount</th>
                    <th style={{ padding: '1rem', color: '#475569', fontWeight: '600', minWidth: '250px' }}>Processing Action</th>
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
                        {bill.companyNameAndAddress || 'N/A'}
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
                      <td style={{ padding: '1rem', verticalAlign: 'top', fontWeight: 'bold', color: '#059669' }}>
                        ₹{bill.amount ? bill.amount.toFixed(2) : '0.00'}
                      </td>
                      <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input 
                              type="text" 
                              placeholder="Stock Book Name *" 
                              value={billInputs[bill.id]?.stockBookName || ''}
                              onChange={(e) => handleInputChange(bill.id, 'stockBookName', e.target.value)}
                              style={{ flex: 1, padding: '0.4rem', borderRadius: '0.25rem', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                            />
                            <input 
                              type="text" 
                              placeholder="Page No *" 
                              value={billInputs[bill.id]?.pageNo || ''}
                              onChange={(e) => handleInputChange(bill.id, 'pageNo', e.target.value)}
                              style={{ width: '80px', padding: '0.4rem', borderRadius: '0.25rem', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                            />
                          </div>
                          
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <button 
                              className="btn" 
                              style={{ flex: 1, backgroundColor: '#10b981', color: 'white', padding: '0.4rem', fontSize: '0.85rem', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}
                              onClick={() => handleProcessAction(bill.id, 'DISTRIBUTE')}
                            >
                              Move to Distribute
                            </button>
                            <button 
                              className="btn" 
                              style={{ backgroundColor: '#ef4444', color: 'white', padding: '0.4rem 0.75rem', fontSize: '0.85rem', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}
                              onClick={() => handleProcessAction(bill.id, 'REJECT')}
                            >
                              Reject
                            </button>
                            
                            {bill.attachedInvoiceName && (
                              <button 
                                className="btn-download" 
                                onClick={() => handleDownload(bill.id, bill.attachedInvoiceName)}
                                title={bill.attachedInvoiceName}
                                style={{ padding: '0.4rem', fontSize: '0.85rem', backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '0.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              >
                                <Download size={14} />
                              </button>
                            )}
                          </div>
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

export default StockOfficerDashboard;
