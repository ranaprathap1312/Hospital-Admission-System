package com.example.demo.repository;

import com.example.demo.entity.DistributeOfficerAccess;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DistributeOfficerAccessRepository extends JpaRepository<DistributeOfficerAccess, Long> {
    Optional<DistributeOfficerAccess> findByEmailOrPhoneNumber(String email, String phoneNumber);
    List<DistributeOfficerAccess> findByStatus(DistributeOfficerAccess.Status status);
}
