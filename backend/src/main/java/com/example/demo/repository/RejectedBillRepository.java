package com.example.demo.repository;

import com.example.demo.entity.RejectedBill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RejectedBillRepository extends JpaRepository<RejectedBill, Long> {
}
