import React, { useState, useEffect } from 'react';
import { UserPlus, LayoutDashboard, Settings, LogOut, CheckCircle2, Activity, Users, Menu, X } from 'lucide-react';

const OCCUPATION_OPTIONS = {
  "Student": ["School Student", "College Student", "Diploma Student", "Coaching / Training"],
  "Government Employee": ["Clerk", "Officer", "Police", "Teacher (Govt)", "Healthcare Worker (Govt)", "Defense / Army"],
  "Private Employee": ["Software Engineer", "IT Support", "HR", "Sales Executive", "Accountant", "Factory Worker", "Nurse (Private)"],
  "Self-Employed": ["Freelancer", "Consultant", "Driver (Own vehicle)", "Electrician", "Plumber", "Mechanic"],
  "Business": ["Shop Owner", "Small Business", "Trader", "Entrepreneur", "Wholesale Dealer"],
  "Farmer": ["Small Farmer", "Large Farmer", "Agricultural Labor"],
  "Daily Wage Worker": ["Construction Worker", "Helper", "Cleaner", "Loader"],
  "Unemployed": ["No Occupation"],
  "Retired": ["Retired Govt Employee", "Retired Private Employee"],
  "Homemaker": ["Housewife", "Househusband"],
  "Professional": ["Doctor", "Lawyer", "Engineer", "Chartered Accountant", "Teacher (Private)"],
  "Others": ["Other"]
};

const FILTER_COLUMNS = {
  'RECORDS': ['Patient ID', 'Name', 'Age', 'Gender', 'Case Type', 'AR No', 'Aadhar No', 'Mobile', 'Ward', 'Admission Date', 'Admission Time', 'Occupation', 'Income', 'Relation Name', 'Address', 'Status'],
  'ACTIVE_PATIENTS': ['Patient ID', 'Name', 'Age', 'Gender', 'Case Type', 'AR No', 'Aadhar No', 'Mobile', 'Ward', 'Admission Date', 'Admission Time', 'Occupation', 'Income', 'Relation Name', 'Address'],
  'DISCHARGE_RECORDS': ['Patient ID', 'Name', 'Age', 'Gender', 'Case Type', 'AR No', 'Admission Date', 'Discharge Date', 'Discharge Time', 'Discharge Type', 'Discharge Ward', 'Mobile', 'Aadhar No', 'Occupation', 'Income', 'Address'],
  'DESTINATION_RECORDS': ['Patient ID', 'Name', 'Relation Name', 'Admission Date', 'Discharge Date', 'Income', 'Address']
};

import indiaData from '../utils/states-and-districts.json';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './AdminDashboard.css';
import tnLogo from '../../asserts/tn_logo.jpg';
import TimeInput12Hour from '../components/TimeInput12Hour';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

let globalServerTimeOffsetMs = 0;

const AdminDashboard = () => {
  const getCurrentDate = () => {
    const d = new Date(Date.now() + globalServerTimeOffsetMs);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  };

  const getCurrentTime = () => {
    const d = new Date(Date.now() + globalServerTimeOffsetMs);
    return d.toTimeString().split(' ')[0].substring(0, 5);
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
      'Occupation', 'Income', 'Relation Name', 'Address', 'Status'
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
      p.income || '',
      p.motherName || '',

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



  const downloadDestinationAsExcel = () => {
    if (filteredDestinationRecords.length === 0) return;

    // Define the headers for discharge records
    const headers = [
      'ID', 'Patient Name', 'Relation Name', 'Admission Date', 'Discharge Date', 'Income', 'Village Name'
    ];

    const rows = filteredDestinationRecords.map(p => [
      p.destinationTableId || p.customPatientId || '',
      p.patientName || '',
      p.motherName || '',
      p.admissionDate || '',
      p.dischargeDate || '',
      p.income || '',
      p.address ? `"${p.address.replace(/"/g, '""')}"` : ''
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `${selectedDestinationTable}_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUploadCaseFile = async (patientId, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/patients/id/${patientId}/upload-case-file`, {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        fetchPatients(); // Reload data to show View button
      } else {
        console.error('Failed to upload case file.');
      }
    } catch (err) {
      console.error('Error uploading file.', err);
    }
  };

  const handleViewCaseFile = (patientId) => {
    window.open(`${API_BASE_URL}/api/patients/id/${patientId}/case-file`, '_blank');
  };

  const handleDeleteCaseFile = async (patientId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/patients/id/${patientId}/case-file`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchPatients(); // Reload data to show Upload button
      } else {
        console.error('Failed to delete case file.');
      }
    } catch (err) {
      console.error('Error deleting file.', err);
    }
  };

  const downloadActiveAsExcel = () => {
    if (filteredActivePatients.length === 0) return;

    // Define the headers
    const headers = [
      'Patient ID', 'Name', 'Age', 'Gender', 'Case Type', 'AR No',
      'Aadhar No', 'Mobile', 'Ward', 'Admission Date', 'Admission Time',
      'Occupation', 'Income', 'Relation Name', 'Address'
    ];

    // Map the filtered patients to rows
    const rows = filteredActivePatients.map(p => [
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
      p.income || '',
      p.motherName || '',
      p.address ? `"${p.address.replace(/"/g, '""')}"` : ''
    ]);

    // Construct the CSV string
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    // Create a Blob and trigger the download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `Active_Patients_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadDischargeAsExcel = () => {
    if (filteredDischargeRecords.length === 0) return;

    // Define the headers for discharge records
    const headers = [
      'Patient ID', 'Name', 'Age', 'Gender', 'Case Type', 'AR No',
      'Aadhar No', 'Mobile', 'Admission Ward', 'Admission Date', 'Admission Time',
      'Discharge Ward', 'Discharge Date', 'Discharge Time', 'Discharge Type',
      'Occupation', 'Income', 'Relation Name', 'Address'
    ];

    // Map the filtered discharge records to rows
    const rows = filteredDischargeRecords.map(p => [
      p.customPatientId || p.patientId || '',
      p.patientName || '',
      p.age || '',
      p.gender || '',
      p.caseType || '',
      p.arNo || '',
      p.aadharNo || '',
      p.mobileNo || '',
      p.admissionWard || '',
      p.admissionDate || '',
      formatTime12Hour(p.admissionTime),
      p.dischargeWard || '',
      p.dischargeDate || '',
      formatTime12Hour(p.dischargeTime),
      p.dischargeType || '',
      p.occupation || '',
      p.income || '',
      p.motherName || '',

      p.address ? `"${p.address.replace(/"/g, '""')}"` : ''
    ]);
    // Construct the CSV string
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    // Create a Blob and trigger the download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `Discharge_Records_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [formData, setFormData] = useState({
    patientName: '',
    age: '',
    relationPrefix: 'S/o',
    relativeName: '',
    patientId: '',
    admissionDate: getCurrentDate(),
    admissionTime: getCurrentTime(),
    wardName: '',
    mobileNo: '',
    aadharNo: '',
    occupationCategory: '',
    occupationType: '',
    occupationManual: '',
    income: '',
    street: '',
    village: '',
    taluk: 'Vridhachalam',
    district: 'Cuddalore',
    state: 'Tamil Nadu',
    addressManual: '',
    caseType: '',
    arNo: '',
    gender: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState('FORM'); // 'FORM', 'SUCCESS', 'PRINT'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('ADMISSION'); // 'ADMISSION', 'RECORDS'
  const [isDestinationDropdownOpen, setIsDestinationDropdownOpen] = useState(false);
  const [destinationRecords, setDestinationRecords] = useState([]);
  const [selectedDestinationTable, setSelectedDestinationTable] = useState('');
  const [submittedData, setSubmittedData] = useState(null);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [manualPatientId, setManualPatientId] = useState(false);
  const [manualAdmissionDate, setManualAdmissionDate] = useState(false);
  const [manualOccupationEdit, setManualOccupationEdit] = useState(false);
  const [manualAddressEdit, setManualAddressEdit] = useState(false);
  const [predictedNextId, setPredictedNextId] = useState('Loading...');
  
  // Global Print Prompt State
  const [showPrintPrompt, setShowPrintPrompt] = useState(false);
  const [printPatientId, setPrintPatientId] = useState('');
  const [printPatientNumber, setPrintPatientNumber] = useState('');
  const [printError, setPrintError] = useState('');
  const [isFetchingPrint, setIsFetchingPrint] = useState(false);

  // Patient Records State
  const [patients, setPatients] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [filters, setFilters] = useState([{ column: 'All Columns', value: '', addressType: 'All', subType: 'All', rangeStart: '', rangeEnd: '' }]);

  // Active Patients State (from patients table - currently admitted only)
  const [activePatients, setActivePatients] = useState([]);
  const [loadingActivePatients, setLoadingActivePatients] = useState(false);

  // Edit Patient State
  const [editingPatient, setEditingPatient] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);

  const handleFetchAndPrint = async (e) => {
    if (e) e.preventDefault();
    const fullId = `${new Date().getFullYear()}-${printPatientNumber.trim()}`;
    if (!printPatientNumber.trim()) {
      setPrintError('Please enter a Patient Number.');
      return;
    }
    setPrintPatientId(fullId);
    
    setIsFetchingPrint(true);
    setPrintError('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/patients/master-admissions/by-patient-id/${fullId}`);
      if (response.ok) {
        const data = await response.json();
        // MasterAdmission fields map to the same shape submittedData expects
        setSubmittedData(data);
        setViewMode('PRINT');
        setShowPrintPrompt(false);
        setPrintPatientId('');
        setPrintPatientNumber('');
      } else if (response.status === 404) {
        setPrintError(`Patient ID ${fullId} not found.`);
      } else {
        setPrintError(`Failed to fetch patient data (Status: ${response.status}).`);
      }
    } catch (error) {
      console.error("Error fetching patient for print:", error);
      setPrintError(`Error connecting to server: ${error.message}`);
    } finally {
      setIsFetchingPrint(false);
    }
  };

  const handleEditClick = (patient) => {
    setEditingPatient(patient);
    setEditFormData({
      patientName: patient.patientName || '',
      age: patient.age || '',
      gender: patient.gender || '',
      caseType: patient.caseType || '',
      arNo: patient.arNo || '',
      aadharNo: patient.aadharNo || '',
      mobileNo: patient.mobileNo || '',
      wardName: patient.wardName || '',
      occupation: patient.occupation || '',
      income: patient.income || '',
      motherName: patient.motherName || '',
      address: patient.address || ''
    });
    setShowEditModal(true);
  };

  const handleUpdatePatient = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/patients/id/${editingPatient.patientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });
      if (response.ok) {
        setShowEditModal(false);
        setEditingPatient(null);
        fetchPatients(); // Refresh master records
        fetchActivePatients(); // Refresh active patients
      } else {
        alert('Failed to update patient.');
      }
    } catch (error) {
      console.error('Error updating patient:', error);
      alert('Error updating patient.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Discharge Records State
  const [dischargeRecords, setDischargeRecords] = useState([]);
  const [loadingDischarges, setLoadingDischarges] = useState(false);

  useEffect(() => {
    // Reset filters when tab changes to avoid invalid column selections
    setFilters([{ column: 'All Columns', value: '', addressType: 'All', subType: 'All', rangeStart: '', rangeEnd: '' }]);
  }, [activeTab]);

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
    
    // Fetch exact server time to ensure dates/times are internet-based, not local computer-based
    fetch(`${API_BASE_URL}/api/server-time`)
      .then(res => res.json())
      .then(data => {
         const serverTimeMs = new Date(data.datetime).getTime();
         globalServerTimeOffsetMs = serverTimeMs - Date.now();
         
         // Update the form data with the new accurate time ONLY if it hasn't been manually changed yet
         setFormData(prev => ({
           ...prev,
           admissionDate: prev.admissionDate === new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0] ? getCurrentDate() : prev.admissionDate,
           admissionTime: prev.admissionTime === new Date().toTimeString().split(' ')[0].substring(0, 5) ? getCurrentTime() : prev.admissionTime
         }));
      })
      .catch(err => console.error("Failed to sync server time:", err));
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
      const response = await fetch(`${API_BASE_URL}/api/patients/next-id`);
      if (response.ok) {
        const data = await response.text();
        setPredictedNextId(data);
      } else {
        setPredictedNextId('Unknown');
      }
    } catch (err) {
      setPredictedNextId('Unknown');
    }
  };
  const fetchDestinationRecords = async (tableName) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/patients/destination/${tableName}`);
      if (response.ok) {
        const data = await response.json();
        setDestinationRecords(data);
      }
    } catch (err) {
      console.error("Error fetching destination records", err);
    }
  };

  React.useEffect(() => {
    if (activeTab === 'DESTINATION_RECORDS' && selectedDestinationTable) {
      fetchDestinationRecords(selectedDestinationTable);
    }
  }, [activeTab, selectedDestinationTable]);
  const fetchPatients = async () => {
    setLoadingRecords(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/patients/master-admissions`);
      const data = await response.json();
      setPatients(data.sort((a, b) => b.id - a.id));
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
      setActivePatients(data.sort((a, b) => b.id - a.id));
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
      setDischargeRecords(data.sort((a, b) => b.id - a.id));
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
          checkMatch(patient.income) ||
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
              const h12 = (hh % 12 || 12).toString();
              return [h12, h12.padStart(2, '0')].join(',');
            }
            if (filter.subType === 'Minute') return tParts[1];
            return formatTime12Hour(patient.admissionTime);
          case 'Occupation': return patient.occupation;
          case 'Income': return patient.income;
          case "Relation Name": return patient.motherName;

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

      const isStrictColumn = ['Case Type', 'Gender', 'Status', 'Ward'].includes(searchColumn);
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
          checkMatch(patient.income) ||
          checkMatch(patient.motherName) || checkMatch(patient.address)
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
            if (filter.subType === 'Hour') {
              const h12 = (hh % 12 || 12).toString();
              return [h12, h12.padStart(2, '0')].join(',');
            }
            if (filter.subType === 'Minute') return tParts[1];
            return formatTime12Hour(patient.admissionTime);
          case 'Occupation': return patient.occupation;
          case 'Income': return patient.income;
          case "Relation Name": return patient.motherName;

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
      const isStrictColumn = ['Case Type', 'Gender', 'Ward'].includes(searchColumn);
      return (() => {
        if (valueToCheck == null) return false;
        const strVal = valueToCheck.toString().toLowerCase();
        return isStrictColumn ? (strVal === query || strVal.startsWith(query)) : strVal.includes(query);
      })();
    });
  });

  const filteredDestinationRecords = destinationRecords.filter(record => {
    return filters.every(filter => {
      const searchColumn = filter.column;
      if (!searchColumn) return true;

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

      const checkMatch = (val, strict = false) => {
        if (val == null) return false;
        const strVal = val.toString().toLowerCase();
        const query = filter.value ? filter.value.toLowerCase().trim() : '';
        if (!query) return true;
        if (filter.matchType === 'Exact' || strict) {
          return strVal === query || strVal.startsWith(query);
        }
        return strVal.includes(query);
      };

      if (searchColumn === 'All Columns') {
        const query = filter.value ? filter.value.toLowerCase().trim() : '';
        if (!query) return true;
        return (
          checkMatch(record.destinationTableId || record.customPatientId) ||
          checkMatch(record.patientName) ||
          checkMatch(record.motherName) ||
          checkMatch(record.admissionDate) ||
          checkMatch(record.dischargeDate) ||
          checkMatch(record.income) ||
          checkMatch(record.address)
        );
      }

      let columnValue = (() => {
        switch (searchColumn) {
          case 'Patient ID': return record.destinationTableId || record.customPatientId;
          case 'Name': return record.patientName;
          case 'Income': return record.income;
          case 'Relation Name': return record.motherName;
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

      if (!filter.value) return true;
      if (!columnValue) return false;

      return checkMatch(columnValue);
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
          checkMatch(record.income) ||
          checkMatch(record.motherName) ||

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
            if (filter.subType === 'Hour') {
              const h12 = (hh % 12 || 12).toString();
              return [h12, h12.padStart(2, '0')].join(',');
            }
            if (filter.subType === 'Minute') return tParts[1];
            return record.admissionTime;
          case 'Discharge Time':
            if (!record.dischargeTime) return '';
            const dtParts = record.dischargeTime.split(':');
            const dhh = parseInt(dtParts[0], 10);
            if (filter.subType === 'Hour') {
              const dh12 = (dhh % 12 || 12).toString();
              return [dh12, dh12.padStart(2, '0')].join(',');
            }
            if (filter.subType === 'Minute') return dtParts[1];
            return record.dischargeTime;
          case 'Occupation': return record.occupation;
          case 'Income': return record.income;
          case "Relation Name": return record.motherName;

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

      const isStrictColumn = ['Case Type', 'Gender', 'Discharge Type', 'Ward', 'Discharge Ward'].includes(searchColumn);
      return checkMatch(valueToCheck, isStrictColumn);
    });
  });

  const handleChange = (e) => {
    let { name, value } = e.target;
    let newErrors = { ...formErrors };

    // Check for non-numeric input in number-only fields
    if (['mobileNo', 'aadharNo', 'income', 'age'].includes(name)) {
      let isInvalid = false;
      if (name === 'aadharNo' && /[^\d\s]/.test(value)) isInvalid = true;
      else if (name !== 'aadharNo' && /\D/.test(value)) isInvalid = true;

      if (isInvalid) {
        newErrors[name] = 'Numbers only please';
        // Auto-clear the message after 2.5 seconds
        setTimeout(() => setFormErrors(prev => ({ ...prev, [name]: null })), 2500);
      } else {
        newErrors[name] = null;
      }
    }

    if (name === 'mobileNo') {
      // Allow only numbers and restrict to 10 digits
      value = value.replace(/\D/g, '');
      // Prevent leading zeros
      value = value.replace(/^0+/, '');
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

    if (name === 'income') {
      value = value.replace(/\D/g, '');
    }

    if (['patientName', 'relativeName', 'occupationManual'].includes(name)) {
      value = value.toUpperCase();
    }

    if (name === 'patientId') {
      value = value.replace(/[^\d-]/g, ''); // Allow only digits and hyphens
      value = value.replace(/-+/g, '-'); // Prevent consecutive hyphens
      if (value.length > 4 && !value.includes('-')) {
        value = value.slice(0, 4) + '-' + value.slice(4);
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'state' ? { district: '' } : {})
    }));
    
    setFormErrors(newErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Perform custom validation
      const errors = {};
      const requiredFields = ['patientName', 'age', 'gender', 'income', 'aadharNo', 'mobileNo', 'caseType', 'wardName'];
      if (!manualAddressEdit) {
         requiredFields.push('street', 'village', 'taluk', 'district', 'state');
      } else {
         requiredFields.push('addressManual');
      }
      if (formData.caseType === 'MLC') requiredFields.push('arNo');

      requiredFields.forEach(field => {
        if (!formData[field]) {
          const formattedField = field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          errors[field] = `${formattedField} is required`;
        }
      });

      if (formData.aadharNo && formData.aadharNo.replace(/\s/g, '').length !== 12) {
        errors.aadharNo = 'Aadhar number must be exactly 12 digits';
      }

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        setIsSubmitting(false);
        return;
      }

      setFormErrors({});

      const payload = {
        ...formData,
        patientId: manualPatientId ? formData.patientId : predictedNextId,
        motherName: formData.relativeName ? `${formData.relationPrefix} ${formData.relativeName}`.trim() : '',
        occupation: manualOccupationEdit ? formData.occupationManual : (formData.occupationCategory ? `${formData.occupationCategory}${formData.occupationType ? ' - ' + formData.occupationType : ''}` : ''),
        address: manualAddressEdit ? formData.addressManual : `${formData.street}, ${formData.village}, ${formData.taluk}, ${formData.district}, ${formData.state}`
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
      occupationCategory: '', occupationType: '', occupationManual: '', income: '', street: '', village: '',
      taluk: 'Vridhachalam', district: 'Cuddalore', state: 'Tamil Nadu', caseType: '', arNo: '', gender: ''
    });
    setManualPatientId(false);
    setManualAdmissionDate(false);
    setManualOccupationEdit(false);
    setManualAddressEdit(false);
    setSubmittedData(null);
    fetchNextId(); // Refresh the ID for the new form
    setViewMode('FORM');
  };

  const handleUndoAdmission = async () => {
    if (!submittedData?.patientId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/patients/${submittedData.patientId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Keep formData as is, so it is pre-filled when returning to the form
        setSubmittedData(null);
        setViewMode('FORM');
      } else {
        console.error("Failed to undo admission.");
      }
    } catch (err) {
      console.error("Error connecting to server to undo admission.");
    }
  };

  return (
    <div className="dashboard-wrapper">
      {/* Hamburger button - mobile only */}
      <button
        className="hamburger-btn"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label="Toggle navigation"
      >
        {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Dark overlay - closes sidebar when clicked */}
      <div
        className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Admin Dashboard</h2>
        </div>
        <nav className="sidebar-nav">
          <a href="#" className={`nav-item ${activeTab === 'ADMISSION' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('ADMISSION'); setIsSidebarOpen(false); }}>
            <UserPlus size={20} /> New Admission
          </a>
          <a href="#" className={`nav-item ${activeTab === 'RECORDS' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('RECORDS'); setIsSidebarOpen(false); }}>
            <LayoutDashboard size={20} /> Patient Records
          </a>
          <Link to="/discharge" className="nav-item" onClick={() => setIsSidebarOpen(false)}>
            <Activity size={20} /> Discharge Entry
          </Link>
          <a href="#" className={`nav-item ${activeTab === 'ACTIVE_PATIENTS' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('ACTIVE_PATIENTS'); setIsSidebarOpen(false); }}>
            <Users size={20} /> Active Patients
          </a>
          <a href="#" className={`nav-item ${activeTab === 'DISCHARGE_RECORDS' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setActiveTab('DISCHARGE_RECORDS'); setIsSidebarOpen(false); }}>
            <Activity size={20} /> Discharge Records
          </a>
          <div className="nav-item-group">
            <a href="#" className="nav-item" onClick={(e) => { e.preventDefault(); setIsDestinationDropdownOpen(!isDestinationDropdownOpen); }}>
              <Activity size={20} /> Medical Records Store Room {isDestinationDropdownOpen ? '▼' : '▶'}
            </a>
            {isDestinationDropdownOpen && (
              <div className="nav-dropdown" style={{ paddingLeft: '2.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.25rem' }}>
                {['mlc_discharge', 'death_discharge', 'maternity_block_discharge', 'insurance_block_discharge', 'general_side_discharge', 'x6', 'x7'].map(table => (
                  <a key={table} href="#" className={`nav-item ${activeTab === 'DESTINATION_RECORDS' && selectedDestinationTable === table ? 'active' : ''}`} style={{ padding: '0.5rem', fontSize: '0.85rem' }} onClick={(e) => { e.preventDefault(); setSelectedDestinationTable(table); setActiveTab('DESTINATION_RECORDS'); }}>
                    • {table.replace(/_/g, ' ')}
                  </a>
                ))}
              </div>
            )}
          </div>
        </nav>
        <div className="sidebar-footer">
          <Link to="/" className="nav-item text-danger">
            <LogOut size={20} /> Logout
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="content-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flexGrow: 1 }}>
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
          ) : activeTab === 'DESTINATION_RECORDS' ? (
            <div>
              <h1 style={{ textTransform: 'capitalize' }}>{selectedDestinationTable.replace(/_/g, ' ')} Records</h1>
              <p className="subtitle">View all entries in the {selectedDestinationTable.replace(/_/g, ' ')} table.</p>
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
          </div>
          
          <div className="no-print" style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
            <button 
              className="btn btn-primary" 
              onClick={() => setShowPrintPrompt(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#3b82f6', border: 'none', padding: '0.6rem 1rem' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              Print Record
            </button>
          </div>
        </header>

        {showPrintPrompt && (
          <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '400px' }}>
              <div className="modal-header">
                <h2>Print Admission Record</h2>
                <button className="close-btn" onClick={() => { setShowPrintPrompt(false); setPrintError(''); setPrintPatientId(''); setPrintPatientNumber(''); }}>
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleFetchAndPrint}>
                  <div className="form-group">
                    <label>Enter Patient ID</label>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: '#fcfcfc', overflow: 'hidden', height: '44px' }}>
                      <span style={{ padding: '0 0.75rem', color: 'var(--text-muted)', fontWeight: '600', backgroundColor: '#f4f5f7', borderRight: '1px solid var(--border-color)', height: '100%', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
                        {new Date().getFullYear()}-
                      </span>
                      <input
                        type="number"
                        min="1"
                        style={{ flexGrow: 1, padding: '0 0.75rem', border: 'none', background: 'transparent', height: '100%', outline: 'none', fontSize: '1rem' }}
                        value={printPatientNumber}
                        onChange={(e) => setPrintPatientNumber(e.target.value)}
                        placeholder="e.g., 18"
                        required
                        autoFocus
                      />
                    </div>
                  </div>
                  {printError && <div style={{ color: 'red', marginBottom: '1rem', fontSize: '0.9rem' }}>{printError}</div>}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                    <button type="button" className="btn btn-outline" onClick={() => { setShowPrintPrompt(false); setPrintError(''); setPrintPatientId(''); setPrintPatientNumber(''); }}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={isFetchingPrint}>
                      {isFetchingPrint ? 'Fetching...' : 'Fetch & Print'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <div className="form-container glass-panel">
          {(activeTab === 'RECORDS' || activeTab === 'DISCHARGE_RECORDS' || activeTab === 'ACTIVE_PATIENTS' || activeTab === 'DESTINATION_RECORDS') && viewMode !== 'PRINT' && (
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
                      {FILTER_COLUMNS[activeTab]?.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
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
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                        <button onClick={downloadAsExcel} disabled={filteredPatients.length === 0} className="btn btn-primary" style={{ backgroundColor: '#107c41', borderColor: '#107c41', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: filteredPatients.length === 0 ? 0.6 : 1 }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> Download Excel
                        </button>
                      </div>
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
                              <th style={{ padding: '1rem' }}>Income</th>
                              <th style={{ padding: '1rem' }}>Relation Name</th>

                              <th style={{ padding: '1rem' }}>Address</th>
                              <th style={{ padding: '1rem' }}>Status</th>
                              <th style={{ padding: '1rem' }}>Case File</th>
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
                                <td style={{ padding: '1rem' }}>{patient.income || 'N/A'}</td>
                                <td style={{ padding: '1rem' }}>{patient.motherName || 'N/A'}</td>

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
                                <td style={{ padding: '1rem' }}>
                                  {patient.caseFileName ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                      <button 
                                        onClick={() => handleViewCaseFile(patient.patientId)}
                                        style={{ padding: '0.4rem 0.8rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' }}
                                      >
                                        View PDF
                                      </button>
                                      <button
                                        onClick={() => handleDeleteCaseFile(patient.patientId)}
                                        style={{ padding: '0.4rem 0.6rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}
                                        title="Delete Case File"
                                      >
                                        X
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      <input 
                                        type="file" 
                                        id={`upload-case-${patient.patientId}`} 
                                        style={{ display: 'none' }} 
                                        accept="application/pdf"
                                        onChange={(e) => handleUploadCaseFile(patient.patientId, e.target.files[0])}
                                      />
                                      <button 
                                        onClick={() => document.getElementById(`upload-case-${patient.patientId}`).click()}
                                        style={{ padding: '0.4rem 0.8rem', backgroundColor: '#e2e8f0', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' }}
                                      >
                                        Upload PDF
                                      </button>
                                    </>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
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
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ fontWeight: '600', color: '#16a34a' }}>
                          {filteredActivePatients.length} active patient{filteredActivePatients.length !== 1 ? 's' : ''} currently admitted
                        </div>
                        <button onClick={downloadActiveAsExcel} disabled={filteredActivePatients.length === 0} className="btn btn-primary" style={{ backgroundColor: '#107c41', borderColor: '#107c41', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: filteredActivePatients.length === 0 ? 0.6 : 1 }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> Download Excel
                        </button>
                      </div>
                      <div style={{ overflowX: 'auto' }}>
                        <table className="records-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', whiteSpace: 'nowrap' }}>
                          <thead>
                            <tr style={{ backgroundColor: '#f0fdf4', borderBottom: '2px solid #86efac' }}>
                              <th style={{ padding: '1rem', width: '80px', textAlign: 'center' }}>Action</th>
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
                              <th style={{ padding: '1rem' }}>Income</th>
                              <th style={{ padding: '1rem' }}>Relation Name</th>

                              <th style={{ padding: '1rem' }}>Address</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredActivePatients.map(patient => (
                              <tr key={patient.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                                  <button onClick={() => handleEditClick(patient)} style={{ padding: '0.4rem 0.8rem', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500' }}>Edit</button>
                                </td>
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
                                <td style={{ padding: '1rem' }}>{patient.income || 'N/A'}</td>
                                <td style={{ padding: '1rem' }}>{patient.motherName || 'N/A'}</td>

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
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                        <button onClick={downloadDischargeAsExcel} disabled={filteredDischargeRecords.length === 0} className="btn btn-primary" style={{ backgroundColor: '#107c41', borderColor: '#107c41', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: filteredDischargeRecords.length === 0 ? 0.6 : 1 }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> Download Excel
                        </button>
                      </div>
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
                              <th style={{ padding: '1rem' }}>Income</th>
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
                                <td style={{ padding: '1rem' }}>{record.income || 'N/A'}</td>
                                <td style={{ padding: '1rem', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis' }} title={record.address}>{record.address || 'N/A'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
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
              <div className="success-actions" style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn btn-outline" onClick={handleUndoAdmission} style={{ borderColor: 'var(--danger-color)', color: 'var(--danger-color)' }}>Undo Admission</button>
                <button className="btn btn-outline" onClick={handleNewAdmission}>Start New Admission</button>
                <button className="btn btn-primary" onClick={() => setViewMode('PRINT')}>View Patient Details / Print</button>
              </div>
            </div>
          )}

          {activeTab === 'DESTINATION_RECORDS' && (
            <>
              {destinationRecords.length === 0 ? (
                <p>No destination records found.</p>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                    <button onClick={downloadDestinationAsExcel} disabled={filteredDestinationRecords.length === 0} className="btn btn-primary" style={{ backgroundColor: '#107c41', borderColor: '#107c41', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: filteredDestinationRecords.length === 0 ? 0.6 : 1 }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> Download Excel
                    </button>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="records-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', whiteSpace: 'nowrap' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid var(--border-color)' }}>
                          <th style={{ padding: '1rem' }}>patient_{selectedDestinationTable}_id</th>
                          <th style={{ padding: '1rem' }}>Patient ID</th>
                          <th style={{ padding: '1rem' }}>Patient Name</th>
                          <th style={{ padding: '1rem' }}>Relation Name</th>
                          <th style={{ padding: '1rem' }}>Admission Date</th>
                          <th style={{ padding: '1rem' }}>Discharge Date</th>
                          <th style={{ padding: '1rem' }}>Income</th>
                          <th style={{ padding: '1rem' }}>Village Name</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDestinationRecords.length === 0 ? (
                          <tr><td colSpan="8" style={{ padding: '1rem', textAlign: 'center' }}>No records match the current filters.</td></tr>
                        ) : (
                          filteredDestinationRecords.map((record, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                              <td style={{ padding: '1rem', fontWeight: '500' }}>{record.destinationTableId || 'N/A'}</td>
                              <td style={{ padding: '1rem', fontWeight: '500' }}>{record.customPatientId || 'N/A'}</td>
                              <td style={{ padding: '1rem', fontWeight: '600' }}>{record.patientName || 'N/A'}</td>
                              <td style={{ padding: '1rem' }}>{record.motherName || 'N/A'}</td>
                              <td style={{ padding: '1rem' }}>{record.admissionDate || 'N/A'}</td>
                              <td style={{ padding: '1rem', color: '#b91c1c', fontWeight: 'bold' }}>{record.dischargeDate || 'N/A'}</td>
                              <td style={{ padding: '1rem' }}>{record.income || 'N/A'}</td>
                              <td style={{ padding: '1rem', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis' }} title={record.address}>{record.address || 'N/A'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                </>
              )}
            </>
          )}

          {viewMode === 'PRINT' && submittedData && (
            <div className="print-view">
              <div className="print-header" style={{ textAlign: 'center', marginBottom: '2rem', borderBottom: '2px solid #000', paddingBottom: '1rem' }}>
                <img src={tnLogo} alt="TN Logo" style={{ width: '80px', height: 'auto', marginBottom: '1rem' }} />
                <h2>GOVERNMENT HOSPITAL VIRUDHACHALAM - Official Admission Record</h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '1rem', padding: '0 2rem' }}>
                  <p style={{ marginTop: '0.25rem' }}>Date: {new Date().toLocaleDateString()}</p>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Patient ID: {submittedData.patientId || 'Pending Assignment'}</p>
                    <p style={{ fontSize: '1.1rem', fontWeight: 'bold', marginTop: '0.25rem' }}>NAME: {submittedData.patientName}</p>
                  </div>
                </div>
              </div>

              <div className="print-body">
                <div className="print-section">
                  <h3>Admission Details</h3>
                  <div className="print-grid">
                    <p><strong>Case Type:</strong> {submittedData.caseType}</p>
                    {submittedData.caseType === 'MLC' && <p><strong>AR No:</strong> {submittedData.arNo}</p>}
                    <p><strong>Aadhar No:</strong> {submittedData.aadharNo}</p>
                    <p><strong>Admission Date:</strong> {submittedData.admissionDate}</p>
                    <p><strong>Admission Time:</strong> {formatTime12Hour(submittedData.admissionTime)}</p>
                    <p><strong>Ward Name:</strong> {submittedData.wardName}</p>
                    <p><strong>Mobile No:</strong> {submittedData.mobileNo}</p>
                  </div>
                </div>

                <div className="print-section">
                  <h3>Patient Information</h3>
                  <div className="print-grid">
                    <p><strong>Name:</strong> {submittedData.patientName}</p>
                    <p><strong>Age:</strong> {submittedData.age}</p>
                    <p><strong>Gender:</strong> {submittedData.gender}</p>
                    <p><strong>Relation Name:</strong> {submittedData.motherName || 'N/A'}</p>
                    <p><strong>Occupation:</strong> {submittedData.occupation || 'N/A'}</p>
                    <p><strong>Income:</strong> {submittedData.income || 'N/A'}</p>
                    <p><strong>Address:</strong> {submittedData.address}</p>
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
            <form onSubmit={handleSubmit} className="admission-form" noValidate>
              {error && <div className="error-message" style={{ marginBottom: '2rem' }}>{error}</div>}
              <div className="form-grid">

                {/* Personal Details */}
                <div className="form-section">
                  <h3 className="section-title">Personal Details</h3>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Patient Name *</label>
                      <input type="text" name="patientName" value={formData.patientName} onChange={handleChange} required />
                      {formErrors.patientName && <span className="error-text">{formErrors.patientName}</span>}
                    </div>
                    <div className="form-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label>
                          IP No
                          {!manualPatientId && <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'normal' }}>(Auto-Generated patient ID)</span>}
                        </label>
                        <label style={{ fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <input
                            type="checkbox"
                            checked={manualPatientId}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              setManualPatientId(isChecked);
                              if (!isChecked) {
                                setFormData({ ...formData, patientId: '' });
                              } else {
                                const currentYear = new Date().getFullYear();
                                setFormData({ ...formData, patientId: `${currentYear}-` });
                              }
                            }}
                            style={{ width: 'auto' }}
                          />
                          Manual Entry
                        </label>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: !manualPatientId ? '#e2e8f0' : '#fff', overflow: 'hidden' }}>
                        {manualPatientId && (
                          <span style={{ padding: '0.75rem 0.5rem 0.75rem 1rem', color: '#64748b', fontWeight: 'bold', borderRight: '1px solid var(--border-color)', backgroundColor: '#f8fafc', fontSize: '1.25rem' }}>
                            {new Date().getFullYear()}-
                          </span>
                        )}
                        <input
                          type="text"
                          name="patientId"
                          value={manualPatientId ? (formData.patientId || '').replace(`${new Date().getFullYear()}-`, '') : predictedNextId}
                          readOnly={!manualPatientId}
                          onChange={(e) => {
                            if (manualPatientId) {
                               const numPart = e.target.value.replace(/[^0-9]/g, '');
                               setFormData({ ...formData, patientId: `${new Date().getFullYear()}-${numPart}` });
                            }
                          }}
                          placeholder={manualPatientId ? "Enter IP Number" : ""}
                          style={{
                            fontSize: '1.25rem',
                            padding: '0.75rem',
                            fontWeight: 'bold',
                            border: 'none',
                            outline: 'none',
                            flexGrow: 1,
                            backgroundColor: 'transparent',
                            cursor: !manualPatientId ? 'not-allowed' : 'text'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Age *</label>
                      <input type="number" name="age" value={formData.age} onChange={handleChange} required />
                      {formErrors.age && <span className="error-text">{formErrors.age}</span>}
                    </div>
                    <div className="form-group">
                      <label>Gender *</label>
                      <select name="gender" value={formData.gender} onChange={handleChange} required>
                        <option value="">Select Gender</option>
                        <option value="MALE">MALE</option>
                        <option value="FEMALE">FEMALE</option>
                        <option value="TRANSGENDER">TRANSGENDER</option>
                      </select>
                      {formErrors.gender && <span className="error-text">{formErrors.gender}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Relation / Name</label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <select 
                          name="relationPrefix" 
                          value={formData.relationPrefix} 
                          onChange={handleChange}
                          style={{ width: '30%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', backgroundColor: 'white' }}
                        >
                          <option value="S/o">S/o</option>
                          <option value="W/o">W/o</option>
                          <option value="H/o">H/o</option>
                          <option value="D/o">D/o</option>
                          <option value="F/o">F/o</option>
                          <option value="C/o">C/o</option>
                          <option value="M/o">M/o</option>
                        </select>
                        <input 
                          type="text" 
                          name="relativeName" 
                          value={formData.relativeName} 
                          onChange={handleChange} 
                          style={{ width: '70%' }}
                        />
                      </div>
                      {formErrors.relativeName && <span className="error-text">{formErrors.relativeName}</span>}
                    </div>
                    <div className="form-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label>Occupation</label>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 'normal' }}>
                          <input 
                            type="checkbox" 
                            checked={manualOccupationEdit} 
                            onChange={(e) => {
                              setManualOccupationEdit(e.target.checked);
                              setFormData({...formData, occupationCategory: '', occupationType: '', occupationManual: ''});
                            }}
                          /> Manual Edit
                        </label>
                      </div>
                      
                      {manualOccupationEdit ? (
                        <input 
                          type="text" 
                          name="occupationManual" 
                          placeholder="Enter occupation manually..."
                          value={formData.occupationManual} 
                          onChange={handleChange} 
                        />
                      ) : (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <select 
                            name="occupationCategory" 
                            value={formData.occupationCategory} 
                            onChange={(e) => {
                              handleChange(e);
                              setFormData(prev => ({ ...prev, occupationType: '' })); // Reset type when category changes
                            }}
                            style={{ width: '50%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', backgroundColor: 'white' }}
                          >
                            <option value="">Select Category...</option>
                            {Object.keys(OCCUPATION_OPTIONS).map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                          
                          <select 
                            name="occupationType" 
                            value={formData.occupationType} 
                            onChange={handleChange}
                            disabled={!formData.occupationCategory || OCCUPATION_OPTIONS[formData.occupationCategory]?.length === 0}
                            style={{ width: '50%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', backgroundColor: !formData.occupationCategory || OCCUPATION_OPTIONS[formData.occupationCategory]?.length === 0 ? '#f3f4f6' : 'white' }}
                          >
                            <option value="">Type...</option>
                            {formData.occupationCategory && OCCUPATION_OPTIONS[formData.occupationCategory]?.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Income *</label>
                      <input type="text" name="income" value={formData.income} onChange={handleChange} required />
                      {formErrors.income && <span className="error-text">{formErrors.income}</span>}
                    </div>
                    <div className="form-group">
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Aadhar No *</label>
                      <input type="text" name="aadharNo" value={formData.aadharNo} onChange={handleChange} required minLength="14" maxLength="14" pattern="\d{4} \d{4} \d{4}" title="Aadhar number must be exactly 12 digits" />
                      {formErrors.aadharNo && <span className="error-text">{formErrors.aadharNo}</span>}
                    </div>
                    <div className="form-group">
                      <label>Mobile No *</label>
                      <input type="tel" name="mobileNo" value={formData.mobileNo} onChange={handleChange} required />
                      {formErrors.mobileNo && <span className="error-text">{formErrors.mobileNo}</span>}
                    </div>
                  </div>
                </div>

                {/* Admission Info */}
                <div className="form-section">
                  <h3 className="section-title">Admission Info</h3>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Case Type *</label>
                      <select name="caseType" value={formData.caseType} onChange={handleChange} required>
                        <option value="">Select</option>
                        <option value="NON MLC">NON MLC</option>
                        <option value="MLC">MLC</option>
                      </select>
                      {formErrors.caseType && <span className="error-text">{formErrors.caseType}</span>}
                    </div>
                    <div className="form-group">
                      <label>AR No {formData.caseType === 'MLC' ? '*' : ''}</label>
                      <input type="text" name="arNo" value={formData.arNo} onChange={handleChange} required={formData.caseType === 'MLC'} />
                      {formErrors.arNo && <span className="error-text">{formErrors.arNo}</span>}
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
                              if (!e.target.checked) setFormData({ ...formData, admissionDate: getCurrentDate(), admissionTime: getCurrentTime() });
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
                        <TimeInput12Hour
                          value={formData.admissionTime}
                          onChange={(val) => setFormData({ ...formData, admissionTime: val })}
                          disabled={!manualAdmissionDate}
                          style={{ width: '50%', padding: '0.1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Ward Name *</label>
                      <select name="wardName" value={formData.wardName} onChange={handleChange} required>
                        <option value="">Select</option>
                        <option value="Children Ward">CH-Children Ward</option>
                        <option value="CMCHIS Female Ward">CMCHIS Female Ward</option>
                        <option value="CMCHIS Male Ward">CMCHIS Male Ward</option>
                        <option value="Eye Ward">Eye Ward</option>
                        <option value="Female Ward 1">F1-Female Ward-1</option>
                        <option value="Female Ward 2">F2-Female Ward-2</option>
                        <option value="Dialysis Ward">HD-Dialysis ward</option>
                        <option value="Labour Ward">Labour Ward</option>
                        <option value="Male Ward 1">M1-Male Ward-1</option>
                        <option value="Male Ward 2">M2-Male Ward-2</option>
                        <option value="PS Ward">PS Ward</option>
                        <option value="SNCU">SNCU</option>
                      </select>
                      {formErrors.wardName && <span className="error-text">{formErrors.wardName}</span>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                    <h3 className="section-title" style={{ margin: 0, border: 'none', padding: 0 }}>Address Details</h3>
                    <label style={{ fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <input 
                        type="checkbox" 
                        checked={manualAddressEdit} 
                        onChange={(e) => {
                          setManualAddressEdit(e.target.checked);
                          setFormData({...formData, street: '', village: '', taluk: 'Vridhachalam', district: 'Cuddalore', state: 'Tamil Nadu', addressManual: ''});
                        }}
                      /> Manual Edit
                    </label>
                  </div>
                  
                  {manualAddressEdit ? (
                    <div className="form-row">
                      <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label>Full Address *</label>
                        <textarea 
                          name="addressManual" 
                          rows="3"
                          placeholder="Enter complete address manually..."
                          value={formData.addressManual || ''} 
                          onChange={handleChange} 
                          required
                        />
                        {formErrors.addressManual && <span className="error-text">{formErrors.addressManual}</span>}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Street / Box *</label>
                          <input type="text" name="street" value={formData.street} onChange={handleChange} required />
                          {formErrors.street && <span className="error-text">{formErrors.street}</span>}
                        </div>
                        <div className="form-group">
                          <label>Village / Town *</label>
                          <input type="text" name="village" value={formData.village} onChange={handleChange} required />
                          {formErrors.village && <span className="error-text">{formErrors.village}</span>}
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Taluk *</label>
                          <input type="text" name="taluk" value={formData.taluk} onChange={handleChange} required />
                          {formErrors.taluk && <span className="error-text">{formErrors.taluk}</span>}
                        </div>
                        <div className="form-group">
                          <label>District *</label>
                          <select name="district" value={formData.district} onChange={handleChange} required>
                            <option value="">Select District</option>
                            {formData.state && (indiaData.states.find(s => s.state === formData.state)?.districts || []).map(d => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                          {formErrors.district && <span className="error-text">{formErrors.district}</span>}
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>State *</label>
                          <select name="state" value={formData.state} onChange={handleChange} required>
                            <option value="">Select State</option>
                            {indiaData.states.map(s => (
                              <option key={s.state} value={s.state}>{s.state}</option>
                            ))}
                          </select>
                          {formErrors.state && <span className="error-text">{formErrors.state}</span>}
                        </div>
                        <div className="form-group">
                          {/* Empty slot for balance */}
                        </div>
                      </div>
                    </>
                  )}
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

      {/* Edit Patient Modal */}
      {showEditModal && editingPatient && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
            <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', color: '#1e293b' }}>
              Edit Patient: {editingPatient.patientId}
            </h2>
            <form onSubmit={handleUpdatePatient}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Name</label>
                  <input type="text" value={editFormData.patientName} onChange={(e) => setEditFormData({...editFormData, patientName: e.target.value})} required className="search-input" style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Age</label>
                  <input type="number" value={editFormData.age} onChange={(e) => setEditFormData({...editFormData, age: e.target.value})} required className="search-input" style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Gender</label>
                  <select value={editFormData.gender} onChange={(e) => setEditFormData({...editFormData, gender: e.target.value})} className="search-input" style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                    <option value="">Select</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="TRANSGENDER">Transgender</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Case Type</label>
                  <select value={editFormData.caseType} onChange={(e) => setEditFormData({...editFormData, caseType: e.target.value})} className="search-input" style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                    <option value="NON MLC">NON MLC</option>
                    <option value="MLC">MLC</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>AR No</label>
                  <input type="text" value={editFormData.arNo} onChange={(e) => setEditFormData({...editFormData, arNo: e.target.value})} className="search-input" style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }} disabled={editFormData.caseType !== 'MLC'} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Aadhar No</label>
                  <input type="text" value={editFormData.aadharNo} onChange={(e) => setEditFormData({...editFormData, aadharNo: e.target.value})} className="search-input" style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Mobile No</label>
                  <input type="text" value={editFormData.mobileNo} onChange={(e) => setEditFormData({...editFormData, mobileNo: e.target.value})} className="search-input" style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Ward Name</label>
                  <select value={editFormData.wardName} onChange={(e) => setEditFormData({...editFormData, wardName: e.target.value})} className="search-input" style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }} required>
                    <option value="">Select Ward</option>
                    <option value="Children Ward">CH-Children Ward</option>
                    <option value="CMCHIS Female Ward">CMCHIS Female Ward</option>
                    <option value="CMCHIS Male Ward">CMCHIS Male Ward</option>
                    <option value="Eye Ward">Eye Ward</option>
                    <option value="Female Ward 1">F1-Female Ward-1</option>
                    <option value="Female Ward 2">F2-Female Ward-2</option>
                    <option value="Dialysis Ward">HD-Dialysis ward</option>
                    <option value="Labour Ward">Labour Ward</option>
                    <option value="Male Ward 1">M1-Male Ward-1</option>
                    <option value="Male Ward 2">M2-Male Ward-2</option>
                    <option value="PS Ward">PS Ward</option>
                    <option value="SNCU">SNCU</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Relation Name</label>
                  <input type="text" value={editFormData.motherName} onChange={(e) => setEditFormData({...editFormData, motherName: e.target.value})} className="search-input" style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }} />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Occupation</label>
                  <input type="text" value={editFormData.occupation} onChange={(e) => setEditFormData({...editFormData, occupation: e.target.value})} className="search-input" style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }} />
                </div>
                <div className="form-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
                  <label>Address</label>
                  <textarea value={editFormData.address} onChange={(e) => setEditFormData({...editFormData, address: e.target.value})} rows="3" className="search-input" style={{ width: '100%', padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}></textarea>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowEditModal(false)} style={{ padding: '0.75rem 1.5rem', border: '1px solid #cbd5e1', backgroundColor: 'white', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '500' }}>Cancel</button>
                <button type="submit" disabled={isUpdating} style={{ padding: '0.75rem 1.5rem', border: 'none', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '500' }}>
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
