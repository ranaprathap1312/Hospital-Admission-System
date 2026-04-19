import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Activity, Search } from 'lucide-react';
import './AdminDashboard.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const DischargePage = () => {
  const navigate = useNavigate();
  const [patientId, setPatientId] = useState('');
  const [patientData, setPatientData] = useState(null);
  const [dischargeType, setDischargeType] = useState('Normal Discharge');
  
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
        if (data.status === 'DISCHARGED') {
            setError(`Patient ${data.patientName} is already discharged.`);
        } else {
            setPatientData(data);
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
        body: JSON.stringify({ dischargeType })
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
        <header className="content-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button onClick={() => navigate('/')} className="btn btn-outline" style={{ padding: '0.5rem' }}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1>Discharge Entry</h1>
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
                    <p><strong>Ward:</strong> {patientData.wardName}</p>
                    <p><strong>Case Type:</strong> {patientData.caseType}</p>
                    {patientData.caseType === 'MLC' && <p><strong>AR No:</strong> {patientData.arNo}</p>}
                    <p><strong>Admission Date:</strong> {new Date(patientData.admissionDate).toLocaleString()}</p>
                  </div>

                  <form onSubmit={handleDischarge}>
                    <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Discharge Processing</h3>
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
            <div className="success-message" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <CheckCircle2 size={64} className="success-icon" style={{ margin: '0 auto 1rem auto' }} />
              <h2 style={{ marginBottom: '1rem' }}>Discharge Successful!</h2>
              <p style={{ marginBottom: '2rem' }}>Patient {patientData?.patientName} has been officially discharged as <strong>{dischargeType}</strong>.</p>
              <button className="btn btn-outline" onClick={() => {
                setSuccess(false);
                setPatientData(null);
                setPatientId('');
              }}>
                Process Another Discharge
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DischargePage;
