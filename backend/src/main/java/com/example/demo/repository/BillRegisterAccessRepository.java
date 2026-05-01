package com.example.demo.repository;

import com.example.demo.entity.BillRegisterAccess;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BillRegisterAccessRepository extends JpaRepository<BillRegisterAccess, Long> {
    Optional<BillRegisterAccess> findByEmail(String email);
    Optional<BillRegisterAccess> findByPhone(String phone);
    List<BillRegisterAccess> findByStatus(String status);
}
