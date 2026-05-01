package com.example.demo.repository;

import com.example.demo.entity.StockOfficerBill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockOfficerBillRepository extends JpaRepository<StockOfficerBill, Long> {
    List<StockOfficerBill> findByTargetOfficerOrderByCreatedAtDesc(String targetOfficer);
    List<StockOfficerBill> findByTargetOfficerAndStatusOrderByCreatedAtDesc(String targetOfficer, String status);
}
