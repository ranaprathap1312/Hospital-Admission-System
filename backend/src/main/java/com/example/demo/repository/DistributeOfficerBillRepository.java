package com.example.demo.repository;

import com.example.demo.entity.DistributeOfficerBill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DistributeOfficerBillRepository extends JpaRepository<DistributeOfficerBill, Long> {
    List<DistributeOfficerBill> findAllByOrderByDistributedAtDesc();
    
    @org.springframework.data.jpa.repository.Query("SELECT d FROM DistributeOfficerBill d WHERE d.status = 'PENDING' OR d.status IS NULL ORDER BY d.distributedAt DESC")
    List<DistributeOfficerBill> findPendingOrNullStatusBills();
}
