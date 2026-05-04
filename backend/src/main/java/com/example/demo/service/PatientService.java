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
import org.springframework.web.multipart.MultipartFile;

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

    public java.util.Optional<MasterAdmission> getMasterAdmissionByPatientId(String patientId) {
        return masterAdmissionRepository.findFirstByPatientIdOrderByIdDesc(patientId);
    }

    public void saveCaseFile(String patientId, MultipartFile file) throws java.io.IOException {
        java.util.Optional<MasterAdmission> masterOpt = masterAdmissionRepository.findFirstByPatientIdOrderByIdDesc(patientId);
        if (masterOpt.isPresent()) {
            MasterAdmission master = masterOpt.get();
            master.setCaseFileName(file.getOriginalFilename());
            master.setCaseFileType(file.getContentType() != null ? file.getContentType() : "application/pdf");
            master.setCaseFileData(file.getBytes());
            masterAdmissionRepository.save(master);
        } else {
            throw new RuntimeException("Patient record not found in master table");
        }
    }

    public void deleteCaseFile(String patientId) {
        java.util.Optional<MasterAdmission> masterOpt = masterAdmissionRepository.findFirstByPatientIdOrderByIdDesc(patientId);
        if (masterOpt.isPresent()) {
            MasterAdmission master = masterOpt.get();
            master.setCaseFileName(null);
            master.setCaseFileType(null);
            master.setCaseFileData(null);
            masterAdmissionRepository.save(master);
        } else {
            throw new RuntimeException("Patient record not found in master table");
        }
    }

    public MasterAdmission getCaseFile(String patientId) {
        return masterAdmissionRepository.findFirstByPatientIdOrderByIdDesc(patientId)
            .orElseThrow(() -> new RuntimeException("Patient record not found"));
    }

    @Transactional
    public Patient updatePatient(String patientId, Patient updatedData) {
        // Update Patient table
        Patient patient = patientRepository.findByPatientId(patientId)
            .orElseThrow(() -> new RuntimeException("Patient not found with ID: " + patientId));

        // Determine if the patient ID is being changed
        String newPatientId = (updatedData.getPatientId() != null && !updatedData.getPatientId().trim().isEmpty())
            ? updatedData.getPatientId().trim()
            : patientId;
        boolean idChanged = !newPatientId.equals(patientId);

        // Validate new ID is not already in use by another patient
        if (idChanged) {
            patientRepository.findByPatientId(newPatientId).ifPresent(existing -> {
                if (!existing.getId().equals(patient.getId())) {
                    throw new RuntimeException("Patient ID '" + newPatientId + "' is already in use.");
                }
            });
        }

        patient.setPatientName(updatedData.getPatientName());
        patient.setAge(updatedData.getAge());
        patient.setMotherName(updatedData.getMotherName());
        patient.setWardName(updatedData.getWardName());
        patient.setMobileNo(updatedData.getMobileNo());
        patient.setAadharNo(updatedData.getAadharNo());
        patient.setOccupation(updatedData.getOccupation());
        patient.setIncome(updatedData.getIncome());
        patient.setAddress(updatedData.getAddress());
        patient.setCaseType(updatedData.getCaseType());
        patient.setArNo(updatedData.getArNo());
        patient.setGender(updatedData.getGender());
        // Note: intentionally not updating admission date/time or status

        if (idChanged) {
            patient.setPatientId(newPatientId);
        }

        Patient savedPatient = patientRepository.save(patient);

        // Synchronize updates to MasterAdmission table
        masterAdmissionRepository.findByPatientId(patientId).ifPresent(master -> {
            master.setPatientName(updatedData.getPatientName());
            master.setAge(updatedData.getAge());
            master.setMotherName(updatedData.getMotherName());
            master.setWardName(updatedData.getWardName());
            master.setMobileNo(updatedData.getMobileNo());
            master.setAadharNo(updatedData.getAadharNo());
            master.setOccupation(updatedData.getOccupation());
            master.setIncome(updatedData.getIncome());
            master.setAddress(updatedData.getAddress());
            master.setCaseType(updatedData.getCaseType());
            master.setArNo(updatedData.getArNo());
            master.setGender(updatedData.getGender());
            if (idChanged) {
                master.setPatientId(newPatientId);
            }
            masterAdmissionRepository.save(master);
        });

        // If the patient ID changed, propagate the new ID to all discharge-related tables
        if (idChanged) {
            // Update discharge_entry
            try {
                jdbcTemplate.update(
                    "UPDATE discharge_entry SET custom_patient_id = ? WHERE custom_patient_id = ?",
                    newPatientId, patientId
                );
            } catch (Exception e) {
                System.err.println("Warning: Could not update discharge_entry for ID change: " + e.getMessage());
            }

            // Update all destination discharge tables
            String[] destinationTables = {
                "mlc_discharge", "death_discharge", "maternity_block_discharge",
                "insurance_block_discharge", "general_side_discharge", "x6", "x7"
            };
            for (String table : destinationTables) {
                try {
                    jdbcTemplate.update(
                        "UPDATE " + table + " SET custom_patient_id = ? WHERE custom_patient_id = ?",
                        newPatientId, patientId
                    );
                } catch (Exception e) {
                    System.err.println("Warning: Could not update " + table + " for ID change: " + e.getMessage());
                }
            }
        }

        return savedPatient;
    }

    public String dischargePatient(String patientId, String dischargeType, String dischargeWard, String dischargeDateStr, String destinationTable, String updatedCaseType, String summaryText) {
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
                "aadhar_no=?, occupation=?, income=?, address=?, admission_ward=?, " +
                "admission_date=?, admission_time=?, discharge_date=?, discharge_time=?, summary=? WHERE patient_db_id=?",
                patient.getPatientId(), dischargeType, dischargeWard,
                patient.getArNo(), finalCaseType, patient.getPatientName(), patient.getAge(), patient.getGender(),
                patient.getMotherName(), patient.getMobileNo(), patient.getAadharNo(), patient.getOccupation(),
                patient.getIncome(), patient.getAddress(), patient.getWardName(),
                patient.getAdmissionDate(), patient.getAdmissionTime(), finalDischargeDate, finalDischargeTime, summaryText,
                patient.getId()
            );
        } else {
            jdbcTemplate.update(
                "INSERT INTO discharge_entry (custom_patient_id, discharge_type, patient_db_id, discharge_ward, " +
                "ar_no, case_type, patient_name, age, gender, mother_name, mobile_no, " +
                "aadhar_no, occupation, income, address, admission_ward, " +
                "admission_date, admission_time, discharge_date, discharge_time, summary) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                patient.getPatientId(), dischargeType, patient.getId(), dischargeWard,
                patient.getArNo(), finalCaseType, patient.getPatientName(), patient.getAge(), patient.getGender(),
                patient.getMotherName(), patient.getMobileNo(), patient.getAadharNo(), patient.getOccupation(),
                patient.getIncome(), patient.getAddress(), patient.getWardName(),
                patient.getAdmissionDate(), patient.getAdmissionTime(), finalDischargeDate, finalDischargeTime, summaryText
            );
        }

        // Step 2: Update master_admission status to DISCHARGED
        jdbcTemplate.update(
            "UPDATE master_admission_table_of_patients SET status=?, case_type=? WHERE patient_id=?",
            "DISCHARGED", finalCaseType, patientId
        );

        String generatedId = null;

        // Step 3: Replicate to destination table (mlc_discharge, death_discharge, etc.)
        try {
            if (destinationTable != null && destinationTable.matches("x[6-7]|mlc_discharge|death_discharge|maternity_block_discharge|insurance_block_discharge|general_side_discharge")) {
                
                // Ensure the custom auto-increment ID column exists
                String newIdColumnName = "patient_" + destinationTable + "_id";
                try {
                    jdbcTemplate.execute("ALTER TABLE " + destinationTable + " ADD COLUMN IF NOT EXISTS " + newIdColumnName + " VARCHAR(255)");
                    jdbcTemplate.execute("ALTER TABLE " + destinationTable + " ALTER COLUMN " + newIdColumnName + " TYPE VARCHAR(255) USING " + newIdColumnName + "::varchar");
                    jdbcTemplate.execute("ALTER TABLE " + destinationTable + " ALTER COLUMN " + newIdColumnName + " DROP DEFAULT");
                    jdbcTemplate.execute("ALTER TABLE " + destinationTable + " ALTER COLUMN " + newIdColumnName + " DROP NOT NULL");
                } catch (Exception e) {
                    System.err.println("Could not alter column " + newIdColumnName + " to VARCHAR in " + destinationTable + ": " + e.getMessage());
                }
                
                // Dynamically ensure new columns exist (auto-healing the DB schema)
                try { jdbcTemplate.execute("ALTER TABLE " + destinationTable + " ADD COLUMN IF NOT EXISTS income VARCHAR(255)"); } catch (Exception e) {}
                try { jdbcTemplate.execute("ALTER TABLE " + destinationTable + " ADD COLUMN IF NOT EXISTS summary TEXT"); } catch (Exception e) {}
                try { jdbcTemplate.execute("ALTER TABLE discharge_entry ADD COLUMN IF NOT EXISTS summary TEXT"); } catch (Exception e) {}

                String sql = "INSERT INTO " + destinationTable + " (" +
                    "custom_patient_id, discharge_type, patient_db_id, discharge_ward, " +
                    "ar_no, case_type, patient_name, age, gender, mother_name, mobile_no, " +
                    "aadhar_no, occupation, income, address, admission_ward, " +
                    "admission_date, admission_time, discharge_date, discharge_time, summary" +
                    ") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id";

                Long baseId = jdbcTemplate.queryForObject(sql, Long.class, 
                    patient.getPatientId(), dischargeType, patient.getId(), dischargeWard,
                    patient.getArNo(), finalCaseType, patient.getPatientName(), patient.getAge(), patient.getGender(),
                    patient.getMotherName(), patient.getMobileNo(), patient.getAadharNo(), patient.getOccupation(),
                    patient.getIncome(), patient.getAddress(), patient.getWardName(),
                    patient.getAdmissionDate(), patient.getAdmissionTime(), finalDischargeDate, finalDischargeTime, summaryText
                );

                if (baseId != null) {
                    String formattedId = java.time.Year.now().getValue() + "-" + baseId;
                    jdbcTemplate.update("UPDATE " + destinationTable + " SET " + newIdColumnName + " = ? WHERE id = ?", formattedId, baseId);
                    generatedId = formattedId;
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to replicate to " + destinationTable + ": " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Replication failed: " + e.getMessage());
        }

        // Step 4: DELETE patient from active patients table
        jdbcTemplate.update("DELETE FROM active_patients WHERE patient_id = ?", patientId);

        return generatedId;
    }


    @Transactional
    public void undoDischarge(String patientId, String destinationTable, String destinationId) {
        // 1. Delete from destination table if it was created
        if (destinationTable != null && !destinationTable.isEmpty() && destinationId != null && !destinationId.trim().isEmpty()) {
            try {
                String idCol = "patient_" + destinationTable + "_id";
                String sql = "DELETE FROM " + destinationTable + " WHERE " + idCol + " = ?";
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
                    entry.setDestinationTableId(rs.getString("patient_" + tableName + "_id"));
                    idSet = true;
                } catch (Exception e) {}
                
                if (!idSet) {
                    try {
                        entry.setDestinationTableId(rs.getString("id"));
                        idSet = true;
                    } catch (Exception e) {}
                }
                
                if (!idSet) {
                    try {
                        entry.setDestinationTableId(rs.getString(tableName + "_id"));
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

            entry.setAddress(rs.getString("address"));
            return entry;
        });
    }
}

