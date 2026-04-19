import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Activity, Search } from 'lucide-react';
import './AdminDashboard.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const DischargePage = () => {
  const navigate = useNavigate();
  const [patientId, setPatientId] = useState('');
  const [patientData, setPatientData] = useState(null);

  const getCurrentDateTime = () => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  const [dischargeType, setDischargeType] = useState('Normal Discharge');
  const [dischargeWard, setDischargeWard] = useState('');
  const [dischargeDate, setDischargeDate] = useState(getCurrentDateTime());

  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [dischargeRecords, setDischargeRecords] = useState([]);
  const [showRecords, setShowRecords] = useState(false);
  const [loadingRecords, setLoadingRecords] = useState(false);

  const formatTime12Hour = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    if (!hours || !minutes) return timeString;
    let h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12; // 0 becomes 12
    return `${h.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  };

  const fetchDischargeRecords = async () => {
    if (showRecords) {
      setShowRecords(false);
      return;
    }
    setLoadingRecords(true);
    setShowRecords(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/patients/discharge-entries`);
      const data = await response.json();
      setDischargeRecords(data);
    } catch (err) {
      console.error('Failed to fetch discharge records', err);
    } finally {
      setLoadingRecords(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!patientId.trim()) return;

    setIsSearching(true);
    setError('');
    setPatientData(null);
    setSuccess(false);

    try {
      const response = await fetch(`${API_BASE_URL}/api/patients/id/${patientId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'DISCHARGED') {
          setError(`Patient ${data.patientName} is already discharged.`);
        } else {
          setPatientData(data);
          setDischargeWard('');
          setDischargeDate(getCurrentDateTime());
        }
      } else {
        setError('Patient not found with that ID.');
      }
    } catch (err) {
      setError('Could not connect to the server.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleDischarge = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/patients/${patientId}/discharge`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dischargeType, dischargeWard, dischargeDate })
      });

      if (response.ok) {
        setSuccess(true);
      } else {
        setError('Failed to discharge patient.');
      }
    } catch (err) {
      setError('Could not connect to the server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dashboard-wrapper">
      <main className="main-content" style={{ marginLeft: 0, padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <header className="content-header no-print" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button onClick={() => navigate('/')} className="btn btn-outline" style={{ padding: '0.5rem' }}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1>Discharge records</h1>
            <p className="subtitle">Search for a patient to process their discharge.</p>
          </div>
        </header>

        <div className="form-container glass-panel">
          {!success ? (
            <>
              {/* Search Form */}
              <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Enter Patient ID..."
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  style={{ flexGrow: 1, padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', fontSize: '1rem' }}
                  required
                />
                <button type="submit" className="btn btn-primary" disabled={isSearching} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <Search size={18} /> {isSearching ? 'Searching...' : 'Find Patient'}
                </button>
              </form>

              {error && <div className="error-message" style={{ marginBottom: '2rem' }}>{error}</div>}

              {/* Patient Details & Discharge Form */}
              {patientData && (
                <div className="print-section" style={{ border: '1px solid var(--border-color)', borderRadius: '0.5rem', padding: '1.5rem' }}>
                  <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Patient Details</h3>
                  <div className="print-grid" style={{ marginBottom: '2rem' }}>
                    <p><strong>Name:</strong> {patientData.patientName}</p>
                    <p><strong>Age:</strong> {patientData.age}</p>
                    <p><strong>Gender:</strong> {patientData.gender || 'N/A'}</p>
                    <p><strong>Mother's Name:</strong> {patientData.motherName || 'N/A'}</p>
                    <p><strong>Mobile No:</strong> {patientData.mobileNo || 'N/A'}</p>
                    <p><strong>Aadhar No:</strong> {patientData.aadharNo || 'N/A'}</p>
                    <p><strong>Occupation:</strong> {patientData.occupation || 'N/A'}</p>
                    <p><strong>Caretaker:</strong> {patientData.caretakerName || 'N/A'}</p>
                    <p><strong>Address:</strong> {patientData.address || 'N/A'}</p>
                    <p><strong>Admission Ward:</strong> {patientData.wardName}</p>
                    <p><strong>Case Type:</strong> {patientData.caseType}</p>
                    <p><strong>AR No:</strong> {patientData.arNo || 'N/A'}</p>
                    <p><strong>Admission Date:</strong> {new Date(patientData.admissionDate).toLocaleString()}</p>
                  </div>

                  <form onSubmit={handleDischarge}>
                    <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Discharge Processing</h3>

                    <div className="form-row" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label>Discharge Date & Time *</label>
                        <input
                          type="datetime-local"
                          value={dischargeDate}
                          onChange={(e) => setDischargeDate(e.target.value)}
                          required
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', fontSize: '1rem', backgroundColor: 'white' }}
                        />
                      </div>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label>Discharge Ward *</label>
                        <select
                          value={dischargeWard}
                          onChange={(e) => setDischargeWard(e.target.value)}
                          required
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', fontSize: '1rem', backgroundColor: 'white' }}
                        >
                          <option value="">Select</option>
                          <option value="CH-Children Ward">CH-Children Ward</option>
                          <option value="CMCHIS Female Ward">CMCHIS Female Ward</option>
                          <option value="CMCHIS Male Ward">CMCHIS Male Ward</option>
                          <option value="Eye Ward">Eye Ward</option>
                          <option value="F1-Female Ward-1">F1-Female Ward-1</option>
                          <option value="F2-Female Ward-2">F2-Female Ward-2</option>
                          <option value="HD-Dialysis ward">HD-Dialysis ward</option>
                          <option value="Labour Ward">Labour Ward</option>
                          <option value="M1-Male Ward-1">M1-Male Ward-1</option>
                          <option value="M2-Male Ward-2">M2-Male Ward-2</option>
                          <option value="PS Ward">PS Ward</option>
                          <option value="SNCU">SNCU</option>
                          <option value="DEATH">DEATH</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                      <label>Discharge Type *</label>
                      <select
                        value={dischargeType}
                        onChange={(e) => setDischargeType(e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', fontSize: '1rem', backgroundColor: 'white' }}
                      >
                        <option value="Normal Discharge">Normal Discharge</option>
                        <option value="Abscond">Abscond</option>
                        <option value="Death">Death</option>
                        <option value="Refer">Refer</option>
                      </select>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ width: '100%' }}>
                      {isSubmitting ? 'Processing...' : 'Confirm Discharge'}
                    </button>
                  </form>
                </div>
              )}
            </>
          ) : (
            <div className="success-wrapper">
              <div className="success-message no-print" style={{ textAlign: 'center', padding: '2rem 1rem 1rem' }}>
                <CheckCircle2 size={64} className="success-icon" style={{ margin: '0 auto 1rem auto' }} />
                <h2 style={{ marginBottom: '1rem' }}>Discharge Successful!</h2>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}>
                  <button className="btn btn-primary" onClick={() => window.print()} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    Print Discharge Form
                  </button>
                  <button className="btn btn-outline" onClick={() => {
                    setSuccess(false);
                    setPatientData(null);
                    setPatientId('');
                    setDischargeType('Normal Discharge');
                  }}>
                    Process Another Discharge
                  </button>
                </div>
              </div>

              {/* Printable Discharge Summary */}
              <div className="print-section" style={{ border: '1px solid var(--border-color)', borderRadius: '0.5rem', padding: '2rem', marginTop: '2rem' }}>
                <div className="print-header" style={{ textAlign: 'center', marginBottom: '2rem', borderBottom: '2px solid #000', paddingBottom: '1rem' }}>
                  <h2 style={{ margin: '0 0 0.5rem 0', textTransform: 'uppercase', letterSpacing: '1px' }}>DIET SHEET - DISCHARGE FORM</h2>
                  <h3 style={{ margin: 0, fontWeight: 'normal' }}>GOVERNMENT HOSPITAL VRIDHACHALAM</h3>
                </div>

                <div className="print-grid" style={{ marginBottom: '2rem' }}>
                  <p><strong>Patient ID:</strong> {patientData?.patientId}</p>
                  <p><strong>Name:</strong> {patientData?.patientName}</p>
                  <p><strong>Age:</strong> {patientData?.age}</p>
                  <p><strong>Gender:</strong> {patientData?.gender || 'N/A'}</p>
                  <p><strong>Mother's Name:</strong> {patientData?.motherName || 'N/A'}</p>
                  <p><strong>Mobile No:</strong> {patientData?.mobileNo || 'N/A'}</p>
                  <p><strong>Aadhar No:</strong> {patientData?.aadharNo || 'N/A'}</p>
                  <p><strong>Address:</strong> {patientData?.address || 'N/A'}</p>
                </div>

                <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Admission & Discharge Details</h3>
                <div className="print-grid">
                  <p><strong>Case Type:</strong> {patientData?.caseType}</p>
                  <p><strong>AR No:</strong> {patientData?.arNo || 'N/A'}</p>
                  <p><strong>Admission Date:</strong> {new Date(patientData?.admissionDate).toLocaleString()}</p>
                  <p><strong>Admission Ward:</strong> {patientData?.wardName}</p>
                  <p><strong>Discharge Date:</strong> {new Date(dischargeDate).toLocaleString()}</p>
                  <p><strong>Discharge Ward:</strong> {dischargeWard}</p>
                  <p><strong>Discharge Type:</strong> <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{dischargeType}</span></p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Discharge Records Section */}
        <div style={{ marginTop: '3rem' }}>
          <button 
            onClick={fetchDischargeRecords} 
            className="btn btn-outline" 
            style={{ width: '100%', marginBottom: '1.5rem', fontWeight: 'bold' }}
          >
            {showRecords ? 'Hide Discharge Records' : 'Load Discharge Records Table'}
          </button>

          {showRecords && (
            <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
              <h2 style={{ marginBottom: '1.5rem' }}>Discharge Records Table</h2>
              {loadingRecords ? (
                <p>Loading discharge records...</p>
              ) : dischargeRecords.length === 0 ? (
                <p>No discharge records found.</p>
              ) : (
                <table className="records-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', whiteSpace: 'nowrap' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid var(--border-color)' }}>
                      <th style={{ padding: '1rem' }}>Patient ID</th>
                      <th style={{ padding: '1rem' }}>Name</th>
                      <th style={{ padding: '1rem' }}>Age</th>
                      <th style={{ padding: '1rem' }}>Gender</th>
                      <th style={{ padding: '1rem' }}>Case Type</th>
                      <th style={{ padding: '1rem' }}>AR No</th>
                      <th style={{ padding: '1rem' }}>Admission Date</th>
                      <th style={{ padding: '1rem' }}>Discharge Date</th>
                      <th style={{ padding: '1rem' }}>Discharge Type</th>
                      <th style={{ padding: '1rem' }}>Discharge Ward</th>
                      <th style={{ padding: '1rem' }}>Mobile</th>
                      <th style={{ padding: '1rem' }}>Aadhar No</th>
                      <th style={{ padding: '1rem' }}>Occupation</th>
                      <th style={{ padding: '1rem' }}>Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dischargeRecords.map((record, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '1rem' }}>{record.customPatientId || record.patient?.patientId}</td>
                        <td style={{ padding: '1rem', fontWeight: '500' }}>{record.patientName || 'N/A'}</td>
                        <td style={{ padding: '1rem' }}>{record.age || 'N/A'}</td>
                        <td style={{ padding: '1rem' }}>{record.gender || 'N/A'}</td>
                        <td style={{ padding: '1rem' }}>{record.caseType || 'N/A'}</td>
                        <td style={{ padding: '1rem' }}>{record.arNo || 'N/A'}</td>
                        <td style={{ padding: '1rem' }}>{record.admissionDate ? `${record.admissionDate} ${formatTime12Hour(record.admissionTime)}` : 'N/A'}</td>
                        <td style={{ padding: '1rem', color: 'var(--primary)', fontWeight: 'bold' }}>{new Date(record.dischargeDate).toLocaleString()}</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.875rem', fontWeight: 'bold', backgroundColor: record.dischargeType === 'Death' ? '#fee2e2' : '#dcfce3', color: record.dischargeType === 'Death' ? '#ef4444' : '#16a34a' }}>
                            {record.dischargeType}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>{record.dischargeWard}</td>
                        <td style={{ padding: '1rem' }}>{record.mobileNo || 'N/A'}</td>
                        <td style={{ padding: '1rem' }}>{record.aadharNo || 'N/A'}</td>
                        <td style={{ padding: '1rem' }}>{record.occupation || 'N/A'}</td>
                        <td style={{ padding: '1rem', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis' }} title={record.address}>{record.address || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DischargePage;
