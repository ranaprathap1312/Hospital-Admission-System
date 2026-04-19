package com.example.demo.service;

import com.example.demo.entity.DischargeEntry;
import com.example.demo.entity.Patient;
import com.example.demo.repository.DischargeEntryRepository;
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
        
        return savedPatient;
    }

    public java.util.List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    public java.util.Optional<Patient> getPatientByPatientId(String patientId) {
        return patientRepository.findByPatientId(patientId);
    }

    public Patient dischargePatient(String patientId, String dischargeType) {
        java.util.Optional<Patient> optionalPatient = patientRepository.findByPatientId(patientId);
        if (optionalPatient.isPresent()) {
            Patient patient = optionalPatient.get();
            patient.setStatus("DISCHARGED");
            patientRepository.save(patient);

            DischargeEntry entry = new DischargeEntry();
            entry.setPatient(patient);
            entry.setCustomPatientId(patient.getPatientId());
            entry.setDischargeType(dischargeType);
            entry.setDischargeDate(LocalDateTime.now());
            dischargeEntryRepository.save(entry);

            return patient;
        }
        throw new RuntimeException("Patient not found with ID: " + patientId);
    }
}
