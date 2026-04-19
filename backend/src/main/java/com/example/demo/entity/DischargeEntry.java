package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "discharge_entry")
public class DischargeEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "patient_db_id", referencedColumnName = "id")
    private Patient patient;

    @Column(name = "custom_patient_id")
    private String customPatientId;

    @Column(name = "discharge_type")
    private String dischargeType;

    @Column(name = "discharge_ward")
    private String dischargeWard;

    @Column(name = "discharge_date")
    private LocalDateTime dischargeDate;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }

    public String getCustomPatientId() { return customPatientId; }
    public void setCustomPatientId(String customPatientId) { this.customPatientId = customPatientId; }

    public String getDischargeType() { return dischargeType; }
    public void setDischargeType(String dischargeType) { this.dischargeType = dischargeType; }

    public String getDischargeWard() { return dischargeWard; }
    public void setDischargeWard(String dischargeWard) { this.dischargeWard = dischargeWard; }

    public LocalDateTime getDischargeDate() { return dischargeDate; }
    public void setDischargeDate(LocalDateTime dischargeDate) { this.dischargeDate = dischargeDate; }
}
