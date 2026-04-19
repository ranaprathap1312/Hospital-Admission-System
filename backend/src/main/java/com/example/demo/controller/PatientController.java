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

    @GetMapping
    public ResponseEntity<java.util.List<Patient>> getAllPatients() {
        try {
            java.util.List<Patient> patients = patientService.getAllPatients();
            return new ResponseEntity<>(patients, HttpStatus.OK);
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
    public ResponseEntity<Patient> dischargePatient(@PathVariable String patientId, @RequestBody java.util.Map<String, String> payload) {
        try {
            String dischargeType = payload.get("dischargeType");
            String dischargeWard = payload.get("dischargeWard");
            String dischargeDate = payload.get("dischargeDate");
            Patient dischargedPatient = patientService.dischargePatient(patientId, dischargeType, dischargeWard, dischargeDate);
            return new ResponseEntity<>(dischargedPatient, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
