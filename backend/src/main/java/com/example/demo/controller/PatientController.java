package com.example.demo.controller;

import com.example.demo.entity.MasterAdmission;
import com.example.demo.entity.Patient;
import com.example.demo.service.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @PutMapping("/{patientId}/discharge")
    public ResponseEntity<Void> dischargePatient(@PathVariable String patientId, @RequestBody java.util.Map<String, String> payload) {
        try {
            String dischargeType = payload.get("dischargeType");
            String dischargeWard = payload.get("dischargeWard");
            String dischargeDate = payload.get("dischargeDate");
            String destinationTable = payload.get("destinationTable");
            patientService.dischargePatient(patientId, dischargeType, dischargeWard, dischargeDate, destinationTable);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @GetMapping("/fix-db")
    public ResponseEntity<String> fixDb() {
        jdbcTemplate.update("UPDATE patient SET patient_id = '2026-4' WHERE id = 62");
        jdbcTemplate.update("UPDATE master_admission SET patient_id = '2026-4' WHERE id = 57");
        jdbcTemplate.update("UPDATE patient SET patient_id = '2026-5' WHERE id = 63");
        jdbcTemplate.update("UPDATE master_admission SET patient_id = '2026-5' WHERE id = 58");
        return ResponseEntity.ok("Database fixed! You can remove this endpoint now.");
    }
}
