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
        // Check if admin already exists
        Optional<Admin> existingAdmin = adminRepository.findByEmail("rajaji.gh@gmail.com");
        Optional<Admin> oldAdmin = adminRepository.findByEmail("ranaprathap13122003@gmail.com");

        // Migrate old admin email if it still exists
        if (oldAdmin.isPresent()) {
            Admin admin = oldAdmin.get();
            admin.setEmail("rajaji.gh@gmail.com");
            adminRepository.save(admin);
            System.out.println("Super Admin email updated to: rajaji.gh@gmail.com");
        } else if (existingAdmin.isEmpty()) {
            Admin defaultAdmin = new Admin();
            defaultAdmin.setName("System Administrator");
            defaultAdmin.setEmail("rajaji.gh@gmail.com");
            defaultAdmin.setPhone("9999999999");
            defaultAdmin.setPassword("password123");
            defaultAdmin.setRole("SUPER_ADMIN");
            defaultAdmin.setStatus("ACTIVE");
            
            adminRepository.save(defaultAdmin);
            System.out.println("Default Super Admin created: email='rajaji.gh@gmail.com', password='password123'");
        }
    }
}
