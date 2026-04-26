package com.example.demo.config;

import com.example.demo.entity.Admin;
import com.example.demo.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private AdminRepository adminRepository;

    @Override
    public void run(String... args) throws Exception {
        try {
            Optional<Admin> oldAdmin = adminRepository.findByEmail("ranaprathap13122003@gmail.com");
            Optional<Admin> newAdmin = adminRepository.findByEmail("rajaji.gh@gmail.com");

            if (oldAdmin.isPresent()) {
                // Migrate old email to new one
                Admin admin = oldAdmin.get();
                admin.setEmail("rajaji.gh@gmail.com");
                adminRepository.save(admin);
                System.out.println("Super Admin email migrated to: rajaji.gh@gmail.com");
            } else if (newAdmin.isEmpty()) {
                // Create fresh super admin
                Admin defaultAdmin = new Admin();
                defaultAdmin.setName("System Administrator");
                defaultAdmin.setEmail("rajaji.gh@gmail.com");
                defaultAdmin.setPhone("9999999999");
                defaultAdmin.setPassword("password123");
                defaultAdmin.setRole("SUPER_ADMIN");
                defaultAdmin.setStatus("ACTIVE");
                adminRepository.save(defaultAdmin);
                System.out.println("Default Super Admin created: email='rajaji.gh@gmail.com'");
            } else {
                System.out.println("Super Admin already exists with email: rajaji.gh@gmail.com");
            }
        } catch (Exception e) {
            System.out.println("DataSeeder skipped: " + e.getMessage());
        }
    }
}
