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
                } else if (user.getStatus() == DistributeOfficerAccess.Status.PAUSED) {
                    throw new RuntimeException("Your access has been temporarily paused by a higher official.");
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

    public List<DistributeOfficerAccess> getGrantedAccesses() {
        return repository.findByStatusIn(java.util.Arrays.asList(DistributeOfficerAccess.Status.ACTIVE, DistributeOfficerAccess.Status.PAUSED));
    }

    public boolean togglePauseAccess(Long id) {
        Optional<DistributeOfficerAccess> accessOpt = repository.findById(id);
        if (accessOpt.isPresent()) {
            DistributeOfficerAccess access = accessOpt.get();
            if (access.getStatus() == DistributeOfficerAccess.Status.ACTIVE) {
                access.setStatus(DistributeOfficerAccess.Status.PAUSED);
            } else if (access.getStatus() == DistributeOfficerAccess.Status.PAUSED) {
                access.setStatus(DistributeOfficerAccess.Status.ACTIVE);
            }
            repository.save(access);
            return true;
        }
        return false;
    }

    public boolean removeGrantedAccess(Long id) {
        Optional<DistributeOfficerAccess> accessOpt = repository.findById(id);
        if (accessOpt.isPresent()) {
            repository.delete(accessOpt.get());
            return true;
        }
        return false;
    }

    public DistributeOfficerAccess updateStatus(Long id, DistributeOfficerAccess.Status status) {
        DistributeOfficerAccess user = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(status);
        return repository.save(user);
    }
}
