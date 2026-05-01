package com.example.demo.repository;

import com.example.demo.entity.AssistantAccess;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssistantAccessRepository extends JpaRepository<AssistantAccess, Long> {
    Optional<AssistantAccess> findByEmail(String email);
    Optional<AssistantAccess> findByPhoneNumber(String phoneNumber);
    List<AssistantAccess> findByStatus(AssistantAccess.Status status);
    List<AssistantAccess> findByStatusIn(List<AssistantAccess.Status> statuses);
}
