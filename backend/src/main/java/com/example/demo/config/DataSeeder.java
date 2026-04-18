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
        
        if (existingAdmin.isEmpty()) {
            Admin defaultAdmin = new Admin();
            defaultAdmin.setName("System Administrator");
            defaultAdmin.setEmail("rajaji.gh@gmail.com");
            defaultAdmin.setPhone("0000000000");
            // In production, you would hash this password
            defaultAdmin.setPassword("password123"); 
            defaultAdmin.setRole("SUPER_ADMIN");
            defaultAdmin.setStatus("ACTIVE");
            
            adminRepository.save(defaultAdmin);
            System.out.println("Default Super Admin created: email='rajaji.gh@gmail.com', password='password123'");
        }
    }
}
