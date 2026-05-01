package com.example.demo.repository;

import com.example.demo.entity.AssistantBill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssistantBillRepository extends JpaRepository<AssistantBill, Long> {
    List<AssistantBill> findByTargetAssistantOrderByForwardedAtDesc(String targetAssistant);
    List<AssistantBill> findByTargetAssistantAndStatusOrderByForwardedAtDesc(String targetAssistant, String status);
}
