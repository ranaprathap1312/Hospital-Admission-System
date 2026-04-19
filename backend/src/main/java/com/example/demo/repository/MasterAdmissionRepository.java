package com.example.demo.repository;

import com.example.demo.entity.MasterAdmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MasterAdmissionRepository extends JpaRepository<MasterAdmission, Long> {
}
