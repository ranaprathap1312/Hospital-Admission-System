package com.example.demo.controller;

import com.example.demo.entity.DistributeOfficerAccess;
import com.example.demo.service.DistributeOfficerAccessService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/distribute-officer-access")
public class DistributeOfficerAccessController {

    @Autowired
    private DistributeOfficerAccessService service;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody DistributeOfficerAccess access) {
        try {
            DistributeOfficerAccess saved = service.register(access);
            return ResponseEntity.ok(Map.of("message", "Registration successful! Wait for higher official approval.", "success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage(), "success", false));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        try {
            String identifier = credentials.get("identifier");
            String password = credentials.get("password");
            DistributeOfficerAccess user = service.login(identifier, password);
            return ResponseEntity.ok(Map.of(
                    "message", "Login successful",
                    "success", true,
                    "name", user.getName(),
                    "id", user.getId()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage(), "success", false));
        }
    }

    @GetMapping("/pending")
    public ResponseEntity<?> getPendingApprovals() {
        return ResponseEntity.ok(service.getPendingApprovals());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            DistributeOfficerAccess.Status status = DistributeOfficerAccess.Status.valueOf(body.get("status"));
            DistributeOfficerAccess updated = service.updateStatus(id, status);
            return ResponseEntity.ok(Map.of("message", "Status updated successfully", "success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage(), "success", false));
        }
    }

    @GetMapping("/granted")
    public ResponseEntity<?> getGrantedAccesses() {
        return ResponseEntity.ok(service.getGrantedAccesses());
    }

    @PutMapping("/toggle-pause/{id}")
    public ResponseEntity<?> togglePauseAccess(@PathVariable Long id) {
        boolean success = service.togglePauseAccess(id);
        if (success) {
            return ResponseEntity.ok(Map.of("message", "Access status toggled", "success", true));
        }
        return ResponseEntity.badRequest().body(Map.of("message", "Failed to toggle status", "success", false));
    }

    @DeleteMapping("/remove/{id}")
    public ResponseEntity<?> removeGrantedAccess(@PathVariable Long id) {
        boolean success = service.removeGrantedAccess(id);
        if (success) {
            return ResponseEntity.ok(Map.of("message", "Access completely removed", "success", true));
        }
        return ResponseEntity.badRequest().body(Map.of("message", "Failed to remove access", "success", false));
    }
}
