import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Activity, Search } from 'lucide-react';
import './AdminDashboard.css';
import tnLogo from '../../asserts/tn_logo.jpg';
import TimeInput12Hour from '../components/TimeInput12Hour';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Inject scoped responsive styles for discharge page
const dischargeResponsiveStyle = `
  @media (max-width: 640px) {
    .discharge-form-row {
      flex-direction: column !important;
    }
    .discharge-search-bar {
      flex-direction: column !important;
    }
    .discharge-search-bar button {
      width: 100%;
    }
  }
  @media (max-width: 480px) {
    .print-grid {
      grid-template-columns: 1fr !important;
    }
  }
  @media print {
    /* Hide global app header and other non-print elements */
    .app-header, .content-header, .discharge-search-bar, button {
      display: none !important;
    }
    
    /* Remove browser default print headers/footers */
    @page {
      margin: 0;
      size: auto;
    }

    /* Provide a safe printable area */
    body {
      padding: 5mm !important;
      margin: 0 !important;
    }

    /* Ensure the print content tries to fit on one page */
    .print-section {
      page-break-inside: avoid;
      break-inside: avoid;
      margin-top: 0 !important;
      padding-top: 0 !important;
    }
  }
`;

let globalServerTimeOffsetMs = 0;

const DischargePage = () => {
  const navigate = useNavigate();
  const [patientNumber, setPatientNumber] = useState('');
  const patientId = `${new Date().getFullYear()}-${patientNumber}`;
  const [patientData, setPatientData] = useState(null);

  const getCurrentDate = () => {
    const now = new Date(Date.now() + globalServerTimeOffsetMs);
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  };

  const getCurrentTime = () => {
    const now = new Date(Date.now() + globalServerTimeOffsetMs);
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(11, 16);
  };

  const [dischargeType, setDischargeType] = useState('');
  const [dischargeWard, setDischargeWard] = useState('');
  const [dischargeDate, setDischargeDate] = useState(getCurrentDate());
  const [dischargeTime, setDischargeTime] = useState(getCurrentTime());
  const [manualDischargeDate, setManualDischargeDate] = useState(false);
  const [destinationTable, setDestinationTable] = useState('');
  const [destinationId, setDestinationId] = useState(null);
  const [caseType, setCaseType] = useState('');
  const [isEditingCaseType, setIsEditingCaseType] = useState(false);
  const [summaryText, setSummaryText] = useState('');
  const [isPatientDetailsOpen, setIsPatientDetailsOpen] = useState(false);

  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  React.useEffect(() => {
    fetch(`${API_BASE_URL}/api/server-time`)
      .then(res => res.json())
      .then(data => {
         const serverTimeMs = new Date(data.datetime).getTime();
         globalServerTimeOffsetMs = serverTimeMs - Date.now();
         
         setDischargeDate(prev => prev === new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0] ? getCurrentDate() : prev);
         setDischargeTime(prev => prev === new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(11, 16) ? getCurrentTime() : prev);
      })
      .catch(err => console.error("Failed to sync server time:", err));
  }, []);

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
        body: JSON.stringify({ dischargeType, dischargeWard, dischargeDate: `${dischargeDate}T${dischargeTime}`, destinationTable, caseType, summaryText })
      });

      if (response.ok) {
        const result = await response.json();
        setDestinationId(result.destinationId);
        setSuccess(true);
      } else {
        try {
          const errData = await response.json();
          setError(errData.error || 'Failed to discharge patient.');
        } catch {
          setError('Failed to discharge patient.');
        }
      }
    } catch (err) {
      setError('Could not connect to the server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUndoDischarge = async () => {
    if (!patientId) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/patients/${patientId}/undo-discharge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destinationTable, destinationId })
      });
      
      if (response.ok) {
        // Keep form states intact (dischargeType, destinationTable, etc) to pre-fill
        setSuccess(false);
        setDestinationId(null);
      } else {
        console.error("Failed to undo discharge.");
      }
    } catch (err) {
      console.error("Error connecting to server to undo discharge.");
    }
  };

  const getSummaryParts = () => {
    if (!summaryText) return { part1: '', part2: '' };
    
    let currentLines = 0;
    let breakPoint = 0;
    const rawLines = summaryText.split('\n');
    for (let i = 0; i < rawLines.length; i++) {
        const line = rawLines[i];
        currentLines += Math.max(1, Math.ceil(line.length / 90));
        breakPoint += line.length + 1;
        if (currentLines >= 14) {
            break;
        }
    }
    
    if (breakPoint >= summaryText.length) {
        return { part1: summaryText, part2: '' };
    }
    
    return {
        part1: summaryText.substring(0, breakPoint).trim(),
        part2: summaryText.substring(breakPoint).trim()
    };
  };

  return (
    <div className="dashboard-wrapper">
      <style>{dischargeResponsiveStyle}</style>
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
              <form onSubmit={handleSearch} className="discharge-search-bar" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'center' }}>
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
                  <div 
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      cursor: 'pointer', 
                      marginBottom: isPatientDetailsOpen ? '1rem' : '1.5rem',
                      borderBottom: isPatientDetailsOpen ? 'none' : '1px solid var(--border-color)',
                      paddingBottom: isPatientDetailsOpen ? '0' : '0.5rem'
                    }}
                    onClick={() => setIsPatientDetailsOpen(!isPatientDetailsOpen)}
                  >
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--primary-color)' }}>Patient Details {patientData.patientName ? `- ${patientData.patientName}` : ''}</h3>
                    <span style={{ fontSize: '1.2rem', transition: 'transform 0.3s' }}>
                      {isPatientDetailsOpen ? '▲' : '▼'}
                    </span>
                  </div>

                  {isPatientDetailsOpen && (
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginBottom: '1rem' }}>
                      <div className="print-grid">
                        <p><strong>Name:</strong> {patientData.patientName}</p>
                        <p><strong>Age:</strong> {patientData.age}</p>
                        <p><strong>Gender:</strong> {patientData.gender || 'N/A'}</p>
                        <p><strong>Relation Name:</strong> {patientData.motherName || 'N/A'}</p>
                        <p><strong>Mobile No:</strong> {patientData.mobileNo || 'N/A'}</p>
                        <p><strong>Aadhar No:</strong> {patientData.aadharNo || 'N/A'}</p>
                        <p><strong>Occupation:</strong> {patientData.occupation || 'N/A'}</p>

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
                              <button type="button" onClick={() => setIsEditingCaseType(false)} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem', borderRadius: '0.25rem', height: 'auto' }}>Done</button>
                            </>
                          ) : (
                            <>
                              {caseType}
                              <button type="button" onClick={() => setIsEditingCaseType(true)} className="btn btn-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem', borderRadius: '0.25rem', height: 'auto' }}>Edit</button>
                            </>
                          )}
                        </div>
                        <p><strong>AR No:</strong> {patientData.arNo || 'N/A'}</p>
                        <p><strong>Admission Date:</strong> {new Date(patientData.admissionDate).toLocaleString()}</p>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleDischarge}>
                    <h3 style={{ marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginTop: '1rem' }}>Discharge Processing</h3>

                    <div className="form-row" style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
                      <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                          <label style={{ marginBottom: 0, fontSize: '0.9rem' }}>Discharge Date and time *</label>
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
                            style={{ flex: 1, padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', fontSize: '0.95rem', backgroundColor: 'white' }}
                          />
                          <TimeInput12Hour
                            value={dischargeTime}
                            onChange={setDischargeTime}
                            disabled={!manualDischargeDate}
                            style={{ flex: 1, padding: '0.25rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}
                          />
                        </div>
                      </div>
                      <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                        <label style={{ color: 'red', marginBottom: '0.25rem', fontSize: '0.9rem' }}>Discharge Ward *</label>
                        <select
                          value={dischargeWard}
                          onChange={(e) => setDischargeWard(e.target.value)}
                          required
                          style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', fontSize: '0.95rem', backgroundColor: 'white' }}
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

                    <div className="form-row" style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
                      <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                        <label style={{ marginBottom: '0.25rem', fontSize: '0.9rem' }}>Discharge Type *</label>
                        <select
                          value={dischargeType}
                          onChange={(e) => setDischargeType(e.target.value)}
                          required
                          style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', fontSize: '0.95rem', backgroundColor: 'white' }}
                        >
                          <option value="">Select</option>
                          <option value="Normal Discharge">Normal Discharge</option>
                          <option value="Abscond">Abscond</option>
                          <option value="Death">Death</option>
                          <option value="Refer">Refer</option>
                        </select>
                      </div>
                      <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                        <label style={{ color: 'red', marginBottom: '0.25rem', fontSize: '0.9rem' }}>File transfer to *</label>
                        <select
                          value={destinationTable}
                          onChange={(e) => setDestinationTable(e.target.value)}
                          required
                          style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', fontSize: '0.95rem', backgroundColor: 'white' }}
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

                    <div className="form-group" style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <label style={{ margin: 0, fontSize: '0.9rem' }}>Summary / Remarks</label>
                        {(summaryText.length > 1200 || (summaryText.match(/\n/g) || []).length > 15) && (
                          <span style={{ color: '#b91c1c', fontSize: '0.85rem', fontWeight: 'bold' }}>
                            ⚠️ Warning: May spill to a second printed page
                          </span>
                        )}
                      </div>
                      <textarea
                        value={summaryText}
                        onChange={(e) => setSummaryText(e.target.value)}
                        placeholder="Enter summary or remarks"
                        rows="25"
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', fontSize: '0.95rem', resize: 'vertical', minHeight: '400px' }}
                      />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}>
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
                {destinationId && destinationTable && (
                  <div style={{ backgroundColor: 'var(--bg-color)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', display: 'inline-block', border: '1px solid var(--border-color)' }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Generated {destinationTable} ID:</p>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{destinationId}</p>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                  <button className="btn btn-outline" onClick={handleUndoDischarge} style={{ borderColor: 'var(--danger-color)', color: 'var(--danger-color)' }}>
                    Undo Discharge
                  </button>
                  <button className="btn btn-primary" onClick={() => window.print()} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    Print Discharge Form
                  </button>
                  <button className="btn btn-outline" onClick={() => {
                    setSuccess(false);
                    setPatientData(null);
                    setPatientNumber('');
                    setDischargeType('');
                    setDestinationTable('');
                    setDestinationId(null);
                  }}>
                    Process Another Discharge
                  </button>
                </div>
              </div>

              {/* Printable Discharge Summary */}
              <div className="print-section" style={{ border: '1px solid var(--border-color)', borderRadius: '0.5rem', padding: '2rem', marginTop: '2rem' }}>
                <div className="print-header" style={{ position: 'relative', textAlign: 'center', marginBottom: '2rem', borderBottom: '2px solid #000', paddingBottom: '1rem' }}>
                  <img src={tnLogo} alt="TN Logo" style={{ width: '80px', height: 'auto', marginBottom: '1rem' }} />
                  
                  {destinationId && destinationTable && (
                    <div style={{ position: 'absolute', top: 0, right: 0, border: '2px solid #000', padding: '0.5rem 1rem', borderRadius: '4px', textAlign: 'left', minWidth: '150px' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#333', marginBottom: '0.25rem' }}>
                        {destinationTable.replace(/_/g, ' ')} ID
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#000' }}>
                        {destinationId}
                      </div>
                    </div>
                  )}

                  <h2 style={{ margin: '0 0 0.5rem 0', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '900', color: '#000000', fontSize: '1.5rem' }}>
                    DISCHARGE SUMMARY - GOVERNMENT HOSPITAL VRIDHACHALAM
                  </h2>
                </div>

                <div style={{ marginBottom: '1rem', lineHeight: '1.6', fontSize: '0.95rem' }}>
                  <strong style={{ color: '#000' }}>Patient ID:</strong> {patientData?.patientId}<strong style={{ color: '#000' }}>, Name:</strong> {patientData?.patientName}<strong style={{ color: '#000' }}>, Age:</strong> {patientData?.age}<strong style={{ color: '#000' }}>, Gender:</strong> {patientData?.gender || 'N/A'}<strong style={{ color: '#000' }}>, Relation Name:</strong> {patientData?.motherName || 'N/A'}<strong style={{ color: '#000' }}>, Mobile No:</strong> {patientData?.mobileNo || 'N/A'}<strong style={{ color: '#000' }}>, Aadhar No:</strong> {patientData?.aadharNo || 'N/A'}<strong style={{ color: '#000' }}>, Address:</strong> {patientData?.address || 'N/A'}
                </div>

                <div style={{ marginBottom: '1.5rem', lineHeight: '1.6', fontSize: '0.95rem', borderTop: '1px solid #000', borderBottom: '1px solid #000', padding: '0.5rem 0' }}>
                  <strong style={{ color: '#000' }}>Admission & Discharge Details:</strong> <strong style={{ color: '#000' }}>Case Type:</strong> {caseType}<strong style={{ color: '#000' }}>, AR No:</strong> {patientData?.arNo || 'N/A'}<strong style={{ color: '#000' }}>, Admission Date:</strong> {new Date(patientData?.admissionDate).toLocaleString()}<strong style={{ color: '#000' }}>, Admission Ward:</strong> {patientData?.wardName}<strong style={{ color: '#000' }}>, Discharge Date:</strong> {new Date(`${dischargeDate}T${dischargeTime}`).toLocaleString()}<strong style={{ color: '#000' }}>, Discharge Ward:</strong> {dischargeWard}<strong style={{ color: '#000' }}>, Discharge Type:</strong> <span style={{ fontWeight: 'bold' }}>{dischargeType}</span>
                </div>

                {summaryText && (() => {
                  const parts = getSummaryParts();
                  if (!parts.part2) {
                    return (
                      <div>
                        <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem', textTransform: 'uppercase' }}>Summary / Remarks:</h3>
                        <div style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', lineHeight: '1.6', fontSize: '0.95rem' }}>
                          {parts.part1}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2.5rem' }}>
                          <div style={{ width: '120px' }}></div>
                          <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.05rem' }}>
                            *** END OF DISCHARGE SUMMARY ***
                          </div>
                          <div style={{ width: '120px', textAlign: 'right', fontSize: '0.95rem', fontWeight: 'bold' }}>
                            Page no : 1
                          </div>
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div>
                        <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem', textTransform: 'uppercase' }}>Summary / Remarks:</h3>
                        <div style={{ position: 'relative', height: '150mm' }}>
                          <div style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', lineHeight: '1.6', fontSize: '0.95rem' }}>
                            {parts.part1}
                          </div>
                          
                          {/* Absolute positioned footer at the bottom of the 150mm container */}
                          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ width: '120px' }}></div>
                            <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.05rem' }}>
                              *** END OF DISCHARGE SUMMARY (Please continue on back side of this page) ***
                            </div>
                            <div style={{ width: '120px', textAlign: 'right', fontSize: '0.95rem', fontWeight: 'bold' }}>
                              Page no : 1
                            </div>
                          </div>
                        </div>
                        
                        <div style={{ pageBreakBefore: 'always', paddingTop: '2rem' }}>
                          <div style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word', lineHeight: '1.6', fontSize: '0.95rem' }}>
                            {parts.part2}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '3rem' }}>
                            <div style={{ width: '120px' }}></div>
                            <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.05rem' }}>
                              *** END OF DISCHARGE SUMMARY ***
                            </div>
                            <div style={{ width: '120px', textAlign: 'right', fontSize: '0.95rem', fontWeight: 'bold' }}>
                              Page no : 2
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                })()}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DischargePage;
