package com.example.demo.controller;

import com.example.demo.entity.MasterAdmission;
import com.example.demo.entity.Patient;
import com.example.demo.service.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    @Autowired
    private PatientService patientService;

    @PostMapping("/admit")
    public ResponseEntity<Patient> admitPatient(@RequestBody Patient patient) {
        try {
            Patient savedPatient = patientService.admitPatient(patient);
            return new ResponseEntity<>(savedPatient, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{patientId}")
    public ResponseEntity<Void> undoAdmission(@PathVariable String patientId) {
        try {
            patientService.deletePatient(patientId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/next-id")
    public ResponseEntity<String> getNextPatientId() {
        try {
            String nextId = patientService.generateNextPatientId();
            return new ResponseEntity<>(nextId, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping
    public ResponseEntity<java.util.List<Patient>> getAllPatients() {
        try {
            java.util.List<Patient> patients = patientService.getAllPatients();
            return new ResponseEntity<>(patients, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/discharge-entries")
    public ResponseEntity<java.util.List<com.example.demo.entity.DischargeEntry>> getAllDischargeEntries() {
        try {
            java.util.List<com.example.demo.entity.DischargeEntry> entries = patientService.getAllDischargeEntries();
            return new ResponseEntity<>(entries, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/destination/{tableName}")
    public ResponseEntity<java.util.List<com.example.demo.entity.DischargeEntry>> getDestinationRecords(@org.springframework.web.bind.annotation.PathVariable String tableName) {
        try {
            java.util.List<com.example.demo.entity.DischargeEntry> entries = patientService.getDestinationTableRecords(tableName);
            return new ResponseEntity<>(entries, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/master-admissions")
    public ResponseEntity<java.util.List<MasterAdmission>> getAllMasterAdmissions() {
        try {
            java.util.List<MasterAdmission> admissions = patientService.getAllMasterAdmissions();
            return new ResponseEntity<>(admissions, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Transactional
    @GetMapping("/master-admissions/by-patient-id/{patientId}")
    public ResponseEntity<MasterAdmission> getMasterAdmissionByPatientId(@PathVariable String patientId) {
        try {
            java.util.Optional<MasterAdmission> admission = patientService.getMasterAdmissionByPatientId(patientId);
            return admission.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                    .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/debug")
    public ResponseEntity<java.util.Map<String, Object>> getDebugInfo() {
        java.util.Map<String, Object> info = new java.util.HashMap<>();
        info.put("patientsCount", patientService.getAllPatients().size());
        info.put("masterAdmissionsCount", patientService.getAllMasterAdmissions().size());
        return new ResponseEntity<>(info, HttpStatus.OK);
    }

    @GetMapping("/id/{patientId}")
    public ResponseEntity<Patient> getPatientByPatientId(@PathVariable String patientId) {
        java.util.Optional<Patient> patient = patientService.getPatientByPatientId(patientId);
        return patient.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PutMapping("/id/{patientId}")
    public ResponseEntity<Patient> updatePatient(@PathVariable String patientId, @RequestBody Patient updatedData) {
        try {
            Patient updatedPatient = patientService.updatePatient(patientId, updatedData);
            return new ResponseEntity<>(updatedPatient, HttpStatus.OK);
        } catch (RuntimeException e) {
            System.err.println("Error updating patient " + patientId + ": " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            System.err.println("Unexpected error updating patient: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Transactional
    @PostMapping("/id/{patientId}/upload-case-file")
    public ResponseEntity<String> uploadCaseFile(
            @PathVariable String patientId,
            @RequestPart(value = "file") MultipartFile file) {
        try {
            patientService.saveCaseFile(patientId, file);
            return ResponseEntity.ok("Case file uploaded successfully.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error uploading file: " + e.getMessage());
        }
    }

    @Transactional
    @GetMapping("/id/{patientId}/case-file")
    public ResponseEntity<byte[]> viewCaseFile(@PathVariable String patientId) {
        try {
            MasterAdmission master = patientService.getCaseFile(patientId);
            if (master.getCaseFileData() == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + master.getCaseFileName() + "\"")
                    .contentType(MediaType.parseMediaType(master.getCaseFileType() != null ? master.getCaseFileType() : "application/pdf"))
                    .body(master.getCaseFileData());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .contentType(MediaType.TEXT_PLAIN)
                .body(("Error: " + e.getClass().getName() + " - " + e.getMessage()).getBytes());
        }
    }

    @Transactional
    @DeleteMapping("/id/{patientId}/case-file")
    public ResponseEntity<String> deleteCaseFile(@PathVariable String patientId) {
        try {
            patientService.deleteCaseFile(patientId);
            return ResponseEntity.ok("Case file deleted successfully.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deleting case file: " + e.getMessage());
        }
    }

    @PutMapping("/{patientId}/discharge")
    public ResponseEntity<Object> dischargePatient(@PathVariable String patientId, @RequestBody java.util.Map<String, String> payload) {
        try {
            String dischargeType = payload.get("dischargeType");
            String dischargeWard = payload.get("dischargeWard");
            String dischargeDate = payload.get("dischargeDate");
            String destinationTable = payload.get("destinationTable");
            String caseType = payload.get("caseType");
            String summaryText = payload.get("summaryText");
            String destinationId = patientService.dischargePatient(patientId, dischargeType, dischargeWard, dischargeDate, destinationTable, caseType, summaryText);
            return ResponseEntity.ok(java.util.Collections.singletonMap("destinationId", destinationId));
        } catch (RuntimeException e) {
            System.err.println("Discharge error for patient " + patientId + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(java.util.Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            System.err.println("Unexpected discharge error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(java.util.Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping("/{patientId}/undo-discharge")
    public ResponseEntity<Void> undoDischarge(@PathVariable String patientId, @RequestBody java.util.Map<String, String> payload) {
        try {
            String destinationTable = payload.get("destinationTable");
            String destinationIdStr = payload.get("destinationId");
            patientService.undoDischarge(patientId, destinationTable, destinationIdStr);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @GetMapping("/clear-db")
    public ResponseEntity<String> clearDb() {
        jdbcTemplate.execute("TRUNCATE TABLE patient, master_admission, discharge_entry, mlc_discharge, death_discharge, maternity_block_discharge, insurance_block_discharge, general_side_discharge, x6, x7 RESTART IDENTITY CASCADE");
        return ResponseEntity.ok("All patient and discharge records have been successfully deleted. The system is reset for a fresh start!");
    }

    @GetMapping("/migrate-db")
    public ResponseEntity<String> migrateDb() {
        String[] tables = {"mlc_discharge", "death_discharge", "maternity_block_discharge", "insurance_block_discharge", "general_side_discharge", "x6", "x7"};
        StringBuilder result = new StringBuilder("Migration Results:\n");
        
        String createTableSql = " ( " +
            "id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY, " +
            "custom_patient_id VARCHAR(255), " +
            "discharge_type VARCHAR(255), " +
            "patient_db_id BIGINT, " +
            "discharge_ward VARCHAR(255), " +
            "ar_no VARCHAR(255), " +
            "case_type VARCHAR(255), " +
            "patient_name VARCHAR(255), " +
            "age INTEGER, " +
            "gender VARCHAR(255), " +
            "mother_name VARCHAR(255), " +
            "mobile_no VARCHAR(255), " +
            "aadhar_no VARCHAR(255), " +
            "occupation VARCHAR(255), " +
            "income VARCHAR(255), " +
            "address VARCHAR(255), " +
            "admission_ward VARCHAR(255), " +
            "admission_date DATE, " +
            "admission_time TIME, " +
            "discharge_date DATE, " +
            "discharge_time TIME, " +
            "summary TEXT " +
        ")";

        for (String table : tables) {
            try {
                jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS " + table + createTableSql);
                result.append("✅ Created table ").append(table).append("\n");
                
                // Add income if the table already existed but was missing the column
                try {
                    jdbcTemplate.execute("ALTER TABLE " + table + " ADD COLUMN income VARCHAR(255);");
                    result.append("   ✅ Added 'income' to ").append(table).append("\n");
                } catch (Exception e) {}
                
                // Add summary if the table already existed but was missing the column
                try {
                    jdbcTemplate.execute("ALTER TABLE " + table + " ADD COLUMN summary TEXT;");
                    result.append("   ✅ Added 'summary' to ").append(table).append("\n");
                } catch (Exception e) {}

            } catch (Exception e) {
                result.append("❌ Failed to create ").append(table).append(": ").append(e.getMessage()).append("\n");
            }
        }
        
        // Add summary to discharge_entry explicitly as well
        try {
            jdbcTemplate.execute("ALTER TABLE discharge_entry ADD COLUMN summary TEXT;");
            result.append("✅ Added 'summary' to discharge_entry\n");
        } catch (Exception e) {}

        // Drop the foreign key constraint that blocks discharge on production
        try {
            jdbcTemplate.execute("ALTER TABLE discharge_entry DROP CONSTRAINT IF EXISTS fkc4xnbbu1vvuk88e6h5uocpvc;");
            result.append("\n✅ Successfully dropped outdated foreign key constraint from discharge_entry\n");
        } catch (Exception e) {
            result.append("\nℹ️ Skipped dropping foreign key constraint (might already be removed): ").append(e.getMessage()).append("\n");
        }

        return ResponseEntity.ok(result.toString());
    }
}
