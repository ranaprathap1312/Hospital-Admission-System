package com.example.demo.service;

import com.example.demo.entity.Admin;
import com.example.demo.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.List;

@Service
public class AdminService {

    @Autowired
    private AdminRepository adminRepository;

    public boolean login(String email, String password) {
        Optional<Admin> adminOpt = adminRepository.findByEmail(email);
        
        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            if (admin.getPassword().equals(password)) {
                if ("PENDING_APPROVAL".equals(admin.getStatus())) {
                    throw new RuntimeException("Your account is pending approval from a higher official.");
                }
                
                admin.setUpdatedAt(LocalDateTime.now());
                adminRepository.save(admin);
                return true;
            }
        }
        return false;
    }

    public Admin register(Admin admin) {
        if (adminRepository.findByEmail(admin.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }
        if (admin.getPhone() != null && adminRepository.findByPhone(admin.getPhone()).isPresent()) {
            throw new RuntimeException("Phone number already registered");
        }
        admin.setCreatedAt(LocalDateTime.now());
        admin.setUpdatedAt(LocalDateTime.now());
        if (admin.getRole() == null || admin.getRole().isEmpty()) {
            admin.setRole("ADMIN");
        }
        
        return adminRepository.save(admin);
    }

    public boolean loginOfficialStep1(String email, String password) {
        Optional<Admin> adminOpt = adminRepository.findByEmail(email);
        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            if (admin.getPassword().equals(password)) {
                if (!"SUPER_ADMIN".equals(admin.getRole())) {
                    throw new RuntimeException("Access Denied: You do not have Higher Official privileges.");
                }
                return true;
            }
        }
        return false;
    }

    public List<Admin> getPendingAdmins() {
        return adminRepository.findByStatus("PENDING_APPROVAL");
    }

    public boolean approveAdmin(Long id) {
        Optional<Admin> adminOpt = adminRepository.findById(id);
        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();
            admin.setStatus("ACTIVE");
            admin.setUpdatedAt(LocalDateTime.now());
            adminRepository.save(admin);
            return true;
        }
        return false;
    }

    public boolean rejectAdmin(Long id) {
        Optional<Admin> adminOpt = adminRepository.findById(id);
        if (adminOpt.isPresent()) {
            adminRepository.delete(adminOpt.get());
            return true;
        }
        return false;
    }
}
