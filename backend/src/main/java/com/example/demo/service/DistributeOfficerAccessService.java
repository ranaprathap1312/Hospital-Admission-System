package com.example.demo.service;

import com.example.demo.entity.DistributeOfficerAccess;
import com.example.demo.repository.DistributeOfficerAccessRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DistributeOfficerAccessService {

    @Autowired
    private DistributeOfficerAccessRepository repository;

    public DistributeOfficerAccess register(DistributeOfficerAccess access) {
        if (repository.findByEmailOrPhoneNumber(access.getEmail(), access.getPhoneNumber()).isPresent()) {
            throw new RuntimeException("Email or Phone Number already exists");
        }
        return repository.save(access);
    }

    public DistributeOfficerAccess login(String identifier, String password) {
        Optional<DistributeOfficerAccess> userOpt = repository.findByEmailOrPhoneNumber(identifier, identifier);
        
        if (userOpt.isPresent()) {
            DistributeOfficerAccess user = userOpt.get();
            if (user.getPassword().equals(password)) {
                if (user.getStatus() == DistributeOfficerAccess.Status.ACTIVE) {
                    return user;
                } else if (user.getStatus() == DistributeOfficerAccess.Status.PENDING_APPROVAL) {
                    throw new RuntimeException("Account is pending approval from higher official");
                } else {
                    throw new RuntimeException("Account access denied");
                }
            }
        }
        throw new RuntimeException("Invalid credentials");
    }

    public List<DistributeOfficerAccess> getPendingApprovals() {
        return repository.findByStatus(DistributeOfficerAccess.Status.PENDING_APPROVAL);
    }

    public DistributeOfficerAccess updateStatus(Long id, DistributeOfficerAccess.Status status) {
        DistributeOfficerAccess user = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(status);
        return repository.save(user);
    }
}
