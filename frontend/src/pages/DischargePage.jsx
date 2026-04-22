import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Activity, Search } from 'lucide-react';
import './AdminDashboard.css';
import tnLogo from '../../asserts/tn_logo.jpg';
import TimeInput12Hour from '../components/TimeInput12Hour';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const DischargePage = () => {
  const navigate = useNavigate();
  const [patientNumber, setPatientNumber] = useState('');
  const patientId = `${new Date().getFullYear()}-${patientNumber}`;
  const [patientData, setPatientData] = useState(null);

  const getCurrentDate = () => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  };

  const getCurrentTime = () => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(11, 16);
  };

  const [dischargeType, setDischargeType] = useState('');
  const [dischargeWard, setDischargeWard] = useState('');
  const [dischargeDate, setDischargeDate] = useState(getCurrentDate());
  const [dischargeTime, setDischargeTime] = useState(getCurrentTime());
  const [manualDischargeDate, setManualDischargeDate] = useState(false);
  const [destinationTable, setDestinationTable] = useState('');
  const [caseType, setCaseType] = useState('');
  const [isEditingCaseType, setIsEditingCaseType] = useState(false);
  const [summaryText, setSummaryText] = useState('');

  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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
        setPatientData(data);
        setCaseType(data.caseType || '');
        setIsEditingCaseType(false);
        setSummaryText('');
        setDischargeWard('');
        setDischargeDate(getCurrentDate());
        setDischargeTime(getCurrentTime());
      } else if (response.status === 404) {
        setError(`No active patient found with ID "${patientId}". They may already be discharged.`);
      } else {
        setError('Could not find patient. Please try again.');
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
        body: JSON.stringify({ dischargeType, dischargeWard, dischargeDate: `${dischargeDate}T${dischargeTime}`, destinationTable, caseType })
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
          <button onClick={() => navigate('/admin')} className="btn btn-outline" style={{ padding: '0.5rem' }}>
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
              <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: '#fcfcfc', overflow: 'hidden', flexGrow: 1, height: '48px' }}>
                  <span style={{ padding: '0 1rem', color: 'var(--text-muted)', fontWeight: '600', backgroundColor: '#f4f5f7', borderRight: '1px solid var(--border-color)', height: '100%', display: 'flex', alignItems: 'center' }}>
                    {new Date().getFullYear()}-
                  </span>
                  <input
                    type="number"
                    className="search-input"
                    placeholder="IP No..."
                    value={patientNumber}
                    onChange={(e) => setPatientNumber(e.target.value)}
                    style={{ flexGrow: 1, padding: '0 1rem', border: 'none', background: 'transparent', height: '100%', outline: 'none', fontSize: '1rem' }}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={isSearching} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', height: '48px' }}>
                  <Search size={18} /> {isSearching ? 'Searching...' : 'Find Patient'}
                </button>
              </form>

              {error && (
                <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', border: '2px solid #ef4444', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Activity size={28} />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>Action Blocked</h3>
                    <p style={{ margin: 0, marginTop: '0.25rem', fontSize: '1rem' }}>{error}</p>
                  </div>
                </div>
              )}

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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <strong>Case Type:</strong>
                      {isEditingCaseType ? (
                        <>
                          <select
                            value={caseType}
                            onChange={(e) => setCaseType(e.target.value)}
                            style={{ padding: '0.25rem', borderRadius: '0.25rem', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}
                          >
                            <option value="Non-MLC">Non-MLC</option>
                            <option value="MLC">MLC</option>

                          </select>
                          <button type="button" onClick={() => setIsEditingCaseType(false)} className="btn btn-primary" style={{ padding: '0.1rem 0.5rem', fontSize: '0.8rem' }}>Done</button>
                        </>
                      ) : (
                        <>
                          {caseType}
                          <button type="button" onClick={() => setIsEditingCaseType(true)} className="btn btn-outline" style={{ padding: '0.1rem 0.5rem', fontSize: '0.8rem' }}>Edit</button>
                        </>
                      )}
                    </div>
                    <p><strong>AR No:</strong> {patientData.arNo || 'N/A'}</p>
                    <p><strong>Admission Date:</strong> {new Date(patientData.admissionDate).toLocaleString()}</p>
                  </div>

                  <form onSubmit={handleDischarge}>
                    <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Discharge Processing</h3>

                    <div className="form-row" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <label style={{ marginBottom: 0 }}>Discharge Date and time *</label>
                          <label style={{ fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: 0, fontWeight: 'normal' }}>
                            <input
                              type="checkbox"
                              checked={manualDischargeDate}
                              onChange={(e) => {
                                setManualDischargeDate(e.target.checked);
                                if (!e.target.checked) {
                                  setDischargeDate(getCurrentDate());
                                  setDischargeTime(getCurrentTime());
                                }
                              }}
                              style={{ width: 'auto' }}
                            />
                            Manual Edit
                          </label>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input
                            type="date"
                            value={dischargeDate}
                            onChange={(e) => setDischargeDate(e.target.value)}
                            disabled={!manualDischargeDate}
                            required
                            style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', fontSize: '1rem', backgroundColor: 'white' }}
                          />
                          <TimeInput12Hour
                            value={dischargeTime}
                            onChange={setDischargeTime}
                            disabled={!manualDischargeDate}
                            style={{ flex: 1, padding: '0.25rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}
                          />
                        </div>
                      </div>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label style={{ color: 'red' }}>Discharge Ward *</label>
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
                        </select>
                      </div>
                    </div>

                    <div className="form-row" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label>Discharge Type *</label>
                        <select
                          value={dischargeType}
                          onChange={(e) => setDischargeType(e.target.value)}
                          required
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', fontSize: '1rem', backgroundColor: 'white' }}
                        >
                          <option value="">Select</option>
                          <option value="Normal Discharge">Normal Discharge</option>
                          <option value="Abscond">Abscond</option>
                          <option value="Death">Death</option>
                          <option value="Refer">Refer</option>
                        </select>
                      </div>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label style={{ color: 'red' }}>File transfer to *</label>
                        <select
                          value={destinationTable}
                          onChange={(e) => setDestinationTable(e.target.value)}
                          required
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', fontSize: '1rem', backgroundColor: 'white' }}
                        >
                          <option value="">Select</option>
                          <option value="mlc_discharge">mlc_discharge</option>
                          <option value="death_discharge">death_discharge</option>
                          <option value="maternity_block_discharge">maternity_block_discharge</option>
                          <option value="insurance_block_discharge">insurance_block_discharge</option>
                          <option value="general_side_discharge">general_side_discharge</option>
                          <option value="x6">x6</option>
                          <option value="x7">x7</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <label style={{ width: '100%', textAlign: 'center' }}>Summary / Remarks</label>
                      <textarea
                        value={summaryText}
                        onChange={(e) => setSummaryText(e.target.value)}
                        placeholder="Enter summary or remarks"
                        rows="4"
                        style={{ width: '100%', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', fontSize: '1rem', resize: 'none', textAlign: 'center' }}
                      />
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
                    setPatientNumber('');
                    setDischargeType('');
                    setDestinationTable('');
                  }}>
                    Process Another Discharge
                  </button>
                </div>
              </div>

              {/* Printable Discharge Summary */}
              <div className="print-section" style={{ border: '1px solid var(--border-color)', borderRadius: '0.5rem', padding: '2rem', marginTop: '2rem' }}>
                <div className="print-header" style={{ textAlign: 'center', marginBottom: '2rem', borderBottom: '2px solid #000', paddingBottom: '1rem' }}>
                  <img src={tnLogo} alt="TN Logo" style={{ width: '80px', height: 'auto', marginBottom: '1rem' }} />
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
                  <p><strong>Case Type:</strong> {caseType}</p>
                  <p><strong>AR No:</strong> {patientData?.arNo || 'N/A'}</p>
                  <p><strong>Admission Date:</strong> {new Date(patientData?.admissionDate).toLocaleString()}</p>
                  <p><strong>Admission Ward:</strong> {patientData?.wardName}</p>
                  <p><strong>Discharge Date:</strong> {new Date(`${dischargeDate}T${dischargeTime}`).toLocaleString()}</p>
                  <p><strong>Discharge Ward:</strong> {dischargeWard}</p>
                  <p><strong>Discharge Type:</strong> <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{dischargeType}</span></p>
                  {summaryText && (
                    <p style={{ gridColumn: '1 / -1', marginTop: '1rem' }}><strong>Summary / Remarks:</strong><br />{summaryText}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DischargePage;
