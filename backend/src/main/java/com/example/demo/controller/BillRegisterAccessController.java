package com.example.demo.controller;

import com.example.demo.entity.BillRegisterAccess;
import com.example.demo.service.BillRegisterAccessService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/bill-register-access")
public class BillRegisterAccessController {

    @Autowired
    private BillRegisterAccessService service;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        try {
            boolean isAuthenticated = service.login(email, password);

            if (isAuthenticated) {
                return ResponseEntity.ok(Map.of("message", "Login successful", "success", true));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid email or password", "success", false));
            }
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", e.getMessage(), "success", false));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody BillRegisterAccess access) {
        try {
            BillRegisterAccess newAccess = service.register(access);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("message", "Registration successful. Pending approval.", "success", true, "access", newAccess));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage(), "success", false));
        }
    }

    @GetMapping("/pending")
    public ResponseEntity<?> getPendingAccesses() {
        return ResponseEntity.ok(service.getPendingAccesses());
    }

    @PutMapping("/approve/{id}")
    public ResponseEntity<?> approveAccess(@PathVariable Long id) {
        boolean success = service.approveAccess(id);
        if (success) {
            return ResponseEntity.ok(Map.of("message", "Access approved successfully", "success", true));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Record not found", "success", false));
    }

    @DeleteMapping("/reject/{id}")
    public ResponseEntity<?> rejectAccess(@PathVariable Long id) {
        boolean success = service.rejectAccess(id);
        if (success) {
            return ResponseEntity.ok(Map.of("message", "Access rejected and removed", "success", true));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Record not found", "success", false));
    }
}
