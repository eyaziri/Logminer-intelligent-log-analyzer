package com.backend.logMiner.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final String sendMailFrom;

    public EmailService(JavaMailSender mailSender,
                        @Value("${send.mail.from:${SEND_MAIL_FROM}}") String sendMailFrom) {
        this.mailSender = mailSender;
        this.sendMailFrom = sendMailFrom;
    }

    public void sendEmail(String to, String subject, String body) {
        try {
            System.out.printf("📧 Attempting to send email from %s to %s...\n", sendMailFrom, to);
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(sendMailFrom);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);
            System.out.println("✅ Email sent successfully");

        } catch (Exception e) {
            System.err.println("❌ Failed to send email: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
