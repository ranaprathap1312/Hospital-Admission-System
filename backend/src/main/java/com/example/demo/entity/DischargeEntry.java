package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "discharge_entry")
public class DischargeEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_db_id")
    private Long patientDbId;

    @Column(name = "custom_patient_id")
    private String customPatientId;

    @Column(name = "discharge_type")
    private String dischargeType;

    @Column(name = "discharge_ward")
    private String dischargeWard;

    @Column(name = "discharge_date")
    private LocalDate dischargeDate;

    @Column(name = "discharge_time")
    private LocalTime dischargeTime;

    @Column(name = "case_type")
    private String caseType;

    @Column(name = "ar_no")
    private String arNo;

    @Column(name = "patient_name")
    private String patientName;

    private Integer age;

    private String gender;

    @Column(name = "mother_name")
    private String motherName;

    @Column(name = "mobile_no")
    private String mobileNo;

    @Column(name = "aadhar_no")
    private String aadharNo;

    private String occupation;
    private String income;

    @Column(name = "caretaker_name")
    private String caretakerName;

    @Transient
    private Long destinationTableId;

    public DischargeEntry() {
    }

    private String address;

    @Column(name = "admission_ward")
    private String admissionWard;

    @Column(name = "admission_date")
    private LocalDate admissionDate;

    @Column(name = "admission_time")
    private LocalTime admissionTime;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getPatientDbId() { return patientDbId; }
    public void setPatientDbId(Long patientDbId) { this.patientDbId = patientDbId; }

    public String getCustomPatientId() { return customPatientId; }
    public void setCustomPatientId(String customPatientId) { this.customPatientId = customPatientId; }

    public String getDischargeType() { return dischargeType; }
    public void setDischargeType(String dischargeType) { this.dischargeType = dischargeType; }

    public String getDischargeWard() { return dischargeWard; }
    public void setDischargeWard(String dischargeWard) { this.dischargeWard = dischargeWard; }

    public LocalDate getDischargeDate() { return dischargeDate; }
    public void setDischargeDate(LocalDate dischargeDate) { this.dischargeDate = dischargeDate; }

    public LocalTime getDischargeTime() { return dischargeTime; }
    public void setDischargeTime(LocalTime dischargeTime) { this.dischargeTime = dischargeTime; }

    public String getCaseType() { return caseType; }
    public void setCaseType(String caseType) { this.caseType = caseType; }

    public String getArNo() { return arNo; }
    public void setArNo(String arNo) { this.arNo = arNo; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getMotherName() { return motherName; }
    public void setMotherName(String motherName) { this.motherName = motherName; }

    public String getMobileNo() { return mobileNo; }
    public void setMobileNo(String mobileNo) { this.mobileNo = mobileNo; }

    public String getAadharNo() { return aadharNo; }
    public void setAadharNo(String aadharNo) { this.aadharNo = aadharNo; }

    public String getOccupation() { return occupation; }
    public void setOccupation(String occupation) { this.occupation = occupation; }

    public String getCaretakerName() { return caretakerName; }
    public void setCaretakerName(String caretakerName) { this.caretakerName = caretakerName; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getAdmissionWard() { return admissionWard; }
    public void setAdmissionWard(String admissionWard) { this.admissionWard = admissionWard; }

    public LocalDate getAdmissionDate() { return admissionDate; }
    public void setAdmissionDate(LocalDate admissionDate) { this.admissionDate = admissionDate; }

    public LocalTime getAdmissionTime() { return admissionTime; }
    public void setAdmissionTime(LocalTime admissionTime) { this.admissionTime = admissionTime; }

    public String getIncome() { return income; }
    public void setIncome(String income) { this.income = income; }

    public Long getDestinationTableId() { return destinationTableId; }
    public void setDestinationTableId(Long destinationTableId) { this.destinationTableId = destinationTableId; }
}
