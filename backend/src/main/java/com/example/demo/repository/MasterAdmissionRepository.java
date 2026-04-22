package com.example.demo.repository;

import com.example.demo.entity.MasterAdmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MasterAdmissionRepository extends JpaRepository<MasterAdmission, Long> {
    java.util.Optional<MasterAdmission> findByPatientId(String patientId);

    @Query("SELECT m.patientId FROM MasterAdmission m WHERE m.patientId LIKE :prefix%")
    java.util.List<String> findPatientIdsWithPrefix(@Param("prefix") String prefix);
}
