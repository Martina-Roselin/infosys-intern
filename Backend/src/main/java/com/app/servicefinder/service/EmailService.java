package com.app.servicefinder.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Async
    public void sendBookingConfirmation(String toEmail, String userName, String providerName, String serviceType, String date, String time, Long bookingId) {
        try {
            if (toEmail == null || toEmail.trim().isEmpty()) {
                System.err.println("Error: Recipient email is null or empty");
                return;
            }
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Your ServiceFinder Booking is Confirmed! (ID: " + bookingId + ")");

            String emailBody = "Hi " + userName + ",\n\n"
                    + "Your booking with " + providerName + " is confirmed.\n\n"
                    + "Details:\n"
                    + "Service: " + serviceType + "\n"
                    + "Date: " + date + "\n"
                    + "Time: " + time + "\n\n"
                    + "Thank you for using ServiceFinder!";
            
            message.setText(emailBody);
            message.setFrom(fromEmail); 

            mailSender.send(message);
            System.out.println("Confirmation email sent successfully to: " + toEmail);

        } catch (Exception e) {
            System.err.println("Error sending confirmation email to " + toEmail + ": " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Async
    public void sendBookingRejection(String toEmail, String userName, String providerName, String serviceType, String date, String time, Long bookingId) {
        try {
            if (toEmail == null || toEmail.trim().isEmpty()) {
                System.err.println("Error: Recipient email is null or empty");
                return;
            }
            
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("Booking Update: Request Declined (ID: " + bookingId + ")");

            String emailBody = "Hi " + userName + ",\n\n"
                    + "We are sorry, but " + providerName 
                    + " is unable to accept your booking request for:\n\n"
                    + "Service: " + serviceType + "\n"
                    + "Date: " + date + "\n"
                    + "Time: " + time + "\n\n"
                    + "Please feel free to search for another provider.\n\n"
                    + "Thank you for using ServiceFinder.";
            
            message.setText(emailBody);
            message.setFrom(fromEmail); 

            mailSender.send(message);
            System.out.println("Rejection email sent successfully to: " + toEmail);

        } catch (Exception e) {
            System.err.println("Error sending rejection email to " + toEmail + ": " + e.getMessage());
            e.printStackTrace();
        }
    }
}