package com.example.demo.service;

import com.example.demo.entity.DischargeEntry;
import com.example.demo.entity.MasterAdmission;
import com.example.demo.entity.Patient;
import com.example.demo.repository.DischargeEntryRepository;
import com.example.demo.repository.MasterAdmissionRepository;
import com.example.demo.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class PatientService {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DischargeEntryRepository dischargeEntryRepository;

    @Autowired
    private MasterAdmissionRepository masterAdmissionRepository;

    public Patient admitPatient(Patient patient) {
        // Set creation timestamp
        patient.setCreatedAt(LocalDateTime.now());
        
        // Save the patient to the database to get the auto-generated internal ID
        Patient savedPatient = patientRepository.save(patient);
        
        // Auto-generate the custom Patient ID based on the internal ID
        if (savedPatient.getPatientId() == null || savedPatient.getPatientId().trim().isEmpty()) {
            savedPatient.setPatientId(String.valueOf(savedPatient.getId()));
            // Save again to persist the auto-generated Patient ID
            savedPatient = patientRepository.save(savedPatient);
        }

        // Save a duplicate into MasterAdmissionTableOfPatients
        MasterAdmission master = new MasterAdmission();
        master.setPatientId(savedPatient.getPatientId());
        master.setPatientName(savedPatient.getPatientName());
        master.setAge(savedPatient.getAge());
        master.setMotherName(savedPatient.getMotherName());
        master.setAdmissionDate(savedPatient.getAdmissionDate());
        master.setAdmissionTime(savedPatient.getAdmissionTime());
        master.setWardName(savedPatient.getWardName());
        master.setMobileNo(savedPatient.getMobileNo());
        master.setAadharNo(savedPatient.getAadharNo());
        master.setOccupation(savedPatient.getOccupation());
        master.setCaretakerName(savedPatient.getCaretakerName());
        master.setAddress(savedPatient.getAddress());
        master.setCaseType(savedPatient.getCaseType());
        master.setArNo(savedPatient.getArNo());
        master.setGender(savedPatient.getGender());
        master.setCreatedAt(savedPatient.getCreatedAt());
        master.setStatus(savedPatient.getStatus());

        masterAdmissionRepository.save(master);

        return savedPatient;
    }

    public java.util.List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    public java.util.List<DischargeEntry> getAllDischargeEntries() {
        return dischargeEntryRepository.findAll();
    }

    public java.util.List<MasterAdmission> getAllMasterAdmissions() {
        return masterAdmissionRepository.findAll();
    }

    public java.util.Optional<Patient> getPatientByPatientId(String patientId) {
        return patientRepository.findByPatientId(patientId);
    }

    public Patient dischargePatient(String patientId, String dischargeType, String dischargeWard, String dischargeDateStr) {
        java.util.Optional<Patient> optionalPatient = patientRepository.findByPatientId(patientId);
        if (optionalPatient.isPresent()) {
            Patient patient = optionalPatient.get();
            patient.setStatus("DISCHARGED");
            patientRepository.save(patient);

            DischargeEntry entry = new DischargeEntry();
            entry.setPatient(patient);
            entry.setCustomPatientId(patient.getPatientId());
            entry.setCaseType(patient.getCaseType());
            entry.setArNo(patient.getArNo());
            entry.setPatientName(patient.getPatientName());
            entry.setAge(patient.getAge());
            entry.setGender(patient.getGender());
            entry.setMotherName(patient.getMotherName());
            entry.setMobileNo(patient.getMobileNo());
            entry.setAadharNo(patient.getAadharNo());
            entry.setOccupation(patient.getOccupation());
            entry.setCaretakerName(patient.getCaretakerName());
            entry.setAddress(patient.getAddress());
            entry.setAdmissionWard(patient.getWardName());
            entry.setAdmissionDate(patient.getAdmissionDate());
            entry.setAdmissionTime(patient.getAdmissionTime());
            entry.setDischargeType(dischargeType);
            entry.setDischargeWard(dischargeWard);

            if (dischargeDateStr != null && !dischargeDateStr.isEmpty()) {
                try {
                    entry.setDischargeDate(LocalDateTime.parse(dischargeDateStr));
                } catch (Exception e) {
                    entry.setDischargeDate(LocalDateTime.now());
                }
            } else {
                entry.setDischargeDate(LocalDateTime.now());
            }

            dischargeEntryRepository.save(entry);

            return patient;
        }
        throw new RuntimeException("Patient not found with ID: " + patientId);
    }
}
