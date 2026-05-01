import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Receipt, FileText, LogOut, UploadCloud, CheckCircle2, Package } from 'lucide-react';
import './BillDashboard.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const BillDashboard = () => {
  const [activeTab, setActiveTab] = useState('NEW_BILL');
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [isManualBillNo, setIsManualBillNo] = useState(false);
  const [predictedNextId, setPredictedNextId] = useState('Loading...');

  const [formData, setFormData] = useState({
    billRegisterNo: '',
    receivedDate: '',
    companyNameAndAddress: '',
    invoiceNo: '',
    invoiceDate: '',
    amount: '',
    supplyOrderNo: '',
    supplyOrderDate: '',
    supplyTo: '',
    billForwardTo: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchNextId();
  }, []);

  const fetchNextId = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bills/next-id`);
      if (response.ok) {
        const data = await response.text();
        setPredictedNextId(data);
      } else {
        setPredictedNextId('Auto Generated');
      }
    } catch (err) {
      setPredictedNextId('Auto Generated');
    }
  };

  const handleLogout = () => {
    navigate('/bill-login');
  };

  const handleChange = (e) => {
    let { name, value } = e.target;
    
    if (name === 'billRegisterNo' && isManualBillNo) {
      const yearPrefix = `${new Date().getFullYear()}-BR-`;
      if (!value.startsWith(yearPrefix)) {
        value = yearPrefix + value.replace(new RegExp(`^(\\d{4}-BR-)?`), '');
      }
    }

    setFormData({
      ...formData,
      [name]: value
    });
  };

  useEffect(() => {
    if (isManualBillNo && !formData.billRegisterNo) {
      setFormData(prev => ({
        ...prev,
        billRegisterNo: `${new Date().getFullYear()}-BR-`
      }));
    }
  }, [isManualBillNo]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isManualBillNo && !formData.billRegisterNo) {
      setError("Bill Register No is required.");
      return;
    }
    if (!selectedFile) {
      setError("Attached Invoice (Excel file) is required.");
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      const submitData = new FormData();
      
      const finalBillNo = isManualBillNo ? formData.billRegisterNo : predictedNextId;
      submitData.append('billRegisterNo', finalBillNo);

      Object.keys(formData).forEach(key => {
        if (key !== 'billRegisterNo' && formData[key]) {
          submitData.append(key, formData[key]);
        }
      });

      if (selectedFile) {
        submitData.append('file', selectedFile);
      }

      const response = await fetch(`${API_BASE_URL}/api/bills/create`, {
        method: 'POST',
        body: submitData
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMsg('Bill details saved successfully!');
        setFormData({
          billRegisterNo: '',
          receivedDate: '',
          companyNameAndAddress: '',
          invoiceNo: '',
          invoiceDate: '',
          amount: '',
          supplyOrderNo: '',
          supplyOrderDate: '',
          supplyTo: '',
          billForwardTo: ''
        });
        setSelectedFile(null);
        fetchNextId(); // Refresh the next ID
      } else {
        setError(data.message || 'Failed to save bill details.');
      }
    } catch (err) {
      setError('Could not connect to the server.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bill-dashboard-wrapper">
      {/* Sidebar */}
      <aside className="bill-sidebar">
        <div className="bill-sidebar-header">
          <Receipt size={28} className="bill-brand-icon" />
          <h2>Billing Portal</h2>
        </div>
        <div className="bill-sidebar-nav">
          <button 
            className={`bill-nav-item ${activeTab === 'NEW_BILL' ? 'active' : ''}`}
            onClick={() => setActiveTab('NEW_BILL')}
          >
            <FileText size={20} />
            New Bill Details
          </button>
          {/* Future tabs can be added here */}
        </div>
        <div className="bill-sidebar-footer">
          <button className="btn btn-outline btn-block" onClick={handleLogout}>
            <LogOut size={18} style={{ marginRight: '0.5rem' }} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="bill-main-content">
        <header className="bill-topbar">
          <div style={{ marginLeft: 'auto', fontWeight: '500', color: 'var(--text-light)' }}>
            Logged in as Billing Staff
          </div>
        </header>

        <div className="bill-content-area">
          {activeTab === 'NEW_BILL' && (
            <div className="bill-form-section">
              <div className="bill-page-header">
                <h1>New Bill Entry</h1>
                <p>Register a new bill into the system</p>
              </div>

              {error && <div className="error-message" style={{ marginBottom: '1rem', maxWidth: '900px' }}>{error}</div>}
              {successMsg && (
                <div className="success-message" style={{ backgroundColor: '#e6fffa', color: '#00a389', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', border: '1px solid #b2f5ea', display: 'flex', alignItems: 'center', gap: '0.5rem', maxWidth: '900px' }}>
                  <CheckCircle2 size={20} />
                  {successMsg}
                </div>
              )}

              <form className="bill-form-container" onSubmit={handleSubmit}>
                <div className="bill-form-grid">
                  
                  <div className="bill-form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <label style={{ marginBottom: 0 }}>Bill Register No *</label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: '#64748b', fontWeight: 'normal', backgroundColor: 'transparent', padding: 0, boxShadow: 'none' }}>
                        <input 
                          type="checkbox" 
                          checked={isManualBillNo}
                          onChange={(e) => setIsManualBillNo(e.target.checked)}
                          style={{ width: 'auto', padding: 0, margin: 0 }}
                        />
                        Manual Edit
                      </label>
                    </div>
                    <input 
                      type="text" 
                      name="billRegisterNo" 
                      value={isManualBillNo ? formData.billRegisterNo : predictedNextId} 
                      onChange={handleChange} 
                      required={isManualBillNo} 
                      disabled={!isManualBillNo}
                      placeholder="e.g. BR-2026-001"
                      style={!isManualBillNo ? { backgroundColor: '#f1f5f9', color: '#64748b', fontStyle: 'italic', cursor: 'not-allowed' } : {}}
                    />
                  </div>

                  <div className="bill-form-group">
                    <label>Received Date *</label>
                    <input 
                      type="date" 
                      name="receivedDate" 
                      value={formData.receivedDate} 
                      onChange={handleChange} 
                      required
                    />
                  </div>

                  <div className="bill-form-group full-width">
                    <label>Company Name and Address *</label>
                    <textarea 
                      name="companyNameAndAddress" 
                      value={formData.companyNameAndAddress} 
                      onChange={handleChange} 
                      rows="2"
                      required
                      placeholder="Enter company details..."
                    ></textarea>
                  </div>

                  <div className="bill-form-group">
                    <label>Invoice No *</label>
                    <input 
                      type="text" 
                      name="invoiceNo" 
                      value={formData.invoiceNo} 
                      onChange={handleChange} 
                      required
                      placeholder="e.g. INV-10023"
                    />
                  </div>

                  <div className="bill-form-group">
                    <label>Invoice Date *</label>
                    <input 
                      type="date" 
                      name="invoiceDate" 
                      value={formData.invoiceDate} 
                      onChange={handleChange} 
                      required
                    />
                  </div>

                  <div className="bill-form-group">
                    <label>Amount (₹) *</label>
                    <input 
                      type="number" 
                      step="0.01"
                      name="amount" 
                      value={formData.amount} 
                      onChange={handleChange} 
                      required
                      placeholder="0.00"
                    />
                  </div>

                  <div className="bill-form-group">
                    <label>Supply Order No</label>
                    <input 
                      type="text" 
                      name="supplyOrderNo" 
                      value={formData.supplyOrderNo} 
                      onChange={handleChange} 
                      placeholder="e.g. SO-994"
                    />
                  </div>

                  <div className="bill-form-group">
                    <label>Supply Order Date</label>
                    <input 
                      type="date" 
                      name="supplyOrderDate" 
                      value={formData.supplyOrderDate} 
                      onChange={handleChange} 
                    />
                  </div>

                  <div className="bill-form-group">
                    <label>Supply To</label>
                    <input 
                      type="text" 
                      name="supplyTo" 
                      value={formData.supplyTo} 
                      onChange={handleChange} 
                      placeholder="e.g. Pharmacy Dept"
                    />
                  </div>

                  <div className="bill-form-group">
                    <label>Bill Forward To *</label>
                    <select 
                      name="billForwardTo" 
                      value={formData.billForwardTo} 
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Officer...</option>
                      <option value="Stock officer-1">Stock officer-1</option>
                      <option value="Stock officer-2">Stock officer-2</option>
                      <option value="Stock officer-3">Stock officer-3</option>
                      <option value="Stock officer-4">Stock officer-4</option>
                      <option value="Stock officer-5">Stock officer-5</option>
                    </select>
                  </div>

                  <div className="bill-form-group full-width">
                    <label>Attached Invoice (Excel) *</label>
                    <div className="bill-file-upload" onClick={triggerFileInput}>
                      <UploadCloud size={32} color="var(--primary)" style={{ marginBottom: '0.5rem' }} />
                      <p style={{ margin: 0, color: 'var(--text-dark)', fontWeight: '500' }}>
                        {selectedFile ? selectedFile.name : 'Click to upload Excel file'}
                      </p>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-light)' }}>
                        .xlsx, .xls
                      </p>
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                        required={!selectedFile}
                      />
                    </div>
                  </div>

                </div>

                <div className="bill-form-actions">
                  <button type="submit" className="btn btn-primary btn-large" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save Bill Details'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BillDashboard;
