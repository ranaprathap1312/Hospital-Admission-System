package com.example.demo.repository;

import com.example.demo.entity.NewBillDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NewBillDetailRepository extends JpaRepository<NewBillDetail, Long> {
    Optional<NewBillDetail> findByBillRegisterNo(String billRegisterNo);

    Optional<NewBillDetail> findTopByOrderByIdDesc();
}
