package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Service
public class OtpService {

    @Autowired
    private EmailService emailService;

    // Stores email -> OTP
    private final Map<String, String> otpStorage = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
    private final Random random = new Random();

    public void generateAndSendOtp(String email) {
        // Generate a 6 digit OTP
        String otp = String.format("%06d", random.nextInt(1000000));
        otpStorage.put(email, otp);

        // Schedule removal after 5 minutes
        scheduler.schedule(() -> otpStorage.remove(email), 5, TimeUnit.MINUTES);

        // Send via Email Service
        emailService.sendOtpEmail(email, otp);
    }

    public boolean verifyOtp(String email, String inputOtp) {
        String storedOtp = otpStorage.get(email);
        if (storedOtp != null && storedOtp.equals(inputOtp)) {
            otpStorage.remove(email); // OTP can only be used once
            return true;
        }
        return false;
    }
}
