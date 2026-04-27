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

    @Transactional
    public void deletePatient(String patientId) {
        patientRepository.findByPatientId(patientId).ifPresent(patientRepository::delete);
        masterAdmissionRepository.findByPatientId(patientId).ifPresent(masterAdmissionRepository::delete);
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

    public Long dischargePatient(String patientId, String dischargeType, String dischargeWard, String dischargeDateStr, String destinationTable, String updatedCaseType) {
        Patient patient = patientRepository.findByPatientId(patientId)
            .orElseThrow(() -> new RuntimeException("Patient not found with ID: " + patientId));

        // Parse discharge date/time — must be effectively final for use in lambda
        java.time.LocalDateTime parsedDt;
        if (dischargeDateStr != null && !dischargeDateStr.isEmpty()) {
            try {
                parsedDt = java.time.LocalDateTime.parse(dischargeDateStr);
            } catch (Exception e) {
                parsedDt = java.time.LocalDateTime.now();
            }
        } else {
            parsedDt = java.time.LocalDateTime.now();
        }
        final java.time.LocalDate finalDischargeDate = parsedDt.toLocalDate();
        final java.time.LocalTime finalDischargeTime = parsedDt.toLocalTime();

        String finalCaseType = (updatedCaseType != null && !updatedCaseType.trim().isEmpty()) ? updatedCaseType : patient.getCaseType();

        // Step 1: Save to discharge_entry via raw JDBC (bypasses JPA FK tracking)
        String checkSql = "SELECT COUNT(*) FROM discharge_entry WHERE patient_db_id = ?";
        int existingCount = jdbcTemplate.queryForObject(checkSql, Integer.class, patient.getId());

        if (existingCount > 0) {
            jdbcTemplate.update(
                "UPDATE discharge_entry SET custom_patient_id=?, discharge_type=?, discharge_ward=?, " +
                "ar_no=?, case_type=?, patient_name=?, age=?, gender=?, mother_name=?, mobile_no=?, " +
                "aadhar_no=?, occupation=?, income=?, caretaker_name=?, address=?, admission_ward=?, " +
                "admission_date=?, admission_time=?, discharge_date=?, discharge_time=? WHERE patient_db_id=?",
                patient.getPatientId(), dischargeType, dischargeWard,
                patient.getArNo(), finalCaseType, patient.getPatientName(), patient.getAge(), patient.getGender(),
                patient.getMotherName(), patient.getMobileNo(), patient.getAadharNo(), patient.getOccupation(),
                patient.getIncome(), patient.getCaretakerName(), patient.getAddress(), patient.getWardName(),
                patient.getAdmissionDate(), patient.getAdmissionTime(), finalDischargeDate, finalDischargeTime,
                patient.getId()
            );
        } else {
            jdbcTemplate.update(
                "INSERT INTO discharge_entry (custom_patient_id, discharge_type, patient_db_id, discharge_ward, " +
                "ar_no, case_type, patient_name, age, gender, mother_name, mobile_no, " +
                "aadhar_no, occupation, income, caretaker_name, address, admission_ward, " +
                "admission_date, admission_time, discharge_date, discharge_time) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                patient.getPatientId(), dischargeType, patient.getId(), dischargeWard,
                patient.getArNo(), finalCaseType, patient.getPatientName(), patient.getAge(), patient.getGender(),
                patient.getMotherName(), patient.getMobileNo(), patient.getAadharNo(), patient.getOccupation(),
                patient.getIncome(), patient.getCaretakerName(), patient.getAddress(), patient.getWardName(),
                patient.getAdmissionDate(), patient.getAdmissionTime(), finalDischargeDate, finalDischargeTime
            );
        }

        // Step 2: Update master_admission status to DISCHARGED
        jdbcTemplate.update(
            "UPDATE master_admission_table_of_patients SET status=?, case_type=? WHERE patient_id=?",
            "DISCHARGED", finalCaseType, patientId
        );

        Long generatedId = null;

        // Step 3: Replicate to destination table (mlc_discharge, death_discharge, etc.)
        try {
            if (destinationTable != null && destinationTable.matches("x[6-7]|mlc_discharge|death_discharge|maternity_block_discharge|insurance_block_discharge|general_side_discharge")) {
                
                // Ensure the custom auto-increment ID column exists
                String idColumnName = "patient_" + destinationTable + "_id";
                try {
                    jdbcTemplate.execute("ALTER TABLE " + destinationTable + " ADD COLUMN IF NOT EXISTS " + idColumnName + " SERIAL");
                } catch (Exception e) {
                    System.err.println("Could not add auto-increment column " + idColumnName + " to " + destinationTable + ": " + e.getMessage());
                }
                String sql = "INSERT INTO " + destinationTable + " (" +
                    "custom_patient_id, discharge_type, patient_db_id, discharge_ward, " +
                    "ar_no, case_type, patient_name, age, gender, mother_name, mobile_no, " +
                    "aadhar_no, occupation, income, caretaker_name, address, admission_ward, " +
                    "admission_date, admission_time, discharge_date, discharge_time" +
                    ") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

                KeyHolder keyHolder = new GeneratedKeyHolder();
                jdbcTemplate.update(connection -> {
                    PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
                    ps.setObject(1, patient.getPatientId());
                    ps.setObject(2, dischargeType);
                    ps.setObject(3, patient.getId());
                    ps.setObject(4, dischargeWard);
                    ps.setObject(5, patient.getArNo());
                    ps.setObject(6, finalCaseType);
                    ps.setObject(7, patient.getPatientName());
                    ps.setObject(8, patient.getAge());
                    ps.setObject(9, patient.getGender());
                    ps.setObject(10, patient.getMobileNo());
                    ps.setObject(11, patient.getMobileNo());
                    ps.setObject(12, patient.getAadharNo());
                    ps.setObject(13, patient.getOccupation());
                    ps.setObject(14, patient.getIncome());
                    ps.setObject(15, patient.getCaretakerName());
                    ps.setObject(16, patient.getAddress());
                    ps.setObject(17, patient.getWardName());
                    ps.setObject(18, patient.getAdmissionDate());
                    ps.setObject(19, patient.getAdmissionTime());
                    ps.setObject(20, finalDischargeDate);
                    ps.setObject(21, finalDischargeTime);
                    return ps;
                }, keyHolder);

                if (keyHolder.getKeys() != null && !keyHolder.getKeys().isEmpty()) {
                    String idColumnName = destinationTable + "_id";
                    if (keyHolder.getKeys().containsKey(idColumnName)) {
                        generatedId = ((Number) keyHolder.getKeys().get(idColumnName)).longValue();
                    } else if (keyHolder.getKeys().containsKey("id")) {
                        generatedId = ((Number) keyHolder.getKeys().get("id")).longValue();
                    } else {
                        generatedId = ((Number) keyHolder.getKeys().values().iterator().next()).longValue();
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to replicate to " + destinationTable + ": " + e.getMessage());
            e.printStackTrace();
        }

        // Step 4: DELETE patient from active patients table
        jdbcTemplate.update("DELETE FROM active_patients WHERE patient_id = ?", patientId);

        return generatedId;
    }


    @Transactional
    public void undoDischarge(String patientId, String destinationTable, Long destinationId) {
        // 1. Delete from destination table if it was created
        if (destinationTable != null && !destinationTable.isEmpty() && destinationId != null) {
            try {
                String sql = "DELETE FROM " + destinationTable + " WHERE " + destinationTable + "_id = ?";
                jdbcTemplate.update(sql, destinationId);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        // 2. Delete the discharge entry
        dischargeEntryRepository.findByCustomPatientId(patientId).ifPresent(dischargeEntryRepository::delete);

        // 3. Re-activate the patient in the master table
        MasterAdmission master = masterAdmissionRepository.findByPatientId(patientId).orElse(null);
        if (master != null) {
            master.setStatus("ADMITTED");
            masterAdmissionRepository.save(master);

            // 4. Re-insert the patient into the active patients table
            Patient restoredPatient = new Patient();
            restoredPatient.setPatientId(master.getPatientId());
            restoredPatient.setPatientName(master.getPatientName());
            restoredPatient.setAge(master.getAge());
            restoredPatient.setGender(master.getGender());
            restoredPatient.setCaseType(master.getCaseType());
            restoredPatient.setArNo(master.getArNo());
            restoredPatient.setAadharNo(master.getAadharNo());
            restoredPatient.setMobileNo(master.getMobileNo());
            restoredPatient.setWardName(master.getWardName());
            restoredPatient.setAdmissionDate(master.getAdmissionDate());
            restoredPatient.setAdmissionTime(master.getAdmissionTime());
            restoredPatient.setOccupation(master.getOccupation());
            restoredPatient.setIncome(master.getIncome());
            restoredPatient.setMotherName(master.getMotherName());
            restoredPatient.setCaretakerName(master.getCaretakerName());
            restoredPatient.setAddress(master.getAddress());
            restoredPatient.setCreatedAt(LocalDateTime.now());
            restoredPatient.setStatus("ADMITTED");
            
            patientRepository.save(restoredPatient);
        }
    }

    public java.util.List<DischargeEntry> getDestinationTableRecords(String tableName) {
        if (tableName == null || !tableName.matches("x[6-7]|mlc_discharge|death_discharge|maternity_block_discharge|insurance_block_discharge|general_side_discharge")) {
            return java.util.Collections.emptyList();
        }
        String sql = "SELECT * FROM " + tableName + " ORDER BY id DESC";
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            DischargeEntry entry = new DischargeEntry();
            try {
                // Try to find the primary key column. Check "patient_tableName_id" first, then "id", then "tableName_id"
                boolean idSet = false;
                try {
                    entry.setDestinationTableId(rs.getLong("patient_" + tableName + "_id"));
                    idSet = true;
                } catch (Exception e) {}
                
                if (!idSet) {
                    try {
                        entry.setDestinationTableId(rs.getLong("id"));
                        idSet = true;
                    } catch (Exception e) {}
                }
                
                if (!idSet) {
                    try {
                        entry.setDestinationTableId(rs.getLong(tableName + "_id"));
                        idSet = true;
                    } catch (Exception e) {}
                }
            } catch (Exception e) {
                // Ignore if all attempts fail
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

