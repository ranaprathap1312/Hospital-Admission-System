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
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import java.sql.PreparedStatement;
import java.sql.Statement;

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

    public String generateNextPatientId() {
        int currentYear = java.time.Year.now().getValue();
        String prefix = currentYear + "-";
        java.util.List<String> existingIds = masterAdmissionRepository.findPatientIdsWithPrefix(prefix);
        
        int maxSequence = 0;
        for (String id : existingIds) {
            try {
                String sequencePart = id.substring(prefix.length());
                int sequence = Integer.parseInt(sequencePart);
                if (sequence > maxSequence) {
                    maxSequence = sequence;
                }
            } catch (NumberFormatException e) {
                // Ignore IDs that don't perfectly match the YYYY-N format
            }
        }
        
        return prefix + (maxSequence + 1);
    }

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
        master.setIncome(savedPatient.getIncome());
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
        return patientRepository.findByStatus("ADMITTED");
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
    public Long dischargePatient(String patientId, String dischargeType, String dischargeWard, String dischargeDateStr, String destinationTable, String updatedCaseType) {
        Patient patient = patientRepository.findByPatientId(patientId)
            .orElseThrow(() -> new RuntimeException("Patient not found with ID: " + patientId));

        if (updatedCaseType != null && !updatedCaseType.trim().isEmpty()) {
            patient.setCaseType(updatedCaseType);
            patientRepository.save(patient);
        }

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
            if (updatedCaseType != null && !updatedCaseType.trim().isEmpty()) {
                master.setCaseType(updatedCaseType);
            }
            masterAdmissionRepository.save(master);
        });

        Long generatedId = null;

        // Replicate to x1-x7 table if requested (best effort)
        try {
            if (destinationTable != null && destinationTable.matches("x[6-7]|mlc_discharge|death_discharge|maternity_block_discharge|insurance_block_discharge|general_side_discharge")) {
                String sql = "INSERT INTO " + destinationTable + " (" +
                    "custom_patient_id, discharge_type, patient_db_id, discharge_ward, " +
                    "ar_no, case_type, patient_name, age, gender, mother_name, mobile_no, " +
                    "aadhar_no, occupation, income, caretaker_name, address, admission_ward, " +
                    "admission_date, admission_time, discharge_date, discharge_time" +
                    ") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                
                KeyHolder keyHolder = new GeneratedKeyHolder();
                jdbcTemplate.update(connection -> {
                    PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
                    ps.setObject(1, entry.getCustomPatientId());
                    ps.setObject(2, entry.getDischargeType());
                    ps.setObject(3, entry.getPatientDbId());
                    ps.setObject(4, entry.getDischargeWard());
                    ps.setObject(5, entry.getArNo());
                    ps.setObject(6, entry.getCaseType());
                    ps.setObject(7, entry.getPatientName());
                    ps.setObject(8, entry.getAge());
                    ps.setObject(9, entry.getGender());
                    ps.setObject(10, entry.getMotherName());
                    ps.setObject(11, entry.getMobileNo());
                    ps.setObject(12, entry.getAadharNo());
                    ps.setObject(13, entry.getOccupation());
                    ps.setObject(14, entry.getIncome());
                    ps.setObject(15, entry.getCaretakerName());
                    ps.setObject(16, entry.getAddress());
                    ps.setObject(17, entry.getAdmissionWard());
                    ps.setObject(18, entry.getAdmissionDate());
                    ps.setObject(19, entry.getAdmissionTime());
                    ps.setObject(20, entry.getDischargeDate());
                    ps.setObject(21, entry.getDischargeTime());
                    return ps;
                }, keyHolder);

                if (keyHolder.getKeys() != null && !keyHolder.getKeys().isEmpty()) {
                    generatedId = ((Number) keyHolder.getKeys().values().iterator().next()).longValue();
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to replicate to " + destinationTable + ": " + e.getMessage());
        }

        // DELETE patient from active patients table (master_admission keeps the full history)
        patientRepository.delete(patient);

        return generatedId;
    }

    public java.util.List<DischargeEntry> getDestinationTableRecords(String tableName) {
        if (tableName == null || !tableName.matches("x[6-7]|mlc_discharge|death_discharge|maternity_block_discharge|insurance_block_discharge|general_side_discharge")) {
            return java.util.Collections.emptyList();
        }
        String sql = "SELECT * FROM " + tableName + " ORDER BY id DESC";
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            DischargeEntry entry = new DischargeEntry();
            try {
                entry.setDestinationTableId(rs.getLong(tableName + "_id"));
            } catch (Exception e) {
                // Ignore if column doesn't exist (e.g. x6, x7)
            }
            entry.setCustomPatientId(rs.getString("custom_patient_id"));
            entry.setPatientName(rs.getString("patient_name"));
            entry.setAge(rs.getInt("age"));
            entry.setGender(rs.getString("gender"));
            entry.setCaseType(rs.getString("case_type"));
            entry.setArNo(rs.getString("ar_no"));
            entry.setAadharNo(rs.getString("aadhar_no"));
            entry.setMobileNo(rs.getString("mobile_no"));
            entry.setAdmissionWard(rs.getString("admission_ward"));
            
            java.sql.Date admDate = rs.getDate("admission_date");
            if (admDate != null) entry.setAdmissionDate(admDate.toLocalDate());
            
            java.sql.Time admTime = rs.getTime("admission_time");
            if (admTime != null) entry.setAdmissionTime(admTime.toLocalTime());
            
            entry.setDischargeWard(rs.getString("discharge_ward"));
            
            java.sql.Date disDate = rs.getDate("discharge_date");
            if (disDate != null) entry.setDischargeDate(disDate.toLocalDate());
            
            java.sql.Time disTime = rs.getTime("discharge_time");
            if (disTime != null) entry.setDischargeTime(disTime.toLocalTime());
            
            entry.setDischargeType(rs.getString("discharge_type"));
            entry.setOccupation(rs.getString("occupation"));
            entry.setIncome(rs.getString("income"));
            entry.setMotherName(rs.getString("mother_name"));
            entry.setCaretakerName(rs.getString("caretaker_name"));
            entry.setAddress(rs.getString("address"));
            return entry;
        });
    }
}

