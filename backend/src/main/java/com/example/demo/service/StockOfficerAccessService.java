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

    public StockOfficerAccess updateStatus(Long id, StockOfficerAccess.Status status) {
        StockOfficerAccess user = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(status);
        return repository.save(user);
    }
}
