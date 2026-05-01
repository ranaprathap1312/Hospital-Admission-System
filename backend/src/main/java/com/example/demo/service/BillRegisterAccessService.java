package com.example.demo.service;

import com.example.demo.entity.BillRegisterAccess;
import com.example.demo.repository.BillRegisterAccessRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class BillRegisterAccessService {

    @Autowired
    private BillRegisterAccessRepository repository;

    public boolean login(String email, String password) {
        Optional<BillRegisterAccess> accessOpt = repository.findByEmail(email);
        
        if (accessOpt.isPresent()) {
            BillRegisterAccess access = accessOpt.get();
            if (access.getPassword().equals(password)) {
                if ("PENDING_APPROVAL".equals(access.getStatus())) {
                    throw new RuntimeException("Your account is pending approval from a higher official.");
                }
                
                access.setUpdatedAt(LocalDateTime.now());
                repository.save(access);
                return true;
            }
        }
        return false;
    }

    public BillRegisterAccess register(BillRegisterAccess access) {
        if (repository.findByEmail(access.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }
        if (access.getPhone() != null && repository.findByPhone(access.getPhone()).isPresent()) {
            throw new RuntimeException("Phone number already registered");
        }
        access.setCreatedAt(LocalDateTime.now());
        access.setUpdatedAt(LocalDateTime.now());
        if (access.getRole() == null || access.getRole().isEmpty()) {
            access.setRole("BILLING");
        }
        
        return repository.save(access);
    }

    public List<BillRegisterAccess> getPendingAccesses() {
        return repository.findByStatus("PENDING_APPROVAL");
    }

    public boolean approveAccess(Long id) {
        Optional<BillRegisterAccess> accessOpt = repository.findById(id);
        if (accessOpt.isPresent()) {
            BillRegisterAccess access = accessOpt.get();
            access.setStatus("ACTIVE");
            access.setUpdatedAt(LocalDateTime.now());
            repository.save(access);
            return true;
        }
        return false;
    }

    public boolean rejectAccess(Long id) {
        Optional<BillRegisterAccess> accessOpt = repository.findById(id);
        if (accessOpt.isPresent()) {
            repository.delete(accessOpt.get());
            return true;
        }
        return false;
    }
}
