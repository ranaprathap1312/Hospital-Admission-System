package com.example.demo.service;

import com.example.demo.entity.DischargeEntry;
import com.example.demo.entity.MasterAdmission;
import com.example.demo.entity.Patient;
import com.example.demo.repository.DischargeEntryRepository;
import com.example.demo.repository.MasterAdmissionRepository;
import com.example.demo.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PatientService {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DischargeEntryRepository dischargeEntryRepository;

    @Autowired
    private MasterAdmissionRepository masterAdmissionRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

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

    @Transactional
    public void dischargePatient(String patientId, String dischargeType, String dischargeWard, String dischargeDateStr, String destinationTable) {
        Patient patient = patientRepository.findByPatientId(patientId)
            .orElseThrow(() -> new RuntimeException("Patient not found with ID: " + patientId));

        // Build or update the discharge entry
        DischargeEntry entry = dischargeEntryRepository.findByPatientDbId(patient.getId())
            .orElse(new DischargeEntry());

        entry.setPatientDbId(patient.getId());
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
                java.time.LocalDateTime dt = java.time.LocalDateTime.parse(dischargeDateStr);
                entry.setDischargeDate(dt.toLocalDate());
                entry.setDischargeTime(dt.toLocalTime());
            } catch (Exception e) {
                java.time.LocalDateTime now = java.time.LocalDateTime.now();
                entry.setDischargeDate(now.toLocalDate());
                entry.setDischargeTime(now.toLocalTime());
            }
        } else {
            java.time.LocalDateTime now = java.time.LocalDateTime.now();
            entry.setDischargeDate(now.toLocalDate());
            entry.setDischargeTime(now.toLocalTime());
        }

        // Save discharge record
        dischargeEntryRepository.save(entry);

        // Update master_admission status to DISCHARGED (keep the record)
        masterAdmissionRepository.findByPatientId(patientId).ifPresent(master -> {
            master.setStatus("DISCHARGED");
            masterAdmissionRepository.save(master);
        });

        // Replicate to x1-x7 table if requested (best effort)
        try {
            if (destinationTable != null && destinationTable.matches("x[1-7]")) {
                String sql = "INSERT INTO " + destinationTable + " (" +
                    "custom_patient_id, discharge_type, patient_db_id, discharge_ward, " +
                    "ar_no, case_type, patient_name, age, gender, mother_name, mobile_no, " +
                    "aadhar_no, occupation, caretaker_name, address, admission_ward, " +
                    "admission_date, admission_time, discharge_date, discharge_time" +
                    ") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                jdbcTemplate.update(sql,
                    entry.getCustomPatientId(), entry.getDischargeType(), entry.getPatientDbId(), entry.getDischargeWard(),
                    entry.getArNo(), entry.getCaseType(), entry.getPatientName(), entry.getAge(), entry.getGender(), entry.getMotherName(), entry.getMobileNo(),
                    entry.getAadharNo(), entry.getOccupation(), entry.getCaretakerName(), entry.getAddress(), entry.getAdmissionWard(),
                    entry.getAdmissionDate(), entry.getAdmissionTime(), entry.getDischargeDate(), entry.getDischargeTime()
                );
            }
        } catch (Exception e) {
            System.err.println("Failed to replicate to " + destinationTable + ": " + e.getMessage());
        }

        // DELETE patient from active patients table (master_admission keeps the full history)
        patientRepository.delete(patient);
    }
}

