package com.example.demo.service;

import com.example.demo.entity.StockOfficerAccess;
import com.example.demo.repository.StockOfficerAccessRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StockOfficerAccessService {

    @Autowired
    private StockOfficerAccessRepository repository;

    public StockOfficerAccess register(StockOfficerAccess access) {
        if (repository.findByEmail(access.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }
        if (repository.findByPhoneNumber(access.getPhoneNumber()).isPresent()) {
            throw new RuntimeException("Phone number already registered");
        }
        return repository.save(access);
    }

    public StockOfficerAccess login(String identifier, String password) {
        Optional<StockOfficerAccess> userOpt = repository.findByEmail(identifier);
        if (userOpt.isEmpty()) {
            userOpt = repository.findByPhoneNumber(identifier);
        }

        if (userOpt.isPresent()) {
            StockOfficerAccess user = userOpt.get();
            if (user.getPassword().equals(password)) {
                if (user.getStatus() == StockOfficerAccess.Status.PAUSED) {
                    throw new RuntimeException("Your access has been temporarily paused by a higher official.");
                }
                if (user.getStatus() != StockOfficerAccess.Status.ACTIVE) {
                    throw new RuntimeException("Account is " + user.getStatus().name() + ". Please wait for higher official approval.");
                }
                return user;
            } else {
                throw new RuntimeException("Invalid password");
            }
        }
        throw new RuntimeException("User not found");
    }

    public List<StockOfficerAccess> getPendingApprovals() {
        return repository.findByStatus(StockOfficerAccess.Status.PENDING_APPROVAL);
    }

    public List<StockOfficerAccess> getGrantedAccesses() {
        return repository.findByStatusIn(java.util.Arrays.asList(StockOfficerAccess.Status.ACTIVE, StockOfficerAccess.Status.PAUSED));
    }

    public boolean togglePauseAccess(Long id) {
        Optional<StockOfficerAccess> accessOpt = repository.findById(id);
        if (accessOpt.isPresent()) {
            StockOfficerAccess access = accessOpt.get();
            if (access.getStatus() == StockOfficerAccess.Status.ACTIVE) {
                access.setStatus(StockOfficerAccess.Status.PAUSED);
            } else if (access.getStatus() == StockOfficerAccess.Status.PAUSED) {
                access.setStatus(StockOfficerAccess.Status.ACTIVE);
            }
            repository.save(access);
            return true;
        }
        return false;
    }

    public boolean removeGrantedAccess(Long id) {
        Optional<StockOfficerAccess> accessOpt = repository.findById(id);
        if (accessOpt.isPresent()) {
            repository.delete(accessOpt.get());
            return true;
        }
        return false;
    }

    public StockOfficerAccess updateStatus(Long id, StockOfficerAccess.Status status) {
        StockOfficerAccess user = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(status);
        return repository.save(user);
    }
}
