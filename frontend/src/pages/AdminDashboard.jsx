import React, { useState } from 'react';
import { UserPlus, LayoutDashboard, Settings, LogOut, CheckCircle2, Activity, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './AdminDashboard.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const AdminDashboard = () => {
  const getCurrentDate = () => {
    return new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toTimeString().split(' ')[0].substring(0, 5);
  };

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

  const downloadAsExcel = () => {
    if (filteredPatients.length === 0) return;

    // Define the headers
    const headers = [
      'Patient ID', 'Name', 'Age', 'Gender', 'Case Type', 'AR No', 
      'Aadhar No', 'Mobile', 'Ward', 'Admission Date', 'Admission Time', 
      'Occupation', 'Mother Name', 'Caretaker Name', 'Address', 'Status'
    ];

    // Map the filtered patients to rows
    const rows = filteredPatients.map(p => [
      p.patientId || '',
      p.patientName || '',
      p.age || '',
      p.gender || '',
      p.caseType || '',
      p.arNo || '',
      p.aadharNo || '',
      p.mobileNo || '',
      p.wardName || '',
      p.admissionDate || '',
      formatTime12Hour(p.admissionTime),
      p.occupation || '',
      p.motherName || '',
      p.caretakerName || '',
      p.address ? `"${p.address.replace(/"/g, '""')}"` : '', // Escape commas
      p.status || ''
    ]);

    // Construct the CSV string
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    // Create a Blob and trigger the download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `Filtered_Patients_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [formData, setFormData] = useState({
    patientName: '',
    age: '',
    motherName: '',
    patientId: '',
    admissionDate: getCurrentDate(),
    admissionTime: getCurrentTime(),
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
  const [filters, setFilters] = useState([{ column: 'All Columns', value: '', addressType: 'All', subType: 'All', rangeStart: '', rangeEnd: '' }]);

  // Active Patients State (from patients table - currently admitted only)
  const [activePatients, setActivePatients] = useState([]);
  const [loadingActivePatients, setLoadingActivePatients] = useState(false);

  // Discharge Records State
  const [dischargeRecords, setDischargeRecords] = useState([]);
  const [loadingDischarges, setLoadingDischarges] = useState(false);

  const addFilter = () => {
    setFilters([...filters, { column: 'All Columns', value: '', addressType: 'All', subType: 'All', rangeStart: '', rangeEnd: '' }]);
  };

  const removeFilter = (index) => {
    if (filters.length > 1) {
      setFilters(filters.filter((_, i) => i !== index));
    } else {
      setFilters([{ column: 'All Columns', value: '', addressType: 'All', subType: 'All', rangeStart: '', rangeEnd: '' }]);
    }
  };

  const updateFilter = (index, field, value) => {
    const newFilters = [...filters];
    newFilters[index][field] = value;
    if (field === 'column') {
      newFilters[index].subType = 'All';
      newFilters[index].value = '';
      newFilters[index].rangeStart = '';
      newFilters[index].rangeEnd = '';
    }
    setFilters(newFilters);
  };

  // Fetch next ID on mount
  React.useEffect(() => {
    fetchNextId();
  }, []);

  // Fetch patients when switching tabs
  React.useEffect(() => {
    if (activeTab === 'RECORDS') {
      fetchPatients();
    } else if (activeTab === 'DISCHARGE_RECORDS') {
      fetchDischargeRecords();
    } else if (activeTab === 'ACTIVE_PATIENTS') {
      fetchActivePatients();
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

  const fetchActivePatients = async () => {
    setLoadingActivePatients(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/patients`);
      const data = await response.json();
      setActivePatients(data);
    } catch (err) {
      console.error('Failed to fetch active patients', err);
    } finally {
      setLoadingActivePatients(false);
    }
  };

  const fetchDischargeRecords = async () => {
    setLoadingDischarges(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/patients/discharge-entries`);
      const data = await response.json();
      setDischargeRecords(data);
    } catch (err) {
      console.error('Failed to fetch discharge records', err);
    } finally {
      setLoadingDischarges(false);
    }
  };

  const filteredPatients = patients.filter(patient => {
    return filters.every(filter => {
      const searchColumn = filter.column;

      if (searchColumn === 'Admission Date' && filter.subType === 'Between') {
        if (!patient.admissionDate) return false;
        const pDate = new Date(patient.admissionDate);
        if (filter.rangeStart && new Date(filter.rangeStart) > pDate) return false;
        if (filter.rangeEnd && new Date(filter.rangeEnd) < pDate) return false;
        return true;
      }

      if (searchColumn === 'Admission Time' && filter.subType === 'Between') {
        if (!patient.admissionTime) return false;
        const pTimeStr = patient.admissionTime.substring(0, 5); // "HH:MM"
        if (filter.rangeStart && filter.rangeStart > pTimeStr) return false;
        if (filter.rangeEnd && filter.rangeEnd < pTimeStr) return false;
        return true;
      }

      if (searchColumn === 'Admission Time' && filter.subType === 'AM') {
        if (!patient.admissionTime) return false;
        const hh = parseInt(patient.admissionTime.split(':')[0], 10);
        return hh < 12;
      }

      if (searchColumn === 'Admission Time' && filter.subType === 'PM') {
        if (!patient.admissionTime) return false;
        const hh = parseInt(patient.admissionTime.split(':')[0], 10);
        return hh >= 12;
      }

      const query = filter.value ? filter.value.toLowerCase().trim() : '';
      if (!query) return true;

      const checkMatch = (val, strict = false) => {
        if (val == null) return false;
        const strVal = val.toString().toLowerCase();
        if (strict) {
          return strVal === query || strVal.startsWith(query);
        }
        return strVal.includes(query);
      };

      if (searchColumn === 'All Columns') {
        return (
          checkMatch(patient.patientId) ||
          checkMatch(patient.patientName) ||
          checkMatch(patient.age) ||
          checkMatch(patient.gender, true) ||
          checkMatch(patient.caseType, true) ||
          checkMatch(patient.arNo) ||
          checkMatch(patient.aadharNo) ||
          checkMatch(patient.mobileNo) ||
          checkMatch(patient.wardName) ||
          checkMatch(patient.admissionDate) ||
          checkMatch(patient.admissionTime) ||
          checkMatch(patient.occupation) ||
          checkMatch(patient.motherName) ||
          checkMatch(patient.caretakerName) ||
          checkMatch(patient.address) ||
          checkMatch(patient.status, true)
        );
      }

      const valueToCheck = (() => {
        switch (searchColumn) {
          case 'Patient ID': return patient.patientId;
          case 'Name': return patient.patientName;
          case 'Age': return patient.age;
          case 'Gender': return patient.gender;
          case 'Case Type': return patient.caseType;
          case 'AR No': return patient.arNo;
          case 'Aadhar No': return patient.aadharNo;
          case 'Mobile': return patient.mobileNo;
          case 'Ward': return patient.wardName;
          case 'Admission Date': 
            if (!patient.admissionDate) return '';
            const dParts = patient.admissionDate.split('-'); // YYYY-MM-DD
            if (filter.subType === 'Year') return dParts[0];
            if (filter.subType === 'Month') return dParts[1];
            if (filter.subType === 'Date') return dParts[2];
            return patient.admissionDate;
          case 'Admission Time': 
            if (!patient.admissionTime) return '';
            const tParts = patient.admissionTime.split(':'); // HH:MM:SS
            const hh = parseInt(tParts[0], 10);
            if (filter.subType === 'Hour') {
                return (hh % 12 || 12).toString(); // Return 12-hour integer string for easy match
            }
            if (filter.subType === 'Minute') return tParts[1];
            return formatTime12Hour(patient.admissionTime);
          case 'Occupation': return patient.occupation;
          case "Mother's Name": return patient.motherName;
          case 'Caretaker Name': return patient.caretakerName;
          case 'Address': 
            if (!filter.addressType || filter.addressType === 'All') return patient.address;
            if (!patient.address) return '';
            const parts = patient.address.split(',').map(s => s.trim());
            if (filter.addressType === 'Village') return parts[1] || '';
            if (filter.addressType === 'Taluk') return parts[2] || '';
            if (filter.addressType === 'District') return parts[3] || '';
            return patient.address;
          case 'Status': return patient.status;
          default: return '';
        }
      })();

      const isStrictColumn = ['Case Type', 'Gender', 'Status'].includes(searchColumn);
      return checkMatch(valueToCheck, isStrictColumn);
    });
  });

  const filteredActivePatients = activePatients.filter(patient => {
    return filters.every(filter => {
      const searchColumn = filter.column;
      if (searchColumn === 'Admission Date' && filter.subType === 'Between') {
        if (!patient.admissionDate) return false;
        const pDate = new Date(patient.admissionDate);
        if (filter.rangeStart && new Date(filter.rangeStart) > pDate) return false;
        if (filter.rangeEnd && new Date(filter.rangeEnd) < pDate) return false;
        return true;
      }
      if (searchColumn === 'Admission Time' && filter.subType === 'Between') {
        if (!patient.admissionTime) return false;
        const pTimeStr = patient.admissionTime.substring(0, 5);
        if (filter.rangeStart && filter.rangeStart > pTimeStr) return false;
        if (filter.rangeEnd && filter.rangeEnd < pTimeStr) return false;
        return true;
      }
      if (searchColumn === 'Admission Time' && filter.subType === 'AM') {
        return patient.admissionTime && parseInt(patient.admissionTime.split(':')[0], 10) < 12;
      }
      if (searchColumn === 'Admission Time' && filter.subType === 'PM') {
        return patient.admissionTime && parseInt(patient.admissionTime.split(':')[0], 10) >= 12;
      }
      const query = filter.value ? filter.value.toLowerCase().trim() : '';
      if (!query) return true;
      const checkMatch = (val, strict = false) => {
        if (val == null) return false;
        const strVal = val.toString().toLowerCase();
        return strict ? (strVal === query || strVal.startsWith(query)) : strVal.includes(query);
      };
      if (searchColumn === 'All Columns') {
        return (
          checkMatch(patient.patientId) || checkMatch(patient.patientName) || checkMatch(patient.age) ||
          checkMatch(patient.gender, true) || checkMatch(patient.caseType, true) || checkMatch(patient.arNo) ||
          checkMatch(patient.aadharNo) || checkMatch(patient.mobileNo) || checkMatch(patient.wardName) ||
          checkMatch(patient.admissionDate) || checkMatch(patient.admissionTime) || checkMatch(patient.occupation) ||
          checkMatch(patient.motherName) || checkMatch(patient.caretakerName) || checkMatch(patient.address)
        );
      }
      const valueToCheck = (() => {
        switch (searchColumn) {
          case 'Patient ID': return patient.patientId;
          case 'Name': return patient.patientName;
          case 'Age': return patient.age;
          case 'Gender': return patient.gender;
          case 'Case Type': return patient.caseType;
          case 'AR No': return patient.arNo;
          case 'Aadhar No': return patient.aadharNo;
          case 'Mobile': return patient.mobileNo;
          case 'Ward': return patient.wardName;
          case 'Admission Date':
            if (!patient.admissionDate) return '';
            const dParts = patient.admissionDate.split('-');
            if (filter.subType === 'Year') return dParts[0];
            if (filter.subType === 'Month') return dParts[1];
            if (filter.subType === 'Date') return dParts[2];
            return patient.admissionDate;
          case 'Admission Time':
            if (!patient.admissionTime) return '';
            const tParts = patient.admissionTime.split(':');
            const hh = parseInt(tParts[0], 10);
            if (filter.subType === 'Hour') return (hh % 12 || 12).toString();
            if (filter.subType === 'Minute') return tParts[1];
            return formatTime12Hour(patient.admissionTime);
          case 'Occupation': return patient.occupation;
          case "Mother's Name": return patient.motherName;
          case 'Caretaker Name': return patient.caretakerName;
          case 'Address':
            if (!filter.addressType || filter.addressType === 'All') return patient.address;
            if (!patient.address) return '';
            const parts = patient.address.split(',').map(s => s.trim());
            if (filter.addressType === 'Village') return parts[1] || '';
            if (filter.addressType === 'Taluk') return parts[2] || '';
            if (filter.addressType === 'District') return parts[3] || '';
            return patient.address;
          default: return '';
        }
      })();
      const isStrictColumn = ['Case Type', 'Gender'].includes(searchColumn);
      return (() => {
        if (valueToCheck == null) return false;
        const strVal = valueToCheck.toString().toLowerCase();
        return isStrictColumn ? (strVal === query || strVal.startsWith(query)) : strVal.includes(query);
      })();
    });
  });

  const filteredDischargeRecords = dischargeRecords.filter(record => {
    return filters.every(filter => {
      const searchColumn = filter.column;

      if (searchColumn === 'Admission Date' && filter.subType === 'Between') {
        if (!record.admissionDate) return false;
        const pDate = new Date(record.admissionDate);
        if (filter.rangeStart && new Date(filter.rangeStart) > pDate) return false;
        if (filter.rangeEnd && new Date(filter.rangeEnd) < pDate) return false;
        return true;
      }
      if (searchColumn === 'Discharge Date' && filter.subType === 'Between') {
        if (!record.dischargeDate) return false;
        const pDate = new Date(record.dischargeDate);
        if (filter.rangeStart && new Date(filter.rangeStart) > pDate) return false;
        if (filter.rangeEnd && new Date(filter.rangeEnd) < pDate) return false;
        return true;
      }

      if (searchColumn === 'Admission Time' && filter.subType === 'Between') {
        if (!record.admissionTime) return false;
        const pTimeStr = record.admissionTime.substring(0, 5); // "HH:MM"
        if (filter.rangeStart && filter.rangeStart > pTimeStr) return false;
        if (filter.rangeEnd && filter.rangeEnd < pTimeStr) return false;
        return true;
      }
      if (searchColumn === 'Discharge Time' && filter.subType === 'Between') {
        if (!record.dischargeTime) return false;
        const pTimeStr = record.dischargeTime.substring(0, 5); // "HH:MM"
        if (filter.rangeStart && filter.rangeStart > pTimeStr) return false;
        if (filter.rangeEnd && filter.rangeEnd < pTimeStr) return false;
        return true;
      }

      if (searchColumn === 'Admission Time' && filter.subType === 'AM') {
        if (!record.admissionTime) return false;
        return parseInt(record.admissionTime.split(':')[0], 10) < 12;
      }
      if (searchColumn === 'Admission Time' && filter.subType === 'PM') {
        if (!record.admissionTime) return false;
        return parseInt(record.admissionTime.split(':')[0], 10) >= 12;
      }
      if (searchColumn === 'Discharge Time' && filter.subType === 'AM') {
        if (!record.dischargeTime) return false;
        return parseInt(record.dischargeTime.split(':')[0], 10) < 12;
      }
      if (searchColumn === 'Discharge Time' && filter.subType === 'PM') {
        if (!record.dischargeTime) return false;
        return parseInt(record.dischargeTime.split(':')[0], 10) >= 12;
      }

      const query = filter.value ? filter.value.toLowerCase().trim() : '';
      if (!query) return true;

      const checkMatch = (val, strict = false) => {
        if (val == null) return false;
        const strVal = val.toString().toLowerCase();
        if (strict) {
          return strVal === query || strVal.startsWith(query);
        }
        return strVal.includes(query);
      };

      if (searchColumn === 'All Columns') {
        return (
          checkMatch(record.customPatientId || (record.patient && record.patient.patientId)) ||
          checkMatch(record.patientName) ||
          checkMatch(record.age) ||
          checkMatch(record.gender, true) ||
          checkMatch(record.caseType, true) ||
          checkMatch(record.arNo) ||
          checkMatch(record.aadharNo) ||
          checkMatch(record.mobileNo) ||
          checkMatch(record.admissionWard) ||
          checkMatch(record.admissionDate) ||
          checkMatch(record.admissionTime) ||
          checkMatch(record.dischargeWard) ||
          checkMatch(record.dischargeDate) ||
          checkMatch(record.dischargeTime) ||
          checkMatch(record.dischargeType) ||
          checkMatch(record.occupation) ||
          checkMatch(record.motherName) ||
          checkMatch(record.caretakerName) ||
          checkMatch(record.address)
        );
      }

      const valueToCheck = (() => {
        switch (searchColumn) {
          case 'Patient ID': return record.customPatientId || (record.patient && record.patient.patientId);
          case 'Name': return record.patientName;
          case 'Age': return record.age;
          case 'Gender': return record.gender;
          case 'Case Type': return record.caseType;
          case 'AR No': return record.arNo;
          case 'Aadhar No': return record.aadharNo;
          case 'Mobile': return record.mobileNo;
          case 'Ward': return record.admissionWard;
          case 'Discharge Ward': return record.dischargeWard;
          case 'Discharge Type': return record.dischargeType;
          case 'Admission Date': 
            if (!record.admissionDate) return '';
            const dParts = record.admissionDate.split('-');
            if (filter.subType === 'Year') return dParts[0];
            if (filter.subType === 'Month') return dParts[1];
            if (filter.subType === 'Date') return dParts[2];
            return record.admissionDate;
          case 'Discharge Date': 
            if (!record.dischargeDate) return '';
            const ddParts = record.dischargeDate.split('-');
            if (filter.subType === 'Year') return ddParts[0];
            if (filter.subType === 'Month') return ddParts[1];
            if (filter.subType === 'Date') return ddParts[2];
            return record.dischargeDate;
          case 'Admission Time': 
            if (!record.admissionTime) return '';
            const tParts = record.admissionTime.split(':');
            const hh = parseInt(tParts[0], 10);
            if (filter.subType === 'Hour') return (hh % 12 || 12).toString();
            if (filter.subType === 'Minute') return tParts[1];
            return record.admissionTime;
          case 'Discharge Time': 
            if (!record.dischargeTime) return '';
            const dtParts = record.dischargeTime.split(':');
            const dhh = parseInt(dtParts[0], 10);
            if (filter.subType === 'Hour') return (dhh % 12 || 12).toString();
            if (filter.subType === 'Minute') return dtParts[1];
            return record.dischargeTime;
          case 'Occupation': return record.occupation;
          case "Mother's Name": return record.motherName;
          case 'Caretaker Name': return record.caretakerName;
          case 'Address': 
            if (!filter.addressType || filter.addressType === 'All') return record.address;
            if (!record.address) return '';
            const parts = record.address.split(',').map(s => s.trim());
            if (filter.addressType === 'Village') return parts[1] || '';
            if (filter.addressType === 'Taluk') return parts[2] || '';
            if (filter.addressType === 'District') return parts[3] || '';
            return record.address;
          default: return '';
        }
      })();

      const isStrictColumn = ['Case Type', 'Gender', 'Discharge Type'].includes(searchColumn);
      return checkMatch(valueToCheck, isStrictColumn);
    });
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
      admissionDate: getCurrentDate(), admissionTime: getCurrentTime(), wardName: '', mobileNo: '', aadharNo: '',
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
          <Link to="/discharge" className="nav-item">
            <Activity size={20} /> Discharge Entry
          </Link>
          <a href="#" className={`nav-item ${activeTab === 'ACTIVE_PATIENTS' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('ACTIVE_PATIENTS'); }}>
            <Users size={20} /> Active Patients
          </a>
          <a href="#" className={`nav-item ${activeTab === 'DISCHARGE_RECORDS' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('DISCHARGE_RECORDS'); }}>
            <Activity size={20} /> Discharge Records
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
          ) : activeTab === 'DISCHARGE_RECORDS' ? (
            <div>
              <h1>Discharge Records</h1>
              <p className="subtitle">View all discharged patient entries.</p>
            </div>
          ) : activeTab === 'ACTIVE_PATIENTS' ? (
            <div>
              <h1>Active Patients</h1>
              <p className="subtitle">Currently admitted patients — live view from the patients table.</p>
            </div>
          ) : (
            <div>
              <h1>Patient Records</h1>
              <p className="subtitle">View and search through all admitted patients.</p>
            </div>
          )}
        </header>

        <div className="form-container glass-panel">
          {(activeTab === 'RECORDS' || activeTab === 'DISCHARGE_RECORDS' || activeTab === 'ACTIVE_PATIENTS') && (
            <div className="records-view">
              <div className="records-controls" style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {filters.map((filter, index) => (
                  <div key={index} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {filter.subType === 'Between' ? (
                      <div style={{ display: 'flex', gap: '0.5rem', flexGrow: 1 }}>
                        <input 
                          type={filter.column === 'Admission Date' ? 'date' : 'time'}
                          value={filter.rangeStart || ''}
                          onChange={(e) => updateFilter(index, 'rangeStart', e.target.value)}
                          className="search-input"
                          style={{ width: '50%', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', fontSize: '1rem' }}
                        />
                        <span style={{ alignSelf: 'center' }}>to</span>
                        <input 
                          type={filter.column === 'Admission Date' ? 'date' : 'time'}
                          value={filter.rangeEnd || ''}
                          onChange={(e) => updateFilter(index, 'rangeEnd', e.target.value)}
                          className="search-input"
                          style={{ width: '50%', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', fontSize: '1rem' }}
                        />
                      </div>
                    ) : (filter.subType === 'AM' || filter.subType === 'PM') ? (
                      <div style={{ flexGrow: 1, padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px dashed var(--primary)', backgroundColor: 'rgba(59, 130, 246, 0.05)', color: 'var(--primary)', textAlign: 'center', fontWeight: 'bold' }}>
                        Showing {filter.subType} Patients Only
                      </div>
                    ) : (
                      <input 
                        type="text" 
                        placeholder={
                           filter.column === 'Admission Date' && filter.subType === 'Year' ? 'e.g. 2026' :
                           filter.column === 'Admission Date' && filter.subType === 'Month' ? 'e.g. 04' :
                           filter.column === 'Admission Date' && filter.subType === 'Date' ? 'e.g. 19' :
                           filter.column === 'Admission Time' && filter.subType === 'Hour' ? 'e.g. 05 or 5' :
                           filter.column === 'Admission Time' && filter.subType === 'Minute' ? 'e.g. 30' :
                           `Search by ${filter.column}...`
                        }
                        value={filter.value}
                        onChange={(e) => updateFilter(index, 'value', e.target.value)}
                        className="search-input"
                        style={{ flexGrow: 1, padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', fontSize: '1rem' }}
                      />
                    )}
                    <select 
                      value={filter.column} 
                      onChange={(e) => updateFilter(index, 'column', e.target.value)}
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
                      <option value="Admission Time">Admission Time</option>
                      <option value="Occupation">Occupation</option>
                      <option value="Mother's Name">Mother's Name</option>
                      <option value="Caretaker Name">Caretaker Name</option>
                      <option value="Address">Address</option>
                      <option value="Status">Status</option>
                      {activeTab === 'DISCHARGE_RECORDS' && (
                        <>
                          <option value="Discharge Date">Discharge Date</option>
                          <option value="Discharge Time">Discharge Time</option>
                          <option value="Discharge Type">Discharge Type</option>
                          <option value="Discharge Ward">Discharge Ward</option>
                        </>
                      )}
                    </select>
                    {filter.column === 'Address' && (
                      <select 
                        value={filter.addressType || 'All'} 
                        onChange={(e) => updateFilter(index, 'addressType', e.target.value)}
                        style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', fontSize: '1rem', backgroundColor: 'white', minWidth: '150px' }}
                      >
                        <option value="All">Full Address</option>
                        <option value="Village">Village / Town</option>
                        <option value="Taluk">Taluk</option>
                        <option value="District">District</option>
                      </select>
                    )}
                    {(filter.column === 'Admission Date' || filter.column === 'Discharge Date') && (
                      <select 
                        value={filter.subType || 'All'} 
                        onChange={(e) => updateFilter(index, 'subType', e.target.value)}
                        style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', fontSize: '1rem', backgroundColor: 'white', minWidth: '130px' }}
                      >
                        <option value="All">Exact Date</option>
                        <option value="Date">Day</option>
                        <option value="Month">Month</option>
                        <option value="Year">Year</option>
                        <option value="Between">Between (Range)</option>
                      </select>
                    )}
                    {(filter.column === 'Admission Time' || filter.column === 'Discharge Time') && (
                      <select 
                        value={filter.subType || 'All'} 
                        onChange={(e) => updateFilter(index, 'subType', e.target.value)}
                        style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', fontSize: '1rem', backgroundColor: 'white', minWidth: '130px' }}
                      >
                        <option value="All">Exact Time</option>
                        <option value="Hour">Hour</option>
                        <option value="Minute">Minute</option>
                        <option value="AM">Morning (AM)</option>
                        <option value="PM">Evening (PM)</option>
                        <option value="Between">Between (Range)</option>
                      </select>
                    )}
                    {filters.length > 1 && (
                      <button 
                        onClick={() => removeFilter(index)}
                        style={{ padding: '0.75rem', borderRadius: '0.5rem', border: 'none', backgroundColor: '#fee2e2', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}
                        title="Remove Filter"
                      >
                        X
                      </button>
                    )}
                  </div>
                ))}
                <div>
                  <button 
                    onClick={addFilter}
                    style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px dashed var(--primary)', backgroundColor: 'transparent', color: 'var(--primary)', cursor: 'pointer', fontWeight: '500', fontSize: '0.9rem' }}
                  >
                    + Add Filter
                  </button>
                </div>
              </div>
              
              {activeTab === 'RECORDS' && (
                <>
                  {loadingRecords ? (
                    <p>Loading patient records...</p>
                  ) : filteredPatients.length === 0 ? (
                    <p>No patient records found.</p>
              ) : (
                <>
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
                        <th style={{ padding: '1rem' }}>Admission Time</th>
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
                          <td style={{ padding: '1rem' }}>{patient.admissionDate}</td>
                          <td style={{ padding: '1rem' }}>{formatTime12Hour(patient.admissionTime)}</td>
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

                  <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button 
                      onClick={downloadAsExcel}
                      disabled={activeTab === 'RECORDS' ? filteredPatients.length === 0 : filteredDischargeRecords.length === 0}
                      className="btn btn-primary"
                      style={{ 
                        backgroundColor: '#107c41', // Excel Green
                        borderColor: '#107c41',
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        opacity: (activeTab === 'RECORDS' ? filteredPatients.length === 0 : filteredDischargeRecords.length === 0) ? 0.6 : 1
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      Download Excel
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {activeTab === 'ACTIVE_PATIENTS' && (
            <>
              {loadingActivePatients ? (
                <p>Loading active patients...</p>
              ) : filteredActivePatients.length === 0 ? (
                <p>No active patients found.</p>
              ) : (
                <>
                  <div style={{ marginBottom: '0.75rem', fontWeight: '600', color: '#16a34a' }}>
                    {filteredActivePatients.length} active patient{filteredActivePatients.length !== 1 ? 's' : ''} currently admitted
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="records-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', whiteSpace: 'nowrap' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f0fdf4', borderBottom: '2px solid #86efac' }}>
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
                          <th style={{ padding: '1rem' }}>Admission Time</th>
                          <th style={{ padding: '1rem' }}>Occupation</th>
                          <th style={{ padding: '1rem' }}>Mother's Name</th>
                          <th style={{ padding: '1rem' }}>Caretaker Name</th>
                          <th style={{ padding: '1rem' }}>Address</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredActivePatients.map(patient => (
                          <tr key={patient.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '1rem', fontWeight: '600', color: '#16a34a' }}>{patient.patientId || 'N/A'}</td>
                            <td style={{ padding: '1rem', fontWeight: '500' }}>{patient.patientName}</td>
                            <td style={{ padding: '1rem' }}>{patient.age}</td>
                            <td style={{ padding: '1rem' }}>{patient.gender || 'N/A'}</td>
                            <td style={{ padding: '1rem' }}>{patient.caseType || 'N/A'}</td>
                            <td style={{ padding: '1rem' }}>{patient.arNo || 'N/A'}</td>
                            <td style={{ padding: '1rem' }}>{patient.aadharNo || 'N/A'}</td>
                            <td style={{ padding: '1rem' }}>{patient.mobileNo}</td>
                            <td style={{ padding: '1rem' }}>{patient.wardName}</td>
                            <td style={{ padding: '1rem' }}>{patient.admissionDate}</td>
                            <td style={{ padding: '1rem' }}>{formatTime12Hour(patient.admissionTime)}</td>
                            <td style={{ padding: '1rem' }}>{patient.occupation || 'N/A'}</td>
                            <td style={{ padding: '1rem' }}>{patient.motherName || 'N/A'}</td>
                            <td style={{ padding: '1rem' }}>{patient.caretakerName || 'N/A'}</td>
                            <td style={{ padding: '1rem', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis' }} title={patient.address}>{patient.address || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          )}

          {activeTab === 'DISCHARGE_RECORDS' && (
            <>
                  {loadingDischarges ? (
                    <p>Loading discharge records...</p>
                  ) : filteredDischargeRecords.length === 0 ? (
                    <p>No discharge records found.</p>
                  ) : (
                    <>
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
                        <th style={{ padding: '1rem' }}>Admission Date</th>
                        <th style={{ padding: '1rem' }}>Discharge Date</th>
                        <th style={{ padding: '1rem' }}>Discharge Time</th>
                        <th style={{ padding: '1rem' }}>Discharge Type</th>
                        <th style={{ padding: '1rem' }}>Discharge Ward</th>
                        <th style={{ padding: '1rem' }}>Mobile</th>
                        <th style={{ padding: '1rem' }}>Aadhar No</th>
                        <th style={{ padding: '1rem' }}>Occupation</th>
                        <th style={{ padding: '1rem' }}>Address</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDischargeRecords.map((record, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '1rem' }}>{record.customPatientId || record.patient?.patientId}</td>
                          <td style={{ padding: '1rem', fontWeight: '500' }}>{record.patientName || 'N/A'}</td>
                          <td style={{ padding: '1rem' }}>{record.age || 'N/A'}</td>
                          <td style={{ padding: '1rem' }}>{record.gender || 'N/A'}</td>
                          <td style={{ padding: '1rem' }}>{record.caseType || 'N/A'}</td>
                          <td style={{ padding: '1rem' }}>{record.arNo || 'N/A'}</td>
                          <td style={{ padding: '1rem' }}>{record.admissionDate ? `${record.admissionDate} ${formatTime12Hour(record.admissionTime)}` : 'N/A'}</td>
                          <td style={{ padding: '1rem', color: 'var(--primary)', fontWeight: 'bold' }}>{record.dischargeDate || 'N/A'}</td>
                          <td style={{ padding: '1rem', color: 'var(--primary)', fontWeight: 'bold' }}>{formatTime12Hour(record.dischargeTime)}</td>
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
                </div>
                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button 
                    onClick={downloadAsExcel}
                    disabled={filteredDischargeRecords.length === 0}
                    className="btn btn-primary"
                    style={{ 
                      backgroundColor: '#107c41', // Excel Green
                      borderColor: '#107c41',
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem',
                      opacity: filteredDischargeRecords.length === 0 ? 0.6 : 1
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Download Excel
                  </button>
                </div>
              </>
            )}
          </>
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
                    <p><strong>Admission Date:</strong> {submittedData.admissionDate}</p>
                    <p><strong>Admission Time:</strong> {formatTime12Hour(submittedData.admissionTime)}</p>
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
                        <label>Admission Date & Time *</label>
                        <label style={{ fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <input 
                            type="checkbox" 
                            checked={manualAdmissionDate} 
                            onChange={(e) => {
                              setManualAdmissionDate(e.target.checked);
                              if (!e.target.checked) setFormData({...formData, admissionDate: getCurrentDate(), admissionTime: getCurrentTime()});
                            }} 
                            style={{ width: 'auto' }}
                          />
                          Edit
                        </label>
                      </div>
                      <div style={{ width: '100%', display: 'flex', gap: '0.5rem' }}>
                        <input 
                          type="date"
                          name="admissionDate"
                          value={formData.admissionDate}
                          onChange={handleChange}
                          disabled={!manualAdmissionDate}
                          className="search-input"
                          style={{ width: '50%', padding: '0.6rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}
                        />
                        <input 
                          type="time"
                          name="admissionTime"
                          value={formData.admissionTime}
                          onChange={handleChange}
                          disabled={!manualAdmissionDate}
                          className="search-input"
                          style={{ width: '50%', padding: '0.6rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}
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
