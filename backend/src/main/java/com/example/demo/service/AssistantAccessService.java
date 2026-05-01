package com.example.demo.service;

import com.example.demo.entity.AssistantAccess;
import com.example.demo.repository.AssistantAccessRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AssistantAccessService {

    @Autowired
    private AssistantAccessRepository repository;

    public AssistantAccess register(AssistantAccess access) throws Exception {
        if (repository.findByEmail(access.getEmail()).isPresent()) {
            throw new Exception("Email already registered!");
        }
        if (repository.findByPhoneNumber(access.getPhoneNumber()).isPresent()) {
            throw new Exception("Phone number already registered!");
        }
        
        access.setStatus(AssistantAccess.Status.PENDING_APPROVAL);
        access.setCreatedAt(LocalDateTime.now());
        access.setRole("ROLE_ASSISTANT");
        return repository.save(access);
    }

    public AssistantAccess login(String identifier, String password) throws Exception {
        Optional<AssistantAccess> userOpt = repository.findByEmail(identifier);
        if (!userOpt.isPresent()) {
            userOpt = repository.findByPhoneNumber(identifier);
        }

        if (userOpt.isPresent()) {
            AssistantAccess user = userOpt.get();
            if (user.getPassword().equals(password)) {
                if (user.getStatus() == AssistantAccess.Status.ACTIVE) {
                    return user;
                } else if (user.getStatus() == AssistantAccess.Status.PENDING_APPROVAL) {
                    throw new Exception("Account pending approval by higher official.");
                } else if (user.getStatus() == AssistantAccess.Status.PAUSED) {
                    throw new Exception("Your access has been temporarily paused by a higher official.");
                } else {
                    throw new Exception("Account has been rejected.");
                }
            } else {
                throw new Exception("Invalid password.");
            }
        }
        throw new Exception("User not found.");
    }

    public List<AssistantAccess> getPendingApprovals() {
        return repository.findByStatus(AssistantAccess.Status.PENDING_APPROVAL);
    }

    public List<AssistantAccess> getGrantedAccesses() {
        return repository.findByStatusIn(java.util.Arrays.asList(AssistantAccess.Status.ACTIVE, AssistantAccess.Status.PAUSED));
    }

    public boolean togglePauseAccess(Long id) {
        Optional<AssistantAccess> accessOpt = repository.findById(id);
        if (accessOpt.isPresent()) {
            AssistantAccess access = accessOpt.get();
            if (access.getStatus() == AssistantAccess.Status.ACTIVE) {
                access.setStatus(AssistantAccess.Status.PAUSED);
            } else if (access.getStatus() == AssistantAccess.Status.PAUSED) {
                access.setStatus(AssistantAccess.Status.ACTIVE);
            }
            repository.save(access);
            return true;
        }
        return false;
    }

    public boolean removeGrantedAccess(Long id) {
        Optional<AssistantAccess> accessOpt = repository.findById(id);
        if (accessOpt.isPresent()) {
            repository.delete(accessOpt.get());
            return true;
        }
        return false;
    }

    public AssistantAccess updateStatus(Long id, AssistantAccess.Status status) throws Exception {
        AssistantAccess user = repository.findById(id)
                .orElseThrow(() -> new Exception("User not found"));
        user.setStatus(status);
        return repository.save(user);
    }
}
