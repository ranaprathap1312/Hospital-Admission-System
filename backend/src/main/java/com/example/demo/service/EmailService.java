package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    public void sendOtpEmail(String toEmail, String otp) {
        String subject = "TN GH Admin - Verification Code";
        String text = "Hello,\n\nYour OTP for TN GH Admin Registration is: " + otp + "\n\nThis code will expire in 5 minutes.\n\nThank you.";

        // If mailSender is not configured (missing password), we simulate it.
        if (mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(toEmail);
                message.setSubject(subject);
                message.setText(text);
                message.setFrom("noreply@tngh.com");
                mailSender.send(message);
                System.out.println("Email sent successfully to " + toEmail);
            } catch (Exception e) {
                System.out.println("Failed to send real email (check properties). Simulating instead.");
                System.out.println("----------------------------------------");
                System.out.println("SIMULATED EMAIL TO: " + toEmail);
                System.out.println("SUBJECT: " + subject);
                System.out.println("BODY: " + text);
                System.out.println("----------------------------------------");
            }
        } else {
            System.out.println("----------------------------------------");
            System.out.println("SIMULATED EMAIL TO: " + toEmail);
            System.out.println("SUBJECT: " + subject);
            System.out.println("BODY: " + text);
            System.out.println("----------------------------------------");
        }
    }
}
