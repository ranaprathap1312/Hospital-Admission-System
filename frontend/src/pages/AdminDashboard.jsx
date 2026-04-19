import React, { useState } from 'react';
import { UserPlus, LayoutDashboard, Settings, LogOut, CheckCircle2, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './AdminDashboard.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const AdminDashboard = () => {
  const getCurrentDateTime = () => {
    return new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState({
    patientName: '',
    age: '',
    motherName: '',
    patientId: '',
    admissionDate: getCurrentDateTime(),
    wardName: '',
    mobileNo: '',
    aadharNo: '',
    occupation: '',
    caretakerName: '',
    street: '',
    village: '',
    taluk: 'Vridhachalam',
    district: 'Cuddalore',
    caseType: 'NON MLC',
    arNo: '',
    gender: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState('FORM'); // 'FORM', 'SUCCESS', 'PRINT'
  const [activeTab, setActiveTab] = useState('ADMISSION'); // 'ADMISSION', 'RECORDS'
  const [submittedData, setSubmittedData] = useState(null);
  const [error, setError] = useState('');
  const [manualPatientId, setManualPatientId] = useState(false);
  const [manualAdmissionDate, setManualAdmissionDate] = useState(false);
  const [predictedNextId, setPredictedNextId] = useState('Loading...');
  
  // Patient Records State
  const [patients, setPatients] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchColumn, setSearchColumn] = useState('All Columns');

  // Fetch next ID on mount
  React.useEffect(() => {
    fetchNextId();
  }, []);

  // Fetch patients when switching to RECORDS tab
  React.useEffect(() => {
    if (activeTab === 'RECORDS') {
      fetchPatients();
    }
  }, [activeTab]);

  const fetchNextId = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/patients`);
      const data = await response.json();
      if (data && data.length > 0) {
        const maxId = Math.max(...data.map(p => p.id || 0));
        setPredictedNextId(`${maxId + 1}`);
      } else {
        setPredictedNextId('1');
      }
    } catch (err) {
      setPredictedNextId('Unknown');
    }
  };

  const fetchPatients = async () => {
    setLoadingRecords(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/patients/master-admissions`);
      const data = await response.json();
      setPatients(data);
    } catch (err) {
      console.error('Failed to fetch patients', err);
    } finally {
      setLoadingRecords(false);
    }
  };

  const filteredPatients = patients.filter(patient => {
    const query = searchQuery.toLowerCase();
    if (!query) return true;

    if (searchColumn === 'All Columns') {
      return (
        (patient.patientName && patient.patientName.toLowerCase().includes(query)) ||
        (patient.patientId && patient.patientId.toLowerCase().includes(query)) ||
        (patient.mobileNo && patient.mobileNo.includes(query)) ||
        (patient.wardName && patient.wardName.toLowerCase().includes(query)) ||
        (patient.aadharNo && patient.aadharNo.includes(query)) ||
        (patient.address && patient.address.toLowerCase().includes(query))
      );
    }

    const valueToCheck = (() => {
      switch (searchColumn) {
        case 'Patient ID': return patient.patientId;
        case 'Name': return patient.patientName;
        case 'Age': return patient.age ? patient.age.toString() : '';
        case 'Gender': return patient.gender;
        case 'Case Type': return patient.caseType;
        case 'AR No': return patient.arNo;
        case 'Aadhar No': return patient.aadharNo;
        case 'Mobile': return patient.mobileNo;
        case 'Ward': return patient.wardName;
        case 'Admission Date': return patient.admissionDate ? new Date(patient.admissionDate).toLocaleString() : '';
        case 'Occupation': return patient.occupation;
        case "Mother's Name": return patient.motherName;
        case 'Caretaker Name': return patient.caretakerName;
        case 'Address': return patient.address;
        case 'Status': return patient.status;
        default: return '';
      }
    })();

    return valueToCheck && valueToCheck.toString().toLowerCase().includes(query);
  });

  const handleChange = (e) => {
    let { name, value } = e.target;
    
    if (name === 'mobileNo') {
      // Allow only numbers and restrict to 10 digits
      value = value.replace(/\D/g, '');
      if (value.length > 10) value = value.slice(0, 10);
    }
    
    if (name === 'aadharNo') {
      // Allow only numbers, restrict to 12 digits, and format as XXXX XXXX XXXX
      value = value.replace(/\D/g, '');
      if (value.length > 12) value = value.slice(0, 12);
      if (value.length > 0) {
        value = value.match(/.{1,4}/g).join(' ');
      }
    }

    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      const payload = {
        ...formData,
        address: `${formData.street}, ${formData.village}, ${formData.taluk}, ${formData.district}`
      };

      const response = await fetch(`${API_BASE_URL}/api/patients/admit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        const savedPatient = await response.json();
        setIsSubmitting(false);
        setSubmittedData(savedPatient);
        setViewMode('SUCCESS');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setIsSubmitting(false);
        setError('Failed to admit patient. Make sure Aadhar number is unique and all data is correct.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        alert("Failed to admit patient! Please check the error at the top of the form.");
      }
    } catch (err) {
      setIsSubmitting(false);
      setError('Could not connect to the server. Is the backend running?');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      console.error(err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleNewAdmission = () => {
    setFormData({
      patientName: '', age: '', motherName: '', patientId: '',
      admissionDate: getCurrentDateTime(), wardName: '', mobileNo: '', aadharNo: '',
      occupation: '', caretakerName: '', street: '', village: '',
      taluk: 'Vridhachalam', district: 'Cuddalore', caseType: 'NON MLC', arNo: '', gender: ''
    });
    setManualPatientId(false);
    setManualAdmissionDate(false);
    setSubmittedData(null);
    fetchNextId(); // Refresh the ID for the new form
    setViewMode('FORM');
  };

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>TN GH Admin</h2>
        </div>
        <nav className="sidebar-nav">
          <a href="#" className={`nav-item ${activeTab === 'ADMISSION' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('ADMISSION'); }}>
            <UserPlus size={20} /> New Admission
          </a>
          <a href="#" className={`nav-item ${activeTab === 'RECORDS' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('RECORDS'); }}>
            <LayoutDashboard size={20} /> Patient Records
          </a>
          <a href="#" className="nav-item">
            <Settings size={20} /> Settings
          </a>
        </nav>
        <div className="sidebar-footer">
          <Link to="/" className="nav-item text-danger">
            <LogOut size={20} /> Logout
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="content-header">
          {activeTab === 'ADMISSION' ? (
            <div style={{ textAlign: 'center', width: '100%' }}>
              <h1>DIET SHEET - ADMISSION FORM</h1>
              <p className="subtitle">GOVERNMENT HOSPITAL VRIDHACHALAM</p>
            </div>
          ) : (
            <>
              <h1>Patient Records</h1>
              <p className="subtitle">View and search through all admitted patients.</p>
            </>
          )}
        </header>

        <div className="form-container glass-panel">
          {activeTab === 'RECORDS' && (
            <div className="records-view">
              <div className="records-controls" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input 
                  type="text" 
                  placeholder={`Search by ${searchColumn}...`} 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                  style={{ flexGrow: 1, padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', fontSize: '1rem' }}
                />
                <select 
                  value={searchColumn} 
                  onChange={(e) => setSearchColumn(e.target.value)}
                  style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', fontSize: '1rem', backgroundColor: 'white', minWidth: '180px' }}
                >
                  <option value="All Columns">All Columns</option>
                  <option value="Patient ID">Patient ID</option>
                  <option value="Name">Name</option>
                  <option value="Age">Age</option>
                  <option value="Gender">Gender</option>
                  <option value="Case Type">Case Type</option>
                  <option value="AR No">AR No</option>
                  <option value="Aadhar No">Aadhar No</option>
                  <option value="Mobile">Mobile</option>
                  <option value="Ward">Ward</option>
                  <option value="Admission Date">Admission Date</option>
                  <option value="Occupation">Occupation</option>
                  <option value="Mother's Name">Mother's Name</option>
                  <option value="Caretaker Name">Caretaker Name</option>
                  <option value="Address">Address</option>
                  <option value="Status">Status</option>
                </select>
              </div>
              
              {loadingRecords ? (
                <p>Loading patient records...</p>
              ) : filteredPatients.length === 0 ? (
                <p>No patient records found.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="records-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', whiteSpace: 'nowrap' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid var(--border-color)' }}>
                        <th style={{ padding: '1rem' }}>Patient ID</th>
                        <th style={{ padding: '1rem' }}>Name</th>
                        <th style={{ padding: '1rem' }}>Age</th>
                        <th style={{ padding: '1rem' }}>Gender</th>
                        <th style={{ padding: '1rem' }}>Case Type</th>
                        <th style={{ padding: '1rem' }}>AR No</th>
                        <th style={{ padding: '1rem' }}>Aadhar No</th>
                        <th style={{ padding: '1rem' }}>Mobile</th>
                        <th style={{ padding: '1rem' }}>Ward</th>
                        <th style={{ padding: '1rem' }}>Admission Date</th>
                        <th style={{ padding: '1rem' }}>Occupation</th>
                        <th style={{ padding: '1rem' }}>Mother's Name</th>
                        <th style={{ padding: '1rem' }}>Caretaker Name</th>
                        <th style={{ padding: '1rem' }}>Address</th>
                        <th style={{ padding: '1rem' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPatients.map(patient => (
                        <tr key={patient.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '1rem' }}>{patient.patientId || 'N/A'}</td>
                          <td style={{ padding: '1rem', fontWeight: '500' }}>{patient.patientName}</td>
                          <td style={{ padding: '1rem' }}>{patient.age}</td>
                          <td style={{ padding: '1rem' }}>{patient.gender || 'N/A'}</td>
                          <td style={{ padding: '1rem' }}>{patient.caseType || 'N/A'}</td>
                          <td style={{ padding: '1rem' }}>{patient.arNo || 'N/A'}</td>
                          <td style={{ padding: '1rem' }}>{patient.aadharNo || 'N/A'}</td>
                          <td style={{ padding: '1rem' }}>{patient.mobileNo}</td>
                          <td style={{ padding: '1rem' }}>{patient.wardName}</td>
                          <td style={{ padding: '1rem' }}>{new Date(patient.admissionDate).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}</td>
                          <td style={{ padding: '1rem' }}>{patient.occupation || 'N/A'}</td>
                          <td style={{ padding: '1rem' }}>{patient.motherName || 'N/A'}</td>
                          <td style={{ padding: '1rem' }}>{patient.caretakerName || 'N/A'}</td>
                          <td style={{ padding: '1rem', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis' }} title={patient.address}>{patient.address || 'N/A'}</td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{ 
                              padding: '0.25rem 0.5rem', 
                              borderRadius: '999px', 
                              fontSize: '0.85rem',
                              fontWeight: '500',
                              backgroundColor: patient.status === 'ADMITTED' ? '#dcfce7' : '#f1f5f9',
                              color: patient.status === 'ADMITTED' ? '#166534' : '#475569'
                            }}>
                              {patient.status || 'N/A'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'ADMISSION' && viewMode === 'SUCCESS' && (
            <div className="success-message">
              <CheckCircle2 size={48} className="success-icon" />
              <h3>Admission Successful!</h3>
              <p>Patient {submittedData?.patientName} has been securely registered to {submittedData?.wardName}.</p>
              <div className="success-actions" style={{marginTop: '2rem', display: 'flex', gap: '1rem'}}>
                <button className="btn btn-outline" onClick={handleNewAdmission}>Start New Admission</button>
                <button className="btn btn-primary" onClick={() => setViewMode('PRINT')}>View Patient Details / Print</button>
              </div>
            </div>
          )}

          {viewMode === 'PRINT' && submittedData && (
            <div className="print-view">
              <div className="print-header">
                <Activity size={32} className="print-logo" />
                <h2>TN GH - Official Admission Record</h2>
                <p>Date: {new Date().toLocaleDateString()}</p>
              </div>
              
              <div className="print-body">
                <div className="print-section">
                  <h3>Patient Information</h3>
                  <div className="print-grid">
                    <p><strong>Name:</strong> {submittedData.patientName}</p>
                    <p><strong>Age:</strong> {submittedData.age}</p>
                    <p><strong>Gender:</strong> {submittedData.gender}</p>
                    <p><strong>Mother's Name:</strong> {submittedData.motherName || 'N/A'}</p>
                    <p><strong>Occupation:</strong> {submittedData.occupation || 'N/A'}</p>
                    <p><strong>Caretaker:</strong> {submittedData.caretakerName || 'N/A'}</p>
                    <p><strong>Address:</strong> {submittedData.address}</p>
                  </div>
                </div>

                <div className="print-section">
                  <h3>Admission Details</h3>
                  <div className="print-grid">
                    <p><strong>Patient ID:</strong> {submittedData.patientId || 'Pending Assignment'}</p>
                    <p><strong>Case Type:</strong> {submittedData.caseType}</p>
                    {submittedData.caseType === 'MLC' && <p><strong>AR No:</strong> {submittedData.arNo}</p>}
                    <p><strong>Aadhar No:</strong> {submittedData.aadharNo}</p>
                    <p><strong>Admission Date:</strong> {new Date(submittedData.admissionDate).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}</p>
                    <p><strong>Ward Name:</strong> {submittedData.wardName}</p>
                    <p><strong>Mobile No:</strong> {submittedData.mobileNo}</p>
                  </div>
                </div>
              </div>

              <div className="print-footer no-print">
                <button className="btn btn-outline" onClick={handleNewAdmission}>Back to Form</button>
                <button className="btn btn-primary" onClick={handlePrint}>Print Record</button>
              </div>
            </div>
          )}

          {activeTab === 'ADMISSION' && viewMode === 'FORM' && (
            <form onSubmit={handleSubmit} className="admission-form">
              {error && <div className="error-message" style={{marginBottom: '2rem'}}>{error}</div>}
              <div className="form-grid">
                
                {/* Personal Details */}
                <div className="form-section">
                  <h3 className="section-title">Personal Details</h3>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Patient Name *</label>
                      <input type="text" name="patientName" value={formData.patientName} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                      {/* Empty slot for balance */}
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Age *</label>
                      <input type="number" name="age" value={formData.age} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                      <label>Gender *</label>
                      <input type="text" name="gender" value={formData.gender} onChange={handleChange} required />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Mother's Name</label>
                      <input type="text" name="motherName" value={formData.motherName} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label>Occupation</label>
                      <input type="text" name="occupation" value={formData.occupation} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Caretaker Name</label>
                      <input type="text" name="caretakerName" value={formData.caretakerName} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      {/* Empty slot for balance */}
                    </div>
                  </div>
                </div>

                {/* Admission & Contact Details */}
                <div className="form-section">
                  <h3 className="section-title">Admission & Contact Info</h3>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label>
                          Patient ID 
                          {!manualPatientId && <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'normal' }}>(Auto-Generated patient ID)</span>}
                        </label>
                        <label style={{ fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <input 
                            type="checkbox" 
                            checked={manualPatientId} 
                            onChange={(e) => {
                              setManualPatientId(e.target.checked);
                              if (!e.target.checked) setFormData({...formData, patientId: ''});
                            }} 
                            style={{ width: 'auto' }}
                          />
                          Manual Entry
                        </label>
                      </div>
                      <input 
                        type="text" 
                        name="patientId"
                        value={manualPatientId ? formData.patientId : predictedNextId} 
                        readOnly={!manualPatientId}
                        onChange={handleChange}
                        placeholder={manualPatientId ? "Enter custom Patient ID" : ""}
                        style={!manualPatientId ? { backgroundColor: '#e2e8f0', cursor: 'not-allowed', fontWeight: 'bold' } : {}} 
                      />
                    </div>
                    <div className="form-group">
                      <label>Aadhar No *</label>
                      <input type="text" name="aadharNo" value={formData.aadharNo} onChange={handleChange} required />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Case Type *</label>
                      <select name="caseType" value={formData.caseType} onChange={handleChange} required>
                        <option value="NON MLC">NON MLC</option>
                        <option value="MLC">MLC</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>AR No {formData.caseType === 'MLC' ? '*' : ''}</label>
                      <input type="text" name="arNo" value={formData.arNo} onChange={handleChange} required={formData.caseType === 'MLC'} />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label>Admission Date *</label>
                        <label style={{ fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <input 
                            type="checkbox" 
                            checked={manualAdmissionDate} 
                            onChange={(e) => {
                              setManualAdmissionDate(e.target.checked);
                              if (!e.target.checked) setFormData({...formData, admissionDate: getCurrentDateTime()});
                            }} 
                            style={{ width: 'auto' }}
                          />
                          Edit
                        </label>
                      </div>
                      <div style={{ width: '100%' }}>
                        <DatePicker
                          selected={formData.admissionDate ? new Date(formData.admissionDate) : null}
                          onChange={(date) => {
                            if (date) {
                              const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
                              setFormData({...formData, admissionDate: offsetDate.toISOString().slice(0, 16)});
                            }
                          }}
                          showTimeSelect
                          timeFormat="hh:mm aa"
                          timeIntervals={15}
                          timeCaption="Time"
                          dateFormat="MMM d, yyyy h:mm aa"
                          disabled={!manualAdmissionDate}
                          className="search-input"
                          wrapperClassName="date-picker-wrapper"
                          style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Ward Name *</label>
                      <select name="wardName" value={formData.wardName} onChange={handleChange} required>
                        <option value="">Select Ward</option>
                        <option value="General">General Ward</option>
                        <option value="ICU">ICU</option>
                        <option value="Maternity">Maternity</option>
                        <option value="Pediatrics">Pediatrics</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Mobile No *</label>
                      <input type="tel" name="mobileNo" value={formData.mobileNo} onChange={handleChange} required />
                    </div>
                  </div>
                  
                  <h3 className="section-title" style={{ marginTop: '1.5rem' }}>Address Details</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Street / Box *</label>
                      <input type="text" name="street" value={formData.street} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                      <label>Village / Town *</label>
                      <input type="text" name="village" value={formData.village} onChange={handleChange} required />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Taluk *</label>
                      <input type="text" name="taluk" value={formData.taluk} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                      <label>District *</label>
                      <input type="text" name="district" value={formData.district} onChange={handleChange} required />
                    </div>
                  </div>
                </div>

              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={() => window.history.back()}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Complete Admission'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
