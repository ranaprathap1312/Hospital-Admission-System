package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "patients")
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", unique = true)
    private String patientId;

    @Column(name = "patient_name")
    private String patientName;

    private Integer age;

    @Column(name = "mother_name")
    private String motherName;

    @Column(name = "admission_date")
    private LocalDateTime admissionDate;

    @Column(name = "ward_name")
    private String wardName;

    @Column(name = "mobile_no")
    private String mobileNo;

    @Column(name = "aadhar_no", unique = true)
    private String aadharNo;

    private String occupation;

    @Column(name = "caretaker_name")
    private String caretakerName;

    private String address;

    @Column(name = "case_type")
    private String caseType;

    @Column(name = "ar_no")
    private String arNo;

    private String gender;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "status")
    private String status = "ADMITTED";

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPatientId() { return patientId; }
    public void setPatientId(String patientId) { this.patientId = patientId; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public String getMotherName() { return motherName; }
    public void setMotherName(String motherName) { this.motherName = motherName; }

    public LocalDateTime getAdmissionDate() { return admissionDate; }
    public void setAdmissionDate(LocalDateTime admissionDate) { this.admissionDate = admissionDate; }

    public String getWardName() { return wardName; }
    public void setWardName(String wardName) { this.wardName = wardName; }

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

    public String getCaseType() { return caseType; }
    public void setCaseType(String caseType) { this.caseType = caseType; }

    public String getArNo() { return arNo; }
    public void setArNo(String arNo) { this.arNo = arNo; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
