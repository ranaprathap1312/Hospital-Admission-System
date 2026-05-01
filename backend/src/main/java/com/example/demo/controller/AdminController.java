package com.example.demo.controller;

import com.example.demo.entity.Admin;
import com.example.demo.service.AdminService;
import com.example.demo.service.OtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        try {
            boolean isAuthenticated = adminService.login(email, password);

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

    @Autowired
    private OtpService otpService;

    @PostMapping("/generate-otp")
    public ResponseEntity<?> generateOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required", "success", false));
        }
        
        try {
            otpService.generateAndSendOtp(email);
            return ResponseEntity.ok(Map.of("message", "OTP sent successfully to " + email, "success", true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to send OTP", "success", false));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        
        if (email == null || otp == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email and OTP are required", "success", false));
        }

        boolean isValid = otpService.verifyOtp(email, otp);
        if (isValid) {
            return ResponseEntity.ok(Map.of("message", "OTP verified successfully", "success", true));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Invalid or expired OTP", "success", false));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Admin admin) {
        try {
            Admin newAdmin = adminService.register(admin);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("message", "Admin registered successfully", "success", true, "admin", newAdmin));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage(), "success", false));
        }
    }

    @PostMapping("/official/login-step1")
    public ResponseEntity<?> officialLoginStep1(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        try {
            boolean isValid = adminService.loginOfficialStep1(email, password);
            if (isValid) {
                // Trigger OTP
                otpService.generateAndSendOtp(email);
                return ResponseEntity.ok(Map.of("message", "Credentials valid. OTP sent to email.", "success", true));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid email or password", "success", false));
            }
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", e.getMessage(), "success", false));
        }
    }

    @PostMapping("/official/login-step2")
    public ResponseEntity<?> officialLoginStep2(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        
        boolean isValid = otpService.verifyOtp(email, otp);
        if (isValid) {
            return ResponseEntity.ok(Map.of("message", "Official Login successful", "success", true));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Invalid or expired OTP", "success", false));
        }
    }

    @GetMapping("/pending")
    public ResponseEntity<?> getPendingAdmins() {
        return ResponseEntity.ok(adminService.getPendingAdmins());
    }

    @PutMapping("/approve/{id}")
    public ResponseEntity<?> approveAdmin(@PathVariable Long id) {
        boolean success = adminService.approveAdmin(id);
        if (success) {
            return ResponseEntity.ok(Map.of("message", "Admin approved successfully", "success", true));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Admin not found", "success", false));
    }

    @DeleteMapping("/reject/{id}")
    public ResponseEntity<?> rejectAdmin(@PathVariable Long id) {
        boolean success = adminService.rejectAdmin(id);
        if (success) {
            return ResponseEntity.ok(Map.of("message", "Admin rejected and removed", "success", true));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Admin not found", "success", false));
    }

    @GetMapping("/granted")
    public ResponseEntity<?> getGrantedAdmins() {
        return ResponseEntity.ok(adminService.getGrantedAdmins());
    }

    @PutMapping("/toggle-pause/{id}")
    public ResponseEntity<?> togglePauseAdmin(@PathVariable Long id) {
        boolean success = adminService.togglePauseAdmin(id);
        if (success) {
            return ResponseEntity.ok(Map.of("message", "Admin access status toggled", "success", true));
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Failed to toggle status or cannot modify Super Admin", "success", false));
    }

    @DeleteMapping("/remove/{id}")
    public ResponseEntity<?> removeGrantedAdmin(@PathVariable Long id) {
        boolean success = adminService.removeGrantedAdmin(id);
        if (success) {
            return ResponseEntity.ok(Map.of("message", "Admin access completely removed", "success", true));
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Failed to remove admin or cannot modify Super Admin", "success", false));
    }
}
